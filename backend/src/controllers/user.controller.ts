import { Response } from 'express'
import { AuthRequest } from '@/middleware/auth'
import { supabaseAdmin } from '@/config/supabase'
import { successResponse, errorResponse } from '@/utils/response'
import { logger } from '@/utils/logger'
import { config } from '@/config'
import { encryptData, decryptData } from '@/utils/crypto'
import axios from 'axios'

export class UserController {
  /**
   * 获取当前用户信息
   */
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId

      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !user) {
        return res.status(404).json(errorResponse(404, '用户不存在'))
      }

      return res.json(
        successResponse({
          id: user.id,
          openid: user.openid,
          platform: user.platform,
          nickname: user.nickname,
          avatar: user.avatar,
          phone: user.phone,
          role: user.role,
          authStatus: user.auth_status,
          building: user.building,
          unit: user.unit,
          room: user.room,
          lastLoginAt: user.last_login_at,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        })
      )
    } catch (error: any) {
      logger.error('获取用户信息失败:', error)
      return res.status(500).json(errorResponse(500, '获取用户信息失败'))
    }
  }

  /**
   * 更新用户资料
   */
  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId
      const { nickname, avatar, phone } = req.body

      const updateData: Record<string, any> = {}
      if (nickname !== undefined) updateData.nickname = nickname
      if (avatar !== undefined) updateData.avatar = avatar
      if (phone !== undefined) updateData.phone = phone

      const { data: user, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        logger.error('更新用户资料失败:', error)
        return res.status(500).json(errorResponse(500, '更新失败'))
      }

      return res.json(successResponse(user, '更新成功'))
    } catch (error: any) {
      logger.error('更新用户资料异常:', error)
      return res.status(500).json(errorResponse(500, '更新失败'))
    }
  }

  /**
   * 提交住户认证
   */
  async submitCertification(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId
      const { realName, idCard, building, unit, room, phone } = req.body

      // 验证必填字段
      if (!realName || !idCard || !building || !unit || !room) {
        return res.status(400).json(errorResponse(400, '请填写完整的认证信息'))
      }

      // 验证身份证格式
      const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
      if (!idCardRegex.test(idCard)) {
        return res.status(400).json(errorResponse(400, '身份证号格式不正确'))
      }

      // 加密敏感信息
      const encryptedIdCard = encryptData(idCard)
      const encryptedRealName = encryptData(realName)

      const { data: user, error } = await supabaseAdmin
        .from('users')
        .update({
          id_card_encrypted: encryptedIdCard,
          real_name_encrypted: encryptedRealName,
          building,
          unit,
          room,
          phone: phone || null,
          auth_status: 'pending'
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        logger.error('提交认证失败:', error)
        return res.status(500).json(errorResponse(500, '提交认证失败'))
      }

      logger.info('用户提交认证:', { userId, building, unit, room })

      return res.json(
        successResponse(
          {
            id: user.id,
            authStatus: user.auth_status,
            building: user.building,
            unit: user.unit,
            room: user.room
          },
          '认证申请已提交，请等待审核'
        )
      )
    } catch (error: any) {
      logger.error('提交认证异常:', error)
      return res.status(500).json(errorResponse(500, '提交认证失败'))
    }
  }

  /**
   * 获取认证状态
   */
  async getCertificationStatus(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId

      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('auth_status, building, unit, room, updated_at')
        .eq('id', userId)
        .single()

      if (error || !user) {
        return res.status(404).json(errorResponse(404, '用户不存在'))
      }

      return res.json(
        successResponse({
          status: user.auth_status,
          building: user.building,
          unit: user.unit,
          room: user.room,
          submittedAt: user.updated_at
        })
      )
    } catch (error: any) {
      logger.error('获取认证状态失败:', error)
      return res.status(500).json(errorResponse(500, '获取认证状态失败'))
    }
  }

  /**
   * 获取微信手机号
   */
  async getWechatPhone(req: AuthRequest, res: Response) {
    try {
      const { code } = req.body

      if (!code) {
        return res.status(400).json(errorResponse(400, '缺少 code 参数'))
      }

      // 获取 access_token
      const tokenRes = await axios.get(
        `https://api.weixin.qq.com/cgi-bin/token`,
        {
          params: {
            grant_type: 'client_credential',
            appid: config.wechat.appId,
            secret: config.wechat.secret
          }
        }
      )

      if (tokenRes.data.errcode) {
        logger.error('获取 access_token 失败:', tokenRes.data)
        return res.status(400).json(errorResponse(400, '获取手机号失败'))
      }

      // 获取手机号
      const phoneRes = await axios.post(
        `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${tokenRes.data.access_token}`,
        { code }
      )

      if (phoneRes.data.errcode) {
        logger.error('获取手机号失败:', phoneRes.data)
        return res.status(400).json(errorResponse(400, '获取手机号失败'))
      }

      const phone = phoneRes.data.phone_info.purePhoneNumber

      // 更新用户手机号
      const userId = req.user?.userId
      await supabaseAdmin
        .from('users')
        .update({ phone })
        .eq('id', userId)

      return res.json(successResponse({ phone }, '获取成功'))
    } catch (error: any) {
      logger.error('获取微信手机号异常:', error)
      return res.status(500).json(errorResponse(500, '获取手机号失败'))
    }
  }

  /**
   * 绑定手机号
   */
  async bindPhone(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId
      const { phone, verifyCode } = req.body

      if (!phone || !verifyCode) {
        return res.status(400).json(errorResponse(400, '请输入手机号和验证码'))
      }

      // TODO: 验证验证码（需要接入短信服务）
      // const isValid = await verifyCodeService.verify(phone, verifyCode)
      // if (!isValid) {
      //   return res.status(400).json(errorResponse(400, '验证码错误'))
      // }

      const { data: user, error } = await supabaseAdmin
        .from('users')
        .update({ phone })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        logger.error('绑定手机号失败:', error)
        return res.status(500).json(errorResponse(500, '绑定失败'))
      }

      return res.json(successResponse(user, '绑定成功'))
    } catch (error: any) {
      logger.error('绑定手机号异常:', error)
      return res.status(500).json(errorResponse(500, '绑定失败'))
    }
  }

  /**
   * 发送验证码
   */
  async sendVerifyCode(req: AuthRequest, res: Response) {
    try {
      const { phone } = req.body

      if (!phone) {
        return res.status(400).json(errorResponse(400, '请输入手机号'))
      }

      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(phone)) {
        return res.status(400).json(errorResponse(400, '手机号格式不正确'))
      }

      // TODO: 接入短信服务发送验证码
      // await smsService.sendVerifyCode(phone)

      return res.json(successResponse({ expires: 300 }, '验证码已发送'))
    } catch (error: any) {
      logger.error('发送验证码异常:', error)
      return res.status(500).json(errorResponse(500, '发送失败'))
    }
  }

  /**
   * 上传头像
   */
  async uploadAvatar(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId
      const file = req.file

      if (!file) {
        return res.status(400).json(errorResponse(400, '请选择要上传的图片'))
      }

      // 上传到 Supabase Storage
      const fileName = `${userId}/${Date.now()}.${file.originalname.split('.').pop()}`
      const { error: uploadError } = await supabaseAdmin.storage
        .from('avatars')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype
        })

      if (uploadError) {
        logger.error('上传头像失败:', uploadError)
        return res.status(500).json(errorResponse(500, '上传失败'))
      }

      // 获取公开 URL
      const { data: urlData } = supabaseAdmin.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const avatarUrl = urlData.publicUrl

      // 更新用户头像
      await supabaseAdmin
        .from('users')
        .update({ avatar: avatarUrl })
        .eq('id', userId)

      return res.json(successResponse({ url: avatarUrl }, '上传成功'))
    } catch (error: any) {
      logger.error('上传头像异常:', error)
      return res.status(500).json(errorResponse(500, '上传失败'))
    }
  }
}
