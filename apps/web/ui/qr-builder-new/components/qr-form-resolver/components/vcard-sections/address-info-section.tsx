"use client";

import { QR_INPUT_PLACEHOLDERS } from "@/ui/qr-builder-new/constants/qr-type-inputs-placeholders.ts";
import { BaseFormField } from "../base-form-field.tsx";

export function AddressInfoSection() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseFormField
          name="street"
          label="Street"
          placeholder={QR_INPUT_PLACEHOLDERS.VCARD_STREET}
          required={false}
        />
        <BaseFormField
          name="city"
          label="City"
          placeholder={QR_INPUT_PLACEHOLDERS.VCARD_CITY}
          required={false}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseFormField
          name="state"
          label="State"
          placeholder={QR_INPUT_PLACEHOLDERS.VCARD_STATE}
          required={false}
        />
        <BaseFormField
          name="zip"
          label="ZIP"
          placeholder={QR_INPUT_PLACEHOLDERS.VCARD_ZIP}
          required={false}
        />
      </div>
      <BaseFormField
        name="country"
        label="Country"
        placeholder={QR_INPUT_PLACEHOLDERS.VCARD_COUNTRY}
        required={false}
      />
    </>
  );
}

