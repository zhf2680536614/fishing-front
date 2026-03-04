import request from '@/utils/request'

/**
 * 上传帖子图片
 * @param {File} file - 文件对象
 * @returns {Promise}
 */
export const uploadPostImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/file/upload/post', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 上传用户头像
 * @param {File} file - 文件对象
 * @returns {Promise}
 */
export const uploadUserAvatar = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/file/upload/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 批量上传帖子图片
 * @param {File[]} files - 文件数组
 * @returns {Promise}
 */
export const uploadPostImages = (files) => {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  return request.post('/file/upload/post/batch', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
