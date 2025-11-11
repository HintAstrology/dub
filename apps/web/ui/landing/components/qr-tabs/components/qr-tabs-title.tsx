import { FC } from "react";
import { SectionTitle } from "../../section-title";

export const QrTabsTitle: FC = () => {
  return (
    <div className="mb-6 flex flex-col items-center justify-center gap-3 md:mb-12">
      <SectionTitle
        titleFirstPart="Create Your QR Code"
        // highlightedTitlePart="QR Code"
      />
      <p className="text-muted-foreground hidden max-w-4xl text-center text-base sm:block md:text-lg">
        Create your QR and unlock scan analytics with one platform.
      </p>
    </div>
  );
};
