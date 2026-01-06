# TOD社区小程序 - 前端项目

基于 Taro 4.x + React 19 + Taroify 的多端小程序前端项目。

## 技术栈

- **框架**: Taro 4.x
- **UI库**: Taroify (基于 Vant 的 Taro 组件库)
- **开发语言**: React 19 + TypeScript
- **状态管理**: Zustand
- **样式方案**: SCSS
- **HTTP请求**: Taro.request 封装
- **日期处理**: dayjs

## 项目结构

```
frontend/
├── config/                 # Taro 配置文件
│   ├── index.js           # 基础配置
│   ├── dev.js             # 开发环境配置
│   └── prod.js            # 生产环境配置
├── src/
│   ├── app.config.ts      # 全局配置
│   ├── app.tsx            # 应用入口
│   ├── app.scss           # 全局样式
│   ├── pages/             # 页面目录
│   ├── components/        # 组件目录
│   ├── stores/            # 状态管理
│   ├── services/          # API服务
│   ├── utils/             # 工具函数
│   └── types/             # 类型定义
├── package.json
└── tsconfig.json
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 微信小程序
npm run dev:weapp

# 小红书小程序
npm run dev:xhs
```

### 构建生产版本

```bash
# 微信小程序
npm run build:weapp

# 小红书小程序
npm run build:xhs
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

## 环境变量

复制 `.env.development` 文件并根据实际情况修改：

```bash
# API 基础地址
TARO_APP_API_URL=http://localhost:3000

# 微信小程序配置
TARO_APP_WECHAT_APPID=wx_your_appid

# Supabase 配置
TARO_APP_SUPABASE_URL=https://xxxxx.supabase.co
TARO_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 功能模块

- ✅ 用户认证系统
- ✅ 社区公告
- ✅ 商家黄页
- ✅ 邻里互助
- ✅ 在线报修
- ✅ 接龙团购
- ✅ 设施预约
- ✅ 投票问卷
- ✅ 捐赠公示

## 注意事项

1. 开发前请先配置好环境变量
2. 确保已安装微信开发者工具或小红书开发者工具
3. 首次运行需要先安装依赖
4. 代码提交前请运行 `npm run lint` 检查代码规范

## License

MIT
