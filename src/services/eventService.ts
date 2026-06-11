import { db } from "../db";
import { events, visitors, sessions } from "../db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export interface EventPayload {
  siteId: number;
  visitorId: string;
  sessionId: string;
  eventName: string;
  url?: string;
  referrer?: string;
  browser?: string;
  os?: string;
  device?: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
}

/**
 * Ingest a single event.
 * Also upserts the visitor (updates last_seen) and session (updates ended_at).
 */
export async function ingestEvent(payload: EventPayload) {
  const eventTimestamp = payload.timestamp
    ? new Date(payload.timestamp)
    : new Date();

  // 1. Upsert visitor
  await db
    .insert(visitors)
    .values({
      siteId: payload.siteId,
      visitorId: payload.visitorId,
      firstSeen: eventTimestamp,
      lastSeen: eventTimestamp,
    })
    .onConflictDoUpdate({
      target: [visitors.siteId, visitors.visitorId],
      set: { lastSeen: eventTimestamp },
    });

  // 2. Upsert session
  await db
    .insert(sessions)
    .values({
      siteId: payload.siteId,
      visitorId: payload.visitorId,
      sessionId: payload.sessionId,
      startedAt: eventTimestamp,
      endedAt: eventTimestamp,
    })
    .onConflictDoUpdate({
      target: [sessions.siteId, sessions.sessionId],
      set: { endedAt: eventTimestamp },
    });

  // 3. Insert event
  const [event] = await db
    .insert(events)
    .values({
      siteId: payload.siteId,
      visitorId: payload.visitorId,
      sessionId: payload.sessionId,
      eventName: payload.eventName,
      url: payload.url ?? null,
      referrer: payload.referrer ?? null,
      browser: payload.browser ?? null,
      os: payload.os ?? null,
      device: payload.device ?? null,
      properties: payload.properties ?? null,
      timestamp: eventTimestamp,
    })
    .returning();

  return event;
}

/**
 * Query events for a site with optional filters.
 */
export async function getEventsBySite(
  siteId: number,
  filters?: { startDate?: string; endDate?: string; eventName?: string }
) {
  const conditions = [eq(events.siteId, siteId)];

  if (filters?.startDate) {
    conditions.push(gte(events.timestamp, new Date(filters.startDate)));
  }
  if (filters?.endDate) {
    conditions.push(lte(events.timestamp, new Date(filters.endDate)));
  }
  if (filters?.eventName) {
    conditions.push(eq(events.eventName, filters.eventName));
  }

  return db
    .select()
    .from(events)
    .where(and(...conditions))
    .orderBy(events.timestamp);
}
