/**
 * 商家控制器 - 处理商家黄页相关业务逻辑
 */
import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/supabase'

// 商家分类枚举
const VALID_CATEGORIES = ['restaurant', 'supermarket', 'repair', 'education', 'healthcare', 'beauty', 'other']

/**
 * 获取商家列表
 * GET /api/merchants
 */
export const getMerchantList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = '1',
      pageSize = '10',
      category = '',
      keyword = '',
      isVerified
    } = req.query

    const pageNum = Math.max(1, parseInt(page as string, 10))
    const limit = Math.min(50, Math.max(1, parseInt(pageSize as string, 10)))
    const offset = (pageNum - 1) * limit

    // 构建查询
    let query = supabase
      .from('merchants')
      .select(`
        id,
        name,
        category,
        description,
        logo,
        images,
        contact_person,
        phone,
        address,
        location,
        business_hours,
        tags,
        rating,
        review_count,
        is_verified,
        is_active,
        created_at,
        updated_at
      `, { count: 'exact' })
      .eq('is_active', true)

    // 分类筛选
    if (category && VALID_CATEGORIES.includes(category as string)) {
      query = query.eq('category', category)
    }

    // 认证状态筛选
    if (isVerified !== undefined) {
      query = query.eq('is_verified', isVerified === 'true')
    }

    // 关键词搜索
    if (keyword) {
      query = query.or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`)
    }

    // 排序：认证优先，然后按评分倒序
    query = query
      .order('is_verified', { ascending: false })
      .order('rating', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('查询商家列表失败:', error)
      return res.status(500).json({
        success: false,
        message: '获取商家列表失败',
        code: 500
      })
    }

    // 格式化数据
    const list = (data || []).map(item => formatMerchant(item))

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
 * 获取商家详情
 * GET /api/merchants/:id
 */
export const getMerchantDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('merchants')
      .select(`
        id,
        name,
        category,
        description,
        logo,
        images,
        contact_person,
        phone,
        address,
        location,
        business_hours,
        tags,
        rating,
        review_count,
        is_verified,
        is_active,
        owner_id,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: '商家不存在',
        code: 404
      })
    }

    return res.json({
      success: true,
      data: formatMerchant(data),
      message: '获取成功',
      code: 200
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 获取热门商家
 * GET /api/merchants/hot
 */
export const getHotMerchants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit as string || '6', 10)))

    const { data, error } = await supabase
      .from('merchants')
      .select(`
        id,
        name,
        category,
        logo,
        rating,
        review_count,
        is_verified
      `)
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .order('review_count', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('查询热门商家失败:', error)
      return res.status(500).json({
        success: false,
        message: '获取热门商家失败',
        code: 500
      })
    }

    const list = (data || []).map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      logo: item.logo,
      rating: item.rating,
      reviewCount: item.review_count,
      isVerified: item.is_verified
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
 * 搜索商家
 * GET /api/merchants/search
 */
export const searchMerchants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { keyword = '', limit: limitStr = '10' } = req.query
    const limit = Math.min(20, Math.max(1, parseInt(limitStr as string, 10)))

    if (!keyword) {
      return res.json({
        success: true,
        data: [],
        message: '获取成功',
        code: 200
      })
    }

    const { data, error } = await supabase
      .from('merchants')
      .select(`
        id,
        name,
        category,
        logo,
        address,
        rating,
        is_verified
      `)
      .eq('is_active', true)
      .or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%,tags.cs.{${keyword}}`)
      .order('rating', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('搜索商家失败:', error)
      return res.status(500).json({
        success: false,
        message: '搜索商家失败',
        code: 500
      })
    }

    const list = (data || []).map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      logo: item.logo,
      address: item.address,
      rating: item.rating,
      isVerified: item.is_verified
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
 * 格式化商家数据
 */
function formatMerchant(item: any) {
  let latitude: number | null = null
  let longitude: number | null = null

  // 解析 PostGIS 地理位置
  if (item.location) {
    // location 可能是 GeoJSON 格式或 POINT 格式
    if (typeof item.location === 'object' && item.location.coordinates) {
      [longitude, latitude] = item.location.coordinates
    }
  }

  return {
    id: item.id,
    name: item.name,
    category: item.category,
    description: item.description,
    logo: item.logo,
    images: item.images,
    contactPerson: item.contact_person,
    phone: item.phone,
    address: item.address,
    latitude,
    longitude,
    businessHours: formatBusinessHours(item.business_hours),
    tags: item.tags,
    rating: parseFloat(item.rating) || 0,
    reviewCount: item.review_count || 0,
    isVerified: item.is_verified,
    isActive: item.is_active,
    ownerId: item.owner_id,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }
}

/**
 * 格式化营业时间
 */
function formatBusinessHours(hours: any): string | null {
  if (!hours) return null

  if (typeof hours === 'string') return hours

  // 如果是 JSON 格式，简化显示
  if (typeof hours === 'object') {
    // 假设周一到周日营业时间相同
    const monday = hours.monday || hours.everyday
    if (monday) return monday
  }

  return null
}
