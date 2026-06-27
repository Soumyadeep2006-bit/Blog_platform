import {asyncHandler} from "../utils/asyncHandler.js"  
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import User from "../models/user.model.js"
import { deleteFromCloudinary } from "../utils/cloudinary.js"

const deleteAnyPost=asyncHandler(async(req,res)=>{
    const {postId}=req.params
    const post=await Post.findById(postId)
    if(!post){
        throw new ApiError(404,[],"Post not found")
    }   
    const coverImage=post.coverImage
    if(coverImage){
        await deleteFromCloudinary(coverImage)
    }   
    await Post.findByIdAndDelete(postId)
    return res.status(200).json(new ApiResponse(200,null,"Post deleted successfully"))
})


const deleteAnyComment=asyncHandler(async(req,res)=>{
    const {commentId}=req.params
    const comment=await Comment.findById(commentId) 
    if(!comment){   
        throw new ApiError(404,[],"Comment not found")
    }   
    await Comment.deleteMany({parent:commentId})
    await Comment.findByIdAndDelete(commentId)
    return res.status(200).json(new ApiResponse(200,null,"Comment and its replies deleted successfully"))

})

const banUser=asyncHandler(async(req,res)=>{
    const {userId}=req.params
    const updatedUser=await User.findByIdAndUpdate(userId,{isBanned:true},{returnDocument:"after"})
    return res.status(200).json(new ApiResponse(200,null,"User banned successfully"))
})

const verifyUser=asyncHandler(async(req,res)=>{
    const {userId}=req.params
    const updatedUser=await User.findByIdAndUpdate(userId,{isVerified:true},{returnDocument:"after"})
    return res.status(200).json(new ApiResponse(200,null,"User verified successfully"))
})


const manageCategories=asyncHandler(async(req,res)=>{

})

export {deleteAnyPost,deleteAnyComment,banUser,verifyUser,manageCategories}