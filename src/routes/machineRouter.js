import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { createMachine, getMachines } from "../controllers/machineController.js";


const router = Router();

router.get("/", verifyToken, getMachines);

router.post("/newMachine", verifyToken, createMachine)

export default router;
