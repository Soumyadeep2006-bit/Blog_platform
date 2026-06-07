import {Router} from "express"
import { createPost, deletePost, getAllPosts, getPostsByUser, updatePost,getPost } from "../controllers/post.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router=Router()

router.post("/create",verifyJWT,upload.single("image"),createPost)

router.get("/all",getAllPosts)
router.get("/user/:username",getPostsByUser)
router.get("/:slug",getPost)
router.put("/:postId",verifyJWT,upload.single("image"),updatePost)

router.delete("/:postId",verifyJWT,deletePost)


export default router