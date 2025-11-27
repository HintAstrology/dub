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
import { paletteColors } from "../../constants/customization/palettes";

interface ColorPickerInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

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
