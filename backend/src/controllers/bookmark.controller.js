import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import Bookmark from "../models/bookmark.model.js"

const toggleUserBookmark=asyncHandler(async(req,res)=>{
    const {postId} =req.params

    const existingBookmark=await Bookmark.findOne({post:postId,bookmarkedBy:req.user._id })

    if(existingBookmark){

        await Bookmark.findByIdAndDelete(existingBookmark._id)
        return res
        .status(200)
        .json(new ApiResponse(200,null,"Post removed from bookmarks successfully")) 

    }

    else{          
        await Bookmark.create({ 
            post:postId,
            bookmarkedBy:req.user._id
        })
        return res  
        .status(200)
        .json(new ApiResponse(200,null,"Post added to bookmarks successfully"))
    }
})

export {toggleUserBookmark}