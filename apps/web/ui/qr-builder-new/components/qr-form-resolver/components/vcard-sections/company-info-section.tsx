"use client";

import { QR_INPUT_PLACEHOLDERS } from "@/ui/qr-builder-new/constants/qr-type-inputs-placeholders.ts";
import { BaseFormField } from "../base-form-field.tsx";

export function CompanyInfoSection() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseFormField
          name="company"
          label="Company"
          placeholder={QR_INPUT_PLACEHOLDERS.VCARD_COMPANY}
          required={false}
        />
        <BaseFormField
          name="role"
          label="Role"
          placeholder={QR_INPUT_PLACEHOLDERS.VCARD_ROLE}
          required={false}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseFormField
          name="website"
          label="Website"
          type="url"
          placeholder={QR_INPUT_PLACEHOLDERS.VCARD_WEBSITE}
          required={false}
        />
        <BaseFormField
          name="email"
          label="Email"
          placeholder={QR_INPUT_PLACEHOLDERS.VCARD_EMAIL}
          required={false}
        />
      </div>
    </>
  );
}

