import Image from "next/image";
import { FC, useEffect, useState } from "react";
import ImageDemoPlaceholder from "./placeholders/video-demo-placeholder.webp";

interface IQRCodeDemoVideoProps {
  filesVideo?: File[] | string;
}

export const QRCodeDemoVideo: FC<IQRCodeDemoVideoProps> = ({ filesVideo }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const generateVideoPreview = (videoSrc: string, cleanup?: () => void) => {
    const video = document.createElement("video");
    video.src = videoSrc;
    video.crossOrigin = "anonymous";
    video.currentTime = 1;

    const canvas = document.createElement("canvas");

    video.addEventListener("loadeddata", () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob);
          setPreviewUrl(imageUrl);
        }
      });
    });

    return cleanup;
  };

  useEffect(() => {
    if (typeof filesVideo === "string") {
      generateVideoPreview(filesVideo);
      return;
    }

    const file = Array.isArray(filesVideo) ? filesVideo[0] : undefined;
    if (!file || !file.type.startsWith("video/")) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    return generateVideoPreview(url, () => URL.revokeObjectURL(url));
  }, [filesVideo]);

  const imageToShow = previewUrl || ImageDemoPlaceholder;

  const hasContent = typeof filesVideo === "string";
  const displayText = hasContent ? "Your Video" : "Place for Your Video";

  return (
    <svg
      width="270"
      height="352"
      viewBox="0 0 270 352"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <path
        d="M0 22C0 9.84974 9.84974 0 22 0H248C260.15 0 270 9.84974 270 22V352H0V22Z"
        fill="white"
      />
      <path
        d="M0 21.9718C0 9.83713 9.83712 0 21.9718 0H248.028C260.163 0 270 9.83712 270 21.9718V207H0V21.9718Z"
        fill="#11AB7C"
      />
      <text
        x="135"
        y="35"
        fill="#FFFFFF"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontFamily: "Inter, sans-serif",
          fontStyle: "normal",
          fontWeight: 600,
          fontSize: "16px",
          lineHeight: "20px",
          letterSpacing: "0.02em",
        }}
      >
        {displayText}
      </text>
      <g>
        <path
          d="M15 75C15 67.268 21.268 61 29 61H241C248.732 61 255 67.268 255 75V311H15V75Z"
          fill="white"
          shapeRendering="crispEdges"
        />
        <g clipPath="url(#clip0_1608_3245)">
          <foreignObject x="30" y="80" width="212" height="140">
            <Image
              src={imageToShow}
              width={212}
              height={140}
              alt="Preview"
              style={{
                objectFit: "contain",
                borderRadius: 12,
              }}
            />
          </foreignObject>
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M135 164C138.152 164 141.273 163.379 144.184 162.173C147.096 160.967 149.742 159.199 151.971 156.971C154.199 154.742 155.967 152.096 157.173 149.184C158.379 146.273 159 143.152 159 140C159 136.848 158.379 133.727 157.173 130.816C155.967 127.904 154.199 125.258 151.971 123.029C149.742 120.801 147.096 119.033 144.184 117.827C141.273 116.621 138.152 116 135 116C128.635 116 122.53 118.529 118.029 123.029C113.529 127.53 111 133.635 111 140C111 146.365 113.529 152.47 118.029 156.971C122.53 161.471 128.635 164 135 164ZM131.755 129.307L146.805 137.669C147.221 137.9 147.567 138.238 147.808 138.648C148.049 139.058 148.176 139.525 148.176 140C148.176 140.475 148.049 140.942 147.808 141.352C147.567 141.762 147.221 142.1 146.805 142.331L131.755 150.693C131.267 150.964 130.718 151.103 130.16 151.096C129.603 151.089 129.057 150.937 128.576 150.654C128.096 150.371 127.698 149.967 127.421 149.483C127.145 148.999 126.999 148.451 127 147.893V132.107C126.999 131.549 127.145 131.001 127.421 130.517C127.698 130.033 128.096 129.629 128.576 129.346C129.057 129.063 129.603 128.911 130.16 128.904C130.718 128.897 131.267 129.036 131.755 129.307Z"
            fill="white"
          />
        </g>
      </g>
    </svg>
  );
};
