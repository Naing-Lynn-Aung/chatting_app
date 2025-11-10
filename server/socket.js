import { Server } from 'socket.io';
import Message from './models/Message.js';
import User from "./models/User.js";
import Chat from './models/Chat.js';
import startPurgeMessagesCron from './crons/purgeMessages.js';

const onlineUsers = new Map();

const handleJoin = (io, socket) => async ({ userId }) => {
    // Track user's socket ID for presence
    onlineUsers.set(userId.toString(), socket.id);
    // Broadcast updated list of online users
    const onlineUserIds = Array.from(onlineUsers.keys());
    const onlineUserDetails = await User.find({ _id: { $in: onlineUserIds } });
    io.emit("onlineUsers", onlineUserDetails);
    // Find undelivered messages for this user
    const undeliveredMessages = await Message.find({ receiver: userId, status: "sent" });
    // Mark each as delivered and notify sender + receiver
    for (const msg of undeliveredMessages) {
        msg.status = "delivered";
        await msg.save();
        // Notify sender that message was delivered
        const senderSocket = onlineUsers.get(msg.sender.toString());
        if (senderSocket) io.to(senderSocket).emit("messageStatus", { messageId: msg._id, status: "delivered", });

        // Send message to receiver
        io.to(socket.id).emit("receiveMessage", msg);
    }
};

const handleSendMessage = (io) => async (msg) => {
    const isReceiverOnline = onlineUsers.has(msg.receiver);
    const status = isReceiverOnline ? "delivered" : "sent";
    let saved;
    // If editing an existing message
    if (msg._id) {
        saved = await Message.findById(msg._id);
        if (!saved || saved.sender.toString() !== msg.sender.toString()) return;

        saved.content = msg.content;
        if (msg.images.length > 0) {
            saved.images = msg.images;
        }
        saved.edited = true;
        saved.status = status;
        saved.type = msg.type || "text";
        await saved.save();
    } else {
        // Create new message
        saved = await Message.create({ ...msg, status });
    }
    // Restore chat if receiver had previously deleted it
    const chat = await Chat.findById(msg.chat);
    if (chat.deletedBy.includes(msg.receiver)) {
        chat.deletedBy = chat.deletedBy.filter(id => id.toString() !== msg.receiver.toString());
        await chat.save();
    }
    // Notify sender with confirmation and status
    const senderSocket = onlineUsers.get(msg.sender);
    if (senderSocket) {
        io.to(senderSocket).emit("messageSent", saved);
        io.to(senderSocket).emit('messageStatus', { messageId: saved._id, status });
    }
    // Notify receiver with new message and sidebar update
    const receiverSocket = onlineUsers.get(msg.receiver);
    if (receiverSocket) {
        io.to(receiverSocket).emit('receiveMessage', saved);
        io.to(receiverSocket).emit("sidebarUpdate", saved);
    }
};

const handleMessageRead = (io) => async ({ messageId, userId }) => {
    const msg = await Message.findById(messageId);
    if (!msg.readBy.includes(userId)) {
        msg.readBy.push(userId);
        msg.status = "read";
        await msg.save();
        // Notify sender of read status
        const senderSocket = onlineUsers.get(msg.sender.toString());
        if (senderSocket) io.to(senderSocket).emit("messageStatus", { messageId: msg._id, status: "read", });

    }
};

const handleLogout = (io) => async (userId) => {
    if (onlineUsers.has(userId)) {
        onlineUsers.delete(userId);
        // Update last seen timestamp
        await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
    }
    // Broadcast updated online users
    const onlineUserIds = Array.from(onlineUsers.keys());
    const onlineUserDetails = await User.find({ _id: { $in: onlineUserIds } });
    io.emit("onlineUsers", onlineUserDetails);
};

const handleDeleteMessage = (io) => async ({ messageId, userId }) => {
    const message = await Message.findById(messageId).populate("sender");
            if (!message) return;

            if (message.sender._id.toString() === userId) {
                // Sender deletes their own message — global deletion
                message.originalContent = message.content;
                message.originalImages = message.images;
                message.originalImagePublicIds = message.imagePublicIds;
                message.deleted = true;
                message.deletedAt = new Date();
                message.content = "";
                message.images = [];
                message.imagePublicIds = [];
                message.deletedBy = [];
            } else {
                // Receiver deletes — local deletion only
                message.deletedBy = message.deletedBy || [];
                if (!message.deletedBy.includes(userId)) {
                    message.deletedBy.push(userId);
                }
            }
            await message.save();
            io.to(message.chat.toString()).emit("messageDeleted", message);
            io.emit("sidebarUpdate");
}

const handleUndoDeleteMessage = (io) => async ({ messageId, userId }) => {
    const message = await Message.findById(messageId).populate("sender");
            if (!message) return;

            if (message.sender._id.toString() === userId) {
                // Sender restores their own message
                message.deleted = false;
                message.deletedAt = null;
                message.content = message.originalContent || "";
                message.images = message.originalImages || [];
                message.imagePublicIds = message.originalImagePublicIds || [];

                message.originalContent = null;
                message.originalImages = null;
                message.originalImagePublicIds = null;
            } else {
                // Receiver restores locally deleted message
                message.deletedBy = message.deletedBy?.filter(
                    (id) => id.toString() !== userId
                );
            }
            await message.save();
            io.to(message.chat.toString()).emit("messageRestored", message);
            io.emit("sidebarUpdate");
}

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: 'https://chatting-app-six-woad.vercel.app/login',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log("Socket connected:", socket.id);
        // Handle user joining the app (initial connection)
        socket.on("join", handleJoin(io, socket));
        //  Handle sending or editing a message
        socket.on("sendMessage", handleSendMessage(io));
        // Handle message read status update
        socket.on("messageRead", handleMessageRead(io));
        // Join a specific chat room
        socket.on("joinChat", (chatId) => socket.join(chatId));
        // Typing indicator
        socket.on("typing", ({ chatId, userId }) => socket.to(chatId).emit("typing", { userId }));
        // Handle user logout
        socket.on("logout", handleLogout(io));
        //  Handle message deletion
        socket.on("deleteMessage", handleDeleteMessage(io));
        // Cron job to purge messages after 1 day
        startPurgeMessagesCron(io);
        // Undo message deletion
        socket.on("undoDeleteMessage", handleUndoDeleteMessage(io));
        // Handle socket disconnect
        socket.on("disconnect", async () => {
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    // Update last seen timestamp
                    const offlineUser = await User.findByIdAndUpdate(userId, {
                        lastSeen: new Date(),
                    }, { new: true });

                    io.emit("userLastSeenUpdated", { userId, lastSeen: offlineUser.lastSeen});
                    break;
                }
            }
            // Broadcast updated online users
            const onlineUserIds = Array.from(onlineUsers.keys());
            const onlineUserDetails = await User.find({ _id: { $in: onlineUserIds } });

            io.emit("onlineUsers", onlineUserDetails);
        });
    });
};

export default setupSocket;