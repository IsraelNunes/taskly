import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  descricao: varchar('descricao', { length: 50 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  nome: varchar('nome', { length: 120 }).notNull(),
  username: varchar('username', { length: 80 }).notNull().unique(),
  email: varchar('email', { length: 160 }).unique(),
  telefone: varchar('telefone', { length: 20 }),
  avatarUrl: text('avatar_url'),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  perfilId: uuid('perfil_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  cityId: uuid('city_id').references(() => cities.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const ufs = pgTable('ufs', {
  id: uuid('id').defaultRandom().primaryKey(),
  sigla: varchar('sigla', { length: 2 }).notNull().unique(),
  nome: varchar('nome', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const cities = pgTable('cities', {
  id: uuid('id').defaultRandom().primaryKey(),
  ufId: uuid('uf_id')
    .notNull()
    .references(() => ufs.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  nome: varchar('nome', { length: 120 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const serviceCategories = pgTable('service_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  nome: varchar('nome', { length: 80 }).notNull().unique(),
  icone: varchar('icone', { length: 80 }),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const clientProfiles = pgTable('client_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  notificacoesAtivas: boolean('notificacoes_ativas').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const professionalProfiles = pgTable('professional_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  bio: text('bio'),
  cidadeId: uuid('cidade_id').references(() => cities.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  avaliacaoMedia: numeric('avaliacao_media', { precision: 3, scale: 2 }).default('0').notNull(),
  totalAvaliacoes: integer('total_avaliacoes').default(0).notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const professionalCategories = pgTable('professional_categories', {
  professionalProfileId: uuid('professional_profile_id')
    .notNull()
    .references(() => professionalProfiles.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => serviceCategories.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const portfolioImages = pgTable('portfolio_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  professionalProfileId: uuid('professional_profile_id')
    .notNull()
    .references(() => professionalProfiles.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  descricao: varchar('descricao', { length: 200 }),
  ordem: integer('ordem').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  perfil: one(profiles, { fields: [users.perfilId], references: [profiles.id] }),
  cidade: one(cities, { fields: [users.cityId], references: [cities.id] }),
  clientProfile: one(clientProfiles, { fields: [users.id], references: [clientProfiles.userId] }),
  professionalProfile: one(professionalProfiles, {
    fields: [users.id],
    references: [professionalProfiles.userId],
  }),
}));

export const profilesRelations = relations(profiles, ({ many }) => ({
  users: many(users),
}));

export const ufsRelations = relations(ufs, ({ many }) => ({
  cidades: many(cities),
}));

export const citiesRelations = relations(cities, ({ one, many }) => ({
  uf: one(ufs, { fields: [cities.ufId], references: [ufs.id] }),
  users: many(users),
  professionalProfiles: many(professionalProfiles),
}));

export const serviceCategoriesRelations = relations(serviceCategories, ({ many }) => ({
  professionals: many(professionalCategories),
}));

export const clientProfilesRelations = relations(clientProfiles, ({ one }) => ({
  user: one(users, { fields: [clientProfiles.userId], references: [users.id] }),
}));

export const professionalProfilesRelations = relations(professionalProfiles, ({ one, many }) => ({
  user: one(users, { fields: [professionalProfiles.userId], references: [users.id] }),
  cidade: one(cities, { fields: [professionalProfiles.cidadeId], references: [cities.id] }),
  categories: many(professionalCategories),
  portfolioImages: many(portfolioImages),
}));

export const professionalCategoriesRelations = relations(professionalCategories, ({ one }) => ({
  professional: one(professionalProfiles, {
    fields: [professionalCategories.professionalProfileId],
    references: [professionalProfiles.id],
  }),
  category: one(serviceCategories, {
    fields: [professionalCategories.categoryId],
    references: [serviceCategories.id],
  }),
}));

export const portfolioImagesRelations = relations(portfolioImages, ({ one }) => ({
  professional: one(professionalProfiles, {
    fields: [portfolioImages.professionalProfileId],
    references: [professionalProfiles.id],
  }),
}));

// ─── Entrega 3 ───────────────────────────────────────────────────────────────

export const professionalAvailability = pgTable('professional_availability', {
  id: uuid('id').defaultRandom().primaryKey(),
  professionalProfileId: uuid('professional_profile_id')
    .notNull()
    .references(() => professionalProfiles.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  diaSemana: integer('dia_semana').notNull(), // 0=Dom, 1=Seg ... 6=Sab
  horaInicio: varchar('hora_inicio', { length: 5 }).notNull(), // "08:00"
  horaFim: varchar('hora_fim', { length: 5 }).notNull(),       // "18:00"
  ativo: boolean('ativo').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const serviceRequests = pgTable('service_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  professionalId: uuid('professional_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  categoryId: uuid('category_id')
    .references(() => serviceCategories.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  descricao: text('descricao').notNull(),
  endereco: text('endereco'),
  dataAgendada: timestamp('data_agendada', { withTimezone: true }),
  valorEstimado: numeric('valor_estimado', { precision: 10, scale: 2 }),
  status: varchar('status', { length: 20 }).default('PENDENTE').notNull(),
  motivoCancelamento: text('motivo_cancelamento'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  serviceRequestId: uuid('service_request_id')
    .notNull()
    .unique()
    .references(() => serviceRequests.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  valor: numeric('valor', { precision: 10, scale: 2 }).notNull(),
  metodo: varchar('metodo', { length: 20 }).notNull(), // PIX | CARTAO | DINHEIRO
  status: varchar('status', { length: 20 }).default('PENDENTE').notNull(), // PENDENTE | PAGO
  pagoEm: timestamp('pago_em', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const professionalAvailabilityRelations = relations(professionalAvailability, ({ one }) => ({
  professional: one(professionalProfiles, {
    fields: [professionalAvailability.professionalProfileId],
    references: [professionalProfiles.id],
  }),
}));

export const serviceRequestsRelations = relations(serviceRequests, ({ one }) => ({
  client: one(users, { fields: [serviceRequests.clientId], references: [users.id] }),
  professional: one(users, { fields: [serviceRequests.professionalId], references: [users.id] }),
  category: one(serviceCategories, {
    fields: [serviceRequests.categoryId],
    references: [serviceCategories.id],
  }),
  payment: one(payments, {
    fields: [serviceRequests.id],
    references: [payments.serviceRequestId],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  serviceRequest: one(serviceRequests, {
    fields: [payments.serviceRequestId],
    references: [serviceRequests.id],
  }),
}));
