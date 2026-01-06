/**
 * 公告控制器 - 处理社区公告相关业务逻辑
 */
import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/supabase'

// 公告分类枚举
const VALID_CATEGORIES = ['emergency', 'notice', 'activity', 'maintenance']

/**
 * 获取公告列表
 * GET /api/announcements
 */
export const getAnnouncementList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = '1',
      pageSize = '10',
      category = '',
      keyword = ''
    } = req.query

    const pageNum = Math.max(1, parseInt(page as string, 10))
    const limit = Math.min(50, Math.max(1, parseInt(pageSize as string, 10)))
    const offset = (pageNum - 1) * limit

    // 构建查询
    let query = supabase
      .from('announcements')
      .select(`
        id,
        title,
        content,
        category,
        cover_image,
        images,
        publisher_id,
        published_at,
        view_count,
        is_pinned,
        created_at,
        updated_at,
        users!announcements_publisher_id_fkey (
          nickname
        )
      `, { count: 'exact' })
      .eq('status', 'published')

    // 分类筛选
    if (category && VALID_CATEGORIES.includes(category as string)) {
      query = query.eq('category', category)
    }

    // 关键词搜索
    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`)
    }

    // 排序：置顶优先，然后按发布时间倒序
    query = query
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('查询公告列表失败:', error)
      return res.status(500).json({
        success: false,
        message: '获取公告列表失败',
        code: 500
      })
    }

    // 格式化数据
    const list = (data || []).map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category,
      coverImage: item.cover_image,
      images: item.images,
      publisherId: item.publisher_id,
      authorName: (item.users as any)?.nickname || '社区管理员',
      publishedAt: item.published_at,
      viewCount: item.view_count,
      isPinned: item.is_pinned,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }))

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
 * 获取公告详情
 * GET /api/announcements/:id
 */
export const getAnnouncementDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    // 查询公告
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        id,
        title,
        content,
        category,
        cover_image,
        images,
        publisher_id,
        published_at,
        view_count,
        is_pinned,
        created_at,
        updated_at,
        users!announcements_publisher_id_fkey (
          nickname
        )
      `)
      .eq('id', id)
      .eq('status', 'published')
      .single()

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: '公告不存在或已删除',
        code: 404
      })
    }

    // 异步更新浏览量（不阻塞响应）
    supabase
      .from('announcements')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', id)
      .then(() => {})
      .catch(err => console.error('更新浏览量失败:', err))

    // 格式化数据
    const announcement = {
      id: data.id,
      title: data.title,
      content: data.content,
      category: data.category,
      coverImage: data.cover_image,
      images: data.images,
      publisherId: data.publisher_id,
      authorName: (data.users as any)?.nickname || '社区管理员',
      publishedAt: data.published_at,
      viewCount: data.view_count + 1,
      isPinned: data.is_pinned,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    return res.json({
      success: true,
      data: announcement,
      message: '获取成功',
      code: 200
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 获取置顶公告
 * GET /api/announcements/pinned
 */
export const getPinnedAnnouncements = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        id,
        title,
        category,
        cover_image,
        published_at,
        view_count
      `)
      .eq('status', 'published')
      .eq('is_pinned', true)
      .order('published_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('查询置顶公告失败:', error)
      return res.status(500).json({
        success: false,
        message: '获取置顶公告失败',
        code: 500
      })
    }

    const list = (data || []).map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      coverImage: item.cover_image,
      publishedAt: item.published_at,
      viewCount: item.view_count
    }))

    return res.json({
      success: true,
      data: list,
      message: '获取成功',
      code: 200
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 获取最新公告（用于首页展示）
 * GET /api/announcements/latest
 */
export const getLatestAnnouncements = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = Math.min(10, Math.max(1, parseInt(req.query.limit as string || '5', 10)))

    const { data, error } = await supabase
      .from('announcements')
      .select(`
        id,
        title,
        category,
        cover_image,
        published_at,
        view_count,
        is_pinned
      `)
      .eq('status', 'published')
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('查询最新公告失败:', error)
      return res.status(500).json({
        success: false,
        message: '获取最新公告失败',
        code: 500
      })
    }

    const list = (data || []).map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      coverImage: item.cover_image,
      publishedAt: item.published_at,
      viewCount: item.view_count,
      isPinned: item.is_pinned
    }))

    return res.json({
      success: true,
      data: list,
      message: '获取成功',
      code: 200
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 创建公告（管理员）
 * POST /api/announcements
 */
export const createAnnouncement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId
    const { title, content, category, coverImage, images, isPinned = false } = req.body

    // 验证必填字段
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: '标题、内容和分类为必填项',
        code: 400
      })
    }

    // 验证分类
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: '无效的公告分类',
        code: 400
      })
    }

    // 创建公告
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        category,
        cover_image: coverImage || null,
        images: images || null,
        publisher_id: userId,
        is_pinned: isPinned,
        status: 'published',
        published_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('创建公告失败:', error)
      return res.status(500).json({
        success: false,
        message: '创建公告失败',
        code: 500
      })
    }

    return res.status(201).json({
      success: true,
      data: {
        id: data.id,
        title: data.title,
        category: data.category,
        publishedAt: data.published_at
      },
      message: '公告创建成功',
      code: 201
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 更新公告（管理员）
 * PUT /api/announcements/:id
 */
export const updateAnnouncement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const { title, content, category, coverImage, images, isPinned, status } = req.body

    // 验证分类
    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: '无效的公告分类',
        code: 400
      })
    }

    // 构建更新数据
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (category !== undefined) updateData.category = category
    if (coverImage !== undefined) updateData.cover_image = coverImage
    if (images !== undefined) updateData.images = images
    if (isPinned !== undefined) updateData.is_pinned = isPinned
    if (status !== undefined) updateData.status = status

    const { data, error } = await supabase
      .from('announcements')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: '公告不存在',
        code: 404
      })
    }

    return res.json({
      success: true,
      data: {
        id: data.id,
        title: data.title,
        updatedAt: data.updated_at
      },
      message: '公告更新成功',
      code: 200
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 删除公告（管理员）
 * DELETE /api/announcements/:id
 */
export const deleteAnnouncement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    // 软删除：将状态改为 archived
    const { error } = await supabase
      .from('announcements')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('删除公告失败:', error)
      return res.status(500).json({
        success: false,
        message: '删除公告失败',
        code: 500
      })
    }

    return res.json({
      success: true,
      message: '公告已删除',
      code: 200
    })
  } catch (error) {
    next(error)
  }
}
