import request from '@/utils/request'

// 二手装备相关API
export const getGearMarketList = (params) => {
  return request.get('/gear-market/page', { params })
}

export const getGearMarketDetail = (id) => {
  return request.get(`/gear-market/${id}`)
}

export const createGearMarket = (data) => {
  return request.post('/gear-market', data)
}

export const updateGearMarket = (id, data) => {
  return request.put(`/gear-market/${id}`, data)
}

export const deleteGearMarket = (id) => {
  return request.delete(`/gear-market/${id}`)
}

export const updateGearMarketStatus = (id, status) => {
  return request.put(`/gear-market/${id}/status`, { status })
}

// 装备测评相关API
export const getGearReviewList = (params) => {
  return request.get('/gear-review/page', { params })
}

export const getGearReviewDetail = (id) => {
  return request.get(`/gear-review/${id}`)
}

export const createGearReview = (data) => {
  return request.post('/gear-review', data)
}

export const updateGearReview = (id, data) => {
  return request.put(`/gear-review/${id}`, data)
}

export const deleteGearReview = (id) => {
  return request.delete(`/gear-review/${id}`)
}

export const likeGearReview = (id) => {
  return request.post(`/gear-review/${id}/like`)
}

export const unlikeGearReview = (id) => {
  return request.delete(`/gear-review/${id}/like`)
}

export const checkGearReviewLike = (id) => {
  return request.get(`/gear-review/${id}/is-liked`)
}