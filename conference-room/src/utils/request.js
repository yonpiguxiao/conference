import axios from 'axios'

// 创建 axios 实例
const service = axios.create({
  baseURL: '', // API 的基础 URL，根据实际情况配置
  timeout: 5000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('token')
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
    
    // 如果返回的状态码不是 200，则判断为错误
    if (res.code !== 200) {
      // 根据不同的错误码进行处理
      switch (res.code) {
        case 401:
          console.error('用户名或密码错误')
          break
        case 403:
          console.error('令牌失效或未登录')
          break
        case 400:
          console.error('参数缺失')
          break
        case 500:
          console.error('服务器内部错误')
          break
        default:
          console.error('未知错误')
      }
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
