"use client";

import { CreateQRButton } from "@/ui/modals/qr-builder-new";
import QrCodeSort from "@/ui/qr-code/components/qr-code-sort";
import { SearchBoxPersisted } from "@/ui/shared/search-box";
import useQrs from "@/lib/swr/use-qrs";
import { Session } from "@/lib/auth/utils";
import { useRouter } from "next/navigation";

interface QRHeaderControlsProps {
  user: Session["user"];
}

export function QRHeaderControls({ user }: QRHeaderControlsProps) {
  const { isValidating } = useQrs({}, {}, true); // listenOnly mode
  const router = useRouter();

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2 lg:flex-nowrap">
      <div className="flex w-full grow gap-2 md:w-auto">
        <div className="grow basis-0 md:grow-0">
          <QrCodeSort />
        </div>
      </div>
      <div className="flex gap-x-2 max-md:w-full">
        <div className="w-full md:w-56 lg:w-64">
          <SearchBoxPersisted
            loading={isValidating}
            inputClassName="h-10"
          />
        </div>

        <div className="grow-0">
          <CreateQRButton onClick={() => router.push("/constructor")} />
        </div>
      </div>
    </div>
  );
}

