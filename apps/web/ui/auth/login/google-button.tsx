import { Button } from "@dub/ui";
import { Google } from "@dub/ui/icons";
import { EAnalyticEvents } from "core/integration/analytic/interfaces/analytic.interface";
import { trackClientEvents } from "core/integration/analytic/services/analytic.service.ts";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { FC, useContext } from "react";
import { LoginFormContext } from "./login-form";

interface IGoogleButtonProps {
  sessionId: string;
  next?: string;
}

export const GoogleLoginButton: FC<Readonly<IGoogleButtonProps>> = ({
  sessionId,
  next,
}) => {
  const searchParams = useSearchParams();
  const finalNext = next ?? searchParams?.get("next");

  const { setClickedMethod, clickedMethod, setLastUsedAuthMethod } =
    useContext(LoginFormContext);

  const handleGoogleLoginClick = () => {
    trackClientEvents({
      event: EAnalyticEvents.ELEMENT_CLICKED,
      params: {
        page_name: "landing",
        element_name: "login",
        content_value: "google",
        event_category: "nonAuthorized",
      },
      sessionId,
    });

    trackClientEvents({
      event: EAnalyticEvents.LOGIN_ATTEMPT,
      params: {
        page_name: "landing",
        method: "google",
        event_category: "nonAuthorized",
      },
      sessionId,
    });
    setClickedMethod("google");
    setLastUsedAuthMethod("google");

    signIn("google", {
      ...(finalNext && finalNext.length > 0 ? { callbackUrl: finalNext } : {}),
    });
  };

  return (
    <Button
      text="Continue with Google"
      variant="secondary"
      onClick={handleGoogleLoginClick}
      loading={clickedMethod === "google"}
      disabled={clickedMethod && clickedMethod !== "google"}
      icon={<Google className="size-4" />}
      className="border-border-500"
    />
  );
};
