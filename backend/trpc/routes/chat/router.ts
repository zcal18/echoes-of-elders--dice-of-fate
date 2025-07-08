import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../../create-context';

export const chatRouter = createTRPCRouter({
  sendMessage: publicProcedure
    .input(z.object({
      channelId: z.string(),
      content: z.string(),
      sender: z.string(),
      senderId: z.string(),
      fontColor: z.string().optional(),
      messageType: z.enum(['normal', 'emote']).optional(),
    }))
    .mutation(async ({ input }) => {
      // In a real implementation, this would save to database
      // For now, just return the message data
      return {
        id: Date.now().toString(),
        content: input.content,
        sender: input.sender,
        timestamp: Date.now(),
        reactions: [],
        fontColor: input.fontColor,
        messageType: input.messageType || 'normal',
      };
    }),

  joinChannel: publicProcedure
    .input(z.object({
      channelId: z.string(),
      userId: z.string(),
      userName: z.string(),
    }))
    .mutation(async ({ input }) => {
      // In a real implementation, this would update user presence in database
      return { success: true };
    }),

  leaveChannel: publicProcedure
    .input(z.object({
      channelId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ input }) => {
      // In a real implementation, this would update user presence in database
      return { success: true };
    }),

  createChannel: publicProcedure
    .input(z.object({
      name: z.string(),
      description: z.string(),
      isPrivate: z.boolean(),
      createdBy: z.string(),
    }))
    .mutation(async ({ input }) => {
      // In a real implementation, this would save to database
      return {
        id: Date.now().toString(),
        name: input.name,
        description: input.description,
        isPrivate: input.isPrivate,
        createdBy: input.createdBy,
        createdAt: Date.now(),
        members: [input.createdBy],
      };
    }),
});