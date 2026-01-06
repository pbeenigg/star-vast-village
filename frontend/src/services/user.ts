/**
 * 用户服务模块
 * 提供用户相关的 API 调用方法
 */
import request from '@/utils/request'
import type { ApiResponse, UserInfo, CertificationData, UpdateProfileData } from '@/types'

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<ApiResponse<UserInfo>> {
  return request.get('/api/user/profile')
}

/**
 * 更新用户资料
 * @param data 更新的资料数据
 */
export async function updateProfile(data: UpdateProfileData): Promise<ApiResponse<UserInfo>> {
  return request.put('/api/user/profile', data)
}

/**
 * 提交住户认证申请
 * @param data 认证数据（真实姓名、身份证、住址）
 */
export async function submitCertification(data: CertificationData): Promise<ApiResponse<UserInfo>> {
  return request.post('/api/user/certification', data)
}

/**
 * 获取认证状态
 */
export async function getCertificationStatus(): Promise<ApiResponse<{
  status: 'pending' | 'verified' | 'rejected'
  rejectReason?: string
  submittedAt?: string
  building?: string
  unit?: string
  room?: string
}>> {
  return request.get('/api/user/certification/status')
}

/**
 * 获取微信手机号
 * @param code 微信 getPhoneNumber 获取的 code
 */
export async function getWechatPhone(code: string): Promise<ApiResponse<{ phone: string }>> {
  return request.post('/api/user/wechat-phone', { code })
}

/**
 * 微信登录
 * @param code 微信登录获取的 code
 */
export async function wechatLogin(code: string): Promise<ApiResponse<{
  token: string
  refreshToken: string
  user: UserInfo
}>> {
  return request.post('/api/auth/wechat/login', { code })
}

/**
 * 刷新 Token
 * @param refreshToken 刷新令牌
 */
export async function refreshToken(refreshToken: string): Promise<ApiResponse<{
  token: string
  refreshToken: string
}>> {
  return request.post('/api/auth/refresh', { refreshToken })
}

/**
 * 退出登录
 */
export async function logout(): Promise<ApiResponse<void>> {
  return request.post('/api/auth/logout')
}

/**
 * 上传头像
 * @param filePath 本地文件路径
 */
export async function uploadAvatar(filePath: string): Promise<ApiResponse<{ url: string }>> {
  return request.upload('/api/user/avatar', filePath, 'avatar')
}

// 默认导出
export default {
  getCurrentUser,
  updateProfile,
  submitCertification,
  getCertificationStatus,
  getWechatPhone,
  wechatLogin,
  refreshToken,
  logout,
  uploadAvatar
}
