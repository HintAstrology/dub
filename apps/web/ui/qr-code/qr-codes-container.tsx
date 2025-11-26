"use client";

import { Session } from "@/lib/auth/utils";
import { useTrialExpiredModal } from "@/lib/hooks/use-trial-expired-modal.tsx";
import useQrs from "@/lib/swr/use-qrs.ts";
import { TQrServerData } from "@/ui/qr-builder-new/types/qr-server-data";
import QrCodeCardPlaceholder from "@/ui/qr-code/components/qr-code-card-placeholder.tsx";
import { QrCodesDisplayContext } from "@/ui/qr-code/qr-codes-display-provider.tsx";
import { CardList, MaxWidthWrapper } from "@dub/ui";
import { CursorRays, QRCode as QRCodeIcon } from "@dub/ui/icons";
import { useSearchParams } from "next/navigation";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { AnimatedEmptyState } from "../shared/animated-empty-state";
import { QrCodeCard } from "./components/qr-code-card.tsx";

export default function QrCodesContainer({
  CreateQrCodeButton,
  featuresAccess,
  initialQrs,
  user,
}: {
  CreateQrCodeButton: () => ReactNode;
  featuresAccess: boolean;
  initialQrs: TQrServerData[];
  user: Session["user"];
}) {
  const { viewMode, sortBy } = useContext(QrCodesDisplayContext);
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || undefined;

  const { qrs: clientQrs, isValidating } = useQrs(
    {
      showArchived: true,
      search,
    },
    {},
    false,
    true, // Skip first load - use initialQrs
  );

  const allQrs = clientQrs || initialQrs;

  // Sort client-side based on sortBy from context
  // This will automatically re-sort when sortBy changes due to useMemo dependency
  const qrs = useMemo(() => {
    if (!allQrs) return allQrs;
    
    const sorted = [...allQrs];
    const sortValue = sortBy || "createdAt";
    
    switch (sortValue) {
      case "createdAt":
        sorted.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });
        break;
      case "clicks":
        sorted.sort((a, b) => 
          (b.link?.clicks || 0) - (a.link?.clicks || 0)
        );
        break;
      case "lastClicked":
        // Note: lastClicked may not be available in link type, fallback to createdAt
        sorted.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });
        break;
      case "type":
        sorted.sort((a, b) => b.qrType.localeCompare(a.qrType));
        break;
      default:
        // Default to createdAt desc
        sorted.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });
    }
    
    return sorted;
  }, [allQrs, sortBy]);

  return (
    <div className="grid w-full gap-y-2 mb-4">
      <QrCodesList
        CreateQrCodeButton={CreateQrCodeButton}
        qrCodes={qrs}
        loading={isValidating}
        compact={viewMode === "rows"}
        featuresAccess={featuresAccess}
        user={user}
      />
    </div>
  );
}

export const QrCodesListContext = createContext<{
  openMenuQrCodeId: string | null;
  setOpenMenuQrCodeId: Dispatch<SetStateAction<string | null>>;
  featuresAccess: boolean;
}>({
  openMenuQrCodeId: null,
  setOpenMenuQrCodeId: () => {},
  featuresAccess: true,
});

function QrCodesList({
  CreateQrCodeButton,
  qrCodes,
  loading,
  compact,
  featuresAccess,
  user,
}: {
  CreateQrCodeButton: () => ReactNode;
  qrCodes?: TQrServerData[];
  count?: number;
  loading?: boolean;
  compact: boolean;
  featuresAccess: boolean;
  user: Session["user"];
}) {
  const searchParams = useSearchParams();

  const [openMenuQrCodeId, setOpenMenuQrCodeId] = useState<string | null>(null);

  const { setShowTrialExpiredModal, TrialExpiredModalCallback } =
    useTrialExpiredModal();

  const isFiltered = [
    "folderId",
    "tagIds",
    "domain",
    "userId",
    "search",
    "showArchived",
  ].some((param) => searchParams.has(param));

  return (
    <>
      <TrialExpiredModalCallback />

      {!qrCodes || qrCodes.length ? (
        <QrCodesListContext.Provider
          value={{ openMenuQrCodeId, setOpenMenuQrCodeId, featuresAccess }}
        >
          {/* Cards */}
          <CardList variant={compact ? "compact" : "loose"} loading={loading}>
            {qrCodes?.length
              ? // Link cards
                qrCodes.map((qrCode) => (
                  <QrCodeCard
                    key={qrCode.id}
                    qrCode={qrCode}
                    featuresAccess={featuresAccess}
                    user={user}
                    setShowTrialExpiredModal={setShowTrialExpiredModal}
                  />
                ))
              : // Loading placeholder cards
                Array.from({ length: 12 }).map((_, idx) => (
                  <CardList.Card
                    key={idx}
                    outerClassName="pointer-events-none"
                    innerClassName="flex items-center gap-4"
                  >
                    <QrCodeCardPlaceholder />
                  </CardList.Card>
                ))}
          </CardList>
        </QrCodesListContext.Provider>
      ) : (
        <AnimatedEmptyState
          title={isFiltered ? "No QRs found" : "No QR codes yet"}
          description={
            isFiltered
              ? "Bummer! There are no QRs that match your filters. Adjust your filters to yield more results."
              : "Start creating customized QR codes for websites, PDFs, images, and more — all in one place."
          }
          cardContent={
            <>
              <QRCodeIcon className="size-4 text-neutral-700" />
              <div className="h-2.5 w-24 min-w-0 rounded-sm bg-neutral-200" />
              <div className="xs:flex hidden grow items-center justify-end gap-1.5 text-neutral-500">
                <CursorRays className="size-3.5" />
              </div>
            </>
          }
          {...(!isFiltered && {
            addButton: (
              <div>
                <CreateQrCodeButton />
              </div>
            ),
          })}
        />
      )}
    </>
  );
}
