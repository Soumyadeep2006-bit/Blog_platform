import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import User from "../models/user.model.js"
import { deleteFromCloudinary } from "../utils/cloudinary.js"
import Follow from "../models/follow.model.js"

const getCurrentUser=asyncHandler(async(req,res)=>{
     return res
  .status(200)
  .json(new ApiResponse(200,req.user,"Current user fetched susccessfully"))
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{

    console.log("hit")
  console.log("body:", req.body)
    const {oldPassword,newPassword}=req.body;

    const user=await User.findById(req.user?._id)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,[],"Invalid old password")
    }

    user.password=newPassword
     await user.save()

      return res
  .status(200)
  .json(new ApiResponse(200,{},"Password changed Successfully"))
})


const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body

    if(!fullName&&!email){
        throw new ApiError(400,"Email and fullname is required")
    }

    const user=await User.findByIdAndUpdate(req.user._id,
    {
      $set:{
        fullName:fullName,
        email:email
      }
    },
  { returnDocument: "after" }
  ).select("-password -refreshToken")

  return res
  .status(200)
  .json(new ApiResponse(200,user,"Acount details updated successfully"))
})


const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path

    if(!avatarLocalPath)
        throw new ApiError(400,"Avatar file is missing");

      const oldAvatarUrl=req.user?.avatar

      const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

     if (oldAvatarUrl) {
  await deleteFromCloudinary(oldAvatarUrl)
}

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {returnDocument: after}
    ).select("-password")

      return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})


const getUserProfile=asyncHandler(async(req ,res )=>{
const {username}=req.params

if(!username?.trim()){
    throw new ApiError(400,[],"Username is missing")
}

const user = await User.findOne({ username }).select("-password -refreshToken -email")

if(!user){
    throw new ApiError(404,"User not found")
}

return res.status(200).json(new ApiResponse(200, user, "User fetched successfully"))
})



const getUserFollowers=asyncHandler(async(req,res)=>{
    const username=req.params?.username
    const userId=await User.findOne({username})?._id

   const followers= await Follow.find({following:userId}).populate("followedBy","username fullName avatar")

    return res.status(200).json( new ApiResponse(200,followers,"User follow list"))

})

const getUserFollowing=asyncHandler(async(req,res)=>{

     const username=req.params?.username
    const userId=await User.findOne({username})?._id

    const following= await Follow.find({followedBy:userId}).populate("following","username fullName avatar")

   
  return res.status(200).json(new ApiResponse(200,following,"User following list"))
})

export {changeCurrentPassword,updateAccountDetails,getCurrentUser,updateUserAvatar,getUserProfile,getUserFollowers,getUserFollowing}