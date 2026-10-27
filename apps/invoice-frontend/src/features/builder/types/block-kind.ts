// Blocks the builder can place on the page; mirrors COMPOSE_BLOCK_KINDS in apps/invoice-backend
export type BlockKind =
  "logo" | "title" | "text" | "details" | "from" | "billTo" | "lineItems" | "totals" | "notes" | "divider";
