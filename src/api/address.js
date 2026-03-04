import request from '@/utils/request'

// 获取用户地址列表
export const getUserAddresses = () => {
  return request.get('/address/list')
}

// 创建地址
export const createAddress = (data) => {
  return request.post('/address/create', data)
}

// 更新地址
export const updateAddress = (id, data) => {
  return request.put(`/address/${id}`, data)
}

// 删除地址
export const deleteAddress = (id) => {
  return request.delete(`/address/${id}`)
}

// 设置默认地址
export const setDefaultAddress = (id) => {
  return request.put(`/address/${id}/default`)
}