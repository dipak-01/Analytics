import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { sites } from "../db/schema";
import { eq } from "drizzle-orm";

// Extend Express Request to carry the authenticated site
declare global {
  namespace Express {
    interface Request {
      site?: typeof sites.$inferSelect;
    }
  }
}

/**
 * Middleware: validates x-api-key header against the sites table.
 * On success, attaches the site record to req.site.
 */
export async function validateApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const apiKey = req.headers["x-api-key"] as string | undefined;

  if (!apiKey) {
    res.status(401).json({ error: "Missing x-api-key header" });
    return;
  }

  try {
    const [site] = await db
      .select()
      .from(sites)
      .where(eq(sites.apiKey, apiKey))
      .limit(1);

    if (!site) {
      res.status(401).json({ error: "Invalid API key" });
      return;
    }

    req.site = site;
    next();
  } catch (error) {
    console.error("API key validation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
