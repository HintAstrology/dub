"use client";

import { Session } from "@/lib/auth/utils";
import { useTrialExpiredModal } from "@/lib/hooks/use-trial-expired-modal.tsx";
import useQrs from "@/lib/swr/use-qrs.ts";
import QrCodeCardPlaceholder from "@/ui/qr-code/qr-code-card-placeholder.tsx";
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
  useState,
} from "react";
import { TQrServerData } from "../qr-builder-new/helpers/data-converters.ts";
import { AnimatedEmptyState } from "../shared/animated-empty-state";
import { QrCodeCard } from "./qr-code-card.tsx";

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

  const { qrs: clientQrs, isValidating } = useQrs(
    {
      sortBy,
      showArchived: true,
    },
    {},
    false,
    true,
  );

  const qrs = clientQrs || initialQrs;

  return (
    <MaxWidthWrapper className="grid gap-y-2">
      <QrCodesList
        CreateQrCodeButton={CreateQrCodeButton}
        qrCodes={qrs}
        loading={isValidating || !qrs}
        compact={viewMode === "rows"}
        featuresAccess={featuresAccess}
        user={user}
      />
    </MaxWidthWrapper>
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
