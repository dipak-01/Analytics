import { Request, Response } from "express";
import { z } from "zod";
import { createSite, getAllSites } from "../services/siteService";

const createSiteSchema = z.object({
  name: z.string().min(1, "Site name is required"),
  domain: z.string().optional(),
});

/**
 * POST /sites — Create a new site.
 */
export async function handleCreateSite(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const parsed = createSiteSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid payload",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const site = await createSite(parsed.data.name, parsed.data.domain);
    res.status(201).json(site);
  } catch (error) {
    console.error("Create site error:", error);
    res.status(500).json({ error: "Failed to create site" });
  }
}

/**
 * GET /sites — List all sites.
 */
export async function handleGetSites(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const sites = await getAllSites();
    res.status(200).json(sites);
  } catch (error) {
    console.error("Get sites error:", error);
    res.status(500).json({ error: "Failed to fetch sites" });
  }
}
