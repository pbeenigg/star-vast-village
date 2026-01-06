import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro, { useReachBottom, usePullDownRefresh } from '@tarojs/taro'
import { getAnnouncementList } from '@/services/announcement'
import type { Announcement } from '@/types'
import './index.scss'

// 公告分类
const categories = [
  { key: 'all', label: '全部' },
  { key: 'emergency', label: '紧急通知' },
  { key: 'notice', label: '日常公告' },
  { key: 'activity', label: '活动信息' },
  { key: 'maintenance', label: '维修通知' }
]

export default function AnnouncementList() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    loadAnnouncements(true)
  }, [activeCategory])

  // 下拉刷新
  usePullDownRefresh(() => {
    loadAnnouncements(true).then(() => {
      Taro.stopPullDownRefresh()
    })
  })

  // 上拉加载更多
  useReachBottom(() => {
    if (hasMore && !loading) {
      loadAnnouncements(false)
    }
  })

  const loadAnnouncements = async (refresh: boolean) => {
    if (loading) return

    const currentPage = refresh ? 1 : page
    setLoading(true)

    try {
      const res = await getAnnouncementList({
        page: currentPage,
        pageSize: 10,
        category: activeCategory === 'all' ? undefined : activeCategory
      })

      if (res.success && res.data) {
        const { list, hasMore: more } = res.data
        setAnnouncements(refresh ? list : [...announcements, ...list])
        setHasMore(more)
        setPage(currentPage + 1)
      }
    } catch (error) {
      console.error('加载公告失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    setPage(1)
    setHasMore(true)
  }

  const goToDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/announcement/detail/index?id=${id}` })
  }

  const getCategoryStyle = (category: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      emergency: { bg: '#fff1f0', color: '#cf1322' },
      notice: { bg: '#e6f7ff', color: '#0958d9' },
      activity: { bg: '#f6ffed', color: '#389e0d' },
      maintenance: { bg: '#fff7e6', color: '#d46b08' }
    }
    return styles[category] || { bg: '#f5f5f5', color: '#666' }
  }

  const getCategoryLabel = (category: string) => {
    const item = categories.find(c => c.key === category)
    return item?.label || category
  }

  const formatTime = (time: string) => {
    const date = new Date(time)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60 * 1000) return '刚刚'
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}小时前`
    if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / 86400000)}天前`
    
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  return (
    <View className="announcement-page">
      {/* 分类标签 */}
      <ScrollView className="category-bar" scrollX>
        {categories.map(cat => (
          <View
            key={cat.key}
            className={`category-item ${activeCategory === cat.key ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat.key)}
          >
            <Text className="category-text">{cat.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* 公告列表 */}
      <View className="announcement-list">
        {announcements.map(item => (
          <View
            key={item.id}
            className={`announcement-card ${item.isPinned ? 'pinned' : ''}`}
            onClick={() => goToDetail(item.id)}
          >
            {item.isPinned && (
              <View className="pin-badge">
                <Text className="pin-icon">📌</Text>
                <Text className="pin-text">置顶</Text>
              </View>
            )}
            
            <View className="card-header">
              <View
                className="category-tag"
                style={{
                  backgroundColor: getCategoryStyle(item.category).bg,
                  color: getCategoryStyle(item.category).color
                }}
              >
                <Text className="tag-text">{getCategoryLabel(item.category)}</Text>
              </View>
              <Text className="publish-time">{formatTime(item.publishedAt)}</Text>
            </View>

            <Text className="card-title">{item.title}</Text>
            
            <Text className="card-content" numberOfLines={2}>
              {item.content.replace(/<[^>]+>/g, '')}
            </Text>

            {item.coverImage && (
              <Image className="card-image" src={item.coverImage} mode="aspectFill" />
            )}

            <View className="card-footer">
              <View className="stat-item">
                <Text className="stat-icon">👁</Text>
                <Text className="stat-text">{item.viewCount}</Text>
              </View>
              <Text className="read-more">查看详情 ›</Text>
            </View>
          </View>
        ))}

        {/* 加载状态 */}
        {loading && (
          <View className="loading-tip">
            <Text>加载中...</Text>
          </View>
        )}

        {!loading && !hasMore && announcements.length > 0 && (
          <View className="loading-tip">
            <Text>没有更多了</Text>
          </View>
        )}

        {!loading && announcements.length === 0 && (
          <View className="empty-tip">
            <Text className="empty-icon">📭</Text>
            <Text className="empty-text">暂无公告</Text>
          </View>
        )}
      </View>
    </View>
  )
}
