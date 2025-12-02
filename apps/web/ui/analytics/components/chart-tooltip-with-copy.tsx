"use client";

import { CopyButton } from "@dub/ui";

interface ChartTooltipWithCopyProps {
  color: string;
  name: string;
  value?: string | number;
  percentage?: number;
  copyValue?: string;
  showCopy?: boolean;
  active?: boolean;
  copyTooltipText?: string;
}

export function ChartTooltipWithCopy({
  color,
  name,
  value,
  percentage,
  copyValue,
  showCopy = false,
  active = true,
  copyTooltipText,
}: ChartTooltipWithCopyProps) {

  // Truncate name if too long (max 25 characters)
  const displayName = name.length > 14 ? `${name.slice(0, 25)}...` : name;


  return (
    <div 
      className="rounded-md border border-neutral-200 bg-white p-2 shadow-lg max-w-[270px] pointer-events-none"
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
              className="h-4 w-4 "
              successMessage={copyTooltipText}
            />
        )}
      </div>
      {(value !== undefined || percentage !== undefined) && (
        <div className="text-xs text-neutral-500 mt-1 ml-4 truncate">
          {value !== undefined && percentage !== undefined
            ? `${value} Scans (${typeof percentage === 'number' ? percentage.toFixed(1) : percentage}%)`
            : value !== undefined
              ? `${value} Scans`
              : `${typeof percentage === 'number' ? percentage.toFixed(1) : percentage}%`}
        </div>
      )}
    </div>
  );
}

