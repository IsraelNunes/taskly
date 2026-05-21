-- Drop news-related tables and types
ALTER TABLE "news_tags" DROP CONSTRAINT IF EXISTS "news_tags_noticia_id_news_id_fk";--> statement-breakpoint
ALTER TABLE "news_tags" DROP CONSTRAINT IF EXISTS "news_tags_tag_id_tags_id_fk";--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "comments_noticia_id_news_id_fk";--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "comments_autor_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "news" DROP CONSTRAINT IF EXISTS "news_autor_id_users_id_fk";--> statement-breakpoint
DROP TABLE IF EXISTS "news_tags";--> statement-breakpoint
DROP TABLE IF EXISTS "comments";--> statement-breakpoint
DROP TABLE IF EXISTS "news";--> statement-breakpoint
DROP TABLE IF EXISTS "tags";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."news_status";--> statement-breakpoint

-- Add new columns to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email" varchar(160);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "telefone" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "city_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint

-- Create service_categories table
CREATE TABLE "service_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(80) NOT NULL,
	"icone" varchar(80),
	"slug" varchar(80) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_categories_nome_unique" UNIQUE("nome"),
	CONSTRAINT "service_categories_slug_unique" UNIQUE("slug")
);--> statement-breakpoint

-- Create client_profiles table
CREATE TABLE "client_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"notificacoes_ativas" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "client_profiles_user_id_unique" UNIQUE("user_id")
);--> statement-breakpoint
ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint

-- Create professional_profiles table
CREATE TABLE "professional_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"bio" text,
	"cidade_id" uuid,
	"avaliacao_media" numeric(3, 2) DEFAULT '0' NOT NULL,
	"total_avaliacoes" integer DEFAULT 0 NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "professional_profiles_user_id_unique" UNIQUE("user_id")
);--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_cidade_id_cities_id_fk" FOREIGN KEY ("cidade_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint

-- Create professional_categories junction table
CREATE TABLE "professional_categories" (
	"professional_profile_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "professional_categories_pk" PRIMARY KEY("professional_profile_id","category_id")
);--> statement-breakpoint
ALTER TABLE "professional_categories" ADD CONSTRAINT "professional_categories_professional_profile_id_fk" FOREIGN KEY ("professional_profile_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "professional_categories" ADD CONSTRAINT "professional_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint

-- Create portfolio_images table
CREATE TABLE "portfolio_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"professional_profile_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"descricao" varchar(200),
	"ordem" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "portfolio_images" ADD CONSTRAINT "portfolio_images_professional_profile_id_fk" FOREIGN KEY ("professional_profile_id") REFERENCES "public"."professional_profiles"("id") ON DELETE cascade ON UPDATE cascade;
