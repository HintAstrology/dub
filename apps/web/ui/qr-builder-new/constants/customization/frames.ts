import CardFirstPreview from "../../assets/icons/frames/card-1-preview.svg";
import CardFirst from "../../assets/icons/frames/card-1.svg";
import CardSecondPreview from "../../assets/icons/frames/card-2-preview.svg";
import CardSecond from "../../assets/icons/frames/card-2.svg";
import CardThirdPreview from "../../assets/icons/frames/card-3-preview.svg";
import CardThird from "../../assets/icons/frames/card-3.svg";
import CardPreview from "../../assets/icons/frames/card-preview.svg";
import Card from "../../assets/icons/frames/card.svg";
import ClipboardFramePreview from "../../assets/icons/frames/clipboard-preview.svg";
import ClipboardFrame from "../../assets/icons/frames/clipboard.svg";
import CoffeeCupPreview from "../../assets/icons/frames/coffee-cup-preview.svg";
import CoffeeCup from "../../assets/icons/frames/coffee-cup.svg";
import EnvelopePreview from "../../assets/icons/frames/envelope-preview.svg";
import Envelope from "../../assets/icons/frames/envelope.svg";
import ScooterPreview from "../../assets/icons/frames/scooter-preview.svg";
import Scooter from "../../assets/icons/frames/scooter.svg";
import WaitressPreview from "../../assets/icons/frames/waitress-preview.svg";
import Waitress from "../../assets/icons/frames/waitress.svg";
import WreathPreview from "../../assets/icons/frames/wreath-preview.svg";
import Wreath from "../../assets/icons/frames/wreath.svg";
import NoLogoIcon from "../../assets/icons/no-logo.svg";

import { isBlackHex, isWhiteHex } from "../../helpers/color-validation";
import { embedQRIntoFrame } from "../../helpers/frame-helpers";
import { IStyleOption } from "../../types/customization";
import { BLACK_COLOR } from "./colors";

export const FRAME_TEXT = "Scan Me!";

export const FRAMES: IStyleOption[] = [
  {
    id: "frame-none",
    type: "none",
    icon: NoLogoIcon,
  },
  {
    id: "frame-card",
    type: "card",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, Card, 0.75, 50, 5);
    },
    icon: CardPreview,
  },
  {
    id: "frame-card-1",
    type: "card-1",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardFirst, 0.75, 50, 5);
    },
    icon: CardFirstPreview,
  },
  {
    id: "frame-card-2",
    type: "card-2",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardSecond, 0.739, 52, 7);
    },
    icon: CardSecondPreview,
    defaultTextColor: BLACK_COLOR,
  },
  {
    id: "frame-card-3",
    type: "card-3",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardThird, 0.723, 57, 10);
    },
    icon: CardThirdPreview,
    defaultTextColor: BLACK_COLOR,
  },
  {
    id: "frame-wreath",
    type: "wreath",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, Wreath, 0.65, 81, 40);
    },
    icon: WreathPreview,
  },
  {
    id: "frame-envelope",
    type: "envelope",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, Envelope, 0.52, 138, 25);
    },
    icon: EnvelopePreview,
    defaultTextColor: BLACK_COLOR,
  },
  {
    id: "frame-waitress",
    type: "waitress",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, Waitress, 0.51, 150, 75);
    },
    icon: WaitressPreview,
    defaultTextColor: BLACK_COLOR,
  },
  {
    id: "frame-coffee-cup",
    type: "coffee-cup",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CoffeeCup, 0.517, 121, 130);
    },
    icon: CoffeeCupPreview,
    defaultTextColor: BLACK_COLOR,
  },
  {
    id: "frame-scooter",
    type: "scooter",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, Scooter, 0.457, 43, 48);
    },
    icon: ScooterPreview,
  },
  {
    id: "frame-clipboard",
    type: "clipboard",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, ClipboardFrame, 0.72, 60, 55);
    },
    icon: ClipboardFramePreview,
  },
];

export const isDefaultTextColor = (color: string): boolean => {
  return isWhiteHex(color) || isBlackHex(color);
};
