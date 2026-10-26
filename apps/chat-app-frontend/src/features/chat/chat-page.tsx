import { useEffect, useState } from "react";
import { AppHeader } from "frontend-common";
import { ChatWindow } from "@/components/layout/ChatWindow";
import { ConversationSidebar } from "@/components/layout/ConversationSidebar";
import { Button, AppDialog } from "my-ui";
import { authClient } from "@/lib/auth";
import { queryClient } from "@/lib/query-client";
import { toastSuccess } from "@/lib/toast";
import { useChatStore } from "@/features/chat/store/chat-store";
import { useBackButtonClose } from "@/lib/use-back-close";

export const ChatPage = () => {
  const resetChat = useChatStore((s) => s.reset);
  const mobileChatOpen = useChatStore((s) => s.mobileChatOpen);
  const closeMobileChat = useChatStore((s) => s.closeMobileChat);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // On phones, the system back button/gesture returns from a chat to the conversation list
  useBackButtonClose(mobileChatOpen, closeMobileChat, "mobileChat");

  // Signing out (or a revoked session) unmounts the page: drop this user's chat data
  useEffect(
    () => () => {
      resetChat();
      queryClient.clear();
    },
    [resetChat],
  );

  const handleLogout = async () => {
    setLoggingOut(true);
    await authClient.signOut();
    toastSuccess("Signed out successfully");
  };

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background pt-(--call-bar-h)">
      <AppHeader app="Chat" className="max-md:hidden" />
      <div className="flex min-h-0 flex-1">
        <ConversationSidebar onLogout={() => setLogoutOpen(true)} />
        <ChatWindow />
      </div>

      <AppDialog open={logoutOpen} onClose={() => setLogoutOpen(false)} title="Log out?" className="sm:max-w-sm">
        <div className="p-4">
          <p className="text-sm text-muted-foreground">Are you sure you want to sign out of ChatWave?</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setLogoutOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={() => void handleLogout()} disabled={loggingOut}>
              {loggingOut ? "Signing out…" : "Log out"}
            </Button>
          </div>
        </div>
      </AppDialog>
    </div>
  );
};
