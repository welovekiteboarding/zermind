import { prisma } from '@/lib/prisma'
import { 
  ChatWithMessagesSchema, 
  ChatListItemSchema, 
  type ChatWithMessages, 
  type ChatListItem 
} from '@/lib/schemas/chat'

import { randomBytes } from 'crypto';

// Generate a cryptographically secure random share ID
function generateShareId(): string {
  // Generate 32 random bytes and convert to base64url (URL-safe)
  return randomBytes(32)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, ''); // Remove padding for cleaner URLs
}

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

// Get a shared chat by shareId (public access, no user authentication required)
export async function getSharedChat(shareId: string): Promise<ChatWithMessages | null> {
  const rawChat = await prisma.chat.findFirst({
    where: {
      shareId
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

// Generate or get existing share link for a chat
export async function generateShareLink(chatId: string, userId: string): Promise<string | null> {
  // First check if the chat exists and belongs to the user
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId
    }
  })

  if (!chat) return null

  // If chat already has a shareId, return it
  if (chat.shareId) {
    return chat.shareId
  }

  // Generate a new shareId
  const shareId = generateShareId()
  
  // Update the chat with the new shareId
  await prisma.chat.update({
    where: {
      id: chatId,
      userId
    },
    data: {
      shareId
    }
  })

  return shareId
}

// Remove share link from a chat
export async function removeShareLink(chatId: string, userId: string): Promise<boolean> {
  try {
    await prisma.chat.update({
      where: {
        id: chatId,
        userId
      },
      data: {
        shareId: null
      }
    })
    return true
  } catch (error) {
    console.error('Failed to remove share link:', error)
    return false
  }
} 