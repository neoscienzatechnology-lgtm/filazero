import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, Card, Input } from "@fila-zero/ui";
import { CreateQueueDtoSchema } from "@fila-zero/shared";
import { apiFetch } from "../lib/api";

export function AdminPage() {
  // No MVP, o seed cria 1 establishment. Você pode pegar o ID via DB.
  // Para rodar "agora", deixamos um campo editável.
  const [establishmentId, setEstablishmentId] = React.useState("");
  const [name, setName] = React.useState("Fila Principal");
  const [type, setType] = React.useState("Atendimento");
  const [avgServiceTimeMin, setAvg] = React.useState(10);

  const createQueue = useMutation({
    mutationFn: async () => {
      const dto = CreateQueueDtoSchema.parse({
        establishmentId,
        name,
        type,
        avgServiceTimeMin,
        isOpen: true
      });
      return apiFetch<{ id: string; publicSlug: string }>(`/queues`, {
        method: "POST",
        body: dto,
        auth: true
      });
    }
  });

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Painel Admin (MVP)</h1>
      <Card className="max-w-xl">
        <div className="grid gap-3">
          <p className="text-sm text-neutral-700">
            Crie uma fila para um estabelecimento. No MVP, o estabelecimento do seed
            é “Clínica Exemplo” (owner do admin).
          </p>

          <label className="grid gap-1 text-sm">
            Establishment ID
            <Input
              placeholder="Cole o UUID do establishment"
              value={establishmentId}
              onChange={(e) => setEstablishmentId(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              Nome
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="grid gap-1 text-sm">
              Tipo
              <Input value={type} onChange={(e) => setType(e.target.value)} />
            </label>
          </div>

          <label className="grid gap-1 text-sm">
            Tempo médio (min)
            <Input
              type="number"
              value={avgServiceTimeMin}
              onChange={(e) => setAvg(Number(e.target.value))}
            />
          </label>

          <Button disabled={createQueue.isPending} onClick={() => createQueue.mutate()}>
            {createQueue.isPending ? "Criando..." : "Criar fila"}
          </Button>

          {createQueue.isError && (
            <p className="text-sm text-red-600">{String(createQueue.error.message)}</p>
          )}
          {createQueue.isSuccess && (
            <div className="grid gap-1 text-sm">
              <p className="text-green-700">Fila criada com sucesso.</p>
              <p>
                Queue ID: <code className="rounded bg-neutral-100 px-1">{createQueue.data.id}</code>
              </p>
              <p>
                Slug público:{" "}
                <code className="rounded bg-neutral-100 px-1">{createQueue.data.publicSlug}</code>
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

