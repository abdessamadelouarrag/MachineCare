import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { createMachine } from "../controllers/machineController.js";


const router = Router();

router.post("/newMachine", verifyToken, createMachine)

export default router;