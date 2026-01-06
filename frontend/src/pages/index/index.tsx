import { View, Text, ScrollView } from '@tarojs/components'
import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { useAuthStore } from '@/stores/useAuthStore'
import './index.scss'

// 功能入口配置
const quickEntries = [
  { icon: '📢', text: '社区公告', url: '/pages/announcement/index', color: '#FF6B6B' },
  { icon: '🏪', text: '商家黄页', url: '/pages/merchant/index', color: '#4ECDC4' },
  { icon: '🤝', text: '邻里互助', url: '/pages/community/index', color: '#45B7D1' },
  { icon: '🔧', text: '在线报修', url: '/pages/repair/index', color: '#96CEB4' },
  { icon: '🛒', text: '接龙团购', url: '/pages/groupbuy/index', color: '#FFEAA7' },
  { icon: '📅', text: '设施预约', url: '/pages/facility/index', color: '#DDA0DD' },
  { icon: '📊', text: '投票问卷', url: '/pages/vote/index', color: '#98D8C8' },
  { icon: '💰', text: '捐赠公示', url: '/pages/donation/index', color: '#F7DC6F' }
]

export default function Index() {
  const { isAuthenticated, userInfo } = useAuthStore()
  const [notices, setNotices] = useState<string[]>([
    '欢迎使用TOD社区小程序！',
    '住户认证后可使用全部功能'
  ])

  useEffect(() => {
    // 检查登录状态
    if (!isAuthenticated) {
      Taro.redirectTo({ url: '/pages/auth/login' })
    }
  }, [isAuthenticated])

  const handleEntryClick = (url: string) => {
    // 已实现的页面
    const implementedPages = [
      '/pages/auth/login',
      '/pages/user/index',
      '/pages/user/certification/index',
      '/pages/user/profile/index',
      '/pages/announcement/index',
      '/pages/merchant/index',
      '/pages/community/index',
      '/pages/repair/index',
      '/pages/repair/submit/index'
    ]
    
    if (implementedPages.includes(url)) {
      Taro.navigateTo({ url })
    } else {
      Taro.showToast({ title: '功能开发中', icon: 'none' })
    }
  }

  const goToUserCenter = () => {
    Taro.navigateTo({ url: '/pages/user/index' })
  }

  return (
    <View className="index-page">
      {/* 顶部用户栏 */}
      <View className="header">
        <View className="user-bar" onClick={goToUserCenter}>
          <View className="avatar">
            <Text className="avatar-icon">👤</Text>
          </View>
          <View className="user-info">
            <Text className="greeting">
              {userInfo?.nickname ? `你好，${userInfo.nickname}` : '你好，邻居'}
            </Text>
            <Text className="status">
              {userInfo?.authStatus === 'verified' ? '✅ 已认证住户' : '点击完成住户认证'}
            </Text>
          </View>
          <Text className="arrow">›</Text>
        </View>
      </View>

      {/* 公告轮播 */}
      <View className="notice-bar">
        <Text className="notice-icon">📣</Text>
        <ScrollView className="notice-scroll" scrollX>
          {notices.map((notice, index) => (
            <Text key={index} className="notice-text">{notice}</Text>
          ))}
        </ScrollView>
      </View>

      {/* 功能入口网格 */}
      <View className="section">
        <View className="section-title">
          <Text className="title-text">社区服务</Text>
        </View>
        <View className="entry-grid">
          {quickEntries.map((entry, index) => (
            <View
              key={index}
              className="entry-item"
              onClick={() => handleEntryClick(entry.url)}
            >
              <View className="entry-icon" style={{ backgroundColor: entry.color + '20' }}>
                <Text className="icon-text">{entry.icon}</Text>
              </View>
              <Text className="entry-text">{entry.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 快捷操作 */}
      <View className="section">
        <View className="section-title">
          <Text className="title-text">快捷操作</Text>
        </View>
        <View className="quick-actions">
          <View className="action-card" onClick={() => handleEntryClick('/pages/repair/index')}>
            <Text className="action-icon">🔧</Text>
            <View className="action-content">
              <Text className="action-title">一键报修</Text>
              <Text className="action-desc">快速提交维修申请</Text>
            </View>
          </View>
          <View className="action-card" onClick={goToUserCenter}>
            <Text className="action-icon">🏠</Text>
            <View className="action-content">
              <Text className="action-title">住户认证</Text>
              <Text className="action-desc">认证后享受更多服务</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}
