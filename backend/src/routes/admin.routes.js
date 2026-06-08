import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { deleteAnyComment,deleteAnyPost,banUser,VerifyUser } from "../controllers/admin.controller.js"

const router=Routr()
router.delete("/delete-comment/:commentId",verifyJWT,deleteAnyComment)
router.delete("/delete-post/:postId",verifyJWT,deleteAnyPost)
router.post("/ban-user/:userId",verifyJWT,banUser)
router.post("/verify-user/:userId",verifyJWT,VerifyUser)

export default router
