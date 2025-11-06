"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe } from "lucide-react";
import { forwardRef, useImperativeHandle } from "react";
import { FormProvider, useForm, UseFormReturn } from "react-hook-form";
import { EQRType } from "../../constants/get-qr-config";
import {
  QR_INPUT_PLACEHOLDERS,
  QR_NAME_PLACEHOLDERS,
} from "../../constants/qr-type-inputs-placeholders";
import { encodeQRData } from "../../helpers/qr-data-handlers.ts";
import { TWebsiteQRFormData, websiteQRSchema } from "../../validation/schemas";
import { BaseFormField } from "./base-form-field.tsx";

export interface WebsiteFormRef {
  validate: () => Promise<boolean>;
  getValues: () => TWebsiteQRFormData & { encodedData: string };
  form: UseFormReturn<TWebsiteQRFormData>;
}

interface WebsiteFormProps {
  onSubmit: (data: TWebsiteQRFormData & { encodedData: string }) => void;
  defaultValues?: Partial<TWebsiteQRFormData>;
  contentOnly?: boolean;
}

export const WebsiteForm = forwardRef<WebsiteFormRef, WebsiteFormProps>(
  ({ onSubmit, defaultValues, contentOnly }, ref) => {
    const openAccordion = "details";

    const formDefaults = {
      qrName: "My QR Code",
      websiteLink: "",
      ...defaultValues,
    };

    const form = useForm<TWebsiteQRFormData>({
      resolver: zodResolver(websiteQRSchema),
      defaultValues: formDefaults,
      mode: "all",
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
                    <div className="bg-primary/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg">
                      <Globe className="text-primary h-5 w-5" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-foreground text-base font-medium">
                        Website
                      </span>
                      <span className="text-muted-foreground text-sm font-normal">
                        Enter the website URL for your QR code and give a
                        memorable name
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
              )}
              {openAccordion === "details" && !contentOnly && (
                <Separator className="mb-3" />
              )}
              <AccordionContent className="pt-2">
                <BaseFormField
                  name="websiteLink"
                  label="Enter your website"
                  type="url"
                  placeholder={QR_INPUT_PLACEHOLDERS.WEBSITE_URL}
                  tooltip="This is the link people will open when they scan your QR code."
                />

                {!contentOnly && (
                  <BaseFormField
                    name="qrName"
                    label="Name your QR Code"
                    placeholder={QR_NAME_PLACEHOLDERS.WEBSITE}
                    tooltip="Only you can see this. It helps you recognize your QR codes later."
                    initFromPlaceholder
                    className="w-full"
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
