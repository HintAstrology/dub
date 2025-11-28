import { IQRCustomizationData } from "../types/customization";

// Default values
export const DEFAULT_QR_CUSTOMIZATION: IQRCustomizationData = {
  frame: {
    id: "frame-none",
  },
  style: {
    dotsStyle: "dots-square",
    foregroundColor: "#000000",
    backgroundColor: "#ffffff",
  },
  shape: {
    cornerSquareStyle: "corner-square-square",
    cornerDotStyle: "corner-dot-square",
  },
  logo: {
    type: "none",
  },
};
