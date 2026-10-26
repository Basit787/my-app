import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useNotification } from "my-ui";
import {
  createConversation,
  deleteConversation,
  fetchConversation,
  fetchConversations,
  renameConversation,
  streamReply,
  type ChatMessage,
  type Conversation,
  type ConversationDetail,
} from "./api";
import { useChatStreamStore } from "../store/chat-stream-store";

const CONVERSATIONS_KEY = ["conversations"];
const conversationKey = (id: string) => ["conversation", id];

export const useConversations = () => useQuery({ queryKey: CONVERSATIONS_KEY, queryFn: fetchConversations });

export const useConversation = (id: string | undefined) =>
  useQuery({
    queryKey: conversationKey(id ?? ""),
    queryFn: () => fetchConversation(id!),
    enabled: !!id,
    retry: false,
  });

// Puts a conversation first in the sidebar list (new, or just answered)
const moveConversationToTop = (queryClient: QueryClient, conversation: Conversation) => {
  queryClient.setQueryData<Conversation[]>(CONVERSATIONS_KEY, (conversations = []) => [
    conversation,
    ...conversations.filter((item) => item.id !== conversation.id),
  ]);
};

const appendMessage = (queryClient: QueryClient, conversationId: string, message: ChatMessage) => {
  queryClient.setQueryData<ConversationDetail>(conversationKey(conversationId), (detail) =>
    detail ? { ...detail, messages: [...detail.messages, message] } : detail,
  );
};

// Sends a message in the open chat (?c=), starting a new chat when none is open, and follows the streamed reply
export const useChatStream = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const conversationId = useSearch({ from: "/", select: (search) => search.c });
  const { showErrorNotification } = useNotification();
  const { start, setText, finish } = useChatStreamStore.getState();

  const startConversation = async (): Promise<string> => {
    const conversation = await createConversation();
    moveConversationToTop(queryClient, conversation);
    queryClient.setQueryData<ConversationDetail>(conversationKey(conversation.id), { conversation, messages: [] });
    void navigate({ to: "/", search: { c: conversation.id } });
    return conversation.id;
  };

  const send = async (content: string) => {
    let id = conversationId;
    if (!id) {
      try {
        id = await startConversation();
      } catch (error) {
        showErrorNotification(error, "Could not start a chat");
        return;
      }
    }

    appendMessage(queryClient, id, { id: `local-user-${Date.now()}`, role: "user", content });
    const controller = new AbortController();
    start(controller);
    let received = "";

    try {
      await streamReply(id, content, controller.signal, (event) => {
        if (event.type === "conversation") moveConversationToTop(queryClient, event.conversation);
        if (event.type === "delta") {
          received += event.text;
          setText(received);
        }
        if (event.type === "done") {
          appendMessage(queryClient, id, event.message);
          moveConversationToTop(queryClient, event.conversation);
        }
        if (event.type === "error") showErrorNotification(event.error, "The model could not answer");
      });
    } catch (error) {
      // Stopped by the user: keep what was shown; the server saves the same partial reply
      if (controller.signal.aborted) {
        if (received) {
          appendMessage(queryClient, id, { id: `local-stopped-${Date.now()}`, role: "assistant", content: received });
        }
      } else {
        showErrorNotification(error, "Could not get a reply");
      }
    } finally {
      finish();
      // Swap local ids for the stored messages; skipped after Stop, while the server is still saving
      if (!controller.signal.aborted) {
        void queryClient.invalidateQueries({ queryKey: conversationKey(id) });
        void queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
      }
    }
  };

  const stop = () => useChatStreamStore.getState().controller?.abort();

  return { send, stop };
};

export const useRenameConversation = () => {
  const queryClient = useQueryClient();
  const { showErrorNotification } = useNotification();

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => renameConversation(id, title),
    onSuccess: (conversation) => {
      queryClient.setQueryData<Conversation[]>(CONVERSATIONS_KEY, (conversations = []) =>
        conversations.map((item) => (item.id === conversation.id ? conversation : item)),
      );
    },
    onError: (err) => showErrorNotification(err, "Could not rename the chat"),
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  return useMutation({
    mutationFn: deleteConversation,
    onSuccess: (_result, id) => {
      queryClient.setQueryData<Conversation[]>(CONVERSATIONS_KEY, (conversations = []) =>
        conversations.filter((item) => item.id !== id),
      );
      queryClient.removeQueries({ queryKey: conversationKey(id) });
      showSuccessNotification("Chat deleted");
    },
    onError: (err) => showErrorNotification(err, "Could not delete the chat"),
  });
};
