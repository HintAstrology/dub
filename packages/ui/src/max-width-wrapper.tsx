import { cn } from "@dub/utils";
import { ReactNode } from "react";

export function MaxWidthWrapper({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("mx-auto w-full px-3 md:px-8", className)}
    >
      {children}
    </div>
  );
}
