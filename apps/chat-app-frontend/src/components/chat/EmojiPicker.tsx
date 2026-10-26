import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "my-ui";
import { EMOJI_CATEGORIES, QUICK_EMOJIS } from "@/lib/emojis";
import { addRecentEmoji, getRecentEmojis } from "@/lib/recent-emojis";
import { cn } from "@/lib/utils";

type EmojiPickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  className?: string;
};

export const EmojiPicker = ({ open, onClose, onSelect, className }: EmojiPickerProps) => {
  const [recent, setRecent] = useState(getRecentEmojis);
  const [activeCategory, setActiveCategory] = useState("smileys");
  const panelRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => {
    return EMOJI_CATEGORIES.map((category) =>
      category.id === "recent" ? { ...category, emojis: recent.length > 0 ? recent : QUICK_EMOJIS } : category,
    );
  }, [recent]);

  const activeEmojis = categories.find((c) => c.id === activeCategory)?.emojis ?? [];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSelect = (emoji: string) => {
    const updated = addRecentEmoji(emoji);
    setRecent(updated);
    onSelect(emoji);
  };

  return (
    <div
      ref={panelRef}
      className={cn(
        "absolute bottom-full right-0 z-50 mb-2 w-[min(100vw-2rem,320px)] overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl",
        className,
      )}
    >
      <div className="flex gap-1 overflow-x-auto border-b border-border px-2 py-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            type="button"
            variant={activeCategory === category.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveCategory(category.id)}
            className={cn(
              "shrink-0 rounded-lg px-2.5 py-1 text-xs h-auto",
              activeCategory !== category.id && "text-muted-foreground",
            )}
          >
            {category.label}
          </Button>
        ))}
      </div>

      <div className="grid max-h-48 grid-cols-8 gap-0.5 overflow-y-auto p-2">
        {activeEmojis.map((emoji) => (
          <Button
            key={`${activeCategory}-${emoji}`}
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleSelect(emoji)}
            className="h-9 w-9 rounded-lg text-xl"
            aria-label={`Insert ${emoji}`}
          >
            {emoji}
          </Button>
        ))}
      </div>
    </div>
  );
};
