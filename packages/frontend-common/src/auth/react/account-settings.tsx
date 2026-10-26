import { Button, MyUiAvatar } from "my-ui";
import { Camera, Trash2 } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { LegalLinks } from "../../legal/legal-links";
import { DeleteAccountPage } from "./delete-account-page";
import { useAuth } from "./use-auth";

type AccountSettingsProps = {
  onSuccess?: (message: string) => void;
  onError?: (error: unknown, fallback: string) => void;
  // The page's own cards (theme, sign out…): shown before "Delete account", hidden on the delete screen
  children?: ReactNode;
};

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

// Profile photo, name, email and a link to account deletion, saved to the auth service for every app
export const AccountSettings = ({ onSuccess, onError, children }: AccountSettingsProps) => {
  const { user, client } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);
  const avatar = client.avatarUrl(user?.image);

  const runTask = async (task: () => Promise<void>, success: string, fallback: string) => {
    setBusy(true);
    try {
      await task();
      onSuccess?.(success);
    } catch (error) {
      onError?.(error, fallback);
    } finally {
      setBusy(false);
    }
  };

  const uploadPhoto = (file: File | undefined) => {
    if (photoInput.current) photoInput.current.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return onError?.(null, "Please choose an image file");
    if (file.size > MAX_PHOTO_BYTES) return onError?.(null, "Image must be 5 MB or smaller");
    void runTask(() => client.uploadAvatar(file), "Profile photo updated", "Could not upload photo");
  };

  if (deleting) return <DeleteAccountPage onBack={() => setDeleting(false)} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <MyUiAvatar name={user?.name ?? ""} src={avatar} className="size-24 text-2xl" />
          <Button
            type="button"
            size="icon"
            className="absolute right-0 bottom-0 size-8 rounded-full shadow-md"
            disabled={busy}
            onClick={() => photoInput.current?.click()}
            aria-label={avatar ? "Change profile photo" : "Upload profile photo"}
          >
            <Camera />
          </Button>
          <input
            ref={photoInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => uploadPhoto(e.target.files?.[0])}
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        {avatar && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            disabled={busy}
            onClick={() => void runTask(client.removeAvatar, "Profile photo removed", "Could not remove photo")}
          >
            <Trash2 />
            Remove photo
          </Button>
        )}
      </div>

      {children}

      <Button type="button" variant="destructive" className="w-full gap-2" onClick={() => setDeleting(true)}>
        <Trash2 className="h-4 w-4" />
        Delete account
      </Button>

      <LegalLinks />
    </div>
  );
};
