# Taskly — Planejamento de Entregas

## Status atual

| Módulo | Backend | Mobile | Situação |
|---|---|---|---|
| Auth (cadastro, login, JWT) | ✅ | ✅ | Concluído |
| Perfil do Cliente | ✅ | ✅ | Concluído |
| Perfil do Profissional | ✅ | ✅ | Concluído |
| Categorias de serviço | ✅ | ✅ | Concluído |
| Painel Admin (usuários, categorias, UFs, cidades) | ✅ | ✅ | Concluído |
| Disponibilidade do profissional | ❌ | ❌ | Pendente |
| Busca de profissionais | ❌ | ❌ | Pendente |
| Contratação de serviço | ❌ | ❌ | Pendente |
| Agendamento e confirmação | ❌ | ❌ | Pendente |
| Pagamento (simulado) | ❌ | ❌ | Pendente |

---

## Entrega 3 — O que falta implementar

---

### 1. Disponibilidade do Profissional

**Objetivo:** profissional define os dias e horários em que está disponível para atendimento.

**Backend**

Nova tabela `professional_availability`:
```sql
id          uuid PK
professional_profile_id  uuid FK
dia_semana  int  (0=Dom ... 6=Sab)
hora_inicio time (ex: "08:00")
hora_fim    time (ex: "18:00")
ativo       boolean default true
```

Endpoints novos em `/perfil-profissional/disponibilidade`:
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/perfil-profissional/disponibilidade/me` | JWT | Minha disponibilidade |
| PUT | `/perfil-profissional/disponibilidade` | JWT | Salvar disponibilidade |
| GET | `/perfil-profissional/:userId/disponibilidade` | — | Disponibilidade pública |

**Mobile**

Nova tela `EditAvailabilityScreen`:
- Grade semanal (Dom–Sab) com toggle por dia
- Inputs de hora início/fim por dia ativo
- Botão salvar

---

### 2. Busca de Profissionais (Cliente)

**Objetivo:** cliente pesquisa e filtra profissionais para contratar.

**Backend**

Novo endpoint em `/perfil-profissional` com filtros por query string:
| Parâmetro | Tipo | Descrição |
|---|---|---|
| `categoriaId` | uuid | Filtrar por especialidade |
| `cidadeId` | uuid | Filtrar por cidade |
| `ufId` | uuid | Filtrar por estado |
| `nome` | string | Busca por nome |
| `page` / `limit` | int | Paginação |

**Mobile**

Tela `SearchScreen` (substitui o placeholder da Home do cliente):
- Campo de busca por nome
- Filtro de categoria (chips)
- Filtro de cidade/UF
- Lista de cards de profissionais (nome, especialidades, avaliação, cidade)
- Tap no card → `ProfessionalPublicProfileScreen`

Nova tela `ProfessionalPublicProfileScreen`:
- Header teal com avatar, nome, avaliação
- Bio, especialidades, disponibilidade
- Botão "Contratar" → abre fluxo de contratação

---

### 3. Contratação do Serviço (fluxo principal)

**Objetivo:** cliente solicita um serviço, profissional confirma, serviço é executado e concluído.

#### 3.1 Modelo de dados

Nova tabela `service_requests`:
```sql
id                   uuid PK
client_id            uuid FK → users
professional_id      uuid FK → users
category_id          uuid FK → service_categories
descricao            text
data_agendada        timestamp
status               enum (PENDENTE, CONFIRMADO, EM_ANDAMENTO, CONCLUIDO, CANCELADO)
valor_estimado       numeric(10,2) nullable
endereco             text nullable
observacoes          text nullable
created_at / updated_at
```

#### 3.2 Fluxo de status

```
Cliente cria ──► PENDENTE
                    │
        Profissional confirma ──► CONFIRMADO
                    │
        Profissional inicia ──► EM_ANDAMENTO
                    │
        Profissional conclui ──► CONCLUIDO
                    │
        Qualquer parte cancela ──► CANCELADO
```

#### 3.3 Endpoints

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/contratacoes` | JWT (CLIENTE) | Criar solicitação |
| GET | `/contratacoes` | JWT | Listar as minhas (filtra por role) |
| GET | `/contratacoes/:id` | JWT | Detalhe |
| PATCH | `/contratacoes/:id/confirmar` | JWT (PROFISSIONAL) | Confirmar |
| PATCH | `/contratacoes/:id/iniciar` | JWT (PROFISSIONAL) | Iniciar execução |
| PATCH | `/contratacoes/:id/concluir` | JWT (PROFISSIONAL) | Concluir |
| PATCH | `/contratacoes/:id/cancelar` | JWT | Cancelar (ambos) |

#### 3.4 Telas Mobile

**Cliente:**
- `NewRequestScreen` — formulário: categoria, descrição, data desejada, endereço
- `MyRequestsScreen` — lista de contratações com badge de status
- `RequestDetailScreen` — detalhe + botão cancelar

**Profissional:**
- `IncomingRequestsScreen` — lista de solicitações recebidas (PENDENTE em destaque)
- `RequestDetailScreen` (compartilhada) — botões: Confirmar / Recusar / Iniciar / Concluir

---

### 4. Pagamento (simulado)

**Objetivo:** registrar o pagamento ao concluir o serviço, sem integração com gateway real.

**Backend**

Nova tabela `payments`:
```sql
id                uuid PK
service_request_id  uuid FK
valor             numeric(10,2)
metodo            enum (PIX, CARTAO, DINHEIRO)
status            enum (PENDENTE, PAGO, ESTORNADO)
pago_em           timestamp nullable
```

Endpoint:
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/contratacoes/:id/pagamento` | JWT (CLIENTE) | Registrar pagamento |
| GET | `/contratacoes/:id/pagamento` | JWT | Consultar pagamento |

**Mobile**

Tela `PaymentScreen`:
- Valor do serviço
- Seleção do método (Pix, Cartão, Dinheiro)
- Botão "Confirmar pagamento"
- Tela de sucesso com resumo

---

## Ordem de implementação sugerida

```
Semana 1
├── Backend: tabela + endpoints de disponibilidade
├── Mobile: EditAvailabilityScreen
└── Backend: filtros de busca em /perfil-profissional

Semana 2
├── Mobile: SearchScreen + ProfessionalPublicProfileScreen
├── Backend: tabela service_requests + todos os endpoints
└── Mobile: NewRequestScreen

Semana 3
├── Mobile: MyRequestsScreen + IncomingRequestsScreen
├── Mobile: RequestDetailScreen com ações de status
├── Backend: tabela payments + endpoints
└── Mobile: PaymentScreen

Semana 4
├── Testes de ponta a ponta (fluxo completo)
├── Ajustes de UX e tratamento de erros
└── Documentação final
```

---

## Resumo de itens a criar

**Banco de dados:** 3 novas tabelas (`professional_availability`, `service_requests`, `payments`)

**API — novos módulos:** `availability`, `service-requests`, `payments`

**Mobile — novas telas:**
1. `EditAvailabilityScreen` — disponibilidade do profissional
2. `SearchScreen` — busca de profissionais (cliente)
3. `ProfessionalPublicProfileScreen` — perfil público com botão contratar
4. `NewRequestScreen` — formulário de nova contratação
5. `MyRequestsScreen` — lista de contratações do cliente
6. `IncomingRequestsScreen` — solicitações recebidas pelo profissional
7. `RequestDetailScreen` — detalhe + ações de status (compartilhada)
8. `PaymentScreen` — confirmar pagamento
