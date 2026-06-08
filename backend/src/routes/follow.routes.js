import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {toggleFollow} from "../controllers/follow.controller.js"

const router=Router()
router.post("/:userId/toggle-follow",verifyJWT,toggleFollow)


export default router