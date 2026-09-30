import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { showProfile } from "../controllers/profileController.js";

const router = Router();

router.get("/infos", verifyToken, showProfile)

export default router;