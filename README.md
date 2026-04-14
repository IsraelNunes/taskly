# Taskly

Projeto acadêmico da **Entrega 3 - Mobile II - 0022** com monorepo:
- `apps/api`: NestJS + Drizzle + PostgreSQL
- `apps/mobile`: React Native + Expo SDK 54 + TypeScript

## Contexto da entrega

O Taskly evolui para uma base de app com:
- autenticação
- RBAC por perfil (`LEITOR`, `AUTOR`, `EDITOR`, `SUPERADMIN`)
- CRUD de notícias com regras editoriais
- módulos complementares exigidos (comentários, tags, perfis, UF, cidades, usuários admin)
- app mobile com fluxos públicos e fluxos por nível de acesso

## Stack

### API
- NestJS
- TypeScript
- Drizzle ORM
- PostgreSQL
- JWT + Passport
- class-validator

### Mobile
- React Native
- Expo SDK 54
- TypeScript
- React Navigation
- AsyncStorage

### Infra
- Docker Compose (PostgreSQL)

## Estrutura

```text
.
├── apps
│   ├── api
│   │   ├── drizzle
│   │   └── src
│   │       ├── common
│   │       ├── config
│   │       ├── db
│   │       └── modules
│   │           ├── auth
│   │           ├── news
│   │           ├── comments
│   │           ├── tags
│   │           ├── profiles
│   │           ├── users
│   │           ├── ufs
│   │           └── cities
│   └── mobile
│       └── src
│           ├── components
│           ├── hooks
│           ├── navigation
│           ├── screens
│           │   └── admin
│           ├── services
│           ├── storage
│           ├── theme
│           └── types
├── docker-compose.yml
└── package.json
```

## Instalação

```bash
npm install
```

## Configuração de ambiente

### API

```bash
cp apps/api/.env.example apps/api/.env
```

### Mobile

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

No celular físico (Expo Go), use IP local no mobile:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3333/api
```

## Uso com Docker

O Docker é usado para subir o **PostgreSQL** do projeto.  
API e mobile continuam rodando localmente com `npm`.

### 1) Subir o banco

```bash
npm run db:up
```

Esse comando executa `docker compose up -d postgres` usando o `docker-compose.yml`.

### 2) Preparar schema e dados

```bash
npm run db:migrate
npm run db:seed
```

### 3) Subir aplicação

API:

```bash
npm run dev:api
```

Mobile:

```bash
npm run dev:mobile
```

### 4) Logs e parada

Ver logs do PostgreSQL:

```bash
npm run db:logs
```

Parar containers:

```bash
npm run db:down
```

Se quiser remover também o volume de dados:

```bash
docker compose down -v
```

### Compose alternativo (`docker-compose.db.yml`)

Se preferir usar o compose dedicado do banco:

```bash
docker compose -f docker-compose.db.yml up -d
docker compose -f docker-compose.db.yml down
```

### Troubleshooting rápido

- Erro de porta ocupada: altere `POSTGRES_PORT` e ajuste `DATABASE_URL` em `apps/api/.env`.
- API não conecta no banco: confirme se o container está saudável com `npm run db:logs`.
- Se mudou variáveis de ambiente do banco, recrie o serviço com `npm run db:down` e depois `npm run db:up`.

## Usuários de demonstração (seed)

Todos com senha `123456`:
- `leitor`
- `autor`
- `editor`
- `superadmin`

## RBAC implementado

### LEITOR
- visualiza notícias publicadas
- acessa home pública/autenticada
- comenta em notícias publicadas
- edita dados próprios (`/usuarios/me`)

### AUTOR
- cria notícia própria (forçada para `RASCUNHO`)
- visualiza publicadas + próprias
- edita apenas notícia própria em `RASCUNHO`
- não publica/despublica

### EDITOR
- visualiza todas as notícias
- edita qualquer notícia
- publica/despublica (`PATCH /noticias/:id/status`)

### SUPERADMIN
- tudo do EDITOR
- exclui notícia
- CRUD administrativo de:
  - tags
  - perfis
  - UF
  - cidades
  - usuários
  - gerenciamento de comentários

## Endpoints implementados

### Auth
- `POST /api/auth/cadastro`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Notícias
- `GET /api/noticias` (público + comportamento por token/perfil)
- `GET /api/noticias?tagId=<id>`
- `GET /api/noticias/:id`
- `GET /api/noticias/minhas` (auth)
- `GET /api/noticias/painel` (EDITOR/SUPERADMIN)
- `POST /api/noticias` (AUTOR/EDITOR/SUPERADMIN)
- `PUT /api/noticias/:id`
- `PATCH /api/noticias/:id/status` (EDITOR/SUPERADMIN)
- `DELETE /api/noticias/:id` (SUPERADMIN)

### Comentários
- `GET /api/comentarios`
- `GET /api/comentarios?noticiaId=<id>`
- `POST /api/comentarios` (auth)
- `PUT /api/comentarios/:id` (dono/SUPERADMIN)
- `DELETE /api/comentarios/:id` (dono/SUPERADMIN)

### Tags
- `GET /api/tags`
- `GET /api/tags/:id`
- `POST /api/tags` (SUPERADMIN)
- `PUT /api/tags/:id` (SUPERADMIN)
- `DELETE /api/tags/:id` (SUPERADMIN)

### Perfis
- `GET /api/perfis`
- `POST /api/perfis` (SUPERADMIN)
- `PUT /api/perfis/:id` (SUPERADMIN)
- `DELETE /api/perfis/:id` (SUPERADMIN)

### UF
- `GET /api/ufs`
- `POST /api/ufs` (SUPERADMIN)
- `PUT /api/ufs/:id` (SUPERADMIN)
- `DELETE /api/ufs/:id` (SUPERADMIN)

### Cidades
- `GET /api/cidades`
- `GET /api/cidades?ufId=<id>`
- `POST /api/cidades` (SUPERADMIN)
- `PUT /api/cidades/:id` (SUPERADMIN)
- `DELETE /api/cidades/:id` (SUPERADMIN)

### Usuários
- `GET /api/usuarios/me` (auth)
- `PUT /api/usuarios/me` (auth)
- `GET /api/usuarios` (SUPERADMIN)
- `GET /api/usuarios/:id` (SUPERADMIN)
- `POST /api/usuarios` (SUPERADMIN)
- `PUT /api/usuarios/:id` (SUPERADMIN)
- `DELETE /api/usuarios/:id` (SUPERADMIN)

## Fluxos mobile por perfil

### Público (sem login)
- Home pública
- Detalhe público de notícia publicada
- Busca por tag
- Login
- Cadastro

### LEITOR
- Meu perfil (visualizar/editar)
- Comentar em notícia

### AUTOR
- Minhas notícias
- Nova notícia
- Edição de notícia própria em rascunho

### EDITOR
- Painel editorial
- Editar qualquer notícia
- Publicar/despublicar

### SUPERADMIN
- Painel admin
- CRUD notícias (inclui exclusão)
- CRUD tags, perfis, UF, cidades, usuários
- Gerenciar comentários

## Scripts úteis

### Raiz
- `npm run dev:api`
- `npm run dev:mobile`
- `npm run build:api`
- `npm run lint:api`
- `npm run typecheck:mobile`
- `npm run db:up`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run db:down`

## Matriz final de conformidade (Entrega 3)

| Requisito da entrega | Status | Evidência |
|---|---|---|
| RBAC LEITOR/AUTOR/EDITOR/SUPERADMIN | ✅ Conforme | `apps/api/src/modules/news/news.service.ts`, `apps/api/src/common/guards/roles.guard.ts` |
| Proteger rascunho no detalhe público | ✅ Conforme | `apps/api/src/modules/news/news.service.ts` (`canViewNews`) |
| CRUD notícias com regras por perfil | ✅ Conforme | `apps/api/src/modules/news/news.controller.ts` + `news.service.ts` |
| CRUD comentários | ✅ Conforme | `apps/api/src/modules/comments/*` |
| CRUD tags | ✅ Conforme | `apps/api/src/modules/tags/*` |
| CRUD perfis | ✅ Conforme | `apps/api/src/modules/profiles/*` |
| CRUD UF | ✅ Conforme | `apps/api/src/modules/ufs/*` |
| CRUD cidades | ✅ Conforme | `apps/api/src/modules/cities/*` |
| CRUD usuários admin + perfil próprio | ✅ Conforme | `apps/api/src/modules/users/*` |
| Associação N:N notícia-tag | ✅ Conforme | `apps/api/src/db/schema.ts` (`newsTags`) + migration `0001_closed_sandman.sql` |
| Home pública + detalhe público + busca por tag | ✅ Conforme | `apps/mobile/src/screens/HomeScreen.tsx`, `TagSearchScreen.tsx`, `NewsDetailScreen.tsx` |
| Fluxo LEITOR | ✅ Conforme | `ProfileScreen.tsx`, `NewsDetailScreen.tsx` |
| Fluxo AUTOR | ✅ Conforme | `MyNewsScreen.tsx`, `NewsFormScreen.tsx` |
| Fluxo EDITOR | ✅ Conforme | `EditorialPanelScreen.tsx` |
| Fluxo SUPERADMIN | ✅ Conforme | `AdminPanelScreen.tsx` + `screens/admin/*` |
| Build API sem erro | ✅ Conforme | `npm run build:api` |
| Typecheck mobile sem erro | ✅ Conforme | `npm run typecheck:mobile` |
