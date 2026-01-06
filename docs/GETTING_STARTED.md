# 开始开发 TOD社区小程序

## 项目已完成的基础架构

### ✅ 前端项目（Frontend）

**位置**: `frontend/`

**已完成**:
- ✅ Taro 4.x 项目配置
- ✅ TypeScript + React 19 环境
- ✅ 状态管理（Zustand）
- ✅ 工具类库（request, storage, validator, format, platform）
- ✅ 首页和登录页面
- ✅ 类型定义（types/index.ts）

**技术栈**:
- Taro 4.x + React 19 + TypeScript
- Taroify UI组件库
- Zustand状态管理
- SCSS样式

### ✅ 后端项目（Backend）

**位置**: `backend/`

**已完成**:
- ✅ Express 5.x 服务器配置
- ✅ Supabase 数据库集成
- ✅ JWT 认证系统
- ✅ 中间件（认证、验证、错误处理）
- ✅ 用户登录API
- ✅ 日志系统（Winston）
- ✅ 统一响应格式

**技术栈**:
- Node.js 18+ + Express 5.x + TypeScript
- Supabase（PostgreSQL）
- JWT认证
- Winston日志

### ✅ 数据库设计

**位置**: `scripts/init-database.sql`

**已完成**:
- ✅ 15个核心数据表设计
- ✅ 索引和触发器
- ✅ 完整的初始化脚本

**核心表**:
- users（用户）
- announcements（公告）
- merchants（商家）
- posts（帖子）
- repairs（报修）
- group_activities（团购活动）
- facilities（设施）
- votes（投票）
- donations（捐赠）
- 等等...

## 🚀 快速启动步骤

### 第一步：安装依赖

```bash
# 在项目根目录运行
./scripts/setup.sh

# 或手动安装
cd backend && npm install
cd ../frontend && npm install
```

### 第二步：配置 Supabase

1. 访问 https://supabase.com 创建项目
2. 在 SQL Editor 中执行 `scripts/init-database.sql`
3. 获取项目URL和API密钥（Settings > API）

### 第三步：配置环境变量

**后端配置** (`backend/.env`):
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_32_character_secret
WECHAT_APPID=wx_your_appid
WECHAT_SECRET=your_wechat_secret
```

**前端配置** (`frontend/.env.development`):
```env
TARO_APP_API_URL=http://localhost:3000
TARO_APP_SUPABASE_URL=https://xxxxx.supabase.co
TARO_APP_SUPABASE_ANON_KEY=your_anon_key
TARO_APP_WECHAT_APPID=wx_your_appid
```

### 第四步：启动开发服务器

```bash
# 方式1：使用启动脚本（推荐）
./scripts/dev.sh

# 方式2：分别启动
# 终端1 - 后端
cd backend && npm run dev

# 终端2 - 前端
cd frontend && npm run dev:weapp
```

### 第五步：在微信开发者工具中打开

1. 打开微信开发者工具
2. 导入项目，选择 `frontend/dist` 目录
3. 填入AppID（或使用测试号）
4. 开始开发

## 📋 下一步开发任务

### 优先级1：核心功能实现

1. **社区公告模块**
   - 公告列表页面
   - 公告详情页面
   - 发布公告（管理员）
   - 文件：`frontend/src/pages/announcement/*`

2. **用户认证完善**
   - 住户认证流程
   - 个人信息管理
   - 文件：`frontend/src/pages/user/*`

3. **在线报修模块**
   - 报修提交页面
   - 报修列表和详情
   - 工单状态管理
   - 文件：`frontend/src/pages/repair/*`

### 优先级2：扩展功能

4. **商家黄页**
   - 商家列表和搜索
   - 商家详情页
   - 文件：`frontend/src/pages/merchant/*`

5. **邻里互助**
   - 帖子发布和列表
   - 评论功能
   - 文件：`frontend/src/pages/community/*`

6. **接龙团购**
   - 团购活动创建
   - 订单提交
   - 文件：`frontend/src/pages/groupbuy/*`

## 🛠️ 开发工具和命令

### 前端常用命令

```bash
cd frontend

# 开发
npm run dev:weapp        # 微信小程序
npm run dev:xhs          # 小红书小程序

# 构建
npm run build:weapp      # 构建微信小程序
npm run build:xhs        # 构建小红书小程序

# 代码质量
npm run lint             # 代码检查
npm run format           # 代码格式化
npm test                 # 运行测试
```

### 后端常用命令

```bash
cd backend

# 开发
npm run dev              # 启动开发服务器

# 构建
npm run build            # 构建生产版本
npm start                # 启动生产服务器

# 代码质量
npm run lint             # 代码检查
npm run format           # 代码格式化
npm test                 # 运行测试
```

## 📖 开发规范

### 代码提交规范

使用 Conventional Commits：

```bash
feat: 添加新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具链相关
```

### 分支管理

```bash
main          # 主分支（生产环境）
develop       # 开发分支
feature/*     # 功能分支
bugfix/*      # bug修复分支
hotfix/*      # 紧急修复分支
```

## 🔍 调试技巧

### 前端调试

1. 使用微信开发者工具的调试器
2. 查看 Console 日志
3. 使用 Network 面板查看API请求

### 后端调试

1. 查看终端日志输出
2. 使用 Postman 测试API
3. 查看 `backend/logs/` 目录下的日志文件

### 数据库调试

1. 在 Supabase Dashboard 查看数据
2. 使用 SQL Editor 执行查询
3. 查看 Table Editor 中的数据

## 📚 参考文档

- [技术架构文档](TECH_ARCHITECTURE.md)
- [数据库设计文档](DATABASE_SCHEMA.md)
- [快速启动指南](QUICK_START.md)
- [Taro官方文档](https://taro.zone)
- [Taroify组件文档](https://taroify.gitee.io/taroify.com/)
- [Supabase文档](https://supabase.com/docs)

## ❓ 常见问题

### Q: 后端启动失败，提示数据库连接错误？
A: 检查 `backend/.env` 中的 Supabase 配置是否正确。

### Q: 前端编译报错？
A: 确保已安装所有依赖：`cd frontend && npm install`

### Q: 微信开发者工具无法预览？
A: 检查 `frontend/.env.development` 中的 API 地址是否正确。

### Q: 如何添加新的API接口？
A: 
1. 在 `backend/src/routes/` 创建路由
2. 在 `backend/src/controllers/` 创建控制器
3. 在 `backend/src/routes/index.ts` 中注册路由

### Q: 如何添加新的页面？
A:
1. 在 `frontend/src/pages/` 创建页面目录
2. 在 `frontend/src/app.config.ts` 中注册页面
3. 创建对应的 `.tsx`, `.scss`, `.config.ts` 文件

## 🎯 开发建议

1. **先完成MVP功能** - 专注于核心功能的实现
2. **遵循设计规范** - 参考技术架构文档
3. **编写测试用例** - 确保代码质量
4. **及时提交代码** - 使用规范的commit message
5. **定期更新文档** - 保持文档与代码同步

## 💡 获取帮助

- 查看项目文档
- 提交 GitHub Issue
- 参与 GitHub Discussions

---

**祝开发顺利！🎉**
