import { DeviceTabs } from "@/lib/analytics/types";
import { Apple, Chrome, Safari } from "@/ui/shared/icons/devices";
import { BlurImage } from "@dub/ui";
import {
  CursorRays,
  Desktop,
  GamingConsole,
  MobilePhone,
  QRCode,
  TV,
  Tablet,
  Watch,
} from "@dub/ui/icons";

// Use jsDelivr CDN with Simple Icons for consistently sized icons
// Simple Icons are all 24x24 viewBox, so they scale consistently
const getSimpleIcon = (icon: string) => {
  return `https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${icon}.svg`;
};

// Map browser names to Simple Icons names (used in jsDelivr CDN)
const browserIconMap: Record<string, string> = {
  chrome: "googlechrome",
  firefox: "firefox",
  edge: "microsoftedge",
  safari: "safari",
  opera: "opera",
  brave: "brave",
  vivaldi: "vivaldi",
  samsung: "samsunginternet",
  yandex: "yandex",
  uc: "ucbrowser",
};

// Map OS names to Simple Icons names (used in jsDelivr CDN)
const osIconMap: Record<string, string> = {
  "mac os": "macos",
  "macos": "macos",
  ios: "ios",
  windows: "windows",
  android: "android",
  linux: "linux",
  ubuntu: "ubuntu",
  debian: "debian",
  fedora: "fedora",
  centos: "centos",
  redhat: "redhat",
};

export default function DeviceIcon({
  display,
  tab,
  className,
}: {
  display: string;
  tab: DeviceTabs;
  className: string;
}) {
  if (tab === "devices") {
    switch (display) {
      case "Desktop":
        return <Desktop className={className} />;
      case "Mobile":
        return <MobilePhone className={className} />;
      case "Tablet":
        return <Tablet className={className} />;
      case "Wearable":
        return <Watch className={className} />;
      case "Console":
        return <GamingConsole className={className} />;
      case "Smarttv":
        return <TV className={className} />;
      default:
        return <Desktop className={className} />;
    }
  } else if (tab === "browsers") {
    if (display === "Chrome") {
      return <Chrome className={className} />;
    } else if (display === "Safari" || display === "Mobile Safari") {
      return <Safari className={className} />;
    } else {
      const iconKey = display.toLowerCase();
      const simpleIcon = browserIconMap[iconKey];
      
      if (simpleIcon) {
        return (
          <BlurImage
            src={getSimpleIcon(simpleIcon)}
            alt={display}
            width={16}
            height={16}
            className={className}
          />
        );
      }
      
      // Fallback to original source if not found in map
      return (
        <BlurImage
          src={`https://faisalman.github.io/ua-parser-js/images/browsers/${iconKey}.png`}
          alt={display}
          width={16}
          height={16}
          className={className}
        />
      );
    }
  } else if (tab === "os") {
    if (display === "Mac OS") {
      return (
        <BlurImage
          src={getSimpleIcon("macos")}
          alt={display}
          width={16}
          height={16}
          className={className}
        />
      );
    } else if (display === "iOS") {
      return <Apple className={className} />;
    } else {
      const iconKey = display.toLowerCase();
      const simpleIcon = osIconMap[iconKey];
      
      if (simpleIcon) {
        return (
          <BlurImage
            src={getSimpleIcon(simpleIcon)}
            alt={display}
            width={16}
            height={16}
            className={className}
          />
        );
      }
      
      // Fallback to original source if not found in map
      return (
        <BlurImage
          src={`https://faisalman.github.io/ua-parser-js/images/os/${iconKey}.png`}
          alt={display}
          width={16}
          height={16}
          className={className}
        />
      );
    }
  } else if (tab === "triggers") {
    if (display === "qr" || display === "link") {
      return <QRCode className={className} />;
    } else {
      return <CursorRays className={className} />;
    }
  } else {
    return (
      <BlurImage
        src={`https://faisalman.github.io/ua-parser-js/images/companies/default.png`}
        alt={display}
        width={16}
        height={16}
        className={className}
      />
    );
  }
}
