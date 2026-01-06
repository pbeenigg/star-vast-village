import winston from 'winston'
import path from 'path'
import { config } from '@/config'

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
)

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`
    }
    return msg
  })
)

export const logger = winston.createLogger({
  level: config.log.level,
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(config.log.dir, 'error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(config.log.dir, 'combined.log')
    })
  ]
})

if (config.env !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat
    })
  )
}
