import {Router} from "express"
import {getUserProfile, updateUserAvatar,changeCurrentPassword,getUserFollowers,getUserFollowing,getCurrentUser,updateAccountDetails} from "../controllers/user.controller.js"

import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router=Router()

router.get("/profile/:username",getUserProfile)
router.put("/avatar",verifyJWT,upload.single("avatar"),updateUserAvatar)
router.put("/change-password",verifyJWT,changeCurrentPassword)    
router.get("/me",verifyJWT,getCurrentUser)
router.put("/update",verifyJWT,updateAccountDetails)
router.get("/:username/followers",getUserFollowers)
router.get("/:username/following",getUserFollowing)

export default router