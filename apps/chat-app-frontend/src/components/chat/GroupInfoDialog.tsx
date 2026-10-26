import { useEffect, useRef } from "react";
import { z } from "zod";
import { format } from "date-fns";
import { Camera, Crown, Loader2, Trash2, Users } from "lucide-react";
import { AppDialog, Button, Input, useAppForm } from "my-ui";
import { GroupAvatar } from "@/components/avatar/group-avatar";
import { UserAvatar } from "@/components/avatar/user-avatar";
import { useGroupQuery, useRemoveGroupPhoto, useUpdateGroup, useUploadGroupPhoto } from "@/features/chat/api/hooks";
import { useChatRoom } from "@/features/chat/context/use-chat-room";
import { useAuthStore } from "@/lib/auth-store";
import { useChatStore } from "@/features/chat/store/chat-store";
import { effectivePresenceStatus, presenceStatusLabel } from "@/lib/presence";
import { toastError } from "@/lib/toast";
import { cn } from "@/lib/utils";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const updateGroupSchema = z.object({
  name: z.string().trim().min(1, "Group name is required").max(64, "Group name must be at most 64 characters"),
  description: z.string().max(500, "Description must be at most 500 characters"),
});

export const GroupInfoDialog = () => {
  const { groupInfoOpen, activeGroup, actions } = useChatRoom();
  const open = groupInfoOpen;
  const group = activeGroup ?? null;
  const onClose = actions.closeGroupInfo;
  const username = useAuthStore((s) => s.username);
  const onlineUsers = useChatStore((s) => s.onlineUsers);
  const userStatuses = useChatStore((s) => s.userStatuses);
  const inputRef = useRef<HTMLInputElement>(null);

  const groupQuery = useGroupQuery(group?.id, open);
  const details = groupQuery.data ?? group;
  const groupId = details?.id ?? "";

  const saveDetails = useUpdateGroup(groupId);
  const uploadPhoto = useUploadGroupPhoto(groupId);
  const deletePhoto = useRemoveGroupPhoto(groupId);

  const isCreator = details?.createdBy === username;

  const form = useAppForm({
    defaultValues: { name: "", description: "" },
    validators: { onChange: updateGroupSchema },
    onSubmit: ({ value }) => {
      if (!groupId) return;
      saveDetails.mutate({ name: value.name.trim(), description: value.description });
    },
  });

  useEffect(() => {
    if (!details) return;
    form.reset({ name: details.name, description: details.description ?? "" });
  }, [details, form]);

  const handlePhoto = (file: File | undefined) => {
    if (!file || !isCreator || !groupId) return;
    if (!file.type.startsWith("image/")) {
      toastError(null, "Please choose an image file");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toastError(null, "Image must be 5 MB or smaller");
      return;
    }
    uploadPhoto.mutate(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const photoBusy = uploadPhoto.isPending || deletePhoto.isPending;

  if (!details) return null;

  return (
    <AppDialog open={open} onClose={onClose} title="Group info" className="sm:max-w-md">
      <div className="max-h-[80vh] overflow-y-auto p-4">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <GroupAvatar
              groupId={details.id}
              name={details.name}
              imageUrl={details.image}
              className="h-24 w-24 [&_span]:h-24 [&_span]:w-24 [&_span]:text-2xl"
            />
            {isCreator && (
              <Button
                type="button"
                size="icon"
                className="absolute bottom-0 right-0 h-9 w-9 rounded-full shadow-md"
                disabled={photoBusy}
                onClick={() => inputRef.current?.click()}
                aria-label="Upload group photo"
              >
                {uploadPhoto.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </Button>
            )}
            <Input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhoto(e.target.files?.[0])}
            />
          </div>

          {isCreator ? (
            <form.AppForm>
              <form.Form className="mt-4 w-full space-y-3 text-left">
                <form.AppField name="name">
                  {(field) => <field.TextField label="Group name" maxLength={64} className="[&_input]:rounded-xl" />}
                </form.AppField>
                <form.AppField name="description">
                  {(field) => (
                    <field.TextareaField
                      label="Description"
                      maxLength={500}
                      rows={3}
                      placeholder="What is this group about?"
                      className="[&_textarea]:resize-none [&_textarea]:rounded-xl [&_textarea]:bg-input"
                    />
                  )}
                </form.AppField>
                <form.SubmitButton size="sm" className="rounded-xl" loading={saveDetails.isPending} disabled={!groupId}>
                  {saveDetails.isPending ? "Saving…" : "Save details"}
                </form.SubmitButton>
              </form.Form>
            </form.AppForm>
          ) : (
            <>
              <h3 className="mt-4 text-lg font-semibold">{details.name}</h3>
              {details.description ? (
                <p className="mt-2 text-sm text-muted-foreground">{details.description}</p>
              ) : (
                <p className="mt-2 text-sm italic text-muted-foreground">No description</p>
              )}
            </>
          )}

          {isCreator && details.image && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-3 gap-2 text-muted-foreground"
              disabled={photoBusy || !groupId}
              onClick={() => deletePhoto.mutate()}
            >
              {deletePhoto.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Remove photo
            </Button>
          )}
        </div>

        <div className="mt-6 space-y-2 rounded-xl border border-border bg-card/50 p-4 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Created by</span>
            <span className="flex items-center gap-1.5 font-medium">
              {details.createdBy === username && <Crown className="h-3.5 w-3.5 text-amber-500" />}
              {details.createdBy}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Created</span>
            <span>{details.createdAt ? format(new Date(details.createdAt), "MMM d, yyyy") : "—"}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Members</span>
            <span>{details.members.length}</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Users className="h-4 w-4" />
            Participants
          </div>
          <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-border">
            {details.members.map((member) => {
              const status = effectivePresenceStatus(member, onlineUsers, userStatuses);
              const isSelf = member === username;
              return (
                <div key={member} className={cn("flex items-center gap-3 px-3 py-2.5", isSelf && "bg-accent/40")}>
                  <UserAvatar name={member} showOnline status={status} className="h-9 w-9" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {member}
                      {isSelf && <span className="ml-1 text-xs text-muted-foreground">(you)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member === details.createdBy ? "Admin · " : ""}
                      {presenceStatusLabel(status)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppDialog>
  );
};
