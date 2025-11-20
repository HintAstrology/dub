"use client";

import { Separator } from "@/components/ui/separator";
import { Icon } from "@iconify/react";
import { FC } from "react";
import { SectionTitle } from "../section-title.tsx";
import { GET_QR_FEATURES } from "./config.ts";

interface GetQRFeaturesCardsSectionProps {
  initialTab?: string;
}

export const GetQRFeaturesCardsSection: FC<GetQRFeaturesCardsSectionProps> = () => {
  return (
    <section id="features" className="relative overflow-hidden py-6 lg:py-14">
      {/* Background gradient effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="bg-primary/5 absolute left-1/4 top-0 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-secondary/5 absolute bottom-0 right-1/4 h-96 w-96 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-12 flex flex-col items-center justify-center gap-3">
          <SectionTitle
            titleFirstPart="More Than Just a QR Code Generator"
          />
        </div>

        {/* Cards Grid - vertical on mobile, horizontal on desktop */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {GET_QR_FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-white group relative overflow-hidden rounded-xl p-6 shadow transition-all duration-300 hover:shadow-md"
            >
              <div className="flex flex-col gap-4">
                {/* Icon */}
                <div className="text-primary">
                  <Icon icon={feature.icon} className="size-12" />
                </div>

                {/* Title */}
                <h3 className="text-foreground text-lg font-semibold">
                  {feature.title}
                </h3>

                {/* Content */}
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Separator className="my-8 sm:my-12" />
    </section>
  );
};
