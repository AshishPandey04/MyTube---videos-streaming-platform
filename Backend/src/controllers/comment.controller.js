import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;




    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const videoObjectId = new mongoose.Types.ObjectId(videoId);
    const commentsData = await Comment.aggregate([
        {
            $match: {
                video: videoObjectId
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

                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },

        {
            $unwind: "$owner"

        },
     
        {
            $sort: {
                createdAt: -1
            }
        },

        { 
            $skip: (page - 1) * limit 
        },
        {
             $limit: limit 
        }


    ])
    if (!commentsData?.length) {
        throw new ApiError(404, "Comments are not found");
    }




    return res
        .status(200)
        .json(
            new ApiResponse(200, { commentsData }, "Comments fetched successfully")
        )


})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { content } = req.body;
    const { videoId } = req.params;

    if (!content) {
        throw new ApiError(400, "Comment is required , Cannot be empty")
    }

    if (!videoId) {
        throw new ApiError(400, "Invalid video ID")
    }
    if (!req.user) {
        throw new ApiError(400, "User must be loggedin")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    return res.status(201).json(
        new ApiResponse(201, comment, "Comment added successfully")
    )






})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { content } = req.body;
    const { commentId } = req.params

    if (!content?.trim()) {
        throw new ApiError(400, "Comment cannot be empty or just spaces")
    }
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }


    if (!req.user) {
        throw new ApiError(401, "User must be logged in");
    }


    const updatedComment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: req.user?._id,
        },
        {
            $set: {
                content,
            },
        },
        { new: true }
    );
    if (!updatedComment) {
        throw new ApiError(404, "Comment not found or you're not authorized to update it");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedComment, "Comment successfully updated"));
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const { commentId } = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "INVALID COMMENT ID ")
    }

    if (!req.user) {
        throw new ApiError(401, "User must be logged in");
    }

    const deletedComment = await Comment.findByIdAndDelete({
        _id: commentId,
        owner: req.user?._id
    })

    if (!deletedComment) {
        throw new ApiError(404, "Comment not found or you're not authorized to delete it");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedComment, "Comment deleted successfully")
    )

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}