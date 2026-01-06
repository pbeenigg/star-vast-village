import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useEffect, useCallback } from 'react'
import Taro, { useReachBottom, usePullDownRefresh } from '@tarojs/taro'
import { getMyRepairs } from '@/services/repair'
import type { Repair } from '@/types'
import './index.scss'

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '待接单', color: '#d46b08', bg: '#fff7e6' },
  accepted: { label: '已接单', color: '#0958d9', bg: '#e6f7ff' },
  processing: { label: '处理中', color: '#722ed1', bg: '#f9f0ff' },
  completed: { label: '已完成', color: '#389e0d', bg: '#f6ffed' },
  cancelled: { label: '已取消', color: '#999', bg: '#f5f5f5' }
}

const CATEGORY_MAP: Record<string, string> = {
  water: '水管问题',
  electric: '电路问题',
  door: '门窗问题',
  elevator: '电梯问题',
  public_facility: '公共设施',
  other: '其他问题'
}

export default function RepairList() {
  const [repairs, setRepairs] = useState<Repair[]>([])
  const [activeStatus, setActiveStatus] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  const loadRepairs = useCallback(
    async (isRefresh = false) => {
      if (loading || (!hasMore && !isRefresh)) return

      setLoading(true)
      const currentPage = isRefresh ? 1 : page

      try {
        const res = await getMyRepairs({
          page: currentPage,
          pageSize: 10,
          status: activeStatus || undefined
        })

        if (res.success && res.data) {
          const newList = res.data.list
          setRepairs(isRefresh ? newList : [...repairs, ...newList])
          setHasMore(res.data.hasMore)
          setPage(isRefresh ? 2 : page + 1)
        }
      } catch (error) {
        console.error('加载报修列表失败:', error)
        Taro.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        setLoading(false)
        Taro.stopPullDownRefresh()
      }
    },
    [loading, hasMore, page, repairs, activeStatus]
  )

  useEffect(() => {
    setRepairs([])
    setPage(1)
    setHasMore(true)
    loadRepairs(true)
  }, [activeStatus])

  useReachBottom(() => {
    if (hasMore && !loading) {
      loadRepairs()
    }
  })

  usePullDownRefresh(() => {
    loadRepairs(true)
  })

  const goToSubmit = () => {
    Taro.navigateTo({ url: '/pages/repair/submit/index' })
  }

  const goToDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/repair/detail/index?id=${id}` })
  }

  const formatTime = (time: string) => {
    const date = new Date(time)
    return `${date.getMonth() + 1}-${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  const statusFilters = [
    { key: '', label: '全部' },
    { key: 'pending', label: '待接单' },
    { key: 'processing', label: '处理中' },
    { key: 'completed', label: '已完成' }
  ]

  return (
    <View className="repair-list-page">
      {/* 状态筛选 */}
      <View className="status-filter">
        {statusFilters.map((filter) => (
          <View
            key={filter.key}
            className={`filter-item ${activeStatus === filter.key ? 'active' : ''}`}
            onClick={() => setActiveStatus(filter.key)}
          >
            <Text>{filter.label}</Text>
          </View>
        ))}
      </View>

      {/* 工单列表 */}
      <ScrollView className="repair-list" scrollY>
        {repairs.length === 0 && !loading ? (
          <View className="empty-state">
            <Text className="empty-icon">📋</Text>
            <Text className="empty-text">暂无报修记录</Text>
            <View className="empty-btn" onClick={goToSubmit}>
              <Text>立即报修</Text>
            </View>
          </View>
        ) : (
          <>
            {repairs.map((repair) => (
              <View
                key={repair.id}
                className="repair-card"
                onClick={() => goToDetail(repair.id)}
              >
                <View className="card-header">
                  <Text className="order-no">工单号：{repair.orderNo}</Text>
                  <View
                    className="status-tag"
                    style={{
                      backgroundColor: STATUS_MAP[repair.status]?.bg,
                      color: STATUS_MAP[repair.status]?.color
                    }}
                  >
                    <Text>{STATUS_MAP[repair.status]?.label}</Text>
                  </View>
                </View>

                <View className="card-content">
                  <Text className="repair-title">{repair.title}</Text>
                  <Text className="repair-category">
                    {CATEGORY_MAP[repair.category] || repair.category}
                  </Text>
                  {repair.location && (
                    <Text className="repair-location">📍 {repair.location}</Text>
                  )}
                </View>

                <View className="card-footer">
                  <Text className="repair-time">{formatTime(repair.createdAt)}</Text>
                  {repair.priority > 0 && (
                    <View className={`priority-tag priority-${repair.priority}`}>
                      <Text>{repair.priority === 2 ? '紧急' : '重要'}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}

            {loading && (
              <View className="loading-more">
                <Text>加载中...</Text>
              </View>
            )}
            {!hasMore && repairs.length > 0 && (
              <View className="no-more">
                <Text>没有更多了</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* 新建报修按钮 */}
      <View className="add-btn" onClick={goToSubmit}>
        <Text className="add-icon">+</Text>
      </View>
    </View>
  )
}
