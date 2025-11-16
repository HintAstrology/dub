import CardFirst from "@/ui/qr-builder-new/assets/icons/frames/card-1.svg";
import CardSecond from "@/ui/qr-builder-new/assets/icons/frames/card-2.svg";
import CardThird from "@/ui/qr-builder-new/assets/icons/frames/card-3.svg";
import Card from "@/ui/qr-builder-new/assets/icons/frames/card.svg";
import ClipboardFrame from "@/ui/qr-builder-new/assets/icons/frames/clipboard.svg";
import CoffeeCup from "@/ui/qr-builder-new/assets/icons/frames/coffee-cup.svg";
import Envelope from "@/ui/qr-builder-new/assets/icons/frames/envelope.svg";
import Scooter from "@/ui/qr-builder-new/assets/icons/frames/scooter.svg";
import Waitress from "@/ui/qr-builder-new/assets/icons/frames/waitress.svg";
import Wreath from "@/ui/qr-builder-new/assets/icons/frames/wreath.svg";
import { createCachedLoader } from "@/ui/qr-builder-new/helpers/resource-cache";
import { StaticImageData } from "next/image";

// Frame cache functionality
const frameLoader = createCachedLoader<StaticImageData, SVGElement>({
  getKey: (frame) => frame.src,
  loadResource: async (frame) => {
    const response = await fetch(frame.src);
    const svgText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, "image/svg+xml");
    return doc.querySelector("svg") as SVGElement | null;
  },
  onError: (frame, error) =>
    console.error(`Failed to load frame: ${frame.src}`, error),
});

export const frameMemoryCache = frameLoader.cache;
export const loadAndCacheFrame = frameLoader.load;

export const preloadAllFrames = async () => {
  const framesToLoad = [
    Card,
    CardFirst,
    CardSecond,
    CardThird,
    Wreath,
    Envelope,
    Waitress,
    CoffeeCup,
    Scooter,
    ClipboardFrame,
  ];

  const BATCH_SIZE = 3;

  for (let i = 0; i < framesToLoad.length; i += BATCH_SIZE) {
    const batch = framesToLoad.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (frame) => {
        try {
          await loadAndCacheFrame(frame);
        } catch (err) {
          console.error(`Failed to preload frame: ${frame.src}`, err);
        }
      }),
    );
  }
};
