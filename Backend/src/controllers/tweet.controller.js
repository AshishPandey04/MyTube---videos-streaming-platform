import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body;
  

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content should not be empty");
    }
  
    if (!req.user ) {
        throw new ApiError(401, "Login to create tweet");
    }
  
    const newTweet = await Tweet.create({
        content: content.trim(),
        owner: req.user._id
    });
  
    if (!newTweet) {
      throw new ApiError(500, "Something went wrong while creating a tweet");
    }
  
    return res
      .status(201)
      .json(new ApiResponse(201, newTweet, "Tweet created successfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }
  if (!req.user ) {
    throw new ApiError(401, "Login to get your tweet");
}

  const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 });

  if (!tweets || tweets.length === 0) {
    throw new ApiError(404, "No tweets found for this user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const { tweetId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;
  
    if (!isValidObjectId(tweetId)) {
      throw new ApiError(400, "Invalid tweet ID");
    }
    if (!req.user ) {
        throw new ApiError(401, "Login to update tweet");
    }
  
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      throw new ApiError(404, "Tweet not found");
    }
  
    if (tweet.owner.toString() !== userId.toString()) {
      throw new ApiError(403, "You can only update your own tweets");
    }
  
    const updatedTweet = await Tweet.findByIdAndUpdate(
      tweetId,
      { $set: { content } },
      { new: true, runValidators: true }
    );
  
    if (!updatedTweet) {
      throw new ApiError(500, "Something went wrong while updating the tweet");
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;
    const userId = req.user._id;
  
    if (!isValidObjectId(tweetId)) {
      throw new ApiError(400, "Invalid tweet ID");
    }
    if (!userId) {
        throw new ApiError(401, "Login to delete tweet");
    }
  
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      throw new ApiError(404, "Tweet not found");
    }
  
    if (tweet.owner.toString() !== userId.toString()) {
      throw new ApiError(403, "You can only delete your own tweets");
    }
  
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
  
    if (!deletedTweet) {
      throw new ApiError(500, "Something went wrong while deleting the tweet");
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}