import { useEffect } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useNotification, type NotificationApi } from "my-ui";
import {
  archiveInvoice,
  deleteInvoice,
  downloadInvoiceFile,
  downloadInvoicePage,
  downloadInvoicePdf,
  downloadInvoicePdfWithChanges,
  fetchEditPlan,
  fetchInvoice,
  fetchInvoices,
  reextractInvoice,
  restoreInvoice,
  streamInvoiceEvents,
  updateInvoice,
  uploadInvoice,
  type Invoice,
  type InvoiceEvent,
  type InvoiceUpdate,
} from "./api";
import { editedPdfName } from "@/lib/edited-pdf-name";
import { saveBlob } from "@/lib/save-blob";
import { useObjectUrl } from "@/lib/use-object-url";

const INVOICES_KEY = ["invoices"];
const invoiceKey = (id: string) => ["invoice", id];
const RECONNECT_DELAY_MS = 3000;

// Kept fresh by useInvoiceEvents, no polling
export const useInvoices = () => useQuery({ queryKey: INVOICES_KEY, queryFn: fetchInvoices });

// One invoice with its extracted text; refetched when an event says it changed
export const useInvoice = (id: string) => useQuery({ queryKey: invoiceKey(id), queryFn: () => fetchInvoice(id) });

// The uploaded file fetched with the access token, as an object URL
export const useInvoiceFileUrl = (id: string) => {
  const file = useQuery({
    queryKey: ["invoice-file", id],
    queryFn: () => downloadInvoiceFile(id),
    staleTime: Infinity,
  });
  return { url: useObjectUrl(file.data), isError: file.isError };
};

// One page of the uploaded PDF as an image; pages never change, so each is downloaded once
export const useInvoicePageUrl = (id: string, page: number) => {
  const image = useQuery({
    queryKey: ["invoice-page", id, page],
    queryFn: () => downloadInvoicePage(id, page),
    staleTime: Infinity,
  });
  return { url: useObjectUrl(image.data), isError: image.isError };
};

type DownloadRequest = {
  invoice: Invoice;
  // false: the uploaded file; true: a PDF of the saved fields, with `changes` applied when given
  edited: boolean;
  changes?: InvoiceUpdate;
};

// Where the given changes land on the original; the previous plan stays on screen while the next one loads
export const useEditPlan = (id: string, changes: InvoiceUpdate) =>
  useQuery({
    queryKey: ["invoice-edit-plan", id, changes],
    queryFn: () => fetchEditPlan(id, changes),
    placeholderData: keepPreviousData,
    staleTime: Infinity,
  });

// Saves the original file, or the PDF with the user's corrections
export const useDownloadInvoice = () => {
  const { showErrorNotification } = useNotification();

  return useMutation({
    mutationFn: async ({ invoice, edited, changes }: DownloadRequest) => {
      if (!edited) return saveBlob(await downloadInvoiceFile(invoice.id), invoice.filename);
      const pdf = changes
        ? await downloadInvoicePdfWithChanges(invoice.id, changes)
        : await downloadInvoicePdf(invoice.id);
      saveBlob(pdf, editedPdfName(invoice));
    },
    onError: (err) => showErrorNotification(err, "Could not download the invoice"),
  });
};

// Puts a pushed change into the cached list and tells the user when an invoice has been read
const applyInvoiceEvent = (queryClient: QueryClient, notify: NotificationApi, event: InvoiceEvent) => {
  if (event.type === "invoice.deleted") {
    queryClient.setQueryData<Invoice[]>(INVOICES_KEY, (invoices = []) => invoices.filter((inv) => inv.id !== event.id));
    queryClient.removeQueries({ queryKey: invoiceKey(event.id) });
    return;
  }

  const updated = event.invoice;
  // Only the end of a reading is announced, not the user's own saves
  const previous = queryClient.getQueryData<Invoice[]>(INVOICES_KEY)?.find((inv) => inv.id === updated.id);
  const finishedReading = previous?.status === "PROCESSING";
  queryClient.setQueryData<Invoice[]>(INVOICES_KEY, (invoices = []) => {
    const exists = invoices.some((inv) => inv.id === updated.id);
    if (!exists) return [updated, ...invoices];
    return invoices.map((inv) => (inv.id === updated.id ? updated : inv));
  });
  void queryClient.invalidateQueries({ queryKey: invoiceKey(updated.id) });

  if (finishedReading && updated.status === "COMPLETED")
    notify.showSuccessNotification(`Invoice read: ${updated.filename}`);
  if (finishedReading && updated.status === "FAILED")
    notify.showErrorNotification(null, `Could not read ${updated.filename}`);
};

// Live updates pushed by the server (server-sent events); reconnects after a dropped connection
export const useInvoiceEvents = () => {
  const queryClient = useQueryClient();
  const notify = useNotification();

  useEffect(() => {
    const controller = new AbortController();
    let hasConnected = false;

    // After a reconnect, refetch once to pick up anything sent while disconnected
    const onOpen = () => {
      if (hasConnected) void queryClient.invalidateQueries({ queryKey: INVOICES_KEY });
      hasConnected = true;
    };

    const connect = async () => {
      while (!controller.signal.aborted) {
        try {
          await streamInvoiceEvents(controller.signal, onOpen, (event) =>
            applyInvoiceEvent(queryClient, notify, event),
          );
        } catch (error) {
          if (!controller.signal.aborted) console.warn("Invoice events disconnected; reconnecting", error);
        }
        if (controller.signal.aborted) return;
        await new Promise((resolve) => setTimeout(resolve, RECONNECT_DELAY_MS));
      }
    };

    void connect();
    return () => controller.abort();
  }, [queryClient, notify]);
};

export const useUploadInvoice = () => {
  const queryClient = useQueryClient();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  return useMutation({
    mutationFn: uploadInvoice,
    onSuccess: (invoice) => showSuccessNotification(`${invoice.filename} uploaded; reading it now`),
    onError: (err) => showErrorNotification(err, "Could not upload invoice"),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: INVOICES_KEY }),
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  return useMutation({
    mutationFn: updateInvoice,
    onSuccess: (invoice) => {
      showSuccessNotification("Invoice saved");
      void queryClient.invalidateQueries({ queryKey: invoiceKey(invoice.id) });
    },
    onError: (err) => showErrorNotification(err, "Could not save the invoice"),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: INVOICES_KEY }),
  });
};

export const useReextractInvoice = () => {
  const queryClient = useQueryClient();
  const { showErrorNotification } = useNotification();

  return useMutation({
    mutationFn: reextractInvoice,
    onError: (err) => showErrorNotification(err, "Could not read the invoice again"),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: INVOICES_KEY }),
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      showSuccessNotification("Invoice deleted");
      void queryClient.invalidateQueries({ queryKey: INVOICES_KEY });
    },
    onError: (err) => showErrorNotification(err, "Could not delete invoice"),
  });
};

// Moves invoices to the archive; file and data are kept
export const useArchiveInvoices = () => {
  const queryClient = useQueryClient();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map(archiveInvoice)),
    onSuccess: (_, ids) =>
      showSuccessNotification(ids.length === 1 ? "Invoice archived" : `${ids.length} invoices archived`),
    onError: (err) => showErrorNotification(err, "Could not archive the invoices"),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: INVOICES_KEY }),
  });
};

export const useRestoreInvoices = () => {
  const queryClient = useQueryClient();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map(restoreInvoice)),
    onSuccess: (_, ids) =>
      showSuccessNotification(ids.length === 1 ? "Invoice restored" : `${ids.length} invoices restored`),
    onError: (err) => showErrorNotification(err, "Could not restore the invoices"),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: INVOICES_KEY }),
  });
};

// Deletes the selected invoices with one toast for the whole batch
export const useDeleteInvoices = () => {
  const queryClient = useQueryClient();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map(deleteInvoice)),
    onSuccess: (_, ids) => showSuccessNotification(`${ids.length} invoices deleted`),
    onError: (err) => showErrorNotification(err, "Could not delete the invoices"),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: INVOICES_KEY }),
  });
};
