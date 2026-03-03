export const API_BASE_URL = 'http://localhost:8080/api'

export const AMapKey = import.meta.env.VITE_AMAP_KEY || '46b49745a93edc902705272a15fb576b'
export const AMapSecret = import.meta.env.VITE_AMAP_SECRET || ''
export const OpenWeatherKey = import.meta.env.VITE_OPENWEATHER_KEY || 'b742d567e4ad4a5e34ebb7e4ee198cca'

export const initAMapSecurity = () => {
  if (AMapSecret && typeof window !== 'undefined') {
    window._AMapSecurityConfig = {
      securityJsCode: AMapSecret,
    }
    console.log('高德地图安全密钥已配置')
  }
}

export const logApiKeyStatus = () => {
  console.log('AMap Key:', AMapKey ? '已配置' : '未配置')
  console.log('AMap Secret:', AMapSecret ? '已配置' : '未配置')
  console.log('OpenWeather Key:', OpenWeatherKey ? '已配置' : '未配置')
}
