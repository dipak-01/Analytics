CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_id" integer NOT NULL,
	"visitor_id" varchar(255) NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"event_name" varchar(255) NOT NULL,
	"url" varchar(2048),
	"referrer" varchar(2048),
	"browser" varchar(255),
	"os" varchar(255),
	"device" varchar(255),
	"properties" jsonb,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_id" integer NOT NULL,
	"visitor_id" varchar(255) NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"domain" varchar(255),
	"api_key" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sites_api_key_unique" UNIQUE("api_key")
);
--> statement-breakpoint
CREATE TABLE "visitors" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_id" integer NOT NULL,
	"visitor_id" varchar(255) NOT NULL,
	"first_seen" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "events_site_id_idx" ON "events" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "events_event_name_idx" ON "events" USING btree ("event_name");--> statement-breakpoint
CREATE INDEX "events_timestamp_idx" ON "events" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "events_site_timestamp_idx" ON "events" USING btree ("site_id","timestamp");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_site_session_idx" ON "sessions" USING btree ("site_id","session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "visitors_site_visitor_idx" ON "visitors" USING btree ("site_id","visitor_id");