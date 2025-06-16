import { prisma } from "@/lib/prisma";
import { Message, NodeType } from "@prisma/client";

// Enhanced message creation with mind map positioning
export async function createMessageWithPosition(data: {
  chatId: string;
  parentId?: string;
  branchName?: string;
  role: string;
  content: string;
  model?: string;
  xPosition?: number;
  yPosition?: number;
  nodeType?: NodeType;
}): Promise<Message> {
  return prisma.message.create({
    data: {
      chatId: data.chatId,
      parentId: data.parentId,
      branchName: data.branchName,
      role: data.role,
      content: data.content,
      model: data.model,
      xPosition: data.xPosition || 0,
      yPosition: data.yPosition || 0,
      nodeType: data.nodeType || "conversation",
    },
  });
}

// Update message position (for mind map drag operations)
export async function updateMessagePosition(
  messageId: string,
  xPosition: number,
  yPosition: number
): Promise<Message> {
  return prisma.message.update({
    where: { id: messageId },
    data: {
      xPosition,
      yPosition,
    },
  });
}

// Secure update message position with ownership verification
export async function updateMessagePositionSecure(
  messageId: string,
  xPosition: number,
  yPosition: number,
  userId: string
): Promise<Message> {
  // First, verify that the message belongs to a chat owned by the user
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      chat: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!message) {
    throw new Error("Message not found");
  }

  if (message.chat.userId !== userId) {
    throw new Error(
      "Unauthorized: Message does not belong to the current user"
    );
  }

  // If ownership check passes, perform the update
  return prisma.message.update({
    where: { id: messageId },
    data: {
      xPosition,
      yPosition,
    },
  });
}

// Batch update message positions (for layout optimizations)
export async function batchUpdateMessagePositions(
  updates: Array<{
    id: string;
    xPosition: number;
    yPosition: number;
  }>
): Promise<void> {
  const updatePromises = updates.map((update) =>
    prisma.message.update({
      where: { id: update.id },
      data: {
        xPosition: update.xPosition,
        yPosition: update.yPosition,
      },
    })
  );

  await Promise.all(updatePromises);
}

// Secure batch update message positions with ownership verification
export async function batchUpdateMessagePositionsSecure(
  updates: Array<{
    id: string;
    xPosition: number;
    yPosition: number;
  }>,
  userId: string
): Promise<void> {
  // First, verify that all messages belong to chats owned by the user
  const messageIds = updates.map((update) => update.id);

  const messages = await prisma.message.findMany({
    where: {
      id: { in: messageIds },
    },
    include: {
      chat: {
        select: {
          userId: true,
        },
      },
    },
  });

  // Check if all messages were found and belong to the user
  if (messages.length !== messageIds.length) {
    throw new Error("Some messages were not found");
  }

  const unauthorizedMessages = messages.filter(
    (message) => message.chat.userId !== userId
  );

  if (unauthorizedMessages.length > 0) {
    throw new Error(
      "Unauthorized: Some messages do not belong to the current user"
    );
  }

  // If all checks pass, perform the updates
  const updatePromises = updates.map((update) =>
    prisma.message.update({
      where: { id: update.id },
      data: {
        xPosition: update.xPosition,
        yPosition: update.yPosition,
      },
    })
  );

  await Promise.all(updatePromises);
}

// Get conversation tree structure for mind map visualization
export async function getConversationTree(chatId: string): Promise<Message[]> {
  return prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
  });
}

// Get message branches (children of a specific message)
export async function getMessageBranches(parentId: string): Promise<Message[]> {
  return prisma.message.findMany({
    where: { parentId },
    orderBy: { createdAt: "asc" },
  });
}

// Create a branching point (when users want to explore alternatives)
export async function createBranchingPoint(
  chatId: string,
  parentId: string,
  branchName: string,
  xPosition: number,
  yPosition: number
): Promise<Message> {
  return prisma.message.create({
    data: {
      chatId,
      parentId,
      branchName,
      role: "assistant", // Branching points are system-generated
      content: `Branching point: ${branchName}`,
      nodeType: "branching_point",
      xPosition,
      yPosition,
    },
  });
}

// Toggle message collapse state (for mind map UI)
export async function toggleMessageCollapse(
  messageId: string,
  isCollapsed: boolean
): Promise<Message> {
  return prisma.message.update({
    where: { id: messageId },
    data: { isCollapsed },
  });
}

// Get messages by node type (useful for filtering in mind map)
export async function getMessagesByNodeType(
  chatId: string,
  nodeType: NodeType
): Promise<Message[]> {
  return prisma.message.findMany({
    where: {
      chatId,
      nodeType,
    },
    orderBy: { createdAt: "asc" },
  });
}

// Find optimal position for new message (avoiding overlaps)
export async function findOptimalMessagePosition(
  chatId: string,
  parentId?: string
): Promise<{ x: number; y: number }> {
  const existingMessages = await prisma.message.findMany({
    where: { chatId },
    select: {
      xPosition: true,
      yPosition: true,
    },
  });

  // Simple algorithm to find non-overlapping position
  // In a real implementation, you might use a more sophisticated layout algorithm
  let x = 100;
  let y = 100;

  if (parentId) {
    const parent = await prisma.message.findUnique({
      where: { id: parentId },
      select: { xPosition: true, yPosition: true },
    });

    if (parent) {
      // Position child nodes to the right and slightly down
      x = parent.xPosition + 300;
      y = parent.yPosition + 50;
    }
  }

  // Check for overlaps and adjust position
  const NODE_WIDTH = 250;
  const NODE_HEIGHT = 100;
  const MARGIN = 20;

  let positionFound = false;
  let attempts = 0;
  const maxAttempts = 100;

  while (!positionFound && attempts < maxAttempts) {
    const hasOverlap = existingMessages.some((msg) => {
      const dx = Math.abs(msg.xPosition - x);
      const dy = Math.abs(msg.yPosition - y);
      return dx < NODE_WIDTH + MARGIN && dy < NODE_HEIGHT + MARGIN;
    });

    if (!hasOverlap) {
      positionFound = true;
    } else {
      // Try a new position
      x += NODE_WIDTH + MARGIN;
      if (x > 1000) {
        x = 100;
        y += NODE_HEIGHT + MARGIN;
      }
    }
    attempts++;
  }

  return { x, y };
}

// Get conversation path from root to specific message
export async function getConversationPath(
  messageId: string
): Promise<Message[]> {
  const path: Message[] = [];
  let currentId: string | null = messageId;

  while (currentId) {
    const message: Message | null = await prisma.message.findUnique({
      where: { id: currentId },
    });

    if (!message) break;

    path.unshift(message);
    currentId = message.parentId;
  }

  return path;
}

// Delete message and all its descendants (for mind map node deletion)
export async function deleteMessageTree(messageId: string): Promise<void> {
  // Get all descendant messages
  const descendants = await getMessageDescendants(messageId);
  const allIds = [messageId, ...descendants.map((m) => m.id)];

  // Delete all messages in the tree
  await prisma.message.deleteMany({
    where: {
      id: {
        in: allIds,
      },
    },
  });
}

// Helper function to get all descendants of a message
async function getMessageDescendants(messageId: string): Promise<Message[]> {
  const directChildren = await prisma.message.findMany({
    where: { parentId: messageId },
  });

  const allDescendants: Message[] = [...directChildren];

  for (const child of directChildren) {
    const childDescendants = await getMessageDescendants(child.id);
    allDescendants.push(...childDescendants);
  }

  return allDescendants;
}
