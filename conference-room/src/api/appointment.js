import request from '@/utils/request'


export function createAppointment(data) {
  return request({
    url: '/reservations',
    method: 'post',
    data
  })
}

/**
 * 生成签到二维码令牌（预约发起人或管理员）
 */
export function createCheckinToken(id, data) {
  return request({
    url: `/reservations/${id}/checkin-token`,
    method: 'post',
    data
  })
}

/**
 * 二维码签到（可匿名，建议登录）
 */
export function qrCheckin(data) {
  return request({
    url: '/checkins/qr',
    method: 'post',
    data
  })
}


export function getAppointmentList(params) {
  return request({
    url: '/reservations',
    method: 'get',
    params
  })
}

/**
 * 获取预约详情
 */
export function getAppointmentDetail(id) {
  return request({
    url: `/reservations/${id}`,
    method: 'get'
  })
}

/**
 * 更新预约
 */
export function updateAppointment(id, data) {
  return request({
    url: `/reservations/${id}`,
    method: 'put',
    data
  })
}

/**
 * 取消预约
 */
export function cancelAppointment(id, data) {
  return request({
    url: `/reservations/${id}/cancel`,
    method: 'post',
    data
  })
}
