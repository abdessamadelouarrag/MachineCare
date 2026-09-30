import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

//allez a dashboard avec verification token jwt
router.get("/dashboard", verifyToken, (req, res) =>{
    res.json({
        message : "Bienvenie Dans Machine Care...",
        info_user : req.user
    })
})

export default router