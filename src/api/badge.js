import request from '@/utils/request'

// 勋章管理后台API
export const getBadgePage = (data) => {
  return request.post('/badge/manage/page', data)
}

export const getBadgeManageById = (id) => {
  return request.get(`/badge/manage/${id}`)
}

export const createBadge = (data) => {
  return request.post('/badge/manage', data)
}

export const updateBadge = (id, data) => {
  return request.put(`/badge/manage/${id}`, data)
}

export const deleteBadge = (id) => {
  return request.delete(`/badge/manage/${id}`)
}
