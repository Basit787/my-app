import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useNotification, type NotificationApi } from "my-ui";
import {
  deleteDocument,
  fetchDocuments,
  retrySummary,
  streamDocumentEvents,
  uploadDocument,
  type DocumentEvent,
  type SummaryDocument,
} from "./api";

const DOCUMENTS_KEY = ["documents"];
const RECONNECT_DELAY_MS = 3000;

// Kept fresh by useDocumentEvents, no polling
export const useDocuments = () => useQuery({ queryKey: DOCUMENTS_KEY, queryFn: fetchDocuments });

// Puts a pushed change into the cached list and tells the user when a summary finishes
const applyDocumentEvent = (queryClient: QueryClient, notify: NotificationApi, event: DocumentEvent) => {
  if (event.type === "document.deleted") {
    queryClient.setQueryData<SummaryDocument[]>(DOCUMENTS_KEY, (documents = []) =>
      documents.filter((doc) => doc.id !== event.id),
    );
    return;
  }

  const updated = event.document;
  queryClient.setQueryData<SummaryDocument[]>(DOCUMENTS_KEY, (documents = []) => {
    const exists = documents.some((doc) => doc.id === updated.id);
    if (!exists) return [updated, ...documents];
    return documents.map((doc) => (doc.id === updated.id ? updated : doc));
  });

  if (updated.status === "COMPLETED") notify.showSuccessNotification(`Summary ready: ${updated.filename}`);
  if (updated.status === "FAILED") notify.showErrorNotification(null, `Could not summarize ${updated.filename}`);
};

// Live updates pushed by the server (server-sent events); reconnects after a dropped connection
export const useDocumentEvents = () => {
  const queryClient = useQueryClient();
  const notify = useNotification();

  useEffect(() => {
    const controller = new AbortController();
    let hasConnected = false;

    // After a reconnect, refetch once to pick up anything sent while disconnected
    const onOpen = () => {
      if (hasConnected) void queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      hasConnected = true;
    };

    const connect = async () => {
      while (!controller.signal.aborted) {
        try {
          await streamDocumentEvents(controller.signal, onOpen, (event) =>
            applyDocumentEvent(queryClient, notify, event),
          );
        } catch (error) {
          if (!controller.signal.aborted) console.warn("Document events disconnected; reconnecting", error);
        }
        if (controller.signal.aborted) return;
        await new Promise((resolve) => setTimeout(resolve, RECONNECT_DELAY_MS));
      }
    };

    void connect();
    return () => controller.abort();
  }, [queryClient, notify]);
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => showSuccessNotification("Document uploaded; the summary is on its way"),
    onError: (err) => showErrorNotification(err, "Could not upload document"),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY }),
  });
};

export const useRetrySummary = () => {
  const queryClient = useQueryClient();
  const { showErrorNotification } = useNotification();

  return useMutation({
    mutationFn: retrySummary,
    onError: (err) => showErrorNotification(err, "Could not restart the summary"),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY }),
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      showSuccessNotification("Document deleted");
      void queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
    },
    onError: (err) => showErrorNotification(err, "Could not delete document"),
  });
};
