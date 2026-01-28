import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { LoginDtoSchema } from "@fila-zero/shared";
import { Button, Card, Input } from "@fila-zero/ui";
import { apiFetch, setTokens } from "../lib/api";

export function LoginPage() {
  const [email, setEmail] = React.useState("admin@fila.local");
  const [password, setPassword] = React.useState("123456");

  const login = useMutation({
    mutationFn: async () => {
      const dto = LoginDtoSchema.parse({ email, password });
      return apiFetch<{
        accessToken: string;
        refreshToken: string;
        user: { id: string; email: string; role: string };
      }>("/auth/login", { method: "POST", body: dto });
    },
    onSuccess: (data) => {
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    }
  });

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Login</h1>
      <Card className="max-w-md">
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm">
            Email
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm">
            Senha
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <Button disabled={login.isPending} onClick={() => login.mutate()}>
            {login.isPending ? "Entrando..." : "Entrar"}
          </Button>
          {login.isError && (
            <p className="text-sm text-red-600">{String(login.error.message)}</p>
          )}
          {login.isSuccess && (
            <p className="text-sm text-green-700">
              Logado. Vá para Admin/Operador.
            </p>
          )}
          <p className="text-xs text-neutral-600">
            Dica: use <b>admin@fila.local</b> / <b>123456</b> (seed).
          </p>
        </div>
      </Card>
    </div>
  );
}

