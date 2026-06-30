import mongoose,{Schema} from "mongoose"

const commentSchema=new mongoose.Schema({
    body:{
        type:String,
        required:true
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    post:{
        type:Schema.Types.ObjectId, 
        ref:"Post",
        required:true
    },
    parent:{
        type:Schema.Types.ObjectId,
        ref:"Comment",
        default:null
    },
    replyingTo:{
        type:Schema.Types.ObjectId,
        ref:"User",
       default:null
    }
},{timestamps:true})

const Comment = mongoose.model("Comment",commentSchema)

export default Comment