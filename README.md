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
│   │       ├── common/             # Guards, decorators, RBAC
│   │       ├── config/             # Validação de env (Zod)
│   │       ├── db/                 # Schema Drizzle, migrations, seed
│   │       └── modules/
│   │           ├── auth/                   # Login, cadastro, JWT
│   │           ├── users/                  # Usuários
│   │           ├── profiles/               # CRUD de perfis (ADMIN)
│   │           ├── client-profiles/        # Perfil do cliente
│   │           ├── professional-profiles/  # Perfil + portfólio
│   │           ├── availability/           # Disponibilidade do profissional
│   │           ├── service-categories/     # Categorias de serviço
│   │           ├── service-requests/       # Contratações
│   │           ├── payments/               # Pagamentos
│   │           ├── ufs/                    # Estados brasileiros
│   │           └── cities/                 # Cidades
│   └── mobile/                     # App React Native
│       └── src/
│           ├── components/         # AppButton, AppInput, etc.
│           ├── hooks/              # useAuth
│           ├── navigation/         # AppNavigator (rotas por role)
│           ├── screens/            # Todas as telas
│           ├── services/           # Chamadas HTTP à API
│           ├── theme/              # Cores e espaçamentos
│           └── types/              # Tipos TypeScript
├── docker/
│   └── init.sql                    # Schema completo (executado no primeiro up)
├── scripts/
│   └── dev-mobile.js               # Script de ambiente do mobile
├── docker-compose.yml
└── package.json
```

---

## Como rodar

### Pré-requisitos

- [Node.js](https://nodejs.org) 20+
- [Docker](https://www.docker.com) com Docker Compose
- [Expo Go](https://expo.dev/client) no celular (ou emulador Android)

---

### 1. Instalar dependências

```bash
npm install
```

---

### 2. Configurar variáveis de ambiente da API

Crie `apps/api/.env`:

```bash
DATABASE_URL=postgresql://taskly:taskly@localhost:55432/taskly
JWT_SECRET=chave-secreta-minimo-8-chars
JWT_EXPIRES_IN=7d

# Opcionais (têm default)
PORT=3333
API_PREFIX=api
CORS_ORIGIN=*
NODE_ENV=development
```

---

### 3. Configurar o banco e popular dados iniciais

Na primeira vez, um único comando faz tudo (sobe o Docker, roda migrations e seed):

```bash
npm run db:setup
```

> O banco já é criado com todas as tabelas automaticamente via `docker/init.sql` na primeira vez que o container sobe.

---

### 4. Iniciar o projeto

Escolha o comando de acordo com onde vai testar:

```bash
npm run dev:web       # Navegador — mais rápido, sem precisar de celular
npm run dev:emulator  # Emulador Android Studio
npm run dev:local     # Celular físico na mesma rede Wi-Fi (IP detectado automaticamente)
npm run dev:tunnel    # Celular em qualquer rede via túnel Expo
```

Todos os comandos iniciam a **API + app mobile** juntos. O QR code aparece no terminal — escaneie com o **Expo Go**.

---

## Contas de demonstração

Senha de todas: **`123456`**

| Username | Perfil |
|---|---|
| `cliente` | CLIENTE |
| `profissional` | PROFISSIONAL |
| `admin` | ADMIN |

---

## Banco de dados

| Comando | O que faz |
|---|---|
| `npm run db:setup` | Sobe o banco + migrations + seed (primeira vez) |
| `npm run db:reset` | Apaga tudo e recria do zero |
| `npm run db:up` | Sobe o container (sem rodar migrations) |
| `npm run db:down` | Para o container |
| `npm run db:logs` | Exibe logs do PostgreSQL |
| `npm run db:migrate` | Roda migrations pendentes |
| `npm run db:seed` | Popula dados iniciais |

---

## Perfis de usuário

| Role | Acesso |
|---|---|
| `CLIENTE` | Busca profissionais, cria e acompanha contratações |
| `PROFISSIONAL` | Gerencia perfil, disponibilidade, portfólio e solicitações recebidas |
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
| PUT | `/usuarios/me` | JWT | Atualizar nome, e-mail, telefone, senha |
| GET | `/usuarios` | ADMIN | Listar todos |
| POST | `/usuarios` | ADMIN | Criar usuário |
| PUT | `/usuarios/:id` | ADMIN | Editar usuário |
| DELETE | `/usuarios/:id` | ADMIN | Remover usuário |

### Perfil do Cliente
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/perfil-cliente/me` | JWT | Meu perfil |
| PUT | `/perfil-cliente/me` | JWT | Atualizar dados |
| GET | `/perfil-cliente/:userId` | — | Perfil público |

### Perfil do Profissional
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/perfil-profissional` | — | Listar profissionais |
| GET | `/perfil-profissional/me` | JWT | Meu perfil |
| PUT | `/perfil-profissional/me` | JWT | Atualizar bio e especialidades |
| GET | `/perfil-profissional/:userId` | — | Perfil público |
| POST | `/perfil-profissional/portfolio` | JWT | Adicionar imagem |
| DELETE | `/perfil-profissional/portfolio/:imageId` | JWT | Remover imagem |

### Disponibilidade
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/disponibilidade/me` | JWT | Minha disponibilidade |
| PUT | `/disponibilidade/me` | JWT | Salvar disponibilidade |
| GET | `/disponibilidade/:userId` | — | Disponibilidade pública |

### Contratações
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/contratacoes` | JWT (CLIENTE) | Criar solicitação |
| GET | `/contratacoes` | JWT | Listar as minhas |
| GET | `/contratacoes/:id` | JWT | Detalhe |
| PATCH | `/contratacoes/:id/confirmar` | JWT (PROFISSIONAL) | Confirmar |
| PATCH | `/contratacoes/:id/iniciar` | JWT (PROFISSIONAL) | Iniciar execução |
| PATCH | `/contratacoes/:id/concluir` | JWT (PROFISSIONAL) | Concluir |
| PATCH | `/contratacoes/:id/cancelar` | JWT | Cancelar |

### Pagamentos
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/contratacoes/:id/pagamento` | JWT (CLIENTE) | Registrar pagamento |
| GET | `/contratacoes/:id/pagamento` | JWT | Consultar pagamento |

### Categorias de Serviço
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/categorias` | — | Listar |
| POST/PUT/DELETE | `/categorias` | ADMIN | Gerenciar |

### Localização
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/ufs` | — | Listar estados |
| GET | `/cidades?ufId=` | — | Listar cidades |
| POST/PUT/DELETE | `/ufs`, `/cidades` | ADMIN | Gerenciar |

---

## Scripts úteis

```bash
# Desenvolvimento
npm run dev:web          # API + mobile no navegador
npm run dev:emulator     # API + mobile no emulador Android
npm run dev:local        # API + mobile no celular físico (IP auto-detectado)
npm run dev:tunnel       # API + mobile via túnel Expo
npm run dev:api          # Somente a API

# Build e qualidade
npm run build:api        # Build de produção da API
npm run lint:api         # Lint da API
npm run typecheck:mobile # Typecheck do mobile

# Banco de dados
npm run db:setup         # Primeira vez: sobe banco + migrate + seed
npm run db:reset         # Apaga tudo e recria do zero
npm run db:up            # Sobe o PostgreSQL
npm run db:down          # Para os containers
npm run db:migrate       # Roda migrations pendentes
npm run db:seed          # Popula dados iniciais
npm run db:logs          # Exibe logs do PostgreSQL
```

---

## Troubleshooting

**API não conecta no banco**
```bash
npm run db:logs
# Verifique: "database system is ready to accept connections"
```

**Porta 55432 ocupada**

Edite o `docker-compose.yml`, mude `55432` para outra porta e ajuste o `DATABASE_URL` no `.env`.

**Expo não alcança a API no celular físico**

Use `npm run dev:local` — o IP é detectado automaticamente. Se falhar, defina manualmente:
```bash
TASKLY_LOCAL_IP=192.168.1.50 npm run dev:local
```

**Cache do Metro corrompido**
```bash
cd apps/mobile && npx expo start --clear
```
