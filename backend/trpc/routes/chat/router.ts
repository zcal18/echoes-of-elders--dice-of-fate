import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../../create-context';

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(z.object({
      channelId: z.string(),
      content: z.string().min(1).max(500),
      sender: z.string(),
      senderId: z.string(),
      fontColor: z.string().optional(),
      messageType: z.enum(['normal', 'emote']).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify that the sender matches the authenticated user
      if (ctx.user.id !== input.senderId) {
        throw new Error('Unauthorized: Cannot send messages as another user');
      }
      
      // In a real implementation, this would save to database
      // For now, just return the message data with validation
      return {
        id: Date.now().toString(),
        content: input.content,
        sender: input.sender,
        senderId: input.senderId,
        timestamp: Date.now(),
        reactions: [],
        fontColor: input.fontColor,
        messageType: input.messageType || 'normal',
      };
    }),

  joinChannel: protectedProcedure
    .input(z.object({
      channelId: z.string(),
      userId: z.string(),
      userName: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify that the user matches the authenticated user
      if (ctx.user.id !== input.userId) {
        throw new Error('Unauthorized: Cannot join channel as another user');
      }
      
      // In a real implementation, this would update user presence in database
      console.log(`User ${input.userName} (${input.userId}) joined channel ${input.channelId}`);
      return { success: true, channelId: input.channelId };
    }),

  leaveChannel: protectedProcedure
    .input(z.object({
      channelId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify that the user matches the authenticated user
      if (ctx.user.id !== input.userId) {
        throw new Error('Unauthorized: Cannot leave channel as another user');
      }
      
      // In a real implementation, this would update user presence in database
      console.log(`User ${input.userId} left channel ${input.channelId}`);
      return { success: true, channelId: input.channelId };
    }),

  createChannel: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(50),
      description: z.string().max(200),
      isPrivate: z.boolean(),
      createdBy: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify that the creator matches the authenticated user
      if (ctx.user.id !== input.createdBy) {
        throw new Error('Unauthorized: Cannot create channel as another user');
      }
      
      // In a real implementation, this would save to database
      const channel = {
        id: Date.now().toString(),
        name: input.name,
        description: input.description,
        isPrivate: input.isPrivate,
        createdBy: input.createdBy,
        createdAt: Date.now(),
        members: [input.createdBy],
      };
      
      console.log(`User ${ctx.user.name} created channel: ${input.name}`);
      return channel;
    }),

  getChannels: protectedProcedure
    .query(async ({ ctx }) => {
      // In a real implementation, this would fetch channels from database
      // For now, return default channels
      return [
        {
          id: 'general',
          name: 'General',
          description: 'Main chat room for all players',
          isPrivate: false,
          createdBy: 'system',
          createdAt: Date.now(),
          members: [],
        },
        {
          id: 'help',
          name: 'Help',
          description: 'Get help from other players',
          isPrivate: false,
          createdBy: 'system',
          createdAt: Date.now(),
          members: [],
        },
        {
          id: 'trading',
          name: 'Trading',
          description: 'Buy and sell items with other players',
          isPrivate: false,
          createdBy: 'system',
          createdAt: Date.now(),
          members: [],
        },
      ];
    }),

  getMessages: protectedProcedure
    .input(z.object({
      channelId: z.string(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      // In a real implementation, this would fetch messages from database
      // For now, return empty array
      return [];
    }),
});