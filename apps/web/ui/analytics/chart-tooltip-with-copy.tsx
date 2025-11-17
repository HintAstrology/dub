"use client";

import { CopyButton } from "@dub/ui";
import { ReactNode, useEffect, useState, useRef } from "react";

interface ChartTooltipWithCopyProps {
  color: string;
  name: string;
  value?: string | number;
  percentage?: number;
  copyValue?: string;
  showCopy?: boolean;
  active?: boolean;
}

export function ChartTooltipWithCopy({
  color,
  name,
  value,
  percentage,
  copyValue,
  showCopy = false,
  active = true,
}: ChartTooltipWithCopyProps) {
  const [isVisible, setIsVisible] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringRef = useRef(false);

  useEffect(() => {
    if (active) {
      // Clear any pending hide timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      setIsVisible(true);
      isHoveringRef.current = false;
    } else {
      // When active becomes false, wait 2 seconds before hiding (unless hovering)
      if (!isHoveringRef.current) {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
        hideTimeoutRef.current = setTimeout(() => {
          if (!isHoveringRef.current) {
            setIsVisible(false);
          }
        }, 2000);
      }
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [active]);

  // Don't render if not active and not visible
  if (!active && !isVisible) {
    return null;
  }

  // Truncate name if too long (max 25 characters)
  const displayName = name.length > 14 ? `${name.slice(0, 25)}...` : name;

  return (
    <div 
      className="rounded-md border border-neutral-200 bg-white p-1 z-[9999] max-w-[270px]"
      style={{ pointerEvents: 'auto', zIndex: 9999 }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => {
        isHoveringRef.current = true;
        // Cancel hide timeout when hovering over tooltip
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
      }}
      onMouseLeave={() => {
        isHoveringRef.current = false;
        // Start hide timeout when mouse leaves tooltip
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
        hideTimeoutRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <span 
          className="text-sm font-medium text-neutral-900 truncate flex-1" 
          title={name}
        >
          {displayName}
        </span>
        {showCopy && copyValue && (
          <CopyButton
            value={copyValue}
            variant="neutral"
            className="h-5 w-5 p-0.5 shrink-0 cursor-pointer"
            style={{ cursor: 'pointer' }}
          />
        )}
      </div>
      {(value !== undefined || percentage !== undefined) && (
        <div className="text-xs text-neutral-500 mt-1 ml-4 truncate">
          {value !== undefined && percentage !== undefined
            ? `${value} (${percentage}%)`
            : value !== undefined
              ? `${value}`
              : `${percentage}%`}
        </div>
      )}
    </div>
  );
}

