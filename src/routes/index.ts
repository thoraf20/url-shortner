import { Router } from "express";
import { generateShortUrl, redirectToLongUrl } from "../controllers/urls";
import { getUrlAnalytics, generateQRCode } from "../controllers/features";
import { validate } from "../middleware/validator";
import { createUrlSchema, shortCodeSchema } from "../schema/validation/urlSchema";

const router = Router();

router.post("/shorten", validate(createUrlSchema), generateShortUrl);
router.get("/shorten/:shortCode", validate(shortCodeSchema), redirectToLongUrl);
router.get("/shorten/:shortCode/analytics", validate(shortCodeSchema), getUrlAnalytics);
router.get("/shorten/:shortCode/qr", validate(shortCodeSchema), generateQRCode);

export default router;
