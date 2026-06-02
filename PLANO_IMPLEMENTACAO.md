# Plano de Implementação — Entrega 3

Baseado nos padrões existentes do projeto (Drizzle ORM, NestJS modules, serviços no mobile).
Cada passo é executável de forma independente e incremental.

---

## Etapa 1 — Banco de dados: novas tabelas

### 1.1 Atualizar `apps/api/src/db/schema.ts`

Adicionar ao final do arquivo, antes das Relations:

```typescript
// Disponibilidade do profissional
export const professionalAvailability = pgTable('professional_availability', {
  id: uuid('id').defaultRandom().primaryKey(),
  professionalProfileId: uuid('professional_profile_id')
    .notNull()
    .references(() => professionalProfiles.id, { onDelete: 'cascade' }),
  diaSemana: integer('dia_semana').notNull(), // 0=Dom, 1=Seg... 6=Sab
  horaInicio: varchar('hora_inicio', { length: 5 }).notNull(), // "08:00"
  horaFim: varchar('hora_fim', { length: 5 }).notNull(),       // "18:00"
  ativo: boolean('ativo').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Contratações
export const serviceRequests = pgTable('service_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  professionalId: uuid('professional_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  categoryId: uuid('category_id')
    .references(() => serviceCategories.id, { onDelete: 'set null' }),
  descricao: text('descricao').notNull(),
  endereco: text('endereco'),
  dataAgendada: timestamp('data_agendada', { withTimezone: true }),
  valorEstimado: numeric('valor_estimado', { precision: 10, scale: 2 }),
  status: varchar('status', { length: 20 }).default('PENDENTE').notNull(),
  // PENDENTE | CONFIRMADO | EM_ANDAMENTO | CONCLUIDO | CANCELADO
  motivoCancelamento: text('motivo_cancelamento'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Pagamentos
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  serviceRequestId: uuid('service_request_id')
    .notNull()
    .unique()
    .references(() => serviceRequests.id, { onDelete: 'cascade' }),
  valor: numeric('valor', { precision: 10, scale: 2 }).notNull(),
  metodo: varchar('metodo', { length: 20 }).notNull(), // PIX | CARTAO | DINHEIRO
  status: varchar('status', { length: 20 }).default('PENDENTE').notNull(), // PENDENTE | PAGO
  pagoEm: timestamp('pago_em', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
```

Adicionar Relations para as novas tabelas:

```typescript
export const serviceRequestsRelations = relations(serviceRequests, ({ one }) => ({
  client: one(users, { fields: [serviceRequests.clientId], references: [users.id] }),
  professional: one(users, { fields: [serviceRequests.professionalId], references: [users.id] }),
  category: one(serviceCategories, { fields: [serviceRequests.categoryId], references: [serviceCategories.id] }),
  payment: one(payments, { fields: [serviceRequests.id], references: [payments.serviceRequestId] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  serviceRequest: one(serviceRequests, { fields: [payments.serviceRequestId], references: [serviceRequests.id] }),
}));

export const professionalAvailabilityRelations = relations(professionalAvailability, ({ one }) => ({
  professional: one(professionalProfiles, {
    fields: [professionalAvailability.professionalProfileId],
    references: [professionalProfiles.id],
  }),
}));
```

### 1.2 Criar migration `apps/api/drizzle/0003_entrega3.sql`

```sql
-- Disponibilidade
CREATE TABLE IF NOT EXISTS "professional_availability" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "professional_profile_id" uuid NOT NULL REFERENCES "professional_profiles"("id") ON DELETE CASCADE,
  "dia_semana" integer NOT NULL,
  "hora_inicio" varchar(5) NOT NULL,
  "hora_fim" varchar(5) NOT NULL,
  "ativo" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Contratações
CREATE TABLE IF NOT EXISTS "service_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "client_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
  "professional_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
  "category_id" uuid REFERENCES "service_categories"("id") ON DELETE SET NULL,
  "descricao" text NOT NULL,
  "endereco" text,
  "data_agendada" timestamp with time zone,
  "valor_estimado" numeric(10,2),
  "status" varchar(20) DEFAULT 'PENDENTE' NOT NULL,
  "motivo_cancelamento" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Pagamentos
CREATE TABLE IF NOT EXISTS "payments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "service_request_id" uuid NOT NULL UNIQUE REFERENCES "service_requests"("id") ON DELETE CASCADE,
  "valor" numeric(10,2) NOT NULL,
  "metodo" varchar(20) NOT NULL,
  "status" varchar(20) DEFAULT 'PENDENTE' NOT NULL,
  "pago_em" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
```

Registrar no `apps/api/drizzle/meta/_journal.json`:

```json
{
  "idx": 3,
  "version": "7",
  "when": 1748900000000,
  "tag": "0003_entrega3",
  "breakpoints": true
}
```

Aplicar:
```bash
docker exec -i taskly-postgres psql -U taskly -d taskly < apps/api/drizzle/0003_entrega3.sql
```

---

## Etapa 2 — API: Módulo de Disponibilidade

Caminho: `apps/api/src/modules/availability/`

### 2.1 DTO — `dto/upsert-availability.dto.ts`

```typescript
import { IsArray, IsBoolean, IsInt, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AvailabilitySlotDto {
  @IsInt() @Min(0) @Max(6)
  diaSemana!: number;

  @IsString()
  horaInicio!: string; // "08:00"

  @IsString()
  horaFim!: string;    // "18:00"

  @IsBoolean()
  ativo!: boolean;
}

export class UpsertAvailabilityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  slots!: AvailabilitySlotDto[];
}
```

### 2.2 Service — `availability.service.ts`

```typescript
@Injectable()
export class AvailabilityService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  async findByProfessionalUserId(userId: string) {
    const [profile] = await this.db
      .select({ id: professionalProfiles.id })
      .from(professionalProfiles)
      .where(eq(professionalProfiles.userId, userId))
      .limit(1);

    if (!profile) return [];

    return this.db
      .select()
      .from(professionalAvailability)
      .where(eq(professionalAvailability.professionalProfileId, profile.id))
      .orderBy(professionalAvailability.diaSemana);
  }

  async upsert(userId: string, dto: UpsertAvailabilityDto) {
    const [profile] = await this.db
      .select({ id: professionalProfiles.id })
      .from(professionalProfiles)
      .where(eq(professionalProfiles.userId, userId))
      .limit(1);

    if (!profile) throw new NotFoundException('Perfil profissional não encontrado.');

    // Deleta tudo e recria (upsert completo)
    await this.db
      .delete(professionalAvailability)
      .where(eq(professionalAvailability.professionalProfileId, profile.id));

    if (dto.slots.length === 0) return [];

    const inserted = await this.db
      .insert(professionalAvailability)
      .values(dto.slots.map(s => ({ ...s, professionalProfileId: profile.id })))
      .returning();

    return inserted;
  }
}
```

### 2.3 Controller — `availability.controller.ts`

```typescript
@Controller('disponibilidade')
export class AvailabilityController {
  constructor(private readonly service: AvailabilityService) {}

  // Minha disponibilidade (profissional logado)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: JwtPayload) {
    return this.service.findByProfessionalUserId(user.sub);
  }

  // Salvar disponibilidade
  @UseGuards(JwtAuthGuard)
  @Put('me')
  upsert(@CurrentUser() user: JwtPayload, @Body() dto: UpsertAvailabilityDto) {
    return this.service.upsert(user.sub, dto);
  }

  // Disponibilidade pública de um profissional
  @Get(':userId')
  getPublic(@Param('userId') userId: string) {
    return this.service.findByProfessionalUserId(userId);
  }
}
```

---

## Etapa 3 — API: Módulo de Contratações

Caminho: `apps/api/src/modules/service-requests/`

### 3.1 DTOs

**`dto/create-service-request.dto.ts`**
```typescript
export class CreateServiceRequestDto {
  @IsUUID() professionalId!: string;
  @IsUUID() @IsOptional() categoryId?: string;
  @IsString() @IsNotEmpty() descricao!: string;
  @IsString() @IsOptional() endereco?: string;
  @IsDateString() @IsOptional() dataAgendada?: string;
  @IsNumber() @IsOptional() valorEstimado?: number;
}
```

**`dto/update-status.dto.ts`**
```typescript
export class UpdateStatusDto {
  @IsString() @IsOptional() motivoCancelamento?: string;
}
```

### 3.2 Service — `service-requests.service.ts`

Métodos principais:
```typescript
// Criar solicitação (cliente)
async create(clientId: string, dto: CreateServiceRequestDto): Promise<ServiceRequest>

// Listar — cliente vê as suas, profissional vê as recebidas
async findAll(userId: string, perfil: string): Promise<ServiceRequest[]>

// Detalhe
async findOne(id: string, userId: string): Promise<ServiceRequest>

// Mudar status — valida quem pode fazer cada transição
async updateStatus(
  id: string,
  userId: string,
  perfil: string,
  novoStatus: string,
  dto?: UpdateStatusDto
): Promise<ServiceRequest>
```

Regras de transição de status (validar no service):
```
PENDENTE → CONFIRMADO    : somente PROFISSIONAL
PENDENTE → CANCELADO     : CLIENTE ou PROFISSIONAL
CONFIRMADO → EM_ANDAMENTO: somente PROFISSIONAL
CONFIRMADO → CANCELADO   : CLIENTE ou PROFISSIONAL
EM_ANDAMENTO → CONCLUIDO : somente PROFISSIONAL
```

### 3.3 Controller — `service-requests.controller.ts`

```typescript
@Controller('contratacoes')
@UseGuards(JwtAuthGuard)
export class ServiceRequestsController {
  @Post()
  // @Roles('CLIENTE') — só cliente cria
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateServiceRequestDto)

  @Get()
  findAll(@CurrentUser() user: JwtPayload)

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string)

  @Patch(':id/confirmar')
  confirmar(@CurrentUser() user: JwtPayload, @Param('id') id: string)

  @Patch(':id/iniciar')
  iniciar(@CurrentUser() user: JwtPayload, @Param('id') id: string)

  @Patch(':id/concluir')
  concluir(@CurrentUser() user: JwtPayload, @Param('id') id: string)

  @Patch(':id/cancelar')
  cancelar(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateStatusDto)
}
```

---

## Etapa 4 — API: Módulo de Pagamentos

Caminho: `apps/api/src/modules/payments/`

### 4.1 DTO — `dto/create-payment.dto.ts`

```typescript
export class CreatePaymentDto {
  @IsNumber() @Min(0)
  valor!: number;

  @IsEnum(['PIX', 'CARTAO', 'DINHEIRO'])
  metodo!: string;
}
```

### 4.2 Service — `payments.service.ts`

```typescript
// Registrar pagamento — só para contratações CONCLUIDAS
async create(serviceRequestId: string, clientId: string, dto: CreatePaymentDto): Promise<Payment>

// Buscar pagamento de uma contratação
async findByServiceRequest(serviceRequestId: string): Promise<Payment | null>
```

### 4.3 Controller — `payments.controller.ts`

```typescript
@Controller('contratacoes/:requestId/pagamento')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  @Post()
  create(@CurrentUser() user, @Param('requestId') requestId, @Body() dto: CreatePaymentDto)

  @Get()
  findOne(@CurrentUser() user, @Param('requestId') requestId)
}
```

---

## Etapa 5 — Mobile: tipos e serviços

### 5.1 Novos tipos em `apps/mobile/src/types/`

**`service-requests.ts`**
```typescript
export type ServiceRequestStatus =
  | 'PENDENTE'
  | 'CONFIRMADO'
  | 'EM_ANDAMENTO'
  | 'CONCLUIDO'
  | 'CANCELADO';

export type ServiceRequest = {
  id: string;
  clientId: string;
  professionalId: string;
  categoryId: string | null;
  descricao: string;
  endereco: string | null;
  dataAgendada: string | null;
  valorEstimado: string | null;
  status: ServiceRequestStatus;
  motivoCancelamento: string | null;
  createdAt: string;
  // joins
  clienteNome?: string;
  profissionalNome?: string;
  categoriaNome?: string;
  payment?: Payment | null;
};

export type Payment = {
  id: string;
  valor: string;
  metodo: 'PIX' | 'CARTAO' | 'DINHEIRO';
  status: 'PENDENTE' | 'PAGO';
  pagoEm: string | null;
};

export type AvailabilitySlot = {
  id: string;
  diaSemana: number; // 0=Dom...6=Sab
  horaInicio: string;
  horaFim: string;
  ativo: boolean;
};

export type CreateServiceRequestPayload = {
  professionalId: string;
  categoryId?: string;
  descricao: string;
  endereco?: string;
  dataAgendada?: string;
  valorEstimado?: number;
};
```

### 5.2 Novos serviços em `apps/mobile/src/services/`

**`service-request.service.ts`**
```typescript
export const serviceRequestService = {
  create: (payload: CreateServiceRequestPayload, token: string) =>
    apiRequest<ServiceRequest>('/contratacoes', { method: 'POST', body: payload, token }),

  list: (token: string) =>
    apiRequest<ServiceRequest[]>('/contratacoes', { token }),

  getOne: (id: string, token: string) =>
    apiRequest<ServiceRequest>(`/contratacoes/${id}`, { token }),

  confirmar: (id: string, token: string) =>
    apiRequest<ServiceRequest>(`/contratacoes/${id}/confirmar`, { method: 'PATCH', token }),

  iniciar: (id: string, token: string) =>
    apiRequest<ServiceRequest>(`/contratacoes/${id}/iniciar`, { method: 'PATCH', token }),

  concluir: (id: string, token: string) =>
    apiRequest<ServiceRequest>(`/contratacoes/${id}/concluir`, { method: 'PATCH', token }),

  cancelar: (id: string, motivo: string | undefined, token: string) =>
    apiRequest<ServiceRequest>(`/contratacoes/${id}/cancelar`, {
      method: 'PATCH', body: { motivoCancelamento: motivo }, token,
    }),
};
```

**`availability.service.ts`**
```typescript
export const availabilityService = {
  getMe: (token: string) =>
    apiRequest<AvailabilitySlot[]>('/disponibilidade/me', { token }),

  save: (slots: Omit<AvailabilitySlot, 'id'>[], token: string) =>
    apiRequest<AvailabilitySlot[]>('/disponibilidade/me', {
      method: 'PUT', body: { slots }, token,
    }),

  getPublic: (userId: string) =>
    apiRequest<AvailabilitySlot[]>(`/disponibilidade/${userId}`),
};
```

**`payment.service.ts`**
```typescript
export const paymentService = {
  create: (requestId: string, payload: { valor: number; metodo: string }, token: string) =>
    apiRequest<Payment>(`/contratacoes/${requestId}/pagamento`, {
      method: 'POST', body: payload, token,
    }),

  get: (requestId: string, token: string) =>
    apiRequest<Payment>(`/contratacoes/${requestId}/pagamento`, { token }),
};
```

---

## Etapa 6 — Mobile: navegação

### 6.1 Atualizar `apps/mobile/src/types/navigation.ts`

Adicionar ao `AppStackParamList`:
```typescript
export type AppStackParamList = {
  // ... existentes ...
  Search: undefined;
  ProfessionalPublicProfile: { userId: string };
  NewRequest: { professionalId: string; professionalNome: string };
  MyRequests: undefined;
  IncomingRequests: undefined;
  RequestDetail: { requestId: string };
  Payment: { requestId: string; valor: number };
  EditAvailability: undefined;
};
```

### 6.2 Atualizar `apps/mobile/src/navigation/AppNavigator.tsx`

Registrar as novas telas no `AppStack.Navigator`:
```tsx
<AppStack.Screen name="Search" component={SearchScreen} options={{ title: 'Buscar Profissionais' }} />
<AppStack.Screen name="ProfessionalPublicProfile" component={ProfessionalPublicProfileScreen} options={{ title: 'Profissional' }} />
<AppStack.Screen name="NewRequest" component={NewRequestScreen} options={{ title: 'Nova Contratação' }} />
<AppStack.Screen name="MyRequests" component={MyRequestsScreen} options={{ title: 'Minhas Contratações' }} />
<AppStack.Screen name="IncomingRequests" component={IncomingRequestsScreen} options={{ title: 'Solicitações Recebidas' }} />
<AppStack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: 'Contratação' }} />
<AppStack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Pagamento' }} />
<AppStack.Screen name="EditAvailability" component={EditAvailabilityScreen} options={{ title: 'Disponibilidade' }} />
```

Atualizar a tab do profissional para mostrar contagem de pendentes no ícone.

---

## Etapa 7 — Mobile: telas

### 7.1 `HomeScreen.tsx` — adicionar botões de ação

**Cliente:** botão "Buscar profissionais" → `navigation.navigate('Search')`  
**Profissional:** botão "Ver solicitações recebidas" → `navigation.navigate('IncomingRequests')`

### 7.2 `ProfileScreen.tsx` — adicionar atalhos

**Profissional:** botão "Disponibilidade" → `navigation.navigate('EditAvailability')`  
**Cliente:** botão "Minhas contratações" → `navigation.navigate('MyRequests')`

### 7.3 `SearchScreen.tsx` — nova tela

```
[ Campo de busca por nome           ]
[ Chips de categoria: Elétrica | Hidráulica | ... ]

Lista de profissionais:
┌─────────────────────────────────┐
│ [Avatar] Nome do Profissional   │
│          ★ 4.8  •  São Paulo    │
│          Elétrica  Hidráulica   │
└─────────────────────────────────┘
```

- `useEffect` busca `/perfil-profissional` com filtros
- Tap no card → `navigation.navigate('ProfessionalPublicProfile', { userId })`

### 7.4 `ProfessionalPublicProfileScreen.tsx` — nova tela

```
[ Header teal: avatar, nome, avaliação ]
[ Bio                                  ]
[ Especialidades (chips)               ]
[ Disponibilidade (grade semanal)      ]
[ Botão laranja "Contratar"            ]
```

- Carrega `professionalProfileService.getPublic(userId)`
- Carrega `availabilityService.getPublic(userId)`
- Botão → `navigation.navigate('NewRequest', { professionalId, professionalNome })`

### 7.5 `NewRequestScreen.tsx` — nova tela

```
[ Profissional: [nome]              ]
[ Categoria (picker/chips)          ]
[ Descrição do serviço (multiline)  ]
[ Endereço                          ]
[ Data desejada                     ]
[ Valor estimado (opcional)         ]
[ Botão "Solicitar serviço"         ]
```

- Submit → `serviceRequestService.create(...)` → navega para `MyRequests`

### 7.6 `MyRequestsScreen.tsx` — nova tela (cliente)

```
Lista agrupada por status:
┌─────────────────────────────────┐
│ [PENDENTE]  Elétrica            │
│ João Silva  •  12/06/2026       │
└─────────────────────────────────┘
```

- Badge colorido por status: laranja=PENDENTE, azul=CONFIRMADO, verde=CONCLUIDO, vermelho=CANCELADO
- Tap → `navigation.navigate('RequestDetail', { requestId })`

### 7.7 `IncomingRequestsScreen.tsx` — nova tela (profissional)

Estrutura igual à `MyRequestsScreen`, mas mostra o nome do cliente e os botões de ação no detalhe.

### 7.8 `RequestDetailScreen.tsx` — nova tela (compartilhada)

```
[ Status badge centralizado        ]
[ Categoria • Data • Endereço      ]
[ Descrição                        ]
[ Valor estimado                   ]

Ações condicionais por status + role:
  PENDENTE  + PROFISSIONAL → [Confirmar] [Recusar]
  CONFIRMADO + PROFISSIONAL → [Iniciar serviço]
  EM_ANDAMENTO + PROFISSIONAL → [Concluir]
  CONCLUIDO + CLIENTE → [Pagar]
  PENDENTE ou CONFIRMADO + qualquer → [Cancelar]
```

### 7.9 `PaymentScreen.tsx` — nova tela

```
[ Resumo da contratação            ]
[ Valor: R$ ___                    ]
[ Método: [PIX] [Cartão] [Dinheiro]]
[ Botão "Confirmar pagamento"      ]
[ Tela de sucesso após confirmação ]
```

### 7.10 `EditAvailabilityScreen.tsx` — nova tela (profissional)

```
Seg  [ ] 08:00 – 18:00
Ter  [x] 08:00 – 18:00
Qua  [x] 09:00 – 17:00
...
[ Salvar disponibilidade ]
```

- Switch por dia da semana
- Inputs de hora_inicio e hora_fim aparecem quando o dia está ativo
- Carrega disponibilidade atual via `availabilityService.getMe(token)`

---

## Ordem de execução recomendada

```
1. schema.ts + migration SQL + aplicar no banco
2. Módulo Availability (backend + mobile service + tela)
3. Busca de profissionais (endpoint query params + SearchScreen + PublicProfileScreen)
4. Módulo ServiceRequests (backend completo)
5. Mobile: NewRequestScreen + MyRequestsScreen + IncomingRequestsScreen + RequestDetailScreen
6. Módulo Payments (backend + mobile service + PaymentScreen)
7. Ajustes de navegação e HomeScreen/ProfileScreen com atalhos
```

---

## Checklist final antes da entrega

- [ ] Migration 0003 aplicada no banco
- [ ] `AvailabilityModule` registrado no `AppModule`
- [ ] `ServiceRequestsModule` registrado no `AppModule`
- [ ] `PaymentsModule` registrado no `AppModule`
- [ ] Todas as telas registradas no `AppNavigator`
- [ ] `typecheck:mobile` sem erros
- [ ] Teste manual do fluxo completo:
  - login cliente → busca profissional → cria solicitação
  - login profissional → confirma → inicia → conclui
  - login cliente → paga
