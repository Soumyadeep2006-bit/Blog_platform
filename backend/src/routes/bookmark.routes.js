import Router from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { toggleUserBookmark } from '../controllers/bookmark.controller.js'


const router=Router()
router.post("/:postId/toggle-bookmark",verifyJWT,toggleUserBookmark)



export default router