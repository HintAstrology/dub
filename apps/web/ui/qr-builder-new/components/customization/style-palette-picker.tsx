import { cn } from "@dub/utils";
import { FC } from "react";
import { IQrPalette } from "../../types/customization";

interface StylePalettePickerProps {
  palettes: IQrPalette[];
  setSelectedPalette: (palette: IQrPalette) => void;
  selectedPalette?: IQrPalette;
}

export const StylePalettePicker: FC<StylePalettePickerProps> = ({
  palettes,
  selectedPalette,
  setSelectedPalette,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium">Color presets</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" >
        {palettes?.map((preset) => (
          <div
            key={preset.qrColor}
            className={cn(
              "w-full border-border-300 hover:border-secondary flex gap-1 rounded-md border p-2",
              { "border-secondary": selectedPalette?.id === preset.id },
            )}
            onClick={() => setSelectedPalette(preset)}
          >
            <div
              className="h-6 w-full border"
              style={{
                backgroundColor: preset.qrColor,
                borderColor: `color-mix(in srgb, ${preset.qrColor} 80%, black)`,
              }}
            />
            <div
              className="h-6 w-full border"
              style={{
                backgroundColor: preset.frameColor,
                borderColor: `color-mix(in srgb, ${preset.frameColor} 80%, black)`,
              }}
            />
            <div
              className="h-6 w-full border"
              style={{
                backgroundColor: preset.textColor,
                borderColor: `color-mix(in srgb, ${preset.textColor} 80%, black)`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
