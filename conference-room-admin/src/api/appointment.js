import request from '@/utils/request'


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
 * 审批预约（通过/驳回）
 * POST /reservations/{id}/approval
 */
export function approve(id, payload) {
  return request({
    url: `/reservations/${id}/approval`,
    method: 'post',
    data: payload
  })
}
