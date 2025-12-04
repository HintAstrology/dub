import { Icon } from "@iconify/react";
import {
  ChromeIcon,
  Compass,
  Gamepad2,
  GlobeIcon,
  LayoutGridIcon,
  Monitor,
  MonitorIcon,
  Smartphone,
  SmartphoneIcon,
  Tablet,
  Tv,
  Watch,
} from "lucide-react";
import { ANALYTICS_QR_TYPES_DATA } from "../qr-builder-new/constants/get-qr-config";
import DeviceIcon from "./components/device-icon";

/**
 * Get device icon based on device name
 */
export function getDeviceIcon(
  deviceName: string | undefined,
  className: string = "h-8 w-max",
): React.ReactNode {
  const iconClassName = `text-primary ${className} stroke-[1.5]`;

  if (!deviceName) {
    return <SmartphoneIcon className={iconClassName} />;
  }

  switch (deviceName) {
    case "Desktop":
      return <Monitor className={iconClassName} />;
    case "Mobile":
      return <Smartphone className={iconClassName} />;
    case "Tablet":
      return <Tablet className={iconClassName} />;
    case "Wearable":
      return <Watch className={iconClassName} />;
    case "Console":
      return <Gamepad2 className={iconClassName} />;
    case "Smarttv":
      return <Tv className={iconClassName} />;
    default:
      return <Monitor className={iconClassName} />;
  }
}

/**
 * Get QR type icon based on QR type ID
 */
export function getQrTypeIcon(
  qrTypeId: string | undefined,
  className: string = "text-primary size-8",
): React.ReactNode {
  const qrTypeInfo = ANALYTICS_QR_TYPES_DATA.find(
    (type) => type.id === qrTypeId,
  );
  return qrTypeInfo ? (
    <Icon icon={qrTypeInfo.icon} className={className} />
  ) : (
    <LayoutGridIcon className={`${className} stroke-[1.5]`} />
  );
}

/**
 * Get browser icon based on browser name using Lucide icons
 */
export function getBrowserIcon(
  browserName: string | undefined,
  className: string = "text-primary size-8",
): React.ReactNode {
  const iconClassName = `${className} stroke-[1.5]`;
  
  if (!browserName) {
    return <ChromeIcon className={iconClassName} />;
  }

  const browserLower = browserName.toLowerCase();
  if (browserLower === "safari" || browserLower === "mobile safari") {
    return <Compass className={iconClassName} />;
  }
  return <ChromeIcon className={iconClassName} />;
}

/**
 * Get OS icon based on OS name
 */
export function getOSIcon(
  osName: string | undefined,
  className: string = "text-primary size-5",
): React.ReactNode {
  if (!osName) {
    return <MonitorIcon className={`${className} stroke-[1.5]`} />;
  }

  return <DeviceIcon display={osName} tab="os" className={className} />;
}

/**
 * Get country flag icon based on country code
 */
export function getCountryIcon(
  countryCode: string | undefined,
  className: string = "size-5 object-contain",
): React.ReactNode {
  if (!countryCode) {
    return <GlobeIcon className="text-primary size-8 stroke-[1.5]" />;
  }

  return (
    <img
      alt={countryCode}
      src={`https://flag.vercel.app/m/${countryCode}.svg`}
      className={className}
    />
  );
}

