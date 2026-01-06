/**
 * 服务层统一导出
 */
export * from './user'
export * from './announcement'
export * from './merchant'
export * from './post'
export * from './repair'

// 默认导出所有服务
import userService from './user'
import * as announcementService from './announcement'
import * as merchantService from './merchant'
import * as postService from './post'
import * as repairService from './repair'

export default {
  user: userService,
  announcement: announcementService,
  merchant: merchantService,
  post: postService,
  repair: repairService
}
