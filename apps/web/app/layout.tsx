import { anton, caveat, inter } from "@/styles/fonts";
import "@/styles/globals.css";
import { cn, constructMetadata } from "@dub/utils";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { AnalyticScriptsComponent } from "core/integration/analytic/components/analytic-scripts";
import RootProviders from "./providers";
import { getUserCookieService } from "core/services/cookie/user-session.service";

export const metadata = constructMetadata();

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getUserCookieService();

  return (
    <html lang="en" className={cn(inter.className, anton.variable, caveat.variable)}>
      <AnalyticScriptsComponent />
      <body>
        <Theme>
          <RootProviders>{children}</RootProviders>
        </Theme>
      </body>
    </html>
  );
}
