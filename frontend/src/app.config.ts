export default defineAppConfig({
  pages: [
    'pages/splash/index',
    'pages/index/index',
    'pages/auth/login',
    'pages/user/index',
    'pages/user/certification/index',
    'pages/user/profile/index',
    'pages/announcement/index',
    'pages/announcement/detail/index',
    'pages/merchant/index',
    'pages/merchant/detail/index',
    'pages/community/index',
    'pages/repair/index',
    'pages/repair/submit/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'TOD社区',
    navigationBarTextStyle: 'black'
  }
})
