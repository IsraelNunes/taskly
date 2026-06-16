-- Schema completo do Taskly
-- Executado automaticamente pelo PostgreSQL na primeira criação do volume.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Perfis de acesso ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "profiles" (
  "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "descricao"   varchar(50) NOT NULL,
  "created_at"  timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"  timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "profiles_descricao_unique" UNIQUE ("descricao")
);

-- ─── Localização ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ufs" (
  "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "sigla"       varchar(2)   NOT NULL,
  "nome"        varchar(100) NOT NULL,
  "created_at"  timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"  timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "ufs_sigla_unique" UNIQUE ("sigla")
);

CREATE TABLE IF NOT EXISTS "cities" (
  "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "uf_id"       uuid NOT NULL REFERENCES "ufs"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "nome"        varchar(120) NOT NULL,
  "created_at"  timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"  timestamp with time zone DEFAULT now() NOT NULL
);

-- ─── Usuários ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "users" (
  "id"                  uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "nome"                varchar(120) NOT NULL,
  "username"            varchar(80)  NOT NULL,
  "email"               varchar(160),
  "telefone"            varchar(20),
  "avatar_url"          text,
  "password_hash"       varchar(255) NOT NULL,
  "perfil_id"           uuid NOT NULL  REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "city_id"             uuid           REFERENCES "cities"("id")   ON DELETE SET NULL ON UPDATE CASCADE,
  "cpf"                 varchar(14),
  "asaas_customer_id"   varchar(50),
  "created_at"          timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"          timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "users_username_unique" UNIQUE ("username"),
  CONSTRAINT "users_email_unique"    UNIQUE ("email")
);

-- ─── Categorias de serviço ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "service_categories" (
  "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "nome"        varchar(80) NOT NULL,
  "icone"       varchar(80),
  "slug"        varchar(80) NOT NULL,
  "created_at"  timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"  timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "service_categories_nome_unique" UNIQUE ("nome"),
  CONSTRAINT "service_categories_slug_unique" UNIQUE ("slug")
);

-- ─── Perfil do cliente ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "client_profiles" (
  "id"                   uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id"              uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "notificacoes_ativas"  boolean DEFAULT true NOT NULL,
  "created_at"           timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"           timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "client_profiles_user_id_unique" UNIQUE ("user_id")
);

-- ─── Perfil do profissional ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "professional_profiles" (
  "id"               uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id"          uuid NOT NULL REFERENCES "users"("id")   ON DELETE CASCADE  ON UPDATE CASCADE,
  "bio"              text,
  "cidade_id"        uuid           REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "avaliacao_media"  numeric(3,2)   DEFAULT '0' NOT NULL,
  "total_avaliacoes" integer        DEFAULT 0   NOT NULL,
  "is_verified"      boolean        DEFAULT false NOT NULL,
  "created_at"       timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"       timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "professional_profiles_user_id_unique" UNIQUE ("user_id")
);

CREATE TABLE IF NOT EXISTS "professional_categories" (
  "professional_profile_id" uuid NOT NULL REFERENCES "professional_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "category_id"             uuid NOT NULL REFERENCES "service_categories"("id")    ON DELETE CASCADE ON UPDATE CASCADE,
  "created_at"              timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "professional_categories_pk" PRIMARY KEY ("professional_profile_id", "category_id")
);

CREATE TABLE IF NOT EXISTS "portfolio_images" (
  "id"                      uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "professional_profile_id" uuid NOT NULL REFERENCES "professional_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "image_url"               text NOT NULL,
  "descricao"               varchar(200),
  "ordem"                   integer DEFAULT 0 NOT NULL,
  "created_at"              timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"              timestamp with time zone DEFAULT now() NOT NULL
);

-- ─── Disponibilidade ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "professional_availability" (
  "id"                      uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "professional_profile_id" uuid NOT NULL REFERENCES "professional_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "dia_semana"              integer     NOT NULL,
  "hora_inicio"             varchar(5)  NOT NULL,
  "hora_fim"                varchar(5)  NOT NULL,
  "ativo"                   boolean     DEFAULT true NOT NULL,
  "created_at"              timestamp with time zone DEFAULT now() NOT NULL
);

-- ─── Contratações ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "service_requests" (
  "id"                  uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "client_id"           uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "professional_id"     uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "category_id"         uuid           REFERENCES "service_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "descricao"           text NOT NULL,
  "endereco"            text,
  "data_agendada"       timestamp with time zone,
  "valor_estimado"      numeric(10,2),
  "status"              varchar(20) DEFAULT 'PENDENTE' NOT NULL,
  "motivo_cancelamento" text,
  "created_at"          timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"          timestamp with time zone DEFAULT now() NOT NULL
);

-- ─── Pagamentos ──────────────────────────────────────────────────────────────
-- status: PENDENTE | AGUARDANDO | PAGO | FALHOU | CANCELADO
CREATE TABLE IF NOT EXISTS "payments" (
  "id"                 uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "service_request_id" uuid NOT NULL UNIQUE REFERENCES "service_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "valor"              numeric(10,2) NOT NULL,
  "metodo"             varchar(20)   NOT NULL,
  "status"             varchar(20)   DEFAULT 'PENDENTE' NOT NULL,
  "pago_em"            timestamp with time zone,
  "asaas_payment_id"   varchar(50),
  "pix_qr_code"        text,
  "pix_copia_cola"     text,
  "created_at"         timestamp with time zone DEFAULT now() NOT NULL
);

-- ─── Tabela de controle do Drizzle ───────────────────────────────────────────
-- Registra todas as migrations como já aplicadas para que o drizzle-kit
-- não tente re-executá-las em cima do schema criado por este init.sql
CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
  "id"         serial PRIMARY KEY,
  "hash"       text NOT NULL,
  "created_at" bigint
);

INSERT INTO "__drizzle_migrations" ("hash", "created_at") VALUES
  ('0000_rapid_mephisto',    extract(epoch from now()) * 1000),
  ('0001_closed_sandman',    extract(epoch from now()) * 1000),
  ('0002_taskly_profiles',   extract(epoch from now()) * 1000),
  ('0003_entrega3',          extract(epoch from now()) * 1000),
  ('0004_asaas_payments',    extract(epoch from now()) * 1000)
ON CONFLICT DO NOTHING;
