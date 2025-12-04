"use client";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface VcardFormSectionProps {
  value: string;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  isOpen: boolean;
  children: ReactNode;
  contentClassName?: string;
}

export function VcardFormSection({
  value,
  icon: Icon,
  title,
  subtitle = "Fill the information",
  isOpen,
  children,
  contentClassName,
}: VcardFormSectionProps) {
  return (
    <AccordionItem
      value={value}
      className="rounded-[20px] border-none bg-[#fbfbfb] px-4"
    >
      <AccordionTrigger className="hover:no-underline [&>svg]:h-5 [&>svg]:w-5">
        <div className="flex w-full items-center gap-3 text-left">
          <div className="bg-primary/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg">
            <Icon className="text-primary h-5 w-5" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-foreground text-base font-medium">
              {title}
            </span>
            <span className="text-muted-foreground text-sm font-normal">
              {subtitle}
            </span>
          </div>
        </div>
      </AccordionTrigger>
      {isOpen && <Separator className="mb-3" />}
      <AccordionContent className={contentClassName ?? "space-y-4 pt-2"}>
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}

