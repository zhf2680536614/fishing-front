import { OpenWeatherKey } from './config'

export const fetchWeatherData = async (latitude, longitude) => {
  try {
    console.log('开始获取天气数据:', { latitude, longitude })
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OpenWeatherKey}&units=metric&lang=zh_cn`
    )
    
    if (!response.ok) {
      throw new Error('天气数据获取失败')
    }
    
    const data = await response.json()
    console.log('天气数据获取成功:', data)
    return parseWeatherData(data)
  } catch (error) {
    console.error('获取天气数据失败:', error)
    return getDefaultWeatherData()
  }
}

export const parseWeatherData = (data) => {
  const weather = data.weather[0]
  const windDeg = data.wind.deg
  const windSpeed = data.wind.speed
  
  return {
    temperature: Math.round(data.main.temp),
    humidity: data.main.humidity,
    pressure: generateRandomPressure(),
    weather: weather.description,
    weatherMain: weather.main,
    windSpeed: Math.round(windSpeed),
    windDirection: getWindDirection(windDeg),
    wind: `${getWindDirection(windDeg)} ${getWindLevel(windSpeed)}级`,
    location: data.name,
  }
}

export const generateRandomPressure = () => {
  const minPressure = 1000
  const maxPressure = 1020
  return Math.floor(Math.random() * (maxPressure - minPressure + 1)) + minPressure
}

export const getWindDirection = (deg) => {
  const directions = ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风']
  const index = Math.round(deg / 45) % 8
  return directions[index]
}

export const getWindLevel = (speed) => {
  if (speed < 1) return 0
  if (speed < 6) return 1
  if (speed < 12) return 2
  if (speed < 20) return 3
  if (speed < 29) return 4
  if (speed < 39) return 5
  return 6
}

export const getDefaultWeatherData = () => {
  return {
    temperature: 24,
    humidity: 65,
    pressure: generateRandomPressure(),
    weather: '多云转阴',
    weatherMain: 'Clouds',
    windSpeed: 3,
    windDirection: '东南风',
    wind: '东南风 3级',
    location: '杭州市 · 西湖区',
  }
}

export const getPressureStatus = (pressure) => {
  if (pressure >= 1013) {
    return {
      type: 'success',
      text: '气压稳定',
    }
  } else if (pressure >= 1005) {
    return {
      type: 'warning',
      text: '气压偏低',
    }
  } else {
    return {
      type: 'danger',
      text: '气压过低',
    }
  }
}

export const getTideStatus = () => {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) {
    return '涨潮中'
  } else if (hour >= 12 && hour < 18) {
    return '退潮中'
  } else if (hour >= 18 && hour < 22) {
    return '涨潮中'
  } else {
    return '退潮中'
  }
}
