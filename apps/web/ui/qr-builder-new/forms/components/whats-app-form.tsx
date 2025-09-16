"use client";

import { useForm, FormProvider, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { whatsappQRSchema, WhatsappQRFormData } from "../../validation/schemas";
import { BaseFormField } from "./base-form-field.tsx";
import { forwardRef, useImperativeHandle, useEffect } from "react";
import { QR_NAME_PLACEHOLDERS, QR_INPUT_PLACEHOLDERS } from "../../constants/qr-type-inputs-placeholders";
import { EQRType } from "../../constants/get-qr-config";
import { useQRFormData } from "../../hooks/use-qr-form-data";

export interface WhatsAppFormRef {
  validate: () => Promise<boolean>;
  getValues: () => WhatsappQRFormData & { encodedData: string };
  form: UseFormReturn<WhatsappQRFormData>;
}

interface WhatsAppFormProps {
  onSubmit: (data: WhatsappQRFormData & { encodedData: string }) => void;
  defaultValues?: Partial<WhatsappQRFormData>;
  initialData?: {
    qrType: EQRType;
    data: string;
    link?: { url: string; title?: string };
  };
}

export const WhatsAppForm = forwardRef<WhatsAppFormRef, WhatsAppFormProps>(
  ({ onSubmit, defaultValues, initialData }, ref) => {
    const { getDefaultValues, encodeFormData } = useQRFormData({
      qrType: EQRType.WHATSAPP,
      initialData,
    });

    const formDefaults = getDefaultValues({
      qrName: QR_NAME_PLACEHOLDERS.WHATSAPP,
      number: "",
      message: QR_INPUT_PLACEHOLDERS.WHATSAPP_MESSAGE,
      ...defaultValues,
    });

    const form = useForm<WhatsappQRFormData>({
      resolver: zodResolver(whatsappQRSchema),
      defaultValues: formDefaults,
    });

    // Reset form when initialData changes
    useEffect(() => {
      if (initialData) {
        const newDefaults = getDefaultValues(defaultValues);
        form.reset(newDefaults);
      }
    }, [initialData, getDefaultValues, defaultValues, form]);

    useImperativeHandle(ref, () => ({
      validate: async () => {
        const result = await form.trigger();
        if (result) {
          const formData = form.getValues();
          const encodedData = encodeFormData(formData);
          onSubmit({ ...formData, encodedData });
        }
        return result;
      },
      getValues: () => {
        const formData = form.getValues();
        const encodedData = encodeFormData(formData);
        return { ...formData, encodedData };
      },
      form,
    }));

    return (
      <FormProvider {...form}>
        <div className="border-border-100 flex h-fit w-full flex-col items-center justify-center gap-6 rounded-lg border p-3 md:max-w-[524px] md:px-6 md:py-4">
          <form className="flex w-full flex-col gap-4">
            <BaseFormField
              name="qrName"
              label="Name your QR Code"
              placeholder={QR_NAME_PLACEHOLDERS.WHATSAPP}
              tooltip="Only you can see this. It helps you recognize your QR codes later."
            />
            
            <BaseFormField
              name="number"
              label="WhatsApp Number"
              type="tel"
              placeholder={QR_INPUT_PLACEHOLDERS.WHATSAPP_NUMBER}
              tooltip="This is the number people will message on WhatsApp after scanning your QR code."
            />
            
            <BaseFormField
              name="message"
              label="Pre-typed Message"
              type="textarea"
              placeholder={QR_INPUT_PLACEHOLDERS.WHATSAPP_MESSAGE}
              maxLength={160}
              tooltip="This text will appear in the chat box — the user just needs to tap send."
              required={false}
            />
          </form>
        </div>
      </FormProvider>
    );
  }
);