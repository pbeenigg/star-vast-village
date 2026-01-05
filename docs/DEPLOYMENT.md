# TOD社区小程序 - 部署指南

本文档详细说明如何部署TOD社区小程序的前端和后端服务。

---

## 一、环境准备

### 1.1 开发环境要求

- **Node.js**: 22.x LTS 或更高版本
- **npm**: 10.x 或更高版本（或使用 pnpm/yarn）
- **Git**: 2.x 或更高版本
- **微信开发者工具**: 最新稳定版
- **小红书开发者工具**: 最新稳定版（如需部署小红书小程序）

### 1.2 账号准备

#### 微信小程序
1. 注册微信小程序账号：https://mp.weixin.qq.com/
2. 完成小程序认证（企业认证，费用 ¥300/年）
3. 获取 AppID 和 AppSecret
4. 配置服务器域名白名单

#### 小红书小程序
1. 注册小红书开放平台账号
2. 创建小程序应用
3. 获取 AppID 和 AppSecret
4. 配置服务器域名白名单

#### Supabase
1. 注册 Supabase 账号：https://supabase.com/
2. 创建新项目
3. 获取项目 URL 和 API Keys
4. 配置数据库和存储

---

## 二、Supabase 配置

### 2.1 创建 Supabase 项目

1. 登录 Supabase Dashboard
2. 点击 "New Project"
3. 填写项目信息：
   - **Name**: star-vast-village
   - **Database Password**: 设置强密码
   - **Region**: 选择离用户最近的区域（建议：Singapore 或 Tokyo）
4. 等待项目创建完成（约 2 分钟）

### 2.2 配置数据库

#### 2.2.1 执行数据库初始化脚本

1. 进入 Supabase Dashboard
2. 点击左侧菜单 "SQL Editor"
3. 点击 "New Query"
4. 复制 `DATABASE_SCHEMA.md` 中的 SQL 脚本
5. 执行脚本创建所有表和索引

#### 2.2.2 配置 Row Level Security (RLS)

```sql
-- 为每个表启用 RLS 并配置策略
-- 详见 DATABASE_SCHEMA.md 第四节
```

### 2.3 配置 Storage

1. 进入 "Storage" 菜单
2. 创建以下存储桶（Buckets）：

```
avatars          # 用户头像
announcements    # 公告图片
merchants        # 商家图片
posts            # 帖子图片
repairs          # 报修图片
groupbuy         # 团购图片
receipts         # 财务凭证
```

3. 配置存储桶策略：

```sql
-- 示例：公告图片存储桶策略
CREATE POLICY "公告图片公开读取"
ON storage.objects FOR SELECT
USING (bucket_id = 'announcements');

CREATE POLICY "管理员可上传公告图片"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'announcements' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'volunteer')
  )
);
```

### 2.4 获取 API 密钥

1. 进入 "Settings" > "API"
2. 记录以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: 用于客户端
   - **service_role key**: 用于服务端（保密）

---

## 三、后端部署

### 3.1 项目初始化

```bash
# 克隆项目
git clone https://github.com/your-org/star-vast-village-backend.git
cd star-vast-village-backend

# 安装依赖
npm install

# 复制环境变量配置
cp .env.example .env
```

### 3.2 配置环境变量

编辑 `.env` 文件：

```env
# 服务器配置
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://your-domain.com,https://servicewechat.com

# Supabase 配置
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# JWT 配置
JWT_SECRET=your_jwt_secret_key_min_32_characters
JWT_EXPIRES_IN=7d

# 微信小程序配置
WECHAT_APPID=wx_your_appid
WECHAT_SECRET=your_wechat_secret

# 小红书小程序配置
XHS_APPID=xhs_your_appid
XHS_SECRET=your_xhs_secret

# AI 服务配置（可选）
TENCENT_SECRET_ID=your_tencent_secret_id
TENCENT_SECRET_KEY=your_tencent_secret_key

# 日志配置
LOG_LEVEL=info
LOG_DIR=./logs
```

### 3.3 构建项目

```bash
# TypeScript 编译
npm run build

# 检查构建结果
ls -la dist/
```

### 3.4 部署方式选择

#### 方式一：使用 PM2 部署（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs star-vast-village-backend

# 设置开机自启
pm2 startup
pm2 save
```

**ecosystem.config.js 配置**：

```javascript
module.exports = {
  apps: [{
    name: 'star-vast-village-backend',
    script: './dist/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    max_memory_restart: '500M',
    autorestart: true,
    watch: false
  }]
}
```

#### 方式二：使用 Docker 部署

```bash
# 构建镜像
docker build -t star-vast-village-backend .

# 运行容器
docker run -d \
  --name star-vast-village-backend \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  star-vast-village-backend

# 查看日志
docker logs -f star-vast-village-backend
```

**Dockerfile**：

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装生产依赖
RUN npm ci --only=production

# 复制构建文件
COPY dist ./dist

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "dist/server.js"]
```

**docker-compose.yml**：

```yaml
version: '3.8'

services:
   backend:
      build: ..
      container_name: star-vast-village-backend
      ports:
         - "3000:3000"
      environment:
         - NODE_ENV=production
         - SUPABASE_URL=${SUPABASE_URL}
         - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
         - JWT_SECRET=${JWT_SECRET}
      restart: unless-stopped
      volumes:
         - ./logs:/app/logs
      networks:
         - app-network

networks:
   app-network:
      driver: bridge
```

#### 方式三：部署到云平台

##### Vercel 部署

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

**vercel.json**：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

##### Railway 部署

1. 访问 https://railway.app/
2. 连接 GitHub 仓库
3. 配置环境变量
4. 自动部署

### 3.5 配置 Nginx 反向代理

```nginx
# /etc/nginx/sites-available/star-vast-village

upstream backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name api.star-vast-village.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.star-vast-village.com;

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/api.star-vast-village.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.star-vast-village.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 日志配置
    access_log /var/log/nginx/star-vast-village-access.log;
    error_log /var/log/nginx/star-vast-village-error.log;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain application/json;
    gzip_min_length 1000;

    # 代理配置
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康检查
    location /health {
        proxy_pass http://backend/health;
        access_log off;
    }
}
```

启用配置：

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/star-vast-village /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 3.6 配置 SSL 证书

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d api.star-vast-village.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 四、前端部署

### 4.1 项目初始化

```bash
# 克隆项目
git clone https://github.com/your-org/star-vast-village-miniapp.git
cd star-vast-village-miniapp

# 安装依赖
npm install
```

### 4.2 配置环境变量

创建 `.env.production` 文件：

```env
# API 基础地址
TARO_APP_API_URL=https://api.star-vast-village.com

# 微信小程序配置
TARO_APP_WECHAT_APPID=wx_your_appid

# 小红书小程序配置
TARO_APP_XHS_APPID=xhs_your_appid

# Supabase 配置（客户端）
TARO_APP_SUPABASE_URL=https://xxxxx.supabase.co
TARO_APP_SUPABASE_ANON_KEY=your_anon_key
```

### 4.3 构建微信小程序

```bash
# 构建生产版本
npm run build:weapp

# 构建结果在 dist 目录
ls -la dist/
```

### 4.4 上传微信小程序

#### 方式一：使用微信开发者工具

1. 打开微信开发者工具
2. 导入项目，选择 `dist` 目录
3. 填写 AppID
4. 点击右上角"上传"按钮
5. 填写版本号和项目备注
6. 上传成功后，登录微信公众平台提交审核

#### 方式二：使用命令行工具（CI/CD）

```bash
# 安装 miniprogram-ci
npm install miniprogram-ci --save-dev

# 创建上传脚本
node scripts/upload-weapp.js
```

**scripts/upload-weapp.js**：

```javascript
const ci = require('miniprogram-ci')
const path = require('path')

const project = new ci.Project({
  appid: 'wx_your_appid',
  type: 'miniProgram',
  projectPath: path.resolve(__dirname, '../dist'),
  privateKeyPath: path.resolve(__dirname, '../private.key'),
  ignores: ['node_modules/**/*']
})

async function upload() {
  const uploadResult = await ci.upload({
    project,
    version: process.env.VERSION || '1.0.0',
    desc: process.env.DESC || '版本更新',
    setting: {
      es6: true,
      es7: true,
      minify: true,
      autoPrefixWxss: true
    },
    onProgressUpdate: console.log
  })
  
  console.log('上传成功:', uploadResult)
}

upload().catch(console.error)
```

### 4.5 构建小红书小程序

```bash
# 构建小红书小程序
npm run build:xhs

# 使用小红书开发者工具上传
# 1. 打开小红书开发者工具
# 2. 导入项目，选择 dist 目录
# 3. 上传代码
# 4. 在小红书开放平台提交审核
```

### 4.6 配置服务器域名

#### 微信小程序

登录微信公众平台 > 开发 > 开发管理 > 开发设置 > 服务器域名

配置以下域名：

```
request 合法域名：
https://api.star-vast-village.com
https://xxxxx.supabase.co

uploadFile 合法域名：
https://xxxxx.supabase.co

downloadFile 合法域名：
https://xxxxx.supabase.co
```

#### 小红书小程序

在小红书开放平台配置服务器域名白名单。

---

## 五、CI/CD 自动化部署

### 5.1 GitHub Actions 配置

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy

on:
  push:
    branches:
      - main

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        working-directory: ./backend
        
      - name: Build
        run: npm run build
        working-directory: ./backend
        
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/star-vast-village-backend
            git pull
            npm install
            npm run build
            pm2 restart star-vast-village-backend

  deploy-miniapp:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        working-directory: ./miniapp
        
      - name: Build WeChat MiniApp
        run: npm run build:weapp
        working-directory: ./miniapp
        env:
          TARO_APP_API_URL: ${{ secrets.API_URL }}
          TARO_APP_WECHAT_APPID: ${{ secrets.WECHAT_APPID }}
          
      - name: Upload to WeChat
        run: node scripts/upload-weapp.js
        working-directory: ./miniapp
        env:
          VERSION: ${{ github.run_number }}
          DESC: "Auto deploy from GitHub Actions"
```

### 5.2 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

```
SERVER_HOST          # 服务器地址
SERVER_USER          # SSH 用户名
SSH_PRIVATE_KEY      # SSH 私钥
API_URL              # API 地址
WECHAT_APPID         # 微信小程序 AppID
XHS_APPID            # 小红书小程序 AppID
```

---

## 六、监控与日志

### 6.1 日志管理

#### 后端日志

使用 PM2 查看日志：

```bash
# 实时日志
pm2 logs star-vast-village-backend

# 查看错误日志
pm2 logs star-vast-village-backend --err

# 清空日志
pm2 flush
```

#### Nginx 日志

```bash
# 访问日志
tail -f /var/log/nginx/star-vast-village-access.log

# 错误日志
tail -f /var/log/nginx/star-vast-village-error.log
```

### 6.2 性能监控

#### 使用 PM2 Plus

```bash
# 连接 PM2 Plus
pm2 link your_secret_key your_public_key

# 查看监控面板
# 访问 https://app.pm2.io/
```

#### 使用 Sentry 错误追踪

```bash
# 安装 Sentry SDK
npm install @sentry/node

# 在 app.ts 中配置
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: 'your_sentry_dsn',
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
})
```

### 6.3 健康检查

设置定时健康检查：

```bash
# 创建检查脚本
cat > /usr/local/bin/health-check.sh << 'EOF'
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
if [ $response != "200" ]; then
  echo "Health check failed with status $response"
  pm2 restart star-vast-village-backend
fi
EOF

chmod +x /usr/local/bin/health-check.sh

# 添加到 crontab
crontab -e
# 每 5 分钟检查一次
*/5 * * * * /usr/local/bin/health-check.sh
```

---

## 七、备份策略

### 7.1 数据库备份

Supabase 提供自动备份功能，但建议定期手动备份：

```bash
# 使用 pg_dump 备份
pg_dump -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f backup_$(date +%Y%m%d).dump

# 恢复备份
pg_restore -h db.xxxxx.supabase.co \
  -U postgres \
  -d postgres \
  backup_20250105.dump
```

### 7.2 代码备份

```bash
# 定期推送到 GitHub
git push origin main

# 创建版本标签
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

---

## 八、安全加固

### 8.1 服务器安全

```bash
# 更新系统
sudo apt-get update && sudo apt-get upgrade -y

# 配置防火墙
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 禁用 root 登录
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
sudo systemctl restart sshd

# 安装 fail2ban 防止暴力破解
sudo apt-get install fail2ban
sudo systemctl enable fail2ban
```

### 8.2 环境变量安全

```bash
# 确保 .env 文件权限
chmod 600 .env

# 不要将 .env 提交到 Git
echo ".env" >> .gitignore
```

### 8.3 API 安全

- 启用 HTTPS
- 配置 CORS 白名单
- 实现请求限流
- 使用 JWT 认证
- 定期更新依赖包

---

## 九、故障排查

### 9.1 常见问题

#### 后端无法启动

```bash
# 检查端口占用
lsof -i :3000

# 检查日志
pm2 logs star-vast-village-backend --lines 100

# 检查环境变量
pm2 env 0
```

#### 数据库连接失败

```bash
# 测试数据库连接
psql -h db.xxxxx.supabase.co -U postgres -d postgres

# 检查防火墙规则
sudo ufw status

# 检查 Supabase 项目状态
# 访问 Supabase Dashboard
```

#### 小程序无法访问 API

1. 检查服务器域名是否配置
2. 检查 SSL 证书是否有效
3. 检查 API 是否正常运行
4. 查看小程序控制台错误信息

### 9.2 性能问题

```bash
# 查看服务器资源使用
htop

# 查看 Node.js 进程内存
pm2 monit

# 分析慢查询
# 在 Supabase Dashboard 查看 Query Performance
```

---

## 十、成本估算

### 10.1 基础设施成本

| 项目 | 方案 | 月成本 |
|------|------|--------|
| 云服务器 | 1核2G（腾讯云/阿里云） | ¥100-150 |
| Supabase | Pro 版 | $25 (约¥180) |
| 域名 | .com 域名 | ¥8-10/月 |
| SSL 证书 | Let's Encrypt 免费 | ¥0 |
| CDN | 按量付费 | ¥20-50 |
| **总计** | | **¥308-390/月** |

### 10.2 小程序认证费用

- 微信小程序认证：¥300/年
- 小红书小程序认证：根据平台政策

### 10.3 优化建议

- 初期使用 Supabase 免费版（500MB 数据库 + 1GB 存储）
- 使用免费 SSL 证书
- 优化图片使用 WebP 格式减少存储和带宽成本

---

## 十一、部署检查清单

### 11.1 部署前检查

- [ ] 代码已通过所有测试
- [ ] 环境变量已正确配置
- [ ] 数据库已初始化
- [ ] SSL 证书已配置
- [ ] 服务器域名已配置到小程序后台
- [ ] 备份策略已设置

### 11.2 部署后检查

- [ ] 健康检查接口正常
- [ ] API 接口可正常访问
- [ ] 小程序可正常登录
- [ ] 图片上传功能正常
- [ ] 数据库读写正常
- [ ] 日志记录正常
- [ ] 监控告警已配置

---

## 十二、联系支持

如遇到部署问题，请通过以下方式获取帮助：

- **GitHub Issues**: https://github.com/your-org/star-vast-village/issues
- **技术文档**: 查看项目 Wiki
- **社区讨论**: 加入开发者交流群

---

**文档版本**: v1.0  
**最后更新**: 2025-01-05  
**维护者**: PbEeNiG
