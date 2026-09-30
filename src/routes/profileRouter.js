import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { updateUser, showProfile } from "../controllers/profileController.js";

const router = Router();

router.post("/updateUser", verifyToken, updateUser)
router.get("/infos", verifyToken, showProfile)

export default router;