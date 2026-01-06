/**
 * 帖子路由 - 邻里互助相关接口
 */
import { Router } from 'express'
import {
  getPostList,
  getPostDetail,
  createPost,
  updatePost,
  deletePost,
  likePost,
  resolvePost
} from '../controllers/post.controller'
import { authMiddleware } from '../middleware/auth'

const router = Router()

// 公开接口 - 无需登录
router.get('/', getPostList)
router.get('/:id', getPostDetail)

// 需要登录的接口
router.post('/', authMiddleware, createPost)
router.put('/:id', authMiddleware, updatePost)
router.delete('/:id', authMiddleware, deletePost)
router.post('/:id/like', authMiddleware, likePost)
router.post('/:id/resolve', authMiddleware, resolvePost)

export default router
