import { View, Text, Image, ScrollView, Map } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro, { useRouter, useShareAppMessage } from '@tarojs/taro'
import { getMerchantDetail } from '@/services/merchant'
import type { Merchant } from '@/types'
import './detail.scss'

const CATEGORY_MAP: Record<string, string> = {
  restaurant: '餐饮美食',
  supermarket: '超市便利',
  repair: '维修服务',
  education: '教育培训',
  healthcare: '医疗健康',
  beauty: '美容美发',
  other: '其他服务'
}

export default function MerchantDetail() {
  const router = useRouter()
  const { id } = router.params
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (id) {
      loadDetail(id)
    }
  }, [id])

  useShareAppMessage(() => ({
    title: merchant?.name || '商家详情',
    path: `/pages/merchant/detail/index?id=${id}`
  }))

  const loadDetail = async (merchantId: string) => {
    try {
      const res = await getMerchantDetail(merchantId)
      if (res.success && res.data) {
        setMerchant(res.data)
        Taro.setNavigationBarTitle({ title: res.data.name })
      }
    } catch (error) {
      console.error('加载商家详情失败:', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleCall = () => {
    if (merchant?.phone) {
      Taro.makePhoneCall({ phoneNumber: merchant.phone })
    }
  }

  const handleCopy = (text: string) => {
    Taro.setClipboardData({
      data: text,
      success: () => {
        Taro.showToast({ title: '已复制', icon: 'success' })
      }
    })
  }

  const handleOpenMap = () => {
    if (merchant?.latitude && merchant?.longitude) {
      Taro.openLocation({
        latitude: merchant.latitude,
        longitude: merchant.longitude,
        name: merchant.name,
        address: merchant.address || ''
      })
    }
  }

  const handlePreviewImage = (index: number) => {
    if (merchant?.images && merchant.images.length > 0) {
      Taro.previewImage({
        urls: merchant.images,
        current: merchant.images[index]
      })
    }
  }

  const renderStars = (rating: number) => {
    const stars: string[] = []
    const fullStars = Math.floor(rating)
    for (let i = 0; i < 5; i++) {
      stars.push(i < fullStars ? '★' : '☆')
    }
    return stars.join('')
  }

  if (loading) {
    return (
      <View className="detail-page loading">
        <Text>加载中...</Text>
      </View>
    )
  }

  if (!merchant) {
    return (
      <View className="detail-page error">
        <Text className="error-icon">😕</Text>
        <Text className="error-text">商家不存在</Text>
      </View>
    )
  }

  return (
    <View className="detail-page">
      <ScrollView scrollY className="detail-scroll">
        {/* 图片轮播 */}
        {merchant.images && merchant.images.length > 0 && (
          <View className="image-section">
            <ScrollView
              scrollX
              className="image-scroll"
              onScroll={(e) => {
                const index = Math.round(e.detail.scrollLeft / 350)
                setCurrentImageIndex(index)
              }}
            >
              {merchant.images.map((img, index) => (
                <Image
                  key={index}
                  className="merchant-image"
                  src={img}
                  mode="aspectFill"
                  onClick={() => handlePreviewImage(index)}
                />
              ))}
            </ScrollView>
            <View className="image-indicator">
              <Text>
                {currentImageIndex + 1}/{merchant.images.length}
              </Text>
            </View>
          </View>
        )}

        {/* 基本信息 */}
        <View className="info-card">
          <View className="header-row">
            <Image
              className="merchant-logo"
              src={merchant.logo || 'https://placeholder.com/80'}
              mode="aspectFill"
            />
            <View className="header-info">
              <View className="name-row">
                <Text className="merchant-name">{merchant.name}</Text>
                {merchant.isVerified && (
                  <View className="verified-badge">
                    <Text>✓ 已认证</Text>
                  </View>
                )}
              </View>
              <View className="rating-row">
                <Text className="stars">{renderStars(merchant.rating)}</Text>
                <Text className="rating-value">{merchant.rating.toFixed(1)}</Text>
                <Text className="review-count">{merchant.reviewCount}条评价</Text>
              </View>
              <Text className="category">{CATEGORY_MAP[merchant.category] || '其他'}</Text>
            </View>
          </View>

          {merchant.description && (
            <View className="description-section">
              <Text className="description">{merchant.description}</Text>
            </View>
          )}

          {merchant.tags && merchant.tags.length > 0 && (
            <View className="tags-section">
              {merchant.tags.map((tag, index) => (
                <Text key={index} className="tag">
                  {tag}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* 联系信息 */}
        <View className="contact-card">
          <Text className="card-title">联系方式</Text>

          {merchant.phone && (
            <View className="contact-item" onClick={handleCall}>
              <Text className="contact-icon">📞</Text>
              <Text className="contact-text">{merchant.phone}</Text>
              <Text className="contact-action">拨打</Text>
            </View>
          )}

          {merchant.address && (
            <View className="contact-item" onClick={() => handleCopy(merchant.address!)}>
              <Text className="contact-icon">📍</Text>
              <Text className="contact-text">{merchant.address}</Text>
              <Text className="contact-action">复制</Text>
            </View>
          )}

          {merchant.businessHours && (
            <View className="contact-item">
              <Text className="contact-icon">🕐</Text>
              <Text className="contact-text">营业时间: {merchant.businessHours}</Text>
            </View>
          )}
        </View>

        {/* 地图位置 */}
        {merchant.latitude && merchant.longitude && (
          <View className="map-card">
            <Text className="card-title">位置</Text>
            <Map
              className="location-map"
              latitude={merchant.latitude}
              longitude={merchant.longitude}
              markers={[
                {
                  id: 1,
                  latitude: merchant.latitude,
                  longitude: merchant.longitude,
                  title: merchant.name
                }
              ]}
              onClick={handleOpenMap}
            />
            <View className="map-tip" onClick={handleOpenMap}>
              <Text>点击查看完整地图</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 底部操作栏 */}
      <View className="action-bar">
        {merchant.phone && (
          <View className="action-btn call-btn" onClick={handleCall}>
            <Text className="btn-icon">📞</Text>
            <Text className="btn-text">立即拨打</Text>
          </View>
        )}
        {merchant.latitude && merchant.longitude && (
          <View className="action-btn nav-btn" onClick={handleOpenMap}>
            <Text className="btn-icon">🧭</Text>
            <Text className="btn-text">导航前往</Text>
          </View>
        )}
      </View>
    </View>
  )
}
