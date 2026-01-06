import { Router } from 'express'
import authRoutes from './auth'
import userRoutes from './user'
import announcementRoutes from './announcement'
import merchantRoutes from './merchant'
import postRoutes from './post'
import repairRoutes from './repair'

const router = Router()

router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/announcements', announcementRoutes)
router.use('/merchants', merchantRoutes)
router.use('/posts', postRoutes)
router.use('/repairs', repairRoutes)

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务正常运行',
    timestamp: new Date().toISOString()
  })
})

export default router
