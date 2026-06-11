import { Router } from "express";
import {
  handleOverview,
  handleTopPages,
  handleTopEvents,
  handleRealtime,
  handleBrowserStats,
  handleDeviceStats,
  handleReferrerStats,
} from "../controllers/analyticsController";

const router = Router();

// GET /analytics/:siteId — Overview stats
router.get("/analytics/:siteId", handleOverview);

// GET /analytics/:siteId/pages — Top pages
router.get("/analytics/:siteId/pages", handleTopPages);

// GET /analytics/:siteId/events — Top events
router.get("/analytics/:siteId/events", handleTopEvents);

// GET /analytics/:siteId/realtime — Realtime visitors
router.get("/analytics/:siteId/realtime", handleRealtime);

// GET /analytics/:siteId/browsers — Browser breakdown
router.get("/analytics/:siteId/browsers", handleBrowserStats);

// GET /analytics/:siteId/devices — Device/OS breakdown
router.get("/analytics/:siteId/devices", handleDeviceStats);

// GET /analytics/:siteId/referrers — Referrer breakdown
router.get("/analytics/:siteId/referrers", handleReferrerStats);

export default router;
