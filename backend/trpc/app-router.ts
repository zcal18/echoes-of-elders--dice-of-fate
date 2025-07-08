import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { chatRouter } from "./routes/chat/router";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  chat: chatRouter,
  // Add guild battle routes here if needed
  guild: createTRPCRouter({
    // Guild-related endpoints can be added here
  }),
  pvp: createTRPCRouter({
    // PVP-related endpoints can be added here
  }),
});

export type AppRouter = typeof appRouter;