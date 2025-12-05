import { cn } from "@dub/utils";
import { FC, useEffect, useState } from "react";
import { QR_DEMO_DEFAULTS } from "../../../constants/qr-type-inputs-placeholders";

interface QRCodeDemoVcardProps {
  firstName?: string;
  lastName?: string;
  phone?: string;
  smallPreview?: boolean;
}

export const QRCodeDemoVcard: FC<QRCodeDemoVcardProps> = ({
  firstName,
  lastName,
  phone,
  smallPreview = false,
}) => {
  const [currentFirstName, setCurrentFirstName] = useState<string>(
    firstName || QR_DEMO_DEFAULTS.VCARD_FIRST_NAME,
  );
  const [currentLastName, setCurrentLastName] = useState<string>(
    lastName || QR_DEMO_DEFAULTS.VCARD_LAST_NAME,
  );
  const [currentPhone, setCurrentPhone] = useState<string>(
    phone || QR_DEMO_DEFAULTS.VCARD_PHONE,
  );

  useEffect(() => {
    setCurrentFirstName(firstName || QR_DEMO_DEFAULTS.VCARD_FIRST_NAME);
    setCurrentLastName(lastName || QR_DEMO_DEFAULTS.VCARD_LAST_NAME);
    setCurrentPhone(phone || QR_DEMO_DEFAULTS.VCARD_PHONE);
  }, [firstName, lastName, phone]);

  const fullName = `${currentFirstName} ${currentLastName}`.trim();
  const initials = `${currentFirstName.charAt(0)}${currentLastName.charAt(0)}`.toUpperCase();

  return (
    <svg
      width="270"
      height="352"
      viewBox="0 0 270 352"
      className={cn(
        "shadow-lg [&_path.primary-fill]:fill-[#5B8DEF] md:[&_path.primary-fill]:fill-[#2563EB] [&_path.primary-stroke]:stroke-[#5B8DEF] md:[&_path.primary-stroke]:stroke-[#2563EB]",
        {
          "h-[180px] w-[138px] lg:h-[209px] lg:w-[158px]": smallPreview,
        },
      )}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >

      <path
        d="M0 22C0 9.84974 9.84974 0 22 0H248C260.15 0 270 9.84974 270 22V352H0V22Z"
        fill="white"
      />
      <path
        className="primary-fill"
        d="M0 21.9718C0 9.83713 9.83712 0 21.9718 0H258C264.627 0 270 5.37258 270 12V160H0V21.9718Z"
        fill="#2563EB"
      />
      <g filter="url(#filter0_d_vcard)">
        <path
          d="M15 39C15 31.268 21.268 25 29 25H241C248.732 25 255 31.268 255 39V319H15V39Z"
          fill="white"
          shapeRendering="crispEdges"
        />

        <circle cx="135" cy="100" r="45" fill="#E8F0FE" />
        <foreignObject x="90" y="55" width="90" height="90">
          <div className="flex h-full w-full items-center justify-center font-sans text-2xl font-bold text-blue-600">
            {initials}
          </div>
        </foreignObject>

        <foreignObject x="29" y="160" width="212" height="30">
          <div className="flex h-full w-full items-center justify-center truncate font-sans text-lg font-bold text-neutral-800">
            {fullName}
          </div>
        </foreignObject>

        {currentPhone &&
        <foreignObject x="29" y="193" width="212" height="24">
          <div className="flex h-full w-full items-center justify-center truncate font-sans text-sm font-medium text-neutral-600">
            {currentPhone}
          </div>
        </foreignObject>
        }

        <rect
          x="55"
          y="250"
          width="160"
          height="44"
          rx="22"
          className="primary-fill"
          fill="#2563EB"
        />
        <foreignObject x="55" y="250" width="160" height="44">
          <div className="flex h-full w-full items-center justify-center font-sans text-sm font-semibold text-white">
            Save Contact
          </div>
        </foreignObject>
      </g>

      <defs>
        <filter
          id="filter0_d_vcard"
          x="4"
          y="13"
          width="264"
          height="318"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="2"
            operator="dilate"
            in="SourceAlpha"
            result="effect1_dropShadow_vcard"
          />
          <feOffset dx="1" />
          <feGaussianBlur stdDeviation="5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_vcard"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_vcard"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};

