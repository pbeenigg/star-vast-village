/**
 * 报修控制器 - 处理在线报修相关业务逻辑
 */
import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/supabase'

// 报修分类枚举
const VALID_CATEGORIES = ['water', 'electric', 'door', 'elevator', 'public_facility', 'other']

// 生成工单号
function generateOrderNo(): string {
  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const randomNum = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `WX${dateStr}${randomNum}`
}

/**
 * 获取我的报修列表
 * GET /api/repairs/my
 */
export const getMyRepairs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId
    const { page = '1', pageSize = '10', status = '' } = req.query

    const pageNum = Math.max(1, parseInt(page as string, 10))
    const limit = Math.min(50, Math.max(1, parseInt(pageSize as string, 10)))
    const offset = (pageNum - 1) * limit

    let query = supabase
      .from('repairs')
      .select(`
        id,
        order_no,
        category,
        title,
        description,
        images,
        location,
        building,
        unit,
        room,
        contact_person,
        contact_phone,
        submitter_id,
        handler_id,
        status,
        priority,
        scheduled_at,
        completed_at,
        rating,
        feedback,
        created_at,
        updated_at
      `, { count: 'exact' })
      .eq('submitter_id', userId)

    if (status) {
      query = query.eq('status', status)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('查询报修列表失败:', error)
      return res.status(500).json({
        success: false,
        message: '获取报修列表失败',
        code: 500
      })
    }

    const list = (data || []).map(item => formatRepair(item))
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
 * 获取报修详情
 * GET /api/repairs/:id
 */
export const getRepairDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.userId

    const { data, error } = await supabase
      .from('repairs')
      .select(`
        id,
        order_no,
        category,
        title,
        description,
        images,
        location,
        building,
        unit,
        room,
        contact_person,
        contact_phone,
        submitter_id,
        handler_id,
        status,
        priority,
        scheduled_at,
        completed_at,
        rating,
        feedback,
        created_at,
        updated_at,
        users!repairs_handler_id_fkey (
          nickname
        )
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: '报修记录不存在',
        code: 404
      })
    }

    // 只有提交者或管理员可以查看
    if (data.submitter_id !== userId) {
      const userRole = (req as any).user?.role
      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: '无权查看此报修记录',
          code: 403
        })
      }
    }

    const repair = formatRepair(data)
    if (data.users) {
      repair.handlerName = (data.users as any)?.nickname || null
    }

    return res.json({
      success: true,
      data: repair,
      message: '获取成功',
      code: 200
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 提交报修
 * POST /api/repairs
 */
export const createRepair = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId
    const {
      category,
      title,
      description,
      images,
      location,
      building,
      unit,
      room,
      contactPerson,
      contactPhone,
      priority = 0
    } = req.body

    // 验证必填字段
    if (!category || !title || !description || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: '分类、标题、描述和联系电话为必填项',
        code: 400
      })
    }

    // 验证分类
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: '无效的报修分类',
        code: 400
      })
    }

    const orderNo = generateOrderNo()

    const { data, error } = await supabase
      .from('repairs')
      .insert({
        order_no: orderNo,
        category,
        title,
        description,
        images: images || null,
        location: location || null,
        building: building || null,
        unit: unit || null,
        room: room || null,
        contact_person: contactPerson || null,
        contact_phone: contactPhone,
        submitter_id: userId,
        status: 'pending',
        priority: Math.min(2, Math.max(0, priority))
      })
      .select()
      .single()

    if (error) {
      console.error('创建报修失败:', error)
      return res.status(500).json({
        success: false,
        message: '提交报修失败',
        code: 500
      })
    }

    return res.status(201).json({
      success: true,
      data: {
        id: data.id,
        orderNo: data.order_no
      },
      message: '报修提交成功',
      code: 201
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 取消报修
 * POST /api/repairs/:id/cancel
 */
export const cancelRepair = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.userId

    // 检查报修记录
    const { data: existing, error: fetchError } = await supabase
      .from('repairs')
      .select('submitter_id, status')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return res.status(404).json({
        success: false,
        message: '报修记录不存在',
        code: 404
      })
    }

    if (existing.submitter_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '只能取消自己的报修',
        code: 403
      })
    }

    if (!['pending', 'accepted'].includes(existing.status)) {
      return res.status(400).json({
        success: false,
        message: '当前状态不可取消',
        code: 400
      })
    }

    const { error } = await supabase
      .from('repairs')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('取消报修失败:', error)
      return res.status(500).json({
        success: false,
        message: '取消失败',
        code: 500
      })
    }

    return res.json({
      success: true,
      message: '已取消报修',
      code: 200
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 评价报修
 * POST /api/repairs/:id/rate
 */
export const rateRepair = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const userId = (req as any).user?.userId
    const { rating, feedback } = req.body

    // 验证评分
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: '评分必须在1-5之间',
        code: 400
      })
    }

    // 检查报修记录
    const { data: existing, error: fetchError } = await supabase
      .from('repairs')
      .select('submitter_id, status, rating')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return res.status(404).json({
        success: false,
        message: '报修记录不存在',
        code: 404
      })
    }

    if (existing.submitter_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '只能评价自己的报修',
        code: 403
      })
    }

    if (existing.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: '只能评价已完成的报修',
        code: 400
      })
    }

    if (existing.rating) {
      return res.status(400).json({
        success: false,
        message: '已经评价过了',
        code: 400
      })
    }

    const { error } = await supabase
      .from('repairs')
      .update({
        rating,
        feedback: feedback || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('评价报修失败:', error)
      return res.status(500).json({
        success: false,
        message: '评价失败',
        code: 500
      })
    }

    return res.json({
      success: true,
      message: '评价成功',
      code: 200
    })
  } catch (error) {
    next(error)
  }
}

/**
 * 格式化报修数据
 */
function formatRepair(item: any) {
  return {
    id: item.id,
    orderNo: item.order_no,
    category: item.category,
    title: item.title,
    description: item.description,
    images: item.images,
    location: item.location,
    building: item.building,
    unit: item.unit,
    room: item.room,
    contactPerson: item.contact_person,
    contactPhone: item.contact_phone,
    submitterId: item.submitter_id,
    handlerId: item.handler_id,
    handlerName: null as string | null,
    status: item.status,
    priority: item.priority,
    scheduledAt: item.scheduled_at,
    completedAt: item.completed_at,
    rating: item.rating,
    feedback: item.feedback,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }
}
