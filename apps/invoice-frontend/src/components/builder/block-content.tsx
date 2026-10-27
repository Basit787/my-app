import type { CSSProperties, ReactNode } from "react";
import { ImageIcon } from "lucide-react";
import { useBuilderStore } from "@/features/builder/store/builder-store";
import type { BuilderBlock } from "@/features/builder/types/builder-block";
import { BUILDER_LOOK } from "@/features/builder/utils/builder-look";
import { computeTotals } from "@/features/builder/utils/compute-totals";
import { formatMoney } from "@/features/builder/utils/format-money";

type BlockContentProps = { block: BuilderBlock };

// Shown on the canvas only, where a value is still empty; the PDF leaves it out
const Hint = ({ children }: { children: ReactNode }) => <span className="text-neutral-400 italic">{children}</span>;

// A block drawn the way the PDF draws it: same font, sizes and line height (1 CSS pixel = 1 point on the page)
export const BlockContent = ({ block }: BlockContentProps) => {
  const data = useBuilderStore((state) => state.data);
  const { style } = block;
  const text: CSSProperties = {
    fontFamily: BUILDER_LOOK.fontFamilies[style.font],
    fontSize: style.fontSize,
    color: style.color,
    fontWeight: style.bold ? 700 : 400,
    fontStyle: style.italic ? "italic" : "normal",
    textAlign: style.align,
    lineHeight: BUILDER_LOOK.lineHeight,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  };
  const label: CSSProperties = {
    ...text,
    fontSize: style.fontSize * BUILDER_LOOK.labelScale,
    fontWeight: 700,
    color: BUILDER_LOOK.labelColor,
  };

  switch (block.kind) {
    case "logo":
      return block.imageDataUrl ? (
        <img
          src={block.imageDataUrl}
          alt="Logo"
          style={{ width: block.width, height: block.height }}
          draggable={false}
        />
      ) : (
        <div
          className="flex flex-col items-center justify-center gap-1 rounded border-2 border-dashed border-neutral-300 text-[9px] text-neutral-400"
          style={{ width: block.width, height: block.height ?? block.width }}
        >
          <ImageIcon className="h-5 w-5" />
          Add a logo
        </div>
      );
    case "divider":
      return <div style={{ height: block.height ?? 1, backgroundColor: style.color }} />;
    case "title":
    case "text":
      return <div style={text}>{block.text || <Hint>Empty text</Hint>}</div>;
    case "details": {
      const rows = [
        ["Invoice number", data.invoiceNumber],
        ["Date", data.invoiceDate],
        ["Due date", data.dueDate],
      ].filter(([, value]) => value);
      return <div style={text}>{rows.map(([name, value]) => `${name}: ${value}`).join("\n")}</div>;
    }
    case "from":
    case "billTo": {
      const isFrom = block.kind === "from";
      const name = isFrom ? data.vendorName : data.customerName;
      const address = isFrom ? data.vendorAddress : data.customerAddress;
      return (
        <div>
          <div style={label}>{isFrom ? "FROM" : "BILL TO"}</div>
          <div style={{ ...text, fontWeight: 700, fontSize: style.fontSize * BUILDER_LOOK.nameScale }}>
            {name || <Hint>{isFrom ? "Your business name" : "Customer name"}</Hint>}
          </div>
          {address && <div style={text}>{address}</div>}
          {isFrom && data.vendorTaxId && <div style={text}>Tax ID: {data.vendorTaxId}</div>}
        </div>
      );
    }
    case "lineItems": {
      const columns = BUILDER_LOOK.columns.map((share) => `${share * 100}%`).join(" ");
      const cell = (content: ReactNode, right: boolean, style: CSSProperties) => (
        <div style={{ ...style, textAlign: right ? "right" : "left", paddingLeft: right ? 4 : 0 }}>{content}</div>
      );
      return (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: columns,
              borderBottom: "0.75px solid #cccccc",
              paddingBottom: 2,
            }}
          >
            {cell("DESCRIPTION", false, label)}
            {cell("QTY", true, label)}
            {cell("UNIT PRICE", true, label)}
            {cell("AMOUNT", true, label)}
          </div>
          <div style={{ paddingTop: 6 }}>
            {data.lineItems.map((line, index) => (
              <div key={index} style={{ display: "grid", gridTemplateColumns: columns, paddingBottom: 4 }}>
                {cell(line.description || "—", false, { ...text, textAlign: "left" })}
                {cell(String(line.quantity), true, text)}
                {cell(formatMoney(line.unitPrice, null), true, text)}
                {cell(formatMoney(Math.round(line.quantity * line.unitPrice * 100) / 100, null), true, text)}
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "totals": {
      const totals = computeTotals(data);
      const rows: [string, number, boolean][] = [
        ["Subtotal", totals.subtotal, false],
        [`Tax (${data.taxRate}%)`, totals.taxAmount, false],
        ["Total", totals.totalAmount, true],
      ];
      return (
        <div>
          {rows.map(([name, amount, isTotal]) => {
            const rowStyle = isTotal
              ? { ...text, fontWeight: 700, fontSize: style.fontSize * BUILDER_LOOK.totalScale }
              : text;
            return (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 2 }}>
                <span style={{ ...rowStyle, textAlign: "left" }}>{name}</span>
                <span style={{ ...rowStyle, textAlign: "right" }}>{formatMoney(amount, data.currency || null)}</span>
              </div>
            );
          })}
        </div>
      );
    }
    case "notes":
      return (
        <div>
          <div style={label}>NOTES</div>
          <div style={text}>{data.notes || <Hint>Add notes in the invoice details</Hint>}</div>
        </div>
      );
  }
};
