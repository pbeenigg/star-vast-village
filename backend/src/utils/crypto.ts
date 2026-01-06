import crypto from 'crypto'
import { config } from '@/config'

// 获取加密密钥（从环境变量或配置）
const getEncryptionKey = (): Buffer => {
  const key = config.encryption?.key || process.env.ENCRYPTION_KEY || 'default-encryption-key-32bytes!!'
  // 确保密钥是32字节（256位）
  return Buffer.from(key.padEnd(32, '0').slice(0, 32))
}

const IV_LENGTH = 16 // AES 块大小

/**
 * 加密敏感数据
 * @param text 要加密的文本
 * @returns 加密后的字符串（IV:加密数据）
 */
export function encryptData(text: string): string {
  if (!text) return ''
  
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', getEncryptionKey(), iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return iv.toString('hex') + ':' + encrypted
}

/**
 * 解密敏感数据
 * @param encryptedText 加密的字符串
 * @returns 解密后的原文
 */
export function decryptData(encryptedText: string): string {
  if (!encryptedText) return ''
  
  const parts = encryptedText.split(':')
  if (parts.length !== 2) {
    throw new Error('无效的加密数据格式')
  }
  
  const iv = Buffer.from(parts[0], 'hex')
  const encrypted = parts[1]
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', getEncryptionKey(), iv)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

/**
 * 哈希数据（不可逆，用于敏感数据比对）
 * @param text 要哈希的文本
 * @returns 哈希值
 */
export function hashData(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex')
}

/**
 * 脱敏手机号
 * @param phone 手机号
 * @returns 脱敏后的手机号（138****1234）
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length !== 11) return phone
  return phone.slice(0, 3) + '****' + phone.slice(7)
}

/**
 * 脱敏身份证号
 * @param idCard 身份证号
 * @returns 脱敏后的身份证号
 */
export function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 15) return idCard
  return idCard.slice(0, 6) + '********' + idCard.slice(-4)
}

/**
 * 脱敏姓名
 * @param name 姓名
 * @returns 脱敏后的姓名
 */
export function maskName(name: string): string {
  if (!name) return name
  if (name.length === 2) {
    return name[0] + '*'
  }
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
}
