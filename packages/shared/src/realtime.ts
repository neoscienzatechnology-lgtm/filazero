export const RealtimeEvents = {
  queue: {
    join: "queue:join",
    status: "queue:status",
    called: "queue:called",
    finished: "queue:finished"
  }
} as const;

export type QueueRoom = `queue:${string}`;

export function queueRoom(queueId: string): QueueRoom {
  return `queue:${queueId}`;
}

