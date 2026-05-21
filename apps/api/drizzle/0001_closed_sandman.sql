CREATE TABLE "news_tags" (
	"noticia_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_tags_pk" PRIMARY KEY("noticia_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "cities" DROP CONSTRAINT "cities_uf_id_ufs_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_noticia_id_news_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_autor_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "cities" ALTER COLUMN "uf_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "noticia_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "autor_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "texto" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "news_tags" ADD CONSTRAINT "news_tags_noticia_id_news_id_fk" FOREIGN KEY ("noticia_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "news_tags" ADD CONSTRAINT "news_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "cities" ADD CONSTRAINT "cities_uf_id_ufs_id_fk" FOREIGN KEY ("uf_id") REFERENCES "public"."ufs"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_noticia_id_news_id_fk" FOREIGN KEY ("noticia_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_autor_id_users_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;