import { View, Text, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { useAuthStore } from '@/stores/useAuthStore'
import { platformUtil } from '@/utils/platform'
import './login.scss'

export default function Login() {
  const { login } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)

    try {
      if (platformUtil.isWeapp()) {
        // 微信小程序登录
        const { code } = await Taro.login()
        await login(code)
        Taro.reLaunch({ url: '/pages/index/index' })
      } else if (platformUtil.isXhs()) {
        // 小红书登录
        const { code } = await Taro.login()
        await login(code)
        Taro.reLaunch({ url: '/pages/index/index' })
      } else if (platformUtil.isH5()) {
        // H5 环境 - 开发测试登录
        // 生产环境可以接入第三方登录（微信网页授权等）
        const testCode = 'h5_test_' + Date.now()
        await login(testCode)
        
        Taro.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          Taro.reLaunch({ url: '/pages/index/index' })
        }, 1000)
      } else {
        Taro.showToast({
          title: '当前平台暂不支持登录',
          icon: 'none'
        })
      }
    } catch (error: any) {
      console.error('登录失败:', error)
      Taro.showToast({
        title: error.message || '登录失败，请重试',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="login-page">
      <View className="login-container">
        <View className="logo-section">
          <Text className="logo-icon">🏘️</Text>
          <Text className="logo-title">TOD社区</Text>
          <Text className="logo-subtitle">共建美好家园</Text>
        </View>

        <View className="login-section">
          <Button
            className="login-button"
            loading={loading}
            onClick={handleLogin}
          >
            {loading ? '登录中...' : platformUtil.isH5() ? '一键登录' : '微信登录'}
          </Button>

          <View className="login-tips">
            <Text className="tips-text">登录即表示同意</Text>
            <Text className="tips-link">《用户协议》</Text>
            <Text className="tips-text">和</Text>
            <Text className="tips-link">《隐私政策》</Text>
          </View>
        </View>

        <View className="feature-section">
          <View className="feature-item">
            <Text className="feature-icon">🔒</Text>
            <Text className="feature-text">安全可靠</Text>
          </View>
          <View className="feature-item">
            <Text className="feature-icon">⚡</Text>
            <Text className="feature-text">快速便捷</Text>
          </View>
          <View className="feature-item">
            <Text className="feature-icon">🤝</Text>
            <Text className="feature-text">邻里互助</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
