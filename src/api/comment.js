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

// 评论管理后台API
export const getCommentPage = (data) => {
  return request.post('/comment/manage/page', data)
}

export const getCommentManageById = (id) => {
  return request.get(`/comment/manage/${id}`)
}

export const deleteCommentManage = (id) => {
  return request.delete(`/comment/manage/${id}`)
}
