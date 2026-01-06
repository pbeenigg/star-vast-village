import Taro from '@tarojs/taro'

export enum Platform {
  WEAPP = 'weapp',
  XHS = 'xhs',
  H5 = 'h5',
  UNKNOWN = 'unknown'
}

class PlatformUtil {
  getPlatform(): Platform {
    const env = Taro.getEnv()
    
    if (env === Taro.ENV_TYPE.WEAPP) {
      return Platform.WEAPP
    }
    
    if (env === Taro.ENV_TYPE.WEB) {
      return Platform.H5
    }
    
    if (this.isXiaohongshu()) {
      return Platform.XHS
    }
    
    return Platform.UNKNOWN
  }

  private isXiaohongshu(): boolean {
    try {
      return typeof (window as any).xhs !== 'undefined'
    } catch {
      return false
    }
  }

  isWeapp(): boolean {
    return this.getPlatform() === Platform.WEAPP
  }

  isXhs(): boolean {
    return this.getPlatform() === Platform.XHS
  }

  isH5(): boolean {
    return this.getPlatform() === Platform.H5
  }

  share(options: { title: string; path?: string; imageUrl?: string }) {
    const platform = this.getPlatform()
    
    if (platform === Platform.WEAPP || platform === Platform.XHS) {
      return {
        title: options.title,
        path: options.path || '/pages/index/index',
        imageUrl: options.imageUrl
      }
    }
    
    if (platform === Platform.H5) {
      if (navigator.share) {
        navigator.share({
          title: options.title,
          url: window.location.href
        })
      }
    }
  }

  getAppId(): string {
    const platform = this.getPlatform()
    
    if (platform === Platform.WEAPP) {
      return process.env.TARO_APP_WECHAT_APPID || ''
    }
    
    if (platform === Platform.XHS) {
      return process.env.TARO_APP_XHS_APPID || ''
    }
    
    return ''
  }
}

export const platformUtil = new PlatformUtil()
