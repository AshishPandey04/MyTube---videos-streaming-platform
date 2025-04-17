import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const videoObjectId= new mongoose.Types.ObjectId(videoId)

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const user = req.user  
    if(!user) {
        throw new ApiError(401,"Login to like the vedio")
    }
    const isLiked = await Like.findOne({
        likedBy: user._id,
        video: videoObjectId
        
    })                  

    if(isLiked) {   
        await Like.deleteOne({_id: isLiked._id})
        return res.status(200).json(new ApiResponse(
            200, "Video unliked successfully")
    )
    }

    await Like.create({
        likedBy: user._id,
        video: videoObjectId
    })
    return res.status(200).json(new ApiResponse(
        200, "Video liked successfully")
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    
    if(!isValidObjectId(commentId)){
        throw new ApiError(401,"Invalid comment ID")
    }
    if(!res.user){
        throw new ApiError(400,"Login to Like comment")
    }

    const commentObjectId= new mongoose.Types.ObjectId(commentId)

    const isLiked=await Like.findOne({
        likedBy:req.user._id,
        comment:commentObjectId
    })
    if(isLiked){
        await Like.deleteOne({_id:isLiked._id})
        return res.status(200)
        .json(
            new ApiResponse(200,"Unliked the comment successfully")
        )
    }

    await Like.create({
        likedBy:req.user._id,
        comment:commentObjectId
    })

    return res.status(200)
        .json(
            new ApiResponse(200,"liked the comment successfully")
        )


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!isValidObjectId(tweetId)){
        throw new ApiError(401,"Invalid tweet ID")
    }
    if(!res.user){
        throw new ApiError(400,"Login to Like comment")
    }

    const tweetObjectId= new mongoose.Types.ObjectId(tweetId)

    const isLiked=await Like.findOne({
        likedBy:req.user._id,
        tweet:tweetObjectId
    })
    if(isLiked){
        await Like.deleteOne({_id:isLiked._id})
        return res.status(200)
        .json(
            new ApiResponse(200,"Unliked the tweet successfully")
        )
    }

    await Like.create({
        likedBy:req.user._id,
        comment:tweetObjectId
    })

    return res.status(200)
        .json(
            new ApiResponse(200,"liked the tweet successfully")
        )


}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}