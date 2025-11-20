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
import CardSixthVerPreview from '../../assets/icons/frames/card-6-ver-preview.svg'
import CardSixthVer from '../../assets/icons/frames/card-6-ver-frame.svg'
import CardSixthHorPreview from '../../assets/icons/frames/card-6-hor-preview.svg'
import CardSixthHor from '../../assets/icons/frames/card-6-hor-frame.svg'
import CardSeventhPreview from "../../assets/icons/frames/card-7-preview.svg";
import CardSeventh from "../../assets/icons/frames/card-7-frame.svg";
import CardEighthPreview from "../../assets/icons/frames/card-8-preview.svg";
import CardEighth from "../../assets/icons/frames/card-8-frame.svg";
import CardNinthPreview from "../../assets/icons/frames/card-9-preview.svg";
import CardNinth from "../../assets/icons/frames/card-9-frame.svg";

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
  {
    id: "frame-card-7",
    type: "card-7",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardSeventh, 0.75, 50, 5);
    },
    icon: CardSeventhPreview,
  },
  {
    id: "frame-card-8",
    type: "card-8",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardEighth, 0.739, 52, 7);
    },
    icon: CardEighthPreview,
  },
  {
    id: "frame-card-9",
    type: "card-9",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardNinth, 0.62, 90, 20);
    },
    icon: CardNinthPreview,
  },
  {
    id: "frame-card-4",
    type: "card-4",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardForth, 0.55, 122, 69);
    },
    icon: CardForthPreview,
    defaultTextColor: BLACK_COLOR,
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
    id: "frame-card-6-ver",
    type: "card-6-ver",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardSixthVer, 0.39, 105, 234);
    },
    icon: CardSixthVerPreview,
    disableFrameText: true,
  },
  {
    id: "frame-card-6-hor",
    type: "card-hor",
    extension: async (qr, options) => {
      await embedQRIntoFrame(qr, options, CardSixthHor, 0.52, 12, 138);
    },
    icon: CardSixthHorPreview,
    disableFrameText: true,
  },
  
];

export const isDefaultTextColor = (color: string): boolean => {
  return isWhiteHex(color) || isBlackHex(color);
};
