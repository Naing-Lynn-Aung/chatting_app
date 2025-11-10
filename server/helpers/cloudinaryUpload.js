import cloudinary from "./cloudinary.js";
import streamifier from "streamifier";

const streamUpload = (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        try {
            const stream = cloudinary.uploader.upload_stream(
                { folder },
                (error, result) => {
                    if (result) resolve(result);
                    else reject(error);
                }
            );
            streamifier.createReadStream(fileBuffer).pipe(stream);
        } catch (err) {
            console.error("Stream creation or piping failed:", err);
            reject(err);
        }
    });
};

export default streamUpload;