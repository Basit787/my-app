import type { EditPlacement, EditPlan } from "@/features/invoices/api/api";

type EditOverlayProps = { plan: EditPlan; pageIndex: number };

// The browser fonts that match the PDF standard fonts the download uses
const FONT_FAMILIES: Record<EditPlacement["font"], string> = {
  sans: "Helvetica, Arial, 'Liberation Sans', sans-serif",
  serif: "'Times New Roman', Times, 'Liberation Serif', serif",
  mono: "'Courier New', Courier, 'Liberation Mono', monospace",
};

// The plan's placements on one page, drawn over its image the way the downloaded PDF draws them.
// Positions are shares of the page; font sizes use cqw, so they scale with the image (its parent is a @container).
export const EditOverlay = ({ plan, pageIndex }: EditOverlayProps) => {
  const page = plan.pages[pageIndex];
  if (!page) return null;
  const left = (x: number) => `${(x / page.width) * 100}%`;
  const top = (y: number) => `${(y / page.height) * 100}%`;

  return (
    <div className="pointer-events-none absolute inset-0">
      {plan.placements
        .filter((placement) => placement.page === pageIndex)
        .map((placement) => (
          <div key={placement.field} title={placement.field}>
            {placement.cover.map((rect, index) => (
              <div
                key={index}
                className="absolute"
                style={{
                  backgroundColor: rect.color,
                  left: left(rect.x),
                  top: top(rect.y),
                  width: left(rect.width),
                  height: top(rect.height),
                }}
              />
            ))}
            {placement.lines.map((line, index) => (
              <div
                key={index}
                className="absolute flex items-center whitespace-pre"
                style={{
                  color: placement.color,
                  fontWeight: placement.bold ? 700 : 400,
                  fontStyle: placement.italic ? "italic" : "normal",
                  ...(placement.align === "right"
                    ? { right: left(page.width - placement.x) }
                    : { left: left(placement.x) }),
                  top: top(placement.y + index * placement.lineHeight),
                  height: top(placement.boxHeight),
                  fontFamily: FONT_FAMILIES[placement.font],
                  fontSize: `${(placement.fontSize / page.width) * 100}cqw`,
                  lineHeight: 1,
                }}
              >
                {line}
              </div>
            ))}
          </div>
        ))}
    </div>
  );
};
