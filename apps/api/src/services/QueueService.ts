import { BadRequestError, NotFoundError } from "../domain/errors";
import { makePublicSlug } from "../infra/utils/slug";
import { QueueRepository } from "../repositories/QueueRepository";

export class QueueService {
  constructor(private queues: QueueRepository) {}

  async createQueue(input: {
    establishmentId: string;
    name: string;
    type: string;
    avgServiceTimeMin: number;
    isOpen: boolean;
  }) {
    const publicSlug = makePublicSlug(input.name);
    return this.queues.createQueue({ ...input, publicSlug });
  }

  async joinQueue(queueIdOrSlug: { id?: string; slug?: string }, client: { userId?: string | null; name?: string | null }) {
    const queue = queueIdOrSlug.id
      ? await this.queues.findQueueById(queueIdOrSlug.id)
      : await this.queues.findQueueBySlug(queueIdOrSlug.slug ?? "");

    if (!queue) throw new NotFoundError("Fila não encontrada");
    if (!queue.isOpen) throw new BadRequestError("Fila fechada");

    return this.queues.joinQueue({
      queueId: queue.id,
      clientUserId: client.userId ?? null,
      clientName: client.name ?? null
    });
  }

  async status(queueId: string) {
    const status = await this.queues.getQueueStatus(queueId);
    if (!status) throw new NotFoundError("Fila não encontrada");
    return status;
  }

  async next(queueId: string, operatorId?: string | null) {
    const result = await this.queues.callNext(queueId, operatorId ?? null);
    if (!result) throw new BadRequestError("Não há clientes aguardando");
    return result;
  }

  async finish(queueId: string) {
    const result = await this.queues.finishCurrent(queueId);
    if (!result) throw new BadRequestError("Não há atendimento em andamento");
    return result;
  }
}

