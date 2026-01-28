# Fila Zero (MVP) — Monorepo

Aplicação moderna para gerenciamento de filas em tempo real (web + mobile), com backend em Node.js/Express, Prisma/PostgreSQL e realtime via Socket.io.

## Estrutura

```
/apps
  /api      -> Express + Prisma + Socket.io (Clean-ish Architecture)
  /web      -> React + TS + Vite + Tailwind + React Query + Router
  /mobile   -> React Native (Expo) + TS
/packages
  /shared   -> tipos, validações, helpers compartilhados
  /ui       -> componentes UI compartilháveis (base)
```

## Requisitos

- Node.js 18+ (recomendado 20+)
- PostgreSQL local (ou via Docker)

## Variáveis de ambiente

Crie `apps/api/.env` baseado em `apps/api/.env.example`.

## Banco (Prisma)

No diretório `apps/api`:

```bash
npm i
npm run prisma:generate
npm run prisma:migrate
```

Para ver/copiar IDs (UUIDs) no banco:

```bash
npm run prisma:studio -w @fila-zero/api
```

## Rodar API (com realtime)

Na raiz:

```bash
npm i
npm run dev:api
```

API: `http://localhost:3001`

## Rodar Web

Na raiz:

```bash
npm i
npm run dev:web
```

Web: `http://localhost:5173`

## Rodar Mobile (Expo)

Na raiz:

```bash
npm i
npm run dev:mobile
```

Depois escaneie o QR Code do Expo Go.

Importante (mobile): em dispositivo físico, **`localhost` não aponta para sua máquina**.
Use `.env` no mobile (baseado em `apps/mobile/.env.example`) para apontar para o **IP da sua máquina na rede** (ex: `http://192.168.0.10:3001`).

## Deploy no Vercel

### Web (`apps/web`)

- **Crie um projeto no Vercel** apontando o *Root Directory* para `apps/web`
- **Env vars** (Project Settings → Environment Variables):
  - `VITE_API_URL`: URL da sua API (ex: `https://sua-api.vercel.app`)
  - `VITE_SOCKET_URL`: **somente se seu realtime estiver fora do Vercel** (ex: `https://sua-api-realtime.fly.dev`)

### API (`apps/api`)

- **Crie um segundo projeto no Vercel** apontando o *Root Directory* para `apps/api`
- Configure `DATABASE_URL` (Postgres gerenciado — Neon/Supabase/Railway etc.)
- Rode migrations no CI/CD ou localmente (recomendado): `npm run prisma:migrate -w @fila-zero/api`

Importante: **Vercel Serverless Functions não suportam WebSocket/Socket.io** de forma nativa.
O deploy do `apps/api` no Vercel mantém a **API REST** funcionando, mas o realtime precisa estar em um servidor com suporte a conexões long-lived (ex: Fly.io, Railway, Render) ou via provedor (Ably/Pusher/etc.).

## Deploy automático (GitHub Actions → Vercel)

Este repo já inclui o workflow: `.github/workflows/vercel-deploy.yml`.

### Passos

- Suba o código no GitHub (branch `main` ou `master`)
- Crie **2 projetos no Vercel**:
  - `apps/web`
  - `apps/api`
- No GitHub, em **Settings → Secrets and variables → Actions**, crie os secrets:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID_WEB`
  - `VERCEL_PROJECT_ID_API`

### Como obter ORG/PROJECT IDs

No Vercel CLI (uma vez localmente):

```bash
npx vercel login
cd apps/web && npx vercel link
cd ../api && npx vercel link
```

Depois copie os valores criados em `.vercel/project.json` (cada app) para os secrets acima.

## Fluxo rápido (MVP)

- **Admin** faz login e cria uma fila
- **Cliente** entra via link público (ou QR Code) e acompanha posição em tempo real
- **Operador** chama o próximo; cliente recebe evento realtime

## Endpoints (essenciais)

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /queues` (admin)
- `POST /queues/:id/join` (cliente)
- `POST /queues/:id/next` (operador)
- `POST /queues/:id/finish` (operador)
- `GET /queues/:id/status` (público)

## Observações

- JWT + Refresh Token (rotacionado) com roles (`ADMIN`, `OPERATOR`, `CLIENT`)
- Socket.io notifica:
  - atualização de posição
  - chamada de cliente
  - finalização de atendimento

