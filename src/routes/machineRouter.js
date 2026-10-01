import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { createMachine, getMachines, allMachines, deleteMahchine } from "../controllers/machineController.js";


const router = Router();

router.get("/", verifyToken, getMachines);

router.post("/newMachine", verifyToken, createMachine)

router.get("/allMachines", verifyToken, allMachines)

router.delete("/deleteMachine/:reference", verifyToken, deleteMahchine);

export default router;
