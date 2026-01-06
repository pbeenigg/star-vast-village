export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message: string
  code: number
}

export class ApiError extends Error {
  constructor(public code: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export const successResponse = <T>(data: T, message = '操作成功'): ApiResponse<T> => ({
  success: true,
  data,
  message,
  code: 200
})

export const errorResponse = (code: number, message: string): ApiResponse => ({
  success: false,
  message,
  code
})

export const paginatedResponse = <T>(
  list: T[],
  total: number,
  page: number,
  pageSize: number
) => ({
  success: true,
  data: {
    list,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total
  },
  message: '查询成功',
  code: 200
})
