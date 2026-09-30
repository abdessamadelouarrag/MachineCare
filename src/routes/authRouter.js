import { Router } from "express";
import { register, login, defaultUser } from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.get("/login", login);

//part home pour creer default compte 
router.post("/default", defaultUser)



export default router;