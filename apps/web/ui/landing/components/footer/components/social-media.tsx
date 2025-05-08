import Facebook from "@/ui/shared/icons/social-media/facebook.tsx";
import Instagram from "@/ui/shared/icons/social-media/instagram.tsx";
import Twitter from "@/ui/shared/icons/social-media/twitter.tsx";
import Link from "next/link";

const socialMediaLinks = [
  {
    href: "https://x.com/dubdotsh",
    icon: Twitter,
    label: "Twitter",
  },
  {
    href: "https://www.instagram.com/dubdotsh",
    icon: Instagram,
    label: "Instagram",
  },
  {
    href: "https://www.facebook.com/dubdotsh",
    icon: Facebook,
    label: "Facebook",
  },
];

export const SocialMedia = () => (
  <ul className="flex gap-4">
    {socialMediaLinks.map(({ href, icon: Icon, label }) => (
      <li key={label}>
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block transition-colors hover:text-gray-100"
          aria-label={`Follow us on ${label}`}
        >
          <Icon className="h-6 w-6" />
        </Link>
      </li>
    ))}
  </ul>
);
