import {
  qrActionsTrackingParams,
  qrActionsTrackingParamsError,
} from "@/lib/analytic/qr-actions-tracking-data.helper";
import { Session } from "@/lib/auth";
import { mutatePrefix } from "@/lib/swr/mutate.ts";
import useWorkspace from "@/lib/swr/use-workspace.ts";
import { useToastWithUndo } from "@dub/ui";
import { useNewQrContext } from "app/app.dub.co/(dashboard)/[slug]/helpers/new-qr-context";
import { trackClientEvents } from "core/integration/analytic";
import { EAnalyticEvents } from "core/integration/analytic/interfaces/analytic.interface";
import { useCallback } from "react";
import { toast } from "sonner";
import { FILE_QR_TYPES } from "../constants/get-qr-config";
import {
  convertNewQRBuilderDataToServer,
  prepareQRUpdates,
} from "../helpers/data-converters";
import { TQRFormData } from "../types/context";
import { TNewQRBuilderData } from "../types/qr-builder-data";
import { TQrServerData } from "../types/qr-server-data";
import { EQRType } from "../types/qr-type";

interface IUseNewQrOperationsProps {
  user: Session["user"];
  initialQrData: TQrServerData | null;
}

export const useNewQrOperations = ({
  initialQrData,
  user,
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
        const serverData = await convertNewQRBuilderDataToServer(builderData);

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
          await mutatePrefix(["/api/qrs"]);

          const responseData = await res.json();
          const { createdQr } = responseData;

          const trackingParams = qrActionsTrackingParams(createdQr);

          trackClientEvents({
            event: EAnalyticEvents.QR_CREATED,
            params: {
              event_category: "Authorized",
              page_name: projectSlug ? "landing" : "dashboard",
              email: user?.email,
              ...trackingParams,
            },
            sessionId: user?.id,
          });

          toast.success("Successfully created QR!");
          return responseData;
        } else {
          const errorResponse = await res.json();
          console.error("API Error Response:", errorResponse);

          const errorMessage =
            errorResponse?.error?.message || "Failed to create QR";

          const trackingParams = qrActionsTrackingParamsError(
            serverData as unknown as TQrServerData,
            "create",
            errorResponse,
          );
          trackClientEvents({
            event: EAnalyticEvents.QR_CREATED_ERROR,
            params: {
              event_category: "Authorized",
              page_name: projectSlug ? "landing" : "dashboard",
              email: user?.email,
              ...trackingParams,
            },
            sessionId: user?.id,
          });

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

  const updateQR = useCallback(
    async (builderData: TNewQRBuilderData) => {
      try {
        if (!workspaceId) {
          toast.error("Workspace ID not found");
          return false;
        }

        // Convert new builder data to server format
        const { updateData, hasChanges, changes } = await prepareQRUpdates(
          initialQrData!,
          builderData,
        );

        if (!hasChanges) {
          toast.info("No changes to save");
          return true;
        }

        const res = await fetch(
          `/api/qrs/${initialQrData!.id!}?workspaceId=${workspaceId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          },
        );

        if (res.status === 200) {
          await mutatePrefix(["/api/qrs"]);

          const responseData = await res.json();
          const { qr } = responseData;

          const trackingParams = qrActionsTrackingParams(qr);

          trackClientEvents({
            event: EAnalyticEvents.QR_UPDATED,
            params: {
              event_category: "Authorized",
              page_name: "dashboard",
              email: user?.email,
              is_activated: false,
              is_deactivated: false,
              is_deleted: false,
              ...trackingParams,
            },
            sessionId: user?.id,
          });

          toast.success("Successfully updated QR!");
          return responseData;
        } else {
          const errorResponse = await res.json();
          const errorMessage =
            errorResponse?.error?.message || "Failed to update QR";

          const trackingParams = qrActionsTrackingParamsError(
            initialQrData!,
            "update",
            errorResponse,
          );
          trackClientEvents({
            event: EAnalyticEvents.QR_UPDATED_ERROR,
            params: {
              event_category: "Authorized",
              page_name: "dashboard",
              email: user?.email,
              ...trackingParams,
            },
            sessionId: user?.id,
          });

          toast.error(errorMessage);
          return false;
        }
      } catch (e) {
        console.error("Failed to update QR", e);

        return false;
      }
    },
    [workspaceId, initialQrData],
  );

  const updateQRTitle = useCallback(
    async (newTitle: string) => {
      if (initialQrData?.title === newTitle) {
        toast.info("No changes to save");

        return true;
      }

      const body = {
        data: initialQrData!.data,
        title: newTitle,
        link: { url: initialQrData!.link?.url },
      };

      try {
        const res = await fetch(
          `/api/qrs/${initialQrData!.id}?workspaceId=${workspaceId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          },
        );

        if (res.status === 200) {
          await mutatePrefix(["/api/qrs"]);

          const responseData = await res.json();
          const { qr } = responseData;

          const trackingParams = qrActionsTrackingParams(qr);

          trackClientEvents({
            event: EAnalyticEvents.QR_UPDATED,
            params: {
              event_category: "Authorized",
              page_name: "dashboard",
              email: user?.email,
              is_activated: false,
              is_deactivated: false,
              is_deleted: false,
              ...trackingParams,
            },
            sessionId: user?.id,
          });

          toast.success("Successfully updated QR!");

          return responseData;
        } else {
          const errorResponse = await res.json();
          const errorMessage =
            errorResponse?.error?.message || "Failed to update QR";

          const trackingParams = qrActionsTrackingParamsError(
            initialQrData!,
            "update",
            errorResponse,
          );
          trackClientEvents({
            event: EAnalyticEvents.QR_UPDATED_ERROR,
            params: {
              event_category: "Authorized",
              page_name: "dashboard",
              email: user?.email,
              ...trackingParams,
            },
            sessionId: user?.id,
          });

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

      const originalDestinationLink = initialQrData!.link?.url;

      const isWifiQrType = selectedQrType === EQRType.WIFI;
      const isFileQrType = FILE_QR_TYPES.includes(initialQrData!.qrType);

      const isDestinationChanged =
        !isFileQrType && encodedData !== originalDestinationLink;
      const isWifiDestinationChanged =
        isWifiQrType && encodedData !== originalDestinationLink;
      const isFileChanged = isFileQrType && fileId !== initialQrData!.fileId;

      const hasChanges =
        isDestinationChanged || isFileChanged || isWifiDestinationChanged;

      if (!hasChanges) {
        toast.info("No changes to save");

        return true;
      }

      const body = {
        data: isWifiDestinationChanged ? encodedData : initialQrData!.data,
        link: { url: encodedData },
        fileId,
        qrType: initialQrData!.qrType,
      };

      try {
        const res = await fetch(
          `/api/qrs/${initialQrData!.id}?workspaceId=${workspaceId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          },
        );

        if (res.status === 200) {
          await mutatePrefix(["/api/qrs"]);

          const responseData = await res.json();
          const { qr } = responseData;

          const trackingParams = qrActionsTrackingParams(qr);

          trackClientEvents({
            event: EAnalyticEvents.QR_UPDATED,
            params: {
              event_category: "Authorized",
              page_name: "dashboard",
              email: user?.email,
              is_activated: false,
              is_deactivated: false,
              is_deleted: false,
              ...trackingParams,
            },
            sessionId: user?.id,
          });

          toast.success("Successfully updated QR!");

          return responseData;
        } else {
          const errorResponse = await res.json();
          const errorMessage =
            errorResponse?.error?.message || "Failed to update QR";

          const trackingParams = qrActionsTrackingParamsError(
            initialQrData!,
            "update",
            errorResponse,
          );
          trackClientEvents({
            event: EAnalyticEvents.QR_UPDATED_ERROR,
            params: {
              event_category: "Authorized",
              page_name: "dashboard",
              email: user?.email,
              ...trackingParams,
            },
            sessionId: user?.id,
          });

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
          await mutatePrefix(["/api/qrs"]);

          const responseData = await res.json();
          const { qr } = responseData;

          const trackingParams = qrActionsTrackingParams(qr);

          trackClientEvents({
            event: EAnalyticEvents.QR_UPDATED,
            params: {
              event_category: "Authorized",
              page_name: "dashboard",
              email: user?.email,
              is_activated: !archive,
              is_deactivated: archive,
              is_deleted: false,
              ...trackingParams,
            },
            sessionId: user?.id,
          });

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
          const errorResponse = await res.json();
          toast.error(errorResponse?.error?.message || "Failed to archive QR");

          const trackingParams = qrActionsTrackingParamsError(
            initialQrData!,
            archive ? "deactivate" : "activate",
            errorResponse,
          );
          trackClientEvents({
            event: EAnalyticEvents.QR_UPDATED_ERROR,
            params: {
              event_category: "Authorized",
              page_name: "dashboard",
              email: user?.email,
              ...trackingParams,
            },
            sessionId: user?.id,
          });

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
        await mutatePrefix(["/api/qrs"]);

        const responseData = await res.json();
        const { qr } = responseData;

        const trackingParams = qrActionsTrackingParams(qr);

        trackClientEvents({
          event: EAnalyticEvents.QR_UPDATED,
          params: {
            event_category: "Authorized",
            page_name: "dashboard",
            email: user?.email,
            is_activated: false,
            is_deactivated: false,
            is_deleted: true,
            ...trackingParams,
          },
          sessionId: user?.id,
        });

        toast.success("Successfully deleted QR!");
        return true;
      } else {
        const errorResponse = await res.json();
        toast.error(errorResponse?.error?.message || "Failed to delete QR");

        const trackingParams = qrActionsTrackingParamsError(
          initialQrData!,
          "delete",
          errorResponse,
        );
        trackClientEvents({
          event: EAnalyticEvents.QR_UPDATED_ERROR,
          params: {
            event_category: "Authorized",
            page_name: "dashboard",
            email: user?.email,
            ...trackingParams,
          },
          sessionId: user?.id,
        });

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

        await mutatePrefix(["/api/qrs"]);

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
    updateQR,
    updateQRTitle,
    updateQRDestination,
    archiveQR,
    deleteQR,
    duplicateQR,
  };
};
