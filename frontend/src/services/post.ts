/**
 * 帖子服务 - 邻里互助相关API
 */
import { request } from '@/utils/request'
import type { Post, ApiResponse, PageResult } from '@/types'

// 帖子类型
export type PostType = 'help' | 'lost_found' | 'share' | 'discussion' | 'second_hand'

// 帖子列表查询参数
export interface PostListParams {
  page?: number
  pageSize?: number
  type?: PostType | ''
  keyword?: string
  authorId?: string
}

// 发布帖子数据
export interface PublishPostData {
  type: PostType
  title: string
  content: string
  images?: string[]
  tags?: string[]
}

/**
 * 获取帖子列表
 */
export const getPostList = async (
  params: PostListParams = {}
): Promise<ApiResponse<PageResult<Post>>> => {
  const { page = 1, pageSize = 10, type = '', keyword = '', authorId = '' } = params

  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    ...(type && { type }),
    ...(keyword && { keyword }),
    ...(authorId && { authorId })
  })

  return request<PageResult<Post>>({
    url: `/posts?${query.toString()}`,
    method: 'GET'
  })
}

/**
 * 获取帖子详情
 */
export const getPostDetail = async (id: string): Promise<ApiResponse<Post>> => {
  return request<Post>({
    url: `/posts/${id}`,
    method: 'GET'
  })
}

/**
 * 发布帖子
 */
export const publishPost = async (data: PublishPostData): Promise<ApiResponse<{ id: string }>> => {
  return request<{ id: string }>({
    url: '/posts',
    method: 'POST',
    data
  })
}

/**
 * 更新帖子
 */
export const updatePost = async (
  id: string,
  data: Partial<PublishPostData>
): Promise<ApiResponse<void>> => {
  return request<void>({
    url: `/posts/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除帖子
 */
export const deletePost = async (id: string): Promise<ApiResponse<void>> => {
  return request<void>({
    url: `/posts/${id}`,
    method: 'DELETE'
  })
}

/**
 * 点赞帖子
 */
export const likePost = async (id: string): Promise<ApiResponse<{ liked: boolean }>> => {
  return request<{ liked: boolean }>({
    url: `/posts/${id}/like`,
    method: 'POST'
  })
}

/**
 * 标记帖子为已解决
 */
export const resolvePost = async (id: string): Promise<ApiResponse<void>> => {
  return request<void>({
    url: `/posts/${id}/resolve`,
    method: 'POST'
  })
}

/**
 * 获取帖子评论列表
 */
export const getPostComments = async (
  postId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<PageResult<Comment>>> => {
  return request<PageResult<Comment>>({
    url: `/posts/${postId}/comments?page=${page}&pageSize=${pageSize}`,
    method: 'GET'
  })
}

/**
 * 发表评论
 */
export const addComment = async (
  postId: string,
  content: string,
  parentId?: string
): Promise<ApiResponse<{ id: string }>> => {
  return request<{ id: string }>({
    url: `/posts/${postId}/comments`,
    method: 'POST',
    data: { content, parentId }
  })
}

// 评论类型
export interface Comment {
  id: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  parentId?: string
  likeCount: number
  createdAt: string
}
