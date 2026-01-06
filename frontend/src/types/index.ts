// 用户相关类型定义
export interface UserInfo {
  id: string
  openid: string
  platform: Platform
  nickname: string | null
  avatar: string | null
  phone?: string | null
  role: UserRole
  authStatus: AuthStatus
  // 住址信息
  building?: string | null
  unit?: string | null
  room?: string | null
  // 时间戳
  lastLoginAt?: string | null
  createdAt: string
  updatedAt: string
}

// 住户认证申请数据
export interface CertificationData {
  realName: string
  idCard: string
  building: string
  unit: string
  room: string
  phone?: string
}

// 更新用户资料数据
export interface UpdateProfileData {
  nickname?: string
  avatar?: string
  phone?: string
}

export type Platform = 'wechat' | 'xiaohongshu' | 'h5'

export enum UserRole {
  RESIDENT = 'resident',
  ADMIN = 'admin',
  VOLUNTEER = 'volunteer',
  MERCHANT = 'merchant'
}

export enum AuthStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message: string
  code: number
}

// 分页响应类型
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// 公告类型
export interface Announcement {
  id: string
  title: string
  content: string
  category: 'emergency' | 'notice' | 'activity' | 'maintenance'
  coverImage?: string | null
  images?: string[] | null
  publisherId: string
  authorName?: string
  publishedAt: string
  viewCount: number
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

// 分页结果类型
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// 商家类型
export interface Merchant {
  id: string
  name: string
  category: 'restaurant' | 'supermarket' | 'repair' | 'education' | 'healthcare' | 'beauty' | 'other'
  description?: string | null
  logo?: string | null
  images?: string[] | null
  contactPerson?: string | null
  phone: string
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  businessHours?: string | null
  tags?: string[] | null
  rating: number
  reviewCount: number
  isVerified: boolean
  isActive: boolean
  ownerId?: string | null
  createdAt: string
  updatedAt: string
}

// 社区帖子类型
export interface Post {
  id: string
  type: 'help' | 'lost_found' | 'share' | 'discussion' | 'second_hand'
  title: string
  content: string
  images?: string[] | null
  authorId: string
  authorName?: string | null
  authorAvatar?: string | null
  viewCount: number
  likeCount: number
  commentCount: number
  status: 'pending' | 'approved' | 'rejected' | 'closed'
  isResolved: boolean
  tags?: string[] | null
  createdAt: string
  updatedAt: string
}

// 报修类型
export interface Repair {
  id: string
  orderNo: string
  category: 'water' | 'electric' | 'door' | 'elevator' | 'public_facility' | 'other'
  title: string
  description: string
  images?: string[] | null
  location?: string | null
  building?: string | null
  unit?: string | null
  room?: string | null
  contactPerson?: string | null
  contactPhone: string
  submitterId: string
  handlerId?: string | null
  handlerName?: string | null
  status: 'pending' | 'accepted' | 'processing' | 'completed' | 'cancelled'
  priority: number
  scheduledAt?: string | null
  completedAt?: string | null
  rating?: number | null
  feedback?: string | null
  createdAt: string
  updatedAt: string
}

export type RepairStatus = 'pending' | 'accepted' | 'processing' | 'completed' | 'cancelled'

// 团购活动类型
export interface GroupBuyActivity {
  id: string
  title: string
  description: string
  images?: string[]
  startTime: string
  endTime: string
  minParticipants: number
  maxParticipants: number
  currentParticipants: number
  status: GroupBuyStatus
  organizerId: string
  organizerName: string
}

export enum GroupBuyStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// 设施预约类型
export interface FacilityBooking {
  id: string
  facilityId: string
  facilityName: string
  bookingDate: string
  startTime: string
  endTime: string
  userId: string
  userName: string
  phone: string
  status: BookingStatus
  createdAt: string
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

// 投票类型
export interface Vote {
  id: string
  title: string
  description: string
  options: VoteOption[]
  startTime: string
  endTime: string
  totalVotes: number
  status: VoteStatus
  creatorId: string
  creatorName: string
}

export interface VoteOption {
  id: string
  content: string
  voteCount: number
}

export enum VoteStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  ENDED = 'ended'
}

// 捐赠类型
export interface Donation {
  id: string
  title: string
  description: string
  amount: number
  donorId: string
  donorName: string
  isAnonymous: boolean
  createdAt: string
}
