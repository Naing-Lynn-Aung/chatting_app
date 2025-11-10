import jwt from "jsonwebtoken"
import { promisify } from "util"
import User from "../models/User.js";

const verifyToken = promisify(jwt.verify);

const AuthMiddleware = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({ message: "Authentication token required" });
    }
    try {
        const decoded = await verifyToken(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export default AuthMiddleware