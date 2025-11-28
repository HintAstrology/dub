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
import CardForthPreview from '../../assets/icons/frames/card-4-preview.svg'
import CardForth from '../../assets/icons/frames/card-4-frame.svg'
import CardFifthPreview from '../../assets/icons/frames/card-5-preview.svg'
import CardFifth from '../../assets/icons/frames/card-5-frame.svg'
import CardSixthHorPreview from '../../assets/icons/frames/card-6-hor-preview.svg'
import CardSixthHor from '../../assets/icons/frames/card-6-hor-frame.svg'
import CardSeventhPreview from "../../assets/icons/frames/card-7-preview.svg";
import CardSeventh from "../../assets/icons/frames/card-7-frame.svg";
import CardEighthPreview from "../../assets/icons/frames/card-8-preview.svg";
import CardEighth from "../../assets/icons/frames/card-8-frame.svg";
import CardNinthPreview from "../../assets/icons/frames/card-9-preview.svg";
import CardNinth from "../../assets/icons/frames/card-9-frame.svg";
import CardTenthPreview from "../../assets/icons/frames/card-10-preview.svg";
import CardTenth from "../../assets/icons/frames/card-10-frame.svg";
import CardEleventhPreview from "../../assets/icons/frames/card-11-preview.svg";
import CardEleventh from "../../assets/icons/frames/card-11-frame.svg";
import CardTwelfthPreview from "../../assets/icons/frames/card-12-preview.svg";
import CardTwelfth from "../../assets/icons/frames/card-12-frame.svg";
import CardThirteenthPreview from "../../assets/icons/frames/card-13-preview.svg";
import CardThirteenth from "../../assets/icons/frames/card-13-frame.svg";
import CardFourteenthPreview from "../../assets/icons/frames/card-14-preview.svg";
import CardFourteenth from "../../assets/icons/frames/card-14-frame.svg";
import CardFifteenthPreview from "../../assets/icons/frames/card-15-preview.svg";
import CardFifteenth from "../../assets/icons/frames/card-15-frame.svg";

import { isBlackHex, isWhiteHex } from "../../helpers/color-validation";
import { embedQRIntoFrame } from "../../helpers/frame-helpers";
import { IStyleOption } from "../../types/customization";
import { BLACK_COLOR, WHITE_COLOR } from "./colors";

export const FRAME_TEXT = "Scan Me!";

export const FRAMES: IStyleOption[] = [
  {
    id: "frame-none",
    type: "none",
    icon: NoLogoIcon,
    preset: 'ligthTextPreset'
  },
  {
    id: "frame-card",
    type: "card",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, Card, 0.75, 50, 5);
    },
    icon: CardPreview,
    preset: 'ligthTextPreset'
  },
  {
    id: "frame-card-1",
    type: "card-1",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardFirst, 0.75, 50, 5);
    },
    icon: CardFirstPreview,
    preset: 'ligthTextPreset'
  },
  {
    id: "frame-card-2",
    type: "card-2",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardSecond, 0.739, 52, 7);
    },
    icon: CardSecondPreview,
    defaultTextColor: BLACK_COLOR,
    preset: 'ligthTextPreset'
  },
  {
    id: "frame-card-3",
    type: "card-3",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardThird, 0.723, 57, 10);
    },
    icon: CardThirdPreview,
    defaultTextColor: BLACK_COLOR,
    preset: 'ligthTextPreset'
  },
  {
    id: "frame-wreath",
    type: "wreath",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, Wreath, 0.65, 81, 40);
    },
    icon: WreathPreview,
    preset: 'ligthTextPreset'
  },
  {
    id: "frame-envelope",
    type: "envelope",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, Envelope, 0.52, 138, 25);
    },
    icon: EnvelopePreview,
    defaultTextColor: BLACK_COLOR,
    preset: 'ligthTextPreset'
  },
  {
    id: "frame-waitress",
    type: "waitress",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, Waitress, 0.51, 150, 75);
    },
    icon: WaitressPreview,
    defaultTextColor: BLACK_COLOR,
    preset: 'ligthTextPreset'
  },
  {
    id: "frame-coffee-cup",
    type: "coffee-cup",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CoffeeCup, 0.517, 121, 130);
    },
    icon: CoffeeCupPreview,
    defaultTextColor: BLACK_COLOR,
    preset: 'ligthTextPreset'
  },
  {
    id: "frame-scooter",
    type: "scooter",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, Scooter, 0.457, 43, 48);
    },
    icon: ScooterPreview,
    preset: 'ligthTextPreset'
  },
  {
    id: "frame-clipboard",
    type: "clipboard",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, ClipboardFrame, 0.72, 60, 55);
    },
    icon: ClipboardFramePreview,
    preset: 'ligthTextPreset'
  },
  {
    id: "frame-card-7",
    type: "card-7",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardSeventh, 0.75, 50, 5);
    },
    icon: CardSeventhPreview,
    preset: 'ligthTextPreset'
  },
  {
    id: "frame-card-8",
    type: "card-8",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardEighth, 0.739, 52, 7);
    },
    icon: CardEighthPreview,
    preset: 'ligthTextPreset'
  },
  {
    id: "frame-card-9",
    type: "card-9",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardNinth, 0.62, 90, 20);
    },
    icon: CardNinthPreview,
    preset: 'ligthTextPreset'
  },
  {
    id: "frame-card-4",
    type: "card-4",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardForth, 0.55, 122, 69);
    },
    icon: CardForthPreview,
    defaultTextColor: BLACK_COLOR,
    preset:'darkTextPreset'
  },
  {
    id: "frame-card-5",
    type: "card-5",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardFifth, 0.7, 63, 125);
    },
    icon: CardFifthPreview,
    defaultTextColor: BLACK_COLOR,
  },
  {
    id: "frame-card-6-hor",
    type: "card-hor",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardSixthHor, 0.52, 12, 138);
    },
    icon: CardSixthHorPreview,
    disableFrameText: true,
    preset: 'ligthTextPreset'
  },
  {
    id: "frame-card-10",
    type: "card-10",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardTenth, 0.71, 60, 84);
    },
    icon: CardTenthPreview,
    disableFrameText: true,
    preset: 'ligthTextPreset'
  },
  {
    id: "frame-card-11",
    type: "card-11",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardEleventh, 0.70, 62, 28);
    },
    icon: CardEleventhPreview,
    disableFrameText: true,
    preset: 'ligthTextPreset'
  },
  {
    id: "frame-card-12",
    type: "card-12",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardTwelfth, 0.60, 98, 60);
    },
    icon: CardTwelfthPreview,
    disableFrameText: true,
    preset: 'ligthTextPreset'
  },
  {
    id: "frame-card-13",
    type: "card-13",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardThirteenth, 0.60, 98, 61);
    },
    icon: CardThirteenthPreview,
    disableFrameText: true,
    preset: 'ligthTextPreset'
  },
  {
    id: "frame-card-14",
    type: "card-14",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardFourteenth, 0.65, 80, 55);
    },
    icon: CardFourteenthPreview,
    preset: 'ligthTextPreset'
  },
  {
    id: "frame-card-15",
    type: "card-15",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardFifteenth, 0.60, 98, 54);
    },
    icon: CardFifteenthPreview,
    defaultTextColor: WHITE_COLOR,
    preset: 'ligthTextPreset'
  },  
];

export const isDefaultTextColor = (color: string): boolean => {
  return isWhiteHex(color) || isBlackHex(color);
};
