import { MaxWidthWrapper } from "@dub/ui";
import { cn } from "@dub/utils";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { PropsWithChildren, ReactNode } from "react";
import UserDropdown from "../sidebar/user-dropdown";
import { NavButton } from "./nav-button";

export function PageContent({
  title,
  titleBackButtonLink,
  titleControls,
  description,
  hideReferButton,
  className,
  contentWrapperClassName,
  children,
}: PropsWithChildren<{
  title?: ReactNode;
  titleBackButtonLink?: string;
  titleControls?: ReactNode;
  description?: ReactNode;
  hideReferButton?: boolean;
  className?: string;
  contentWrapperClassName?: string;
}>) {
  const hasTitle = title !== undefined;
  const hasDescription = description !== undefined;

  return (
    <div
      className={cn(
        "bg-neutral-100 md:bg-white size-full",
        (hasTitle || hasDescription) && "md:mt-6 md:py-3",
        className,
      )}
    >
   
   
      <div
        className={cn(
          "bg-white max-md:rounded-t-[16px]",
          contentWrapperClassName,
        )}
      >
        {hasDescription && (
          <MaxWidthWrapper>
            <p className="mb-3 mt-1 text-base text-neutral-500 md:hidden">
              {description}
            </p>
          </MaxWidthWrapper>
        )}
        {children}
      </div>
    </div>
  );
}
