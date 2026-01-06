import Taro from '@tarojs/taro'
import { useAuthStore } from '@/stores/useAuthStore'
import type { ApiResponse } from '@/types'

const API_BASE_URL = process.env.TARO_APP_API_URL || 'http://localhost:3000'

interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  params?: any
  header?: Record<string, string>
  showLoading?: boolean
  showError?: boolean
}

class Request {
  async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    const { url, method = 'GET', data, params, header = {}, showLoading = false, showError = true } = config

    if (showLoading) {
      Taro.showLoading({ title: '加载中...' })
    }

    try {
      const { token } = useAuthStore.getState()
      
      const requestHeader = {
        'Content-Type': 'application/json',
        ...header
      }

      if (token) {
        requestHeader['Authorization'] = `Bearer ${token}`
      }

      let requestUrl = `${API_BASE_URL}${url}`
      
      if (params && method === 'GET') {
        const queryString = Object.keys(params)
          .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
          .join('&')
        requestUrl += `?${queryString}`
      }

      const response = await Taro.request({
        url: requestUrl,
        method,
        data,
        header: requestHeader
      })

      if (showLoading) {
        Taro.hideLoading()
      }

      if (response.statusCode !== 200) {
        throw new Error(`网络请求失败: ${response.statusCode}`)
      }

      const result = response.data as ApiResponse<T>

      if (!result.success && showError) {
        Taro.showToast({
          title: result.message || '请求失败',
          icon: 'none',
          duration: 2000
        })
      }

      return result
    } catch (error: any) {
      if (showLoading) {
        Taro.hideLoading()
      }

      if (showError) {
        Taro.showToast({
          title: error.message || '网络请求失败',
          icon: 'none',
          duration: 2000
        })
      }

      throw error
    }
  }

  get<T = any>(url: string, params?: any, config?: Partial<RequestConfig>) {
    return this.request<T>({ url, method: 'GET', params, ...config })
  }

  post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>) {
    return this.request<T>({ url, method: 'POST', data, ...config })
  }

  put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>) {
    return this.request<T>({ url, method: 'PUT', data, ...config })
  }

  delete<T = any>(url: string, data?: any, config?: Partial<RequestConfig>) {
    return this.request<T>({ url, method: 'DELETE', data, ...config })
  }

  /**
   * 上传文件
   * @param url 上传地址
   * @param filePath 本地文件路径
   * @param name 文件对应的 key
   * @param formData 额外的表单数据
   */
  async upload<T = any>(
    url: string,
    filePath: string,
    name: string = 'file',
    formData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const { token } = useAuthStore.getState()
    
    const header: Record<string, string> = {}
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await Taro.uploadFile({
        url: `${API_BASE_URL}${url}`,
        filePath,
        name,
        header,
        formData
      })

      if (response.statusCode !== 200) {
        throw new Error(`上传失败: ${response.statusCode}`)
      }

      return JSON.parse(response.data) as ApiResponse<T>
    } catch (error: any) {
      Taro.showToast({
        title: error.message || '上传失败',
        icon: 'none'
      })
      throw error
    }
  }
}

// 创建实例
const requestInstance = new Request()

// 导出函数式调用
export const request = <T = any>(config: RequestConfig): Promise<ApiResponse<T>> => {
  return requestInstance.request<T>(config)
}

// 默认导出实例（支持 request.get / request.post 等方式）
export default requestInstance
