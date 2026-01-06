/**
 * 公告服务 - 社区公告相关API
 */
import { request } from '@/utils/request'
import type { Announcement, ApiResponse, PageResult } from '@/types'

// 公告分类类型
export type AnnouncementCategory = 'emergency' | 'notice' | 'activity' | 'maintenance'

// 公告列表查询参数
export interface AnnouncementListParams {
  page?: number
  pageSize?: number
  category?: AnnouncementCategory | ''
  keyword?: string
}

/**
 * 获取公告列表
 */
export const getAnnouncementList = async (
  params: AnnouncementListParams = {}
): Promise<ApiResponse<PageResult<Announcement>>> => {
  const { page = 1, pageSize = 10, category = '', keyword = '' } = params

  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    ...(category && { category }),
    ...(keyword && { keyword })
  })

  return request<PageResult<Announcement>>({
    url: `/announcements?${query.toString()}`,
    method: 'GET'
  })
}

/**
 * 获取公告详情
 */
export const getAnnouncementDetail = async (
  id: string
): Promise<ApiResponse<Announcement>> => {
  return request<Announcement>({
    url: `/announcements/${id}`,
    method: 'GET'
  })
}

/**
 * 获取置顶公告
 */
export const getPinnedAnnouncements = async (): Promise<ApiResponse<Announcement[]>> => {
  return request<Announcement[]>({
    url: '/announcements/pinned',
    method: 'GET'
  })
}

/**
 * 获取最新公告（用于首页展示）
 */
export const getLatestAnnouncements = async (
  limit: number = 5
): Promise<ApiResponse<Announcement[]>> => {
  return request<Announcement[]>({
    url: `/announcements/latest?limit=${limit}`,
    method: 'GET'
  })
}
