import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'

type FontSize = 'normal' | 'large' | 'xlarge'
type Theme = 'light' | 'dark'

interface AppState {
  fontSize: FontSize
  theme: Theme
  enableVoice: boolean
  enableDebug: boolean
  setFontSize: (size: FontSize) => void
  setTheme: (theme: Theme) => void
  toggleVoice: () => void
  toggleDebug: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      fontSize: 'normal',
      theme: 'light',
      enableVoice: false,
      enableDebug: process.env.TARO_APP_ENABLE_DEBUG === 'true',

      setFontSize: (fontSize) => {
        set({ fontSize })
        
        const fontSizeMap = {
          normal: '16px',
          large: '18px',
          xlarge: '20px'
        }
        
        if (Taro.getEnv() === Taro.ENV_TYPE.WEB) {
          document.documentElement.style.fontSize = fontSizeMap[fontSize]
        }
      },

      setTheme: (theme) => {
        set({ theme })
        
        if (Taro.getEnv() === Taro.ENV_TYPE.WEB) {
          document.documentElement.setAttribute('data-theme', theme)
        }
      },

      toggleVoice: () => {
        set({ enableVoice: !get().enableVoice })
      },

      toggleDebug: () => {
        set({ enableDebug: !get().enableDebug })
      }
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const value = Taro.getStorageSync(name)
          return value || null
        },
        setItem: (name, value) => {
          Taro.setStorageSync(name, value)
        },
        removeItem: (name) => {
          Taro.removeStorageSync(name)
        }
      }))
    }
  )
)
