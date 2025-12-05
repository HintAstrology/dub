"use client";

import { QR_INPUT_PLACEHOLDERS } from "@/ui/qr-builder-new/constants/qr-type-inputs-placeholders.ts";
import { BaseFormField } from "../base-form-field.tsx";

export function ContactDetailsSection() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseFormField
          name="phone"
          label="Phone"
          type="tel"
          placeholder={QR_INPUT_PLACEHOLDERS.VCARD_PHONE}
          required={false}
        />
        <BaseFormField
          name="mobile"
          label="Mobile"
          type="tel"
          placeholder={QR_INPUT_PLACEHOLDERS.VCARD_MOBILE}
          required={false}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseFormField
          name="work"
          label="Work"
          type="tel"
          placeholder={QR_INPUT_PLACEHOLDERS.VCARD_WORK}
          required={false}
        />
        <BaseFormField
          name="fax"
          label="Fax"
          type="tel"
          placeholder={QR_INPUT_PLACEHOLDERS.VCARD_FAX}
          required={false}
        />
      </div>
    </>
  );
}

