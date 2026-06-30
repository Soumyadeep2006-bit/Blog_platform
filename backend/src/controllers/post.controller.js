import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import User from '../models/user.model.js';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';
import slugify from "slugify"
import Post from "../models/post.model.js"


const createPost=asyncHandler(async(req,res)=>{
  
    const {title,body,category,tags,status,scheduledAt}=req.body
    
    if(!title||!body)
    {
        throw new ApiError(400,[],"Title and body are required")
    }

    if(status==="scheduled"&&!scheduledAt){
        throw new ApiError(400,[],"Scheduled time is required for scheduled posts")
    }

    const slug=slugify(title,{lower:true,strict:true})+"-"+Date.now()

    let coverImage=""
    if(req.file){
        const uploadedImage=await uploadOnCloudinary(req.file.path)
        if(!uploadedImage?.url){
            throw new ApiError(400,[],"Cover image upload failed")
        }

        coverImage=uploadedImage.url

    }


    const post= await Post.create({
        title,
        body,
        category,
        tags,
        status,
        scheduledAt,
        slug,
        coverImage:coverImage,
        author:req.user._id
        })
        await post.populate("author")

        return res.status(201).json(new ApiResponse(201,post,"Post created successfully"))

    })

    const getPost=asyncHandler(async(req,res)=>{
    const {slug}=req.params
    const post=await Post.findOne({slug})
    .populate("author")
    if(!post){
    throw new ApiError(404,[],"Post not found")
    }
    return res.status(200).json(new ApiResponse(200,post,"Post fetched successfully"))  

    })


    const getAllPosts=asyncHandler(async(req,res)=>{
       const page=parseInt(req.query.page) || 1
       const limit=parseInt(req.query.limit) || 10
       const skip=(page-1)*limit

       const posts=await Post.find({status:"published"})
       .populate("author","username fullName avatar")
       .populate("category","name slug")
       .sort({createdAt:-1})
         .skip(skip)
            .limit(limit)

    const totalPosts=await Post.countDocuments({status:"published"})
    const totalPages=Math.ceil(totalPosts/limit)

    return res
    .status(200)
    .json(new ApiResponse(200,{posts,pagination:{ currentPage: page,
        totalPages,
        totalPosts,
        postsPerPage: limit
    }},"Posts fetched successfully"))
    })


    const getPostsByUser=asyncHandler(async(req ,res)=>{
         const page=parseInt(req.query.page)||1
        const limit=parseInt(req.query.limit)||10
        const skip=(page-1)*limit

        const {username}=req.params
        const user=await User.findOne({username})

        if(!user){
            throw new ApiError(404,[],"User not found")
        }
        const postsByUser=await Post.find({author:user._id,status:"published"})
        .populate("author","username fullName avatar")
        .populate("category","name slug")
        .sort({createdAt:-1})
         .skip(skip)
            .limit(limit)

        const totalPostsByUser=await Post.countDocuments({author:user._id,status:"published"})
        const totalPagesByUser=Math.ceil(totalPostsByUser/limit)
        
        return res.status(200).json(new ApiResponse(200,{posts:postsByUser,pagination:{currentPage:page,totalPages:totalPagesByUser,totalPosts:totalPostsByUser,postsPerPage:limit}},"Posts fetched successfully"))
    })

    const updatePost=asyncHandler(async(req,res)=>{
     const {postId}=req.params

     const post=await Post.findById(postId) 
     if(post.author.toString()!==req.user._id.toString()){
        throw new ApiError(403,[],"You are not authorized to update this post")
     }

     const {title,body,category,tags,status,scheduledAt}=req.body
     const updateData={title,body,category,tags,status,scheduledAt} 

     let coverImage=post.coverImage
     if(req.file){
        const uploadedImage=await uploadOnCloudinary(req.file?.path)


 if(!uploadedImage?.url){
            throw new ApiError(400,[],"Cover image upload failed")
        }
        updateData.coverImage = uploadedImage.url
     }
    
     const updatedPost=await Post.findByIdAndUpdate(postId,updateData,{returnDocument:"after"})
        
     const oldCoverImage=post.coverImage
     if(req.file && oldCoverImage){
        await deleteFromCloudinary(oldCoverImage)
     }
     await post.populate("author")  
await post.populate("category")

     return res.status(200).json(new ApiResponse(200,updatedPost,"Post updated successfully"))

    })

    const deletePost=asyncHandler(async(req,res)=>{
        const {postId}=req.params
        const post=await Post.findById(postId)

        if(post.author.toString()!==req.user._id.toString()){
            throw new ApiError(403,[],"You are not authorized to delete this post")
        }

        if(post.coverImage){
            await deleteFromCloudinary(post.coverImage)
        }

        const deletedPost=await Post.findByIdAndDelete(postId)

        return res.status(200).json(new ApiResponse(200,deletedPost,"Post deleted successfully"))
    })

export {createPost,getPost,getAllPosts,getPostsByUser,updatePost,deletePost}