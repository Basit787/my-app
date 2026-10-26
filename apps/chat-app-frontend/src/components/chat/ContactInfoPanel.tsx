import { useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, FileText, Link2, MessageSquare, Phone, Play, Video, X } from "lucide-react";
import { UserAvatar } from "@/components/avatar/user-avatar";
import { GroupAvatar } from "@/components/avatar/group-avatar";
import { AppDialog } from "my-ui";
import { FilePreviewModal } from "@/components/chat/FileAttachment";
import { getFileCategory, formatFileSize } from "frontend-common";
import { effectivePresenceStatus, presenceStatusLabel } from "@/lib/presence";
import { useFileBlob } from "@/lib/useFileBlob";
import { useUserProfileImage } from "@/lib/use-user-profile-image";
import { useAvatarSrc } from "@/lib/use-avatar-src";
import { useBackButtonClose } from "@/lib/use-back-close";
import { cn } from "@/lib/utils";
import type { ChatMessage, MessageFile } from "@/features/chat/api/api";
import { useChatRoom } from "@/features/chat/context/use-chat-room";
import { messagesForConversation, useChatStore } from "@/features/chat/store/chat-store";

const URL_PATTERN = /https?:\/\/[^\s]+/i;
const MEDIA_PREVIEW_COUNT = 6;

type FileMessage = ChatMessage & { file: MessageFile };

const MediaThumb = ({ message, onOpen }: { message: FileMessage; onOpen: () => void }) => {
  const isVideo = getFileCategory(message.file.mimeType) === "video";
  const { blobUrl } = useFileBlob(message.room, message.file.id, true);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative aspect-square overflow-hidden rounded-md bg-muted"
      aria-label={isVideo ? "Open video" : "Open photo"}
    >
      {blobUrl &&
        (isVideo ? (
          <video src={blobUrl} muted preload="metadata" className="h-full w-full object-cover" />
        ) : (
          <img src={blobUrl} alt="" className="h-full w-full object-cover" />
        ))}
      {isVideo && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/25">
          <Play className="h-5 w-5 fill-white text-white" />
        </span>
      )}
    </button>
  );
};

const Section = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <section className={cn("bg-background px-5 py-4", className)}>{children}</section>
);

const ActionButton = ({
  label,
  icon: Icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: typeof Phone;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex w-24 flex-col items-center gap-1.5 rounded-xl border border-border py-3 text-primary transition-colors hover:bg-accent disabled:opacity-40"
  >
    <Icon className="h-5 w-5" />
    <span className="text-xs font-medium text-foreground">{label}</span>
  </button>
);

/** Icon box + text for one row in the docs / links lists. */
const SharedRow = ({ icon: Icon, children }: { icon: typeof Phone; children: React.ReactNode }) => (
  <>
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
      <Icon className="h-5 w-5 text-muted-foreground" />
    </span>
    <span className="min-w-0">{children}</span>
  </>
);

const SHARED_ROW = "flex w-full items-center gap-3 rounded-lg px-1 py-2 text-left hover:bg-accent";

/** WhatsApp-style "Contact info": photo, status, call/message buttons, shared media, groups in common. */
export const ContactInfoPanel = () => {
  const { contactInfoUser, actions } = useChatRoom();
  useBackButtonClose(!!contactInfoUser, actions.closeContactInfo, "contactInfo");
  // Mounted only while open, so a hidden panel doesn't re-filter messages on every store change
  return contactInfoUser ? <ContactInfo peer={contactInfoUser} /> : null;
};

const ContactInfo = ({ peer }: { peer: string }) => {
  const { activeConversationId, username, inCall, dmCall, actions } = useChatRoom();
  const messages = useChatStore((s) => s.messages);
  const hiddenMessageIds = useChatStore((s) => s.hiddenMessageIds);
  const onlineUsers = useChatStore((s) => s.onlineUsers);
  const userStatuses = useChatStore((s) => s.userStatuses);
  const groups = useChatStore((s) => s.groups);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const profileImage = useUserProfileImage(peer);
  const photoSrc = useAvatarSrc(peer, profileImage);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [showAllMedia, setShowAllMedia] = useState(false);
  const [preview, setPreview] = useState<FileMessage | null>(null);

  // Shared media always comes from the private chat with this person, wherever the panel was opened from
  const { media, docs, links } = useMemo(() => {
    const live = messagesForConversation(messages, peer, username, hiddenMessageIds).filter((m) => !m.deleted);
    const files = live.filter((m): m is FileMessage => m.type === "file" && !!m.file).reverse();
    return {
      media: files.filter((m) => ["image", "video"].includes(getFileCategory(m.file.mimeType))),
      docs: files.filter((m) => ["pdf", "document", "other"].includes(getFileCategory(m.file.mimeType))),
      links: live
        .filter((m) => m.type !== "file")
        .map((m) => ({ message: m, url: URL_PATTERN.exec(m.text)?.[0] }))
        .filter((l): l is { message: ChatMessage; url: string } => !!l.url)
        .reverse(),
    };
  }, [hiddenMessageIds, messages, peer, username]);

  const groupsInCommon = groups.filter((g) => g.members.includes(peer) && g.members.includes(username));
  const status = effectivePresenceStatus(peer, onlineUsers, userStatuses);
  const sharedCount = media.length + docs.length + links.length;
  const inThisChat = activeConversationId === peer;

  const startCall = (kind: "audio" | "video") => {
    actions.closeContactInfo();
    if (!inThisChat) setActiveConversation(peer);
    void dmCall.startCall(peer, kind);
  };

  const openChat = () => {
    actions.closeContactInfo();
    setActiveConversation(peer);
  };

  return (
    <aside
      className="absolute inset-0 z-30 flex flex-col bg-muted md:left-auto md:w-[400px] md:border-l md:border-border md:shadow-xl"
      aria-label="Contact info"
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-background px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={actions.closeContactInfo}
          aria-label="Close contact info"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5 md:hidden" />
          <X className="hidden h-5 w-5 md:block" />
        </button>
        <h2 className="text-base font-medium">Contact info</h2>
      </header>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pb-6">
        <Section className="flex flex-col items-center pt-6 text-center">
          <button
            type="button"
            onClick={() => profileImage && setPhotoOpen(true)}
            className={cn("rounded-full", profileImage ? "cursor-zoom-in" : "cursor-default")}
            aria-label="View profile photo"
          >
            <UserAvatar name={peer} imageUrl={profileImage} className="h-36 w-36" fallbackClassName="text-5xl" />
          </button>
          <h3 className="mt-4 text-2xl font-medium">{peer}</h3>
          <p className={cn("mt-1 text-sm", status === "offline" ? "text-muted-foreground" : "text-primary")}>
            {presenceStatusLabel(status)}
          </p>
          <div className="mt-5 flex gap-3">
            {!inThisChat && <ActionButton label="Message" icon={MessageSquare} onClick={openChat} />}
            <ActionButton label="Audio" icon={Phone} onClick={() => startCall("audio")} disabled={inCall} />
            <ActionButton label="Video" icon={Video} onClick={() => startCall("video")} disabled={inCall} />
          </div>
        </Section>

        <Section>
          <button
            type="button"
            onClick={() => setShowAllMedia((v) => !v)}
            className="flex w-full items-center justify-between text-sm text-muted-foreground"
            disabled={sharedCount === 0}
          >
            <span>Media, links and docs</span>
            <span className="flex items-center gap-1">
              {sharedCount}
              {sharedCount > 0 && (
                <ChevronRight className={cn("h-4 w-4 transition-transform", showAllMedia && "rotate-90")} />
              )}
            </span>
          </button>

          {media.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {(showAllMedia ? media : media.slice(0, MEDIA_PREVIEW_COUNT)).map((m) => (
                <MediaThumb key={m.id ?? m.file.id} message={m} onOpen={() => setPreview(m)} />
              ))}
            </div>
          )}

          {showAllMedia && docs.length > 0 && (
            <ul className="mt-3 space-y-1">
              {docs.map((m) => (
                <li key={m.id ?? m.file.id}>
                  <button type="button" onClick={() => setPreview(m)} className={SHARED_ROW}>
                    <SharedRow icon={FileText}>
                      <span className="block truncate text-sm">{m.file.name}</span>
                      <span className="text-xs text-muted-foreground">{formatFileSize(m.file.size)}</span>
                    </SharedRow>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {showAllMedia && links.length > 0 && (
            <ul className="mt-3 space-y-1">
              {links.map(({ message, url }) => (
                <li key={message.id ?? message.at}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className={SHARED_ROW}>
                    <SharedRow icon={Link2}>
                      <span className="block truncate text-sm text-primary">{url}</span>
                    </SharedRow>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {groupsInCommon.length > 0 && (
          <Section className="px-2">
            <p className="px-3 pb-2 text-sm text-muted-foreground">
              {groupsInCommon.length} group{groupsInCommon.length === 1 ? "" : "s"} in common
            </p>
            {groupsInCommon.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setActiveConversation(g.room)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-accent"
              >
                <GroupAvatar groupId={g.id} name={g.name} imageUrl={g.image} className="h-10 w-10" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{g.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{g.members.join(", ")}</span>
                </span>
              </button>
            ))}
          </Section>
        )}
      </div>

      {profileImage && (
        <AppDialog open={photoOpen} onClose={() => setPhotoOpen(false)} title={peer} className="sm:max-w-lg">
          <img src={photoSrc} alt={peer} className="max-h-[75vh] w-full object-contain" />
        </AppDialog>
      )}
      {preview && <FilePreviewModal open onClose={() => setPreview(null)} room={preview.room} file={preview.file} />}
    </aside>
  );
};
