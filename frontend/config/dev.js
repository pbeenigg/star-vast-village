module.exports = {
  env: {
    NODE_ENV: '"development"'
  },
  defineConstants: {
    'process.env.TARO_APP_API_URL': JSON.stringify(process.env.TARO_APP_API_URL || 'http://localhost:3000'),
    'process.env.TARO_APP_WECHAT_APPID': JSON.stringify(process.env.TARO_APP_WECHAT_APPID || ''),
    'process.env.TARO_APP_XHS_APPID': JSON.stringify(process.env.TARO_APP_XHS_APPID || ''),
    'process.env.TARO_APP_ENABLE_DEBUG': JSON.stringify(process.env.TARO_APP_ENABLE_DEBUG || 'true'),
    'process.env.TARO_APP_SUPABASE_URL': JSON.stringify(process.env.TARO_APP_SUPABASE_URL || ''),
    'process.env.TARO_APP_SUPABASE_ANON_KEY': JSON.stringify(process.env.TARO_APP_SUPABASE_ANON_KEY || '')
  },
  mini: {},
  h5: {}
}
