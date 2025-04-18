import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist

    if(!name || !description){
        throw new ApiError(400,"name and description are required")
    }
    if(!req.user){
        throw new ApiError(401,"Login to create playlist")
    }

    const playlist=await Playlist.create({
        name,
        description,
        owner:req.user?._id
    })

    if(!playlist){
        throw new ApiError(400,"Something went wrong while creating playlist")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,playlist,"playlist is created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!isValidObjectId(userId)){
        throw new ApiError(404,"Invalid User ID")
    }

    const userObjectId=new mongoose.Types.ObjectId(userId)

 

    if(req.user._id.toString()!=userObjectId.toString()){
        throw new ApiError(401,"Login to get Playlist")
    }

    const allPlaylist=await Playlist.aggregate([
        {
            $match:{
                owner:userObjectId
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos",
                pipeline:[
                    {
                        $project:{
                            _id:1,
                            title:1,
                            thumbnail:1,
                            duration:1,
                            owner:1,
                            view:1,
                            createdAt:1
                        }
                    }
                ]


            }
        },
      

    ])

    return res.status(200)
    .json(
        new ApiResponse(200,allPlaylist,"All Playlist fetched successfully")
    )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
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