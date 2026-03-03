import request from '@/utils/request'

/**
 * 空军打卡
 * @param {Object} data - 打卡数据 { content, images }
 */
export const checkinAirForce = (data) => {
  return request.post('/air-force/checkin', data)
}

/**
 * 获取空军帖子列表
 * @param {Object} params - 查询参数 { pageNum, pageSize, sortType }
 */
export const getAirForcePosts = (params) => {
  return request.get('/air-force/posts', { params })
}

/**
 * 获取空军统计数据
 */
export const getAirForceStats = () => {
  return request.get('/air-force/stats')
}

/**
 * 点赞/取消点赞
 * @param {number} postId - 帖子ID
 */
export const toggleLike = (postId) => {
  return request.post(`/air-force/like/${postId}`)
}
