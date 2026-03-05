import request from '@/utils/request'

export const getDictItems = (dictCode) => {
  return request.get(`/dict/items/${dictCode}`)
}
