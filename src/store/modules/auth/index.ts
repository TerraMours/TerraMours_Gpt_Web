import { defineStore } from 'pinia'
import { getImgKey, getToken, removeToken, setImgKey, setToken } from './helper'
import { store } from '@/store/helper'
import { fetchSession } from '@/api'

interface SessionResponse {
  auth: boolean
  model: 'ChatGPTAPI' | 'ChatGPTUnofficialProxyAPI'
}

export interface AuthState {
  token: string | undefined
  imgKey: string | undefined
  session: SessionResponse | null
}
const htmlElement = document.querySelector('html')
const envBaseUrl = htmlElement ? htmlElement.getAttribute('env_now') : null
// 优先获取环境变量中的值，没有传再获取envconfig的值
export const baseUrl = envBaseUrl !== null ? envBaseUrl : import.meta.env.VITE_GLOB_API_URL
export const useAuthStore = defineStore('auth-store', {
  state: (): AuthState => ({
    token: getToken(),
    imgKey: getImgKey(),
    session: null,
  }),
  getters: {
    isChatGPTAPI(state): boolean {
      return state.session?.model === 'ChatGPTAPI'
    },
  },

  actions: {
    async getSession() {
      try {
        const { data } = await fetchSession<SessionResponse>()
        this.session = { ...data }
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
    },

    setToken(token: string) {
      this.token = token
      setToken(token)
    },

    removeToken() {
      this.token = undefined
      removeToken()
    },
    setImgKey(imgKey: string) {
      this.imgKey = imgKey
      setImgKey(imgKey)
    },
  },
})

export function useAuthStoreWithout() {
  return useAuthStore(store)
}
