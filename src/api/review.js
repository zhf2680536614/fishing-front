import request from '@/utils/request'

// 获取装备测评列表
export const getReviewList = (params) => {
  return request.get('/gear-review/page', { params })
}

// 获取装备测评详情
export const getReviewDetail = (id) => {
  return request.get(`/gear-review/${id}`)
}

// 发布装备测评
export const publishReview = (data) => {
  return request.post('/gear-review', data)
}

// 更新装备测评
export const updateReview = (id, data) => {
  return request.put(`/gear-review/${id}`, data)
}

// 删除装备测评
export const deleteReview = (id) => {
  return request.delete(`/gear-review/${id}`)
}
