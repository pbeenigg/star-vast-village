module.exports = {
  presets: [
    [
      'taro',
      {
        framework: 'react',
        hot: true,
        ts: true,
        // H5 环境使用 polyfill
        useBuiltIns: process.env.TARO_ENV === 'h5' ? 'usage' : false,
        corejs: process.env.TARO_ENV === 'h5' ? 3 : false,
      },
    ],
  ],
}
