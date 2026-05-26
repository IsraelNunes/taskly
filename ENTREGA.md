# Taskly — Entrega de Trabalho Acadêmico

**Repositório:** https://github.com/IsraelNunes/taskly

---

## Descrição do Projeto

O **Taskly** é um marketplace de serviços que conecta **clientes** a **profissionais autônomos** (eletricistas, encanadores, marceneiros, pintores, entre outros). O sistema é composto por uma API REST e um aplicativo mobile multiplataforma (Android, iOS e Web).

---

## Funcionalidades Implementadas

### Autenticação
- Cadastro com seleção de perfil (**Cliente** ou **Profissional**)
- Login com geração de token JWT
- Sessão persistida localmente no dispositivo

### Perfil do Cliente
- Visualização de dados pessoais (nome, username, e-mail, telefone, cidade)
- Edição de dados e senha

### Perfil do Profissional
- Visualização de bio, avaliação média, especialidades e portfólio
- Edição de dados pessoais, bio e categorias de serviço
- Gerenciamento de imagens de portfólio

### Categorias de Serviço
- 10 categorias pré-cadastradas: Elétrica, Hidráulica, Marcenaria, Pintura, Limpeza, Jardinagem, Reformas, Montagem de Móveis, Ar-condicionado e Dedetização

### Painel Administrativo (perfil ADMIN)
- CRUD completo de usuários
- CRUD de categorias de serviço
- CRUD de perfis de acesso (RBAC)
- CRUD de estados (UFs) e cidades

### Controle de Acesso (RBAC)
- Três perfis: `CLIENTE`, `PROFISSIONAL` e `ADMIN`
- Rotas protegidas por JWT e guards de role
- Navegação do app adaptada por perfil

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| API | NestJS · Drizzle ORM · PostgreSQL · JWT / Passport |
| Mobile | React Native · Expo SDK 54 · React Navigation |
| Infra | Docker Compose |
| Linguagem | TypeScript (frontend e backend) |

---

## Arquitetura

O projeto segue estrutura de **monorepo** com dois pacotes independentes:

```
Taskly/
├── apps/
│   ├── api/          # Backend NestJS (REST API)
│   └── mobile/       # App React Native / Expo
└── docker-compose.yml
```

A API adota arquitetura modular (NestJS Modules), separando responsabilidades em `auth`, `users`, `profiles`, `client-profiles`, `professional-profiles`, `service-categories`, `ufs` e `cities`.

O banco de dados é gerenciado via **Drizzle ORM** com migrations versionadas.

---

## Como Executar

### Pré-requisitos
- Node.js 20+
- Docker com Docker Compose
- Expo Go (celular) ou emulador

### Passos

```bash
# 1. Instalar dependências
npm install

# 2. Criar apps/api/.env com:
#    DATABASE_URL=postgresql://taskly:taskly@localhost:55432/taskly
#    JWT_SECRET=chave-secreta
#    JWT_EXPIRES_IN=7d

# 3. Criar apps/mobile/.env com:
#    EXPO_PUBLIC_API_URL=http://10.0.2.2:3333/api  # emulador Android
#    # ou o IP local da máquina para celular físico

# 4. Subir o banco
npm run db:up

# 5. Rodar migrations e seed
npm run db:migrate
npm run db:seed

# 6. Iniciar a API
npm run dev:api

# 7. Iniciar o app
npm run dev:mobile
```

**Usuários de demonstração** (senha `123456`):

| Username | Perfil |
|---|---|
| `cliente` | CLIENTE |
| `profissional` | PROFISSIONAL |
| `admin` | ADMIN |

---
