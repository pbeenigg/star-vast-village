/**
 * 报修服务 - 在线报修相关API
 */
import { request } from '@/utils/request'
import type { Repair, ApiResponse, PageResult } from '@/types'

// 报修分类类型
export type RepairCategory = 'water' | 'electric' | 'door' | 'elevator' | 'public_facility' | 'other'

// 报修状态类型
export type RepairStatus = 'pending' | 'accepted' | 'processing' | 'completed' | 'cancelled'

// 报修列表查询参数
export interface RepairListParams {
  page?: number
  pageSize?: number
  status?: RepairStatus
}

// 提交报修数据
export interface SubmitRepairData {
  category: RepairCategory
  title: string
  description: string
  images?: string[]
  location?: string
  building?: string
  unit?: string
  room?: string
  contactPerson?: string
  contactPhone: string
  priority?: number
}

/**
 * 获取我的报修列表
 */
export const getMyRepairs = async (
  params: RepairListParams = {}
): Promise<ApiResponse<PageResult<Repair>>> => {
  const { page = 1, pageSize = 10, status } = params

  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    ...(status && { status })
  })

  return request<PageResult<Repair>>({
    url: `/repairs/my?${query.toString()}`,
    method: 'GET'
  })
}

/**
 * 获取报修详情
 */
export const getRepairDetail = async (id: string): Promise<ApiResponse<Repair>> => {
  return request<Repair>({
    url: `/repairs/${id}`,
    method: 'GET'
  })
}

/**
 * 提交报修
 */
export const submitRepair = async (
  data: SubmitRepairData
): Promise<ApiResponse<{ id: string; orderNo: string }>> => {
  return request<{ id: string; orderNo: string }>({
    url: '/repairs',
    method: 'POST',
    data
  })
}

/**
 * 取消报修
 */
export const cancelRepair = async (id: string): Promise<ApiResponse<void>> => {
  return request<void>({
    url: `/repairs/${id}/cancel`,
    method: 'POST'
  })
}

/**
 * 评价报修
 */
export const rateRepair = async (
  id: string,
  rating: number,
  feedback?: string
): Promise<ApiResponse<void>> => {
  return request<void>({
    url: `/repairs/${id}/rate`,
    method: 'POST',
    data: { rating, feedback }
  })
}
