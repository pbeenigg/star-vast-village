/**
 * 帖子控制器 - 处理邻里互助帖子相关业务逻辑
 */
import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/supabase'

// 帖子类型枚举
const VALID_TYPES = ['help', 'lost_found', 'share', 'discussion', 'second_hand']

/**
 * 获取帖子列表
 * GET /api/posts
 */
export const getPostList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = '1',
      pageSize = '10',
      type = '',
      keyword = '',
      authorId = ''
    } = req.query

    const pageNum = Math.max(1, parseInt(page as string, 10))
    const limit = Math.min(50, Math.max(1, parseInt(pageSize as string, 10)))
    const offset = (pageNum - 1) * limit

    // 构建查询
    let query = supabase
      .from('posts')
      .select(`
        id,
        type,
        title,
        content,
        images,
        author_id,
        view_count,
        like_count,
        comment_count,
        status,
        is_resolved,
        tags,
        created_at,
        updated_at,
        users!posts_author_id_fkey (
          nickname,
          avatar
        )
      `, { count: 'exact' })
      .eq('status', 'approved')

    // 类型筛选
    if (type && VALID_TYPES.includes(type as string)) {
      query = query.eq('type', type)
    }

    // 作者筛选
    if (authorId) {
      query = query.eq('author_id', authorId)
    }

    // 关键词搜索
    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`)
    }

    // 排序：按创建时间倒序
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('查询帖子列表失败:', error)
      return res.status(500).json({
        success: false,
        message: '获取帖子列表失败',
        code: 500
      })
    }

    // 格式化数据
    const list = (data || []).map(item => formatPost(item))

    const total = count || 0
    const hasMore = offset + list.length < total

    return res.json({
      success: true,
      data: {
        list,
        total,
        page: pageNum,
        pageSize: limit,
        hasMore
      },
      message: '获取成功',
      code: 200
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 获取帖子详情
 * GET /api/posts/:id
 */
export const getPostDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        type,
        title,
        content,
        images,
        author_id,
        view_count,
        like_count,
        comment_count,
        status,
        is_resolved,
        tags,
        created_at,
        updated_at,
        users!posts_author_id_fkey (
          nickname,
          avatar
        )
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在',
        code: 404
      })
    }

    // 异步更新浏览量
    supabase
      .from('posts')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', id)
      .then(() => {})
      .catch(err => console.error('更新浏览量失败:', err))

    const post = formatPost(data)
    post.viewCount += 1

    return res.json({
      success: true,
      data: post,
      message: '获取成功',
      code: 200
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 发布帖子
 * POST /api/posts
 */
export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId
    const { type, title, content, images, tags } = req.body

    // 验证必填字段
    if (!type || !title || !content) {
      return res.status(400).json({
        success: false,
        message: '类型、标题和内容为必填项',
        code: 400
      })
    }

    // 验证类型
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: '无效的帖子类型',
        code: 400
      })
    }

    // 创建帖子
    const { data, error } = await supabase
      .from('posts')
      .insert({
        type,
        title,
        content,
        images: images || null,
        tags: tags || null,
        author_id: userId,
        status: 'approved', // 默认自动通过，可根据需求改为 pending
        is_resolved: false
      })
      .select()
      .single()

    if (error) {
      console.error('创建帖子失败:', error)
      return res.status(500).json({
        success: false,
        message: '发布失败',
        code: 500
      })
    }

    return res.status(201).json({
      success: true,
      data: { id: data.id },
      message: '发布成功',
      code: 201
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 更新帖子
 * PUT /api/posts/:id
 */
export const updatePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.userId
    const { title, content, images, tags } = req.body

    // 检查帖子是否存在且是作者
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingPost) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在',
        code: 404
      })
    }

    if (existingPost.author_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权修改此帖子',
        code: 403
      })
    }

    // 更新帖子
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    }
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (images !== undefined) updateData.images = images
    if (tags !== undefined) updateData.tags = tags

    const { error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('更新帖子失败:', error)
      return res.status(500).json({
        success: false,
        message: '更新失败',
        code: 500
      })
    }

    return res.json({
      success: true,
      message: '更新成功',
      code: 200
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 删除帖子
 * DELETE /api/posts/:id
 */
export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.userId
    const userRole = (req as any).user?.role

    // 检查帖子
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingPost) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在',
        code: 404
      })
    }

    // 检查权限：作者或管理员可删除
    if (existingPost.author_id !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权删除此帖子',
        code: 403
      })
    }

    // 软删除
    const { error } = await supabase
      .from('posts')
      .update({ status: 'closed', updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('删除帖子失败:', error)
      return res.status(500).json({
        success: false,
        message: '删除失败',
        code: 500
      })
    }

    return res.json({
      success: true,
      message: '删除成功',
      code: 200
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 点赞帖子
 * POST /api/posts/:id/like
 */
export const likePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.userId

    // 检查是否已点赞
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', userId)
      .single()

    if (existingLike) {
      // 取消点赞
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', id)
        .eq('user_id', userId)

      // 减少点赞数
      await supabase.rpc('decrement_like_count', { post_id: id })

      return res.json({
        success: true,
        data: { liked: false },
        message: '取消点赞成功',
        code: 200
      })
    }

    // 添加点赞
    await supabase
      .from('post_likes')
      .insert({ post_id: id, user_id: userId })

    // 增加点赞数
    await supabase.rpc('increment_like_count', { post_id: id })

    return res.json({
      success: true,
      data: { liked: true },
      message: '点赞成功',
      code: 200
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 标记帖子为已解决
 * POST /api/posts/:id/resolve
 */
export const resolvePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.userId

    // 检查帖子
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('author_id, type')
      .eq('id', id)
      .single()

    if (fetchError || !existingPost) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在',
        code: 404
      })
    }

    // 只有作者可以标记
    if (existingPost.author_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '只有作者可以标记为已解决',
        code: 403
      })
    }

    // 更新状态
    const { error } = await supabase
      .from('posts')
      .update({ is_resolved: true, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('标记已解决失败:', error)
      return res.status(500).json({
        success: false,
        message: '操作失败',
        code: 500
      })
    }

    return res.json({
      success: true,
      message: '已标记为已解决',
      code: 200
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 格式化帖子数据
 */
function formatPost(item: any) {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    content: item.content,
    images: item.images,
    authorId: item.author_id,
    authorName: (item.users as any)?.nickname || '匿名用户',
    authorAvatar: (item.users as any)?.avatar || null,
    viewCount: item.view_count || 0,
    likeCount: item.like_count || 0,
    commentCount: item.comment_count || 0,
    status: item.status,
    isResolved: item.is_resolved,
    tags: item.tags,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }
}
