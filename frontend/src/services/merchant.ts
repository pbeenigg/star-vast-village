/**
 * 商家服务 - 商家黄页相关API
 */
import { request } from '@/utils/request'
import type { Merchant, ApiResponse, PageResult } from '@/types'

// 商家分类类型
export type MerchantCategory =
  | 'restaurant'
  | 'supermarket'
  | 'repair'
  | 'education'
  | 'healthcare'
  | 'beauty'
  | 'other'

// 商家列表查询参数
export interface MerchantListParams {
  page?: number
  pageSize?: number
  category?: MerchantCategory | ''
  keyword?: string
  isVerified?: boolean
}

/**
 * 获取商家列表
 */
export const getMerchantList = async (
  params: MerchantListParams = {}
): Promise<ApiResponse<PageResult<Merchant>>> => {
  const { page = 1, pageSize = 10, category = '', keyword = '', isVerified } = params

  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    ...(category && { category }),
    ...(keyword && { keyword }),
    ...(isVerified !== undefined && { isVerified: String(isVerified) })
  })

  return request<PageResult<Merchant>>({
    url: `/merchants?${query.toString()}`,
    method: 'GET'
  })
}

/**
 * 获取商家详情
 */
export const getMerchantDetail = async (
  id: string
): Promise<ApiResponse<Merchant>> => {
  return request<Merchant>({
    url: `/merchants/${id}`,
    method: 'GET'
  })
}

/**
 * 获取热门商家（用于首页展示）
 */
export const getHotMerchants = async (
  limit: number = 6
): Promise<ApiResponse<Merchant[]>> => {
  return request<Merchant[]>({
    url: `/merchants/hot?limit=${limit}`,
    method: 'GET'
  })
}

/**
 * 搜索商家
 */
export const searchMerchants = async (
  keyword: string,
  limit: number = 10
): Promise<ApiResponse<Merchant[]>> => {
  return request<Merchant[]>({
    url: `/merchants/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}`,
    method: 'GET'
  })
}
