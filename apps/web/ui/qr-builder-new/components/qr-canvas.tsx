import { cn } from "@dub/utils";
import { forwardRef, useMemo } from "react";

interface QRCanvasProps {
  svgString: string;
  width?: number;
  height?: number;
  className?: string;
}

export const QRCanvas = forwardRef<HTMLDivElement, QRCanvasProps>(
  ({ svgString, width = 300, height = 300, className }, ref) => {
    // Modify SVG string to include custom width/height
    const modifiedSvgString = useMemo(() => {
      if (!svgString) return "";

      // Parse and modify the SVG to set custom dimensions
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, "image/svg+xml");
      const svg = doc.querySelector("svg");

      if (svg) {
        svg.setAttribute("width", width.toString());
        svg.setAttribute("height", height.toString());
        return new XMLSerializer().serializeToString(svg);
      }

      return svgString;
    }, [svgString, width, height]);

    return (
      <div
        ref={ref}
        style={{ width: `${width}px`, height: `${height}px` }}
        className={cn(
          "border-border-100 flex items-center justify-center rounded-lg border bg-white p-3 shadow-lg",
          className,
        )}
        dangerouslySetInnerHTML={{ __html: modifiedSvgString }}
      />
    );
  },
);

QRCanvas.displayName = "QRCanvas";
