import { Router } from "express";
import type { PrismaClient } from "@prisma/client";
import type { Server } from "socket.io";
import { LoginDtoSchema, RefreshDtoSchema, CreateQueueDtoSchema, JoinQueueDtoSchema } from "@fila-zero/shared";

import { validateBody } from "./middlewares/validateBody";
import { authMiddleware } from "./middlewares/authMiddleware";
import { requireRole } from "./middlewares/requireRole";

import { UserRepository } from "../repositories/UserRepository";
import { AuthRepository } from "../repositories/AuthRepository";
import { QueueRepository } from "../repositories/QueueRepository";
import { AuthService } from "../services/AuthService";
import { QueueService } from "../services/QueueService";
import type { SocketBus } from "../realtime/socket";

export function buildRoutes(opts: {
  prisma: PrismaClient;
  io: Server;
  socket: SocketBus;
}) {
  const router = Router();

  const users = new UserRepository(opts.prisma);
  const authRepo = new AuthRepository(opts.prisma);
  const queuesRepo = new QueueRepository(opts.prisma);

  const authService = new AuthService(users, authRepo);
  const queueService = new QueueService(queuesRepo);

  // Auth
  router.post("/auth/login", validateBody(LoginDtoSchema), async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  });

  router.post("/auth/refresh", validateBody(RefreshDtoSchema), async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.json(result);
  });

  router.post("/auth/logout", validateBody(RefreshDtoSchema), async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.logout(refreshToken);
    res.json(result);
  });

  // Queues (admin)
  router.post(
    "/queues",
    authMiddleware,
    requireRole(["ADMIN"]),
    validateBody(CreateQueueDtoSchema),
    async (req, res) => {
      const created = await queueService.createQueue(req.body);
      // broadcast inicial
      const status = await queueService.status(created.id);
      opts.socket.emitQueueStatus(created.id, status);
      res.status(201).json(created);
    }
  );

  // Join (público)
  router.post(
    "/queues/:id/join",
    validateBody(JoinQueueDtoSchema),
    async (req, res) => {
      const entry = await queueService.joinQueue(
        { id: req.params.id },
        { userId: null, name: req.body.clientName ?? null }
      );
      const status = await queueService.status(entry.queueId);
      opts.socket.emitQueueStatus(entry.queueId, status);
      res.status(201).json(entry);
    }
  );

  // Join por slug (para link público/QR)
  router.post(
    "/public/queues/:slug/join",
    validateBody(JoinQueueDtoSchema),
    async (req, res) => {
      const entry = await queueService.joinQueue(
        { slug: req.params.slug },
        { userId: null, name: req.body.clientName ?? null }
      );
      const status = await queueService.status(entry.queueId);
      opts.socket.emitQueueStatus(entry.queueId, status);
      res.status(201).json(entry);
    }
  );

  // Status público
  router.get("/queues/:id/status", async (req, res) => {
    const status = await queueService.status(req.params.id);
    res.json(status);
  });

  // Next (operador)
  router.post(
    "/queues/:id/next",
    authMiddleware,
    requireRole(["OPERATOR", "ADMIN"]),
    async (req, res) => {
      const result = await queueService.next(req.params.id, req.auth?.sub ?? null);
      const status = await queueService.status(req.params.id);
      opts.socket.emitCalled(req.params.id, { entryId: result.entry.id });
      opts.socket.emitQueueStatus(req.params.id, status);
      res.json(result);
    }
  );

  // Finish (operador)
  router.post(
    "/queues/:id/finish",
    authMiddleware,
    requireRole(["OPERATOR", "ADMIN"]),
    async (req, res) => {
      const result = await queueService.finish(req.params.id);
      const status = await queueService.status(req.params.id);
      opts.socket.emitFinished(req.params.id, { ok: true });
      opts.socket.emitQueueStatus(req.params.id, status);
      res.json(result);
    }
  );

  return router;
}

