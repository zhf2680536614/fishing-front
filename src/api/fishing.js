import { request } from '@/utils'

export const fetchFishingIndex = async (weatherData) => {
  try {
    console.log('开始调用后端接口获取垂钓指数:', weatherData)
    const data = await request.post('/fishing/index', weatherData)
    console.log('后端接口返回数据:', data)
    return data
  } catch (error) {
    console.error('后端接口调用失败:', error)
    return getDefaultFishingIndex()
  }
}

export const getDefaultFishingIndex = () => {
  return {
    fishingScore: 75,
    fishingStatus: '适宜',
    aiAdvice: '根据当前天气情况，建议选择水深 1.5-2 米的区域，使用活饵或拟饵，钓法建议采用底钓或浮钓。注意观察鱼情，适时调整钓法和饵料。',
    pressureStatus: '气压适宜',
    temperatureStatus: '温度适宜',
    windStatus: '风力适宜'
  }
}
