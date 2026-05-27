import mongoose from "mongoose"
const {Schema}=mongoose

const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
   password:{
      type:String,
      required:[true,"Passwod is required"]
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    bio:{
        type:String,
        default:""
    },
    avatar:{
        type:String,
        default:""
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    isBanned: {
  type: Boolean,
  default: false
},
    refreshToken:{
        type:String,
    }
},{timestamps:true})

const User=mongoose.model("User",userSchema)

export default User
