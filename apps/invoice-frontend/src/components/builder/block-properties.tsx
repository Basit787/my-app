import { Trash2, X } from "lucide-react";
import { MyUiButton, MyUiInput, MyUiNativeSelect, MyUiTextarea, MyUiToggleGroup } from "my-ui";
import { useBuilderStore } from "@/features/builder/store/builder-store";
import type { BlockStyle } from "@/features/builder/types/block-style";
import { BLOCK_CATALOG } from "@/features/builder/utils/block-catalog";

// Logos are kept in the invoice as data, so very large images are refused
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

// Style and content of the selected block
export const BlockProperties = () => {
  const block = useBuilderStore((state) => state.blocks.find((candidate) => candidate.id === state.selectedId));
  const updateBlock = useBuilderStore((state) => state.updateBlock);
  const removeBlock = useBuilderStore((state) => state.removeBlock);
  const select = useBuilderStore((state) => state.select);
  if (!block) return null;

  const setStyle = (changes: Partial<BlockStyle>) => updateBlock(block.id, { style: { ...block.style, ...changes } });
  const hasText = block.kind !== "logo" && block.kind !== "divider";

  const onLogo = (file: File | undefined) => {
    if (!file || !["image/png", "image/jpeg"].includes(file.type) || file.size > MAX_LOGO_BYTES) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      // The height follows the image's own proportions
      const image = new Image();
      image.onload = () =>
        updateBlock(block.id, { imageDataUrl: dataUrl, height: (image.height / image.width) * block.width });
      image.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2">
        <h3 className="flex-1 text-sm font-semibold">{BLOCK_CATALOG[block.kind].label}</h3>
        <MyUiButton
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Delete block"
          onClick={() => removeBlock(block.id)}
        >
          <Trash2 />
        </MyUiButton>
        <MyUiButton type="button" variant="ghost" size="icon" aria-label="Close" onClick={() => select(null)}>
          <X />
        </MyUiButton>
      </div>

      {(block.kind === "title" || block.kind === "text") && (
        <MyUiTextarea
          label="Text"
          rows={3}
          value={block.text ?? ""}
          onChange={(event) => updateBlock(block.id, { text: event.target.value })}
        />
      )}

      {block.kind === "logo" && (
        <MyUiInput
          label="Logo image"
          description="PNG or JPG, up to 2 MB"
          type="file"
          accept="image/png,image/jpeg"
          onChange={(event) => onLogo(event.target.files?.[0])}
        />
      )}

      {block.kind === "divider" && (
        <MyUiInput
          label="Thickness (pt)"
          type="number"
          min={0.5}
          max={20}
          step={0.5}
          value={block.height ?? 1}
          onChange={(event) => updateBlock(block.id, { height: Number(event.target.value) || 1 })}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        {hasText && (
          <MyUiInput
            label="Font size (pt)"
            type="number"
            min={4}
            max={96}
            value={block.style.fontSize}
            onChange={(event) => setStyle({ fontSize: Math.min(96, Math.max(4, Number(event.target.value) || 10)) })}
          />
        )}
        {block.kind !== "logo" && (
          <MyUiInput
            label="Colour"
            type="color"
            value={block.style.color}
            onChange={(event) => setStyle({ color: event.target.value })}
          />
        )}
      </div>

      {hasText && (
        <>
          <MyUiNativeSelect
            label="Font"
            value={block.style.font}
            onChange={(event) => setStyle({ font: event.target.value as BlockStyle["font"] })}
            options={[
              { value: "sans", label: "Sans serif (Helvetica)" },
              { value: "serif", label: "Serif (Times)" },
              { value: "mono", label: "Monospace (Courier)" },
            ]}
          />
          <div className="flex flex-wrap gap-2">
            <MyUiToggleGroup
              type="multiple"
              variant="outline"
              size="sm"
              value={[block.style.bold ? "bold" : "", block.style.italic ? "italic" : ""].filter(Boolean)}
              onValueChange={(values: string[]) =>
                setStyle({ bold: values.includes("bold"), italic: values.includes("italic") })
              }
              items={[
                { value: "bold", label: <span className="font-bold">B</span>, ariaLabel: "Bold" },
                { value: "italic", label: <span className="italic">I</span>, ariaLabel: "Italic" },
              ]}
            />
            <MyUiToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={block.style.align}
              onValueChange={(value: string) => value && setStyle({ align: value as BlockStyle["align"] })}
              items={[
                { value: "left", label: "Left" },
                { value: "center", label: "Centre" },
                { value: "right", label: "Right" },
              ]}
            />
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        Drag the block to move it, its right edge to resize; arrow keys nudge it, Delete removes it.
      </p>
    </div>
  );
};
