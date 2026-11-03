import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch, type UseNavigateResult } from "@tanstack/react-router";
import { useNotification } from "my-ui";
import {
  createConversation,
  deleteConversation,
  deleteDocument,
  fetchConversation,
  fetchConversations,
  fetchDocuments,
  renameConversation,
  streamReply,
  uploadDocument,
  type ChatMessage,
  type Conversation,
  type ConversationDetail,
  type DocumentItem,
  type Source,
} from "./api";
import { useChatStreamStore } from "../store/chat-stream-store";

const CONVERSATIONS_KEY = ["conversations"];
const conversationKey = (id: string) => ["conversation", id];
const documentsKey = (id: string) => ["documents", id];

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

const startConversation = async (queryClient: QueryClient, navigate: UseNavigateResult<string>): Promise<string> => {
  const conversation = await createConversation();
  moveConversationToTop(queryClient, conversation);
  queryClient.setQueryData<ConversationDetail>(conversationKey(conversation.id), { conversation, messages: [] });
  queryClient.setQueryData<DocumentItem[]>(documentsKey(conversation.id), []);
  void navigate({ to: "/", search: { c: conversation.id } });
  return conversation.id;
};

// Sends a message in the open chat (?c=), starting a new chat when none is open, and follows the streamed reply
export const useChatStream = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const conversationId = useSearch({ from: "/", select: (search) => search.c });
  const { showErrorNotification } = useNotification();
  const { start, setText, setSources, setStatus, finish } = useChatStreamStore.getState();

  const send = async (content: string) => {
    let id = conversationId;
    if (!id) {
      try {
        id = await startConversation(queryClient, navigate);
      } catch (error) {
        showErrorNotification(error, "Could not start a chat");
        return;
      }
    }

    appendMessage(queryClient, id, { id: `local-user-${Date.now()}`, role: "user", content });
    const controller = new AbortController();
    start(controller);
    let received = "";
    let sources: Source[] = [];

    try {
      await streamReply(id, content, controller.signal, (event) => {
        if (event.type === "conversation") moveConversationToTop(queryClient, event.conversation);
        if (event.type === "tool") {
          setStatus(event.name === "web_search" ? `Searching the web: ${event.input}` : `Using ${event.name}`);
        }
        if (event.type === "sources") {
          sources = event.sources;
          setSources(sources);
        }
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
          appendMessage(queryClient, id, {
            id: `local-stopped-${Date.now()}`,
            role: "assistant",
            content: received,
            sources,
          });
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
      queryClient.removeQueries({ queryKey: documentsKey(id) });
      showSuccessNotification("Chat deleted");
    },
    onError: (err) => showErrorNotification(err, "Could not delete the chat"),
  });
};

export const useDocuments = (conversationId: string | undefined) =>
  useQuery({
    queryKey: documentsKey(conversationId ?? ""),
    queryFn: () => fetchDocuments(conversationId!),
    enabled: !!conversationId,
    retry: false,
  });

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const conversationId = useSearch({ from: "/", select: (search) => search.c });
  const { showSuccessNotification, showErrorNotification } = useNotification();

  return useMutation({
    mutationFn: async (file: File) => {
      const id = conversationId ?? (await startConversation(queryClient, navigate));
      return { conversationId: id, document: await uploadDocument(id, file) };
    },
    onSuccess: ({ conversationId: id, document }) => {
      queryClient.setQueryData<DocumentItem[]>(documentsKey(id), (documents = []) => [...documents, document]);
      showSuccessNotification(`${document.fileName} is ready: ask about it`);
    },
    onError: (err) => showErrorNotification(err, "Could not add the document"),
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  const { showErrorNotification } = useNotification();

  return useMutation({
    mutationFn: ({ conversationId, documentId }: { conversationId: string; documentId: string }) =>
      deleteDocument(conversationId, documentId),
    onSuccess: (_result, { conversationId, documentId }) => {
      queryClient.setQueryData<DocumentItem[]>(documentsKey(conversationId), (documents = []) =>
        documents.filter((item) => item.id !== documentId),
      );
    },
    onError: (err) => showErrorNotification(err, "Could not remove the document"),
  });
};
