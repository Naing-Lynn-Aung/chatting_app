import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import ChatController from "../controllers/ChatController.js";
const router = express.Router();

router.post("/", AuthMiddleware, ChatController.create);
router.get('/summary', AuthMiddleware, ChatController.summary);
router.delete('/:chatId', AuthMiddleware, ChatController.destroy);

export default router;