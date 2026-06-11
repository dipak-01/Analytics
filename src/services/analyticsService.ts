import { db } from "../db";
import { events, visitors, sessions } from "../db/schema";
import { eq, and, gte, lte, sql, count, countDistinct } from "drizzle-orm";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildDateConditions(
  siteId: number,
  startDate?: string,
  endDate?: string
) {
  const conditions = [eq(events.siteId, siteId)];
  if (startDate) conditions.push(gte(events.timestamp, new Date(startDate)));
  if (endDate) conditions.push(lte(events.timestamp, new Date(endDate)));
  return and(...conditions);
}

// ─── Overview ────────────────────────────────────────────────────────────────

/**
 * Returns aggregate counts: total visitors, sessions, events, and page views
 * for the given site within an optional date range.
 */
export async function getOverview(
  siteId: number,
  startDate?: string,
  endDate?: string
) {
  const where = buildDateConditions(siteId, startDate, endDate);

  const [totals] = await db
    .select({
      totalEvents: count(events.id),
      totalVisitors: countDistinct(events.visitorId),
      totalSessions: countDistinct(events.sessionId),
      totalPageViews: count(
        sql`CASE WHEN ${events.eventName} = 'page_view' THEN 1 END`
      ),
    })
    .from(events)
    .where(where);

  return totals;
}

// ─── Top Pages ───────────────────────────────────────────────────────────────

export async function getTopPages(
  siteId: number,
  startDate?: string,
  endDate?: string,
  limit: number = 10
) {
  const conditions = [
    eq(events.siteId, siteId),
    eq(events.eventName, "page_view"),
  ];
  if (startDate) conditions.push(gte(events.timestamp, new Date(startDate)));
  if (endDate) conditions.push(lte(events.timestamp, new Date(endDate)));

  return db
    .select({
      url: events.url,
      views: count(events.id),
      visitors: countDistinct(events.visitorId),
    })
    .from(events)
    .where(and(...conditions))
    .groupBy(events.url)
    .orderBy(sql`count(${events.id}) DESC`)
    .limit(limit);
}

// ─── Top Events ──────────────────────────────────────────────────────────────

export async function getTopEvents(
  siteId: number,
  startDate?: string,
  endDate?: string,
  limit: number = 10
) {
  const where = buildDateConditions(siteId, startDate, endDate);

  return db
    .select({
      eventName: events.eventName,
      count: count(events.id),
    })
    .from(events)
    .where(where)
    .groupBy(events.eventName)
    .orderBy(sql`count(${events.id}) DESC`)
    .limit(limit);
}

// ─── Realtime ────────────────────────────────────────────────────────────────

/**
 * Active visitors and pages in the last 5 minutes.
 */
export async function getRealtime(siteId: number) {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const where = and(
    eq(events.siteId, siteId),
    gte(events.timestamp, fiveMinutesAgo)
  );

  const [counts] = await db
    .select({
      activeVisitors: countDistinct(events.visitorId),
      activePages: countDistinct(events.url),
    })
    .from(events)
    .where(where);

  // Also get the list of active pages
  const activePages = await db
    .select({
      url: events.url,
      visitors: countDistinct(events.visitorId),
    })
    .from(events)
    .where(where)
    .groupBy(events.url)
    .orderBy(sql`count(DISTINCT ${events.visitorId}) DESC`)
    .limit(10);

  return { ...counts, activePages };
}

// ─── Browser Stats ───────────────────────────────────────────────────────────

export async function getBrowserStats(
  siteId: number,
  startDate?: string,
  endDate?: string
) {
  const where = buildDateConditions(siteId, startDate, endDate);

  return db
    .select({
      browser: events.browser,
      count: count(events.id),
    })
    .from(events)
    .where(where)
    .groupBy(events.browser)
    .orderBy(sql`count(${events.id}) DESC`);
}

// ─── Device Stats ────────────────────────────────────────────────────────────

export async function getDeviceStats(
  siteId: number,
  startDate?: string,
  endDate?: string
) {
  const where = buildDateConditions(siteId, startDate, endDate);

  return db
    .select({
      device: events.device,
      os: events.os,
      count: count(events.id),
    })
    .from(events)
    .where(where)
    .groupBy(events.device, events.os)
    .orderBy(sql`count(${events.id}) DESC`);
}

// ─── Referrer Stats ──────────────────────────────────────────────────────────

export async function getReferrerStats(
  siteId: number,
  startDate?: string,
  endDate?: string
) {
  const where = buildDateConditions(siteId, startDate, endDate);

  return db
    .select({
      referrer: events.referrer,
      count: count(events.id),
      visitors: countDistinct(events.visitorId),
    })
    .from(events)
    .where(where)
    .groupBy(events.referrer)
    .orderBy(sql`count(${events.id}) DESC`);
}
