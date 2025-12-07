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

// 每周会议室状态查看（周视图）
export function getWeeklyRoomStatus(startDate, days = 7, roomIds = null) {
  return request({
    url: '/admin/rooms/status/weekly',
    method: 'get',
    params: {
      startDate,
      days,
      roomIds
    }
  })
}

// 根据ID获取会议室详情
export function getRoomById(id) {
  return request({
    url: `/rooms/${id}`,
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

// 上传会议室图片（管理员）
export function uploadRoomImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/media/rooms',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
