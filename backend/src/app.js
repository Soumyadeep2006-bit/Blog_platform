import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.routes.js"

const app =express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true             
}))

app.use(express.json({limit:"16kb"}))

app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


app.use("/api/v1/users", userRouter)

import authRouter from "./routes/auth.routes.js"
app.use("/api/v1/auth",authRouter)

import postRouter from "./routes/post.routes.js"
app.use("/api/v1/posts",postRouter)

import commentRouter from "./routes/comment.routes.js"
app.use("/api/v1/comments",commentRouter)


import bookmarkRouter from "./routes/bookmark.routes.js"
app.use("/api/v1/bookmarks",bookmarkRouter) 

import likeRouter from "./routes/like.routes.js"
app.use("/api/v1/likes",likeRouter)


export default app