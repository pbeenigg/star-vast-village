/**
 * 报修路由 - 在线报修相关接口
 */
import { Router } from 'express'
import {
  getMyRepairs,
  getRepairDetail,
  createRepair,
  cancelRepair,
  rateRepair
} from '../controllers/repair.controller'
import { authMiddleware } from '../middleware/auth'

const router = Router()

// 所有接口都需要登录
router.use(authMiddleware)

router.get('/my', getMyRepairs)
router.get('/:id', getRepairDetail)
router.post('/', createRepair)
router.post('/:id/cancel', cancelRepair)
router.post('/:id/rate', rateRepair)

export default router
