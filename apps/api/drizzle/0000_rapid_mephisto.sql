CREATE EXTENSION IF NOT EXISTS "pgcrypto";--> statement-breakpoint
CREATE TYPE "public"."news_status" AS ENUM('RASCUNHO', 'PUBLICADO');--> statement-breakpoint
CREATE TABLE "cities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uf_id" uuid,
	"nome" varchar(120) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"noticia_id" uuid,
	"autor_id" uuid,
	"texto" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titulo" varchar(180) NOT NULL,
	"imagem" text,
	"resumo" varchar(300) NOT NULL,
	"texto" text NOT NULL,
	"status" "news_status" DEFAULT 'RASCUNHO' NOT NULL,
	"autor_id" uuid NOT NULL,
	"data_criacao" timestamp with time zone DEFAULT now() NOT NULL,
	"data_publicacao" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"descricao" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_descricao_unique" UNIQUE("descricao")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(80) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_nome_unique" UNIQUE("nome")
);
--> statement-breakpoint
CREATE TABLE "ufs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sigla" varchar(2) NOT NULL,
	"nome" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ufs_sigla_unique" UNIQUE("sigla")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(120) NOT NULL,
	"username" varchar(80) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"perfil_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "cities" ADD CONSTRAINT "cities_uf_id_ufs_id_fk" FOREIGN KEY ("uf_id") REFERENCES "public"."ufs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_noticia_id_news_id_fk" FOREIGN KEY ("noticia_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_autor_id_users_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_autor_id_users_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_perfil_id_profiles_id_fk" FOREIGN KEY ("perfil_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE cascade;
