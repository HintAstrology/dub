"use client";

import Facebook from "@/ui/shared/icons/social-media/facebook.tsx";
import Instagram from "@/ui/shared/icons/social-media/instagram.tsx";
import { trackClientEvents } from "core/integration/analytic";
import { EAnalyticEvents } from "core/integration/analytic/interfaces/analytic.interface";
import Link from "next/link";
import { FC } from "react";

const socialMediaLinks = [
  {
    href: "https://www.instagram.com/getqr_com",
    icon: Instagram,
    label: "Instagram",
  },
  {
    href: "https://www.facebook.com/GetQRcom",
    icon: Facebook,
    label: "Facebook",
  },
];

interface SocialMediaProps {
  sessionId: string;
}

export const SocialMedia: FC<SocialMediaProps> = ({ sessionId }) => {
  const handleSocialClick = (platform: string) => {
    trackClientEvents({
      event: EAnalyticEvents.PAGE_CLICKED,
      params: {
        page_name: "landing",
        content_value: platform,
        content_group: "footer",
        event_category: "nonAuthorized",
      },
      sessionId,
    });
  };

  return (
    <ul className="text-muted-foreground flex gap-2">
      {socialMediaLinks.map(({ href, icon: Icon, label }) => (
        <li key={label}>
          <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleSocialClick(label.toLowerCase())}
            className="text-grey"
            aria-label={`Follow us on ${label}`}
          >
            <Icon className="h-5 w-5 text-grey" />
          </Link>
        </li>
      ))}
    </ul>
  );
};
