import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { config } from './index'

export const supabaseAdmin: SupabaseClient = createClient(
  config.supabase.url,
  config.supabase.serviceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from('users').select('count').limit(1)

    if (error) {
      console.error('数据库连接失败:', error)
      return false
    }

    console.log('✅ 数据库连接成功')
    return true
  } catch (error) {
    console.error('数据库连接异常:', error)
    return false
  }
}
