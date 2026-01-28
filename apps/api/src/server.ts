import "dotenv/config";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

import { createPrisma } from "./infra/prisma";
import { createSocket } from "./realtime/socket";
import { seedDev } from "./infra/seedDev";
import { createApp } from "./app";

const prisma = createPrisma();

const httpServer = http.createServer();
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true
  }
});

const socket = createSocket(io);
const app = createApp({ prisma, io, socket });
httpServer.on("request", app);

const port = Number(process.env.PORT ?? 3001);
httpServer.listen(port, async () => {
  // Seed de desenvolvimento: cria admin/operador/cliente e um establishment/queue
  // Para um MVP rodar "de primeira", sem criar telas complexas de cadastro.
  await seedDev(prisma);
  console.log(`[api] on http://localhost:${port}`);
});

