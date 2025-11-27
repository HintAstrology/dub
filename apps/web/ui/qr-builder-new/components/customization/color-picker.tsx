import {
  ColorPicker,
  ColorPickerHue,
  ColorPickerSelection,
} from "@/components/ui/shadcn-io/color-picker";
import { Button } from "@dub/ui";
import { cn } from "@dub/utils";
import { Flex, Text } from "@radix-ui/themes";
import Color from "color";
import { Pipette } from "lucide-react";
import { FC, useEffect, useRef, useState } from "react";
import { isValidHex, isWhiteHex } from "../../helpers/color-validation";

interface ColorPickerInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

interface IPaletteColor {
  id: number;
  color: string;
}

const paletteColors: IPaletteColor[] = [
  { id: 1, color: "#000000" },
  { id: 2, color: "#5f5f5f" },
  { id: 3, color: "#9a9a9a" },
  { id: 4, color: "#cbcbcb" },
  { id: 5, color: "#e1e1e1" },
  { id: 6, color: "#ffffff" },
  { id: 7, color: "#ff0c0b" },
  { id: 8, color: "#ff8a1d" },
  { id: 9, color: "#2ca676" },
  { id: 10, color: "#006ef9" },
  { id: 11, color: "#7f25ff" },
  { id: 12, color: "#ff21a0" },
  { id: 13, color: "#ff5f5f" },
  { id: 14, color: "#ffb56e" },
  { id: 15, color: "#4fd2a0" },
  { id: 16, color: "#4c9bff" },
  { id: 17, color: "#b078ff" },
  { id: 18, color: "#ff73c2" },
  { id: 19, color: "#ffb1b1" },
  { id: 20, color: "#ffdfc0" },
  { id: 21, color: "#92e3c3" },
  { id: 22, color: "#9dc8ff" },
  { id: 23, color: "#decaff" },
  { id: 24, color: "#fec5e6" },
  { id: 25, color: "#ffd8d9" },
  { id: 26, color: "#fff2e9" },
  { id: 27, color: "#b1ebd5" },
  { id: 28, color: "#c5dffe" },
  { id: 29, color: "#f8f2ff" },
  { id: 30, color: "#ffeef8" },
  { id: 31, color: "#ff9fa0" },
  { id: 32, color: "#9a6464" },
  { id: 33, color: "#583c3b" },
  { id: 34, color: "#931c1d" },
  { id: 35, color: "#1d4743" },
  { id: 36, color: "#e2fea2" },
  { id: 37, color: "#fedab8" },
  { id: 38, color: "#416456" },
  { id: 39, color: "#57c2fe" },
  { id: 40, color: "#bf91fe" },
  { id: 41, color: "#41cb8b" },
  { id: 42, color: "#d66566" },
  { id: 43, color: "#903fb8" },
  { id: 44, color: "#ff8e56" },
  { id: 45, color: "#b8edfe" },
  { id: 46, color: "#9d837a" },
  { id: 47, color: "#6d7d86" },
  { id: 48, color: "#edbdbd" },
  { id: 49, color: "#e76eb3" },
  { id: 50, color: "#5e9be8" },
  { id: 51, color: "#ffbd9c" },
  { id: 52, color: "#4f6474" },
  { id: 53, color: "#8798a5" },
  { id: 54, color: "#c1d0db" },
];

export const ColorPickerInput: FC<ColorPickerInputProps> = ({
  label,
  value,
  onChange,
  disabled = false,
}) => {
  const [showBorder, setShowBorder] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [showPaletteDropdown, setShowPaletteDropdown] = useState(false);
  const [selectedTab, setSelectedTab] = useState("palette");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleEyedropper = async () => {
    try {
      // @ts-ignore - EyeDropper is not yet in TypeScript definitions
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      onChange(result.sRGBHex);
      setShowPaletteDropdown(false);
    } catch (error) {
      console.error("Eyedropper error:", error);
    }
  };

  useEffect(() => {
    setShowBorder(isWhiteHex(value));
    setIsValid(isValidHex(value));
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowPaletteDropdown(false);
      }
    };

    if (showPaletteDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPaletteDropdown]);

  return (
    <Flex
      direction="column"
      align="start"
      justify="center"
      gap="2"
      className="w-full"
    >
      <label className="font-medium">{label}</label>
      <div
        className={cn(
          "bg-white border-border-500 relative flex h-11 w-full cursor-pointer items-center justify-between rounded-md border p-3 md:min-w-[130px]",
          {
            "border-red-600": !isValid,
            "!bg-border-200 cursor-not-allowed": disabled,
          },
        )}
      >
        <Text
          as="span"
          className={cn("text-sm", {
            "text-red-600": !isValid,
            "text-neutral-400": disabled,
          })}
        >
          {value}
        </Text>
        <div className="pointer-events-none h-5 w-5 flex-shrink-0">
          <div
            className={cn("h-full w-full rounded", {
              "border-border-500 border": showBorder,
            })}
            style={{ backgroundColor: value }}
          />
        </div>
        <button
          className="absolute inset-0 h-full w-full bg-red-500 opacity-0"
          onClick={() => setShowPaletteDropdown(!showPaletteDropdown)}
        />
        {showPaletteDropdown && (
          <div
            ref={dropdownRef}
            className="border-border-500 absolute bottom-full left-0 z-50 mb-2 flex w-fit flex-col gap-4 rounded-lg border bg-white p-4 shadow-lg"
          >
            <div className="flex w-full gap-2">
              <Button
                text="Palette"
                onClick={() => setSelectedTab("palette")}
                variant="secondary"
                className={cn("rounded-full", {
                  "border-secondary": selectedTab === "palette",
                })}
              />
              <Button
                text="Solid"
                onClick={() => setSelectedTab("solid")}
                variant="secondary"
                className={cn("rounded-full", {
                  "border-secondary": selectedTab === "solid",
                })}
              />
              {"EyeDropper" in window && (
                <Button
                  icon={<Pipette className="w-5 text-black" />}
                  variant="secondary"
                  className="w-10 min-w-10 rounded-full p-0"
                  onClick={handleEyedropper}
                />
              )}
            </div>

            {selectedTab === "palette" ? (
              <div className="grid w-max grid-cols-9 gap-[4px]">
                {paletteColors.map((color) => (
                  <button
                    key={color.id}
                    style={{ backgroundColor: color.color }}
                    onClick={() => onChange(color.color)}
                    className="h-7 w-7 rounded transition-transform hover:scale-110"
                  />
                ))}
              </div>
            ) : (
              <ColorPicker
                onChange={(color) => {
                  const hexColor = Color.rgb(color).hex();
                  onChange(hexColor);
                }}
                className="w-[284px] max-w-sm shadow-sm"
              >
                <ColorPickerSelection className="h-[156px] w-[284px]" />
                <ColorPickerHue />
              </ColorPicker>
            )}
          </div>
        )}
      </div>
    </Flex>
  );
};
