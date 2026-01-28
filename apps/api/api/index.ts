import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createPrisma } from "../src/infra/prisma";
import { createNoopSocket } from "../src/realtime/noopSocket";
import { createApp } from "../src/app";

/**
 * Handler Vercel (REST).
 * Observação: realtime via socket.io não funciona em Serverless Functions.
 */
const prisma = createPrisma();
const app = createApp({ prisma, socket: createNoopSocket() });

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Express app como handler
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (app as any)(req, res);
}

