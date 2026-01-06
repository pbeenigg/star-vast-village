import { View, Text, Button, Image } from '@tarojs/components'
import { useEffect } from 'react'
import Taro from '@tarojs/taro'
import { useAuthStore } from '@/stores/useAuthStore'
import { AuthStatus } from '@/types'
import './index.scss'

export default function UserCenter() {
  const { isAuthenticated, userInfo, logout } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      Taro.redirectTo({ url: '/pages/auth/login' })
    }
  }, [isAuthenticated])

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          logout()
          Taro.redirectTo({ url: '/pages/auth/login' })
        }
      }
    })
  }

  const menuItems = [
    { icon: '👤', text: '个人信息', url: '/pages/user/profile/index' },
    { icon: '🏠', text: '住户认证', url: '/pages/user/certification/index' },
    { icon: '📋', text: '我的报修', url: '/pages/user/repairs' },
    { icon: '🛒', text: '我的团购', url: '/pages/user/groupbuy' },
    { icon: '📅', text: '我的预约', url: '/pages/user/bookings' },
    { icon: '⚙️', text: '设置', url: '/pages/user/settings' }
  ]

  const navigateTo = (url: string) => {
    // 检查页面是否存在（已注册）
    const registeredPages = [
      '/pages/user/profile/index',
      '/pages/user/certification/index'
    ]
    
    if (registeredPages.includes(url)) {
      Taro.navigateTo({ url })
    } else {
      Taro.showToast({ title: '功能开发中', icon: 'none' })
    }
  }

  const getAuthStatusText = () => {
    switch (userInfo?.authStatus) {
      case AuthStatus.VERIFIED:
        return { text: '已认证', className: 'verified' }
      case AuthStatus.PENDING:
        return { text: '审核中', className: 'pending' }
      case AuthStatus.REJECTED:
        return { text: '未通过', className: 'rejected' }
      default:
        return { text: '未认证', className: 'none' }
    }
  }

  const authStatus = getAuthStatusText()

  return (
    <View className="user-page">
      {/* 用户信息卡片 */}
      <View className="user-header">
        <View className="user-info">
          <View className="avatar">
            {userInfo?.avatar ? (
              <Image className="avatar-image" src={userInfo.avatar} mode="aspectFill" />
            ) : (
              <Text className="avatar-placeholder">👤</Text>
            )}
          </View>
          <View className="info-content">
            <Text className="nickname">
              {userInfo?.nickname || '未设置昵称'}
            </Text>
            <Text className="address">
              {userInfo?.building && userInfo?.unit && userInfo?.room
                ? `${userInfo.building}栋${userInfo.unit}单元${userInfo.room}室`
                : '未认证住户'}
            </Text>
          </View>
        </View>
        <View className={`auth-badge ${authStatus.className}`}>
          {authStatus.text}
        </View>
      </View>

      {/* 功能菜单 */}
      <View className="menu-section">
        <View className="menu-grid">
          {menuItems.map((item, index) => (
            <View 
              key={index} 
              className="menu-item"
              onClick={() => navigateTo(item.url)}
            >
              <Text className="menu-icon">{item.icon}</Text>
              <Text className="menu-text">{item.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 退出登录按钮 */}
      <View className="logout-section">
        <Button className="logout-button" onClick={handleLogout}>
          退出登录
        </Button>
      </View>
    </View>
  )
}
