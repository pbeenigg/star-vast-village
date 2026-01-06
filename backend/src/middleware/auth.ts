import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '@/config'
import { supabaseAdmin } from '@/config/supabase'
import { errorResponse } from '@/utils/response'

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        id: string
        openid: string
        role: string
        authStatus: string
      }
    }
  }
}

export interface AuthRequest extends Request {
  user?: {
    userId: string
    id: string
    openid: string
    role: string
    authStatus: string
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json(errorResponse(401, '未提供认证令牌'))
    }

    const decoded = jwt.verify(token, config.jwt.secret, {
      algorithms: ['HS256']
    }) as any

    // 验证 token 类型
    if (decoded.type !== 'access') {
      return res.status(401).json(errorResponse(401, '无效的令牌类型'))
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, openid, role, auth_status')
      .eq('id', decoded.userId)
      .single()

    if (error || !user) {
      return res.status(401).json(errorResponse(401, '用户不存在'))
    }

    req.user = {
      userId: user.id,
      id: user.id,
      openid: user.openid,
      role: user.role,
      authStatus: user.auth_status
    }

    next()
  } catch (error) {
    return res.status(401).json(errorResponse(401, '无效的认证令牌'))
  }
}

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(errorResponse(401, '未认证'))
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(errorResponse(403, '权限不足'))
    }

    next()
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json(errorResponse(401, '未认证'))
  }

  if (req.user.authStatus !== 'approved') {
    return res.status(403).json(errorResponse(403, '用户未通过认证'))
  }

  next()
}

// 导出别名
export const authMiddleware = authenticateToken

// 管理员权限中间件
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json(errorResponse(401, '未认证'))
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json(errorResponse(403, '需要管理员权限'))
  }

  next()
}
