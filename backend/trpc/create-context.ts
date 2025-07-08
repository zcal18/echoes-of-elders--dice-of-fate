import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  // Extract user information from headers if available
  const authHeader = opts.req.headers.get('authorization');
  const userId = opts.req.headers.get('x-user-id');
  const userName = opts.req.headers.get('x-user-name');
  
  console.log('Creating context with headers:', {
    authHeader: !!authHeader,
    userId,
    userName
  });
  
  return {
    req: opts.req,
    // Add authentication context
    user: userId ? {
      id: userId,
      name: userName || 'Unknown',
      isAuthenticated: true
    } : null,
    // Add WebSocket context if needed
    ws: null,
  };
};

// WebSocket context creation function
export const createWSContext = async (opts: { ws?: any; userId?: string; userName?: string }) => {
  return {
    req: null,
    ws: opts.ws || null,
    user: opts.userId ? {
      id: opts.userId,
      name: opts.userName || 'Unknown',
      isAuthenticated: true
    } : null,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
export type WSContext = Awaited<ReturnType<typeof createWSContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Protected procedure for authenticated users
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  console.log('Protected procedure check:', {
    hasUser: !!ctx.user,
    isAuthenticated: ctx.user?.isAuthenticated,
    userId: ctx.user?.id
  });
  
  // Check if user is authenticated
  if (!ctx.user?.isAuthenticated) {
    throw new Error('Unauthorized: Please log in to access this feature');
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Ensure user is available in protected procedures
    },
  });
});