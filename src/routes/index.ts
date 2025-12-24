import { Router } from "express";
import { generateShortUrl, redirectToLongUrl } from "../controllers/urls";
import { getUrlAnalytics, generateQRCode } from "../controllers/features";
import { validate } from "../middleware/validator";
import { createUrlSchema, shortCodeSchema } from "../schema/validation/urlSchema";
import { shortenLimiter } from "../middleware/rateLimiter";


const router = Router();

/**
 * @openapi
 * /v1/shorten:
 *   post:
 *     summary: Create a short URL
 *     tags: [URLs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [longUrl]
 *             properties:
 *               longUrl:
 *                 type: string
 *               customAlias:
 *                 type: string
 *               expiresAt:
 *                 type: string
 *     responses:
 *       201:
 *         description: Short URL created.
 *       409:
 *         description: Custom alias already in use.
 */
router.post("/shorten", shortenLimiter, validate(createUrlSchema), generateShortUrl);

/**
 * @openapi
 * /v1/shorten/{shortCode}:
 *   get:
 *     summary: Redirect to long URL
 *     tags: [URLs]
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect.
 *       404:
 *         description: Not found.
 */
router.get("/shorten/:shortCode", validate(shortCodeSchema), redirectToLongUrl);

/**
 * @openapi
 * /v1/shorten/{shortCode}/analytics:
 *   get:
 *     summary: Get URL analytics
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analytics data.
 */
router.get("/shorten/:shortCode/analytics", validate(shortCodeSchema), getUrlAnalytics);

/**
 * @openapi
 * /v1/shorten/{shortCode}/qr:
 *   get:
 *     summary: Generate QR code for short URL
 *     tags: [Features]
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: QR code data URL.
 */
router.get("/shorten/:shortCode/qr", validate(shortCodeSchema), generateQRCode);

export default router;

