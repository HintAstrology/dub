import { mutatePrefix } from "@/lib/swr/mutate.ts";
import useWorkspace from "@/lib/swr/use-workspace.ts";
import { useToastWithUndo } from "@dub/ui";
import { SHORT_DOMAIN } from "@dub/utils/src";
import { useNewQrContext } from "app/app.dub.co/(dashboard)/[slug]/helpers/new-qr-context";
import { useCallback } from "react";
import { toast } from "sonner";
import { FILE_QR_TYPES } from "../constants/get-qr-config";
import {
  convertNewQRBuilderDataToServer,
  TNewQRBuilderData,
  TQrServerData,
} from "../helpers/data-converters";
import { TQRFormData } from "../types/context";
import { EQRType } from "../types/qr-type";

interface IUseNewQrOperationsProps {
  initialQrData: TQrServerData | null;
}

export const useNewQrOperations = ({
  initialQrData,
}: IUseNewQrOperationsProps) => {
  const { id: workspaceId } = useWorkspace();
  const { setNewQrId } = useNewQrContext();

  const toastWithUndo = useToastWithUndo();

  const selectedQrType = initialQrData?.qrType as EQRType;

  const createQr = useCallback(
    async (builderData: TNewQRBuilderData, projectSlug?: string) => {
      try {
        if (!workspaceId && !projectSlug) {
          toast.error("Workspace ID not found");
          return false;
        }

        // Convert new builder data to server format
        const serverData = await convertNewQRBuilderDataToServer(builderData, {
          domain: SHORT_DOMAIN!,
        });

        console.log(serverData, "serverData11111");

        const res = await fetch(
          `/api/qrs?workspaceId=${projectSlug ? projectSlug : workspaceId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(serverData),
          },
        );

        if (res.status === 200) {
          await mutatePrefix(["/api/qrs", "/api/links"]);
          const responseData = await res.json();
          toast.success("Successfully created QR!");
          return responseData;
        } else {
          const errorResponse = await res.json();
          console.error("API Error Response:", errorResponse);

          const errorMessage =
            errorResponse?.error?.message || "Failed to create QR";

          console.error("Error creating QR:", errorMessage);
          toast.error(errorMessage);
          return false;
        }
      } catch (e) {
        console.error("Failed to create QR", e);

        toast.error("Failed to create QR");
        return false;
      }
    },
    [workspaceId],
  );

  const updateQr = useCallback(
    async (originalQR: TQrServerData, builderData: TNewQRBuilderData) => {
      try {
        if (!workspaceId) {
          toast.error("Workspace ID not found");
          return false;
        }

        // Convert new builder data to server format
        const newServerData = await convertNewQRBuilderDataToServer(
          builderData,
          {
            domain: SHORT_DOMAIN!,
          },
        );

        // Simple comparison to check for changes
        const hasChanges =
          newServerData.title !== originalQR.title ||
          newServerData.qrType !== originalQR.qrType ||
          newServerData.data !== originalQR.data ||
          JSON.stringify(newServerData.styles) !==
            JSON.stringify(originalQR.styles) ||
          JSON.stringify(newServerData.frameOptions) !==
            JSON.stringify(originalQR.frameOptions) ||
          JSON.stringify(newServerData.logoOptions) !==
            JSON.stringify(originalQR.logoOptions) ||
          newServerData.fileId !== originalQR.fileId;

        if (!hasChanges) {
          toast.info("No changes to save");
          return true;
        }

        const res = await fetch(
          `/api/qrs/${originalQR.id}?workspaceId=${workspaceId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newServerData),
          },
        );

        if (res.status === 200) {
          await mutatePrefix(["/api/qrs", "/api/links"]);
          const responseData = await res.json();
          toast.success("Successfully updated QR!");
          return responseData;
        } else {
          const errorResponse = await res.json();
          const errorMessage =
            errorResponse?.error?.message || "Failed to update QR";

          toast.error(errorMessage);
          return false;
        }
      } catch (e) {
        console.error("Failed to update QR", e);

        return false;
      }
    },
    [workspaceId],
  );

  const updateQRTitle = useCallback(
    async (newTitle: string) => {
      if (initialQrData?.title === newTitle) {
        toast.info("No changes to save");

        return true;
      }

      const isFileQrType = FILE_QR_TYPES.includes(initialQrData!.qrType);

      const originalQRCopy = structuredClone(initialQrData);

      originalQRCopy!.title = newTitle;

      delete originalQRCopy!.createdAt;
      delete originalQRCopy!.updatedAt;
      delete originalQRCopy!.description;
      delete originalQRCopy!.file;
      delete originalQRCopy!.logoOptions;

      if (!isFileQrType) {
        delete originalQRCopy!.fileId;
      }

      try {
        const res = await fetch(
          `/api/qrs/${initialQrData!.id}?workspaceId=${workspaceId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(originalQRCopy),
          },
        );

        if (res.status === 200) {
          await mutatePrefix(["/api/qrs"]);

          const responseData = await res.json();

          toast.success("Successfully updated QR!");

          return responseData;
        } else {
          const errorResponse = await res.json();
          const errorMessage =
            errorResponse?.error?.message || "Failed to update QR";

          toast.error(errorMessage);
          return false;
        }
      } catch (e) {
        console.error("Failed to update QR", e);

        return false;
      }
    },
    [initialQrData],
  );

  const updateQRDestination = useCallback(
    async (
      formData: TQRFormData & { encodedData: string; fileId?: string },
    ) => {
      const { encodedData, fileId } = formData;

      const originalDestination = initialQrData!.link?.url;

      const isWifiQrType = selectedQrType === EQRType.WIFI;
      const isFileQrType = FILE_QR_TYPES.includes(initialQrData!.qrType);

      const isDestinationChanged =
        !isFileQrType && encodedData !== originalDestination;
      const isWifiDestinationChanged =
        isWifiQrType && encodedData !== originalDestination;
      const isFileChanged = isFileQrType && fileId !== initialQrData!.fileId;

      const hasChanges =
        isDestinationChanged || isFileChanged || isWifiDestinationChanged;

      if (!hasChanges) {
        toast.info("No changes to save");

        return true;
      }

      const originalQRCopy = structuredClone(initialQrData);

      originalQRCopy!.link.url = encodedData;

      if (isWifiDestinationChanged) {
        originalQRCopy!.data = encodedData;
      }

      if (isFileChanged) {
        originalQRCopy!.fileId = fileId;
      }

      delete originalQRCopy!.createdAt;
      delete originalQRCopy!.updatedAt;
      delete originalQRCopy!.description;
      delete originalQRCopy!.file;
      delete originalQRCopy!.logoOptions;

      if (!isFileQrType) {
        delete originalQRCopy!.fileId;
      }

      try {
        const res = await fetch(
          `/api/qrs/${initialQrData!.id}?workspaceId=${workspaceId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(originalQRCopy),
          },
        );

        if (res.status === 200) {
          await mutatePrefix(["/api/qrs"]);

          const responseData = await res.json();

          toast.success("Successfully updated QR!");

          return responseData;
        } else {
          const errorResponse = await res.json();
          const errorMessage =
            errorResponse?.error?.message || "Failed to update QR";

          toast.error(errorMessage);

          return false;
        }
      } catch (e) {
        console.error("Failed to update QR", e);

        return false;
      }
    },
    [initialQrData, workspaceId],
  );

  const archiveQR = useCallback(
    async (forceArchive?: boolean) => {
      const archive = forceArchive ?? !initialQrData!.archived;

      try {
        if (!workspaceId) {
          toast.error("Workspace ID not found");
          return false;
        }

        const res = await fetch(
          `/api/qrs/${initialQrData!.id}?workspaceId=${workspaceId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ archived: archive }),
          },
        );

        if (res.status === 200) {
          await mutatePrefix(["/api/qrs", "/api/links"]);

          const responseData = await res.json();

          toastWithUndo({
            id: "qr-archive-undo-toast",
            message: `Successfully ${archive ? "paused" : "unpaused"} QR!`,
            undo: () => {
              toast.promise(archiveQR(!archive), {
                loading: "Undo in progress...",
                error: "Failed to roll back changes. An error occurred.",
                success: () => {
                  return "Undo successful! Changes reverted.";
                },
              });
            },
            duration: 5000,
          });

          return true;
        } else {
          const { error } = await res.json();
          toast.error(error?.message || "Failed to archive QR");
          return false;
        }
      } catch (e) {
        console.error("Failed to archive QR", e);
        toast.error("Failed to archive QR");
        return false;
      }
    },
    [workspaceId, toastWithUndo, initialQrData],
  );

  const deleteQR = useCallback(async () => {
    try {
      if (!workspaceId) {
        toast.error("Workspace ID not found");
        return false;
      }

      const res = await fetch(
        `/api/qrs/${initialQrData!.id}?workspaceId=${workspaceId}`,
        {
          method: "DELETE",
        },
      );

      if (res.status === 200) {
        await mutatePrefix(["/api/qrs", "/api/links"]);

        const responseData = await res.json();

        toast.success("Successfully deleted QR!");
        return true;
      } else {
        const { error } = await res.json();
        toast.error(error?.message || "Failed to delete QR");
        return false;
      }
    } catch (e) {
      console.error("Failed to delete QR", e);
      toast.error("Failed to delete QR");
      return false;
    }
  }, [workspaceId]);

  const duplicateQR = useCallback(async () => {
    try {
      if (!workspaceId) {
        toast.error("Workspace ID not found");
        return false;
      }

      const res = await fetch(
        `/api/qrs/${initialQrData!.id}/duplicate?workspaceId=${workspaceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (res.status === 200) {
        const responseData = await res.json();
        const createdQrId = responseData?.createdQr?.id;

        setNewQrId?.(createdQrId);

        await mutatePrefix(["/api/qrs", "/api/links"]);

        toast.success("QR was duplicated");
        return true;
      } else {
        const { error } = await res.json();
        toast.error(error?.message || "Failed to duplicate QR");
        return false;
      }
    } catch (e) {
      console.error("Failed to duplicate QR", e);
      toast.error("Failed to duplicate QR");
      return false;
    }
  }, [workspaceId, setNewQrId]);

  return {
    createQr,
    updateQr,
    updateQRTitle,
    updateQRDestination,
    archiveQR,
    deleteQR,
    duplicateQR,
  };
};
