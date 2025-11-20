import { motion } from "framer-motion";
import { FC, useCallback, useEffect, useState } from "react";
import { BLACK_COLOR, WHITE_COLOR } from "../../constants/customization/colors";
import {
  FRAMES,
  FRAME_TEXT,
} from "../../constants/customization/frames";
import { IFrameData, IQRCustomizationData, IQrPalette, IStyleData } from "../../types/customization";
import { StylePalettePicker } from "./style-palette-picker";
import { StylePicker } from "./style-picker";

const darkTextPreset: IQrPalette[] = [
  {
    id: 1,
    qrColor: BLACK_COLOR,
    frameColor: BLACK_COLOR,
    textColor: BLACK_COLOR,
  },
  {
    id: 2,
    qrColor: "#003323",
    frameColor: "#006768",
    textColor: "#006768",
  },
  {
    id: 3,
    qrColor: "#331C00",
    frameColor: "#B73302",
    textColor: "#B73302",
  },
  {
    id: 4,
    qrColor: "#000633",
    frameColor: "#0036CC",
    textColor: "#0036CC",
  },
];

const ligthTextPreset: IQrPalette[] = [
  {
    id: 5,
    qrColor: BLACK_COLOR,
    frameColor: BLACK_COLOR,
    textColor: WHITE_COLOR,
  },
  {
    id: 6,
    qrColor: "#003323",
    frameColor: "#006768",
    textColor: "#D3E1E1",
  },
  {
    id: 7,
    qrColor: "#331C00",
    frameColor: "#B73302",
    textColor: "#F1D6CB",
  },
  {
    id: 8,
    qrColor: "#000633",
    frameColor: "#0036CC",
    textColor: "#CDD5FA",
  },
]

const presets = {
  darkTextPreset,
  ligthTextPreset,
}

interface FrameSelectorProps {
  frameData: IFrameData;
  styleData: IStyleData,
  onFrameChange: (frameData: IFrameData) => void;
  handlePaletteChange: (styles: Partial<IQRCustomizationData>) => void
  disabled?: boolean;
  isMobile?: boolean;
}

export const FrameSelector: FC<FrameSelectorProps> = ({
  frameData,
  styleData,
  onFrameChange,
  handlePaletteChange,
  disabled = false,
  isMobile = false,
}) => {
  const [frameColor, setFrameColor] = useState<string>(
    frameData.color || BLACK_COLOR,
  );
  const [frameText, setFrameText] = useState<string>(
    frameData.text ?? FRAME_TEXT,
  );
  const [selectedPalette, setSelectedPalette] = useState<IQrPalette | undefined>()

  const isFrameSelected = frameData.id !== "frame-none";

  useEffect(() => {
    setFrameColor(frameData.color || BLACK_COLOR);
    setFrameText(frameData.text ?? FRAME_TEXT);
  }, [frameData]);

  const handleFrameSelect = useCallback(
    (frameId: string) => {
      // If switching to "no frame", clear all settings
      if (frameId === "frame-none") {
        const newFrameData: IFrameData = {
          id: frameId,
          color: undefined,
          textColor: undefined,
          text: undefined,
        };
        onFrameChange(newFrameData);
        return;
      }

      // If re-selecting the same frame, preserve existing settings from frameData
      if (frameId === frameData.id) {
        return;
      }

      // If switching to a new frame, use current settings but with new frame's default text color
      const newSelectedFrame = FRAMES.find((f) => f.id === frameId);
      const newDefaultTextColor =
        newSelectedFrame?.defaultTextColor || WHITE_COLOR;

      const newFrameData: IFrameData = {
        id: frameId,
        color: frameColor,
        textColor: selectedPalette ? selectedPalette.textColor : newDefaultTextColor,
        text: frameText,
        presetId: newSelectedFrame?.preset
      };

      onFrameChange(newFrameData);
    },
    [frameColor, frameText, onFrameChange, frameData],
  );

  const onPaletteChange = (palette: IQrPalette) => {
    setFrameColor(palette.frameColor);
    handlePaletteChange({
      style: {
        ...styleData,
        foregroundColor: palette.qrColor
      },
      frame: {
        ...frameData,
        textColor: palette.textColor,
        color: palette.frameColor
      }
    })
    setSelectedPalette(palette)
  }

  return (
    <motion.div
      layout
      className="flex w-full flex-col gap-4 pb-6"
    >
      <StylePicker
        label="Frame around QR code"
        styleOptions={FRAMES}
        value={frameData.id}
        onSelect={handleFrameSelect}
        optionsWrapperClassName={`gap-2 ${isMobile ? "pb-2" : "pb-0"} ${
          disabled ? "pointer-events-none cursor-not-allowed" : ""
        }`}
        styleButtonClassName="[&_img]:h-[60px] [&_img]:w-[60px] p-2"
        disabled={disabled}
      />
      {isFrameSelected && presets[frameData.presetId ?? ''] && <StylePalettePicker palettes={presets[frameData.presetId ?? '']} selectedPalette={selectedPalette} setSelectedPalette={onPaletteChange} />}
    </motion.div>
  );
};
