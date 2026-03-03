import request from '@/utils/request'

/**
 * 获取首页统计数据
 */
export const getHomeStats = () => {
  return request.get('/home/stats')
}

/**
 * 获取今日爆护榜
 */
export const getTodayHotPosts = () => {
  return request.get('/home/hot-posts')
}
