"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  QR_INPUT_PLACEHOLDERS,
  QR_NAME_PLACEHOLDERS,
} from "@/ui/qr-builder-new/constants/qr-type-inputs-placeholders.ts";
import { encodeQRData } from "@/ui/qr-builder-new/helpers/qr-data-handlers.ts";
import { EQRType } from "@/ui/qr-builder-new/types/qr-type.ts";
import {
  TWhatsappQRFormData,
  whatsappQRSchema,
} from "@/ui/qr-builder-new/validation/schemas/whatsapp.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageCircle } from "lucide-react";
import { forwardRef, useImperativeHandle } from "react";
import { FormProvider, useForm, UseFormReturn } from "react-hook-form";
import { BaseFormField } from "./base-form-field.tsx";

export interface WhatsAppFormRef {
  validate: () => Promise<boolean>;
  getValues: () => TWhatsappQRFormData & { encodedData: string };
  form: UseFormReturn<TWhatsappQRFormData>;
}

interface WhatsAppFormProps {
  onSubmit: (data: TWhatsappQRFormData & { encodedData: string }) => void;
  defaultValues?: Partial<TWhatsappQRFormData>;
  contentOnly?: boolean;
}

export const WhatsAppForm = forwardRef<WhatsAppFormRef, WhatsAppFormProps>(
  ({ onSubmit, defaultValues, contentOnly }, ref) => {
    const openAccordion = "details";

    const formDefaults = {
      qrName: "",
      number: "",
      message: "",
      ...defaultValues,
    };

    const form = useForm<TWhatsappQRFormData>({
      resolver: zodResolver(whatsappQRSchema),
      defaultValues: formDefaults,
    });

    useImperativeHandle(ref, () => ({
      validate: async () => {
        const result = await form.trigger();
        if (result) {
          const formData = form.getValues();
          const encodedData = encodeQRData(EQRType.WEBSITE, formData);
          onSubmit({ ...formData, encodedData });
        }
        return result;
      },
      getValues: () => {
        const formData = form.getValues();
        const encodedData = encodeQRData(EQRType.WEBSITE, formData);
        return { ...formData, encodedData };
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
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/80 p-3 transition-all hover:bg-white hover:shadow-md">
                      <MessageCircle className="text-primary h-5 w-5" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-foreground text-base font-medium">
                        WhatsApp
                      </span>
                      <span className="text-muted-foreground text-sm font-normal">
                        Provide your WhatsApp details and give a memorable name
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
              )}
              {openAccordion === "details" && !contentOnly && (
                <Separator className="mb-3" />
              )}
              <AccordionContent className="space-y-4 pt-2">
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

                {!contentOnly && (
                  <BaseFormField
                    name="qrName"
                    label="Name your QR Code"
                    placeholder={QR_NAME_PLACEHOLDERS.WHATSAPP}
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
