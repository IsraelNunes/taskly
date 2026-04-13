import { relations } from 'drizzle-orm';
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const newsStatusEnum = pgEnum('news_status', ['RASCUNHO', 'PUBLICADO']);

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
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  perfilId: uuid('perfil_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const news = pgTable('news', {
  id: uuid('id').defaultRandom().primaryKey(),
  titulo: varchar('titulo', { length: 180 }).notNull(),
  imagem: text('imagem'),
  resumo: varchar('resumo', { length: 300 }).notNull(),
  texto: text('texto').notNull(),
  status: newsStatusEnum('status').default('RASCUNHO').notNull(),
  autorId: uuid('autor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  dataCriacao: timestamp('data_criacao', { withTimezone: true }).defaultNow().notNull(),
  dataPublicacao: timestamp('data_publicacao', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  noticiaId: uuid('noticia_id').references(() => news.id, { onDelete: 'cascade' }),
  autorId: uuid('autor_id').references(() => users.id, { onDelete: 'set null' }),
  texto: text('texto'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const tags = pgTable('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  nome: varchar('nome', { length: 80 }).notNull().unique(),
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
  ufId: uuid('uf_id').references(() => ufs.id, { onDelete: 'set null' }),
  nome: varchar('nome', { length: 120 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  perfil: one(profiles, { fields: [users.perfilId], references: [profiles.id] }),
  noticias: many(news),
}));

export const profilesRelations = relations(profiles, ({ many }) => ({
  users: many(users),
}));

export const newsRelations = relations(news, ({ one }) => ({
  autor: one(users, { fields: [news.autorId], references: [users.id] }),
}));

export type NewsStatus = (typeof newsStatusEnum.enumValues)[number];
