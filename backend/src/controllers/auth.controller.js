import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const generateAccessAndRefreshToken=async(userId)=>{
    try{
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const newRefreshToken=user.generateRefreshToken()
        user.refreshToken=newRefreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,newRefreshToken}
    }catch(err){
        console.log("REAL ERROR:", err)
        throw new ApiError(500,[],"Something went wrong while generating access and refresh Tokens ")

    }
}


const registerUser=asyncHandler(async(req,res)=>{
    const {username,fullName,password,email}=req.body

    if([username,fullName,password,email].some((field)=>
       (field?.trim()===""))){
        throw new ApiError(400,[],"All fields are required ")
    }
    const existedUser=await User.findOne({$or:[{username},{email}]})

    if(existedUser){
        throw new ApiError(409,[],"User with this email and username already exists")
    }

   const avatarLocalPath = req.files?.avatar?.[0]?.path
const avatar = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : null


    
    const user=await User.create({
        fullName,
        username,
        avatar:avatar?.url||"",
        email,
        password
    })

    const createdUser=await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500,[],"Error occured while registering the user ")
    }


    return res.status(201).json(new ApiResponse(201,createdUser,"User registered successfully"))

})

const loginUser=asyncHandler(async(req,res)=>{
    const {email,username,password}=req.body

    if(!(username||email)||!password){
        throw new ApiError(400,"username or email and password is required")
    }

        const user=await User.findOne({$or:[{username},{email}]})
    
         if(!user){
            throw new ApiError(404,[],"User does not exist")
         }


         const isPasswordValid=await user.isPasswordCorrect(password)

         if(!isPasswordValid){
            throw new ApiError(401,[],"Invalid user credentials")
         }

         const {accessToken,newRefreshToken}=await generateAccessAndRefreshToken(user._id)
         const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

         const options={
            httpOnly:true,
            secure:false,
            sameSite: "strict"
         }

         return res
         .status(200)
         .cookie("accessToken",accessToken,options)
         .cookie("refreshToken",newRefreshToken,options)
         .json(new ApiResponse(200,{user:loggedInUser,accessToken,newRefreshToken},"User Logged in successfully")
        )

})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            returnDocument: "after" 
        }
    )

    const options={
        httpOnly:true,
        secure:false,

    }

    return res
    .status(200)
    .clearCookie("refreshToken",options)
    .clearCookie("accessToken",options)
    .json(new ApiResponse(200,{},"User logged out successfully"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,[],"unauthorized request")
    }

    try{
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

        const user=await User.findById(decodedToken?._id)
        
        if(!user){
            throw new ApiError(401,[],"Invalid refresh Token")
        }

        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,[],"Refresh Token is used or expired ")
        }

        const options={
            httpOnly:true,
            secure:false,
            sameSite:"strict"
        }

        const {accessToken,newRefreshToken}=await generateAccessAndRefreshToken(user._id)
        return res 
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(new ApiResponse(200,{accessToken,refreshToken:newRefreshToken},"Access token refreshed"))
    }
    catch(error){
        throw new ApiError(401,[],error?.message||"Invalid refreshToken")
    }
})

export {registerUser,loginUser,refreshAccessToken,logoutUser}