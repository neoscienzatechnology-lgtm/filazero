import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Card, Input } from "@fila-zero/ui";
import { RealtimeEvents } from "@fila-zero/shared";
import { apiFetch } from "../lib/api";
import { getSocket } from "../lib/socket";

export function OperatorPage() {
  const [queueId, setQueueId] = React.useState("");

  const statusQuery = useQuery({
    queryKey: ["queue-status", queueId],
    enabled: Boolean(queueId),
    queryFn: () =>
      apiFetch<{
        queueId: string;
        name: string;
        waitingCount: number;
        servingEntryId: string | null;
      }>(`/queues/${queueId}/status`)
  });

  React.useEffect(() => {
    if (!queueId) return;
    const s = getSocket();
    s.emit("queue:subscribe", queueId);
    const handler = () => statusQuery.refetch();
    s.on(RealtimeEvents.queue.status, handler);
    return () => {
      s.off(RealtimeEvents.queue.status, handler);
      s.emit("queue:unsubscribe", queueId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueId]);

  const next = useMutation({
    mutationFn: () =>
      apiFetch(`/queues/${queueId}/next`, { method: "POST", auth: true }),
    onSuccess: () => statusQuery.refetch()
  });

  const finish = useMutation({
    mutationFn: () =>
      apiFetch(`/queues/${queueId}/finish`, { method: "POST", auth: true }),
    onSuccess: () => statusQuery.refetch()
  });

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Painel Operador</h1>
      <Card className="max-w-xl">
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm">
            Queue ID
            <Input
              placeholder="Cole o UUID da fila"
              value={queueId}
              onChange={(e) => setQueueId(e.target.value)}
            />
          </label>
          {statusQuery.isLoading && <p className="text-sm">Carregando status...</p>}
          {statusQuery.isError && (
            <p className="text-sm text-red-600">
              {String((statusQuery.error as Error).message)}
            </p>
          )}
          {statusQuery.data && (
            <div className="text-sm">
              <p className="font-medium">{statusQuery.data.name}</p>
              <p>Aguardando: {statusQuery.data.waitingCount}</p>
              <p>
                Em atendimento:{" "}
                {statusQuery.data.servingEntryId ? statusQuery.data.servingEntryId : "—"}
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <Button disabled={!queueId || next.isPending} onClick={() => next.mutate()}>
              {next.isPending ? "Chamando..." : "Chamar próximo"}
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={!queueId || finish.isPending}
              onClick={() => finish.mutate()}
            >
              {finish.isPending ? "Finalizando..." : "Finalizar"}
            </Button>
          </div>
          {(next.isError || finish.isError) && (
            <p className="text-sm text-red-600">
              {String((next.error ?? finish.error)?.message)}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

