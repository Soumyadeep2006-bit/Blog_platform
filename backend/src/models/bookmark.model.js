import mongoose,{Schema} from "mongoose"

const bookmarkSchema=new mongoose.Schema({
    bookmarkedBy:{
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

bookmarkSchema.index({ post: 1, bookmarkedBy: 1 }, { unique: true })

const Bookmark=mongoose.model("Bookmark",bookmarkSchema)

export default Bookmark