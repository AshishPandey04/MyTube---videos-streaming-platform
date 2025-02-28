import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,

    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
        trim: true,

    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,//cloudinary url 
        required: true,

    },
    coverImage: {
        type: String,

    },
    password: {
        type: String,
        required: [true,"Password is required"],

    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video",
        }
    ],
    refreshToken:{
        type:String,
    }

}, { timestamps: true })

export const User = mongoose.model("User", userSchema);