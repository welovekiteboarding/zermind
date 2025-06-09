import { useChat as useAIChat } from '@ai-sdk/react';
import { type Message } from '@/lib/schemas/chat';

interface UseChatOptions {
  chatId?: string;
  initialMessages?: Message[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  onFinish?: (message: Message) => void;
  onError?: (error: Error) => void;
}

export function useChat({
  chatId,
  initialMessages = [],
  model = 'openai/gpt-4o-mini',
  maxTokens = 1000,
  temperature = 0.7,
  onFinish,
  onError,
}: UseChatOptions = {}) {
  
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    reload,
    setMessages,
    append,
  } = useAIChat({
    api: '/api/chat',
    id: chatId,
    initialMessages: initialMessages.map(msg => ({
      ...msg,
      createdAt: msg.createdAt instanceof Date ? msg.createdAt : new Date(msg.createdAt),
    })),
    body: {
      model,
      maxTokens,
      temperature,
    },
    onFinish: (message) => {
      const formattedMessage: Message = {
        id: message.id,
        role: message.role as 'user' | 'assistant',
        content: message.content,
        createdAt: message.createdAt || new Date(),
        model,
      };
      onFinish?.(formattedMessage);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      onError?.(error);
    },
  });

  // Convert messages to our Message type
  const formattedMessages: Message[] = messages.map(msg => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
    createdAt: msg.createdAt instanceof Date ? msg.createdAt : new Date(msg.createdAt || Date.now()),
    model: msg.role === 'assistant' ? model : undefined,
  }));

  return {
    messages: formattedMessages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    reload,
    setMessages: (messages: Message[]) => {
      setMessages(messages.map(msg => ({
        ...msg,
        createdAt: msg.createdAt instanceof Date ? msg.createdAt : new Date(msg.createdAt),
      })));
    },
    append: (message: { role: 'user' | 'assistant'; content: string }) => {
      return append({
        ...message,
        createdAt: new Date(),
      });
    },
    sendMessage: (content: string) => {
      return append({
        role: 'user',
        content,
        createdAt: new Date(),
      });
    },
  };
} 