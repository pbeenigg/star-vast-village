/**
 * 商家路由 - 商家黄页相关接口
 */
import { Router } from 'express'
import {
  getMerchantList,
  getMerchantDetail,
  getHotMerchants,
  searchMerchants
} from '../controllers/merchant.controller'

const router = Router()

// 公开接口 - 无需登录
router.get('/hot', getHotMerchants)
router.get('/search', searchMerchants)
router.get('/', getMerchantList)
router.get('/:id', getMerchantDetail)

export default router
