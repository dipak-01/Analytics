import { Request, Response } from "express";
import { getSiteById } from "../services/siteService";
import {
  getOverview,
  getTopPages,
  getTopEvents,
  getRealtime,
  getBrowserStats,
  getDeviceStats,
  getReferrerStats,
} from "../services/analyticsService";

/**
 * Helper: parse siteId from params and validate it exists.
 */
async function resolveSite(req: Request, res: Response) {
  const siteId = parseInt(req.params.siteId, 10);
  if (isNaN(siteId)) {
    res.status(400).json({ error: "Invalid siteId" });
    return null;
  }

  const site = await getSiteById(siteId);
  if (!site) {
    res.status(404).json({ error: "Site not found" });
    return null;
  }

  return site;
}

/**
 * GET /analytics/:siteId — Overview stats.
 */
export async function handleOverview(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const site = await resolveSite(req, res);
    if (!site) return;

    const { startDate, endDate } = req.query as {
      startDate?: string;
      endDate?: string;
    };

    const overview = await getOverview(site.id, startDate, endDate);
    res.status(200).json(overview);
  } catch (error) {
    console.error("Analytics overview error:", error);
    res.status(500).json({ error: "Failed to fetch analytics overview" });
  }
}

/**
 * GET /analytics/:siteId/pages — Top pages.
 */
export async function handleTopPages(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const site = await resolveSite(req, res);
    if (!site) return;

    const { startDate, endDate, limit } = req.query as {
      startDate?: string;
      endDate?: string;
      limit?: string;
    };

    const pages = await getTopPages(
      site.id,
      startDate,
      endDate,
      limit ? parseInt(limit, 10) : undefined
    );
    res.status(200).json(pages);
  } catch (error) {
    console.error("Top pages error:", error);
    res.status(500).json({ error: "Failed to fetch top pages" });
  }
}

/**
 * GET /analytics/:siteId/events — Top events.
 */
export async function handleTopEvents(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const site = await resolveSite(req, res);
    if (!site) return;

    const { startDate, endDate, limit } = req.query as {
      startDate?: string;
      endDate?: string;
      limit?: string;
    };

    const topEvents = await getTopEvents(
      site.id,
      startDate,
      endDate,
      limit ? parseInt(limit, 10) : undefined
    );
    res.status(200).json(topEvents);
  } catch (error) {
    console.error("Top events error:", error);
    res.status(500).json({ error: "Failed to fetch top events" });
  }
}

/**
 * GET /analytics/:siteId/realtime — Active visitors and pages.
 */
export async function handleRealtime(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const site = await resolveSite(req, res);
    if (!site) return;

    const realtime = await getRealtime(site.id);
    res.status(200).json(realtime);
  } catch (error) {
    console.error("Realtime error:", error);
    res.status(500).json({ error: "Failed to fetch realtime data" });
  }
}

/**
 * GET /analytics/:siteId/browsers — Browser breakdown.
 */
export async function handleBrowserStats(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const site = await resolveSite(req, res);
    if (!site) return;

    const { startDate, endDate } = req.query as {
      startDate?: string;
      endDate?: string;
    };

    const browsers = await getBrowserStats(site.id, startDate, endDate);
    res.status(200).json(browsers);
  } catch (error) {
    console.error("Browser stats error:", error);
    res.status(500).json({ error: "Failed to fetch browser stats" });
  }
}

/**
 * GET /analytics/:siteId/devices — Device/OS breakdown.
 */
export async function handleDeviceStats(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const site = await resolveSite(req, res);
    if (!site) return;

    const { startDate, endDate } = req.query as {
      startDate?: string;
      endDate?: string;
    };

    const devices = await getDeviceStats(site.id, startDate, endDate);
    res.status(200).json(devices);
  } catch (error) {
    console.error("Device stats error:", error);
    res.status(500).json({ error: "Failed to fetch device stats" });
  }
}

/**
 * GET /analytics/:siteId/referrers — Referrer breakdown.
 */
export async function handleReferrerStats(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const site = await resolveSite(req, res);
    if (!site) return;

    const { startDate, endDate } = req.query as {
      startDate?: string;
      endDate?: string;
    };

    const referrers = await getReferrerStats(site.id, startDate, endDate);
    res.status(200).json(referrers);
  } catch (error) {
    console.error("Referrer stats error:", error);
    res.status(500).json({ error: "Failed to fetch referrer stats" });
  }
}
