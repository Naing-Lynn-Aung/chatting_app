import cloudinary from "../helpers/cloudinary.js";
import Message from "../models/Message.js";

const ONE_DAY = 24 * 60 * 60 * 1000;

const startPurgeMessagesCron = (io) => {
    setInterval(async () => {
        const cutoff = new Date(Date.now() - ONE_DAY);
        const expired = await Message.find({ deleted: true, deletedAt: { $lt: cutoff } });
        for (const msg of expired) {
            for (const publicId of msg.originalImagePublicIds) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (err) {
                    console.error("Failed to delete Cloudinary image:", publicId, err);
                }
            }
            await Message.findByIdAndDelete(msg._id);
            io.to(msg.chat.toString()).emit("messagePurged", { _id: msg._id });
            io.emit("sidebarUpdate");
        }
    }, ONE_DAY);
};

export default startPurgeMessagesCron;