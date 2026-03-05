import request from '@/utils/request'

// 二手装备相关API
export const getGearMarketList = (params) => {
  return request.get('/gear-market/page', { params })
}

export const getGearMarketDetail = (id) => {
  return request.get(`/gear-market/detail/${id}`)
}

// 创建订单
export const createOrder = (data) => {
  return request.post('/order/create', data)
}

// 获取用户订单列表
export const getUserOrders = (userId) => {
  return request.get(`/order/user/${userId}`)
}

// 确认付款
export const confirmPayment = (orderId) => {
  return request.post(`/order/${orderId}/confirm-payment`)
}

// 删除订单
export const deleteOrder = (orderId) => {
  return request.delete(`/order/${orderId}`)
}

// 批量删除订单
export const batchDeleteOrders = (orderIds) => {
  return request.delete('/order/batch', { data: orderIds })
}

// 装备测评相关API
export const createGearMarket = (data) => {
  return request.post('/gear-market', data)
}

export const updateGearMarket = (id, data) => {
  return request.put(`/gear-market/${id}`, data)
}

export const deleteGearMarket = (id) => {
  return request.delete(`/gear-market/${id}`)
}

export const updateGearMarketStatus = (id, statusDictItemCode) => {
  return request.put(`/gear-market/${id}/status?statusDictItemCode=${statusDictItemCode}`)
}

// 获取用户闲置装备列表
export const getUserGearList = () => {
  return request.get('/gear-market/user/list')
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