import dotenv from 'dotenv'
import path from 'path'

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
dotenv.config({ path: path.resolve(process.cwd(), envFile) })

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],

  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || ''
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as '7d' | string,
    refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as '30d' | string
  },

  wechat: {
    appId: process.env.WECHAT_APPID || '',
    secret: process.env.WECHAT_SECRET || ''
  },

  xhs: {
    appId: process.env.XHS_APPID || '',
    secret: process.env.XHS_SECRET || ''
  },

  log: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || './logs'
  },

  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10),
    allowedTypes: process.env.UPLOAD_ALLOWED_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ]
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  }
}
