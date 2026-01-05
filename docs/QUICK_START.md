# 星瀚邨社区小程序 - 快速启动指南

本指南帮助您快速搭建开发环境并运行项目。

---

## 一、前置要求

### 必需软件
- **Node.js**: 22.x LTS 或更高版本
- **npm**: 10.x 或更高版本
- **Git**: 2.x 或更高版本
- **微信开发者工具**: 最新稳定版

### 账号准备
- Supabase 账号（免费）
- 微信小程序测试号或正式账号

---

## 二、Supabase 项目设置（5 分钟）

### 2.1 创建 Supabase 项目

1. 访问 https://supabase.com/ 并注册/登录
2. 点击 "New Project"
3. 填写项目信息：
   - **Name**: `star-vast-village`
   - **Database Password**: 设置强密码（请记住）
   - **Region**: 选择 `Singapore` 或 `Tokyo`
4. 等待项目创建完成（约 2 分钟）

### 2.2 初始化数据库

1. 进入项目 Dashboard
2. 点击左侧 "SQL Editor"
3. 点击 "New Query"
4. 复制并执行以下初始化脚本：

```sql
-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  openid VARCHAR(100) UNIQUE NOT NULL,
  platform VARCHAR(20) NOT NULL DEFAULT 'wechat',
  nickname VARCHAR(100),
  avatar TEXT,
  phone VARCHAR(20),
  auth_status VARCHAR(20) DEFAULT 'pending',
  role VARCHAR(20) DEFAULT 'resident',
  building VARCHAR(50),
  unit VARCHAR(50),
  room VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_openid ON users(openid);
CREATE INDEX idx_users_platform ON users(platform);

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 更多表的创建请参考 DATABASE_SCHEMA.md
```

### 2.3 配置 Storage

1. 点击左侧 "Storage"
2. 创建以下存储桶（Buckets）：
   - `avatars` - 用户头像
   - `announcements` - 公告图片
   - `posts` - 帖子图片
   - `repairs` - 报修图片

3. 设置存储桶为公开访问：
   - 选择存储桶
   - 点击 "Policies"
   - 添加策略：允许公开读取

### 2.4 获取 API 密钥

1. 点击左侧 "Settings" > "API"
2. 记录以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: 复制保存
   - **service_role key**: 复制保存（保密）

---

## 三、后端项目启动（5 分钟）

### 3.1 克隆项目

```bash
# 克隆仓库（如果还没有，先创建项目）
mkdir -p star-vast-village/backend
cd star-vast-village/backend

# 初始化项目
npm init -y
```

### 3.2 安装依赖

```bash
# 复制 examples/backend-package.json 的内容到 package.json
# 然后安装依赖
npm install
```

### 3.3 配置环境变量

```bash
# 复制环境变量模板
cp examples/.env.example .env

# 编辑 .env 文件，填入您的配置
nano .env
```

必须配置的环境变量：
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
JWT_SECRET=your_random_32_character_secret
WECHAT_APPID=wx_your_appid
WECHAT_SECRET=your_wechat_secret
```

### 3.4 启动开发服务器

```bash
# 开发模式（热重载）
npm run dev

# 服务器将在 http://localhost:3000 启动
```

### 3.5 测试 API

```bash
# 测试健康检查接口
curl http://localhost:3000/health

# 预期响应
{
  "status": "ok",
  "timestamp": "2025-01-05T10:30:00.000Z",
  "database": "connected"
}
```

---

## 四、前端项目启动（5 分钟）

### 4.1 创建前端项目

```bash
# 返回项目根目录
cd ..

# 创建前端目录
mkdir frontend
cd frontend

# 使用 Taro CLI 初始化项目
npx @tarojs/cli init .
```

选择以下选项：
- **框架**: React
- **TypeScript**: 是
- **CSS 预处理器**: SCSS
- **模板**: 默认模板

注意：如果目录已存在，使用 `.` 作为项目名称即可在当前目录初始化。

### 4.2 安装额外依赖

```bash
# 安装 Taroify UI 组件库
npm install @taroify/core @taroify/icons

# 安装 Zustand 状态管理
npm install zustand

# 安装 Supabase 客户端
npm install @supabase/supabase-js

# 安装工具库
npm install dayjs lodash
npm install -D @types/lodash
```

### 4.3 配置环境变量

创建 `.env.development` 文件：

```env
TARO_APP_API_URL=http://localhost:3000
TARO_APP_WECHAT_APPID=wx_your_appid
TARO_APP_SUPABASE_URL=https://xxxxx.supabase.co
TARO_APP_SUPABASE_ANON_KEY=your_anon_key
```

### 4.4 配置 Taro

编辑 `config/index.js`，添加 Taroify 支持：

```javascript
const config = {
  // ... 其他配置
  
  // 添加 Taroify 样式
  sass: {
    resource: [
      'node_modules/@taroify/core/styles/variables.scss'
    ]
  }
}
```

### 4.5 启动开发服务器

```bash
# 启动微信小程序开发
npm run dev:weapp

# 构建产物在 dist 目录
```

### 4.6 在微信开发者工具中打开

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择 `dist` 目录
4. 填入 AppID（测试号或正式 AppID）
5. 点击"导入"

---

## 五、验证安装

### 5.1 后端验证

```bash
# 测试用户登录接口（需要先实现）
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code": "test_code"}'
```

### 5.2 前端验证

在微信开发者工具中：
1. 查看首页是否正常显示
2. 打开调试器查看是否有错误
3. 测试网络请求是否正常

---

## 六、常见问题

### 6.1 Supabase 连接失败

**问题**: 后端无法连接到 Supabase

**解决方案**:
```bash
# 检查环境变量是否正确
cat .env | grep SUPABASE

# 测试网络连接
curl https://xxxxx.supabase.co/rest/v1/

# 检查 API 密钥是否正确
# 在 Supabase Dashboard > Settings > API 中确认
```

### 6.2 微信开发者工具报错

**问题**: "不在以下 request 合法域名列表中"

**解决方案**:
1. 开发阶段：在微信开发者工具中勾选"不校验合法域名"
2. 生产环境：在微信公众平台配置服务器域名

### 6.3 端口被占用

**问题**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决方案**:
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或使用其他端口
PORT=3001 npm run dev
```

### 6.4 依赖安装失败

**问题**: npm install 报错

**解决方案**:
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install

# 如果还是失败，尝试使用 cnpm
npm install -g cnpm --registry=https://registry.npmmirror.com
cnpm install
```

---

## 七、下一步

### 7.1 实现核心功能

按照以下顺序实现功能：
1. **用户认证**: 微信登录、住户认证
2. **社区公告**: 发布、查看公告
3. **邻里互助**: 发帖、评论
4. **在线报修**: 提交报修、处理工单

### 7.2 参考文档

- **技术架构**: 查看 `docs/TECH_ARCHITECTURE.md`
- **数据库设计**: 查看 `docs/DATABASE_SCHEMA.md`
- **开发规范**: 查看 `docs/DEVELOPMENT.md`
- **部署指南**: 查看 `docs/DEPLOYMENT.md`

### 7.3 加入社区

- **GitHub**: https://github.com/your-org/star-vast-village
- **Issues**: 提交问题和建议
- **Discussions**: 参与讨论

---

## 八、快速命令参考

### 后端常用命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务
npm start

# 运行测试
npm test

# 代码检查
npm run lint

# 代码格式化
npm run format
```

### 前端常用命令

```bash
# 微信小程序开发
npm run dev:weapp

# 小红书小程序开发
npm run dev:xhs

# 构建微信小程序
npm run build:weapp

# 构建小红书小程序
npm run build:xhs

# 代码检查
npm run lint

# 代码格式化
npm run format
```

---

## 九、开发工作流

### 9.1 日常开发流程

```bash
# 1. 拉取最新代码
git pull origin develop

# 2. 创建功能分支
git checkout -b feature/your-feature

# 3. 开发功能
npm run dev

# 4. 提交代码
git add .
git commit -m "feat: 添加新功能"

# 5. 推送到远程
git push origin feature/your-feature

# 6. 创建 Pull Request
```

### 9.2 代码提交前检查

```bash
# 运行测试
npm test

# 代码检查
npm run lint

# 代码格式化
npm run format

# 构建检查
npm run build
```

---

## 十、获取帮助

### 遇到问题？

1. **查看文档**: 先查看项目文档是否有相关说明
2. **搜索 Issues**: 在 GitHub Issues 中搜索类似问题
3. **提交 Issue**: 如果没有找到解决方案，提交新的 Issue
4. **社区讨论**: 在 GitHub Discussions 中提问

### 联系方式

- **GitHub**: https://github.com/your-org/star-vast-village
- **Email**: dev@star-vast-village.com

---

**恭喜！您已经完成了项目的快速启动。开始构建您的社区小程序吧！** 🎉

---

**文档版本**: v1.0  
**最后更新**: 2025-01-05  
**维护者**: PbEeNiG
