"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload, CopyButton } from "@dub/ui";
import { APP_NAME } from "@dub/utils";
import { trackClientEvents } from "core/integration/analytic";
import { EAnalyticEvents } from "core/integration/analytic/interfaces/analytic.interface.ts";
import { useSession } from "next-auth/react";
import { FC, useEffect, useState } from "react";
import { toast } from "sonner";

interface ISettingsPageClientProps {
  sessionId: string;
}

const SettingsPageClient: FC<Readonly<ISettingsPageClientProps>> = ({
  sessionId,
}) => {
  const { data: session, update, status } = useSession();
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>();
  const [savingName, setSavingName] = useState(false);
  const [savingImage, setSavingImage] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setImage(session.user.image || null);
    }
  }, [session]);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingName(true);
    
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (res.status === 200) {
        trackClientEvents({
          event: EAnalyticEvents.ACCOUNT_UPDATED,
          params: {
            page_name: "profile",
            content_group: "account",
            email: session?.user?.email,
            nameChanged: true,
            emailChanged: false,
            avatarChanged: false,
            passwordChanged: false,
            event_category: "Authorized",
          },
          sessionId,
        });

        await update();
        toast.success("Successfully updated your name!");
      } else {
        const { error } = await res.json();
        toast.error(error.message);
      }
    } finally {
      setSavingName(false);
    }
  };

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingImage(true);
    
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image }),
      });

      if (res.status === 200) {
        trackClientEvents({
          event: EAnalyticEvents.ACCOUNT_UPDATED,
          params: {
            event_category: "Authorized",
            page_name: "profile",
            content_group: "account",
            email: session?.user?.email,
            nameChanged: false,
            emailChanged: false,
            avatarChanged: true,
            passwordChanged: false,
          },
          sessionId,
        });
        
        await update();
        toast.success("Successfully updated your profile picture!");
      } else {
        const errorMessage = await res.text();
        toast.error(errorMessage || "Something went wrong");
      }
    } finally {
      setSavingImage(false);
    }
  };

  const nameChanged = name !== (session?.user?.name || "");
  const imageChanged = image !== session?.user?.image;

  return (
    <div className="bg-card mx-auto w-full rounded-[20px]  shadow">
      <div className="p-4">
        {/* Avatar Section */}
        <div className="mb-6 pb-6 border-b">
          <Label className="mb-3 block">Profile Picture</Label>
          <div className="flex items-center gap-4">
            <FileUpload
              accept="images"
              className="border-border h-[120px] w-[120px] rounded-full border"
              iconClassName="w-5 h-5"
              variant="plain"
              imageSrc={image}
              readFile
              onChange={({ src }) => setImage(src)}
              content={null}
              maxFileSizeMB={2}
              targetResolution={{ width: 240, height: 240 }}
            />
            <div className="flex-1">
              <p className="text-muted-foreground text-sm mb-2">
                Upload PNG or JPG images up to 2MB
              </p>
              {imageChanged && (
                <Button 
                  size="sm"
                  onClick={handleImageSubmit}
                  disabled={savingImage}
                  className="bg-secondary text-white hover:bg-secondary/80"
                >
                  {savingImage ? "Saving..." : "Save Picture"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Name Section */}
        <form onSubmit={handleNameSubmit} className="mb-6 pb-6 border-b">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <div className="flex gap-2">
              <Input
                id="name"
                type="text"
                value={status === "loading" ? "" : name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={32}
                className="flex-1"
                disabled={status === "loading"}
              />
              {nameChanged && (
                <Button 
                  type="submit"
                  size="sm"
                  className="bg-secondary text-white hover:bg-secondary/80"
                  disabled={savingName || !name}
                >
                  {savingName ? "Saving..." : "Save"}
                </Button>
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              Max 32 characters. This will be your display name on {APP_NAME}.
            </p>
          </div>
        </form>

        {/* User ID Section */}
        <div>
          <Label className="mb-2 block">User ID</Label>
          <div className="bg-muted flex items-center justify-between rounded-md shadow p-3">
            <code className="text-foreground text-sm font-mono">
              {session?.user?.id! || "Loading..."}
            </code>
            {session?.user?.id && (
              <CopyButton 
                value={session.user.id} 
                className="shrink-0"
              />
            )}
          </div>
          <p className="text-muted-foreground text-xs mt-2">
            Your unique account identifier
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPageClient;

