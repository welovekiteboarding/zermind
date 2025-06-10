import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ChatListItem,
  type ChatWithMessages,
  type CreateChat,
  type UpdateChat,
  type Message,
  ChatListItemSchema,
  ChatWithMessagesSchema,
  CreateChatResponseSchema,
} from "@/lib/schemas/chat";

// Query Keys
export const chatKeys = {
  all: ["chats"] as const,
  lists: () => [...chatKeys.all, "list"] as const,
  list: (userId: string) => [...chatKeys.lists(), userId] as const,
  details: () => [...chatKeys.all, "detail"] as const,
  detail: (id: string, userId: string) =>
    [...chatKeys.details(), id, userId] as const,
} as const;

// API Functions
async function fetchUserChats(userId: string): Promise<ChatListItem[]> {
  const response = await fetch(`/api/chats/user/${userId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch chats: ${response.statusText}`);
  }
  const data = await response.json();

  // Validate response data
  if (Array.isArray(data.chats)) {
    return data.chats.map((chat: unknown) => ChatListItemSchema.parse(chat));
  }
  return [];
}

async function fetchChatWithMessages(
  chatId: string,
  userId: string
): Promise<ChatWithMessages> {
  const response = await fetch(`/api/chats/${chatId}?userId=${userId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch chat: ${response.statusText}`);
  }
  const data = await response.json();
  return ChatWithMessagesSchema.parse(data);
}

async function createChat(data: CreateChat) {
  const response = await fetch("/api/chats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create chat: ${response.statusText}`);
  }

  const result = await response.json();
  return CreateChatResponseSchema.parse(result);
}

async function updateChatTitle(chatId: string, data: UpdateChat) {
  const response = await fetch(`/api/chats/${chatId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update chat: ${response.statusText}`);
  }

  return response.json();
}

async function deleteChat(chatId: string) {
  const response = await fetch(`/api/chats/${chatId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete chat: ${response.statusText}`);
  }

  return response.json();
}

async function saveMessage(
  chatId: string,
  message: Omit<Message, "id" | "createdAt">
) {
  const response = await fetch(`/api/chats/${chatId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error(`Failed to save message: ${response.statusText}`);
  }

  return response.json();
}

async function generateShareLink(chatId: string) {
  const response = await fetch(`/api/chats/${chatId}/share`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Failed to generate share link: ${response.statusText}`);
  }

  return response.json();
}

async function removeShareLink(chatId: string) {
  const response = await fetch(`/api/chats/${chatId}/share`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to remove share link: ${response.statusText}`);
  }

  return response.json();
}

// Query Hooks
export function useUserChats(userId: string | undefined) {
  return useQuery({
    queryKey: chatKeys.list(userId || ""),
    queryFn: () => fetchUserChats(userId!),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useChatWithMessages(
  chatId: string | undefined,
  userId: string | undefined
) {
  return useQuery({
    queryKey: chatKeys.detail(chatId || "", userId || ""),
    queryFn: () => fetchChatWithMessages(chatId!, userId!),
    enabled: !!chatId && !!userId,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Mutation Hooks
export function useCreateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createChat,
    onSuccess: (newChat) => {
      // Invalidate and refetch user chats
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });

      // Optimistically add to cache if we know the userId
      const userId = newChat.userId;
      if (userId) {
        queryClient.setQueryData<ChatListItem[]>(
          chatKeys.list(userId),
          (old) => {
            const newChatListItem: ChatListItem = {
              ...newChat,
              _count: { messages: 0 },
              messages: [],
            };
            return old ? [newChatListItem, ...old] : [newChatListItem];
          }
        );
      }
    },
  });
}

export function useUpdateChatTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, data }: { chatId: string; data: UpdateChat }) =>
      updateChatTitle(chatId, data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
      queryClient.invalidateQueries({ queryKey: chatKeys.details() });
    },
  });
}

export function useDeleteChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteChat,
    onSuccess: () => {
      // Remove from all caches
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
      queryClient.removeQueries({ queryKey: chatKeys.details() });
    },
  });
}

export function useSaveMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      chatId,
      message,
    }: {
      chatId: string;
      message: Omit<Message, "id" | "createdAt">;
    }) => saveMessage(chatId, message),
    onSuccess: (savedMessage, { chatId }) => {
      // Update the specific chat's messages
      queryClient.invalidateQueries({
        queryKey: chatKeys.details(),
        predicate: (query) => query.queryKey.includes(chatId),
      });

      // Update chat list to show latest message
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
  });
}

export function useGenerateShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chatId: string) => generateShareLink(chatId),
    onSuccess: (_result, chatId) => {
      // Invalidate the specific chat to update shareId
      queryClient.invalidateQueries({
        queryKey: chatKeys.details(),
        predicate: (query) => query.queryKey.includes(chatId),
      });
    },
  });
}

export function useRemoveShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chatId: string) => removeShareLink(chatId),
    onSuccess: (_result, chatId) => {
      // Invalidate the specific chat to remove shareId
      queryClient.invalidateQueries({
        queryKey: chatKeys.details(),
        predicate: (query) => query.queryKey.includes(chatId),
      });
    },
  });
}
