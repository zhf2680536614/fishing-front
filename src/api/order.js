import request from '@/utils/request'

// 订单相关API
export const getUserOrders = (userId) => {
  return request.get(`/order/user/${userId}`)
}

export const createOrder = (data) => {
  return request.post('/order/create', data)
}

export const getOrderById = (id) => {
  return request.get(`/order/${id}`)
}

export const confirmPayment = (orderId) => {
  return request.post(`/order/${orderId}/confirm-payment`)
}

export const deleteOrder = (orderId) => {
  return request.delete(`/order/${orderId}`)
}

export const batchDeleteOrders = (orderIds) => {
  return request.delete('/order/batch', { data: orderIds })
}

// 订单管理后台API
export const getOrderPage = (data) => {
  return request.post('/order/manage/page', data)
}

export const getOrderManageById = (id) => {
  return request.get(`/order/manage/${id}`)
}

export const updateOrderStatus = (id, data) => {
  return request.put(`/order/manage/${id}/status`, data)
}

export const deleteOrderManage = (id) => {
  return request.delete(`/order/manage/${id}`)
}