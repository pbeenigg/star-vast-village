import Taro from '@tarojs/taro'

class Storage {
  set(key: string, value: any): void {
    try {
      const data = JSON.stringify(value)
      Taro.setStorageSync(key, data)
    } catch (error) {
      console.error('Storage set error:', error)
    }
  }

  get<T = any>(key: string, defaultValue?: T): T | null {
    try {
      const data = Taro.getStorageSync(key)
      if (data) {
        return JSON.parse(data) as T
      }
      return defaultValue || null
    } catch (error) {
      console.error('Storage get error:', error)
      return defaultValue || null
    }
  }

  remove(key: string): void {
    try {
      Taro.removeStorageSync(key)
    } catch (error) {
      console.error('Storage remove error:', error)
    }
  }

  clear(): void {
    try {
      Taro.clearStorageSync()
    } catch (error) {
      console.error('Storage clear error:', error)
    }
  }

  async setAsync(key: string, value: any): Promise<void> {
    try {
      const data = JSON.stringify(value)
      await Taro.setStorage({ key, data })
    } catch (error) {
      console.error('Storage setAsync error:', error)
    }
  }

  async getAsync<T = any>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      const { data } = await Taro.getStorage({ key })
      if (data) {
        return JSON.parse(data) as T
      }
      return defaultValue || null
    } catch (error) {
      console.error('Storage getAsync error:', error)
      return defaultValue || null
    }
  }
}

export default new Storage()
