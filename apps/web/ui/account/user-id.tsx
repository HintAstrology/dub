"use client";

import { CopyButton } from "@dub/ui";
import { useSession } from "next-auth/react";

export default function UserId() {
  const { data: session } = useSession() as
    | {
        data: { user: { id: string } };
      }
    | { data: null };

  return (
    <>
      <div className="border-border-500 rounded-lg border bg-white">
        <div className="relative flex flex-col space-y-6 p-5 sm:p-10">
          <div className="flex flex-col space-y-3">
            <h2 className="text-xl font-medium">Your User ID</h2>
            <p className="text-sm text-neutral-500">
              This is your unique account identifier on GetQR.com.
            </p>
          </div>
          {session?.user?.id ? (
            <div className="border-border-500 flex w-full max-w-md items-center justify-between rounded-md border bg-white p-2">
              <p className="text-sm text-neutral-500">{session.user.id}</p>
              <CopyButton value={session.user.id} className="rounded-md" />
            </div>
          ) : (
            <div className="h-[2.35rem] w-full max-w-md animate-pulse rounded-md bg-neutral-200" />
          )}
        </div>
        <div className="border-border-500 h-14 rounded-b-lg border-t bg-neutral-50" />
      </div>
    </>
  );
}
