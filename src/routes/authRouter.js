import { Router } from "express";
import { register, login, defaultUser, logout } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

router.post("/register", verifyToken, register);
router.get("/login", login);
router.post("/logout", verifyToken, logout);

//part home pour creer default compte 
router.post("/default", defaultUser)



export default router;
