import { parse } from "@/lib/middleware/utils";
import { UserProps } from "@/lib/types.ts";
import { userSessionIdInit } from "core/services/cookie/user-session-id-init.service.ts";
import { NextRequest, NextResponse } from "next/server";
import EmbedMiddleware from "./embed";
import NewLinkMiddleware from "./new-link";
import { appRedirect } from "./utils/app-redirect";
import { getDefaultWorkspace } from "./utils/get-default-workspace";
import { getOnboardingStep } from "./utils/get-onboarding-step";
import { isTopLevelSettingsRedirect } from "./utils/is-top-level-settings-redirect";
import WorkspacesMiddleware from "./workspaces";

export default async function AppMiddleware(
  req: NextRequest,
  country?: string,
  user?: UserProps,
  isPublicRoute?: boolean,
) {
  const { domain, path, fullPath } = parse(req);
  console.log("here1");
  console.log(path, fullPath);

  if (path.startsWith("/embed")) {
    return EmbedMiddleware(req);
  }
  const isWorkspaceInvite =
    req.nextUrl.searchParams.get("invite") || path.startsWith("/invites/");

  // Initialize session ID for authenticated users
  let sessionCookie = "";
  if (user) {
    console.log("user via token", user);
    const sessionInit = userSessionIdInit(req, user.id);
    if (sessionInit.needsUpdate) {
      sessionCookie = `${sessionInit.cookieName}=${sessionInit.sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict;`;
    }
  }

  // if there's no user and the path isn't /login or /register, redirect to /login
  if (
    !user &&
    path !== "/login" &&
    path !== "/forgot-password" &&
    path !== "/register" &&
    path !== "/auth/saml" &&
    !path.startsWith("/auth/reset-password/") &&
    !path.startsWith("/share/")
  ) {
    const cookies = [`country=${country}; Path=/; Secure; SameSite=Strict;`];
    if (sessionCookie) {
      cookies.push(sessionCookie);
    }

    return NextResponse.rewrite(
      new URL(
        `/login${path === "/" ? "" : `?next=${encodeURIComponent(fullPath)}`}`,
        req.url,
      ),
      { headers: { "Set-Cookie": cookies.join(", ") } },
    );

    // if there's a user
  } else if (user) {
    // /new is a special path that creates a new link (or workspace if the user doesn't have one yet)
    if (path === "/new") {
      return NewLinkMiddleware(req, user);

      /* Onboarding redirects

        - User was created less than a day ago
        - User is not invited to a workspace (redirect straight to the workspace)
        - The path does not start with /onboarding
        - The user has not completed the onboarding step
      */
    } else if (
      new Date(user.createdAt).getTime() > Date.now() - 60 * 60 * 24 * 1000 &&
      !isWorkspaceInvite &&
      !["/onboarding", "/account"].some((p) => path.startsWith(p))
    ) {
      const defaultWorkspace = await getDefaultWorkspace(user);
      const onboardingStep = await getOnboardingStep(user);
      
      console.log("Onboarding redirect check for user:", user.id);
      console.log("User created at:", user.createdAt);
      console.log("Default workspace:", defaultWorkspace);
      console.log("Onboarding step:", onboardingStep);
      
      // If user has a workspace and onboarding is completed, redirect to workspace
      if (defaultWorkspace && onboardingStep === "completed") {
        return WorkspacesMiddleware(req, user);
      }
      
      // If user has no workspace or onboarding is not completed, redirect to onboarding
      if (!defaultWorkspace || onboardingStep !== "completed") {
        let step = onboardingStep;
        if (!step) {
          return NextResponse.redirect(new URL("/onboarding", req.url));
        } else if (step === "completed") {
          return WorkspacesMiddleware(req, user);
        }

        if (defaultWorkspace) {
          // Skip workspace step if user already has a workspace
          step = step === "workspace" ? "link" : step;
          return NextResponse.redirect(
            new URL(`/onboarding/${step}?workspace=${defaultWorkspace}`, req.url),
          );
        } else {
          return NextResponse.redirect(new URL("/onboarding", req.url));
        }
      }

      // if the path is / or /login or /register, redirect to the default workspace
    } else if (
      [
        "/",
        "/login",
        "/register",
        "/workspaces",
        "/analytics",
        "/events",
        "/programs",
        "/settings",
        "/upgrade",
        "/wrapped",
      ].includes(path) ||
      path.startsWith("/settings/") ||
      isTopLevelSettingsRedirect(path)
    ) {
      return WorkspacesMiddleware(req, user);
    } else if (isPublicRoute) {
      return NextResponse.rewrite(new URL(`/${domain}${path}`, req.url));
    } else if (appRedirect(path)) {
      return NextResponse.redirect(new URL(appRedirect(path), req.url));
    }
  }

  // otherwise, rewrite the path to /app
  const finalCookies = [`country=${country}; Path=/; Secure; SameSite=Strict;`];
  if (sessionCookie) {
    finalCookies.push(sessionCookie);
  }

  return NextResponse.rewrite(new URL(`/app.dub.co${fullPath}`, req.url), {
    headers: { "Set-Cookie": finalCookies.join(", ") },
  });
}
