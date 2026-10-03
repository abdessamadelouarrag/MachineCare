import {Router} from "express";
import {verifyToken} from "../middlewares/verifyToken.js";
import {createReport, getReports, getReport, updateReport} from "../controllers/reportController.js";

const router = Router();

router.use(verifyToken);
router.post("/", createReport);
router.get("/", getReports);
router.get("/:id", getReport);
router.patch("/:id", updateReport);

export default router;
