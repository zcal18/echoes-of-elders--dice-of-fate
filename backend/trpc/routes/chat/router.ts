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
      channelId: z.string().optional(),
      guildId: z.string().optional(),
      userId: z.string(),
      userName: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify that the user matches the authenticated user
      if (ctx.user.id !== input.userId) {
        throw new Error('Unauthorized: Cannot join channel as another user');
      }
      
      const targetId = input.channelId || input.guildId;
      if (!targetId) {
        throw new Error('Either channelId or guildId must be provided');
      }
      
      // In a real implementation, this would update user presence in database
      console.log(`User ${input.userName || ctx.user.name} (${input.userId}) joined ${input.guildId ? 'guild' : 'channel'} ${targetId}`);
      return { success: true, channelId: targetId };
    }),

  leaveChannel: protectedProcedure
    .input(z.object({
      channelId: z.string().optional(),
      guildId: z.string().optional(),
      userId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify that the user matches the authenticated user
      if (ctx.user.id !== input.userId) {
        throw new Error('Unauthorized: Cannot leave channel as another user');
      }
      
      const targetId = input.channelId || input.guildId;
      if (!targetId) {
        throw new Error('Either channelId or guildId must be provided');
      }
      
      // In a real implementation, this would update user presence in database
      console.log(`User ${input.userId} left ${input.guildId ? 'guild' : 'channel'} ${targetId}`);
      return { success: true, channelId: targetId };
    }),

  createChannel: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(50).optional(),
      description: z.string().max(200).optional(),
      isPrivate: z.boolean().optional(),
      createdBy: z.string(),
      // Guild-specific fields
      guildId: z.string().optional(),
      guildName: z.string().optional(),
      guildTag: z.string().optional(),
      members: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify that the creator matches the authenticated user
      if (ctx.user.id !== input.createdBy) {
        throw new Error('Unauthorized: Cannot create channel as another user');
      }
      
      // In a real implementation, this would save to database
      const channel = {
        id: input.guildId || Date.now().toString(),
        name: input.guildName || input.name || 'Unnamed Channel',
        description: input.description || '',
        isPrivate: input.isPrivate || false,
        createdBy: input.createdBy,
        createdAt: Date.now(),
        members: input.members || [input.createdBy],
        guildId: input.guildId,
        guildTag: input.guildTag,
      };
      
      console.log(`User ${ctx.user.name} created ${input.guildId ? 'guild channel' : 'channel'}: ${channel.name}`);
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