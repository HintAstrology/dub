"use client";

import { cn } from "@dub/utils";
import { ArrowRight } from "lucide-react";
import { FC } from "react";
import { LINKED_QR_TYPES, QR_TYPES } from "../constants/get-qr-config.ts";
import { EQRType } from "../types/qr-type.ts";
import { QrTypeIcon } from "./qr-type-icon";

interface QrTypeSelectionProps {
  selectedQRType: EQRType | null;
  onSelect: (type: EQRType) => void;
  onHover: (type: EQRType | null) => void;
}

export const QrTypeSelection: FC<QrTypeSelectionProps> = ({
  selectedQRType,
  onSelect,
  onHover,
}) => {
  const filteredQrTypes = QR_TYPES.filter(
    (qrType) =>
      !LINKED_QR_TYPES.includes(qrType.id) || qrType.id === EQRType.WEBSITE,
  );

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-3 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {filteredQrTypes.map((type, idx) => {
        const isSelected = selectedQRType === type.id;

        return (
          <div
            key={type.id}
            className={cn(
              "qr-type-card group relative cursor-pointer bg-[#ffffff] overflow-hidden rounded-xl transition-all duration-300 ease-in-out",
              "w-full border-2 border-transparent shadow",
              "ring-1 ring-secondary hover:ring-2 hover:ring-secondary",
              // isSelected && "border-pr",
            )}
            onClick={() => onSelect(type.id)}
            onMouseEnter={() => onHover(type.id)}
            onMouseLeave={() => onHover(null)}
          >
            {/* Animated gradient background */}
            {/* <div className="from-background to-muted/30 absolute inset-0 z-0 bg-gradient-to-br" /> */}
            {/* Grid pattern overlay */}
            {/* <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" /> */}

            {/* Blob effect */}
            {/* <div className="blob bg-secondary absolute left-0 top-0 z-[1] h-[150px] w-[150px] rounded-full opacity-0 blur-2xl transition-all duration-300 ease-in-out" /> */}
            {/* <div className="fake-blob absolute left-0 top-0 z-[1] h-40 w-40 rounded-full [display:hidden]" /> */}

            {/* Mobile Layout */}
            <div className="relative z-10 flex items-center gap-3 p-3 md:hidden">
              <QrTypeIcon
                icon={type.icon}
                idx={idx}
                isActive={isSelected}
                className="text-primary size-8 shrink-0"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h3 className="text-base font-semibold text-black">
                  {type.label}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {type.info}
                </p>
              </div>
              <ArrowRight className="text-secondary size-5 shrink-0 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-[1.8]" />
            </div>

            {/* Desktop Layout */}
            <div className="relative z-10 hidden items-center gap-4 p-8 md:flex">
              <div className="flex flex-1 flex-col items-start gap-4">
                <QrTypeIcon
                  icon={type.icon}
                  idx={idx}
                  isActive={isSelected}
                  className="text-primary size-7"
                />
                <h3 className="text-2xl font-semibold text-black">
                  {type.label}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {type.info}
                </p>
              </div>
              <ArrowRight className="text-secondary size-7 shrink-0 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-[1.8]" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
