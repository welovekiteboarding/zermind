import { z } from "zod";

// Participant role enum
export const participantRoleSchema = z.enum([
  "owner",
  "collaborator",
  "viewer",
]);

// Collaboration session creation schema
export const createCollaborationSessionSchema = z.object({
  chatId: z.string().min(1, "Chat ID is required"),
  role: participantRoleSchema.optional().default("collaborator"),
  maxParticipants: z.number().int().min(1).max(50).optional(),
  settings: z.record(z.unknown()).optional(),
});

// Join collaboration session schema
export const joinCollaborationSessionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  role: participantRoleSchema.optional().default("collaborator"),
});

// Update collaboration session schema
export const updateCollaborationSessionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  maxParticipants: z.number().int().min(1).max(50).optional(),
  settings: z.record(z.unknown()).optional(),
});

// Collaboration session response schema
export const collaborationSessionSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  activeSince: z.date(),
  lastActivity: z.date(),
  maxParticipants: z.number().nullable(),
  settings: z.record(z.unknown()).nullable(),
  participants: z.array(
    z.object({
      id: z.string(),
      userId: z.string(),
      role: participantRoleSchema,
      joinedAt: z.date(),
      lastActivity: z.date(),
    })
  ),
});

// Participant update schema
export const updateParticipantSchema = z.object({
  participantId: z.string().min(1, "Participant ID is required"),
  role: participantRoleSchema,
});

// Collaboration invite schema
export const collaborationInviteSchema = z.object({
  chatId: z.string().min(1, "Chat ID is required"),
  inviteeEmail: z.string().email("Valid email is required"),
  role: participantRoleSchema.default("collaborator"),
  message: z.string().max(500).optional(),
  expiresIn: z.number().int().min(1).max(168).default(24), // Hours, max 1 week
});

// Real-time action schemas
export const mindMapActionSchema = z.object({
  type: z.enum([
    "node_move",
    "node_select",
    "node_create",
    "node_delete",
    "cursor_move",
  ]),
  nodeId: z.string().optional(),
  position: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),
  userId: z.string(),
  timestamp: z.number(),
  data: z.record(z.unknown()).optional(),
});

// Collaborative user schema
export const collaborativeUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  avatar: z.string().optional(),
  cursor: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),
  selectedNodeId: z.string().optional(),
  color: z.string(),
});

// Session permissions schema
export const sessionPermissionsSchema = z.object({
  canEdit: z.boolean(),
  canInvite: z.boolean(),
  canManage: z.boolean(),
  canDelete: z.boolean(),
  maxNodes: z.number().optional(),
});

// Collaboration settings schema
export const collaborationSettingsSchema = z.object({
  allowAnonymous: z.boolean().default(false),
  requireApproval: z.boolean().default(true),
  autoLayout: z.boolean().default(true),
  showCursors: z.boolean().default(true),
  showPresence: z.boolean().default(true),
  conflictResolution: z
    .enum(["last-writer-wins", "manual", "auto-merge"])
    .default("last-writer-wins"),
});

// Export types
export type ParticipantRole = z.infer<typeof participantRoleSchema>;
export type CreateCollaborationSession = z.infer<
  typeof createCollaborationSessionSchema
>;
export type JoinCollaborationSession = z.infer<
  typeof joinCollaborationSessionSchema
>;
export type UpdateCollaborationSession = z.infer<
  typeof updateCollaborationSessionSchema
>;
export type CollaborationSession = z.infer<typeof collaborationSessionSchema>;
export type UpdateParticipant = z.infer<typeof updateParticipantSchema>;
export type CollaborationInvite = z.infer<typeof collaborationInviteSchema>;
export type MindMapAction = z.infer<typeof mindMapActionSchema>;
export type CollaborativeUser = z.infer<typeof collaborativeUserSchema>;
export type SessionPermissions = z.infer<typeof sessionPermissionsSchema>;
export type CollaborationSettings = z.infer<typeof collaborationSettingsSchema>;
