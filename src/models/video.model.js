import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    videoFile:{
        type:String,
        required:true,
    },
    thumbnail:{
        type:String,
        required:true
    }
}, {
    timestamps: true,
})

export const Video = mongoose.model("Video", videoSchema)