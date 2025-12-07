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

// 新增会议室（管理员）
export function createRoom(room) {
  return request({
    url: '/rooms',
    method: 'post',
    data: room
  })
}

// 更新会议室（管理员）
export function updateRoom(id, room) {
  return request({
    url: `/rooms/${id}`,
    method: 'put',
    data: room
  })
}

// 删除会议室（管理员）
export function deleteRoom(id) {
  return request({
    url: `/rooms/${id}`,
    method: 'delete'
  })
}

// 设置会议室状态（管理员）
export function setRoomStatus(id, statusData) {
  return request({
    url: `/rooms/${id}/status`,
    method: 'put',
    data: statusData
  })
}
