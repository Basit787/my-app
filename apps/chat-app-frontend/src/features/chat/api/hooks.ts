import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import {
  createGroup,
  deleteMessage,
  fetchCallHistory,
  fetchContacts,
  fetchGroup,
  fetchGroups,
  fetchMessages,
  removeGroupPhoto,
  updateGroup,
  uploadFile,
  uploadGroupPhoto,
  type ChatGroup,
  type ChatMessage,
  type CreateGroupPayload,
  type UpdateGroupPayload,
} from "@/features/chat/api/api";
import { fetchPresenceStatus } from "@/features/profile/api";
import { conversationToRoom } from "@/lib/rooms";
import { normalizeAvatarUrl } from "@/lib/avatar-url";
import { useMutationToast } from "@/lib/use-mutation-toast";
import { useChatStore } from "@/features/chat/store/chat-store";
import { useAuthStore } from "@/lib/auth-store";

export const useChat = () => {
  const username = useAuthStore((s) => s.username);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const mergeMessages = useChatStore((s) => s.mergeMessages);
  const mergeCallHistory = useChatStore((s) => s.mergeCallHistory);
  const setGroups = useChatStore((s) => s.setGroups);
  const setKnownContacts = useChatStore((s) => s.setKnownContacts);
  const mergeUserProfileImages = useChatStore((s) => s.mergeUserProfileImages);
  const mergeUserStatuses = useChatStore((s) => s.mergeUserStatuses);
  const setUserStatus = useChatStore((s) => s.setUserStatus);
  const room = conversationToRoom(activeConversationId, username);

  const messages = useQuery({
    queryKey: ["messages", room],
    queryFn: () => fetchMessages(room),
    enabled: !!username,
  });

  const calls = useQuery({
    queryKey: ["call-history"],
    queryFn: () => fetchCallHistory(),
    enabled: !!username,
  });

  const groups = useQuery({
    queryKey: ["groups"],
    queryFn: () => fetchGroups(),
    enabled: !!username,
  });

  const contacts = useQuery({
    queryKey: ["contacts"],
    queryFn: () => fetchContacts(),
    enabled: !!username,
  });

  const presenceStatus = useQuery({
    queryKey: ["presence-status", username],
    queryFn: () => fetchPresenceStatus(),
    enabled: !!username,
  });

  useEffect(() => {
    if (messages.data) mergeMessages(room, messages.data);
  }, [messages.data, mergeMessages, room]);

  useEffect(() => {
    if (calls.data) mergeCallHistory(calls.data);
  }, [calls.data, mergeCallHistory]);

  useEffect(() => {
    if (groups.data) setGroups(groups.data);
  }, [groups.data, setGroups]);

  useEffect(() => {
    if (!contacts.data) return;
    setKnownContacts(contacts.data.map((contact) => contact.name));
    mergeUserProfileImages(
      Object.fromEntries(
        contacts.data.map((contact) => [contact.name, normalizeAvatarUrl(contact.image) ?? contact.image]),
      ),
    );
  }, [contacts.data, mergeUserProfileImages, setKnownContacts]);

  useEffect(() => {
    if (!presenceStatus.data || !username) return;
    mergeUserStatuses({ [username]: presenceStatus.data });
    setUserStatus(presenceStatus.data);
  }, [presenceStatus.data, mergeUserStatuses, setUserStatus, username]);

  return { messages, calls, groups, contacts, presenceStatus, room };
};

export const useGroupQuery = (groupId: string | undefined, enabled: boolean) => {
  return useQuery({
    queryKey: ["group", groupId],
    queryFn: () => fetchGroup(groupId!),
    enabled: enabled && !!groupId,
  });
};

export const useCreateGroup = (): UseMutationResult<ChatGroup, Error, CreateGroupPayload> => {
  const addGroup = useChatStore((s) => s.addGroup);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const queryClient = useQueryClient();
  const { onSuccessNotification, onErrorNotification } = useMutationToast();

  return useMutation({
    mutationFn: createGroup,
    onSuccess: (group) => {
      addGroup(group);
      setActiveConversation(group.room);
      void queryClient.invalidateQueries({ queryKey: ["groups"] });
      onSuccessNotification(`Group "${group.name}" created`);
    },
    onError: (err) => onErrorNotification(err, "Could not create group"),
  });
};

export const useUpdateGroup = (groupId: string) => {
  const updateGroupInStore = useChatStore((s) => s.updateGroup);
  const queryClient = useQueryClient();
  const { onSuccessNotification, onErrorNotification } = useMutationToast();

  return useMutation({
    mutationFn: (body: UpdateGroupPayload) => updateGroup(groupId, body),
    onSuccess: (updated) => {
      updateGroupInStore(updated);
      void queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      void queryClient.invalidateQueries({ queryKey: ["groups"] });
      onSuccessNotification("Group updated");
    },
    onError: (err) => onErrorNotification(err, "Could not update group"),
  });
};

export const useUploadGroupPhoto = (groupId: string) => {
  const updateGroupInStore = useChatStore((s) => s.updateGroup);
  const queryClient = useQueryClient();
  const { onSuccessNotification, onErrorNotification } = useMutationToast();

  return useMutation({
    mutationFn: (file: File) => uploadGroupPhoto(groupId, file),
    onSuccess: (image) => {
      const existing = useChatStore.getState().groups.find((g) => g.id === groupId);
      if (existing) updateGroupInStore({ ...existing, image });
      void queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      onSuccessNotification("Group photo updated");
    },
    onError: (err) => onErrorNotification(err, "Could not upload photo"),
  });
};

export const useRemoveGroupPhoto = (groupId: string) => {
  const updateGroupInStore = useChatStore((s) => s.updateGroup);
  const queryClient = useQueryClient();
  const { onSuccessNotification, onErrorNotification } = useMutationToast();

  return useMutation({
    mutationFn: () => removeGroupPhoto(groupId),
    onSuccess: () => {
      const existing = useChatStore.getState().groups.find((g) => g.id === groupId);
      if (existing) updateGroupInStore({ ...existing, image: "" });
      void queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      onSuccessNotification("Group photo removed");
    },
    onError: (err) => onErrorNotification(err, "Could not remove photo"),
  });
};

export const useUploadFile = (
  room: string,
): UseMutationResult<ChatMessage, Error, { file: File; caption?: string }> => {
  const addMessage = useChatStore((s) => s.addMessage);
  const setMessageStatus = useChatStore((s) => s.setMessageStatus);
  const { onErrorNotification } = useMutationToast();

  return useMutation({
    mutationFn: ({ file, caption }) => uploadFile(room, file, caption),
    onSuccess: (message) => {
      addMessage(message);
      if (message.id) setMessageStatus(message.id, "sent");
    },
    onError: (err) => onErrorNotification(err, "Could not upload file"),
  });
};

export const useDeleteMessage = () => {
  const { onErrorNotification } = useMutationToast();

  return useMutation({
    mutationFn: ({ room, messageId }: { room: string; messageId: string }) => deleteMessage(room, messageId),
    onError: (err) => onErrorNotification(err, "Could not delete message"),
  });
};
