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