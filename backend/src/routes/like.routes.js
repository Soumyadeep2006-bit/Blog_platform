import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {toggleLike} from "../controllers/like.controller.js"

const router=Router()
router.post("/:postId/toggle-like",verifyJWT,toggleLike)

export default router