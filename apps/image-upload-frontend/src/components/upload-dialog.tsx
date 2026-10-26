import { useState } from "react";
import { MyUiDialog, MyUiInput, MyUiSwitch } from "my-ui";
import { useUploadImages } from "@/features/images/api/hooks";
import { UploadDropzone } from "./upload-dropzone";

type UploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const UploadDialog = ({ open, onOpenChange }: UploadDialogProps) => {
  const upload = useUploadImages();
  const [schedule, setSchedule] = useState(false);
  // datetime-local value, in the viewer's time zone
  const [publishAt, setPublishAt] = useState("");
  const scheduleInvalid = schedule && (!publishAt || new Date(publishAt).getTime() <= Date.now());

  const onFiles = (files: File[]) => {
    const scheduledAt = schedule ? new Date(publishAt).toISOString() : undefined;
    upload.mutate(
      { files, scheduledAt },
      {
        onSuccess: () => {
          onOpenChange(false);
          setSchedule(false);
          setPublishAt("");
        },
      },
    );
  };

  return (
    <MyUiDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Upload images"
      description="Images go to your gallery right away, or at a time you schedule."
    >
      <div className="space-y-4">
        <MyUiSwitch
          label="Schedule for later"
          description="Scheduled images wait under Scheduled until their time."
          checked={schedule}
          onCheckedChange={setSchedule}
        />
        {schedule && (
          <MyUiInput
            type="datetime-local"
            label="Publish at"
            value={publishAt}
            onChange={(event) => setPublishAt(event.target.value)}
            error={publishAt && scheduleInvalid ? "Pick a time in the future" : undefined}
          />
        )}
        <UploadDropzone onFiles={onFiles} uploading={upload.isPending} disabled={scheduleInvalid} />
      </div>
    </MyUiDialog>
  );
};
