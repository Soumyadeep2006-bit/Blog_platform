import mongoose ,{Schema} from "mongoose"

const postSchema=new mongoose.Schema({
    title:{
       type: String,
       required:true,
    },
    body:{
       type: String,
       required:true,
    },
    coverImage:{
        type:String,
        default:""
    },
   videoUrl:{
    type:String,
    default:""
   },
   slug:{
    type:String,
     required: true,
  unique: true,
  lowercase: true
   },
   author:{
   type:Schema.Types.ObjectId,
    ref:"User",
    required:true
   },
   category:{
   type:Schema.Types.ObjectId,
    ref:"Category"
   },
   tags:{
    type:[String]
   },
   status:{
    type:String,
    enum:["published","scheduled"],
    default:"published"
   },
   scheduledAt:{
    type:Date,
    default:null
   }
    
},{timestamps:true})


const Post=mongoose.model("Post",postSchema)
export default Post