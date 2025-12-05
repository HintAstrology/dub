"use client";

import { Accordion } from "@/components/ui/accordion";
import { QR_NAME_PLACEHOLDERS } from "@/ui/qr-builder-new/constants/qr-type-inputs-placeholders.ts";
import { encodeQRData } from "@/ui/qr-builder-new/helpers/qr-data-handlers.ts";
import { EQRType } from "@/ui/qr-builder-new/types/qr-type.ts";
import {
  TVcardQRFormData,
  vcardQRSchema,
} from "@/ui/qr-builder-new/validation/schemas/vcard.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  LucideIcon,
  MapPinHouse,
  Phone,
  UserRoundPen,
} from "lucide-react";
import { ComponentType, forwardRef, useImperativeHandle, useState } from "react";
import { FormProvider, useForm, UseFormReturn } from "react-hook-form";
import { BaseFormField } from "./base-form-field.tsx";
import { VcardFormSection } from "./vcard-form-section.tsx";
import {
  AddressInfoSection,
  CompanyInfoSection,
  ContactDetailsSection,
  PersonalInfoSection,
} from "./vcard-sections/index.ts";

interface VcardSectionConfig {
  value: string;
  icon: LucideIcon;
  title: string;
  Section: ComponentType;
  contentClassName?: string;
}

const VCARD_SECTIONS: VcardSectionConfig[] = [
  {
    value: "personal-info",
    icon: UserRoundPen,
    title: "Personal information",
    Section: PersonalInfoSection,
    contentClassName: "pt-2",
  },
  {
    value: "contact-details",
    icon: Phone,
    title: "Contact details",
    Section: ContactDetailsSection,
  },
  {
    value: "company-info",
    icon: Building2,
    title: "Company information",
    Section: CompanyInfoSection,
  },
  {
    value: "address-info",
    icon: MapPinHouse,
    title: "Address information",
    Section: AddressInfoSection,
  },
];

export interface VcardFormRef {
  validate: () => Promise<boolean>;
  getValues: () => TVcardQRFormData & { encodedData: string };
  form: UseFormReturn<TVcardQRFormData>;
}

interface VcardFormProps {
  onSubmit: (data: TVcardQRFormData & { encodedData: string }) => void;
  defaultValues?: Partial<TVcardQRFormData>;
  contentOnly?: boolean;
}

const FORM_DEFAULTS: Partial<TVcardQRFormData> = {
  qrName: "",
  firstName: "",
  lastName: "",
  phone: "",
  mobile: "",
  work: "",
  fax: "",
  company: "",
  role: "",
  website: "",
  email: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "",
};

export const VcardForm = forwardRef<VcardFormRef, VcardFormProps>(
  ({ onSubmit, defaultValues, contentOnly }, ref) => {
    const [openAccordion, setOpenAccordion] = useState<string | undefined>(
      "personal-info",
    );

    const form = useForm<TVcardQRFormData>({
      resolver: zodResolver(vcardQRSchema),
      defaultValues: { ...FORM_DEFAULTS, ...defaultValues },
      mode: "all",
    });

    useImperativeHandle(ref, () => ({
      validate: async () => {
        const result = await form.trigger();
        if (result) {
          const formData = form.getValues();
          const encodedData = encodeQRData(EQRType.VCARD, formData);
          onSubmit({ ...formData, encodedData });
        }
        return result;
      },
      getValues: () => {
        const formData = form.getValues();
        const encodedData = encodeQRData(EQRType.VCARD, formData);
        return { ...formData, encodedData };
      },
      form,
    }));

    return (
      <FormProvider {...form}>
        <form className="w-full h-full">
          <Accordion
            type="single"
            collapsible
            value={openAccordion}
            onValueChange={setOpenAccordion}
            className="w-full space-y-2"
          >
            {VCARD_SECTIONS.map(
              ({ value, icon, title, Section, contentClassName }) => (
                <VcardFormSection
                  key={value}
                  value={value}
                  icon={icon}
                  title={title}
                  isOpen={openAccordion === value}
                  contentClassName={contentClassName}
                >
                  <Section />
                </VcardFormSection>
              ),
            )}
          </Accordion>

          {!contentOnly && (
            <div className="mt-4 rounded-[20px] bg-[#fbfbfb] px-4 py-4">
              <BaseFormField
                name="qrName"
                label="Name your QR Code"
                placeholder={QR_NAME_PLACEHOLDERS.VCARD}
                tooltip="Only you can see this. It helps you recognize your QR codes later."
                initFromPlaceholder
                required={false}
              />
            </div>
          )}
        </form>
      </FormProvider>
    );
  },
);
