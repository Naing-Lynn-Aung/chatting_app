import cloudinary from "../helpers/cloudinary.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

const ChatController = {
    // Create or restore a chat between two users
    create: async (req, res) => {
        try {
            const { userId } = req.body;
            let chat = await Chat.findOne({
                users: { $all: [req.user._id, userId] }
            });
            if (!chat) {
                chat = await Chat.create({ users: [req.user._id, userId] });
            } else if (chat.deletedBy.includes(req.user._id)) {
                chat.deletedBy = chat.deletedBy.filter(id => id.toString() !== req.user._id.toString());
                await chat.save();
            }
            return res.status(200).json(chat);
        } catch (error) {
            return res.status(500).json({ message: "Failed to create chat", error: error.message });
        }
    },
    // Get all chat summaries for a user
    summary: async (req, res) => {
        try {
            const userId = req.user._id;
            // Find all chats the user is part of (not deleted)
            const chats = await Chat.find({ users: userId, deletedBy: { $ne: userId } })
                .populate("users", "name avatar status")
                .lean();
            // Build summary for each chat
            const summaries = await Promise.all(
                chats.map(async (chat) => {
                    const otherUser = chat.users.find(usr => usr._id.toString() != userId);
                    const lastMessage = await Message.findOne({ chat: chat._id }).sort({ createdAt: -1 }).lean();
                    const unreadCount = await Message.countDocuments({
                        chat: chat._id,
                        sender: otherUser._id,
                        status: "delivered"
                    });
                    return {
                        chatId: chat._id,
                        user: {
                            _id: otherUser._id,
                            name: otherUser.name,
                            avatar: otherUser.avatar,
                            status: otherUser.status
                        },
                        isPhoto: Boolean(lastMessage?.images.length > 0),
                        deleted: Boolean(lastMessage?.deleted),
                        deletedBy: lastMessage?.deletedBy || [],
                        lastMessage: lastMessage?.content || "",
                        unreadCount,
                        lastMessageAt: lastMessage?.createdAt || chat.updatedAt,
                    };
                })
            );
            // Sort chats by latest activity
            summaries.sort(
                (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
            );
            return res.status(200).json(summaries);
        } catch (error) {
            return res.status(500).json({ message: "Failed to load chat summaries", error: error.message });
        }
    },
    // Soft-delete a chat for current user, and fully delete if all users deleted
    destroy: async (req, res) => {
        try {
            const { chatId } = req.params;
            const userId = req.user._id;
            const chat = await Chat.findById(chatId);
            if (!chat || !chat.users.includes(userId)) {
                return res.status(403).json({ error: "Not authorized or chat not found" });
            }
            // Mark chat as deleted for this user
            await Chat.findByIdAndUpdate(chatId, {
                $addToSet: { deletedBy: userId }
            });
            // Hide all messages for this user
            await Message.updateMany(
                { chat: chatId },
                { $addToSet: { hiddenFor: userId } }
            );
            // Reload chat to check updated deletedBy
            const updatedChat = await Chat.findById(chatId);
            // If all users have deleted the chat, delete all messages
            if (updatedChat.deletedBy.length === updatedChat.users.length) {
                const messages = await Message.find({ chat: chatId });
                for (const msg of messages) {
                    // Delete all imagePublicIds
                    if (Array.isArray(msg.imagePublicIds)) {
                        for (const publicId of msg.imagePublicIds) {
                            await cloudinary.uploader.destroy(publicId);
                        }
                    }

                    // Delete all originalImagePublicIds
                    if (Array.isArray(msg.originalImagePublicIds)) {
                        for (const publicId of msg.originalImagePublicIds) {
                            await cloudinary.uploader.destroy(publicId);
                        }
                    }
                }

                await Message.deleteMany({ chat: chatId });
                await Chat.findByIdAndDelete(chatId);
            }

            return res.status(200).json({ message: "Chat deleted successfully." });
        } catch (error) {
            return res.status(500).json({ message: "Failed to delete chat.", error: error.message });
        }
    }
};

export default ChatController;