import request from '@/utils/request'

// 根据字典编码获取字典项
export const getDictItems = (dictCode) => {
  return request.get(`/dict/items/${dictCode}`)
}

// ==================== 字典类型管理 ====================

// 分页查询字典类型列表（管理后台）
export const getDictTypePage = (data) => {
  return request.post('/dict/type/manage/page', data)
}

// 获取所有字典类型（用于下拉选择）
export const getAllDictTypes = () => {
  return request.get('/dict/type/all')
}

// 根据ID获取字典类型详情（管理后台）
export const getDictTypeById = (id) => {
  return request.get(`/dict/type/manage/${id}`)
}

// 创建字典类型（管理后台）
export const createDictType = (data) => {
  return request.post('/dict/type/manage', data)
}

// 更新字典类型（管理后台）
export const updateDictType = (id, data) => {
  return request.put(`/dict/type/manage/${id}`, data)
}

// 删除字典类型（管理后台）
export const deleteDictType = (id) => {
  return request.delete(`/dict/type/manage/${id}`)
}

// ==================== 字典项管理 ====================

// 分页查询字典项列表（管理后台）
export const getDictItemPage = (data) => {
  return request.post('/dict/item/manage/page', data)
}

// 根据ID获取字典项详情（管理后台）
export const getDictItemById = (id) => {
  return request.get(`/dict/item/manage/${id}`)
}

// 创建字典项（管理后台）
export const createDictItem = (data) => {
  return request.post('/dict/item/manage', data)
}

// 更新字典项（管理后台）
export const updateDictItem = (id, data) => {
  return request.put(`/dict/item/manage/${id}`, data)
}

// 删除字典项（管理后台）
export const deleteDictItem = (id) => {
  return request.delete(`/dict/item/manage/${id}`)
}
