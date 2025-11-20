import { Button, Input } from "@dub/ui";
import { cn } from "@dub/utils";
import { Flex, Text } from "@radix-ui/themes";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { FC, FormEvent, useCallback, useEffect, useState } from "react";
import { BLACK_COLOR, WHITE_COLOR } from "../../constants/customization/colors";
import {
  FRAMES,
  FRAME_TEXT,
  isDefaultTextColor,
} from "../../constants/customization/frames";
import { isBlackHex, isValidHex } from "../../helpers/color-validation";
import { IFrameData, IStyleData } from "../../types/customization";
import { ColorPickerInput } from "./color-picker";
import { ColorsSettings } from "./colors-settings";

interface StyleColorsProps {
  frameSelected: boolean;
  frameData: IFrameData;
  styleData: IStyleData;
  onFrameChange: (frameData: IFrameData) => void;
  onStyleChange: (styleData: IStyleData) => void;
  disabled?: boolean;
}

const animationVariants = {
  open: {
    height: "auto",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40,
    },
  },
  closed: {
    height: 0,
    transition: {
      type: "tween",
      duration: 0.3,
      ease: "easeInOut",
    },
  },
};

const MAX_FRAME_TEXT_LENGTH = 10;

export const StyleColors: FC<StyleColorsProps> = ({
  frameData,
  onFrameChange,
  disabled,
  styleData,
  onStyleChange,
  frameSelected,
}) => {
  const [frameColor, setFrameColor] = useState<string>(
    frameData.color || BLACK_COLOR,
  );
  const [frameTextColor, setFrameTextColor] = useState<string | null>(
    frameData.textColor || null,
  );
  const [frameText, setFrameText] = useState<string>(
    frameData.text ?? FRAME_TEXT,
  );

  const selectedFrame = FRAMES.find((f) => f.id === frameData.id);
  const defaultTextColor = selectedFrame?.defaultTextColor || WHITE_COLOR;
  const currentFrameTextColor = frameTextColor || defaultTextColor;
  const isFrameSelected = frameData.id !== "frame-none";

  useEffect(() => {
    setFrameColor(frameData.color || BLACK_COLOR);
    if (frameData.textColor) {
      setFrameTextColor(frameData.textColor);
    }
    setFrameText(frameData.text ?? FRAME_TEXT);
  }, [frameData]);

  const handleFrameColorChange = useCallback(
    (color: string) => {
      setFrameColor(color);
      const valid = isValidHex(color);

      if (valid && isFrameSelected) {
        onFrameChange({
          ...frameData,
          color,
        });
      }
    },
    [setFrameColor, isFrameSelected, onFrameChange, frameData],
  );

  const handleFrameTextColorChange = useCallback(
    (color: string) => {
      setFrameTextColor(color);
      const valid = isValidHex(color);

      if (valid && isFrameSelected) {
        onFrameChange({
          ...frameData,
          textColor: color,
        });
      }
    },
    [setFrameTextColor, isFrameSelected, onFrameChange, frameData],
  );

  const handleFrameTextChange = useCallback(
    (text: string) => {
      const truncatedText = text.slice(0, MAX_FRAME_TEXT_LENGTH);
      setFrameText(truncatedText);

      if (isFrameSelected) {
        onFrameChange({
          ...frameData,
          text: truncatedText,
        });
      }
    },
    [setFrameText, isFrameSelected, onFrameChange, frameData],
  );

  return (
    <AnimatePresence>
      <motion.div
        className="flex w-full gap-4 flex-col"
        variants={animationVariants}
        initial="closed"
        animate="open"
        exit="closed"
      >
        <Flex direction="column" gap="2" className="grow">
          <Text as="p" className="text-sm font-medium">
            Text
          </Text>
          <Input
            type="text"
            className={cn(
              "border-border-500 focus:border-secondary h-11 w-full max-w-2xl rounded-md border p-3 text-base",
            )}
            placeholder="Frame Text"
            value={frameText}
            onChange={(e) => handleFrameTextChange(e.target.value)}
            onBeforeInput={(e: FormEvent<HTMLInputElement>) => {
              if (frameText.length >= MAX_FRAME_TEXT_LENGTH) {
                e.preventDefault();
              }
            }}
            maxLength={MAX_FRAME_TEXT_LENGTH}
            disabled={disabled}
          />
        </Flex>
        <Flex direction='row' gap='2' className="w-full">
          <Flex direction="row" gap="2" className="items-end text-sm w-full">
            <ColorPickerInput
              label="Text Color"
              value={currentFrameTextColor}
              onChange={handleFrameTextColorChange}
              disabled={disabled}
            />
            <AnimatePresence>
              {frameTextColor !== null &&
                !isDefaultTextColor(frameTextColor) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant="secondary"
                      className="border-border-500 h-11 max-w-11 p-3"
                      onClick={() =>
                        handleFrameTextColorChange(defaultTextColor)
                      }
                      icon={<RotateCcw className="text-neutral h-5 w-5" />}
                      disabled={disabled}
                    />
                  </motion.div>
                )}
            </AnimatePresence>
          </Flex>
          <Flex direction="row" gap="2" className="items-end text-sm w-full">
            <ColorPickerInput
              label="Frame color"
              value={frameColor}
              onChange={handleFrameColorChange}
              disabled={disabled}
            />
            <AnimatePresence>
              {!isBlackHex(frameColor) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="secondary"
                    className="border-border-500 h-11 max-w-11 p-3"
                    onClick={() => handleFrameColorChange(BLACK_COLOR)}
                    icon={<RotateCcw className="text-neutral h-5 w-5" />}
                    disabled={disabled}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Flex>
          <ColorsSettings
            styleData={styleData}
            onStyleChange={onStyleChange}
            frameSelected={frameSelected}
            disabled={disabled}
          />
        </Flex>
      </motion.div>
    </AnimatePresence>
  );
};
