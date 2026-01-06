import { Router } from 'express'
import { UserController } from '@/controllers/user.controller'
import { authMiddleware } from '@/middleware/auth'
import { upload } from '@/middleware/upload'

const router = Router()
const userController = new UserController()

// 所有用户路由都需要认证
router.use(authMiddleware)

// 获取当前用户信息
router.get('/profile', userController.getProfile.bind(userController))

// 更新用户资料
router.put('/profile', userController.updateProfile.bind(userController))

// 提交住户认证
router.post('/certification', userController.submitCertification.bind(userController))

// 获取认证状态
router.get('/certification/status', userController.getCertificationStatus.bind(userController))

// 获取微信手机号
router.post('/wechat-phone', userController.getWechatPhone.bind(userController))

// 绑定手机号
router.post('/bind-phone', userController.bindPhone.bind(userController))

// 发送验证码
router.post('/send-verify-code', userController.sendVerifyCode.bind(userController))

// 上传头像
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar.bind(userController))

export default router
