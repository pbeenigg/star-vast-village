import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'
import type { UserInfo } from '@/types'
import request from '@/utils/request'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  userInfo: UserInfo | null
  setToken: (token: string) => void
  setUserInfo: (userInfo: UserInfo) => void
  login: (code: string) => Promise<void>
  logout: () => void
  updateUserInfo: (userInfo: Partial<UserInfo>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      userInfo: null,

      setToken: (token) => {
        set({ token, isAuthenticated: !!token })
      },

      setUserInfo: (userInfo) => {
        set({ userInfo })
      },

      login: async (code) => {
        try {
          const res = await request.post('/api/auth/login', { code })
          
          if (res.success && res.data) {
            const { token, userInfo } = res.data
            set({ token, userInfo, isAuthenticated: true })
            
            Taro.showToast({
              title: '登录成功',
              icon: 'success'
            })
          }
        } catch (error: any) {
          Taro.showToast({
            title: error.message || '登录失败',
            icon: 'none'
          })
          throw error
        }
      },

      logout: () => {
        set({ token: null, userInfo: null, isAuthenticated: false })
        Taro.removeStorageSync('auth-storage')
        
        Taro.showToast({
          title: '已退出登录',
          icon: 'success'
        })
      },

      updateUserInfo: (userInfo) => {
        const currentUserInfo = get().userInfo
        if (currentUserInfo) {
          set({ userInfo: { ...currentUserInfo, ...userInfo } })
        }
      }
    }),
    {
      name: 'auth-storage',
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
