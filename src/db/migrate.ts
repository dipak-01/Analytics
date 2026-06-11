// Migration script — runs the Drizzle-generated SQL against Neon
import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("🔄 Dropping old users table (if exists)...");
  await sql`DROP TABLE IF EXISTS "users" CASCADE`;

  console.log("🔄 Creating sites table...");
  await sql`
    CREATE TABLE IF NOT EXISTS "sites" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar(255) NOT NULL,
      "domain" varchar(255),
      "api_key" varchar(64) NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      CONSTRAINT "sites_api_key_unique" UNIQUE("api_key")
    )
  `;

  console.log("🔄 Creating visitors table...");
  await sql`
    CREATE TABLE IF NOT EXISTS "visitors" (
      "id" serial PRIMARY KEY NOT NULL,
      "site_id" integer NOT NULL,
      "visitor_id" varchar(255) NOT NULL,
      "first_seen" timestamp with time zone DEFAULT now() NOT NULL,
      "last_seen" timestamp with time zone DEFAULT now() NOT NULL
    )
  `;

  console.log("🔄 Creating sessions table...");
  await sql`
    CREATE TABLE IF NOT EXISTS "sessions" (
      "id" serial PRIMARY KEY NOT NULL,
      "site_id" integer NOT NULL,
      "visitor_id" varchar(255) NOT NULL,
      "session_id" varchar(255) NOT NULL,
      "started_at" timestamp with time zone DEFAULT now() NOT NULL,
      "ended_at" timestamp with time zone
    )
  `;

  console.log("🔄 Creating events table...");
  await sql`
    CREATE TABLE IF NOT EXISTS "events" (
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
    )
  `;

  console.log("🔄 Adding foreign keys...");
  await sql`ALTER TABLE "events" ADD CONSTRAINT "events_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action`;
  await sql`ALTER TABLE "sessions" ADD CONSTRAINT "sessions_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action`;
  await sql`ALTER TABLE "visitors" ADD CONSTRAINT "visitors_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action`;

  console.log("🔄 Creating indexes...");
  await sql`CREATE INDEX IF NOT EXISTS "events_site_id_idx" ON "events" USING btree ("site_id")`;
  await sql`CREATE INDEX IF NOT EXISTS "events_event_name_idx" ON "events" USING btree ("event_name")`;
  await sql`CREATE INDEX IF NOT EXISTS "events_timestamp_idx" ON "events" USING btree ("timestamp")`;
  await sql`CREATE INDEX IF NOT EXISTS "events_site_timestamp_idx" ON "events" USING btree ("site_id","timestamp")`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "sessions_site_session_idx" ON "sessions" USING btree ("site_id","session_id")`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "visitors_site_visitor_idx" ON "visitors" USING btree ("site_id","visitor_id")`;

  console.log("✅ Migration complete!");
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
