# Taskly

Base acadêmica do app **Taskly**, um marketplace digital de serviços.

Nesta entrega da disciplina, o foco funcional foi:
- autenticação
- CRUD de notícias
- consumo da API real no app mobile

O visual e a organização foram inspirados no protótipo Figma informado:
`https://www.figma.com/design/Xgd61TF4Cy2sVlIqv3iVph/Taskly--Copy-?node-id=0-1&t=6hQi8lsG41S5Ix14-1`

## Contexto acadêmico

Este repositório entrega um MVP técnico pronto para demonstração, já estruturado para evolução futura do Taskly para um marketplace completo (serviços, agendamento, pagamento, avaliação e perfis mais avançados).

## Stack utilizada

### Mobile
- React Native
- Expo SDK 54
- TypeScript
- React Navigation
- AsyncStorage

### API
- NestJS
- TypeScript
- PostgreSQL
- Drizzle ORM
- JWT + Passport
- class-validator

### Infra
- Docker Compose (PostgreSQL)
- Variáveis de ambiente com `.env`

## Estrutura do projeto

```text
.
├── apps
│   ├── api
│   │   ├── drizzle
│   │   ├── src
│   │   │   ├── common
│   │   │   ├── config
│   │   │   ├── db
│   │   │   └── modules
│   │   │       ├── auth
│   │   │       ├── news
│   │   │       ├── profiles
│   │   │       └── users
│   │   └── .env.example
│   └── mobile
│       ├── src
│       │   ├── components
│       │   ├── hooks
│       │   ├── navigation
│       │   ├── screens
│       │   ├── services
│       │   ├── storage
│       │   ├── theme
│       │   └── types
│       └── .env.example
├── docker-compose.yml
└── package.json
```

## Pré-requisitos

- Node.js 20+
- npm 10+
- Docker + Docker Compose

## Como instalar

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

`EXPO_PUBLIC_API_URL` deve apontar para a API.
- Emulador Android costuma usar `http://10.0.2.2:3333/api`
- iOS simulator geralmente funciona com `http://localhost:3333/api`
- Dispositivo físico deve usar IP da máquina na rede local

## Banco de dados

Subir PostgreSQL com Docker:

```bash
npm run db:up
```

A porta publicada padrão está em `55432` (evita conflito com portas locais já ocupadas).

Aplicar migrations:

```bash
npm run db:migrate
```

Rodar seed de perfis:

```bash
npm run db:seed
```

Parar banco:

```bash
npm run db:down
```

## Rodando a API

```bash
npm run dev:api
```

API disponível em:
- `http://localhost:3333/api`

## Rodando o app mobile

```bash
npm run dev:mobile
```

## Endpoints implementados

### Auth
- `POST /api/auth/cadastro`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Notícias
- `GET /api/noticias`
- `GET /api/noticias/:id`
- `POST /api/noticias` (JWT)
- `PUT /api/noticias/:id` (JWT)
- `DELETE /api/noticias/:id` (JWT)

## Modelagem de dados

Implementado funcionalmente:
- `profiles`
- `users`
- `news`

Estruturas já preparadas para evolução futura:
- `comments`
- `tags`
- `ufs`
- `cities`

## O que foi implementado nesta entrega

- Monorepo simples com `apps/api` e `apps/mobile`
- API NestJS com módulos organizados (`auth`, `users`, `profiles`, `news`)
- Drizzle ORM configurado com schema e migration inicial
- Seed de perfis: `LEITOR`, `AUTOR`, `EDITOR`, `SUPERADMIN`
- Cadastro público criando usuário com perfil `LEITOR`
- Login com JWT e senha em hash (`bcrypt`)
- CRUD de notícias com autenticação para escrita
- Controle básico de autoria em edição/exclusão (autor ou SUPERADMIN)
- Mobile Expo SDK 54 com TypeScript
- Telas: Splash, Login, Cadastro, Home, Detalhe, Nova/Editar notícia, Perfil
- Camada de API centralizada no mobile
- Persistência local de sessão/token no mobile
- Tema visual consistente inspirado no Figma (teal + orange, cards limpos)

## O que ficou preparado para próximas entregas

- Base para RBAC por perfil
- Base de entidades de marketplace (comentários, tags, UF/cidade)
- Estrutura modular pronta para novos domínios:
  - serviços
  - agenda
  - pagamentos
  - avaliações

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

### API (`apps/api`)
- `npm run start:dev`
- `npm run build`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:seed`

### Mobile (`apps/mobile`)
- `npm run start`
- `npm run android`
- `npm run ios`
- `npm run typecheck`

## Observações

- O migration file gerado automaticamente está em `apps/api/drizzle/0000_rapid_mephisto.sql`.
- Se quiser regenerar migrations após mudanças no schema, rode `npm run db:generate --workspace @taskly/api`.
