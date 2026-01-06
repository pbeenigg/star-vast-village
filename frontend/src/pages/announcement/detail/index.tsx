import { View, Text, Image, RichText, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { getAnnouncementDetail } from '@/services/announcement'
import type { Announcement } from '@/types'
import './detail.scss'

export default function AnnouncementDetail() {
  const router = useRouter()
  const { id } = router.params
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadDetail(id)
    }
  }, [id])

  const loadDetail = async (announcementId: string) => {
    try {
      const res = await getAnnouncementDetail(announcementId)
      if (res.success && res.data) {
        setAnnouncement(res.data)
        // 设置页面标题
        Taro.setNavigationBarTitle({ title: res.data.title.slice(0, 10) + '...' })
      }
    } catch (error) {
      console.error('加载公告详情失败:', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      emergency: '紧急通知',
      notice: '日常公告',
      activity: '活动信息',
      maintenance: '维修通知'
    }
    return labels[category] || category
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

  const formatDate = (time: string) => {
    const date = new Date(time)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true
    })
  }

  if (loading) {
    return (
      <View className="detail-page loading">
        <Text>加载中...</Text>
      </View>
    )
  }

  if (!announcement) {
    return (
      <View className="detail-page error">
        <Text className="error-icon">😕</Text>
        <Text className="error-text">公告不存在或已删除</Text>
      </View>
    )
  }

  return (
    <ScrollView className="detail-page" scrollY>
      {/* 头部信息 */}
      <View className="detail-header">
        <View
          className="category-tag"
          style={{
            backgroundColor: getCategoryStyle(announcement.category).bg,
            color: getCategoryStyle(announcement.category).color
          }}
        >
          <Text>{getCategoryLabel(announcement.category)}</Text>
        </View>

        <Text className="detail-title">{announcement.title}</Text>

        <View className="meta-info">
          <View className="meta-item">
            <Text className="meta-icon">👤</Text>
            <Text className="meta-text">{announcement.authorName || '社区管理员'}</Text>
          </View>
          <View className="meta-item">
            <Text className="meta-icon">📅</Text>
            <Text className="meta-text">{formatDate(announcement.publishedAt)}</Text>
          </View>
          <View className="meta-item">
            <Text className="meta-icon">👁</Text>
            <Text className="meta-text">{announcement.viewCount} 次阅读</Text>
          </View>
        </View>
      </View>

      {/* 封面图片 */}
      {announcement.coverImage && (
        <View className="cover-section">
          <Image
            className="cover-image"
            src={announcement.coverImage}
            mode="widthFix"
            onClick={() => {
              Taro.previewImage({
                urls: [announcement.coverImage!],
                current: announcement.coverImage
              })
            }}
          />
        </View>
      )}

      {/* 内容区域 */}
      <View className="content-section">
        <RichText nodes={announcement.content} />
      </View>

      {/* 图片集 */}
      {announcement.images && announcement.images.length > 0 && (
        <View className="images-section">
          <Text className="section-title">相关图片</Text>
          <View className="images-grid">
            {announcement.images.map((img, index) => (
              <Image
                key={index}
                className="grid-image"
                src={img}
                mode="aspectFill"
                onClick={() => {
                  Taro.previewImage({
                    urls: announcement.images!,
                    current: img
                  })
                }}
              />
            ))}
          </View>
        </View>
      )}

      {/* 底部操作栏 */}
      <View className="action-bar">
        <View className="action-item" onClick={handleShare}>
          <Text className="action-icon">📤</Text>
          <Text className="action-text">分享</Text>
        </View>
      </View>
    </ScrollView>
  )
}
