import type { Server } from "socket.io";
import { queueRoom, RealtimeEvents } from "@fila-zero/shared";

export type SocketBus = ReturnType<typeof createSocket>;

export function createSocket(io: Server) {
  io.on("connection", (socket) => {
    socket.on("queue:subscribe", (queueId: string) => {
      socket.join(queueRoom(queueId));
    });
    socket.on("queue:unsubscribe", (queueId: string) => {
      socket.leave(queueRoom(queueId));
    });
  });

  return {
    emitQueueStatus(queueId: string, payload: unknown) {
      io.to(queueRoom(queueId)).emit(RealtimeEvents.queue.status, payload);
    },
    emitCalled(queueId: string, payload: unknown) {
      io.to(queueRoom(queueId)).emit(RealtimeEvents.queue.called, payload);
    },
    emitFinished(queueId: string, payload: unknown) {
      io.to(queueRoom(queueId)).emit(RealtimeEvents.queue.finished, payload);
    }
  };
}

