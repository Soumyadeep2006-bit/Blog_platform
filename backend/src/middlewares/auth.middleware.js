 import User from "../models/user.model.js"
 import jwt from "jsonwebtoken"
 import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
 


 export const verifyJWT =asyncHandler(async(req,res ,next )=>{
  try{
    const token=req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","")

    if(!token){
        throw new ApiError(401,[],"Unauthorized request")
    }

    const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

  const user=await User.findById(decodedToken?._id).select("-password -refreshToken")

  if(!user){
    throw new ApiError(401,[],"Invalid access Token")
  }

  req.user=user
  next()
  }catch(error){
    throw new ApiError(401,[],error?.message||"Invalid Access Token")
  }
 })


 export const isAdmin=asyncHandler(async(req,res,next)=>{
    
    const user=req.user
    if(user.role==="admin")
        next()
    else {
        throw new ApiError(403,[],"Access denied , Admins only")
    }
 })