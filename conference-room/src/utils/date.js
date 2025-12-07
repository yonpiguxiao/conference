/**
 * 日期时间格式化工具函数
 */

/**
 * 格式化日期时间为 yyyy-mm-dd hh:mm:ss 格式
 * @param {string|Date} dateString - 日期字符串或Date对象
 * @returns {string} 格式化后的日期时间字符串
 */
export function formatDateTime(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '' // 无效日期
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 格式化日期时间为 ISO 8601 格式 (yyyy-mm-ddThh:mm:ss.sss)
 * @param {string|Date} dateString - 日期字符串或Date对象
 * @returns {string} 格式化后的ISO 8601日期时间字符串
 */
export function formatISODateTime(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '' // 无效日期
  
  return date.toISOString()
}

/**
 * 格式化日期为 yyyy-mm-dd 格式
 * @param {string|Date} dateString - 日期字符串或Date对象
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '' // 无效日期
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

export default {
  formatDateTime,
  formatDate
}
