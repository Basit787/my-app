import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotification } from "my-ui";
import { saveBlob } from "@/lib/save-blob";
import { composeInvoice, downloadComposedPdf, type ComposeInvoice } from "./api";

export const useComposeInvoice = () => {
  const queryClient = useQueryClient();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  return useMutation({
    mutationFn: composeInvoice,
    onSuccess: (invoice) => showSuccessNotification(`${invoice.filename} saved to your invoices`),
    onError: (err) => showErrorNotification(err, "Could not save the invoice"),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });
};

export const useDownloadComposedPdf = () => {
  const { showErrorNotification } = useNotification();

  return useMutation({
    mutationFn: async (design: ComposeInvoice) => {
      const name = (design.data.invoiceNumber.trim() || "invoice").replace(/[^\w.-]+/g, "_");
      saveBlob(await downloadComposedPdf(design), `${name}.pdf`);
    },
    onError: (err) => showErrorNotification(err, "Could not create the PDF"),
  });
};
