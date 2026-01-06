import { Request, Response, NextFunction } from 'express'
import { ApiError, errorResponse } from '@/utils/response'
import { logger } from '@/utils/logger'

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error('错误处理中间件捕获错误:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  })

  if (err instanceof ApiError) {
    return res.status(err.code).json(errorResponse(err.code, err.message))
  }

  return res.status(500).json(errorResponse(500, '服务器内部错误'))
}

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json(errorResponse(404, '请求的资源不存在'))
}
