import { useUser } from "@/ui/contexts/user";
import { QRContentStepRef } from "@/ui/qr-builder-new/components/qr-content-step.tsx";
import { useMediaQuery } from "@dub/ui";
import { trackClientEvents } from "core/integration/analytic";
import { EAnalyticEvents } from "core/integration/analytic/interfaces/analytic.interface.ts";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { QrBuilderContext } from "../contexts";
import { getInitializedProps } from "../helpers/get-initialized-props";
import { useInitializeQrData } from "../hooks/use-initialize-qr-data";
import {
  IQrBuilderContextType,
  TDestinationData,
  TQRFormData,
  TQrType,
  TStepState,
} from "../types/context";
import { IQRCustomizationData } from "../types/customization";
import { TNewQRBuilderData } from "../types/qr-builder-data";
import { TQrServerData } from "../types/qr-server-data";
import { EQRType } from "../types/qr-type";

// Provider props
interface QrBuilderProviderProps {
  children: ReactNode;
  initialQrData?: TQrServerData | null;
  homepageDemo?: boolean;
  sessionId?: string;
  onSave?: (builderData: TNewQRBuilderData) => Promise<any>;
  typeToScrollTo?: EQRType | null;
  handleResetTypeToScrollTo?: () => void;
  initialStep?: TStepState;
  onStepChange?: (step: TStepState) => void;
}

// Provider component
export const QrBuilderProvider = ({
  children,
  initialQrData,
  homepageDemo = false,
  sessionId,
  onSave: onSaveProp,
  typeToScrollTo,
  handleResetTypeToScrollTo,
  initialStep,
  onStepChange,
}: QrBuilderProviderProps) => {
  const user = useUser();
  const { isMobile } = useMediaQuery();
  const isEdit = !!initialQrData;

  const initialState = getInitializedProps(initialQrData);

  const [builderStep, setBuilderStep] = useState<TStepState>(initialStep || 1);
  const [destinationData, setDestinationData] =
    useState<TDestinationData>(null);
  const [selectedQrType, setSelectedQrType] = useState<TQrType>(
    initialState.selectedQrType,
  );
  const [hoveredQRType, setHoveredQRType] = useState<EQRType | null>(null);
  const [typeSelectionError, setTypeSelectionError] = useState<string>("");
  const [formData, setFormData] = useState<TQRFormData | null>(
    initialState.formData,
  );
  const [currentFormValues, setCurrentFormValues] = useState<
    Record<string, any>
  >(() => {
    const initialValues: Record<string, any> = {};

    if (initialState.qrTitle) {
      initialValues.qrName = initialState.qrTitle;
    }

    if (initialState.formData) {
      Object.assign(initialValues, initialState.formData);
    }

    return initialValues;
  });

  // Processing states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isFileUploading, setIsFileUploading] = useState<boolean>(false);
  const [isFileProcessing, setIsFileProcessing] = useState<boolean>(false);

  // Form validation state
  const [isFormValid, setIsFormValid] = useState<boolean>(true);

  // Customization states
  const [customizationData, setCustomizationData] =
    useState<IQRCustomizationData>(initialState.customizationData);
  const [customizationActiveTab, setCustomizationActiveTab] =
    useState<string>("Frame");

  // Dialog state for mobile homepage demo
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const contentStepRef = useRef<QRContentStepRef>(null);
  const qrBuilderButtonsWrapperRef = useRef<HTMLDivElement>(null);
  const qrBuilderContentWrapperRef = useRef<HTMLDivElement>(null);

  const previousQrTypeRef = useRef<TQrType>(selectedQrType);

  // Unified initialization method for edit mode using hook
  const handleInitialized = useCallback(
    (params: {
      qrType: EQRType;
      formData: TQRFormData;
      customizationData: IQRCustomizationData;
      currentFormValues: Record<string, any>;
    }) => {
      setSelectedQrType(params.qrType);
      setFormData(params.formData);
      setCustomizationData(params.customizationData);
      setCurrentFormValues(params.currentFormValues);
    },
    [],
  );

  const { isInitializing, initialize, hasInitializedRef } = useInitializeQrData(
    {
      initialQrData,
      onInitialized: handleInitialized,
    },
  );

  const isTypeStep = builderStep === 1;
  const isContentStep = builderStep === 2;
  const isCustomizationStep = builderStep === 3;

  // Mobile scroll handler
  const handleScroll = useCallback(() => {
    if (isMobile && qrBuilderContentWrapperRef.current) {
      qrBuilderContentWrapperRef.current.style.scrollMargin = "60px";
      qrBuilderContentWrapperRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [isMobile]);

  const currentQRType = useMemo(() => {
    return isTypeStep
      ? hoveredQRType !== null
        ? hoveredQRType
        : selectedQrType
      : selectedQrType;
  }, [isTypeStep, hoveredQRType, selectedQrType]);

  const handleNextStep = useCallback(() => {
    // Store scroll position and QR builder position relative to viewport before step change
    const scrollPosition = window.scrollY;
    const qrBuilderElement = qrBuilderContentWrapperRef.current;
    const qrBuilderViewportTop = qrBuilderElement
      ? qrBuilderElement.getBoundingClientRect().top
      : null;

    // @ts-ignore
    setBuilderStep((prev) => Math.min(prev + 1, 3));

    // Restore QR builder position after DOM updates and animations
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (qrBuilderViewportTop !== null && qrBuilderElement) {
          const newViewportTop = qrBuilderElement.getBoundingClientRect().top;
          const offset = newViewportTop - qrBuilderViewportTop;
          window.scrollTo(0, scrollPosition + offset);
        } else {
          window.scrollTo(0, scrollPosition);
        }
      });
    });
  }, []);

  const handleChangeStep = useCallback(
    async (newStep: number) => {
      if (newStep === 2 && !selectedQrType) {
        setTypeSelectionError("Please select a QR code type to continue");
        return;
      }

      // Validate form before moving forward from step 2
      if (builderStep === 2 && newStep > 2 && contentStepRef.current) {
        const isValid = await contentStepRef.current.validateForm();
        
        if (!isValid) {
          // toast.error("Please fill in all required fields correctly");
          return;
        }

        // Save form data before moving to next step
        const formValues = contentStepRef.current.getValues();
        setFormData(formValues as any);
      }

      // Prevent going to step 3 if step 2 is not completed with valid data
      if (newStep === 3) {
        if (!formData && builderStep !== 2) {
          // toast.error("Please complete the required fields in step 2 first");
          return;
        }
        if (!isFormValid && builderStep !== 2) {
          // toast.error("Please fix the errors in step 2 before continuing");
          return;
        }
      }

      // Store scroll position and QR builder position relative to viewport before step change
      const scrollPosition = window.scrollY;
      const qrBuilderElement = qrBuilderContentWrapperRef.current;
      const qrBuilderViewportTop = qrBuilderElement
        ? qrBuilderElement.getBoundingClientRect().top
        : null;

      setTypeSelectionError("");
      setBuilderStep(newStep as TStepState);

      // Restore QR builder position after DOM updates and animations
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (qrBuilderViewportTop !== null && qrBuilderElement) {
            const newViewportTop = qrBuilderElement.getBoundingClientRect().top;
            const offset = newViewportTop - qrBuilderViewportTop;
            window.scrollTo(0, scrollPosition + offset);
          } else {
            window.scrollTo(0, scrollPosition);
          }
        });
      });

      // Reset form validity appropriately
      if (newStep !== 2) {
        setIsFormValid(true);
      } else if (newStep === 2 && formData) {
        // When navigating back to step 2, if formData exists, form was previously valid
        setIsFormValid(true);
      }

      // Track step navigation via stepper
      trackClientEvents({
        event: EAnalyticEvents.PAGE_CLICKED,
        params: {
          page_name: homepageDemo ? "landing" : "dashboard",
          content_group: "step_navigation",
          content_value: `step_${newStep}`,
          email: user?.email,
          event_category: homepageDemo ? "nonAuthorized" : "Authorized",
        },
        sessionId: sessionId || user?.id,
      });
    },
    [selectedQrType, formData, isFormValid, homepageDemo, user, sessionId, builderStep],
  );

  const handleSelectQRType = useCallback(
    (type: EQRType) => {
      setSelectedQrType(type);
      handleNextStep();

      // Track QR type selection
      trackClientEvents({
        event: EAnalyticEvents.PAGE_CLICKED,
        params: {
          page_name: homepageDemo ? "landing" : "dashboard",
          content_group: "choose_type",
          content_value: type,
          email: user?.email,
          event_category: homepageDemo ? "nonAuthorized" : "Authorized",
        },
        sessionId: sessionId || user?.id,
      });

      // Scroll on mobile
      handleScroll();
    },
    [handleNextStep, homepageDemo, user, sessionId, handleScroll],
  );

  const handleHoverQRType = useCallback((type: EQRType | null) => {
    setHoveredQRType(type);
  }, []);

  const handleFormSubmit = useCallback(
    (data: TQRFormData) => {
      setFormData(data);
    },
    [handleNextStep],
  );

  const handleBack = useCallback(() => {
    const newStep = Math.max((builderStep || 1) - 1, 1);

    // Track back button click
    trackClientEvents({
      event: EAnalyticEvents.PAGE_CLICKED,
      params: {
        page_name: homepageDemo ? "landing" : "dashboard",
        content_group: "navigation",
        content_value: "back",
        email: user?.email,
        event_category: homepageDemo ? "nonAuthorized" : "Authorized",
      },
      sessionId: sessionId || user?.id,
    });

    handleChangeStep(newStep);

    // Scroll on mobile - Commented out to prevent scroll on step change
    // handleScroll();
  }, [builderStep, handleChangeStep, homepageDemo, user, sessionId]);

  // Methods
  const onSave = useCallback(
    async (providedFormData?: TQRFormData) => {
      const dataToSave = providedFormData || formData;

      if (!selectedQrType || !dataToSave) {
        // toast.error("Please complete all required fields");
        return;
      }

      if (!onSaveProp) {
        console.error("onSave prop not provided to QrBuilderProvider");
        toast.error("Save functionality not configured");
        return;
      }

      setIsProcessing(true);

      try {
        const builderData: TNewQRBuilderData = {
          qrType: selectedQrType,
          formData: dataToSave,
          customizationData,
          title: dataToSave?.qrName || `${selectedQrType} QR Code`,
          fileId: (dataToSave as any)?.fileId || initialState.fileId,
        };

        await onSaveProp(builderData);
      } catch (error) {
        console.error("Error saving QR:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [
      selectedQrType,
      formData,
      customizationData,
      initialState.qrTitle,
      initialState.fileId,
      onSaveProp,
    ],
  );

  const handleContinue = useCallback(async () => {
    if (isCustomizationStep) {
      if (!selectedQrType || !formData) {
        // toast.error("Please complete all required fields");
        return;
      }

      trackClientEvents({
        event: EAnalyticEvents.PAGE_CLICKED,
        params: {
          page_name: homepageDemo ? "landing" : "dashboard",
          content_group: "customize_qr",
          content_value: homepageDemo ? "download" : isEdit ? "save" : "create",
          email: user?.email,
          event_category: homepageDemo ? "nonAuthorized" : "Authorized",
        },
        sessionId: sessionId || user?.id,
      });

      await onSave();
      return;
    }

    if (isContentStep && contentStepRef.current) {
      const isValid = await contentStepRef.current.validateForm();

      if (!isValid) {
        // toast.error("Please fill in all required fields correctly");
        return;
      }

      trackClientEvents({
        event: EAnalyticEvents.PAGE_CLICKED,
        params: {
          page_name: homepageDemo ? "landing" : "dashboard",
          content_group: "complete_content",
          content_value: "continue",
          email: user?.email,
          event_category: homepageDemo ? "nonAuthorized" : "Authorized",
        },
        sessionId: sessionId || user?.id,
      });

      const formValues = contentStepRef.current.getValues();
      setFormData(formValues as any);
      console.log(
        "Saving form data before moving to customization step:",
        formValues,
      );
    }

    handleNextStep();

    // Scroll on mobile - Commented out to prevent scroll on step change
    // handleScroll();
  }, [
    isContentStep,
    isCustomizationStep,
    selectedQrType,
    formData,
    customizationData,
    onSave,
    handleNextStep,
    currentFormValues,
    homepageDemo,
    isEdit,
    user,
    sessionId,
    handleScroll,
  ]);

  const updateCurrentFormValues = useCallback((values: Record<string, any>) => {
    setCurrentFormValues(values);
  }, []);

  // Customization methods
  const updateCustomizationData = useCallback((data: IQRCustomizationData) => {
    setCustomizationData(data);
  }, []);

  // Initialize from initialQrData on mount or when it changes (edit mode)
  useEffect(() => {
    if (initialQrData) {
      const qrId = initialQrData.id;
      // Only initialize if we haven't initialized for this QR ID yet
      if (hasInitializedRef.current !== qrId) {
        initialize();
      }
    } else {
      // Reset initialization ref when not in edit mode
      hasInitializedRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQrData, initialize]);

  // Notify parent component when step changes
  useEffect(() => {
    onStepChange?.(builderStep);
  }, [builderStep, onStepChange]);

  // Handle typeToScrollTo from landing page buttons
  useEffect(() => {
    if (typeToScrollTo && homepageDemo) {
      // Set the QR type first
      setSelectedQrType(typeToScrollTo);
      // Clear any type selection errors
      setTypeSelectionError("");
      // Set step directly to 2, bypassing validation since we're setting the type
      setBuilderStep(2);
      handleResetTypeToScrollTo?.();

      // Track QR type selection
      trackClientEvents({
        event: EAnalyticEvents.PAGE_CLICKED,
        params: {
          page_name: homepageDemo ? "landing" : "dashboard",
          content_group: "choose_type",
          content_value: typeToScrollTo,
          email: user?.email,
          event_category: homepageDemo ? "nonAuthorized" : "Authorized",
        },
        sessionId: sessionId || user?.id,
      });

      // Scroll on mobile
      handleScroll();
    }
  }, [
    typeToScrollTo,
    homepageDemo,
    handleResetTypeToScrollTo,
    handleScroll,
    user,
    sessionId,
  ]);

  // Open dialog when on steps 2 or 3 in mobile homepage demo
  useEffect(() => {
    if (isMobile && homepageDemo && !isTypeStep) {
      setIsDialogOpen(true);
    }
  }, [isMobile, homepageDemo, isTypeStep]);

  // Reset form data when QR type changes (but not on initial load)
  useEffect(() => {
    const previousType = previousQrTypeRef.current;

    // If type actually changed (and it's not null to null)
    if (
      previousType !== selectedQrType &&
      previousType !== null &&
      selectedQrType !== null
    ) {
      // Clear form data when switching between different QR types
      // But preserve qrName if it exists
      const qrNameToPreserve = currentFormValues.qrName;

      setFormData(null);
      setCurrentFormValues(
        qrNameToPreserve ? { qrName: qrNameToPreserve } : {},
      );
      setIsFormValid(false);
    }

    // Update ref for next comparison
    previousQrTypeRef.current = selectedQrType;
  }, [selectedQrType, currentFormValues.qrName]);

  const contextValue: IQrBuilderContextType = {
    // States
    builderStep,
    destinationData,
    selectedQrType,
    hoveredQRType,
    currentQRType,
    typeSelectionError,
    formData,
    currentFormValues,
    initialQrData,
    // Processing states
    isProcessing,
    isFileUploading,
    isFileProcessing,
    isInitializing,

    // Form validation state
    isFormValid,

    // Customization states
    customizationData,
    customizationActiveTab,

    // Computed states
    isTypeStep,
    isContentStep,
    isCustomizationStep,
    isEditMode: isEdit,
    homepageDemo,

    // Dialog state
    isDialogOpen,
    setIsDialogOpen,

    // Methods
    onSave,
    handleNextStep,
    handleChangeStep,
    handleSelectQRType,
    handleHoverQRType,
    handleFormSubmit,
    updateCurrentFormValues,

    // Customization methods
    updateCustomizationData,
    setCustomizationActiveTab,

    // State setters
    setBuilderStep,
    setDestinationData,
    setSelectedQrType,
    setFormData,
    setIsFileUploading,
    setIsFileProcessing,
    setIsFormValid,

    //Buttons
    handleBack,
    handleContinue,

    // Refs
    contentStepRef,
    qrBuilderButtonsWrapperRef,
    qrBuilderContentWrapperRef,

    // Navigation state
    isGoingBack: false,
  };

  return (
    <QrBuilderContext.Provider value={contextValue}>
      {children}
    </QrBuilderContext.Provider>
  );
};
