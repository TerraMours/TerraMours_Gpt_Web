import axios, {AxiosError, type AxiosResponse} from 'axios';
import { createDiscreteApi } from 'naive-ui'
import { useAuthStore } from '@/store'
import { router } from '@/router'

const { message, dialog } = createDiscreteApi(['message', 'dialog'])
const htmlElement = document.querySelector('html')
const envBaseUrl = htmlElement ? htmlElement.getAttribute('env_now') : null
// 优先获取环境变量中的值，没有传再获取envconfig的值
const baseUrl = envBaseUrl !== null ? envBaseUrl : import.meta.env.VITE_GLOB_API_URL
const openDialog = (isOutTime = false) => {
  const content = isOutTime ? '用户信息已过期，请重新登录' : '如需体验全部功能请登录'
  dialog.info({
    title: '温馨提示',
    content,
    positiveText: '去登录',
    negativeText: '再想想',
    onPositiveClick: async () => {
      await router.push('/login')
    },
    onNegativeClick: () => {
      message.info('期待您的体验')
    },
  })
}

const service = axios.create({
  baseURL: baseUrl,
})

service.interceptors.request.use(
  (config) => {
    const token = useAuthStore().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      config.withCredentials = true
    }
    else if (!config.url?.includes('/api/v1/Login') && !config.url?.includes('/api/v1/Email') && !config.url?.includes('/api/v1/Email')) {
      openDialog()
      return Promise.reject(new Error('当前状态未登录'))
    }
    return config
  },
  (error) => {
    return Promise.reject(error.response)
  },
)

service.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    if (response.status === 200)
      return response
    throw new Error(response.status.toString())
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401)
      openDialog(true)
    if (error.response?.status === 400)
      error.message = error.response?.data.errors.UserAccount
    return Promise.reject(error)
  },
)

export default service
