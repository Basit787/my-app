import { createContext, useContext } from "react";
import type { Socket } from "socket.io-client";
import type { useWebRTC } from "@/lib/useWebRTC";
import type { useGroupWebRTC } from "@/lib/useGroupWebRTC";
import type { CallHistoryEntry, ChatGroup, ChatMessage } from "@/features/chat/api/api";

type RemoteParticipant = {
  username: string;
  stream: MediaStream | null;
};

export type ChatRoomActions = {
  startAudioCall: () => void;
  startVideoCall: () => void;
  endCall: () => void;
  acceptIncomingDmCall: () => void;
  acceptIncomingGroupCall: () => void;
  openGroupInfo: () => void;
  closeGroupInfo: () => void;
  /** Opens contact info for `user`, defaulting to the peer of the open DM */
  openContactInfo: (user?: string) => void;
  closeContactInfo: () => void;
};

export type ChatRoomContextValue = {
  username: string;
  socket: Socket | null;
  room: string;
  activeConversationId: string;
  isDm: boolean;
  isGroup: boolean;
  inCall: boolean;
  groupLabel: string;
  activeGroup: ChatGroup | undefined;
  showGroupInfo: boolean;
  groupInfoOpen: boolean;
  /** Whose contact info is showing, or null when closed */
  contactInfoUser: string | null;
  visibleMessages: ChatMessage[];
  visibleCalls: CallHistoryEntry[];
  remoteParticipants: RemoteParticipant[];
  dmCall: ReturnType<typeof useWebRTC>;
  groupCall: ReturnType<typeof useGroupWebRTC>;
  actions: ChatRoomActions;
  bottomRef: React.RefObject<HTMLDivElement | null>;
};

export const ChatRoomContext = createContext<ChatRoomContextValue | null>(null);

export const useChatRoom = () => {
  const value = useContext(ChatRoomContext);
  if (!value) {
    throw new Error("useChatRoom must be used within ChatRoomProvider");
  }
  return value;
};
