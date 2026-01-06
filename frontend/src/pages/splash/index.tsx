import { View, Text } from '@tarojs/components'
import { useEffect } from 'react'
import Taro from '@tarojs/taro'
import { useAuthStore } from '@/stores/useAuthStore'
import './index.scss'

export default function Splash() {
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    // 3秒后自动跳转
    const timer = setTimeout(() => {
      handleStart()
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleStart = () => {
    if (isAuthenticated) {
      Taro.reLaunch({ url: '/pages/index/index' })
    } else {
      Taro.reLaunch({ url: '/pages/auth/login' })
    }
  }

  return (
    <View className="splash-page">
      {/* 背景渐变层 */}
      <View className="bg-gradient" />
      <View className="bg-overlay" />
      
      {/* Logo */}
      <View className="logo-container">
        <Text className="logo-text">TOD</Text>
        <Text className="logo-sub">社区</Text>
      </View>

      {/* 菱形图片展示区 */}
      <View className="diamond-gallery">
        <View className="diamond diamond-top">
          <View className="diamond-inner">
            <Text className="diamond-emoji">🏠</Text>
          </View>
        </View>
        <View className="diamond-row">
          <View className="diamond diamond-left">
            <View className="diamond-inner">
              <Text className="diamond-emoji">🤝</Text>
            </View>
          </View>
          <View className="diamond diamond-right">
            <View className="diamond-inner">
              <Text className="diamond-emoji">🛒</Text>
            </View>
          </View>
        </View>
        <View className="diamond diamond-bottom">
          <View className="diamond-inner">
            <Text className="diamond-emoji">💬</Text>
          </View>
        </View>
      </View>

      {/* 标语 */}
      <View className="slogan">
        <Text className="slogan-text">共建 · 共享 · 共治</Text>
      </View>

      {/* 开始按钮 */}
      <View className="start-btn" onClick={handleStart}>
        <Text className="start-btn-text">开始体验</Text>
      </View>

      {/* 版本信息 */}
      <View className="version">
        <Text className="version-text">v1.0.0</Text>
      </View>
    </View>
  )
}
