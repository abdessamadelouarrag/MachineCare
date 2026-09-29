import { Router } from "express";
import { register, login } from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.get("/login", login);

export default router;