import { cn } from "@dub/utils";
import { StaticImageData } from "next/image";
import { FC } from "react";
import { IStyleOption } from "../../types/customization";
import { StyleButton } from "./style-button";

interface StylePickerProps {
  label: string;
  styleOptions: IStyleOption[];
  value: string; // This should be the ID, not the type
  onSelect: (id: string, icon?: StaticImageData) => void;
  stylePickerWrapperClassName?: string;
  optionsWrapperClassName?: string;
  iconSize?: number;
  styleButtonClassName?: string;
  disabled?: boolean;
  applyBlackFilter?: boolean;
  gridMinWidth?: number; // Minimum width for grid items in px
}

export const StylePicker: FC<StylePickerProps> = ({
  label,
  styleOptions,
  value,
  onSelect,
  stylePickerWrapperClassName,
  optionsWrapperClassName,
  iconSize,
  styleButtonClassName,
  disabled = false,
  applyBlackFilter = false,
  gridMinWidth = 78,
}) => {
  return (
    <div className={cn("flex flex-col gap-2", stylePickerWrapperClassName)}>
      <label className="text-sm font-medium">{label}</label>
      <div className="dub-scrollbar md:max-h-[180px] md:overflow-y-auto">
        <div
          className={cn("grid place-items-center gap-3", optionsWrapperClassName)}
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(${gridMinWidth}px, 1fr))`,
          }}
        >
          {styleOptions.map((styleOption) => (
            <StyleButton
              key={styleOption.id}
              icon={styleOption.icon}
              selected={value === styleOption.id}
              onClick={() => {
                if (!disabled) {
                  onSelect(styleOption.id, styleOption.icon);
                }
              }}
              iconSize={iconSize}
              className={cn("shrink-0", styleButtonClassName)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
