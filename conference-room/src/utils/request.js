import axios from 'axios'
import { getToken } from '@/utils/cookie.js'

// 创建 axios 实例
const service = axios.create({
  baseURL: '/dev-api', // API 的基础 URL，根据实际情况配置
  timeout: 5000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  error => {
    // 对请求错误做些什么
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    const res = response.data
    console.log('响应数据:', res)
    
    // 如果返回的状态码不是 200，则判断为错误
    if (res.code !== 0) {
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    // 对响应错误做点什么
    console.log('err' + error)
    return Promise.reject(error)
  }
)

export default service
