import { useQRCodeStyling } from "../../hooks/use-qr-code-styling";
import { IQRCustomizationData } from "../../types/customization";
import { QRCanvas } from "../qr-canvas";

interface QRPreviewProps {
  homepageDemo?: boolean;
  customizationData: IQRCustomizationData;
}

export const QRPreview = ({
  homepageDemo,
  customizationData,
}: QRPreviewProps) => {
  // const activeFormData =
  //   Object.keys(currentFormValues || {}).length > 0
  //     ? currentFormValues
  //     : formData;

  // const qrData = useMemo(() => {
  //   if (selectedQrType && activeFormData) {
  //     try {
  //       const data = encodeQRData(selectedQrType, activeFormData as any);
  //       return data || "https://getqr.com/qr-complete-setup";
  //     } catch (error) {
  //       console.error("Error generating QR data:", error);
  //       return "https://getqr.com/qr-complete-setup";
  //     }
  //   }
  //   return "https://getqr.com/qr-complete-setup";
  // }, [selectedQrType, activeFormData]);

  const { svgString } = useQRCodeStyling({
    customizationData,
    defaultData: "https://getqr.com/qr-complete-setup",
  });

  return (
    <div className="flex w-full items-center justify-center">
      <QRCanvas
        svgString={svgString}
        width={270}
        height={270}
        className="p-3"
      />
    </div>
  );
};
