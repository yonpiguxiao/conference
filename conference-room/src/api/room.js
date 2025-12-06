import request from '@/utils/request'

// 分页查询会议室列表
export function getRoomPage(page = 1, pageSize = 20, keyword = null, status = null, minCapacity = null, location = null) {
  return request({
    url: '/rooms',
    method: 'get',
    params: {
      page,
      page_size: pageSize,
      keyword,
      status,
      min_capacity: minCapacity,
      location
    }
  })
}

// 根据ID获取会议室详情
export function getRoomById(id) {
  return request({
    url: `/room/${id}`,
    method: 'get'
  })
}
