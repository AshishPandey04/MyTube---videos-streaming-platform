import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscriberId=req.user._id;
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel Id")
    }

    if(subscriberId.toString()===channelId.toString()){
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }


  const existingSubscription = await Subscription.findOne({
    subscriber: subscriberId,
    channel: channelId,
  });


  if (existingSubscription) {
    await Subscription.findByIdAndDelete(existingSubscription._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Unsubscribed successfully"));
  }


  await Subscription.create({ subscriber: subscriberId, channel: channelId });
  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Subscribed successfully"));
   

   
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params


    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel Id")
    }
    if(!req.user){
        throw new ApiError(400,"Login to get subscriber list")
    }

    if(req.user._id.toString()!=channelId.toString()){
        throw new ApiError(400, "You are not authorised to see subscriber list");
    }

    const subscriberList = await Subscription.find({
        channel: channelId,
      }).populate("subscriber", "_id name avatar");

    if(!subscriberList || subscriberList.length==0){
        throw new ApiError(400,"something went wrong while fetching subscriber list or No subscriber found")
    }
     // If you want to send only array of subscribers:
     const subscribers = subscriberList.map((sub) => sub.subscriber);

    return res.status(200)
    .json(
        new ApiResponse(200,subscribers,"subscriber list is fetched successfully")
    )



})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params


    
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"Invalid subscriber Id")
    }
    if(!req.user){
        throw new ApiError(400,"Login to get channel list")
    }

    if(req.user._id.toString()!=channelId.toString()){
        throw new ApiError(400, "You are not authorised to see channel list");
    }

    const channelList = await Subscription.find({
        subscriber: subscriberId,
      }).populate("channel", "_id name avatar");

    if(!channelList || channelList.length==0){
        throw new ApiError(400,"something went wrong while fetching channel list or No channel found")
    }
     // If you want to send only array of channel:
     const channels = channelList.map((ch) => ch.channel);

    return res.status(200)
    .json(
        new ApiResponse(200,channels,"channel list is fetched successfully")
    )



})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}