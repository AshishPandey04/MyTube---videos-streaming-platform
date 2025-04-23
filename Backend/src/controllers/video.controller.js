import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"

import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    if (!req.user) {
        throw new ApiError(401, " login  to get videos")
    }

    const match = {
        ...(query ? { title: { $regex: query, $options: "i" } } : {}),
        ...(userId ? { owner: mongoose.Types.ObjectId(userId) } : {}),
    };

    const alVideos = await Video.aggregate([
        {
            $match: match
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "videosByOwner"
            }
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                owner: {
                    $arrayElemAt: ["$videosByOwner", 0],
                },
            },
        },

        {
            $sort: {
                [sortBy]: sortType === "desc" ? -1 : 1,
            },
        },

        {
            $skip: (page - 1) * parseInt(limit),
        },

        {
            $limit: parseInt(limit),
        },
    ])

    if (!videos?.length) {
        throw new ApiError(404, "Videos are not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    if (!title || !description) {
        throw new ApiError(400, "Title and Description are needed")
    }

    if (!req.user) {
        throw new ApiError(401, "Login to publish video")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if (!videoLocalPath) {
        throw new ApiError(400, "Video is required")
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }

    const uploadedVideo = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)


    if (!uploadedVideo) {
        throw new ApiError(400, "Cloudinary Error:  Video file is required")
    }

    if (!thumbnail) {
        throw new ApiError(400, "Cloudinary Error: Thumbnail is required")
    }

    const video = await Video.create({
        title,
        videoFile: uploadedVideo.url,
        thumbnail: thumbnail.url,
        owner: req.user._id,

        description,
        duration: uploadedVideo.duration,
        views: 0,
        isPublished: true,

    })

    if (!video) {
        throw new ApiError(500, "something went wrong while uploading the video")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, video, "Video uploaded successfully")
        )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id



    // Validate if the provided videoId is a valid MongoDB ObjectId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Find the video by ID and populate owner details
    const video = await Video.findById(videoId).populate("owner", "name avatar");

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const { title, description } = req.body


    // Step 1: Find the video first
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Step 2: Check if the logged-in user is the owner
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    if (!title && !description && !req.files?.thumbnail) {
        throw new ApiError(400, "At least one field (title, description, thumbnail) must be provided for update");
    }

    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!thumbnail) {
        throw new ApiError(400, "Cloudinary Error: Thumbnail is required")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: thumbnail.url,
                title,
                description
            }

        },
        {
            new: true
        }
    )
    if (!updatedVideo) {
        throw new ApiError(500, "something went wrong while updating the video details")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, updatedVideo, "Video details are updated successfully")
        )


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    // Validate if the provided videoId is a valid MongoDB ObjectId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Find the video
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check if the logged-in user is the owner of the video
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    // Find and delete the video
    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(new ApiResponse(200, deletedVideo, "Video deleted successfully"));

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params


    // Validate if the provided videoId is a valid MongoDB ObjectId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Find the video
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check if the logged-in user is the owner of the video
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to toggle the publish status of this video");
    }




    // Toggle the published status
    video.isPublished = !video.isPublished;
    await video.save();

    return res.status(200).json(new ApiResponse(200, video, "Video publish status toggled successfully"));
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}