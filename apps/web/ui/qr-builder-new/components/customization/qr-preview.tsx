import { useQRCodeStyling } from "../../hooks/use-qr-code-styling";
import { IQRCustomizationData } from "../../types/customization";
import { QRCanvas } from "../qr-canvas";

interface QRPreviewProps {
  homepageDemo?: boolean;
  customizationData: IQRCustomizationData;
}

export const QRPreview = ({ customizationData }: QRPreviewProps) => {
  const { svgString } = useQRCodeStyling({
    customizationData,
    defaultData: "https://getqr.com/qr-complete-setup",
  });

  return (
    <div className="flex w-max items-center justify-center">
      <QRCanvas
        svgString={svgString}
        width={270}
        height={270}
        className="p-3"
      />
    </div>
  );
};
