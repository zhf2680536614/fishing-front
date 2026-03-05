import request from '@/utils/request'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export const getSpotList = () => {
  return request.get('/fishing-spot/list')
}

export const getRecommendSpots = (typeDictItemCode) => {
  const params = {}
  if (typeDictItemCode !== undefined && typeDictItemCode !== null) {
    params.typeDictItemCode = typeDictItemCode
  }
  return request.get('/fishing-spot/recommend', { params })
}

export const searchSpots = (keyword, typeDictItemCode) => {
  const params = {}
  if (keyword) {
    params.keyword = keyword
  }
  if (typeDictItemCode !== undefined && typeDictItemCode !== null) {
    params.typeDictItemCode = typeDictItemCode
  }
  return request.get('/fishing-spot/search', { params })
}

export const getSpotById = (id) => {
  return request.get(`/fishing-spot/${id}`)
}

export const getAiRecommendation = (id) => {
  return request.get(`/fishing-spot/${id}/ai-recommendation`)
}

// 管理后台接口
export const getSpotPage = (data) => {
  return request.post('/fishing-spot/page', data)
}

export const getSpotManageById = (id) => {
  return request.get(`/fishing-spot/manage/${id}`)
}

export const createSpot = (data) => {
  return request.post('/fishing-spot', data)
}

export const updateSpot = (id, data) => {
  return request.put(`/fishing-spot/${id}`, data)
}

export const deleteSpot = (id) => {
  return request.delete(`/fishing-spot/${id}`)
}

export const analyzeSpot = async (spotName, spotType, address, fishInfo, onMessage, onComplete, onError) => {
  const params = new URLSearchParams()
  if (spotName) params.append('spotName', spotName)
  if (spotType !== undefined && spotType !== null) params.append('spotType', spotType)
  if (address) params.append('address', address)
  if (fishInfo) params.append('fishInfo', fishInfo)

  const url = `${API_BASE}/ai/analyze-spot?${params.toString()}`
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
      },
    })

    if (!response.ok) {
      throw new Error('AI 分析请求失败')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const data = line.substring(5).trim()
          if (data === '[DONE]') {
            onComplete?.()
            return
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              onMessage?.(parsed.content)
            } else if (parsed.error) {
              onError?.(parsed.error)
              return
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
    onComplete?.()
  } catch (error) {
    onError?.(error.message)
  }
}