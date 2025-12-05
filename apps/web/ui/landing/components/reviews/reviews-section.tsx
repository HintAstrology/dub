"use client";

import { useReviews } from "@/hooks/use-reviews";
import { SectionTitle } from "@/ui/landing/components/section-title.tsx";
import ReviewsIo from "./reviews-io";

export const ReviewsSection = () => {

  return (
    <section id="reviews" className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
      <div className="mb-12 flex flex-col items-center justify-center gap-6 sm:mb-16 lg:gap-10">
        <SectionTitle
          titleFirstPart={"Why Our Customers Choose GetQR"}
          // highlightedTitlePart={"Choose GetQR"}
        />
      </div>
      <ReviewsIo />
    </section>
  );
};
