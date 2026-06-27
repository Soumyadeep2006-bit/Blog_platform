import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { deleteAnyComment,deleteAnyPost,banUser,verifyUser } from "../controllers/admin.controller.js"

const router=Router()
router.delete("/delete-comment/:commentId",verifyJWT,deleteAnyComment)
router.delete("/delete-post/:postId",verifyJWT,deleteAnyPost)
router.post("/ban-user/:userId",verifyJWT,banUser)
router.post("/verify-user/:userId",verifyJWT,verifyUser)

export default router
