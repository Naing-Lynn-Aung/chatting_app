import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        trim: true
    },
    originalContent: {
        type: String,
        trim: true,
        default: null
    },
    images: [
        {
            type: String
        }
    ],
    imagePublicIds: [
        {
            type: String
        }
    ],
    originalImages: [
        {
            type: String
        }
    ],
    originalImagePublicIds: [
        {
            type: String
        }
    ],
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["sent", "delivered", "read"],
        default: "sent"
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    hiddenFor: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    edited: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedBy: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: "User"
        }
    ],
    deletedAt: {
        type: Date,
        default: null
    },
    type: {
        type: String,
        enum: ["text", "image", "mixed"]
    },

}, { timestamps: true });

export default mongoose.model("Message", messageSchema);