"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image as ImageIcon } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { FormProvider, useForm, UseFormReturn } from "react-hook-form";
import { EQRType } from "../../constants/get-qr-config";
import {
  QR_FILE_TITLES,
  QR_NAME_PLACEHOLDERS,
} from "../../constants/qr-type-inputs-placeholders";
import { useQrBuilderContext } from "../../context";
import { encodeQRData } from "../../helpers/qr-data-handlers.ts";
import { imageQRSchema, TImageQRFormData } from "../../validation/schemas";
import { BaseFormField } from "./base-form-field.tsx";
import { FileUploadField } from "./file-upload-field";

export interface ImageFormRef {
  validate: () => Promise<boolean>;
  getValues: () => TImageQRFormData & { encodedData: string; fileId?: string };
  form: UseFormReturn<TImageQRFormData>;
}

interface ImageFormProps {
  onSubmit: (
    data: TImageQRFormData & { encodedData: string; fileId?: string },
  ) => void;
  defaultValues?: Partial<TImageQRFormData>;
  contentOnly?: boolean;
}

export const ImageForm = forwardRef<ImageFormRef, ImageFormProps>(
  ({ onSubmit, defaultValues, contentOnly }, ref) => {
    const { setIsFileUploading, setIsFileProcessing, initialQrData } =
      useQrBuilderContext();

    const [fileId, setFileId] = useState<string>(initialQrData?.fileId!);
    const openAccordion = "details";

    const formDefaults = {
      qrName: "",
      filesImage: [],
      ...defaultValues,
    };

    const form = useForm<TImageQRFormData>({
      resolver: zodResolver(imageQRSchema),
      defaultValues: formDefaults,
    });

    // Update hidden fileId field when fileId state changes
    useEffect(() => {
      if (fileId) {
        form.setValue("fileId" as any, fileId);
      }
    }, [fileId]);

    useImperativeHandle(ref, () => ({
      validate: async () => {
        const result = await form.trigger();
        if (result) {
          const formData = form.getValues();
          const encodedData = encodeQRData(EQRType.IMAGE, formData, fileId);
          onSubmit({ ...formData, encodedData, fileId });
        }
        return result;
      },
      getValues: () => {
        const formData = form.getValues();
        const encodedData = encodeQRData(EQRType.IMAGE, formData, fileId);
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
                      <ImageIcon className="text-primary h-5 w-5" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-foreground text-base font-medium">
                        Image
                      </span>
                      <span className="text-muted-foreground text-sm font-normal">
                        Upload your image file and give a memorable name
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
                  title="Image"
                  name="filesImage"
                  label={QR_FILE_TITLES.IMAGE}
                  accept="image/*"
                  maxSize={5 * 1024 * 1024}
                  onFileIdReceived={setFileId}
                  onUploadStateChange={setIsFileUploading}
                  onProcessingStateChange={setIsFileProcessing}
                />

                {!contentOnly && (
                  <BaseFormField
                    name="qrName"
                    label="Name your QR Code"
                    placeholder={QR_NAME_PLACEHOLDERS.IMAGE}
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
