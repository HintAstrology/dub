"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  QR_FILE_TITLES,
  QR_NAME_PLACEHOLDERS,
} from "@/ui/qr-builder-new/constants/qr-type-inputs-placeholders.ts";
import { useQrBuilderContext } from "@/ui/qr-builder-new/contexts/qr-builder-context.tsx";
import { encodeQRData } from "@/ui/qr-builder-new/helpers/qr-data-handlers.ts";
import { EQRType } from "@/ui/qr-builder-new/types/qr-type.ts";
import {
  pdfQRSchema,
  TPdfQRFormData,
} from "@/ui/qr-builder-new/validation/schemas/file.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { FormProvider, useForm, UseFormReturn } from "react-hook-form";
import { BaseFormField } from "./base-form-field.tsx";
import { FileUploadField } from "./file-upload-field";

export interface PdfFormRef {
  validate: () => Promise<boolean>;
  getValues: () => TPdfQRFormData & { encodedData: string; fileId?: string };
  form: UseFormReturn<TPdfQRFormData>;
}

interface PdfFormProps {
  onSubmit: (
    data: TPdfQRFormData & { encodedData: string; fileId?: string },
  ) => void;
  defaultValues?: Partial<TPdfQRFormData>;
  contentOnly?: boolean;
}

export const PdfForm = forwardRef<PdfFormRef, PdfFormProps>(
  ({ onSubmit, defaultValues, contentOnly }, ref) => {
    const openAccordion = "details";
    const { setIsFileUploading, setIsFileProcessing, initialQrData } =
      useQrBuilderContext();

    // Initialize fileId from defaultValues (saved formData) or initialQrData
    const [fileId, setFileId] = useState<string>(
      (defaultValues as any)?.fileId || initialQrData?.fileId || undefined,
    );

    const formDefaults = {
      qrName: "",
      filesPDF: [],
      ...defaultValues,
    };

    const form = useForm<TPdfQRFormData>({
      resolver: zodResolver(pdfQRSchema),
      defaultValues: formDefaults,
    });

    // Restore fileId from defaultValues when form is re-initialized (e.g., when returning to step 2)
    useEffect(() => {
      if (defaultValues && (defaultValues as any)?.fileId) {
        setFileId((defaultValues as any).fileId);
      }
    }, [defaultValues]);

    // Update hidden fileId field when fileId state changes
    useEffect(() => {
      if (fileId) {
        form.setValue("fileId" as any, fileId);
      }
    }, [fileId, form]);

    useImperativeHandle(ref, () => ({
      validate: async () => {
        const result = await form.trigger();
        if (result) {
          const formData = form.getValues();
          const encodedData = encodeQRData(EQRType.PDF, formData, fileId);
          onSubmit({ ...formData, encodedData, fileId });
        }
        return result;
      },
      getValues: () => {
        const formData = form.getValues();
        const encodedData = encodeQRData(EQRType.PDF, formData, fileId);
        return { ...formData, encodedData, fileId };
      },
      form,
    }));

    return (
      <FormProvider {...form}>
        <form className="w-full">
          <Accordion
            type="single"
            value={openAccordion}
            className="w-full space-y-2"
          >
            <AccordionItem
              value="details"
              className="rounded-[20px] border-none bg-[#fbfbfb] px-4"
            >
              {!contentOnly && (
                <AccordionTrigger className="pointer-events-none hover:no-underline [&>svg]:hidden">
                  <div className="flex w-full items-center gap-3 text-left">
                    <div className="bg-primary/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg">
                      <FileText className="text-primary h-5 w-5" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-foreground text-base font-medium">
                        PDF
                      </span>
                      <span className="text-muted-foreground text-sm font-normal">
                        Upload your PDF document and give a memorable name
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
              )}
              {openAccordion === "details" && !contentOnly && (
                <Separator className="mb-3" />
              )}
              <AccordionContent className="space-y-4 pt-2">
                <FileUploadField
                  title="PDF"
                  name="filesPDF"
                  label={QR_FILE_TITLES.PDF}
                  accept="application/pdf"
                  maxSize={20 * 1024 * 1024}
                  onFileIdReceived={setFileId}
                  onUploadStateChange={setIsFileUploading}
                  onProcessingStateChange={setIsFileProcessing}
                />

                {!contentOnly && (
                  <BaseFormField
                    name="qrName"
                    label="Name your QR Code"
                    placeholder={QR_NAME_PLACEHOLDERS.PDF}
                    tooltip="Only you can see this. It helps you recognize your QR codes later."
                    initFromPlaceholder
                    required={false}
                  />
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </form>
      </FormProvider>
    );
  },
);
