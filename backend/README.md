# TOD社区小程序 - 后端服务

基于 Express 5.x + Supabase + TypeScript 的后端服务。

## 技术栈

- **运行时**: Node.js 22+
- **Web框架**: Express 5.x
- **数据库**: Supabase (PostgreSQL)
- **ORM**: Supabase Client SDK
- **认证**: JWT + Supabase Auth
- **语言**: TypeScript
- **日志**: Winston
- **验证**: Joi

## 项目结构

```
backend/
├── src/
│   ├── config/            # 配置文件
│   │   ├── index.ts      # 主配置
│   │   └── supabase.ts   # Supabase配置
│   ├── middleware/        # 中间件
│   │   ├── auth.ts       # 认证中间件
│   │   ├── validator.ts  # 验证中间件
│   │   └── errorHandler.ts # 错误处理
│   ├── routes/            # 路由
│   │   ├── auth.ts       # 认证路由
│   │   └── index.ts      # 路由汇总
│   ├── controllers/       # 控制器
│   │   └── auth.controller.ts
│   ├── services/          # 服务层
│   ├── utils/             # 工具函数
│   │   ├── response.ts   # 响应格式化
│   │   └── logger.ts     # 日志工具
│   ├── app.ts             # Express应用配置
│   └── server.ts          # 服务器入口
├── package.json
└── tsconfig.json
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.development` 文件并修改配置：

```bash
cp .env.development .env
```

必须配置的环境变量：
- `SUPABASE_URL`: Supabase项目URL
- `SUPABASE_SERVICE_KEY`: Supabase服务密钥
- `JWT_SECRET`: JWT密钥
- `WECHAT_APPID`: 微信小程序AppID
- `WECHAT_SECRET`: 微信小程序Secret

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 启动生产服务

```bash
npm start
```

### 使用PM2部署

```bash
npm run start:pm2
```

### 代码规范

```bash
# 代码检查
npm run lint

# 代码格式化
npm run format
```

### 测试

```bash
# 运行测试
npm run test

# 测试覆盖率
npm run test:coverage
```

## API文档

### 认证接口

#### 登录
- **URL**: `POST /api/auth/login`
- **Body**:
  ```json
  {
    "code": "微信登录code",
    "platform": "weapp"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "token": "JWT token",
      "refreshToken": "refresh token",
      "userInfo": {
        "id": "用户ID",
        "openid": "openid",
        "nickname": "昵称",
        "avatar": "头像",
        "role": "角色",
        "authStatus": "认证状态"
      }
    },
    "message": "登录成功",
    "code": 200
  }
  ```

#### 刷新Token
- **URL**: `POST /api/auth/refresh`
- **Body**:
  ```json
  {
    "refreshToken": "refresh token"
  }
  ```

#### 退出登录
- **URL**: `POST /api/auth/logout`
- **Headers**: `Authorization: Bearer {token}`

### 健康检查
- **URL**: `GET /api/health`
- **Response**:
  ```json
  {
    "success": true,
    "message": "服务正常运行",
    "timestamp": "2024-01-05T08:00:00.000Z"
  }
  ```

## 部署说明

### 使用PM2部署

1. 构建项目
```bash
npm run build
```

2. 启动服务
```bash
pm2 start ecosystem.config.js
```

3. 查看日志
```bash
pm2 logs star-vast-village-backend
```

### 使用Docker部署

```bash
# 构建镜像
docker build -t star-vast-village-backend .

# 运行容器
docker run -d -p 3000:3000 --env-file .env star-vast-village-backend
```

## 注意事项

1. 生产环境必须配置正确的环境变量
2. 确保Supabase数据库已正确配置
3. JWT_SECRET必须使用强密码
4. 定期备份数据库
5. 监控服务器日志和性能指标

## License

MIT
