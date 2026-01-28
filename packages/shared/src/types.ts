export type Role = "ADMIN" | "OPERATOR" | "CLIENT";

export type Id = string;

export type PublicQueueStatus = {
  queueId: Id;
  name: string;
  type: string;
  avgServiceTimeMin: number;
  isOpen: boolean;
  waitingCount: number;
  servingEntryId: Id | null;
};

export type QueueEntryStatus = "WAITING" | "CALLED" | "SERVED" | "CANCELLED";

