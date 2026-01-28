import type { SocketBus } from "./socket";

/**
 * Vercel (serverless) não mantém conexão WebSocket/socket.io.
 * Mantemos a API REST funcionando e o realtime pode ser provido por outro serviço.
 */
export function createNoopSocket(): SocketBus {
  return {
    emitQueueStatus: () => {},
    emitCalled: () => {},
    emitFinished: () => {}
  };
}

