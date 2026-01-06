# H5 编译配置说明

本文档说明 TOD 社区小程序的 H5 版本编译配置和使用方法。

## 📋 配置概览

### 1. Browserslist 配置

在 `package.json` 中配置了不同环境的浏览器兼容性：

```json
{
  "browserslist": {
    "development": [
      "defaults and fully supports es6-module",
      "maintained node versions"
    ],
    "production": [
      "last 3 versions",
      "Android >= 4.1",
      "ios >= 8"
    ]
  }
}
```

**说明**：
- **开发环境**：使用现代浏览器，编译速度快
- **生产环境**：兼容 Android 4.1+ 和 iOS 8+，代码会被编译为 ES5

### 2. Babel 配置

在 `babel.config.js` 中配置了 polyfill 支持：

```javascript
module.exports = {
  presets: [
    [
      'taro',
      {
        framework: 'react',
        hot: true,
        // H5 环境使用 polyfill
        useBuiltIns: process.env.TARO_ENV === 'h5' ? 'usage' : false,
        corejs: process.env.TARO_ENV === 'h5' ? 3 : false,
      },
    ],
  ],
}
```

**说明**：
- 仅在 H5 环境启用 polyfill
- 使用 `usage` 模式，按需引入 polyfill，减小包体积
- 使用 core-js 3 提供 polyfill

### 3. H5 编译配置

在 `config/index.js` 中的 `h5` 配置项：

#### 编译范围
```javascript
compile: {
  include: [
    filename => /node_modules[\\/](?!(@babel|core-js|style-loader|css-loader|react|react-dom))/.test(filename)
  ]
}
```
- 编译 node_modules 中的包以确保 ES5 兼容性
- 排除已经是 ES5 的包，提升编译速度

#### 路由配置
```javascript
router: {
  mode: 'hash',        // 路由模式：hash 或 browser
  basename: '/',       // 路由基准路径
  customRoutes: {}     // 自定义路由映射
}
```

#### 开发服务器
```javascript
devServer: {
  port: 10086,         // 端口
  host: '0.0.0.0',     // 主机
  hot: true,           // React Fast Refresh
  open: true           // 自动打开浏览器
}
```

## 🚀 使用方法

### 开发模式

```bash
# 启动 H5 开发服务器
npm run dev:h5
```

特点：
- 快速编译，不压缩代码
- 支持热更新（React Fast Refresh）
- 自动打开浏览器访问 http://localhost:10086

### 生产构建

```bash
# 构建生产版本
npm run build:h5
```

特点：
- 代码压缩和优化
- 编译为 ES5，兼容性好
- 自动注入 polyfill
- 代码分割，按需加载

### 生产模式 + 监听

```bash
# 生产模式 + 热更新
npm run build:h5:watch
```

特点：
- 生产级别的代码压缩
- 支持热更新，方便调试优化后的代码

## 📊 性能优化

### 代码分割

自动将代码分割为以下几个部分：
- **common**: 公共代码（被引用 2 次以上）
- **vendors**: 第三方库
- **taro**: Taro 框架代码

### 缓存策略

- 启用了持久化缓存，二次编译速度提升 50-80%
- 文件名带 hash，支持长期缓存

### 样式优化

- CSS 独立提取
- 自动添加浏览器前缀
- px 自动转换为 rem（基准 37.5px）

## 🔧 高级配置

### 修改路由模式

如需使用 browser history 模式：

```javascript
// config/index.js
h5: {
  router: {
    mode: 'browser',
    basename: '/app'  // 如部署在子路径
  }
}
```

**注意**：browser 模式需要服务器配置支持。

### 自定义路由映射

```javascript
h5: {
  router: {
    customRoutes: {
      '/home': '/pages/index/index',
      '/user': '/pages/user/profile'
    }
  }
}
```

### 关闭 Fast Refresh

如果遇到 Fast Refresh 相关问题：

```javascript
// babel.config.js
presets: [
  ['taro', {
    framework: 'react',
    hot: false  // 关闭 Fast Refresh
  }]
]

// config/index.js
h5: {
  devServer: {
    hot: false
  }
}
```

### 调整编译范围

如果确认某些包已经是 ES5，可以缩小编译范围：

```javascript
h5: {
  compile: {
    include: [
      // 只编译特定的包
      filename => /node_modules[\\/](some-es6-package)/.test(filename)
    ]
  }
}
```

## 🌐 兼容性

### 支持的浏览器

生产环境支持：
- Chrome、Firefox、Safari、Edge 最近 3 个版本
- Android 4.1+
- iOS 8+

### 已知问题

1. **Android 4.4 兼容性**
   - 如遇到 Promise undefined，在 `index.html` 中手动引入 Promise polyfill

2. **iOS 8 兼容性**
   - 某些 ES6+ 特性可能需要额外的 polyfill

## 📱 部署

### 静态部署

构建后的文件在 `dist/h5` 目录，可直接部署到：
- Nginx
- Apache
- CDN
- 静态托管服务（Vercel、Netlify 等）

### Nginx 配置示例（browser 模式）

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### 环境变量

部署时可通过 `.env.h5` 配置不同环境的变量：

```env
TARO_APP_API_URL=https://api.production.com
TARO_APP_SUPABASE_URL=https://your-project.supabase.co
```

## 🔍 调试

### 开发工具

推荐使用 Chrome DevTools：
- Elements：查看 DOM 结构
- Console：查看日志
- Network：查看网络请求
- Performance：性能分析

### 移动端调试

1. **Chrome 远程调试**：连接 Android 设备
2. **Safari 开发者工具**：连接 iOS 设备
3. **vConsole**：在代码中引入 vConsole 进行移动端调试

## 📚 参考资料

- [Taro H5 官方文档](https://docs.taro.zone/docs/h5)
- [Browserslist 配置](https://github.com/browserslist/browserslist)
- [Babel 配置](https://docs.taro.zone/docs/babel-config)
- [Webpack 配置](https://docs.taro.zone/docs/config-detail)

## ❓ 常见问题

### Q: 为什么开发模式文件很大？
A: 开发模式不压缩代码，使用 `npm run build:h5` 构建生产版本。

### Q: 如何提升编译速度？
A: 
1. 启用缓存（已默认开启）
2. 缩小编译范围（调整 `compile.include`）
3. 使用开发模式而非生产模式

### Q: 如何支持更老的浏览器？
A: 修改 `browserslist` 配置，例如支持 IE 11：
```json
"production": ["ie >= 11"]
```

### Q: 路由跳转后页面空白？
A: 检查路由配置和页面路径是否正确，确保页面已在 `app.config.ts` 中注册。
