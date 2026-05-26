# Taskly — Documentação de Apresentação

**Repositório:** https://github.com/IsraelNunes/taskly

---

## 1. Introdução

O **Taskly** é um marketplace de serviços desenvolvido como projeto acadêmico. A proposta é conectar **clientes** que precisam de serviços domésticos e profissionais a **prestadores de serviço** autônomos verificados, como eletricistas, encanadores, marceneiros e pintores.

O sistema resolve um problema real: a dificuldade de encontrar profissionais confiáveis de forma rápida, centralizada e organizada. A plataforma permite que profissionais divulguem seu perfil, especialidades e portfólio, enquanto clientes podem localizar e contratar esses profissionais.

---

## 2. Objetivo

Desenvolver um sistema full-stack funcional composto por:

- **API REST** com autenticação, controle de acesso por perfil (RBAC) e gerenciamento de dados
- **Aplicativo mobile multiplataforma** (Android, iOS e Web) com fluxo completo de cadastro, login e gerenciamento de perfil
- **Banco de dados relacional** modelado para o domínio de marketplace de serviços

---

## 3. Tecnologias Utilizadas

| Camada | Tecnologia | Justificativa |
|---|---|---|
| API | NestJS 11 | Framework modular para Node.js com suporte nativo a TypeScript, injeção de dependências e Guards |
| ORM | Drizzle ORM | ORM type-safe com migrations SQL versionadas e schema declarativo em TypeScript |
| Banco de dados | PostgreSQL 16 | Banco relacional robusto, suporte a UUID, constraints e foreign keys |
| Autenticação | JWT + Passport.js | Padrão de mercado para APIs stateless com tokens assinados |
| Mobile | React Native + Expo SDK 54 | Desenvolvimento multiplataforma com um único código-base (Android, iOS, Web) |
| Navegação | React Navigation 7 | Navegação por abas e pilhas com tipagem TypeScript |
| Infra | Docker Compose | Ambiente de banco de dados reproduzível e isolado |
| Linguagem | TypeScript | Tipagem estática em todo o projeto, frontend e backend |

---

## 4. Arquitetura do Sistema

O projeto adota estrutura de **monorepo**, com dois pacotes independentes compartilhando o mesmo repositório:

```
Taskly/
├── apps/
│   ├── api/                  # Backend NestJS
│   │   ├── drizzle/          # Migrations SQL versionadas
│   │   └── src/
│   │       ├── common/       # Guards, decorators, RBAC
│   │       ├── config/       # Validação de variáveis de ambiente (Zod)
│   │       ├── db/           # Schema, migrations, seed
│   │       └── modules/      # Módulos de negócio
│   └── mobile/               # App React Native / Expo
│       └── src/
│           ├── components/   # Componentes reutilizáveis (AppButton, AppInput)
│           ├── hooks/        # useAuth — contexto de autenticação global
│           ├── navigation/   # AppNavigator com rotas por perfil
│           ├── screens/      # Telas do aplicativo
│           ├── services/     # Camada de comunicação com a API
│           ├── theme/        # Design system (cores, espaçamentos)
│           └── types/        # Tipos TypeScript compartilhados
├── docker-compose.yml
└── package.json              # Workspaces npm
```

### Diagrama de módulos da API

```
auth ──────────────── users ─────────────── profiles
                        │
              ┌─────────┼──────────┐
              │                    │
      client-profiles   professional-profiles
                                   │
                         service-categories
                                   │
                          ufs ── cities
```

---

## 5. Modelagem do Banco de Dados

O banco possui **10 tabelas** com relacionamentos via foreign keys:

| Tabela | Descrição |
|---|---|
| `profiles` | Perfis de acesso: CLIENTE, PROFISSIONAL, ADMIN |
| `users` | Usuários do sistema com referência ao perfil e cidade |
| `client_profiles` | Dados estendidos do cliente (preferências) |
| `professional_profiles` | Bio, avaliação média, verificação do profissional |
| `service_categories` | Categorias de serviço com nome, slug e ícone |
| `professional_categories` | Relação N:N entre profissionais e categorias |
| `portfolio_images` | Imagens do portfólio do profissional |
| `ufs` | Estados brasileiros |
| `cities` | Cidades vinculadas ao estado |

---

## 6. Funcionalidades Implementadas

### 6.1 Autenticação e Controle de Acesso

- Cadastro com seleção de perfil (Cliente ou Profissional)
- Login com geração de **token JWT** (expiração configurável)
- Sessão persistida no dispositivo via AsyncStorage
- **RBAC** (Role-Based Access Control): rotas protegidas por Guards que verificam o perfil do usuário
- Criação automática do perfil estendido (cliente ou profissional) no momento do cadastro

### 6.2 Perfil do Cliente

- Visualização de dados pessoais: nome, username, e-mail, telefone e cidade
- Edição de dados e troca de senha

### 6.3 Perfil do Profissional

- Visualização de bio, avaliação média com estrelas, cidade e especialidades
- Edição de dados pessoais e bio
- Seleção múltipla de categorias de especialidade
- Gerenciamento de portfólio de imagens (adicionar e remover)

### 6.4 Painel Administrativo

Acessível apenas ao perfil **ADMIN**, com CRUD completo de:

- Usuários (listar, criar, editar, remover)
- Categorias de serviço
- Perfis de acesso
- Estados (UFs) e Cidades

### 6.5 Aplicativo Mobile

| Tela | Descrição |
|---|---|
| Splash | Carregamento inicial com identidade visual |
| Landing | Apresentação da plataforma para usuários não autenticados |
| Login | Autenticação com username e senha |
| Cadastro | Registro com seleção de perfil (Cliente ou Profissional) |
| Home | Painel inicial com categorias de serviço |
| Perfil | Visualização e edição do perfil por tipo de usuário |
| Admin | Painel de gerenciamento do sistema |

A navegação é **adaptada dinamicamente** ao perfil do usuário autenticado: clientes e profissionais veem abas distintas; administradores têm acesso às ferramentas de gestão.

---

## 7. Endpoints da API

### Autenticação
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/auth/cadastro` | — | Cadastro de novo usuário |
| POST | `/auth/login` | — | Login, retorna JWT |
| GET | `/auth/me` | JWT | Dados do usuário autenticado |

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
| GET | `/perfil-cliente/me` | JWT | Meu perfil de cliente |
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
| DELETE | `/perfil-profissional/portfolio/:id` | JWT | Remover imagem |

### Categorias, UFs, Cidades e Perfis
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/categorias` | — | Listar categorias |
| POST/PUT/DELETE | `/categorias` | ADMIN | Gerenciar categorias |
| GET | `/ufs` | — | Listar estados |
| GET | `/cidades?ufId=` | — | Listar cidades |
| POST/PUT/DELETE | `/ufs`, `/cidades`, `/perfis` | ADMIN | Gerenciar localidades e perfis |

---

## 8. Fluxo de Uso

```
Usuário abre o app
       │
       ├── Não autenticado ──► Landing ──► Login / Cadastro
       │                                        │
       └── Autenticado ◄───────────────────────┘
               │
               ├── CLIENTE ──────► Home + Perfil + Editar Perfil
               ├── PROFISSIONAL ──► Home + Perfil + Editar Perfil + Portfólio
               └── ADMIN ─────────► Perfil + Usuários + Categorias
```

---

## 9. Design e Interface

O design foi baseado em protótipo no **Figma** com identidade visual própria:

- **Cor primária:** laranja `#FF6B3D` — ações principais (botões, CTAs)
- **Cor secundária:** verde-azulado `#0D7B84` — headers, identidade da marca
- **Fundo:** `#F4F7F8` — neutro para leitura confortável
- **Padrão visual:** gradiente teal nos headers de autenticação e perfil, cards com bordas suaves, chips para categorias

---

## 10. Dados de Demonstração

O banco é populado via seed com dados prontos para teste:

- 10 categorias de serviço
- 3 perfis de acesso (CLIENTE, PROFISSIONAL, ADMIN)
- 3 usuários de demonstração (senha `123456`):

| Username | Perfil |
|---|---|
| `cliente` | CLIENTE |
| `profissional` | PROFISSIONAL |
| `admin` | ADMIN |

---

## 11. Como Executar o Projeto

```bash
# 1. Clonar o repositório
git clone https://github.com/IsraelNunes/taskly.git
cd taskly

# 2. Instalar dependências
npm install

# 3. Configurar a API (apps/api/.env)
DATABASE_URL=postgresql://taskly:taskly@localhost:55432/taskly
JWT_SECRET=chave-secreta
JWT_EXPIRES_IN=7d

# 4. Configurar o mobile (apps/mobile/.env)
EXPO_PUBLIC_API_URL=http://10.0.2.2:3333/api  # emulador Android
# ou IP local da máquina para celular físico

# 5. Subir o banco
npm run db:up

# 6. Migrations e seed
npm run db:migrate
npm run db:seed

# 7. Iniciar a API
npm run dev:api

# 8. Iniciar o app (outro terminal)
npm run dev:mobile
```

---

## 12. Conclusão

O Taskly demonstra a implementação de um sistema web/mobile completo com:

- Arquitetura modular e separação clara de responsabilidades
- Autenticação stateless com JWT e controle de acesso por perfil
- Modelagem relacional adequada ao domínio de marketplace
- Interface mobile funcional e multiplataforma
- Ambiente de desenvolvimento reproduzível com Docker

O projeto está estruturado para evolução nas próximas fases, com a infraestrutura necessária para implementar busca de profissionais, sistema de avaliações, chat e pagamentos.

---

**Aluno:** Israel Nunes
**Repositório:** https://github.com/IsraelNunes/taskly
