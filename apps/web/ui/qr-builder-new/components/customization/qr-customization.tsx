import { cn } from "@dub/utils";
import * as Tabs from "@radix-ui/react-tabs";
import { FC, useCallback } from "react";
import { useUser } from "@/ui/contexts/user";
import { trackClientEvents } from "core/integration/analytic";
import { EAnalyticEvents } from "core/integration/analytic/interfaces/analytic.interface.ts";

import { QR_STYLES_OPTIONS } from "../../constants/customization/qr-styles-options";
import {
  IFrameData,
  ILogoData,
  IQRCustomizationData,
  IShapeData,
  IStyleData,
} from "../../types/customization";
import { FrameSelector } from "./frame-selector";
import { LogoSelector } from "./logo-selector";
import { ShapeSelector } from "./shape-selector";
import { StyleSelector } from "./style-selector";

interface QRCustomizationProps {
  customizationData: IQRCustomizationData;
  onCustomizationChange: (data: IQRCustomizationData) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  disabled?: boolean;
  isMobile?: boolean;
  homepageDemo?: boolean;
}

export const QRCustomization: FC<QRCustomizationProps> = ({
  customizationData,
  onCustomizationChange,
  activeTab,
  onTabChange,
  disabled = false,
  isMobile = false,
  homepageDemo = false,
}) => {
  const user = useUser();

  const isFrameSelected = customizationData.frame.id !== "frame-none";

  const handleTabChange = useCallback(
    (tab: string) => {
      onTabChange(tab);

      trackClientEvents({
        event: EAnalyticEvents.ELEMENT_CLICKED,
        params: {
          page_name: homepageDemo ? "landing" : "dashboard",
          element_name: "customization_tabs",
          content_value: tab.toLowerCase(),
          email: user?.email,
          event_category: homepageDemo ? "nonAuthorized" : "Authorized",
        },
        sessionId: user?.id,
      });
    },
    [onTabChange, homepageDemo, user],
  );

  const handleFrameChange = useCallback(
    (frameData: IFrameData) => {
      const updatedData = {
        ...customizationData,
        frame: frameData,
      };
      onCustomizationChange(updatedData);
    },
    [customizationData, onCustomizationChange],
  );

  const handleStyleChange = useCallback(
    (styleData: IStyleData) => {
      onCustomizationChange({
        ...customizationData,
        style: styleData,
      });
    },
    [customizationData, onCustomizationChange],
  );

  const handleShapeChange = useCallback(
    (shapeData: IShapeData) => {
      onCustomizationChange({
        ...customizationData,
        shape: shapeData,
      });
    },
    [customizationData, onCustomizationChange],
  );

  const handleLogoChange = useCallback(
    (logoData: ILogoData) => {
      const updatedData = {
        ...customizationData,
        logo: logoData,
      };
      onCustomizationChange(updatedData);
    },
    [customizationData, onCustomizationChange],
  );

  const frameSelector = (
    <FrameSelector
      frameData={customizationData.frame}
      onFrameChange={handleFrameChange}
      disabled={disabled}
      isMobile={isMobile}
    />
  );

  const styleSelector = (
    <StyleSelector
      styleData={customizationData.style}
      onStyleChange={handleStyleChange}
      frameSelected={isFrameSelected}
      disabled={disabled}
      isMobile={isMobile}
    />
  );

  const shapeSelector = (
    <ShapeSelector
      shapeData={customizationData.shape}
      onShapeChange={handleShapeChange}
      disabled={disabled}
      isMobile={isMobile}
    />
  );

  const logoSelector = (
    <LogoSelector
      logoData={customizationData.logo}
      onLogoChange={handleLogoChange}
      disabled={disabled}
      isMobile={isMobile}
    />
  );

  return (
    <Tabs.Root
      value={activeTab}
      onValueChange={handleTabChange}
      className="text-neutral flex w-full flex-col items-center justify-center gap-4"
    >
      <Tabs.List className="flex w-full items-center gap-1 overflow-x-auto rounded-lg">
        {QR_STYLES_OPTIONS.map((tab) => (
          <Tabs.Trigger
            key={tab.id}
            value={tab.label}
            className={cn(
              "text-neutral flex h-12 items-center justify-center gap-2 rounded-md px-3.5 py-2 transition-colors md:h-9",
              "hover:bg-border-100 hover:text-neutral",
              "data-[state=active]:bg-secondary-100 data-[state=active]:text-secondary",
              {
                "cursor-not-allowed opacity-50": disabled,
              },
            )}
            disabled={disabled}
          >
            <span className="text-sm font-medium">{tab.label}</span>
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {QR_STYLES_OPTIONS.map((tab) => (
        <Tabs.Content
          key={tab.id}
          value={tab.label}
          className="w-full focus:outline-none"
        >
          {tab.id === "frame" && frameSelector}
          {tab.id === "style" && styleSelector}
          {tab.id === "shape" && shapeSelector}
          {tab.id === "logo" && logoSelector}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};
