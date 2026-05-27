import mongoose,{Schema} from "mongoose"

const likeSchema=new mongoose.Schema({
    likedBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    post:{
        type:Schema.Types.ObjectId,
        ref:"Post",
        required:true
    }
}, {
    timestamps:true
})

likeSchema.index({ post: 1, likedBy: 1 }, { unique: true })

const Like=mongoose.model("Like",likeSchema)

export default Like