"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/ui/landing/components/section-title.tsx";
import { cn } from "@dub/utils";
import { CheckIcon } from "lucide-react";
import { FC } from "react";
import { PRICING_PLANS } from "./config.ts";

interface IPricingSectionProps {
  handleScrollButtonClick: (type: "1" | "2" | "3") => void;
}

const extractPrice = (planText: string): string => {
  const match = planText.match(/\$(\d+\.?\d*)/);
  return match ? match[1] : "0";
};

export const PricingSection: FC<IPricingSectionProps> = ({
  handleScrollButtonClick,
}) => {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 ">
      <div className="mb-12 flex flex-col items-center justify-center gap-3">
        <SectionTitle
          titleFirstPart={"Start 7-Day Trial Today, Upgrade when You Need"}
          // highlightedTitlePart={"You Need"}
          className="lg:!leading-[52px]"
        />
        <p className="text-muted-foreground text-center max-w-4xl text-base md:text-lg">
          Unlock advanced features and evaluate performance risk-free.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:items-end">
        {PRICING_PLANS.map((plan, index) => (
          <div key={index} className="h-full w-full transition-transform duration-300 hover:-translate-y-2">
            <Card
              className={cn(
                "relative h-full w-full overflow-hidden pt-3",
                plan.title === "7-Day Trial"
                  ? "border-primary border-2 shadow"
                  : "border-none"
              )}
            >
              <CardContent className="flex h-full flex-col gap-6">
                <div>
                  <div className="mb-4">
                    <h3 className="text-card-foreground text-2xl font-semibold">
                      {plan.title}
                    </h3>
                  </div>

                  <div className="mb-2 flex items-end gap-1">
                    <span className="text-muted-foreground text-lg">$</span>
                    <span className="text-card-foreground text-5xl font-bold leading-none">
                      {extractPrice(plan.plan)}
                    </span>
                    <span className="text-muted-foreground pb-1 text-lg">
                      /{plan.plan.split("/")[1]}
                    </span>
                  </div>
                  <Badge 
                  className={cn(
                    "pointer-events-none mt-3 inline-block w-fit rounded-full border px-3 py-1 text-xs font-semibold",
                    plan.title === "7-Day Trial"
                      ? "bg-primary hover:bg-primary/20" 
                      : "bg-white text-primary border-primary hover:bg-white"
                  )}>
                    {plan.badge}
                  </Badge>
                </div>

                <div className="flex-grow space-y-3">
                  <h4 className="text-card-foreground mb-5 text-lg font-semibold">
                    What's included:
                  </h4>
                  {plan.planFeatures.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <CheckIcon className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                      <span className="text-muted-foreground pb-1 text-lg">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  {plan.withButton ? (
                    <Button
                      className="bg-secondary hover:bg-secondary/90 w-full text-white"
                      size="lg"
                      onClick={() => handleScrollButtonClick("3")}
                    >
                      {plan.title === "7-Day Trial" ? "Start Trial" : "Get Started"}
                    </Button>
                  ) : (
                    <div className="h-10" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
};
