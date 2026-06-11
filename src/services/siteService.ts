import { db } from "../db";
import { sites } from "../db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

/**
 * Create a new site with an auto-generated API key.
 */
export async function createSite(name: string, domain?: string) {
  const apiKey = uuidv4();

  const [site] = await db
    .insert(sites)
    .values({ name, domain: domain ?? null, apiKey })
    .returning();

  return site;
}

/**
 * List all registered sites.
 */
export async function getAllSites() {
  return db.select().from(sites).orderBy(sites.createdAt);
}

/**
 * Look up a site by its API key.
 */
export async function getSiteByApiKey(apiKey: string) {
  const [site] = await db
    .select()
    .from(sites)
    .where(eq(sites.apiKey, apiKey))
    .limit(1);

  return site ?? null;
}

/**
 * Look up a site by its numeric ID.
 */
export async function getSiteById(id: number) {
  const [site] = await db
    .select()
    .from(sites)
    .where(eq(sites.id, id))
    .limit(1);

  return site ?? null;
}
