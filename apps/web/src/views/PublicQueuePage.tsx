import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Button, Card, Input } from "@fila-zero/ui";
import { RealtimeEvents } from "@fila-zero/shared";
import { apiFetch } from "../lib/api";
import { getSocket } from "../lib/socket";

export function PublicQueuePage() {
  const params = useParams();
  const [queueId, setQueueId] = React.useState(params.queueId ?? "");
  const [clientName, setClientName] = React.useState("Visitante");
  const [myEntryId, setMyEntryId] = React.useState<string | null>(null);
  const [lastCall, setLastCall] = React.useState<string | null>(null);
  const queryClient = useQueryClient();
  const previousQueueId = React.useRef(queueId.trim());
  const normalizedQueueId = queueId.trim();

  const statusQuery = useQuery({
    queryKey: ["queue-status-public", normalizedQueueId],
    enabled: Boolean(normalizedQueueId),
    queryFn: () =>
      apiFetch<{
        queueId: string;
        name: string;
        type: string;
        avgServiceTimeMin: number;
        isOpen: boolean;
        waitingCount: number;
        servingEntryId: string | null;
      }>(`/queues/${normalizedQueueId}/status`)
  });

  const join = useMutation({
    mutationFn: () =>
      apiFetch<{ id: string; queueId: string; position: number }>(
        `/queues/${normalizedQueueId}/join`,
        { method: "POST", body: { clientName } }
      ),
    onSuccess: (entry) => {
      setMyEntryId(entry.id);
      statusQuery.refetch();
    }
  });

  React.useEffect(() => {
    if (previousQueueId.current && previousQueueId.current !== normalizedQueueId) {
      setMyEntryId(null);
      setLastCall(null);
      join.reset();
      queryClient.removeQueries({
        queryKey: ["queue-status-public", previousQueueId.current]
      });
    }
    previousQueueId.current = normalizedQueueId;
  }, [normalizedQueueId, join, queryClient]);

  React.useEffect(() => {
    if (!normalizedQueueId) return;
    const s = getSocket();
    s.emit("queue:subscribe", normalizedQueueId);

    const onStatus = () => statusQuery.refetch();
    const onCalled = (p: { entryId: string }) => setLastCall(p.entryId);
    s.on(RealtimeEvents.queue.status, onStatus);
    s.on(RealtimeEvents.queue.called, onCalled);
    return () => {
      s.off(RealtimeEvents.queue.status, onStatus);
      s.off(RealtimeEvents.queue.called, onCalled);
      s.emit("queue:unsubscribe", normalizedQueueId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedQueueId]);

  const isMineCalled = myEntryId && lastCall === myEntryId;
  const isQueueClosed = statusQuery.data ? !statusQuery.data.isOpen : false;
  const hasQueueId = Boolean(normalizedQueueId);
  const estimatedWaitMin = statusQuery.data
    ? Math.max(statusQuery.data.waitingCount * statusQuery.data.avgServiceTimeMin, 0)
    : null;

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Fila (público)</h1>

      <Card className="max-w-xl">
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm">
            Queue ID
            <Input
              placeholder="Cole o UUID da fila (ex: do seed/DB)"
              value={queueId}
              onChange={(e) => setQueueId(e.target.value)}
            />
          </label>

          {statusQuery.isLoading && hasQueueId && (
            <p className="text-sm">Carregando status...</p>
          )}
          {statusQuery.isError && (
            <p className="text-sm text-red-600">
              {String((statusQuery.error as Error).message)}
            </p>
          )}

          {statusQuery.data && (
            <div className="grid gap-1 text-sm">
              <p className="font-medium">
                {statusQuery.data.name} • {statusQuery.data.type}
              </p>
              <p>Aguardando: {statusQuery.data.waitingCount}</p>
              <p>Tempo médio: {statusQuery.data.avgServiceTimeMin} min</p>
              {estimatedWaitMin !== null && (
                <p>Estimativa de espera: ~{estimatedWaitMin} min</p>
              )}
              <p>
                Em atendimento:{" "}
                {statusQuery.data.servingEntryId ? "sim" : "não"}
              </p>
              <p>Status: {statusQuery.data.isOpen ? "aberta" : "fechada"}</p>
            </div>
          )}

          <div className="grid gap-2">
            <label className="grid gap-1 text-sm">
              Seu nome (opcional)
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </label>
            <Button
              disabled={!hasQueueId || join.isPending || isQueueClosed}
              onClick={() => join.mutate()}
            >
              {join.isPending ? "Entrando..." : "Entrar na fila"}
            </Button>
            {isQueueClosed && (
              <p className="text-sm text-amber-700">
                Esta fila está fechada no momento.
              </p>
            )}
            {join.isError && (
              <p className="text-sm text-red-600">{String(join.error.message)}</p>
            )}
            {myEntryId && (
              <p className="text-sm">
                Você entrou. Seu entryId:{" "}
                <code className="rounded bg-neutral-100 px-1">{myEntryId}</code>
              </p>
            )}
            {isMineCalled && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-sm text-amber-900">
                Atenção: chegou sua vez.
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

