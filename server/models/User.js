import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            default: "/uploads/profile_image.png"
        },
        avatarPublicId: {
            type: String
        },
        status: {
            type: String,
            enum: ["online", "offline", "away"],
            default: "online"
        },
        lastSeen: {
            type: Date,
            default: function(){
                return this.createdAt
            }
        },
    }, { timestamps: true }
)

UserSchema.statics.register = async function(name, email, password, avatar) {
    const userExists = await this.findOne({ email });
    if(userExists) throw new Error('Email already in use');

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await this.create(
        {
            name,
            email,
            password: hashedPassword,
            avatar
        }
    )
    return user;
}

UserSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error('User does not exist');
    const correctPwd = await bcrypt.compare(password, user.password);
    if (!correctPwd) throw new Error('Email or Password incorrect');
    return user;
}

export default mongoose.model("User", UserSchema);