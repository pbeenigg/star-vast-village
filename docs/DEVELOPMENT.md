# 星瀚邨社区小程序 - 开发规范文档

本文档规定了项目的开发规范、代码风格、Git 工作流程和最佳实践。

---

## 一、代码规范

### 1.1 命名规范

#### 文件命名
- **组件文件**: 使用 PascalCase，如 `UserProfile.tsx`
- **工具文件**: 使用 camelCase，如 `formatDate.ts`
- **常量文件**: 使用 camelCase，如 `constants.ts`
- **类型文件**: 使用 camelCase + `.d.ts`，如 `api.d.ts`

#### 变量命名
```typescript
// 常量：全大写 + 下划线
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRY_COUNT = 3

// 变量：camelCase
const userName = 'John'
const isActive = true

// 函数：camelCase，动词开头
function getUserInfo() {}
function handleClick() {}
function validateForm() {}

// 类：PascalCase
class UserService {}
class ApiClient {}

// 接口/类型：PascalCase
interface UserInfo {}
type ApiResponse<T> = {}

// 枚举：PascalCase
enum UserRole {
  Admin = 'admin',
  User = 'user'
}

// 私有属性：下划线开头
class Example {
  private _privateField: string
}
```

### 1.2 TypeScript 规范

#### 类型定义
```typescript
// ✅ 推荐：使用 interface 定义对象类型
interface User {
  id: string
  name: string
  email: string
}

// ✅ 推荐：使用 type 定义联合类型
type Status = 'pending' | 'active' | 'inactive'

// ❌ 避免：使用 any
const data: any = {} // 不推荐

// ✅ 推荐：使用具体类型或 unknown
const data: unknown = {}
```

#### 函数类型
```typescript
// ✅ 推荐：明确参数和返回值类型
function fetchUser(id: string): Promise<User> {
  return api.get(`/users/${id}`)
}

// ✅ 推荐：使用可选参数
function createUser(name: string, email?: string): User {
  // ...
}

// ✅ 推荐：使用默认参数
function paginate(page: number = 1, size: number = 10) {
  // ...
}
```

#### 泛型使用
```typescript
// ✅ 推荐：使用泛型提高复用性
function request<T>(url: string): Promise<T> {
  return fetch(url).then(res => res.json())
}

// 使用
const user = await request<User>('/api/user')
```

### 1.3 React 组件规范

#### 函数组件
```typescript
// ✅ 推荐：使用函数组件 + Hooks
import React, { useState, useEffect } from 'react'

interface Props {
  userId: string
  onUpdate?: (user: User) => void
}

const UserProfile: React.FC<Props> = ({ userId, onUpdate }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [userId])

  const fetchUser = async () => {
    setLoading(true)
    try {
      const data = await api.getUser(userId)
      setUser(data)
    } catch (error) {
      console.error('获取用户失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />
  if (!user) return <Empty />

  return (
    <View className="user-profile">
      <Text>{user.name}</Text>
    </View>
  )
}

export default UserProfile
```

#### Hooks 使用规范
```typescript
// ✅ 推荐：自定义 Hook
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchUser = async () => {
      setLoading(true)
      try {
        const data = await api.getUser(userId)
        if (!cancelled) {
          setUser(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchUser()

    return () => {
      cancelled = true
    }
  }, [userId])

  return { user, loading, error }
}

// 使用
const { user, loading, error } = useUser(userId)
```

### 1.4 注释规范

#### 文件注释
```typescript
/**
 * 用户服务模块
 * 
 * @description 提供用户相关的 API 调用方法
 * @author PbEeNiG
 * @date 2025-01-05
 */
```

#### 函数注释
```typescript
/**
 * 获取用户信息
 * 
 * @param userId - 用户ID
 * @returns Promise<User> 用户信息
 * @throws {ApiError} 当用户不存在时抛出错误
 * 
 * @example
 * const user = await getUserInfo('123')
 */
async function getUserInfo(userId: string): Promise<User> {
  // ...
}
```

#### 复杂逻辑注释
```typescript
// ✅ 推荐：为复杂逻辑添加注释
function calculateDiscount(price: number, userLevel: number): number {
  // 根据用户等级计算折扣
  // Level 1: 9.5折
  // Level 2: 9折
  // Level 3: 8.5折
  const discountRate = 1 - (userLevel * 0.05)
  return price * discountRate
}
```

---

## 二、代码风格

### 2.1 ESLint 配置

**.eslintrc.js**:
```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    // TypeScript
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    
    // React
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // 通用
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
```

### 2.2 Prettier 配置

**.prettierrc.js**:
```javascript
module.exports = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  trailingComma: 'none',
  bracketSpacing: true,
  jsxBracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf'
}
```

### 2.3 代码格式化

```bash
# 格式化所有文件
npm run format

# 检查代码风格
npm run lint

# 自动修复
npm run lint:fix
```

**package.json scripts**:
```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,scss,md}\""
  }
}
```

---

## 三、Git 工作流程

### 3.1 分支管理

#### 分支命名规范
```
main          # 主分支，生产环境代码
develop       # 开发分支
feature/*     # 功能分支，如 feature/user-auth
bugfix/*      # Bug 修复分支，如 bugfix/login-error
hotfix/*      # 紧急修复分支，如 hotfix/security-patch
release/*     # 发布分支，如 release/v1.0.0
```

#### 分支工作流
```bash
# 1. 从 develop 创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/user-profile

# 2. 开发并提交
git add .
git commit -m "feat: 添加用户资料页面"

# 3. 推送到远程
git push origin feature/user-profile

# 4. 创建 Pull Request
# 在 GitHub 上创建 PR，请求合并到 develop

# 5. 代码审查通过后合并
# 删除功能分支
git branch -d feature/user-profile
```

### 3.2 Commit 规范

#### Commit Message 格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type 类型
```
feat:     新功能
fix:      Bug 修复
docs:     文档更新
style:    代码格式调整（不影响功能）
refactor: 代码重构
perf:     性能优化
test:     测试相关
chore:    构建/工具链相关
revert:   回滚提交
```

#### 示例
```bash
# 新功能
git commit -m "feat(auth): 添加微信登录功能"

# Bug 修复
git commit -m "fix(repair): 修复报修图片上传失败问题"

# 文档更新
git commit -m "docs: 更新 API 文档"

# 重构
git commit -m "refactor(user): 优化用户信息获取逻辑"

# 性能优化
git commit -m "perf(list): 优化列表渲染性能"
```

#### 使用 Commitizen
```bash
# 安装
npm install -g commitizen cz-conventional-changelog

# 配置
echo '{ "path": "cz-conventional-changelog" }' > ~/.czrc

# 使用
git cz
```

### 3.3 代码审查

#### Pull Request 模板

**.github/pull_request_template.md**:
```markdown
## 变更说明
<!-- 描述本次 PR 的主要变更内容 -->

## 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化
- [ ] 其他

## 测试情况
- [ ] 已添加单元测试
- [ ] 已通过所有测试
- [ ] 已在本地测试通过
- [ ] 已在真机测试通过

## 截图/录屏
<!-- 如有 UI 变更，请提供截图或录屏 -->

## 相关 Issue
<!-- 关联的 Issue 编号，如 #123 -->

## 检查清单
- [ ] 代码符合项目规范
- [ ] 已更新相关文档
- [ ] 已处理所有 TODO 注释
- [ ] 无 console.log 等调试代码
```

#### 审查要点
1. **功能正确性**: 代码是否实现了预期功能
2. **代码质量**: 是否符合编码规范
3. **性能**: 是否存在性能问题
4. **安全性**: 是否存在安全隐患
5. **测试**: 是否有足够的测试覆盖
6. **文档**: 是否更新了相关文档

---

## 四、测试规范

### 4.1 单元测试

#### Jest 配置

**jest.config.js**:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

#### 测试示例
```typescript
// src/utils/__tests__/formatDate.test.ts
import { formatDate } from '../formatDate'

describe('formatDate', () => {
  it('应该正确格式化日期', () => {
    const date = new Date('2025-01-05T10:30:00')
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2025-01-05')
  })

  it('应该处理无效日期', () => {
    expect(formatDate(null, 'YYYY-MM-DD')).toBe('')
  })
})
```

#### 组件测试
```typescript
// src/components/__tests__/Button.test.tsx
import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import Button from '../Button'

describe('Button', () => {
  it('应该正确渲染', () => {
    const { getByText } = render(<Button>点击</Button>)
    expect(getByText('点击')).toBeInTheDocument()
  })

  it('应该响应点击事件', () => {
    const handleClick = jest.fn()
    const { getByText } = render(
      <Button onClick={handleClick}>点击</Button>
    )
    fireEvent.click(getByText('点击'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('禁用状态不应响应点击', () => {
    const handleClick = jest.fn()
    const { getByText } = render(
      <Button disabled onClick={handleClick}>点击</Button>
    )
    fireEvent.click(getByText('点击'))
    expect(handleClick).not.toHaveBeenCalled()
  })
})
```

### 4.2 API 测试

```typescript
// src/services/__tests__/api.test.ts
import { getUserInfo } from '../api'
import { mockRequest } from '../../utils/testUtils'

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('应该成功获取用户信息', async () => {
    const mockUser = { id: '1', name: 'Test User' }
    mockRequest.mockResolvedValue({ data: mockUser })

    const user = await getUserInfo('1')
    expect(user).toEqual(mockUser)
    expect(mockRequest).toHaveBeenCalledWith('/users/1')
  })

  it('应该处理 API 错误', async () => {
    mockRequest.mockRejectedValue(new Error('Network Error'))

    await expect(getUserInfo('1')).rejects.toThrow('Network Error')
  })
})
```

### 4.3 E2E 测试

使用 Playwright 进行端到端测试：

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('登录流程', () => {
  test('用户应该能够成功登录', async ({ page }) => {
    await page.goto('/')
    
    // 点击登录按钮
    await page.click('text=登录')
    
    // 等待微信授权
    await page.waitForSelector('.user-info')
    
    // 验证登录成功
    expect(await page.textContent('.user-name')).toBeTruthy()
  })
})
```

---

## 五、性能优化

### 5.1 代码优化

#### 避免不必要的渲染
```typescript
// ✅ 推荐：使用 React.memo
const UserCard = React.memo(({ user }: { user: User }) => {
  return <View>{user.name}</View>
})

// ✅ 推荐：使用 useMemo 缓存计算结果
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

// ✅ 推荐：使用 useCallback 缓存函数
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

#### 懒加载
```typescript
// ✅ 推荐：路由级别懒加载
const UserProfile = lazy(() => import('./pages/UserProfile'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <UserProfile />
    </Suspense>
  )
}
```

#### 防抖和节流
```typescript
// 防抖
import { debounce } from 'lodash'

const handleSearch = debounce((keyword: string) => {
  search(keyword)
}, 300)

// 节流
import { throttle } from 'lodash'

const handleScroll = throttle(() => {
  checkScrollPosition()
}, 100)
```

### 5.2 网络优化

#### 请求合并
```typescript
// ✅ 推荐：批量请求
async function fetchMultipleUsers(userIds: string[]) {
  return api.post('/users/batch', { ids: userIds })
}

// ❌ 避免：多次单独请求
async function fetchUsers(userIds: string[]) {
  return Promise.all(userIds.map(id => api.get(`/users/${id}`)))
}
```

#### 请求缓存
```typescript
// 使用 SWR 或 React Query 实现请求缓存
import useSWR from 'swr'

function useUser(userId: string) {
  const { data, error } = useSWR(
    `/users/${userId}`,
    fetcher,
    { revalidateOnFocus: false }
  )
  
  return {
    user: data,
    loading: !error && !data,
    error
  }
}
```

### 5.3 图片优化

```typescript
// ✅ 推荐：使用 WebP 格式
<Image src="avatar.webp" />

// ✅ 推荐：懒加载图片
<LazyImage src="large-image.jpg" />

// ✅ 推荐：使用缩略图
<Image 
  src={`${imageUrl}?x-oss-process=image/resize,w_200`} 
  mode="aspectFill"
/>
```

---

## 六、安全规范

### 6.1 输入验证

```typescript
// ✅ 推荐：前端验证
function validatePhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

// ✅ 推荐：后端验证
import Joi from 'joi'

const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required()
})

function validateUser(data: any) {
  return userSchema.validate(data)
}
```

### 6.2 XSS 防护

```typescript
// ✅ 推荐：转义用户输入
import DOMPurify from 'dompurify'

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html)
}

// 使用
<View dangerouslySetInnerHTML={{ __html: sanitizeHtml(userContent) }} />
```

### 6.3 敏感信息保护

```typescript
// ❌ 避免：在代码中硬编码敏感信息
const API_KEY = 'sk-1234567890abcdef' // 不要这样做

// ✅ 推荐：使用环境变量
const API_KEY = process.env.TARO_APP_API_KEY

// ✅ 推荐：敏感数据加密存储
import CryptoJS from 'crypto-js'

function encryptData(data: string, key: string): string {
  return CryptoJS.AES.encrypt(data, key).toString()
}

function decryptData(encrypted: string, key: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, key)
  return bytes.toString(CryptoJS.enc.Utf8)
}
```

---

## 七、文档规范

### 7.1 README 文档

每个模块应包含 README.md：

```markdown
# 模块名称

## 功能说明
简要描述模块的功能和用途

## 使用方法
\`\`\`typescript
import { functionName } from './module'

const result = functionName(params)
\`\`\`

## API 文档
### functionName(params)
- **参数**: 
  - `params` (Type): 参数说明
- **返回值**: Type - 返回值说明
- **示例**: 
  \`\`\`typescript
  const result = functionName({ key: 'value' })
  \`\`\`

## 注意事项
列出使用时需要注意的事项
```

### 7.2 API 文档

使用 Swagger/OpenAPI 生成 API 文档：

```typescript
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: 获取用户信息
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 成功返回用户信息
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/users/:id', getUserById)
```

---

## 八、最佳实践

### 8.1 错误处理

```typescript
// ✅ 推荐：统一错误处理
class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchData() {
  try {
    const response = await api.get('/data')
    return response.data
  } catch (error) {
    if (error instanceof ApiError) {
      // 处理 API 错误
      console.error(`API Error ${error.code}: ${error.message}`)
    } else {
      // 处理其他错误
      console.error('Unexpected error:', error)
    }
    throw error
  }
}
```

### 8.2 日志记录

```typescript
// ✅ 推荐：使用日志工具
import logger from './utils/logger'

logger.info('用户登录', { userId: '123' })
logger.warn('API 响应慢', { url: '/api/data', duration: 3000 })
logger.error('请求失败', { error: error.message })

// 生产环境不输出 debug 日志
if (process.env.NODE_ENV === 'development') {
  logger.debug('调试信息', { data })
}
```

### 8.3 配置管理

```typescript
// ✅ 推荐：集中管理配置
// config/index.ts
export const config = {
  api: {
    baseUrl: process.env.TARO_APP_API_URL,
    timeout: 10000
  },
  storage: {
    tokenKey: 'auth_token',
    userKey: 'user_info'
  },
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100
  }
}

// 使用
import { config } from '@/config'
const url = config.api.baseUrl
```

---

## 九、开发工具

### 9.1 VS Code 推荐插件

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "eamodio.gitlens"
  ]
}
```

### 9.2 VS Code 设置

**.vscode/settings.json**:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

---

## 十、常见问题

### 10.1 如何处理异步操作？

```typescript
// ✅ 推荐：使用 async/await
async function loadData() {
  try {
    const data = await fetchData()
    setData(data)
  } catch (error) {
    handleError(error)
  }
}

// ✅ 推荐：并发请求
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts()
])
```

### 10.2 如何优化大列表渲染？

```typescript
// ✅ 推荐：使用虚拟列表
import { VirtualList } from '@taroify/core'

<VirtualList
  height={500}
  itemCount={1000}
  itemSize={50}
  renderItem={({ index }) => <Item data={list[index]} />}
/>
```

### 10.3 如何避免内存泄漏？

```typescript
// ✅ 推荐：清理副作用
useEffect(() => {
  const timer = setInterval(() => {
    // do something
  }, 1000)

  // 清理定时器
  return () => clearInterval(timer)
}, [])

// ✅ 推荐：取消请求
useEffect(() => {
  let cancelled = false

  async function fetchData() {
    const data = await api.getData()
    if (!cancelled) {
      setData(data)
    }
  }

  fetchData()

  return () => {
    cancelled = true
  }
}, [])
```

---

## 十一、代码审查检查清单

### 11.1 功能检查
- [ ] 代码实现了需求中的所有功能
- [ ] 边界条件已处理
- [ ] 错误情况已处理
- [ ] 用户体验良好

### 11.2 代码质量
- [ ] 代码符合项目规范
- [ ] 变量命名清晰易懂
- [ ] 函数职责单一
- [ ] 代码可读性好
- [ ] 无重复代码

### 11.3 性能
- [ ] 无不必要的渲染
- [ ] 无内存泄漏
- [ ] 网络请求已优化
- [ ] 图片已优化

### 11.4 安全
- [ ] 输入已验证
- [ ] 无 XSS 漏洞
- [ ] 敏感信息已加密
- [ ] 权限检查完整

### 11.5 测试
- [ ] 单元测试覆盖率 > 80%
- [ ] 关键路径有集成测试
- [ ] 已在真机测试

### 11.6 文档
- [ ] 代码注释完整
- [ ] API 文档已更新
- [ ] README 已更新

---

**文档版本**: v1.0  
**最后更新**: 2025-01-05  
**维护者**: PbEeNiG
