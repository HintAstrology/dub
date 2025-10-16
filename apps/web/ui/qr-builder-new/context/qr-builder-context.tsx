"use client";

import { QRContentStepRef } from "@/ui/qr-builder-new/components/qr-content-step.tsx";
import { linkConstructor } from "@dub/utils";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { EQRType } from "../constants/get-qr-config.ts";
import {
  convertServerQRToNewBuilder,
  TNewQRBuilderData,
  TQrServerData,
} from "../helpers/data-converters";
import {
  IQrBuilderContextType,
  TDestinationData,
  TQRFormData,
  TQrType,
  TStepState,
} from "../types/context";
import {
  DEFAULT_QR_CUSTOMIZATION,
  IQRCustomizationData,
} from "../types/customization";

// Create context
const QrBuilderContext = createContext<IQrBuilderContextType | undefined>(
  undefined,
);

// Provider props
interface QrBuilderProviderProps {
  children: ReactNode;
  initialQrData?: TQrServerData | null;
  isEdit?: boolean;
  homepageDemo?: boolean;
  sessionId?: string;
  onSave?: (builderData: TNewQRBuilderData) => Promise<any>;
}

// Provider component
export function QrBuilderProvider({
  children,
  initialQrData,
  isEdit = false,
  homepageDemo = false,
  sessionId,
  onSave: onSaveProp,
}: QrBuilderProviderProps) {
  const getInitializedProps = useCallback(() => {
    if (initialQrData) {
      const builderData = convertServerQRToNewBuilder(initialQrData);

      return {
        qrTitle: builderData.title || "",
        selectedQrType: builderData.qrType,
        formData: builderData.formData,
        customizationData: builderData.customizationData,
        fileId: builderData.fileId,
      };
    }

    return {
      qrTitle: "",
      selectedQrType: null,
      formData: null,
      customizationData: DEFAULT_QR_CUSTOMIZATION,
      fileId: undefined,
    };
  }, [initialQrData]);

  const initialState = getInitializedProps();

  const [builderStep, setBuilderStep] = useState<TStepState>(1);
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

  // Customization states
  const [customizationData, setCustomizationData] =
    useState<IQRCustomizationData>(initialState.customizationData);
  const [customizationActiveTab, setCustomizationActiveTab] =
    useState<string>("Frame");

  const contentStepRef = useRef<QRContentStepRef>(null);
  const qrBuilderButtonsWrapperRef = useRef<HTMLDivElement>(null);

  const isTypeStep = builderStep === 1;
  const isContentStep = builderStep === 2;
  const isCustomizationStep = builderStep === 3;

  const currentQRType = useMemo(() => {
    return isTypeStep
      ? hoveredQRType !== null
        ? hoveredQRType
        : selectedQrType
      : selectedQrType;
  }, [isTypeStep, hoveredQRType, selectedQrType]);

  const shortLink = useMemo(() => {
    // Use shortLink from initialQrData if available (edit mode)
    if (initialQrData?.link?.shortLink) {
      return initialQrData.link.shortLink;
    }

    // Compute shortLink if we have key and domain (edit mode without precomputed shortLink)
    const key = initialQrData?.link?.key;
    const domain = initialQrData?.link?.domain;

    if (!key || !domain) return undefined;

    return linkConstructor({
      key,
      domain,
      pretty: true,
    });
  }, [initialQrData]);

  const handleNextStep = useCallback(() => {
    // @ts-ignore
    setBuilderStep((prev) => Math.min(prev + 1, 3));
  }, []);

  const handleChangeStep = useCallback(
    (newStep: number) => {
      if (newStep === 2 && !selectedQrType) {
        setTypeSelectionError("Please select a QR code type to continue");
        return;
      }

      setTypeSelectionError("");
      setBuilderStep(newStep as TStepState);
    },
    [selectedQrType],
  );

  const handleSelectQRType = useCallback(
    (type: EQRType) => {
      setSelectedQrType(type);
      handleNextStep();
    },
    [handleNextStep],
  );

  const handleHoverQRType = useCallback((type: EQRType | null) => {
    setHoveredQRType(type);
  }, []);

  const handleFormSubmit = useCallback(
    (data: TQRFormData) => {
      setFormData(data);
      console.log("Form submitted:", data);
      handleNextStep();
    },
    [handleNextStep],
  );

  const handleBack = useCallback(() => {
    const newStep = Math.max((builderStep || 1) - 1, 1);
    handleChangeStep(newStep);
  }, [builderStep, handleChangeStep]);

  // Methods
  const onSave = useCallback(async () => {
    if (!selectedQrType || !formData) {
      toast.error("Please complete all required fields");
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
        formData,
        customizationData,
        title: initialState.qrTitle || `${selectedQrType} QR Code`,
        fileId: (formData as any)?.fileId || initialState.fileId,
      };

      await onSaveProp(builderData);
    } catch (error) {
      console.error("Error saving QR:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [
    selectedQrType,
    formData,
    customizationData,
    initialState.qrTitle,
    initialState.fileId,
    onSaveProp,
  ]);

  const handleContinue = useCallback(async () => {
    if (isCustomizationStep) {
      if (!selectedQrType || !formData) {
        toast.error("Please complete all required fields");
        return;
      }

      await onSave();
      return;
    }

    if (isContentStep && contentStepRef.current) {
      const isValid = await contentStepRef.current.validateForm();
      if (!isValid) {
        return;
      }

      // Save the current form values to formData state before moving to next step
      if (currentFormValues && Object.keys(currentFormValues).length > 0) {
        setFormData(currentFormValues as TQRFormData);
        console.log(
          "Saving form data before moving to customization step:",
          currentFormValues,
        );
      }
    }

    // Move to next step
    handleNextStep();
  }, [
    isContentStep,
    isCustomizationStep,
    selectedQrType,
    formData,
    customizationData,
    onSave,
    handleNextStep,
    currentFormValues,
  ]);

  const updateCurrentFormValues = useCallback((values: Record<string, any>) => {
    setCurrentFormValues(values);
  }, []);

  // Customization methods
  const updateCustomizationData = useCallback((data: IQRCustomizationData) => {
    setCustomizationData(data);
  }, []);

  const contextValue: IQrBuilderContextType = {
    // States
    builderStep,
    destinationData,
    selectedQrType,
    hoveredQRType,
    currentQRType,
    shortLink,
    typeSelectionError,
    formData,
    currentFormValues,
    initialQrData,
    // Processing states
    isProcessing,
    isFileUploading,
    isFileProcessing,

    // Customization states
    customizationData,
    customizationActiveTab,

    // Computed states
    isTypeStep,
    isContentStep,
    isCustomizationStep,
    isEditMode: isEdit,
    homepageDemo,

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
    setIsFileUploading,
    setIsFileProcessing,

    //Buttons
    handleBack,
    handleContinue,

    // Refs
    contentStepRef,
    qrBuilderButtonsWrapperRef,
  };

  return (
    <QrBuilderContext.Provider value={contextValue}>
      {children}
    </QrBuilderContext.Provider>
  );
}

// Custom hook to use the context
export function useQrBuilderContext(): IQrBuilderContextType {
  const context = useContext(QrBuilderContext);

  if (context === undefined) {
    throw new Error("useQrBuilder must be used within a QrBuilderProvider");
  }

  return context;
}
