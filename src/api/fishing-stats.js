import request from '@/utils/request'

/**
 * 获取用户钓鱼统计数据
 * @param {number} userId 用户ID
 * @returns {Promise} 钓鱼统计数据
 */
export const getFishingStats = (userId) => {
  return request.get(`/fishing-stats/${userId}`)
}
