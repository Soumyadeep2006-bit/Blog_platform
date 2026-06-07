import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { addComment, addReply, deleteComment ,getCommentsByPost} from "../controllers/comment.controller.js"

const router=Router()
router.post("/:postId/add-comment",verifyJWT,addComment)
router.post("/:postId/:commentId/add-reply",verifyJWT,addReply)
router.delete("/:commentId",verifyJWT,deleteComment)
router.get("/:postId/comments",getCommentsByPost)

export default router
