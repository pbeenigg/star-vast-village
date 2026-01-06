-- ========================================
-- TOD社区小程序 - 数据库初始化脚本
-- ========================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 用户表
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  openid VARCHAR(100) UNIQUE NOT NULL,
  platform VARCHAR(20) NOT NULL DEFAULT 'weapp',
  nickname VARCHAR(100),
  avatar TEXT,
  phone VARCHAR(20),
  real_name VARCHAR(100),
  id_card VARCHAR(18),
  auth_status VARCHAR(20) DEFAULT 'pending',
  role VARCHAR(20) DEFAULT 'resident',
  building VARCHAR(50),
  unit VARCHAR(50),
  room VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid);
CREATE INDEX IF NOT EXISTS idx_users_platform ON users(platform);
CREATE INDEX IF NOT EXISTS idx_users_auth_status ON users(auth_status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 公告表
-- ========================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority INTEGER DEFAULT 0,
  cover_image TEXT,
  images TEXT[],
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  expired_at TIMESTAMP WITH TIME ZONE,
  target_buildings TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements(category);
CREATE INDEX IF NOT EXISTS idx_announcements_is_published ON announcements(is_published);
CREATE INDEX IF NOT EXISTS idx_announcements_published_at ON announcements(published_at DESC);

CREATE TRIGGER update_announcements_updated_at
BEFORE UPDATE ON announcements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 商家表
-- ========================================
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  logo TEXT,
  images TEXT[],
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  business_hours JSONB,
  tags TEXT[],
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchants_category ON merchants(category);
CREATE INDEX IF NOT EXISTS idx_merchants_is_verified ON merchants(is_verified);
CREATE INDEX IF NOT EXISTS idx_merchants_rating ON merchants(rating DESC);

CREATE TRIGGER update_merchants_updated_at
BEFORE UPDATE ON merchants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 社区帖子表
-- ========================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  images TEXT[],
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  is_resolved BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 报修表
-- ========================================
CREATE TABLE IF NOT EXISTS repairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_no VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  images TEXT[],
  location VARCHAR(200),
  building VARCHAR(50),
  unit VARCHAR(50),
  room VARCHAR(50),
  contact_person VARCHAR(100),
  contact_phone VARCHAR(20),
  submitter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  handler_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending',
  priority INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  rating INTEGER,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_repairs_order_no ON repairs(order_no);
CREATE INDEX IF NOT EXISTS idx_repairs_status ON repairs(status);
CREATE INDEX IF NOT EXISTS idx_repairs_category ON repairs(category);
CREATE INDEX IF NOT EXISTS idx_repairs_submitter_id ON repairs(submitter_id);

CREATE TRIGGER update_repairs_updated_at
BEFORE UPDATE ON repairs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 团购活动表
-- ========================================
CREATE TABLE IF NOT EXISTS group_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  cover_image TEXT,
  images TEXT[],
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
  organizer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  target_buildings TEXT[],
  min_participants INTEGER DEFAULT 1,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_activities_status ON group_activities(status);
CREATE INDEX IF NOT EXISTS idx_group_activities_organizer_id ON group_activities(organizer_id);
CREATE INDEX IF NOT EXISTS idx_group_activities_end_time ON group_activities(end_time);

CREATE TRIGGER update_group_activities_updated_at
BEFORE UPDATE ON group_activities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 团购商品表
-- ========================================
CREATE TABLE IF NOT EXISTS group_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID REFERENCES group_activities(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  spec VARCHAR(100),
  unit VARCHAR(20),
  price DECIMAL(10,2),
  min_qty INTEGER DEFAULT 1,
  per_user_limit INTEGER,
  stock_limit INTEGER,
  current_stock INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_items_activity_id ON group_items(activity_id);

CREATE TRIGGER update_group_items_updated_at
BEFORE UPDATE ON group_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 团购订单表
-- ========================================
CREATE TABLE IF NOT EXISTS group_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID REFERENCES group_activities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  building VARCHAR(50) NOT NULL,
  room_no VARCHAR(50) NOT NULL,
  contact_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_orders_activity_id ON group_orders(activity_id);
CREATE INDEX IF NOT EXISTS idx_group_orders_user_id ON group_orders(user_id);

CREATE TRIGGER update_group_orders_updated_at
BEFORE UPDATE ON group_orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 设施表
-- ========================================
CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  location VARCHAR(200),
  images TEXT[],
  max_duration INTEGER DEFAULT 120,
  advance_days INTEGER DEFAULT 7,
  opening_hours JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_facilities_category ON facilities(category);
CREATE INDEX IF NOT EXISTS idx_facilities_is_active ON facilities(is_active);

CREATE TRIGGER update_facilities_updated_at
BEFORE UPDATE ON facilities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 设施预约表
-- ========================================
CREATE TABLE IF NOT EXISTS facility_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  purpose TEXT,
  participants_count INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'pending',
  cancel_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_facility_bookings_facility_id ON facility_bookings(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_bookings_user_id ON facility_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_facility_bookings_date ON facility_bookings(booking_date);

CREATE TRIGGER update_facility_bookings_updated_at
BEFORE UPDATE ON facility_bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 投票表
-- ========================================
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL DEFAULT 'single',
  options JSONB NOT NULL,
  max_choices INTEGER DEFAULT 1,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  target_buildings TEXT[],
  show_result_before_end BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT false,
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_votes_status ON votes(status);
CREATE INDEX IF NOT EXISTS idx_votes_creator_id ON votes(creator_id);

CREATE TRIGGER update_votes_updated_at
BEFORE UPDATE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 投票记录表
-- ========================================
CREATE TABLE IF NOT EXISTS vote_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vote_id UUID REFERENCES votes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  choices JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vote_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_vote_records_vote_id ON vote_records(vote_id);
CREATE INDEX IF NOT EXISTS idx_vote_records_user_id ON vote_records(user_id);

-- ========================================
-- 捐赠记录表
-- ========================================
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  donor_nickname VARCHAR(100),
  is_anonymous BOOLEAN DEFAULT false,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);

-- ========================================
-- 财务账本表
-- ========================================
CREATE TABLE IF NOT EXISTS ledgers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(20) NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  related_id UUID,
  related_type VARCHAR(50),
  operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ledgers_type ON ledgers(type);
CREATE INDEX IF NOT EXISTS idx_ledgers_category ON ledgers(category);
CREATE INDEX IF NOT EXISTS idx_ledgers_created_at ON ledgers(created_at DESC);

-- ========================================
-- 通知表
-- ========================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  related_id UUID,
  related_type VARCHAR(50),
  link_url VARCHAR(500),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ========================================
-- 初始化完成
-- ========================================
SELECT 'Database initialization completed successfully!' AS status;
