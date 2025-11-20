// Note: This data structure is NOT tied to qr-code-styling format
// It will be transformed/converted separately when rendering

export interface IQRCustomizationData {
  // Frame settings
  frame: IFrameData;

  // QR Style settings
  style: IStyleData;

  // QR Shape settings
  shape: IShapeData;

  // Logo settings
  logo: ILogoData;
}

// Individual section data types
export interface IFrameData {
  id: string;
  color?: string;
  textColor?: string;
  text?: string;
  presetId?: string;
}

export interface IStyleData {
  dotsStyle: string;
  foregroundColor: string;
  backgroundColor?: string;
}

export interface IShapeData {
  cornerSquareStyle: string;
  cornerDotStyle: string;
}

export interface ILogoData {
  type: "none" | "suggested" | "uploaded";
  id?: string; // For suggested logos, this is the logo ID. For uploaded logos, this is the fileId from upload
  iconSrc?: string; // For suggested logos, the src path from the imported SVG
  fileId?: string; // File ID from upload service for uploaded logos
  file?: File; // Temporary File object before upload (client-side only, not serialized)
}

// Style option interface for pickers
export interface IStyleOption {
  id: string;
  type: string;
  icon: any; // React component or image
  defaultTextColor?: string;
  relevantFor?: string[]; // QR types this logo is most relevant for
  disableFrameText?: boolean;
  preset?: string;
  extension?: (
    qr: SVGSVGElement,
    options: {
      width: number;
      height: number;
      frameColor: string;
      frameTextColor: string;
      frameText: string;
    },
  ) => Promise<void>;
}

export interface IQrPalette {
  id: number,
  qrColor: string,
  frameColor: string,
  textColor: string,
}
