import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { pipeline } from "stream"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    //TODO: create playlist

    if (!name || !description) {
        throw new ApiError(400, "name and description are required")
    }
    if (!req.user) {
        throw new ApiError(401, "Login to create playlist")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    if (!playlist) {
        throw new ApiError(400, "Something went wrong while creating playlist")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, playlist, "playlist is created successfully")
        )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    if (!isValidObjectId(userId)) {
        throw new ApiError(404, "Invalid User ID")
    }

    const userObjectId = new mongoose.Types.ObjectId(userId)



    if (req.user._id.toString() != userObjectId.toString()) {
        throw new ApiError(401, "Login to get Playlist")
    }

    const allPlaylist = await Playlist.aggregate([
        {
            $match: {
                owner: userObjectId
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            thumbnail: 1,
                            duration: 1,
                            owner: 1,
                            view: 1,
                            createdAt: 1
                        }
                    }
                ]


            }
        },


    ])

    return res.status(200)
        .json(
            new ApiResponse(200, allPlaylist, "All Playlist fetched successfully")
        )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "Invalid playlist ID")
    }
    const playlistObjectId = new mongoose.Types.ObjectId(playlistId)

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: playlistObjectId
            }
        }, {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
            }
        }, {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                        }
                    }

                ]
            }
        },
        {
            $unwind: {
                path: "$owner",
                preserveNullAndEmptyArrays: true // In case owner is missing
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                videos: 1,
                createdAt: 1,
                updatedAt: 1,
                owner: 1
            }
        }
    ])
    if (!playlist) {
        throw new ApiError(400, "something went wrong")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, playlist, "playlist fetched successfully")
        )

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist ID or video ID");
    }

    if (!req.user) {
        throw new ApiError(401, "Login to add video to  playlist")
    }


    const adddedVideoToPlaylist = await Playlist.findOneAndUpdate( // handles string to objectId conversion automatically
        {
            _id: playlistId,
            owner: req.user?._id
        },
        {
            // $push:{
            //     videos:videoId
            // }

            $addToSet: { videos: videoId } // Using addToSet to avoid duplicates
        },
        {
            new: true
        }
    )
    if (!adddedVideoToPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                adddedVideoToPlaylist,
                "Video added to playlist successfully "
            )
        )


})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist ID or video ID");
    }
    if (!req.user) {
        throw new ApiError(401, "Login to remove video from playlist")
    }

    const removedVideoFromPlaylist = await Playlist.findOneAndUpdate( // handles string to objectId conversion automatically
        {
            _id: playlistId,
            owner: req.user?._id
        },
        {
            $pull: {
                videos: videoId
            }


        },
        {
            new: true
        }
    )
    if (!removedVideoFromPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                removedVideoFromPlaylist,
                "Video removed from playlist successfully "
            )
        )


})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "Invalid playlist ID")
    }

    if (!req.user) {
        throw new ApiError(401, "Login to delete playlist")
    }

    const deletedPlaylist = await Playlist.findOneAndDelete({
        _id: playlistId,
        owner: req.user?._id
    })

    if (!deletedPlaylist) {
        throw new ApiError(404, "something went wrong while deleting playlist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedPlaylist,
                "playlist is deleted successfully"
            )
        )


})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "Invalid playlist ID")
    }

    if(!name || !description){
        throw new ApiError(400, "All fields are required")
    }

    if(!req.user){
        throw new ApiError(401,"Login to update Playlist")
    }

    const updatedPlaylist= await Playlist.findOneAndUpdate(
        {
            _id:playlistId,
            owner:req.user._id
        },
        {
            $set:{
                name, 
                description
            }
        },
        {
            new:true
        }
    )

    if(!updatedPlaylist){
        throw new ApiError(404,"Playlist not found or you are not authorized to update it")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "playlist  updated successfully"
        )
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}