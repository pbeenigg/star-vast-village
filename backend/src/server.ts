import App from './app'
import { config } from './config'
import { testDatabaseConnection } from './config/supabase'
import { logger } from './utils/logger'

async function bootstrap() {
  try {
    logger.info('🔄 正在启动服务器...')

    const dbConnected = await testDatabaseConnection()
    if (!dbConnected) {
      logger.error('❌ 数据库连接失败，服务器启动中止')
      process.exit(1)
    }

    const app = new App()
    app.listen(config.port)
  } catch (error) {
    logger.error('服务器启动失败:', error)
    process.exit(1)
  }
}

bootstrap()
