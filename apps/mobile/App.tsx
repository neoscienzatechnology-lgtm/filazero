import * as React from "react";
import { SafeAreaView, View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { RealtimeEvents } from "@fila-zero/shared";
import { apiFetch } from "./src/lib/api";
import { getSocket } from "./src/lib/socket";

type QueueStatus = {
  queueId: string;
  name: string;
  type: string;
  avgServiceTimeMin: number;
  isOpen: boolean;
  waitingCount: number;
  servingEntryId: string | null;
};

export default function App() {
  const [queueId, setQueueId] = React.useState("");
  const [clientName, setClientName] = React.useState("Visitante");
  const [myEntryId, setMyEntryId] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<QueueStatus | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [lastCall, setLastCall] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function refreshStatus(id: string) {
    const st = await apiFetch<QueueStatus>(`/queues/${id}/status`);
    setStatus(st);
  }

  React.useEffect(() => {
    if (!queueId) return;
    const s = getSocket();
    s.emit("queue:subscribe", queueId);

    const onStatus = (payload: unknown) => {
      // payload pode ser o status completo (backend emite), mas também refazemos fetch por simplicidade.
      void payload;
      refreshStatus(queueId).catch(() => {});
    };
    const onCalled = (p: { entryId: string }) => setLastCall(p.entryId);

    s.on(RealtimeEvents.queue.status, onStatus);
    s.on(RealtimeEvents.queue.called, onCalled);

    return () => {
      s.off(RealtimeEvents.queue.status, onStatus);
      s.off(RealtimeEvents.queue.called, onCalled);
      s.emit("queue:unsubscribe", queueId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueId]);

  async function handleLoad() {
    setError(null);
    if (!queueId) return;
    setLoading(true);
    try {
      await refreshStatus(queueId);
    } catch (e) {
      setError((e as Error).message);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    setError(null);
    if (!queueId) return;
    setLoading(true);
    try {
      const entry = await apiFetch<{ id: string; queueId: string; position: number }>(
        `/queues/${queueId}/join`,
        { method: "POST", body: { clientName } }
      );
      setMyEntryId(entry.id);
      await refreshStatus(queueId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const isMineCalled = myEntryId && lastCall === myEntryId;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Text style={styles.title}>Fila Zero</Text>
        <Text style={styles.subtitle}>Cliente (Mobile) — MVP</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Queue ID</Text>
          <TextInput
            value={queueId}
            onChangeText={setQueueId}
            placeholder="Cole o UUID da fila"
            autoCapitalize="none"
            style={styles.input}
          />

          <View style={styles.row}>
            <Pressable style={styles.btn} onPress={handleLoad} disabled={loading || !queueId}>
              <Text style={styles.btnText}>{loading ? "Carregando..." : "Ver status"}</Text>
            </Pressable>
          </View>

          {status && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.h2}>{status.name}</Text>
              <Text style={styles.p}>Tipo: {status.type}</Text>
              <Text style={styles.p}>Aguardando: {status.waitingCount}</Text>
              <Text style={styles.p}>
                Em atendimento: {status.servingEntryId ? "sim" : "não"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Seu nome (opcional)</Text>
          <TextInput
            value={clientName}
            onChangeText={setClientName}
            placeholder="Seu nome"
            style={styles.input}
          />
          <Pressable style={[styles.btn, { marginTop: 10 }]} onPress={handleJoin} disabled={loading || !queueId}>
            <Text style={styles.btnText}>{loading ? "Entrando..." : "Entrar na fila"}</Text>
          </Pressable>

          {myEntryId && (
            <Text style={[styles.p, { marginTop: 10 }]}>
              Seu entryId: <Text style={{ fontWeight: "600" }}>{myEntryId}</Text>
            </Text>
          )}

          {isMineCalled && (
            <View style={styles.alert}>
              <Text style={styles.alertText}>Atenção: chegou sua vez.</Text>
            </View>
          )}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
        {!error && !status && (
          <Text style={styles.hint}>
            Dica: rode a API e use um Queue ID existente (seed/DB).
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fafafa" },
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 28, fontWeight: "700", color: "#111" },
  subtitle: { fontSize: 14, color: "#555", marginBottom: 6 },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    padding: 14
  },
  label: { fontSize: 12, color: "#444", marginBottom: 6, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  row: { flexDirection: "row", gap: 10, marginTop: 10 },
  btn: {
    backgroundColor: "#111",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center"
  },
  btnText: { color: "white", fontWeight: "700" },
  h2: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  p: { fontSize: 13, color: "#222" },
  hint: { fontSize: 12, color: "#666", marginTop: 6 },
  error: { fontSize: 12, color: "#b00020", marginTop: 6 },
  alert: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#f4d18a",
    backgroundColor: "#fff7e6",
    padding: 10,
    borderRadius: 12
  },
  alertText: { color: "#6b3f00", fontWeight: "700" }
});

