import { cn } from "@dub/utils";
import { Icon } from "@iconify/react";
import { FC } from "react";

interface QrTypeIconProps {
  icon: string;
  idx: number;
  isActive: boolean;
  className?: string;
}

const ICON_COLORS = [
  "text-blue-500",
  "text-orange-500",
  "text-green-500",
  "text-purple-500",
  "text-yellow-500",
  "text-red-500",
];

export const QrTypeIcon: FC<QrTypeIconProps> = ({
  icon,
  idx,
  isActive,
  className,
}) => {
  return (
    <span
      className={cn("inline-block", className)}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
      }}
    >
      <Icon
        icon={icon}
        className={cn(
          "transition-colors w-full h-full",
          isActive ? "text-secondary" : ICON_COLORS[idx % ICON_COLORS.length],
          className,
        )}
      />
    </span>
  );
};
