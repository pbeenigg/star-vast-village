# 星瀚邨社区小程序 - 数据库设计文档

## 一、数据库概览

**数据库类型**: PostgreSQL (Supabase)  
**字符集**: UTF-8  
**时区**: Asia/Shanghai

---

## 二、核心表设计

### 2.1 用户表（users）

**表名**: `users`  
**说明**: 存储用户基本信息和认证状态

```sql
CREATE TABLE users (
  -- 主键
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 平台信息
  openid VARCHAR(100) UNIQUE NOT NULL COMMENT '用户唯一标识（微信/小红书）',
  platform VARCHAR(20) NOT NULL DEFAULT 'wechat' COMMENT '平台类型：wechat, xiaohongshu',
  
  -- 基本信息
  nickname VARCHAR(100) COMMENT '用户昵称',
  avatar TEXT COMMENT '头像URL',
  phone VARCHAR(20) COMMENT '手机号',
  
  -- 认证信息
  auth_status VARCHAR(20) DEFAULT 'pending' COMMENT '认证状态：pending-待审核, verified-已认证, rejected-已拒绝',
  role VARCHAR(20) DEFAULT 'resident' COMMENT '角色：resident-住户, admin-管理员, volunteer-志愿者, merchant-商家',
  
  -- 住址信息
  building VARCHAR(50) COMMENT '楼栋号',
  unit VARCHAR(50) COMMENT '单元号',
  room VARCHAR(50) COMMENT '房间号',
  
  -- 敏感信息（加密存储）
  id_card_encrypted TEXT COMMENT '加密的身份证号',
  real_name_encrypted TEXT COMMENT '加密的真实姓名',
  
  -- 状态
  is_active BOOLEAN DEFAULT true COMMENT '是否激活',
  last_login_at TIMESTAMP WITH TIME ZONE COMMENT '最后登录时间',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_users_openid ON users(openid);
CREATE INDEX idx_users_platform ON users(platform);
CREATE INDEX idx_users_auth_status ON users(auth_status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_building ON users(building);
CREATE INDEX idx_users_phone ON users(phone);

-- 更新时间触发器
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 注释
COMMENT ON TABLE users IS '用户表';
COMMENT ON COLUMN users.openid IS '用户唯一标识（微信openid或小红书uid）';
COMMENT ON COLUMN users.auth_status IS '认证状态：pending-待审核, verified-已认证, rejected-已拒绝';
COMMENT ON COLUMN users.role IS '角色：resident-住户, admin-管理员, volunteer-志愿者, merchant-商家';
```

---

### 2.2 公告表（announcements）

**表名**: `announcements`  
**说明**: 存储社区公告信息

```sql
CREATE TABLE announcements (
  -- 主键
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 基本信息
  title VARCHAR(200) NOT NULL COMMENT '公告标题',
  content TEXT NOT NULL COMMENT '公告内容',
  category VARCHAR(50) NOT NULL COMMENT '分类：emergency-紧急通知, notice-日常公告, activity-活动信息, maintenance-维修通知',
  priority INTEGER DEFAULT 0 COMMENT '优先级：0-普通, 1-重要, 2-紧急',
  
  -- 媒体资源
  cover_image TEXT COMMENT '封面图片URL',
  images TEXT[] COMMENT '图片数组',
  
  -- 作者信息
  author_id UUID REFERENCES users(id) ON DELETE SET NULL COMMENT '发布者ID',
  
  -- 统计信息
  view_count INTEGER DEFAULT 0 COMMENT '浏览次数',
  like_count INTEGER DEFAULT 0 COMMENT '点赞次数',
  
  -- 状态控制
  is_pinned BOOLEAN DEFAULT false COMMENT '是否置顶',
  is_published BOOLEAN DEFAULT false COMMENT '是否已发布',
  published_at TIMESTAMP WITH TIME ZONE COMMENT '发布时间',
  expired_at TIMESTAMP WITH TIME ZONE COMMENT '过期时间',
  
  -- 目标范围
  target_buildings TEXT[] COMMENT '目标楼栋数组，空数组表示全部',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_announcements_category ON announcements(category);
CREATE INDEX idx_announcements_priority ON announcements(priority DESC);
CREATE INDEX idx_announcements_is_published ON announcements(is_published);
CREATE INDEX idx_announcements_published_at ON announcements(published_at DESC);
CREATE INDEX idx_announcements_author_id ON announcements(author_id);
CREATE INDEX idx_announcements_is_pinned ON announcements(is_pinned);

-- 全文搜索索引
CREATE INDEX idx_announcements_search ON announcements 
USING gin(to_tsvector('chinese', title || ' ' || content));

-- 更新时间触发器
CREATE TRIGGER update_announcements_updated_at
BEFORE UPDATE ON announcements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 注释
COMMENT ON TABLE announcements IS '社区公告表';
COMMENT ON COLUMN announcements.category IS '分类：emergency-紧急通知, notice-日常公告, activity-活动信息, maintenance-维修通知';
COMMENT ON COLUMN announcements.priority IS '优先级：0-普通, 1-重要, 2-紧急';
```

---

### 2.3 商家表（merchants）

**表名**: `merchants`  
**说明**: 存储商家信息

```sql
CREATE TABLE merchants (
  -- 主键
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 基本信息
  name VARCHAR(200) NOT NULL COMMENT '商家名称',
  category VARCHAR(50) NOT NULL COMMENT '分类：restaurant-餐饮, supermarket-超市, repair-维修, education-教育, healthcare-医疗等',
  description TEXT COMMENT '商家描述',
  
  -- 媒体资源
  logo TEXT COMMENT '商家Logo',
  images TEXT[] COMMENT '商家图片数组',
  
  -- 联系信息
  contact_person VARCHAR(100) COMMENT '联系人',
  phone VARCHAR(20) COMMENT '联系电话',
  address TEXT COMMENT '详细地址',
  location GEOGRAPHY(POINT) COMMENT '地理位置（PostGIS）',
  
  -- 营业信息
  business_hours JSONB COMMENT '营业时间JSON：{"monday": "09:00-21:00", ...}',
  tags TEXT[] COMMENT '标签数组',
  
  -- 评价信息
  rating DECIMAL(3,2) DEFAULT 0.00 COMMENT '评分（0.00-5.00）',
  review_count INTEGER DEFAULT 0 COMMENT '评价数量',
  
  -- 状态
  is_verified BOOLEAN DEFAULT false COMMENT '是否认证',
  is_active BOOLEAN DEFAULT true COMMENT '是否营业中',
  
  -- 关联信息
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL COMMENT '商家所有者ID',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_merchants_category ON merchants(category);
CREATE INDEX idx_merchants_is_verified ON merchants(is_verified);
CREATE INDEX idx_merchants_is_active ON merchants(is_active);
CREATE INDEX idx_merchants_rating ON merchants(rating DESC);
CREATE INDEX idx_merchants_location ON merchants USING GIST(location);
CREATE INDEX idx_merchants_owner_id ON merchants(owner_id);

-- 全文搜索索引
CREATE INDEX idx_merchants_search ON merchants 
USING gin(to_tsvector('chinese', name || ' ' || COALESCE(description, '')));

-- 更新时间触发器
CREATE TRIGGER update_merchants_updated_at
BEFORE UPDATE ON merchants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 注释
COMMENT ON TABLE merchants IS '商家黄页表';
COMMENT ON COLUMN merchants.location IS '地理位置（PostGIS POINT类型）';
COMMENT ON COLUMN merchants.business_hours IS '营业时间JSON格式';
```

---

### 2.4 社区帖子表（posts）

**表名**: `posts`  
**说明**: 存储邻里互助、失物招领等社区帖子

```sql
CREATE TABLE posts (
  -- 主键
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 基本信息
  type VARCHAR(50) NOT NULL COMMENT '类型：help-求助, lost_found-失物招领, share-经验分享, discussion-讨论交流, second_hand-二手交易',
  title VARCHAR(200) NOT NULL COMMENT '帖子标题',
  content TEXT NOT NULL COMMENT '帖子内容',
  images TEXT[] COMMENT '图片数组',
  
  -- 作者信息
  author_id UUID REFERENCES users(id) ON DELETE CASCADE COMMENT '作者ID',
  
  -- 统计信息
  view_count INTEGER DEFAULT 0 COMMENT '浏览次数',
  like_count INTEGER DEFAULT 0 COMMENT '点赞次数',
  comment_count INTEGER DEFAULT 0 COMMENT '评论数量',
  
  -- 状态控制
  status VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending-待审核, approved-已通过, rejected-已拒绝, closed-已关闭',
  is_resolved BOOLEAN DEFAULT false COMMENT '是否已解决（用于求助帖）',
  
  -- 标签
  tags TEXT[] COMMENT '标签数组',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_is_resolved ON posts(is_resolved);

-- 全文搜索索引
CREATE INDEX idx_posts_search ON posts 
USING gin(to_tsvector('chinese', title || ' ' || content));

-- 更新时间触发器
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 注释
COMMENT ON TABLE posts IS '社区帖子表';
COMMENT ON COLUMN posts.type IS '类型：help-求助, lost_found-失物招领, share-经验分享, discussion-讨论交流, second_hand-二手交易';
COMMENT ON COLUMN posts.status IS '状态：pending-待审核, approved-已通过, rejected-已拒绝, closed-已关闭';
```

---

### 2.5 报修表（repairs）

**表名**: `repairs`  
**说明**: 存储在线报修工单信息

```sql
CREATE TABLE repairs (
  -- 主键
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 工单信息
  order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '工单号（格式：WX202501050001）',
  category VARCHAR(50) NOT NULL COMMENT '分类：water-水管, electric-电路, door-门窗, elevator-电梯, public_facility-公共设施等',
  title VARCHAR(200) NOT NULL COMMENT '报修标题',
  description TEXT NOT NULL COMMENT '问题描述',
  images TEXT[] COMMENT '现场图片数组',
  
  -- 位置信息
  location VARCHAR(200) COMMENT '具体位置描述',
  building VARCHAR(50) COMMENT '楼栋号',
  unit VARCHAR(50) COMMENT '单元号',
  room VARCHAR(50) COMMENT '房间号',
  
  -- 联系信息
  contact_person VARCHAR(100) COMMENT '联系人',
  contact_phone VARCHAR(20) COMMENT '联系电话',
  
  -- 关联用户
  submitter_id UUID REFERENCES users(id) ON DELETE SET NULL COMMENT '提交者ID',
  handler_id UUID REFERENCES users(id) ON DELETE SET NULL COMMENT '处理者ID',
  
  -- 状态控制
  status VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending-待接单, accepted-已接单, processing-处理中, completed-已完成, cancelled-已取消',
  priority INTEGER DEFAULT 0 COMMENT '优先级：0-普通, 1-重要, 2-紧急',
  
  -- 时间信息
  scheduled_at TIMESTAMP WITH TIME ZONE COMMENT '预约上门时间',
  completed_at TIMESTAMP WITH TIME ZONE COMMENT '完成时间',
  
  -- 评价信息
  rating INTEGER COMMENT '评分（1-5星）',
  feedback TEXT COMMENT '用户反馈',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_repairs_order_no ON repairs(order_no);
CREATE INDEX idx_repairs_status ON repairs(status);
CREATE INDEX idx_repairs_category ON repairs(category);
CREATE INDEX idx_repairs_submitter_id ON repairs(submitter_id);
CREATE INDEX idx_repairs_handler_id ON repairs(handler_id);
CREATE INDEX idx_repairs_created_at ON repairs(created_at DESC);
CREATE INDEX idx_repairs_building ON repairs(building);

-- 更新时间触发器
CREATE TRIGGER update_repairs_updated_at
BEFORE UPDATE ON repairs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 注释
COMMENT ON TABLE repairs IS '在线报修工单表';
COMMENT ON COLUMN repairs.order_no IS '工单号（格式：WX202501050001）';
COMMENT ON COLUMN repairs.status IS '状态：pending-待接单, accepted-已接单, processing-处理中, completed-已完成, cancelled-已取消';
```

---

### 2.6 团购活动表（group_activities）

**表名**: `group_activities`  
**说明**: 存储接龙团购活动信息

```sql
CREATE TABLE group_activities (
  -- 主键
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 基本信息
  title VARCHAR(200) NOT NULL COMMENT '活动标题',
  description TEXT COMMENT '活动描述',
  category VARCHAR(50) COMMENT '分类：food-食品, daily-日用品, electronics-电子产品等',
  
  -- 媒体资源
  cover_image TEXT COMMENT '封面图片',
  images TEXT[] COMMENT '详情图片数组',
  
  -- 关联信息
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL COMMENT '关联商家ID',
  organizer_id UUID REFERENCES users(id) ON DELETE CASCADE COMMENT '组织者ID',
  
  -- 时间控制
  start_time TIMESTAMP WITH TIME ZONE NOT NULL COMMENT '开始时间',
  end_time TIMESTAMP WITH TIME ZONE NOT NULL COMMENT '截止时间',
  
  -- 范围控制
  target_buildings TEXT[] COMMENT '目标楼栋数组，空数组表示全部',
  
  -- 参与限制
  min_participants INTEGER DEFAULT 1 COMMENT '最少参与人数（成团人数）',
  max_participants INTEGER COMMENT '最多参与人数',
  current_participants INTEGER DEFAULT 0 COMMENT '当前参与人数',
  
  -- 状态控制
  status VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending-未开始, active-进行中, ended-已截止, cancelled-已取消',
  allow_edit_before_deadline BOOLEAN DEFAULT true COMMENT '是否允许截止前修改订单',
  visible_to VARCHAR(20) DEFAULT 'authenticated' COMMENT '可见范围：authenticated-已认证用户, all-所有人',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_group_activities_status ON group_activities(status);
CREATE INDEX idx_group_activities_organizer_id ON group_activities(organizer_id);
CREATE INDEX idx_group_activities_merchant_id ON group_activities(merchant_id);
CREATE INDEX idx_group_activities_end_time ON group_activities(end_time);
CREATE INDEX idx_group_activities_category ON group_activities(category);

-- 更新时间触发器
CREATE TRIGGER update_group_activities_updated_at
BEFORE UPDATE ON group_activities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 注释
COMMENT ON TABLE group_activities IS '团购活动表';
COMMENT ON COLUMN group_activities.status IS '状态：pending-未开始, active-进行中, ended-已截止, cancelled-已取消';
```

---

### 2.7 团购商品表（group_items）

**表名**: `group_items`  
**说明**: 存储团购活动中的商品信息

```sql
CREATE TABLE group_items (
  -- 主键
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 关联活动
  activity_id UUID REFERENCES group_activities(id) ON DELETE CASCADE COMMENT '关联的团购活动ID',
  
  -- 商品信息
  name VARCHAR(200) NOT NULL COMMENT '商品名称',
  spec VARCHAR(100) COMMENT '规格（如：500g/袋）',
  unit VARCHAR(20) COMMENT '单位（如：份、斤、箱）',
  price DECIMAL(10,2) COMMENT '单价',
  show_price BOOLEAN DEFAULT true COMMENT '是否显示价格',
  
  -- 购买限制
  min_qty INTEGER DEFAULT 1 COMMENT '最小起订量',
  per_user_limit INTEGER COMMENT '每人限购数量',
  stock_limit INTEGER COMMENT '库存上限',
  current_stock INTEGER DEFAULT 0 COMMENT '当前已订数量',
  
  -- 其他设置
  need_remark BOOLEAN DEFAULT false COMMENT '是否需要备注',
  sort_order INTEGER DEFAULT 0 COMMENT '排序顺序',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_group_items_activity_id ON group_items(activity_id);
CREATE INDEX idx_group_items_sort_order ON group_items(activity_id, sort_order);

-- 更新时间触发器
CREATE TRIGGER update_group_items_updated_at
BEFORE UPDATE ON group_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 注释
COMMENT ON TABLE group_items IS '团购商品表';
COMMENT ON COLUMN group_items.activity_id IS '关联的团购活动ID';
```

---

### 2.8 团购订单表（group_orders）

**表名**: `group_orders`  
**说明**: 存储用户的团购订单信息

```sql
CREATE TABLE group_orders (
  -- 主键
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 关联信息
  activity_id UUID REFERENCES group_activities(id) ON DELETE CASCADE COMMENT '关联的团购活动ID',
  user_id UUID REFERENCES users(id) ON DELETE CASCADE COMMENT '用户ID',
  
  -- 收货信息
  building VARCHAR(50) NOT NULL COMMENT '楼栋号',
  room_no VARCHAR(50) NOT NULL COMMENT '房间号',
  contact_name VARCHAR(100) NOT NULL COMMENT '联系人姓名',
  phone VARCHAR(20) NOT NULL COMMENT '联系电话',
  
  -- 订单详情
  items JSONB NOT NULL COMMENT '商品明细JSON：[{item_id, qty, remark}]',
  total_amount DECIMAL(10,2) COMMENT '订单总金额',
  
  -- 状态控制
  status VARCHAR(20) DEFAULT 'submitted' COMMENT '状态：submitted-已提交, adjusted-已调整, picked-已取货, cancelled-已取消',
  version INTEGER DEFAULT 1 COMMENT '版本号（乐观锁）',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 唯一约束：每个用户每个活动只能有一个订单
  UNIQUE(activity_id, user_id)
);

-- 索引
CREATE INDEX idx_group_orders_activity_id ON group_orders(activity_id);
CREATE INDEX idx_group_orders_user_id ON group_orders(user_id);
CREATE INDEX idx_group_orders_building ON group_orders(building);
CREATE INDEX idx_group_orders_status ON group_orders(status);

-- 更新时间触发器
CREATE TRIGGER update_group_orders_updated_at
BEFORE UPDATE ON group_orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 注释
COMMENT ON TABLE group_orders IS '团购订单表';
COMMENT ON COLUMN group_orders.items IS '商品明细JSON格式：[{item_id, qty, remark}]';
COMMENT ON COLUMN group_orders.version IS '版本号，用于乐观锁防止并发修改';
```

---

### 2.9 设施表（facilities）

**表名**: `facilities`  
**说明**: 存储可预约的公共设施信息

```sql
CREATE TABLE facilities (
  -- 主键
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 基本信息
  name VARCHAR(200) NOT NULL COMMENT '设施名称',
  category VARCHAR(50) NOT NULL COMMENT '分类：activity_room-活动室, gym-健身房, basketball_court-篮球场等',
  description TEXT COMMENT '设施描述',
  location VARCHAR(200) COMMENT '位置',
  
  -- 媒体资源
  images TEXT[] COMMENT '设施图片数组',
  
  -- 预约规则
  booking_rules JSONB COMMENT '预约规则JSON',
  max_duration INTEGER DEFAULT 120 COMMENT '最长预约时长（分钟）',
  advance_days INTEGER DEFAULT 7 COMMENT '可提前预约天数',
  
  -- 开放时间
  opening_hours JSONB COMMENT '开放时间JSON：{"monday": ["09:00-12:00", "14:00-18:00"], ...}',
  
  -- 状态
  is_active BOOLEAN DEFAULT true COMMENT '是否开放',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_facilities_category ON facilities(category);
CREATE INDEX idx_facilities_is_active ON facilities(is_active);

-- 更新时间触发器
CREATE TRIGGER update_facilities_updated_at
BEFORE UPDATE ON facilities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 注释
COMMENT ON TABLE facilities IS '公共设施表';
COMMENT ON COLUMN facilities.opening_hours IS '开放时间JSON格式';
```

---

### 2.10 设施预约表（facility_bookings）

**表名**: `facility_bookings`  
**说明**: 存储设施预约记录

```sql
CREATE TABLE facility_bookings (
  -- 主键
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 关联信息
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE COMMENT '设施ID',
  user_id UUID REFERENCES users(id) ON DELETE CASCADE COMMENT '用户ID',
  
  -- 预约时间
  booking_date DATE NOT NULL COMMENT '预约日期',
  start_time TIME NOT NULL COMMENT '开始时间',
  end_time TIME NOT NULL COMMENT '结束时间',
  
  -- 预约详情
  purpose TEXT COMMENT '预约用途',
  participants_count INTEGER DEFAULT 1 COMMENT '参与人数',
  
  -- 状态控制
  status VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending-待确认, confirmed-已确认, cancelled-已取消, completed-已完成',
  cancel_reason TEXT COMMENT '取消原因',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_facility_bookings_facility_id ON facility_bookings(facility_id);
CREATE INDEX idx_facility_bookings_user_id ON facility_bookings(user_id);
CREATE INDEX idx_facility_bookings_date ON facility_bookings(booking_date);
CREATE INDEX idx_facility_bookings_status ON facility_bookings(status);

-- 唯一约束：防止同一设施同一时间段重复预约
CREATE UNIQUE INDEX idx_facility_bookings_unique ON facility_bookings(
  facility_id, booking_date, start_time, end_time
) WHERE status NOT IN ('cancelled');

-- 更新时间触发器
CREATE TRIGGER update_facility_bookings_updated_at
BEFORE UPDATE ON facility_bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 注释
COMMENT ON TABLE facility_bookings IS '设施预约表';
COMMENT ON COLUMN facility_bookings.status IS '状态：pending-待确认, confirmed-已确认, cancelled-已取消, completed-已完成';
```

---

### 2.11 投票表（votes）

**表名**: `votes`  
**说明**: 存储投票活动信息

```sql
CREATE TABLE votes (
  -- 主键
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 基本信息
  title VARCHAR(200) NOT NULL COMMENT '投票标题',
  description TEXT COMMENT '投票说明',
  type VARCHAR(20) NOT NULL DEFAULT 'single' COMMENT '投票类型：single-单选, multiple-多选, ranking-排序',
  
  -- 选项设置
  options JSONB NOT NULL COMMENT '选项JSON：[{id, text, image}]',
  max_choices INTEGER DEFAULT 1 COMMENT '最多可选数量（多选时有效）',
  
  -- 时间控制
  start_time TIMESTAMP WITH TIME ZONE NOT NULL COMMENT '开始时间',
  end_time TIMESTAMP WITH TIME ZONE NOT NULL COMMENT '结束时间',
  
  -- 范围控制
  target_buildings TEXT[] COMMENT '目标楼栋数组',
  
  -- 结果设置
  show_result_before_end BOOLEAN DEFAULT false COMMENT '是否在结束前显示结果',
  is_anonymous BOOLEAN DEFAULT false COMMENT '是否匿名投票',
  
  -- 创建者
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL COMMENT '创建者ID',
  
  -- 状态
  status VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending-未开始, active-进行中, ended-已结束',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_votes_status ON votes(status);
CREATE INDEX idx_votes_creator_id ON votes(creator_id);
CREATE INDEX idx_votes_end_time ON votes(end_time);

-- 更新时间触发器
CREATE TRIGGER update_votes_updated_at
BEFORE UPDATE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 注释
COMMENT ON TABLE votes IS '投票活动表';
COMMENT ON COLUMN votes.type IS '投票类型：single-单选, multiple-多选, ranking-排序';
```

---

### 2.12 投票记录表（vote_records）

**表名**: `vote_records`  
**说明**: 存储用户投票记录

```sql
CREATE TABLE vote_records (
  -- 主键
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 关联信息
  vote_id UUID REFERENCES votes(id) ON DELETE CASCADE COMMENT '投票ID',
  user_id UUID REFERENCES users(id) ON DELETE CASCADE COMMENT '用户ID',
  
  -- 投票内容
  choices JSONB NOT NULL COMMENT '选择的选项JSON：[option_id1, option_id2, ...]',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 唯一约束：每个用户每个投票只能投一次
  UNIQUE(vote_id, user_id)
);

-- 索引
CREATE INDEX idx_vote_records_vote_id ON vote_records(vote_id);
CREATE INDEX idx_vote_records_user_id ON vote_records(user_id);

-- 注释
COMMENT ON TABLE vote_records IS '投票记录表';
COMMENT ON COLUMN vote_records.choices IS '选择的选项JSON数组';
```

---

### 2.13 捐赠记录表（donations）

**表名**: `donations`  
**说明**: 存储捐赠记录

```sql
CREATE TABLE donations (
  -- 主键
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 捐赠者信息
  donor_id UUID REFERENCES users(id) ON DELETE SET NULL COMMENT '捐赠者ID',
  donor_nickname VARCHAR(100) COMMENT '捐赠者昵称（可选，保护隐私）',
  is_anonymous BOOLEAN DEFAULT false COMMENT '是否匿名捐赠',
  
  -- 捐赠金额
  amount DECIMAL(10,2) NOT NULL COMMENT '捐赠金额',
  
  -- 支付信息
  payment_method VARCHAR(50) COMMENT '支付方式：wechat-微信支付, alipay-支付宝',
  transaction_id VARCHAR(100) UNIQUE COMMENT '交易流水号',
  
  -- 状态
  status VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending-待支付, completed-已完成, refunded-已退款',
  
  -- 留言
  message TEXT COMMENT '捐赠留言',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_donations_donor_id ON donations(donor_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX idx_donations_transaction_id ON donations(transaction_id);

-- 注释
COMMENT ON TABLE donations IS '捐赠记录表';
COMMENT ON COLUMN donations.status IS '状态：pending-待支付, completed-已完成, refunded-已退款';
```

---

### 2.14 财务账本表（ledgers）

**表名**: `ledgers`  
**说明**: 存储财务收支记录

```sql
CREATE TABLE ledgers (
  -- 主键
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 类型
  type VARCHAR(20) NOT NULL COMMENT '类型：income-收入, expense-支出',
  category VARCHAR(50) NOT NULL COMMENT '分类：donation-捐赠收入, server-服务器费用, domain-域名费用, maintenance-维护费用等',
  
  -- 金额
  amount DECIMAL(10,2) NOT NULL COMMENT '金额',
  
  -- 描述
  description TEXT NOT NULL COMMENT '事由说明',
  
  -- 关联信息
  related_id UUID COMMENT '关联记录ID（如捐赠ID）',
  related_type VARCHAR(50) COMMENT '关联记录类型（如：donation）',
  
  -- 操作者
  operator_id UUID REFERENCES users(id) ON DELETE SET NULL COMMENT '操作者ID',
  
  -- 凭证
  receipt_url TEXT COMMENT '凭证图片URL',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_ledgers_type ON ledgers(type);
CREATE INDEX idx_ledgers_category ON ledgers(category);
CREATE INDEX idx_ledgers_created_at ON ledgers(created_at DESC);
CREATE INDEX idx_ledgers_operator_id ON ledgers(operator_id);

-- 注释
COMMENT ON TABLE ledgers IS '财务账本表';
COMMENT ON COLUMN ledgers.type IS '类型：income-收入, expense-支出';
COMMENT ON COLUMN ledgers.category IS '分类：donation-捐赠收入, server-服务器费用, domain-域名费用等';
```

---

### 2.15 通知表（notifications）

**表名**: `notifications`  
**说明**: 存储系统通知信息

```sql
CREATE TABLE notifications (
  -- 主键
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 接收者
  user_id UUID REFERENCES users(id) ON DELETE CASCADE COMMENT '接收者ID',
  
  -- 通知内容
  type VARCHAR(50) NOT NULL COMMENT '类型：announcement-公告, repair-报修, groupbuy-团购, vote-投票等',
  title VARCHAR(200) NOT NULL COMMENT '通知标题',
  content TEXT COMMENT '通知内容',
  
  -- 关联信息
  related_id UUID COMMENT '关联记录ID',
  related_type VARCHAR(50) COMMENT '关联记录类型',
  
  -- 跳转链接
  link_url VARCHAR(500) COMMENT '跳转链接',
  
  -- 状态
  is_read BOOLEAN DEFAULT false COMMENT '是否已读',
  read_at TIMESTAMP WITH TIME ZONE COMMENT '阅读时间',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- 注释
COMMENT ON TABLE notifications IS '系统通知表';
COMMENT ON COLUMN notifications.type IS '类型：announcement-公告, repair-报修, groupbuy-团购, vote-投票等';
```

---

## 三、辅助函数和触发器

### 3.1 更新时间戳函数

```sql
-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3.2 生成工单号函数

```sql
-- 创建生成工单号函数
CREATE OR REPLACE FUNCTION generate_order_no()
RETURNS VARCHAR AS $$
DECLARE
  prefix VARCHAR := 'WX';
  date_str VARCHAR := TO_CHAR(NOW(), 'YYYYMMDD');
  seq_num VARCHAR;
  order_no VARCHAR;
BEGIN
  -- 获取当天的序列号
  SELECT LPAD(
    (COUNT(*) + 1)::TEXT, 
    4, 
    '0'
  ) INTO seq_num
  FROM repairs
  WHERE order_no LIKE prefix || date_str || '%';
  
  order_no := prefix || date_str || seq_num;
  RETURN order_no;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器自动生成工单号
CREATE OR REPLACE FUNCTION set_repair_order_no()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_no IS NULL OR NEW.order_no = '' THEN
    NEW.order_no := generate_order_no();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_repair_order_no
BEFORE INSERT ON repairs
FOR EACH ROW
EXECUTE FUNCTION set_repair_order_no();
```

---

## 四、Row Level Security (RLS) 策略

### 4.1 用户表 RLS

```sql
-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的完整信息
CREATE POLICY users_select_own ON users
FOR SELECT
USING (auth.uid() = id);

-- 用户只能更新自己的信息
CREATE POLICY users_update_own ON users
FOR UPDATE
USING (auth.uid() = id);

-- 管理员可以查看所有用户
CREATE POLICY users_select_admin ON users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### 4.2 公告表 RLS

```sql
-- 启用 RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 所有已认证用户可以查看已发布的公告
CREATE POLICY announcements_select_published ON announcements
FOR SELECT
USING (is_published = true);

-- 管理员可以创建、更新、删除公告
CREATE POLICY announcements_admin ON announcements
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'volunteer')
  )
);
```

---

## 五、数据库初始化脚本

### 5.1 完整初始化脚本

```sql
-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 启用 PostGIS 扩展（用于地理位置）
CREATE EXTENSION IF NOT EXISTS postgis;

-- 启用中文全文搜索
CREATE EXTENSION IF NOT EXISTS zhparser;
CREATE TEXT SEARCH CONFIGURATION chinese (PARSER = zhparser);

-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建所有表（按依赖顺序）
-- 1. users
-- 2. merchants
-- 3. announcements
-- 4. posts
-- 5. repairs
-- 6. facilities
-- 7. facility_bookings
-- 8. group_activities
-- 9. group_items
-- 10. group_orders
-- 11. votes
-- 12. vote_records
-- 13. donations
-- 14. ledgers
-- 15. notifications

-- 插入初始数据（可选）
-- 管理员账户
INSERT INTO users (openid, platform, nickname, role, auth_status, is_active)
VALUES ('admin_openid', 'wechat', '系统管理员', 'admin', 'verified', true);
```

---

## 六、数据库维护

### 6.1 定期清理任务

```sql
-- 清理过期的公告
DELETE FROM announcements
WHERE expired_at < NOW() - INTERVAL '30 days';

-- 清理已读的旧通知（保留30天）
DELETE FROM notifications
WHERE is_read = true AND created_at < NOW() - INTERVAL '30 days';

-- 清理已完成的旧报修记录（保留90天）
DELETE FROM repairs
WHERE status = 'completed' AND completed_at < NOW() - INTERVAL '90 days';
```

### 6.2 性能优化建议

1. **定期 VACUUM**: 定期执行 VACUUM ANALYZE 优化表性能
2. **索引维护**: 定期检查索引使用情况，删除无用索引
3. **分区表**: 对于大表（如通知表、日志表）考虑使用分区
4. **归档策略**: 定期归档历史数据到冷存储

---

## 七、数据备份策略

### 7.1 备份方案

- **自动备份**: Supabase 提供自动备份功能
- **手动备份**: 定期导出重要数据
- **备份频率**: 每日增量备份，每周全量备份
- **备份保留**: 保留最近30天的备份

### 7.2 恢复测试

定期进行数据恢复测试，确保备份可用性。

---

**文档版本**: v1.0  
**最后更新**: 2025-01-05  
**维护者**: PbEeNiG
