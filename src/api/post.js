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
