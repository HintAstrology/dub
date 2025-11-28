"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { CheckboxWithLabel } from "@/ui/qr-builder-new/components/checkbox-with-label";
import { Select } from "@/ui/qr-builder-new/components/select";
import { TooltipComponent } from "@/ui/qr-builder-new/components/tooltip";
import {
  QR_INPUT_PLACEHOLDERS,
  QR_NAME_PLACEHOLDERS,
} from "@/ui/qr-builder-new/constants/qr-type-inputs-placeholders.ts";
import { WIFI_ENCRYPTION_TYPES } from "@/ui/qr-builder-new/constants/wifi-encryption-types";
import { encodeQRData } from "@/ui/qr-builder-new/helpers/qr-data-handlers.ts";
import { EQRType } from "@/ui/qr-builder-new/types/qr-type.ts";
import {
  TWifiQRFormData,
  wifiQRSchema,
} from "@/ui/qr-builder-new/validation/schemas/wifi.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { Flex, Text } from "@radix-ui/themes";
import { Info, Wifi } from "lucide-react";
import { forwardRef, useImperativeHandle } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  UseFormReturn,
} from "react-hook-form";
import { BaseFormField } from "./base-form-field.tsx";

export interface WiFiFormRef {
  validate: () => Promise<boolean>;
  getValues: () => TWifiQRFormData & { encodedData: string };
  form: UseFormReturn<TWifiQRFormData>;
}

interface WiFiFormProps {
  onSubmit: (data: TWifiQRFormData & { encodedData: string }) => void;
  defaultValues?: Partial<TWifiQRFormData>;
  contentOnly?: boolean;
}

export const WifiForm = forwardRef<WiFiFormRef, WiFiFormProps>(
  ({ onSubmit, defaultValues, contentOnly }, ref) => {
    const openAccordion = "details";

    const formDefaults: Partial<TWifiQRFormData> = {
      qrName: "",
      networkName: "",
      networkPassword: "",
      networkEncryption: "WPA",
      isHiddenNetwork: false,
      ...defaultValues,
    };

    const form = useForm<TWifiQRFormData>({
      resolver: zodResolver(wifiQRSchema),
      defaultValues: formDefaults,
      mode: "all",
    });

    const watchEncryption = form.watch("networkEncryption");
    const showPassword = watchEncryption !== "none";

    useImperativeHandle(ref, () => ({
      validate: async () => {
        const result = await form.trigger();
        if (result) {
          const formData = form.getValues();
          const encodedData = encodeQRData(EQRType.WIFI, formData);
          onSubmit({ ...formData, encodedData });
        }
        return result;
      },
      getValues: () => {
        const formData = form.getValues();
        const encodedData = encodeQRData(EQRType.WIFI, formData);
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
                      <Wifi className="text-primary h-5 w-5" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-foreground text-base font-medium">
                        Wi-Fi
                      </span>
                      <span className="text-muted-foreground text-sm font-normal">
                        Provide your Wi-Fi details and give a memorable name
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
                  name="networkName"
                  label="WiFi Network Name"
                  placeholder={QR_INPUT_PLACEHOLDERS.WIFI_NETWORK_NAME}
                  tooltip="This is the name of the Wi-Fi network you want to share. You can usually find it on the back of your router."
                />

                <div className="flex w-full flex-col gap-2">
                  <Flex gap="1" align="center">
                    <label className="text-neutral text-sm font-medium">
                      Network Security Type
                    </label>
                    <TooltipComponent tooltip="Most routers today use WPA/WPA2. If you're not sure, choose this. You can also check on your router label." />
                  </Flex>

                  <Controller
                    name="networkEncryption"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        options={WIFI_ENCRYPTION_TYPES}
                        value={
                          WIFI_ENCRYPTION_TYPES.find(
                            (option) => option.id === field.value,
                          ) || null
                        }
                        onChange={(option) => field.onChange(option.id)}
                      />
                    )}
                  />
                </div>

                {showPassword && (
                  <BaseFormField
                    name="networkPassword"
                    label="Network Password"
                    type="password"
                    placeholder={QR_INPUT_PLACEHOLDERS.WIFI_PASSWORD}
                    tooltip="People will automatically connect using this password after scanning your QR code."
                    required={showPassword}
                  />
                )}

                {/* Hidden Network Checkbox - using old component */}
                <div className="flex w-full flex-col gap-2">
                  <Controller
                    name="isHiddenNetwork"
                    control={form.control}
                    render={({ field }) => (
                      <CheckboxWithLabel
                        label="WiFi is not visible to others (hidden network)"
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                {/* Info box */}
                {!contentOnly && (
                  <div className="p-3">
                    <div className="bg-secondary-50 border-secondary-200 flex items-start gap-3 rounded-lg border p-3">
                      <Info className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                      <Text size="2" className="text-primary">
                        Not sure where to find this info? Look at the label on
                        your router — it usually lists your WiFi name, password,
                        and security type.
                      </Text>
                    </div>
                  </div>
                )}

                {!contentOnly && (
                  <BaseFormField
                    name="qrName"
                    label="Name your QR Code"
                    placeholder={QR_NAME_PLACEHOLDERS.WIFI}
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
