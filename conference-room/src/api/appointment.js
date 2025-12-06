import request from '@/utils/request'


export function createAppointment(data) {
  return request({
    url: '/reservations',
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
