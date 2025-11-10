import Message from "../models/Message.js";
import streamUpload from "../helpers/cloudinaryUpload.js";

const MessageController = {
    // Get messages of a chat
    findMessages: async (req, res) => {
        try {
            const { limit = 20, skip = 0 } = req.query;
            const messages = await Message.find({
                chat: req.params.chatId, hiddenFor: { $ne: req.user._id }
            })
            .populate("sender", "name avatar status")
            .select("_id sender status deleted deletedBy images originalImages edited purging content originalContent readBy")
            .sort({ createdAt: -1 })
            .skip(Number(skip))
            .limit(Number(limit))

            return res.status(200).json(messages.reverse() || []);
        } catch (error) {
            return res.status(500).json({ message: "Fail to find messages", error });
        }
    },
    // Mark delivered messages as read
    updateStatus: async (req, res) => {
        try {
            const { chatId, userId } = req.body;
            await Message.updateMany(
                {
                    chat: chatId,
                    receiver: userId,
                    status: "delivered",
                },
                { $set: { status: "read" } }
            );

            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ message: "Fail to update status", error });
        }
    },
    // Edit message content
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { content } = req.body;
            const userId = req.user._id;
            const message = await Message.findById(id);
            if (!message || message.sender.toString() !== userId.toString()) {
                return res.status(403).json({ error: "Not authorized to edit this message" });
            }
            message.content = content;
            message.edited = true;
            await message.save();

            return res.status(200).json(message);
        } catch (error) {
            return res.status(500).json({ message: "Fail to update message", error });
        }
    },
    // Upload chat images
    upload: async (req, res) => {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: "No files uploaded" });
            }
            const uploads = await Promise.all(
                req.files.map((file) => streamUpload(file.buffer, "chat-images"))
            );
            const urls = uploads.map((result) => result.secure_url);
            const publicIds = uploads.map((r) => r.public_id);
            res.json({ urls, publicIds });
        } catch (error) {
            res.status(500).json({ error: "Upload failed" });
        }
    }
};

export default MessageController;