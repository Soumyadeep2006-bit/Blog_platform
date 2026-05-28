import { Router } from "express"
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken
} from "../controllers/auth.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router()

router.post("/register",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  registerUser
)

router.post("/login", loginUser)
router.post("/logout", verifyJWT, logoutUser)
router.post("/refresh-token", refreshAccessToken)

export default router