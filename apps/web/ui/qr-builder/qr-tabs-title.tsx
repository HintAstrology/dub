import { FC } from "react";
import { SectionTitle } from "../landing/components/section-title";

export const QrTabsTitle: FC = () => {
  return (
    <div className="mb-6 flex flex-col items-center justify-center gap-3 md:mb-12">
      <SectionTitle
        titleFirstPart="Create Your"
        highlightedTitlePart="QR Code"
      />
      <p className="text-muted-foreground hidden max-w-4xl text-center text-base sm:block md:text-lg">
      Generate branded QR codes and track engagement in real time{" "}
      </p>
    </div>
  );
};
