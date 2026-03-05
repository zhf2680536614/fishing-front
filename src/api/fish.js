import request from '@/utils/request'

// 分页查询鱼类百科列表（管理后台）
export const getFishPage = (data) => {
  return request.post('/fish/manage/page', data)
}

// 根据ID获取鱼类百科详情（管理后台）
export const getFishById = (id) => {
  return request.get(`/fish/manage/${id}`)
}

// 创建鱼类百科（管理后台）
export const createFish = (data) => {
  return request.post('/fish/manage', data)
}

// 更新鱼类百科（管理后台）
export const updateFish = (id, data) => {
  return request.put(`/fish/manage/${id}`, data)
}

// 删除鱼类百科（管理后台）
export const deleteFish = (id) => {
  return request.delete(`/fish/manage/${id}`)
}
