import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  return {
    req: opts.req,
    // Add WebSocket context if needed
    ws: null, // This would be populated in WebSocket connections
    // You can add more context items here like database connections, auth, etc.
  };
};

// WebSocket context creation function
export const createWSContext = async (opts: { ws?: any }) => {
  return {
    req: null,
    ws: opts.ws || null,
    // Add WebSocket-specific context
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
  // Add authentication logic here if needed
  return next({
    ctx: {
      ...ctx,
      // Add user context
    },
  });
});