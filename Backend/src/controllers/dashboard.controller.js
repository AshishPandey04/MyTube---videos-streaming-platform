import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    
    if(!req.user){
        throw new ApiError(400,"Login to get Channel stats")
    }
    const userId= new mongoose.Types.ObjectId(req.user._id)

    const [totalVideos, totalSubscribers, videoIds] = await Promise.all([
      Video.countDocuments({ owner: userId }),
      Subscription.countDocuments({ channel: userId }),
      Video.find({ owner: userId }).distinct("_id"),
    ]);
  
    const [totalLikes, totalViewsAggregation] = await Promise.all([
      Like.countDocuments({ video: { $in: videoIds } }),
      Video.aggregate([
        { $match: { owner: userId } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } },
      ]),
    ]);
  
    const totalViews = totalViewsAggregation[0]?.totalViews || 0;
  
   return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalVideos,
          totalSubscribers,
          totalLikes,
          totalViews,
        },
        "Channel stats fetched successfully"
      )
    );
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    if(!req.user){
        throw new ApiError(400,"Login to get all channel videos")
    }
    const userId= new mongoose.Types.ObjectId(req.user._id)

    const videos = await Video.find({
      owner: userId,
    }).sort({
      createdAt: -1,
    });
  
    if (!videos) {
      throw new ApiError(404, "Videos not found");
    }
  
   return res
      .status(200)
      .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
})

export {
    getChannelStats, 
    getChannelVideos
    }