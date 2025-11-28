import { IQrPalette } from "../../types/customization";
import { BLACK_COLOR, WHITE_COLOR } from "./colors";

export const darkTextPreset: IQrPalette[] = [
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

export const ligthTextPreset: IQrPalette[] = [
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
];

export const presets = {
  darkTextPreset,
  ligthTextPreset,
};

