import { Request, Response } from "express";
import { z } from "zod";
import { ingestEvent } from "../services/eventService";

// Zod schema for validating the collect payload
const collectSchema = z.object({
  visitorId: z.string().min(1, "visitorId is required"),
  sessionId: z.string().min(1, "sessionId is required"),
  event: z.string().min(1, "event name is required"),
  url: z.string().optional(),
  referrer: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  device: z.string().optional(),
  properties: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime().optional(),
});

/**
 * POST /collect
 * Receives events from the SDK. Requires a valid x-api-key header.
 * The site is already attached to req.site by the validateApiKey middleware.
 */
export async function collectEvent(req: Request, res: Response): Promise<void> {
  try {
    const parsed = collectSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid payload",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { event, ...rest } = parsed.data;

    const savedEvent = await ingestEvent({
      siteId: req.site!.id,
      eventName: event,
      ...rest,
    });

    res.status(200).json({ success: true, eventId: savedEvent.id });
  } catch (error) {
    console.error("Event collection error:", error);
    res.status(500).json({ error: "Failed to collect event" });
  }
}
