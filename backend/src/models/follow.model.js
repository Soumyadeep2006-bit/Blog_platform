import mongoose,{Schema} from "mongoose"

const followSchema=new mongoose.Schema({
    followedBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    following:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
}, {
    timestamps:true
})

followSchema.index({ followedBy: 1, following: 1 }, { unique: true })

const Follow=mongoose.model("Follow",followSchema)

export default Follow