import { Link } from "@tanstack/react-router";
import { FilePlus2, ReceiptText } from "lucide-react";

const TAB =
  "flex items-center gap-2 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";

// The app's two sections: the uploaded/saved invoices and the builder
export const InvoicesTabs = () => (
  <nav className="flex gap-1 border-b px-4 md:px-6" aria-label="Sections">
    <Link
      to="/"
      className={TAB}
      activeOptions={{ exact: true }}
      activeProps={{ className: "border-primary text-foreground" }}
    >
      <ReceiptText className="h-4 w-4" />
      Invoices
    </Link>
    <Link to="/create" className={TAB} activeProps={{ className: "border-primary text-foreground" }}>
      <FilePlus2 className="h-4 w-4" />
      Create invoice
    </Link>
  </nav>
);
