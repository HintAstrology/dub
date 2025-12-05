"use client";

import { QR_INPUT_PLACEHOLDERS } from "@/ui/qr-builder-new/constants/qr-type-inputs-placeholders.ts";
import { BaseFormField } from "../base-form-field.tsx";

export function PersonalInfoSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <BaseFormField
        name="firstName"
        label="Name"
        placeholder={QR_INPUT_PLACEHOLDERS.VCARD_FIRST_NAME}
        required
      />
      <BaseFormField
        name="lastName"
        label="Last name"
        placeholder={QR_INPUT_PLACEHOLDERS.VCARD_LAST_NAME}
        required
      />
    </div>
  );
}

