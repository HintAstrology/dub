"use client";

import HelpPhone from "@/ui/shared/icons/customer-support.tsx";
import { trackClientEvents } from "core/integration/analytic";
import { EAnalyticEvents } from "core/integration/analytic/interfaces/analytic.interface.ts";
import { cn } from "@dub/utils";
import Link from "next/link";
import { FC } from "react";

interface ICustomerSupportProps {
  sessionId: string;
  homePageDemo?: boolean;
}

export const CustomerSupport: FC<Readonly<ICustomerSupportProps>> = ({
  sessionId,
  homePageDemo = false,
}) => {
  const onClickHandler = (contentValue: string) => {
    trackClientEvents({
      event: EAnalyticEvents.PAGE_CLICKED,
      params: {
        page_name: "landing",
        content_value: contentValue,
        event_category: "nonAuthorized",
      },
      sessionId,
    });
  };

  return (
    <Link
      className={cn(
        "group inline-flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-all",
        homePageDemo
          ? "bg-white border border-gray-100 hover:border-primary hover:bg-primary/5"
          : "bg-primary/10 border-transparent text-primary hover:bg-primary/40"
      )}
      href="/help"
      target="_blank"
      onClick={() => onClickHandler("customer_support")}
    >
      {homePageDemo ? (
        <div className="bg-primary/10 group-hover:bg-primary/20 rounded-full p-2 transition-colors">
          <HelpPhone className="text-primary h-5 w-5" />
        </div>
      ) : (
        ""
      )}
      <div className="flex flex-col items-start">
       
          {homePageDemo ?( <span className="text-foreground font-semibold"> "Customer Support" </span>) : (<span className="text-primary font-semibold"> Get Support </span>)}
   
        {homePageDemo ? (
          <span className="text-muted-foreground text-xs">24/7/365</span>
        ) : (
          ""
        )}
      </div>
    </Link>
  );
};
