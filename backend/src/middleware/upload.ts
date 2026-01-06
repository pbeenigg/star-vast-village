import multer from 'multer'

// 内存存储（适合上传到云存储）
const storage = multer.memoryStorage()

// 文件过滤器
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // 只允许图片
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('只支持 JPEG、PNG、GIF、WebP 格式的图片'))
  }
}

// 创建 multer 实例
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 9 // 最多9个文件
  }
})
