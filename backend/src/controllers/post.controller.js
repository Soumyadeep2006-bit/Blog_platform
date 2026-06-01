import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import User from '../models/user.model.js';
import { deleteFromCloudinary, uploadToCloudinary } from '../utils/cloudinary.js';


const createPost=asyncHandler(async(req,res)=>{
    const {title,body,category,tags,status,scheduledAt}=req.body
    
    if(!title||!body)
    {
        throw new ApiError(400,"Title and body are required")
    }

    if(status==="scheduled"&&!scheduledAt){
        throw new ApiError(400,"Scheduled time is required for scheduled posts")
    }

    const slug=slugify(title,{lower:true,strict:true})+"-"+Date.now()

    const coverImage=req.file
})