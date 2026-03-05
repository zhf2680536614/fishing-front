import request from '@/utils/request'

export const login = (data) => {
  return request.post('/user/login', data)
}

export const register = (data) => {
  return request.post('/user/register', data)
}

export const getUserInfo = (id) => {
  return request.get(`/user/${id}`)
}

export const getProfile = (id) => {
  return request.get(`/user/profile/${id}`)
}

export const updateProfile = (id, data) => {
  return request.put(`/user/profile/${id}`, data)
}

export const getUserBadges = (id) => {
  return request.get(`/user/badges/${id}`)
}

export const getUserPage = (data) => {
  return request.post('/user/page', data)
}

export const getUserManageById = (id) => {
  return request.get(`/user/manage/${id}`)
}

export const updateUserManage = (id, data) => {
  return request.put(`/user/manage/${id}`, data)
}

export const deleteUser = (id) => {
  return request.delete(`/user/${id}`)
}
