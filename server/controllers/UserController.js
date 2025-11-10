import createToken from "../helpers/createToken.js";
import User from "../models/User.js";
import cloudinary from "../helpers/cloudinary.js";
import streamUpload from "../helpers/cloudinaryUpload.js";

const DEFAULT_AVATAR = "/uploads/profile_image.png";

const UserController = {
    // Get all users except the logged-in user
    index: async (req, res) => {
        try {
            const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');
            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json({ message: "Failed to load users", error });
        }
    },
    // Get active users (status: online)
    activeUser: async (req, res) => {
        try {
            const users = await User.find({ status: 'online', _id: { $ne: req.user._id } }).select('-password');
            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json({ message: "Failed to load active users", error });
        }
    },
    // Get current user info
    me: async (req, res) => {
        return res.json(req.user);
    },
    // Get specific user (only last seen)
    show: async (req, res) => {
        try {
            const user = await User.findById(req.params.id).select("lastSeen");
            if (!user) return res.status(404).json({ message: "User not found" });

            return res.status(200).json({ lastSeen: user.lastSeen });
        } catch (error) {
            return res.status(404).json({ message: "User not found" });
        }
    },
    // Register new user
    store: async (req, res) => {
        try {
            const { name, email, password, avatar } = req.body;
            const user = await User.register(name, email, password, avatar);

            return res.status(201).json({ user });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },
    // Login and set JWT cookie
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.login(email, password);
            const token = createToken(user._id);
            res.cookie('jwt', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 3 * 24 * 60 * 60 * 1000 });

            return res.status(200).json({ user });
        } catch (error) {
            return res.status(401).json({ message: "Email or Password incorrect" });
        }
    },
    // Logout and clear JWT cookie
    logout: async (req, res) => {
        res.cookie('jwt', '', { httpOnly: true, secure: true, sameSite: 'none', maxAge: 1 });
        return res.status(200).json({ message: "Logged out successfully" });
    },
    // Update user (with optional avatar upload)
    update: async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) return res.status(404).json({ message: "User not found" });

            const updatedData = { ...req.body };
            if (req.file) {
                const result = await streamUpload(req.file.buffer, "profile-images");

                if (user.avatarPublicId && user.avatar !== DEFAULT_AVATAR) {
                    await cloudinary.uploader.destroy(user.avatarPublicId);
                }
                updatedData.avatar = result.secure_url;
                updatedData.avatarPublicId = result.public_id;
            }

            const updatedUser = await User.findByIdAndUpdate(req.params.id, updatedData, { new: true });

            return res.status(200).json({ user: updatedUser, message: "User updated successfully" });
        } catch (error) {
            return res.status(400).json({ message: "Error updating user", error });
        }
    },
    // Delete a user
    destroy: async (req, res) => {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            return res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
            return res.status(400).json({ message: "Error deleting user", error });
        }
    },
    // Search users by name
    search: async (req, res) => {
        try {
            const keyword = req.query.key;
            const users = await User.find({
                _id: { $ne: req.user._id },
                name: { $regex: keyword, $options: "i" },
            }).select("_id name avatar status");

            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json({ message: "Search failed", error });
        }
    }
};

export default UserController;