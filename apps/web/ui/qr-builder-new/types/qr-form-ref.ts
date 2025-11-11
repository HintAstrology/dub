import { UseFormReturn } from "react-hook-form";
import { TQRFormData } from "./context";

export interface QRFormRef {
  validate: () => Promise<boolean>;
  getValues: () => TQRFormData;
  form: UseFormReturn<any>;
}
