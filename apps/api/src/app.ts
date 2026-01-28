import express from "express";
import cors from "cors";
import { buildRoutes } from "./http/routes";
import { errorMiddleware } from "./http/middlewares/errorMiddleware";
import type { PrismaClient } from "@prisma/client";
import type { Server as SocketIOServer } from "socket.io";
import type { SocketBus } from "./realtime/socket";

/**
 * App factory para permitir:
 * - Local: server com http + socket.io
 * - Vercel: função serverless (REST) com "socket" noop
 */
export function createApp(opts: {
  prisma: PrismaClient;
  io?: SocketIOServer;
  socket: SocketBus;
}) {
  const app = express();
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? "*",
      credentials: true
    })
  );
  app.use(express.json());
  app.use("/health", (_req, res) => res.json({ ok: true }));
  app.use(buildRoutes({ prisma: opts.prisma, io: opts.io as any, socket: opts.socket }));
  app.use(errorMiddleware);
  return app;
}

