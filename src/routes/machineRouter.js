import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { createMachine, getMachines, allMachines, deleteMahchine, getMachine, updateMachine, machineHistory } from "../controllers/machineController.js";


const router = Router();

router.get("/", verifyToken, getMachines);

router.post("/newMachine", verifyToken, createMachine)

router.get("/allMachines", verifyToken, allMachines)

router.delete("/deleteMachine/:reference", verifyToken, deleteMahchine);
router.post("/", verifyToken, createMachine);
router.get("/:reference/reports", verifyToken, machineHistory);
router.get("/:reference", verifyToken, getMachine);
router.patch("/:reference", verifyToken, updateMachine);
router.delete("/:reference", verifyToken, deleteMahchine);

export default router;
