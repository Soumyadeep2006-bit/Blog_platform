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
    const reply=await Comment.create({
        body:body,
        post:postId,
        author:req.user._id,
        parent:commentId
    })
    const populatedReply = await Comment.findById(reply._id)
    .populate("author", "fullName avatar")

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

const getCommentsByPost=asyncHandler(async(req,res)=>{
    const {postId}=req.params
    const postObjectId = new mongoose.Types.ObjectId(postId)
    const page=parseInt(req.query.page)||1
    const limit=parseInt(req.query.limit)||10
    const skip=(page-1)*limit

    const totalComments = await Comment.countDocuments({
  post: postId,
  parent: null
})
const totalPages = Math.ceil(totalComments / limit)

    const comments=  await Comment.aggregate([
        {$match:{post: postObjectId,parent:null}},
        {$lookup:{
            from:"users",
            localField:"author",
            foreignField:"_id",
            as:"author"
        }},
        {$unwind:"$author"},
        {$lookup:{
            from:"comments",
            localField:"_id",
            foreignField:"parent",
            as:"replies"
        }},
        {$sort:{createdAt:-1}},
        { $skip: skip },
        { $limit: limit }
    ])

    return res
    .status(200)
    
    .json(new ApiResponse(200,{comments,pagination: { currentPage: page, totalPages, totalComments }}
  ,"Comments fetched successfully"))
})


export {addComment,addReply,deleteComment,getCommentsByPost}