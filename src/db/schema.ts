// Database schema - Analytics platform tables
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Sites ───────────────────────────────────────────────────────────────────

export const sites = pgTable("sites", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }),
  apiKey: varchar("api_key", { length: 64 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sitesRelations = relations(sites, ({ many }) => ({
  visitors: many(visitors),
  sessions: many(sessions),
  events: many(events),
}));

// ─── Visitors ────────────────────────────────────────────────────────────────

export const visitors = pgTable(
  "visitors",
  {
    id: serial("id").primaryKey(),
    siteId: integer("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    visitorId: varchar("visitor_id", { length: 255 }).notNull(),
    firstSeen: timestamp("first_seen", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastSeen: timestamp("last_seen", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("visitors_site_visitor_idx").on(table.siteId, table.visitorId),
  ]
);

export const visitorsRelations = relations(visitors, ({ one }) => ({
  site: one(sites, {
    fields: [visitors.siteId],
    references: [sites.id],
  }),
}));

// ─── Sessions ────────────────────────────────────────────────────────────────

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    siteId: integer("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    visitorId: varchar("visitor_id", { length: 255 }).notNull(),
    sessionId: varchar("session_id", { length: 255 }).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("sessions_site_session_idx").on(table.siteId, table.sessionId),
  ]
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  site: one(sites, {
    fields: [sessions.siteId],
    references: [sites.id],
  }),
}));

// ─── Events ──────────────────────────────────────────────────────────────────

export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    siteId: integer("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    visitorId: varchar("visitor_id", { length: 255 }).notNull(),
    sessionId: varchar("session_id", { length: 255 }).notNull(),
    eventName: varchar("event_name", { length: 255 }).notNull(),
    url: varchar("url", { length: 2048 }),
    referrer: varchar("referrer", { length: 2048 }),
    browser: varchar("browser", { length: 255 }),
    os: varchar("os", { length: 255 }),
    device: varchar("device", { length: 255 }),
    properties: jsonb("properties"),
    timestamp: timestamp("timestamp", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("events_site_id_idx").on(table.siteId),
    index("events_event_name_idx").on(table.eventName),
    index("events_timestamp_idx").on(table.timestamp),
    index("events_site_timestamp_idx").on(table.siteId, table.timestamp),
  ]
);

export const eventsRelations = relations(events, ({ one }) => ({
  site: one(sites, {
    fields: [events.siteId],
    references: [sites.id],
  }),
}));
