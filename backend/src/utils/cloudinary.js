import dotenv from "dotenv"
dotenv.config({
    path:"./.env"
})

import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


 cloudinary.config({                                            //connects backend to cloudinary account
        cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
        api_key:process.env.CLOUDINARY_API_KEY , 
        api_secret:process.env.CLOUDINARY_API_SECRET
    })

     const uploadOnCloudinary=async(localFilePath)=>{
        try{
            if(!localFilePath) return null
           const response= await cloudinary.uploader.upload(localFilePath,{resource_type:"auto"})

            console.log("File is uploaded on cloudinary",response.url)
             //delete temp file after success
            fs.unlinkSync(localFilePath,(err)=>{
                if(err) console.log("Delete Error:",err)
            })
            return response

        }catch(error){
         console.log("Cloudinary Error:",error)
         //delete temp file after failure too
          fs.unlinkSync(localFilePath, (err) => {
         if(err) console.log("Delete Error:", err)
      })

          return null;
        }
    }


    const deleteFromCloudinary=async(url,resource_type)=>{
        try{
            if(!url) return null
            //if url present then extract publicId from cloudinary URL
            const publicId=url.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(publicId,{resource_type,invalidate:true})
        }catch(error){
            console.log("Cloudinary delete error:",error)
        }
    }

export  {uploadOnCloudinary,deleteFromCloudinary}