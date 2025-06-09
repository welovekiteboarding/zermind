import { prisma } from '@/lib/prisma'
import { 
  ChatWithMessagesSchema, 
  ChatListItemSchema, 
  type ChatWithMessages, 
  type ChatListItem 
} from '@/lib/schemas/chat'

// Get all chats for a user (for sidebar)
export async function getUserChats(userId: string): Promise<ChatListItem[]> {
  const rawChats = await prisma.chat.findMany({
    where: {
      userId
    },
    select: {
      id: true,
      title: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      shareId: true,
      _count: {
        select: {
          messages: true
        }
      },
      messages: {
        select: {
          content: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  // Validate and transform the data using Zod
  return rawChats.map(chat => ChatListItemSchema.parse(chat))
}

// Get a single chat with all messages
export async function getChatWithMessages(chatId: string, userId: string): Promise<ChatWithMessages | null> {
  const rawChat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  })

  if (!rawChat) return null

  // Validate and transform the data using Zod
  return ChatWithMessagesSchema.parse(rawChat)
}

// Create a new chat
export async function createChat(userId: string, title?: string) {
  return await prisma.chat.create({
    data: {
      userId,
      title: title || null
    }
  })
}

// Update chat title
export async function updateChatTitle(chatId: string, userId: string, title: string) {
  return await prisma.chat.update({
    where: {
      id: chatId,
      userId
    },
    data: {
      title
    }
  })
}

// Delete a chat
export async function deleteChat(chatId: string, userId: string) {
  return await prisma.chat.delete({
    where: {
      id: chatId,
      userId
    }
  })
}

// Add a message to a chat
export async function addMessage(
  chatId: string, 
  role: 'user' | 'assistant', 
  content: string,
  model?: string
) {
  // Also update the chat's updatedAt timestamp
  await prisma.chat.update({
    where: {
      id: chatId
    },
    data: {
      updatedAt: new Date()
    }
  })

  return await prisma.message.create({
    data: {
      chatId,
      role,
      content,
      model
    }
  })
} 