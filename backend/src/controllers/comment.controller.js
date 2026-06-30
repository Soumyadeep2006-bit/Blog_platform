import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import User from '../models/user.model.js';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';
import Comment from '../models/comment.model.js'
import mongoose from "mongoose"


const addComment=asyncHandler(async(req,res)=>{
    const {postId}=req.params
    const {body}=req.body
    if (!body?.trim()) {
  throw new ApiError(400, [], "Comment content is required")
}
    
    const comment=await Comment.create({
        body:body,
        post:postId,
        author:req.user._id
    })

     const populatedComment = await Comment.findById(comment._id)
    .populate("author", "fullName avatar")

    return res
    .status(201)
    .json(new ApiResponse(201,populatedComment,"Comment added successfully"))

})


const addReply=asyncHandler(async(req,res)=>{
    const {commentId,postId}=req.params
    const {body}=req.body
    if (!body?.trim()) {
  throw new ApiError(400, [], "Reply content is required")
}

// Get parent comment to know who they're replying to
  const parentComment = await Comment.findById(commentId)

    const reply=await Comment.create({
        body:body,
        post:postId,
        author:req.user._id,
        parent:commentId,
        replyingTo: parentComment.author
    })
    const populatedReply = await Comment.findById(reply._id)
    .populate("author", "fullName avatar username")
    .populate("replyingTo","username fullname avatar")

    return res
    .status(201)
    .json(new ApiResponse(201,populatedReply,"Reply added successfully"))
})


const deleteComment=asyncHandler(async(req,res)=>{
    const {commentId}=req.params
    const comment=await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404,[],"Comment not found")
    }   
    if(comment.author.toString()!==req.user._id.toString()){
        throw new ApiError(403,[],"You are not authorized to delete this comment")
    }
    await Comment.findByIdAndDelete(commentId)
    await Comment.deleteMany({parent:commentId})

    return res
    .status(200)
    .json(new ApiResponse(200,null,"Comment and its replies deleted successfully"))
})

const getCommentsByPost = asyncHandler(async (req, res) => {
  const { postId } = req.params
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  // Fetch ALL comments for this post (don't limit yet)
  const allComments = await Comment.find({ post: postId })
    .populate("author", "fullName avatar isVerified username") 
    .populate("replyingTo", "username fullName avatar")
    .sort({ createdAt: -1 })

  // Organize into parent-child tree
  const commentMap = new Map()
  const rootComments = []

  allComments.forEach((comment) => {
    commentMap.set(comment._id.toString(), {
      ...comment.toObject(),
      replies: []
    })
  })

  allComments.forEach((comment) => {
    if (comment.parent) {
      const parent = commentMap.get(comment.parent.toString())
      if (parent) {
        parent.replies.push(commentMap.get(comment._id.toString()))
      }
    } else {
      rootComments.push(commentMap.get(comment._id.toString()))
    }
  })

  // Paginate root comments
  const totalComments = rootComments.length
  const totalPages = Math.ceil(totalComments / limit)
  const paginatedComments = rootComments.slice(skip, skip + limit)

  return res.status(200).json(
    new ApiResponse(
      200,
      { comments: paginatedComments, pagination: { currentPage: page, totalPages, totalComments } },
      "Comments fetched successfully"
    )
  )
})

export {addComment,addReply,deleteComment,getCommentsByPost}