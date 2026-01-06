import express, { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { config } from './config'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import routes from './routes'
import { logger } from './utils/logger'

class App {
  public app: Express

  constructor() {
    this.app = express()
    this.initializeMiddlewares()
    this.initializeRoutes()
    this.initializeErrorHandling()
  }

  private initializeMiddlewares() {
    this.app.use(helmet())
    
    this.app.use(
      cors({
        origin: config.allowedOrigins,
        credentials: true
      })
    )

    this.app.use(express.json({ limit: '10mb' }))
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }))
    
    this.app.use(compression())

    if (config.env === 'development') {
      this.app.use(morgan('dev'))
    } else {
      this.app.use(
        morgan('combined', {
          stream: {
            write: (message: string) => logger.info(message.trim())
          }
        })
      )
    }

    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: '请求过于频繁，请稍后再试'
    })
    this.app.use('/api', limiter)
  }

  private initializeRoutes() {
    this.app.use('/api', routes)
  }

  private initializeErrorHandling() {
    this.app.use(notFoundHandler)
    this.app.use(errorHandler)
  }

  public listen(port: number) {
    this.app.listen(port, () => {
      logger.info(`🚀 服务器启动成功，监听端口: ${port}`)
      logger.info(`📝 环境: ${config.env}`)
      logger.info(`🌐 允许的源: ${config.allowedOrigins.join(', ')}`)
    })
  }
}

export default App
