import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { message } from 'ant-design-vue'
import { getToken, removeToken } from '@/utils/auth'
import router from '@/router'

const http = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// 请求拦截：注入 Token
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截：统一错误处理
http.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response
    // 后端统一返回 { code, message, data }
    if (data.code !== undefined && data.code !== 200) {
      message.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message))
    }
    return data
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        removeToken()
        router.push('/login')
        message.error('登录已过期，请重新登录')
      } else {
        message.error(data?.message || `请求错误 (${status})`)
      }
    } else {
      message.error('网络异常，请检查连接')
    }
    return Promise.reject(error)
  }
)

export default http
