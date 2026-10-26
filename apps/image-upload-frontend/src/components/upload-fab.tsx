import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "my-ui";
import { UploadDialog } from "./upload-dialog";

// Floating "+" at the bottom right; on mobile it sits above the tab bar
export const UploadFab = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="icon"
        aria-label="Upload images"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-20 z-30 size-14 rounded-full shadow-lg md:right-8 md:bottom-8"
      >
        <Plus className="size-6" />
      </Button>
      <UploadDialog open={open} onOpenChange={setOpen} />
    </>
  );
};
