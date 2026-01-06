import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import { config } from '@/config'
import { supabaseAdmin } from '@/config/supabase'
import { successResponse, errorResponse } from '@/utils/response'
import { logger } from '@/utils/logger'

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { code, platform = 'weapp' } = req.body

      if (!code) {
        return res.status(400).json(errorResponse(400, '缺少登录凭证'))
      }

      let openid = ''
      let sessionKey = ''

      if (platform === 'weapp') {
        const wechatRes = await axios.get(
          `https://api.weixin.qq.com/sns/jscode2session`,
          {
            params: {
              appid: config.wechat.appId,
              secret: config.wechat.secret,
              js_code: code,
              grant_type: 'authorization_code'
            }
          }
        )

        if (wechatRes.data.errcode) {
          logger.error('微信登录失败:', wechatRes.data)
          return res.status(400).json(errorResponse(400, '微信登录失败'))
        }

        openid = wechatRes.data.openid
        sessionKey = wechatRes.data.session_key
      } else if (platform === 'xhs') {
        // TODO: 实现小红书登录逻辑
        return res.status(400).json(errorResponse(400, '暂不支持小红书登录'))
      }

      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('openid', openid)
        .single()

      let user = existingUser

      if (!user) {
        const { data: newUser, error } = await supabaseAdmin
          .from('users')
          .insert({
            openid,
            platform,
            role: 'resident',
            auth_status: 'pending'
          })
          .select()
          .single()

        if (error) {
          logger.error('创建用户失败:', error)
          return res.status(500).json(errorResponse(500, '创建用户失败'))
        }

        user = newUser
      }

      const token = jwt.sign(
        { userId: user.id, openid: user.openid, type: 'access' },
        config.jwt.secret,
        {
          expiresIn: '7d',
          algorithm: 'HS256'
        }
      )

      const refreshToken = jwt.sign(
        { userId: user.id, openid: user.openid, type: 'refresh' },
        config.jwt.secret,
        {
          expiresIn: '30d',
          algorithm: 'HS256'
        }
      )

      logger.info('用户登录成功:', { userId: user.id, openid: user.openid })

      return res.json(
        successResponse(
          {
            token,
            refreshToken,
            userInfo: {
              id: user.id,
              openid: user.openid,
              nickname: user.nickname,
              avatar: user.avatar,
              role: user.role,
              authStatus: user.auth_status
            }
          },
          '登录成功'
        )
      )
    } catch (error: any) {
      logger.error('登录异常:', error)
      return res.status(500).json(errorResponse(500, '登录失败'))
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        return res.status(400).json(errorResponse(400, '缺少刷新令牌'))
      }

      const decoded = jwt.verify(refreshToken, config.jwt.secret, {
        algorithms: ['HS256']
      }) as any

      // 验证 token 类型
      if (decoded.type !== 'refresh') {
        return res.status(401).json(errorResponse(401, '无效的刷新令牌类型'))
      }

      const token = jwt.sign(
        { userId: decoded.userId, openid: decoded.openid, type: 'access' },
        config.jwt.secret,
        {
          expiresIn: '7d',
          algorithm: 'HS256'
        }
      )

      return res.json(successResponse({ token }, '刷新成功'))
    } catch (error) {
      return res.status(401).json(errorResponse(401, '无效的刷新令牌'))
    }
  }

  async logout(req: Request, res: Response) {
    return res.json(successResponse(null, '退出登录成功'))
  }
}
