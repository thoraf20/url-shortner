import { Router } from "express";
import { generateShortUrl, redirectToLongUrl, getUserUrls } from "../controllers/urls";
import { getUrlAnalytics, generateQRCode } from "../controllers/features";
import { signup, login } from "../controllers/auth";
import { validate } from "../middleware/validator";
import { createUrlSchema, shortCodeSchema } from "../schema/validation/urlSchema";
import { signupSchema, loginSchema } from "../schema/validation/authSchema";
import { shortenLimiter } from "../middleware/rateLimiter";
import { authenticate, requireAuth } from "../middleware/auth";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /v1/urls/me:
 *   get:
 *     summary: Get URLs created by the authenticated user
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's URLs.
 *       401:
 *         description: Unauthorized.
 */
router.get("/urls/me", requireAuth, getUserUrls);


/**
 * @openapi
 * /v1/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created.
 *       409:
 *         description: Email already exists.
 */
router.post("/auth/signup", validate(signupSchema), signup);

/**
 * @openapi
 * /v1/auth/login:
 *   post:
 *     summary: Log in user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful.
 *       401:
 *         description: Invalid credentials.
 */
router.post("/auth/login", validate(loginSchema), login);


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

