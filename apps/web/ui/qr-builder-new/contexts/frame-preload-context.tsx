import { createContext } from "react";

interface FramePreloadContextType {
  isLoaded: boolean;
}

export const FramePreloadContext = createContext<FramePreloadContextType>({
  isLoaded: false,
});
