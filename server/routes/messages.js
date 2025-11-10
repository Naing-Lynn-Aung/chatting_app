import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import MessageController from "../controllers/MessageController.js";
import upload from '../helpers/upload.js';
const router = express.Router();

router.get("/:chatId", AuthMiddleware, MessageController.findMessages);
router.put("/read", AuthMiddleware, MessageController.updateStatus);
router.put("/:id", AuthMiddleware, MessageController.update);
router.post("/upload", upload.array("file"), AuthMiddleware, MessageController.upload)

export default router;
