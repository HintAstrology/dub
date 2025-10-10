"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useImperativeHandle } from "react";
import { FormProvider, useForm, UseFormReturn } from "react-hook-form";
import { EQRType } from "../../constants/get-qr-config";
import {
  QR_INPUT_PLACEHOLDERS,
  QR_NAME_PLACEHOLDERS,
} from "../../constants/qr-type-inputs-placeholders";
import { useQRFormData } from "../../hooks/use-qr-form-data";
import { WhatsappQRFormData, whatsappQRSchema } from "../../validation/schemas";
import { BaseFormField } from "./base-form-field.tsx";

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
      qrName: "",
      number: "",
      message: "",
      ...defaultValues,
    });

    const form = useForm<WhatsappQRFormData>({
      resolver: zodResolver(whatsappQRSchema),
      defaultValues: formDefaults,
    });

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
        <form className="flex w-full flex-col gap-4">
          <BaseFormField
            name="qrName"
            label="Name your QR Code"
            placeholder={QR_NAME_PLACEHOLDERS.WHATSAPP}
            tooltip="Only you can see this. It helps you recognize your QR codes later."
            initFromPlaceholder
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
      </FormProvider>
    );
  },
);
