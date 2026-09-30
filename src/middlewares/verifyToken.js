import jwt from "jsonwebtoken";
import User from "../models/users.js"

export async function verifyToken(req, res, next) {
  const authorization = req.get("authorization");
  const token = authorization?.startsWith("Bearer ")? authorization.slice(7): null;

  if (!token) {
    return res.status(401).json({ message: "Token manquant." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (typeof payload === "string" || !payload.sub) {
      return res.status(401).json({ message: "Token invalide." });
    }

    const user = await User.findById(payload.sub).select("-password")

    if(!user){
        return res.status(401).json({
            message : "introvable Utilidateur !"
        })
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Token invalide ou expire !" });
  }
}