import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    deletedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
},  { timestamps: true })

export default mongoose.model("Chat", chatSchema);