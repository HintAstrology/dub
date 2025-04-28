import { cn } from "@dub/utils";
import { StaticImageData } from "next/image";
import { FC } from "react";
import StyleIcon from "./style-icon.tsx";

interface IStyleButtonProps {
  key: string;
  icon: StaticImageData;
  selected: boolean;
  onClick: () => void;
  iconSize?: number;
  className?: string;
}

export const StyleButton: FC<IStyleButtonProps> = ({
  key,
  icon,
  selected,
  onClick,
  iconSize = 40,
  className,
}) => {
  return (
    <button
      key={key}
      className={cn(
        "rounded-md border p-4 transition",
        selected
          ? "border-secondary bg-[#F5FAFF]"
          : "border-border-300 hover:border-secondary bg-white",
        className,
      )}
      onClick={onClick}
    >
      <StyleIcon src={icon} size={iconSize} />
    </button>
  );
};
