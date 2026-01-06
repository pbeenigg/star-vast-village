/**
 * 公告路由 - 社区公告相关接口
 */
import { Router } from 'express'
import {
  getAnnouncementList,
  getAnnouncementDetail,
  getPinnedAnnouncements,
  getLatestAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '../controllers/announcement.controller'
import { authMiddleware, adminMiddleware } from '../middleware/auth'

const router = Router()

// 公开接口 - 无需登录
router.get('/pinned', getPinnedAnnouncements)
router.get('/latest', getLatestAnnouncements)
router.get('/', getAnnouncementList)
router.get('/:id', getAnnouncementDetail)

// 管理员接口 - 需要登录且为管理员
router.post('/', authMiddleware, adminMiddleware, createAnnouncement)
router.put('/:id', authMiddleware, adminMiddleware, updateAnnouncement)
router.delete('/:id', authMiddleware, adminMiddleware, deleteAnnouncement)

export default router
