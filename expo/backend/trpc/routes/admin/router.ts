import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../create-context";

// Admin-only middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  // In a real app, check if user has admin role from database
  const isAdmin = ctx.user?.id === 'admin' || ctx.user?.name === 'admin';
  
  if (!isAdmin) {
    throw new Error('Admin access required');
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Enemy data schema
const EnemySchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string(),
  level: z.number(),
  requiredLevel: z.number(),
  maxHealth: z.number(),
  attack: z.number(),
  defense: z.number(),
  experience: z.number(),
  gold: z.number(),
  difficulty: z.enum(['normal', 'elite', 'boss', 'legendary', 'mythic']),
  stats: z.object({
    strength: z.number(),
    dexterity: z.number(),
    constitution: z.number(),
    intelligence: z.number(),
    wisdom: z.number(),
    charisma: z.number(),
  }),
  armorClass: z.number(),
  damageDie: z.number(),
  attacks: z.array(z.object({
    name: z.string(),
    damage: z.string(),
    description: z.string(),
  })),
  abilities: z.array(z.string()),
  weaknesses: z.array(z.string()),
  resistances: z.array(z.string()),
  profileImage: z.string(),
  environment: z.string(),
  lore: z.string(),
});

export const adminRouter = createTRPCRouter({
  // Enemy management
  createEnemy: adminProcedure
    .input(EnemySchema)
    .mutation(async ({ input, ctx }) => {
      console.log('Admin creating enemy:', input.name, 'by user:', ctx.user?.name);
      
      // In a real app, save to database
      // For now, return success
      return {
        success: true,
        message: `Enemy "${input.name}" created successfully`,
        enemyId: `custom_${Date.now()}`
      };
    }),

  updateEnemy: adminProcedure
    .input(z.object({
      enemyId: z.string(),
      data: EnemySchema
    }))
    .mutation(async ({ input, ctx }) => {
      console.log('Admin updating enemy:', input.enemyId, 'by user:', ctx.user?.name);
      
      // In a real app, update in database
      return {
        success: true,
        message: `Enemy "${input.data.name}" updated successfully`
      };
    }),

  deleteEnemy: adminProcedure
    .input(z.object({
      enemyId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      console.log('Admin deleting enemy:', input.enemyId, 'by user:', ctx.user?.name);
      
      // In a real app, delete from database
      return {
        success: true,
        message: 'Enemy deleted successfully'
      };
    }),

  uploadEnemyImage: adminProcedure
    .input(z.object({
      enemyId: z.string(),
      imageUrl: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      console.log('Admin uploading enemy image:', input.enemyId, 'by user:', ctx.user?.name);
      
      // In a real app, handle image upload and storage
      return {
        success: true,
        message: 'Enemy image uploaded successfully',
        imageUrl: input.imageUrl
      };
    }),

  // User management
  banUser: adminProcedure
    .input(z.object({
      userId: z.string(),
      reason: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      console.log('Admin banning user:', input.userId, 'by user:', ctx.user?.name);
      
      // In a real app, update user status in database
      return {
        success: true,
        message: `User ${input.userId} has been banned`
      };
    }),

  unbanUser: adminProcedure
    .input(z.object({
      userId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      console.log('Admin unbanning user:', input.userId, 'by user:', ctx.user?.name);
      
      // In a real app, update user status in database
      return {
        success: true,
        message: `User ${input.userId} has been unbanned`
      };
    }),

  setUserRole: adminProcedure
    .input(z.object({
      userId: z.string(),
      role: z.enum(['player', 'moderator', 'admin'])
    }))
    .mutation(async ({ input, ctx }) => {
      console.log('Admin setting user role:', input.userId, 'to', input.role, 'by user:', ctx.user?.name);
      
      // In a real app, update user role in database
      return {
        success: true,
        message: `User ${input.userId} role updated to ${input.role}`
      };
    }),

  // System management
  getSystemStats: adminProcedure
    .query(async ({ ctx }) => {
      console.log('Admin fetching system stats by user:', ctx.user?.name);
      
      // In a real app, fetch from database
      return {
        totalUsers: 1250,
        activeUsers: 89,
        bannedUsers: 3,
        customEnemies: 15,
        serverUptime: '7 days, 14 hours',
        memoryUsage: '2.1 GB',
        cpuUsage: '15%'
      };
    }),

  // Audit logs
  getAuditLogs: adminProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0)
    }))
    .query(async ({ input, ctx }) => {
      console.log('Admin fetching audit logs by user:', ctx.user?.name);
      
      // In a real app, fetch from database
      return {
        logs: [
          {
            id: '1',
            action: 'USER_BANNED',
            adminId: 'admin',
            targetId: 'user123',
            reason: 'Cheating',
            timestamp: Date.now() - 3600000
          },
          {
            id: '2',
            action: 'ENEMY_CREATED',
            adminId: 'admin',
            targetId: 'custom_dragon',
            reason: 'New boss enemy',
            timestamp: Date.now() - 7200000
          }
        ],
        total: 2,
        hasMore: false
      };
    }),
});