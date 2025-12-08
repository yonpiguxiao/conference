import request from '@/utils/request'

// 用户登录
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

// 获取当前用户信息
export function getCurrentUser() {
  return request({
    url: '/auth/me',
    method: 'get'
  })
}

// 管理员相关接口

// 每周会议室状态查看（周视图）
export function weeklyRoomStatus(params) {
  return request({
    url: '/admin/rooms/status/weekly',
    method: 'get',
    params
  })
}


// 管理员分页查询用户列表
export function listUsers(params) {
  return request({
    url: '/admin/users',
    method: 'get',
    params
  })
}

// 管理员查询用户详情
export function getUser(id) {
  return request({
    url: `/admin/users/${id}`,
    method: 'get'
   
 })
}

// 管理员创建新用户
export function createUser(data) {
  return request({
    url: '/admin/users',
    method: 'post',
    data
  })
}

// 管理员更新用户
export function updateUser(id, data) {
  return request({
    url: `/admin/users/${id}`,
    method: 'put',
    data
  })
}

// 管理员删除用户
export function deleteUser(id) {
  return request({
    url: `/admin/users/${id}`,
    method: 'delete'
  })
}
