import request from '@/utils/request'

/**
 * 获取用户钓鱼统计数据
 * @param {number} userId 用户ID
 * @param {Object} params 查询参数 { catchTypeCode, airForceTypeCode }
 * @returns {Promise} 钓鱼统计数据
 */
export const getFishingStats = (userId, params = {}) => {
  return request.get(`/fishing-stats/${userId}`, { params })
}
