"use client";

import { cn } from "@dub/utils";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { PropsWithChildren, ReactNode, WheelEventHandler } from "react";
import { Drawer } from "vaul";
import { useMediaQuery } from "./hooks";

export type PopoverProps = PropsWithChildren<{
  content: ReactNode | string;
  align?: "center" | "start" | "end";
  side?: "bottom" | "top" | "left" | "right";
  openPopover: boolean;
  setOpenPopover: (open: boolean) => void;
  mobileOnly?: boolean;
  popoverContentClassName?: string;
  onOpenAutoFocus?: PopoverPrimitive.PopoverContentProps["onOpenAutoFocus"];
  collisionBoundary?: Element | Element[];
  sticky?: "partial" | "always";
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onWheel?: WheelEventHandler;
  disableDrawer?: boolean;
}>;

export function Popover({
  children,
  content,
  align = "center",
  side = "bottom",
  openPopover,
  setOpenPopover,
  mobileOnly,
  popoverContentClassName,
  onOpenAutoFocus,
  collisionBoundary,
  sticky,
  onEscapeKeyDown,
  onWheel,
  disableDrawer = false,
}: PopoverProps) {
  const { isMobile } = useMediaQuery();

  if (!disableDrawer && (mobileOnly || isMobile)) {
    return (
      <Drawer.Root open={openPopover} onOpenChange={setOpenPopover}>
        <Drawer.Trigger className="sm:hidden" asChild>
          {children}
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-neutral-100 bg-opacity-10 backdrop-blur" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-50 mt-24 rounded-t-[10px] border-t border-neutral-200/20 bg-white"
            onEscapeKeyDown={onEscapeKeyDown}
            onPointerDownOutside={(e) => {
              // Prevent dismissal when clicking inside a toast
              if (
                e.target instanceof Element &&
                e.target.closest("[data-sonner-toast]")
              ) {
                e.preventDefault();
              }
            }}
          >
            <div className="sticky top-0 z-20 flex w-full items-center justify-center rounded-t-[10px] bg-inherit">
              <div className="my-3 h-1 w-12 rounded-full bg-neutral-300" />
            </div>
            <div className="flex min-h-[150px] w-full items-center justify-center overflow-hidden bg-white pb-8 align-middle shadow-xl">
              {content}
            </div>
          </Drawer.Content>
          <Drawer.Overlay />
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <PopoverPrimitive.Root open={openPopover} onOpenChange={setOpenPopover}>
      <PopoverPrimitive.Trigger className="sm:inline-flex" asChild>
        {children}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          sideOffset={8}
          align={align}
          side={side}
          className={cn(
            "animate-slide-up-fade z-50 items-center rounded-lg border border-neutral-200/20 bg-white drop-shadow-lg sm:block",
            popoverContentClassName,
          )}
          sticky={sticky}
          collisionBoundary={collisionBoundary}
          onOpenAutoFocus={onOpenAutoFocus}
          onEscapeKeyDown={onEscapeKeyDown}
          onWheel={onWheel}
        >
          {content}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
