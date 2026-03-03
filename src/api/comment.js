import request from '@/utils/request'

export const createComment = (data) => {
  return request.post('/comment/create', data)
}

export const getCommentList = (postId) => {
  return request.get(`/comment/list/${postId}`)
}

export const deleteComment = (id) => {
  return request.delete(`/comment/${id}`)
}
