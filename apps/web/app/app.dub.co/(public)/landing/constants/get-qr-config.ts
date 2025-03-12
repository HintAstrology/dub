import QrAppLinkFull from "@/ui/landing/assets/png/get-qr-app-link-full.png";
import QrFeedbackFull from "@/ui/landing/assets/png/get-qr-feedback-full.png";
import QrImagesFull from "@/ui/landing/assets/png/get-qr-images-full.png";
import QrPDFFull from "@/ui/landing/assets/png/get-qr-pdf-full.png";
import QrSocialFull from "@/ui/landing/assets/png/get-qr-social-full.png";
import QrVideosFull from "@/ui/landing/assets/png/get-qr-videos-full.png";
import QrWebsiteFull from "@/ui/landing/assets/png/get-qr-website-full.png";
import QrWhatsappFull from "@/ui/landing/assets/png/get-qr-whatsapp-full.png";
import QrWifiFull from "@/ui/landing/assets/png/get-qr-wifi-full.png";
import { StaticImageData } from "next/image";

export type QRType = {
  id: string;
  label: string;
  icon: string;
  img: StaticImageData;
  content: string;
};

export const DEFAULT_QR_TYPES: QRType[] = [
  {
    id: "website",
    label: "Website",
    icon: "streamline:web",
    img: QrWebsiteFull,
    content:
      "Turn every scan into a visit! Link your website to a QR code and make it easy for customers, clients, or followers to connect with your brand in seconds.",
  },
  {
    id: "pdf",
    label: "PDF",
    icon: "hugeicons:pdf-02",
    img: QrPDFFull,
    content:
      "Share important documents instantly! Link your PDF to a QR code and give people quick and easy access to menus, guides, brochures, or portfolios—anytime, anywhere.",
  },
  {
    id: "images",
    label: "Images",
    icon: "hugeicons:ai-image",
    img: QrImagesFull,
    content:
      "Showcase your visuals with ease! Use a QR code to share product galleries, event photos, or special moments instantly—perfect for businesses, creatives, and personal use.",
  },
  {
    id: "video",
    label: "Video",
    icon: "hugeicons:ai-video",
    img: QrVideosFull,
    content:
      "Bring your content to life! Use a QR code to instantly share videos—whether it's tutorials, trailers, promotions, or educational content—anytime, anywhere.",
  },
  {
    id: "whatsapp",
    label: "Whatsapp",
    icon: "basil:whatsapp-outline",
    img: QrWhatsappFull,
    content:
      "Start conversations instantly! Use a QR code to let customers, clients, or friends message you on WhatsApp with a single scan.",
  },
  {
    id: "social",
    label: "Social Media Link",
    icon: "solar:add-circle-broken",
    img: QrSocialFull,
    content:
      "Grow your audience effortlessly! Use a QR code to share your social media profiles in one scan—making it easy for people to follow, connect, and engage with your content.",
  },
  {
    id: "wifi",
    label: "Wifi",
    icon: "streamline:wifi",
    img: QrWifiFull,
    content:
      "Instant Wi-Fi access—no typing required! Use a QR code to let guests connect to your network effortlessly by scanning, making it perfect for homes, cafés, offices, and events.",
  },
];

export const ADDITIONAL_QR_TYPES: QRType[] = [
  {
    id: "app-link",
    label: "App Link",
    icon: "meteor-icons:link",
    img: QrAppLinkFull,
    content:
      "Make app downloads effortless! Use a QR code to instantly direct users to your app’s download page—no searching required. Perfect for boosting installs and engagement.",
  },
  {
    id: "feedback",
    label: "Feedback Request",
    icon: "hugeicons:bubble-chat-favourite",
    img: QrFeedbackFull,
    content:
      "Get valuable feedback in seconds! Use a QR code to collect customer insights instantly—helping you improve your business and enhance the customer experience.",
  },
];

export const QR_TYPES: QRType[] = [...DEFAULT_QR_TYPES, ...ADDITIONAL_QR_TYPES];
