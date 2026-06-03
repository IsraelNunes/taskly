-- Disponibilidade do profissional
CREATE TABLE IF NOT EXISTS "professional_availability" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "professional_profile_id" uuid NOT NULL REFERENCES "professional_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "dia_semana" integer NOT NULL,
  "hora_inicio" varchar(5) NOT NULL,
  "hora_fim" varchar(5) NOT NULL,
  "ativo" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Contratações
CREATE TABLE IF NOT EXISTS "service_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "client_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "professional_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "category_id" uuid REFERENCES "service_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE,
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
  "service_request_id" uuid NOT NULL UNIQUE REFERENCES "service_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "valor" numeric(10,2) NOT NULL,
  "metodo" varchar(20) NOT NULL,
  "status" varchar(20) DEFAULT 'PENDENTE' NOT NULL,
  "pago_em" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
