"use client";

import { Button } from "@/components/ui/button";
import { Session } from "@/lib/auth";
import { useAuthModal } from "@/ui/modals/auth-modal";
import { Logo } from "@/ui/shared/logo.tsx";
import { useRouterStuff } from "@dub/ui";
import { trackClientEvents } from "core/integration/analytic";
import { EAnalyticEvents } from "core/integration/analytic/interfaces/analytic.interface";
import { X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FC, useCallback, useEffect, useState } from "react";
import { scrollToBuilder } from '../helpers/scrollToBuilder.tsx';

interface IHeaderProps {
  sessionId: string;
  authSession: Session;
}

export const Header: FC<Readonly<IHeaderProps>> = ({ sessionId, authSession }) => {
  const { AuthModal, showModal, setShowAuthModal } = useAuthModal({ sessionId });
  const searchParams = useSearchParams();
  const router = useRouter();
  const { queryParams } = useRouterStuff();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openLogin = searchParams.get("login");
  const isFromPaywall = searchParams.get("source") === "paywall";

  useEffect(() => {
    if (openLogin) {
      showModal("login");
    }
  }, [openLogin, showModal]);

  const handleScrollToQRGenerationBlock = useCallback(() => {
    const qrGenerationBlock = document.getElementById("qr-generation-block");
    if (qrGenerationBlock) {
      trackClientEvents({
        event: EAnalyticEvents.PAGE_CLICKED,
        params: {
          page_name: "landing",
          content_value: "create_qr",
          content_group: null,
          element_no: "1",
          event_category: "nonAuthorized",
        },
        sessionId,
      });

      scrollToBuilder();
      return;
    }
    router.push("/?start=true");
  }, [router, sessionId]);

  useEffect(() => {
    if (searchParams.get("start")) {
      setShowAuthModal(false);
      handleScrollToQRGenerationBlock();
      queryParams({
        del: ["start"],
      });
    }
  }, [searchParams.get("start"), handleScrollToQRGenerationBlock]);

  const handleOpenLogin = useCallback(() => {
    showModal("login");
  }, [showModal]);

  const handleOpenMyQRCodes = useCallback(() => {
    router.push("/workspaces");
  }, [router]);

  return (
    <>
      <header className="border-border sticky top-0 z-50 border-b bg-white backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3 sm:px-6">
          <Link href="/">
            <Logo />
          </Link>

          {/* Desktop buttons */}
          <div className="hidden md:flex items-center gap-4 md:gap-6">
            {!authSession?.user ? (
              <>
                {!isFromPaywall && (
                  <Button
                    variant="outline"
                    onClick={handleOpenLogin}
                    className="border-secondary text-secondary hover:bg-secondary hover:text-white text-base font-medium transition-all duration-200"
                    size="lg"
                  >
                    Log In
                  </Button>
                )}
              </>
            ) : (
              <Button
                onClick={handleOpenMyQRCodes}
                className="bg-secondary hover:bg-secondary/90 text-base font-medium text-white"
                size="lg"
              >
                My QR Codes
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <svg
                  className="h-6 w-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  viewBox="0 0 24 24"
                >
                  <line x1="4" y1="8" x2="20" y2="8" />
                  <line x1="4" y1="16" x2="20" y2="16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div 
          className={`md:hidden border-t border-border bg-white overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 py-3 space-y-2">
            {!authSession?.user ? (
              <>
                {!isFromPaywall && (
                  <button
                    onClick={() => {
                      handleOpenLogin();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Login
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => {
                  handleOpenMyQRCodes();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-base font-medium text-secondary hover:bg-gray-50 rounded-lg transition-colors"
              >
                My QR Codes
              </button>
            )}
          </div>
        </div>
      </header>
      <AuthModal />
    </>
  );
};
