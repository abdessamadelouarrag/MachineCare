import { Router } from "express";
import { register, login, defaultUser } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

router.post("/register", verifyToken, register);
router.get("/login", login);

//part home pour creer default compte 
router.post("/default", defaultUser)



export default router;
