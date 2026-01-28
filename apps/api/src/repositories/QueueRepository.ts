import type { PrismaClient } from "@prisma/client";

export class QueueRepository {
  constructor(private prisma: PrismaClient) {}

  createQueue(data: {
    establishmentId: string;
    name: string;
    type: string;
    avgServiceTimeMin: number;
    isOpen: boolean;
    publicSlug: string;
  }) {
    return this.prisma.queue.create({ data });
  }

  findQueueById(id: string) {
    return this.prisma.queue.findUnique({ where: { id } });
  }

  findQueueBySlug(publicSlug: string) {
    return this.prisma.queue.findUnique({ where: { publicSlug } });
  }

  async getQueueStatus(queueId: string) {
    const queue = await this.prisma.queue.findUnique({
      where: { id: queueId }
    });
    if (!queue) return null;

    const waitingCount = await this.prisma.queueEntry.count({
      where: { queueId, status: "WAITING" }
    });

    const currentSession = await this.prisma.serviceSession.findFirst({
      where: { queueId, finishedAt: null },
      orderBy: { startedAt: "desc" }
    });

    return {
      queueId: queue.id,
      name: queue.name,
      type: queue.type,
      avgServiceTimeMin: queue.avgServiceTimeMin,
      isOpen: queue.isOpen,
      waitingCount,
      servingEntryId: currentSession?.entryId ?? null
    };
  }

  async joinQueue(params: {
    queueId: string;
    clientUserId?: string | null;
    clientName?: string | null;
  }) {
    const last = await this.prisma.queueEntry.findFirst({
      where: { queueId: params.queueId, status: "WAITING" },
      orderBy: { position: "desc" }
    });
    const nextPos = (last?.position ?? 0) + 1;

    return this.prisma.queueEntry.create({
      data: {
        queueId: params.queueId,
        clientUserId: params.clientUserId ?? null,
        clientName: params.clientName ?? null,
        status: "WAITING",
        position: nextPos
      }
    });
  }

  async callNext(queueId: string, operatorId?: string | null) {
    const nextEntry = await this.prisma.queueEntry.findFirst({
      where: { queueId, status: "WAITING" },
      orderBy: { position: "asc" }
    });
    if (!nextEntry) return null;

    // marca como CALLED e abre uma sessão
    const [entry, session] = await this.prisma.$transaction([
      this.prisma.queueEntry.update({
        where: { id: nextEntry.id },
        data: { status: "CALLED", calledAt: new Date() }
      }),
      this.prisma.serviceSession.create({
        data: { queueId, entryId: nextEntry.id, operatorId: operatorId ?? null }
      })
    ]);

    return { entry, session };
  }

  async finishCurrent(queueId: string) {
    const session = await this.prisma.serviceSession.findFirst({
      where: { queueId, finishedAt: null },
      orderBy: { startedAt: "desc" }
    });
    if (!session) return null;

    const [updatedSession] = await this.prisma.$transaction([
      this.prisma.serviceSession.update({
        where: { id: session.id },
        data: { finishedAt: new Date() }
      }),
      this.prisma.queueEntry.update({
        where: { id: session.entryId },
        data: { status: "SERVED", servedAt: new Date() }
      })
    ]);

    return { session: updatedSession };
  }
}

