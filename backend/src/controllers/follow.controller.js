import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import User from "../models/user.model.js"
import Follow from "../models/follow.model.js"

const toggleFollow=asyncHandler(async(req,res)=>{
const {userId}=req.params

if (req.user._id.toString() === userId) {
  throw new ApiError(400, [], "You cannot follow yourself")
}

const existingFollow=await Follow.findOne({followedBy:req.user._id,following:userId})
if( existingFollow){
    await Follow.findByIdAndDelete(existingFollow._id)
    return res
    .status(200)
    .json(new ApiResponse(200,null,"User unfollowed successfully"))
}

else{
    await Follow.create({
        followedBy:req.user._id,
        following:userId
    })
    return res
    .status(200)
    .json(new ApiResponse(200,null,"User followed successfully"))
}
})

export {toggleFollow}