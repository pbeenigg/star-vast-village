import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useState, useEffect, useCallback } from 'react'
import Taro, { useReachBottom, usePullDownRefresh } from '@tarojs/taro'
import { getPostList, PostType } from '@/services/post'
import type { Post } from '@/types'
import './index.scss'

const POST_TYPES: { key: PostType | ''; label: string; icon: string }[] = [
  { key: '', label: '全部', icon: '📋' },
  { key: 'help', label: '求助', icon: '🆘' },
  { key: 'lost_found', label: '失物招领', icon: '🔍' },
  { key: 'share', label: '经验分享', icon: '💡' },
  { key: 'discussion', label: '讨论交流', icon: '💬' },
  { key: 'second_hand', label: '二手交易', icon: '🏷️' }
]

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [activeType, setActiveType] = useState<PostType | ''>('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const loadPosts = useCallback(
    async (isRefresh = false) => {
      if (loading || (!hasMore && !isRefresh)) return

      setLoading(true)
      const currentPage = isRefresh ? 1 : page

      try {
        const res = await getPostList({
          page: currentPage,
          pageSize: 10,
          type: activeType
        })

        if (res.success && res.data) {
          const newList = res.data.list
          setPosts(isRefresh ? newList : [...posts, ...newList])
          setHasMore(res.data.hasMore)
          setPage(isRefresh ? 2 : page + 1)
        }
      } catch (error) {
        console.error('加载帖子列表失败:', error)
        Taro.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        setLoading(false)
        setRefreshing(false)
        Taro.stopPullDownRefresh()
      }
    },
    [loading, hasMore, page, posts, activeType]
  )

  useEffect(() => {
    setPosts([])
    setPage(1)
    setHasMore(true)
    loadPosts(true)
  }, [activeType])

  useReachBottom(() => {
    if (hasMore && !loading) {
      loadPosts()
    }
  })

  usePullDownRefresh(() => {
    setRefreshing(true)
    loadPosts(true)
  })

  const handleTypeChange = (type: PostType | '') => {
    if (type !== activeType) {
      setActiveType(type)
    }
  }

  const goToDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/community/detail/index?id=${id}` })
  }

  const goToPublish = () => {
    Taro.navigateTo({ url: '/pages/community/publish/index' })
  }

  const formatTime = (time: string) => {
    const date = new Date(time)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60 * 1000) return '刚刚'
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分钟前`
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
    if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
    return `${date.getMonth() + 1}-${date.getDate()}`
  }

  const getTypeLabel = (type: string) => {
    return POST_TYPES.find((t) => t.key === type)?.label || type
  }

  const getTypeStyle = (type: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      help: { bg: '#fff1f0', color: '#cf1322' },
      lost_found: { bg: '#e6f7ff', color: '#0958d9' },
      share: { bg: '#f6ffed', color: '#389e0d' },
      discussion: { bg: '#fff7e6', color: '#d46b08' },
      second_hand: { bg: '#f9f0ff', color: '#722ed1' }
    }
    return styles[type] || { bg: '#f5f5f5', color: '#666' }
  }

  return (
    <View className="community-page">
      {/* 类型标签 */}
      <ScrollView className="type-scroll" scrollX showScrollbar={false}>
        <View className="type-list">
          {POST_TYPES.map((type) => (
            <View
              key={type.key}
              className={`type-item ${activeType === type.key ? 'active' : ''}`}
              onClick={() => handleTypeChange(type.key)}
            >
              <Text className="type-icon">{type.icon}</Text>
              <Text className="type-label">{type.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 帖子列表 */}
      <ScrollView className="post-list" scrollY>
        {posts.length === 0 && !loading ? (
          <View className="empty-state">
            <Text className="empty-icon">📝</Text>
            <Text className="empty-text">暂无帖子</Text>
            <View className="empty-btn" onClick={goToPublish}>
              <Text>发布第一条</Text>
            </View>
          </View>
        ) : (
          <>
            {posts.map((post) => (
              <View key={post.id} className="post-card" onClick={() => goToDetail(post.id)}>
                {/* 作者信息 */}
                <View className="post-header">
                  <Image
                    className="author-avatar"
                    src={post.authorAvatar || 'https://placeholder.com/40'}
                    mode="aspectFill"
                  />
                  <View className="author-info">
                    <Text className="author-name">{post.authorName || '匿名用户'}</Text>
                    <Text className="post-time">{formatTime(post.createdAt)}</Text>
                  </View>
                  <View
                    className="type-tag"
                    style={{
                      backgroundColor: getTypeStyle(post.type).bg,
                      color: getTypeStyle(post.type).color
                    }}
                  >
                    <Text>{getTypeLabel(post.type)}</Text>
                  </View>
                </View>

                {/* 内容 */}
                <Text className="post-title">{post.title}</Text>
                <Text className="post-content" numberOfLines={2}>
                  {post.content}
                </Text>

                {/* 图片预览 */}
                {post.images && post.images.length > 0 && (
                  <View className="post-images">
                    {post.images.slice(0, 3).map((img, index) => (
                      <Image key={index} className="post-image" src={img} mode="aspectFill" />
                    ))}
                    {post.images.length > 3 && (
                      <View className="more-images">
                        <Text>+{post.images.length - 3}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* 标签 */}
                {post.tags && post.tags.length > 0 && (
                  <View className="post-tags">
                    {post.tags.slice(0, 3).map((tag, index) => (
                      <Text key={index} className="tag">
                        #{tag}
                      </Text>
                    ))}
                  </View>
                )}

                {/* 统计 */}
                <View className="post-stats">
                  <View className="stat-item">
                    <Text className="stat-icon">👁</Text>
                    <Text className="stat-value">{post.viewCount}</Text>
                  </View>
                  <View className="stat-item">
                    <Text className="stat-icon">👍</Text>
                    <Text className="stat-value">{post.likeCount}</Text>
                  </View>
                  <View className="stat-item">
                    <Text className="stat-icon">💬</Text>
                    <Text className="stat-value">{post.commentCount}</Text>
                  </View>
                  {post.isResolved && (
                    <View className="resolved-badge">
                      <Text>✓ 已解决</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}

            {/* 加载状态 */}
            {loading && (
              <View className="loading-more">
                <Text>加载中...</Text>
              </View>
            )}
            {!hasMore && posts.length > 0 && (
              <View className="no-more">
                <Text>没有更多了</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* 发布按钮 */}
      <View className="publish-btn" onClick={goToPublish}>
        <Text className="publish-icon">✏️</Text>
      </View>
    </View>
  )
}
