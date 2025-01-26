import { Router } from "express";
import { generateShortUrl, redirectToLongUrl } from "../controllers/urls";

const router = Router();

router.post("/shorten", generateShortUrl);
router.get("/shorten/:shortCode", redirectToLongUrl);

export default router;
