import { z } from "zod";
import { qrNameSchema } from "./base";

const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

const contactDetailsSchema = z.object({
  phone: z.string().optional(),
  mobile: z.string().optional(),
  work: z.string().optional(),
  fax: z.string().optional(),
});

const companyInfoSchema = z.object({
  company: z.string().optional(),
  role: z.string().optional(),
  website: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid URL" },
    ),
  email: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      },
      { message: "Please enter a valid email address" },
    ),
});

const addressInfoSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
});

export const vcardQRSchema = qrNameSchema
  .merge(personalInfoSchema)
  .merge(contactDetailsSchema)
  .merge(companyInfoSchema)
  .merge(addressInfoSchema);

export type TVcardQRFormData = z.infer<typeof vcardQRSchema>;

