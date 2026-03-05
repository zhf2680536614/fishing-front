import request from '@/utils/request'

export const createPost = (data) => {
  return request.post('/post/create', data)
}

export const getPostList = (typeDictItemCode = 'catch_report', pageNum = 1, pageSize = 10) => {
  return request.get('/post/list', { params: { typeDictItemCode, pageNum, pageSize } })
}

export const getPostDetail = (id) => {
  return request.get(`/post/${id}`)
}

export const toggleLike = (id) => {
  return request.post(`/post/like/${id}`)
}

export const incrementView = (id) => {
  return request.post(`/post/view/${id}`)
}

// 管理后台接口
export const getPostPage = (data) => {
  return request.post('/post/page', data)
}

export const getPostManageById = (id) => {
  return request.get(`/post/manage/${id}`)
}

export const updatePost = (id, data) => {
  return request.put(`/post/${id}`, data)
}

export const deletePost = (id) => {
  return request.delete(`/post/${id}`)
}
