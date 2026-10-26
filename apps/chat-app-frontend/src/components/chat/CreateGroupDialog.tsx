import { useEffect, useMemo } from "react";
import { z } from "zod";
import { AppDialog, Button, fieldError, Label, useAppForm } from "my-ui";
import { UserAvatar } from "@/components/avatar/user-avatar";
import { useCreateGroup } from "@/features/chat/api/hooks";
import { useChatStore } from "@/features/chat/store/chat-store";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

const createGroupSchema = z.object({
  name: z.string().trim().min(1, "Group name is required").max(64, "Group name must be at most 64 characters"),
  description: z.string().max(500, "Description must be at most 500 characters"),
  members: z.array(z.string()).min(1, "Select at least one member"),
});

type CreateGroupDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const CreateGroupDialog = ({ open, onClose }: CreateGroupDialogProps) => {
  const username = useAuthStore((s) => s.username);
  const onlineUsers = useChatStore((s) => s.onlineUsers);
  const knownContacts = useChatStore((s) => s.knownContacts);
  const createGroup = useCreateGroup();

  const form = useAppForm({
    defaultValues: { name: "", description: "", members: [] as string[] },
    validators: { onChange: createGroupSchema },
    onSubmit: ({ value, formApi }) => {
      createGroup.mutate(
        { name: value.name.trim(), members: value.members, description: value.description },
        {
          onSuccess: () => {
            formApi.reset();
            onClose();
          },
        },
      );
    },
  });

  const candidates = useMemo(() => {
    const merged = new Set([...knownContacts, ...onlineUsers.filter((u) => u !== username)]);
    return [...merged].filter((u) => u !== username).sort((a, b) => a.localeCompare(b));
  }, [knownContacts, onlineUsers, username]);

  useEffect(() => {
    if (open) form.reset();
  }, [open, form]);

  const handleClose = () => {
    if (createGroup.isPending) return;
    form.reset();
    onClose();
  };

  return (
    <AppDialog open={open} onClose={handleClose} title="Create group" className="sm:max-w-sm">
      <form.AppForm>
        <form.Form className="space-y-4 p-4">
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Group name"
                placeholder="e.g. Project team"
                maxLength={64}
                className="[&_input]:rounded-xl"
              />
            )}
          </form.AppField>

          <form.AppField name="description">
            {(field) => (
              <field.TextareaField
                label="Description (optional)"
                placeholder="What is this group about?"
                maxLength={500}
                rows={2}
                className="[&_textarea]:resize-none [&_textarea]:rounded-xl [&_textarea]:bg-input"
              />
            )}
          </form.AppField>

          <form.Field name="members">
            {(field) => {
              const toggleMember = (member: string) => {
                const current = field.state.value;
                field.handleChange(
                  current.includes(member) ? current.filter((m) => m !== member) : [...current, member],
                );
              };
              const error = fieldError(field.state.meta);
              return (
                <div className="space-y-2">
                  <Label>Add members</Label>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-border">
                    {candidates.length === 0 ? (
                      <p className="px-3 py-4 text-sm text-muted-foreground">No contacts available</p>
                    ) : (
                      candidates.map((member) => {
                        const isSelected = field.state.value.includes(member);
                        const online = onlineUsers.includes(member);
                        return (
                          <Button
                            key={member}
                            type="button"
                            variant="ghost"
                            onClick={() => toggleMember(member)}
                            className={cn(
                              "h-auto w-full justify-start gap-3 rounded-none px-3 py-2.5 font-normal",
                              isSelected && "bg-accent/70 hover:bg-accent/70",
                            )}
                          >
                            <UserAvatar name={member} showOnline online={online} className="h-9 w-9" />
                            <div className="min-w-0">
                              <span className="text-sm font-medium">{member}</span>
                              <p className={cn("text-xs", online ? "text-online" : "text-muted-foreground")}>
                                {online ? "Online" : "Offline"}
                              </p>
                            </div>
                          </Button>
                        );
                      })
                    )}
                  </div>
                  {error && <p className="text-xs text-destructive">{error}</p>}
                </div>
              );
            }}
          </form.Field>

          <form.SubmitButton className="w-full rounded-xl" loading={createGroup.isPending}>
            {createGroup.isPending ? "Creating…" : "Create group"}
          </form.SubmitButton>
        </form.Form>
      </form.AppForm>
    </AppDialog>
  );
};
