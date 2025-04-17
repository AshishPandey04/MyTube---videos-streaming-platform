import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;




    if (!videoId?.trim()) {
        throw new ApiError(400, "Invalid videoId")
    }

    const comments = await Comment.aggregate([
        {
            $match: {
                video: videoId
            }

        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },

        {
            $unwind: "$user"

        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $facet: {
                comments: [
                    { $skip: (page - 1) * limit },
                    { $limit: limit }
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }
        }


    ])
    const totalPages = Math.ceil(totalCount / limit)



    return res
        .status(200)
        .json(
            new ApiResponse(200, { comments, totalCount, totalPages }, "Comments fetched successfully")
        )


})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}