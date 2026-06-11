import { Router } from "express";
import {
  handleCreateSite,
  handleGetSites,
} from "../controllers/siteController";

const router = Router();

// POST /sites — Register a new site
router.post("/sites", handleCreateSite);

// GET /sites — List all sites
router.get("/sites", handleGetSites);

export default router;
