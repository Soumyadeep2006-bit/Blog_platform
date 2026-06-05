import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';  
import User from '../models/user.model.js';
import Like from '../models/like.model.js'

const toggleLike=asyncHandler(async(req,res)=>{
const {postId}=req.params
  
const existingLike=await Like.findOne({post:postId,likedBy:req.user._id})

if(existingLike){
    await Like.findByIdAndDelete(existingLike._id)
    return res
    .status(200)
    .json(new ApiResponse(200,null,"Post unliked successfully"))
}

if (!existingLike){
    await Like.create({
        post:postId,
        likedBy:req.user._id
    })
    return res
    .status(200)
    .json(new ApiResponse(200,null,"Post liked successfully"))
}
})

export {toggleLike}