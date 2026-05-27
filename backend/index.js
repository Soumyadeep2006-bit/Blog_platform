import dotenv from "dotenv"
import app from "./src/app.js"
import connectDB from "./src/db/index.js"

dotenv.config()
const PORT=process.env.PORT||3000

connectDB()
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server running at port ${PORT}` )
    })
})
.catch((err)=>{
    console.log("Server failed to start",err.stack)
})

