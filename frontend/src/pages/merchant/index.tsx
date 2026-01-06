import { View, Text, Image, Input, ScrollView } from '@tarojs/components'
import { useState, useEffect, useCallback } from 'react'
import Taro, { useReachBottom, usePullDownRefresh } from '@tarojs/taro'
import { getMerchantList, MerchantCategory } from '@/services/merchant'
import type { Merchant } from '@/types'
import './index.scss'

const CATEGORIES: { key: MerchantCategory | ''; label: string; icon: string }[] = [
  { key: '', label: '全部', icon: '🏪' },
  { key: 'restaurant', label: '餐饮美食', icon: '🍜' },
  { key: 'supermarket', label: '超市便利', icon: '🛒' },
  { key: 'repair', label: '维修服务', icon: '🔧' },
  { key: 'education', label: '教育培训', icon: '📚' },
  { key: 'healthcare', label: '医疗健康', icon: '💊' },
  { key: 'beauty', label: '美容美发', icon: '💇' },
  { key: 'other', label: '其他服务', icon: '📦' }
]

export default function MerchantList() {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [activeCategory, setActiveCategory] = useState<MerchantCategory | ''>('')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const loadMerchants = useCallback(
    async (isRefresh = false) => {
      if (loading || (!hasMore && !isRefresh)) return

      setLoading(true)
      const currentPage = isRefresh ? 1 : page

      try {
        const res = await getMerchantList({
          page: currentPage,
          pageSize: 10,
          category: activeCategory,
          keyword
        })

        if (res.success && res.data) {
          const newList = res.data.list
          setMerchants(isRefresh ? newList : [...merchants, ...newList])
          setHasMore(res.data.hasMore)
          setPage(isRefresh ? 2 : page + 1)
        }
      } catch (error) {
        console.error('加载商家列表失败:', error)
        Taro.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        setLoading(false)
        setRefreshing(false)
        Taro.stopPullDownRefresh()
      }
    },
    [loading, hasMore, page, merchants, activeCategory, keyword]
  )

  useEffect(() => {
    setMerchants([])
    setPage(1)
    setHasMore(true)
    loadMerchants(true)
  }, [activeCategory])

  useReachBottom(() => {
    if (hasMore && !loading) {
      loadMerchants()
    }
  })

  usePullDownRefresh(() => {
    setRefreshing(true)
    loadMerchants(true)
  })

  const handleSearch = () => {
    setMerchants([])
    setPage(1)
    setHasMore(true)
    loadMerchants(true)
  }

  const handleCategoryChange = (category: MerchantCategory | '') => {
    if (category !== activeCategory) {
      setActiveCategory(category)
    }
  }

  const goToDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/merchant/detail/index?id=${id}` })
  }

  const handleCall = (phone: string, e: any) => {
    e.stopPropagation()
    Taro.makePhoneCall({ phoneNumber: phone })
  }

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalf = rating % 1 >= 0.5
    const stars: string[] = []

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('★')
      } else if (i === fullStars && hasHalf) {
        stars.push('☆')
      } else {
        stars.push('☆')
      }
    }
    return stars.join('')
  }

  return (
    <View className="merchant-page">
      {/* 搜索栏 */}
      <View className="search-bar">
        <View className="search-input">
          <Text className="search-icon">🔍</Text>
          <Input
            placeholder="搜索商家名称"
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            onConfirm={handleSearch}
            confirmType="search"
          />
        </View>
      </View>

      {/* 分类横向滚动 */}
      <ScrollView className="category-scroll" scrollX showScrollbar={false}>
        <View className="category-list">
          {CATEGORIES.map((cat) => (
            <View
              key={cat.key}
              className={`category-item ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat.key)}
            >
              <Text className="category-icon">{cat.icon}</Text>
              <Text className="category-label">{cat.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 商家列表 */}
      <ScrollView className="merchant-list" scrollY>
        {merchants.length === 0 && !loading ? (
          <View className="empty-state">
            <Text className="empty-icon">🏪</Text>
            <Text className="empty-text">暂无商家信息</Text>
          </View>
        ) : (
          <>
            {merchants.map((merchant) => (
              <View
                key={merchant.id}
                className="merchant-card"
                onClick={() => goToDetail(merchant.id)}
              >
                <Image
                  className="merchant-logo"
                  src={merchant.logo || 'https://placeholder.com/80'}
                  mode="aspectFill"
                />
                <View className="merchant-info">
                  <View className="merchant-header">
                    <Text className="merchant-name">{merchant.name}</Text>
                    {merchant.isVerified && (
                      <View className="verified-badge">
                        <Text>✓ 已认证</Text>
                      </View>
                    )}
                  </View>

                  <View className="merchant-rating">
                    <Text className="stars">{renderStars(merchant.rating)}</Text>
                    <Text className="rating-text">{merchant.rating.toFixed(1)}</Text>
                    <Text className="review-count">({merchant.reviewCount}条评价)</Text>
                  </View>

                  <View className="merchant-meta">
                    <Text className="category-tag">
                      {CATEGORIES.find((c) => c.key === merchant.category)?.label ||
                        merchant.category}
                    </Text>
                    {merchant.businessHours && (
                      <Text className="business-hours">{merchant.businessHours}</Text>
                    )}
                  </View>

                  {merchant.address && (
                    <Text className="merchant-address" numberOfLines={1}>
                      📍 {merchant.address}
                    </Text>
                  )}

                  {merchant.tags && merchant.tags.length > 0 && (
                    <View className="merchant-tags">
                      {merchant.tags.slice(0, 3).map((tag, index) => (
                        <Text key={index} className="tag">
                          {tag}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>

                {merchant.phone && (
                  <View className="call-btn" onClick={(e) => handleCall(merchant.phone, e)}>
                    <Text className="call-icon">📞</Text>
                  </View>
                )}
              </View>
            ))}

            {/* 加载状态 */}
            {loading && (
              <View className="loading-more">
                <Text>加载中...</Text>
              </View>
            )}
            {!hasMore && merchants.length > 0 && (
              <View className="no-more">
                <Text>没有更多商家了</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  )
}
