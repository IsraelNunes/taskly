# Taskly

Marketplace de serviços que conecta **clientes** a **profissionais** (elétrica, hidráulica, reformas, etc.). Monorepo com API NestJS e app React Native/Expo.

## Stack

| Camada | Tecnologia |
|---|---|
| API | NestJS · Drizzle ORM · PostgreSQL · JWT |
| Mobile | React Native · Expo SDK 54 · React Navigation |
| Infra | Docker Compose (PostgreSQL) |

## Estrutura

```
Taskly/
├── apps/
│   ├── api/                        # Backend NestJS
│   │   ├── drizzle/                # Migrations SQL
│   │   └── src/
│   │       ├── common/             # Guards, decorators, utils RBAC
│   │       ├── config/             # Validação de env (Zod)
│   │       ├── db/                 # Schema Drizzle, migrations, seed
│   │       └── modules/
│   │           ├── auth/           # Login, cadastro, JWT
│   │           ├── users/          # Usuários (próprio + admin)
│   │           ├── profiles/       # CRUD de perfis (ADMIN)
│   │           ├── client-profiles/        # Perfil do cliente
│   │           ├── professional-profiles/  # Perfil + portfólio do profissional
│   │           ├── service-categories/     # Categorias de serviço
│   │           ├── ufs/            # Estados brasileiros
│   │           └── cities/         # Cidades
│   └── mobile/                     # App React Native
│       └── src/
│           ├── components/
│           ├── hooks/              # useAuth (contexto de autenticação)
│           ├── navigation/         # AppNavigator (tabs por role)
│           ├── screens/
│           │   ├── admin/          # Telas administrativas
│           │   ├── ProfileScreen.tsx
│           │   ├── EditClientProfileScreen.tsx
│           │   ├── EditProfessionalProfileScreen.tsx
│           │   └── RegisterScreen.tsx
│           ├── services/           # Chamadas HTTP à API
│           ├── theme/              # Cores e espaçamentos
│           └── types/              # Tipos TypeScript
├── docker-compose.yml
└── package.json
```

---

## Como rodar

### Pré-requisitos

- [Node.js](https://nodejs.org) 20+
- [Docker](https://www.docker.com) com Docker Compose
- [Expo Go](https://expo.dev/client) no celular (ou emulador Android/iOS)

---

### 1. Instalar dependências

Na raiz do projeto:

```bash
npm install
```

---

### 2. Configurar variáveis de ambiente da API

Crie o arquivo `apps/api/.env`:

```bash
# apps/api/.env

DATABASE_URL=postgresql://taskly:taskly@localhost:55432/taskly
JWT_SECRET=chave-secreta-minimo-8-chars
JWT_EXPIRES_IN=7d

# Opcionais (têm default)
PORT=3333
API_PREFIX=api
CORS_ORIGIN=*
NODE_ENV=development
```

> **Dica:** a senha e usuário do banco (`taskly:taskly`) e a porta (`55432`) já estão configurados no `docker-compose.yml`. Só copie o `DATABASE_URL` acima.

---

### 3. Configurar variáveis de ambiente do mobile

Crie o arquivo `apps/mobile/.env`:

```bash
# apps/mobile/.env

# Emulador Android
EXPO_PUBLIC_API_URL=http://10.0.2.2:3333/api

# Celular físico na mesma rede Wi-Fi — use o IP local da sua máquina
# EXPO_PUBLIC_API_URL=http://192.168.x.x:3333/api

# iOS Simulator ou web
# EXPO_PUBLIC_API_URL=http://localhost:3333/api
```

Para descobrir seu IP local:

```bash
# Linux/Mac
ip route get 1 | awk '{print $7; exit}'

# Windows
ipconfig
```

---

### 4. Subir o banco de dados

```bash
npm run db:up
```

Aguarde o container ficar saudável (leva ~5 segundos):

```bash
npm run db:logs
# procure por: "database system is ready to accept connections"
```

---

### 5. Rodar as migrations

```bash
npm run db:migrate
```

Isso aplica todas as migrations em `apps/api/drizzle/` e cria as tabelas no banco.

---

### 6. Popular o banco com dados iniciais (seed)

```bash
npm run db:seed
```

Cria:
- Perfis: `CLIENTE`, `PROFISSIONAL`, `ADMIN`
- 10 categorias de serviço (Elétrica, Hidráulica, Marcenaria, etc.)
- 3 usuários de demonstração (senha `123456`):
  - `cliente` — perfil CLIENTE
  - `profissional` — perfil PROFISSIONAL
  - `admin` — perfil ADMIN

---

### 7. Iniciar a API

```bash
npm run dev:api
```

A API sobe em `http://localhost:3333/api`.

---

### 8. Iniciar o app mobile

Em outro terminal:

```bash
npm run dev:mobile
```

Abre o Expo Dev Server. Escaneie o QR code com o **Expo Go** no celular, ou pressione:
- `a` — abre no emulador Android
- `i` — abre no simulador iOS (Mac)
- `w` — abre no navegador

---

## Parar o banco

```bash
npm run db:down
```

Para remover também o volume de dados (apaga tudo do banco):

```bash
docker compose down -v
```

---

## Perfis de usuário

| Role | Acesso |
|---|---|
| `CLIENTE` | Visualiza profissionais, edita próprio perfil |
| `PROFISSIONAL` | Gerencia perfil, bio, especialidades e portfólio |
| `ADMIN` | CRUD de usuários, categorias, perfis, UFs e cidades |

---

## Endpoints da API

### Autenticação
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/auth/cadastro` | — | Cadastro (`CLIENTE` ou `PROFISSIONAL`) |
| POST | `/auth/login` | — | Login, retorna JWT |
| GET | `/auth/me` | JWT | Dados do usuário logado |

### Usuários
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/usuarios/me` | JWT | Meus dados |
| PUT | `/usuarios/me` | JWT | Atualizar nome, email, telefone, senha |
| GET | `/usuarios` | ADMIN | Listar todos |
| POST | `/usuarios` | ADMIN | Criar usuário |
| PUT | `/usuarios/:id` | ADMIN | Editar usuário |
| DELETE | `/usuarios/:id` | ADMIN | Remover usuário |

### Perfil do Cliente
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/perfil-cliente/me` | JWT | Meu perfil de cliente |
| PUT | `/perfil-cliente/me` | JWT | Atualizar preferências |
| GET | `/perfil-cliente/:userId` | — | Perfil público de um cliente |

### Perfil do Profissional
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/perfil-profissional` | — | Listar profissionais |
| GET | `/perfil-profissional/me` | JWT | Meu perfil profissional |
| PUT | `/perfil-profissional/me` | JWT | Atualizar bio, cidade, especialidades |
| GET | `/perfil-profissional/:userId` | — | Perfil público de um profissional |
| POST | `/perfil-profissional/portfolio` | JWT | Adicionar imagem ao portfólio |
| DELETE | `/perfil-profissional/portfolio/:imageId` | JWT | Remover imagem do portfólio |

### Categorias de Serviço
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/categorias` | — | Listar categorias |
| GET | `/categorias/:id` | — | Detalhes de uma categoria |
| POST | `/categorias` | ADMIN | Criar categoria |
| PUT | `/categorias/:id` | ADMIN | Editar categoria |
| DELETE | `/categorias/:id` | ADMIN | Remover categoria |

### Localização
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/ufs` | — | Listar estados |
| GET | `/cidades?ufId=` | — | Listar cidades (filtro por UF) |
| POST/PUT/DELETE | `/ufs`, `/cidades` | ADMIN | Gerenciar localidades |

### Perfis (roles)
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/perfis` | — | Listar perfis |
| POST/PUT/DELETE | `/perfis` | ADMIN | Gerenciar perfis |

---

## Scripts úteis

```bash
# Desenvolvimento
npm run dev:api          # Inicia API com hot-reload
npm run dev:mobile       # Inicia Expo Dev Server

# Build e qualidade
npm run build:api        # Build de produção da API
npm run lint:api         # Lint da API
npm run typecheck:mobile # Typecheck do mobile

# Banco de dados
npm run db:up            # Sobe o PostgreSQL (Docker)
npm run db:migrate       # Roda as migrations
npm run db:seed          # Popula o banco com dados iniciais
npm run db:down          # Para os containers
npm run db:logs          # Exibe logs do PostgreSQL
```

---

## Troubleshooting

**API não conecta no banco**
```bash
npm run db:logs
# Verifique se aparece "ready to accept connections"
```

**Porta 55432 ocupada**

Edite o `docker-compose.yml` e mude `55432` para outra porta, ajuste o `DATABASE_URL` no `.env`.

**Expo não alcança a API no celular físico**

Certifique-se de que o celular e o computador estão na **mesma rede Wi-Fi** e que o `EXPO_PUBLIC_API_URL` usa o IP local da máquina (não `localhost`).

**"Cannot find module" no mobile**

```bash
cd apps/mobile && npx expo start --clear
```
