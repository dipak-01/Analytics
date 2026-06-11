import { Router } from "express";
import { validateApiKey } from "../middleware/validateApiKey";
import { collectEvent } from "../controllers/collectController";

const router = Router();

// POST /collect — SDK sends events here
router.post("/collect", validateApiKey, collectEvent);

export default router;
