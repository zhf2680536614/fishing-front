import { AMapKey, initAMapSecurity } from './config'

export const initAMap = () => {
  return new Promise((resolve, reject) => {
    initAMapSecurity()
    
    if (window.AMap) {
      console.log('AMap 已存在:', window.AMap)
      resolve(window.AMap)
    } else {
      const script = document.createElement('script')
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMapKey}&plugin=AMap.Geolocation,AMap.Geocoder`
      script.type = 'text/javascript'
      script.async = true
      script.defer = true
      script.onload = () => {
        console.log('高德地图 SDK 脚本加载完成')
        setTimeout(() => {
          if (window.AMap) {
            console.log('AMap 加载成功:', window.AMap)
            resolve(window.AMap)
          } else {
            console.error('AMap 加载后仍为 undefined')
            reject(new Error('高德地图 SDK 加载后无法获取 AMap 对象'))
          }
        }, 200)
      }
      script.onerror = () => {
        console.error('高德地图 SDK 加载失败')
        reject(new Error('高德地图 SDK 加载失败'))
      }
      document.head.appendChild(script)
    }
  })
}

export const getAddressFromCoordinates = (AMap, latitude, longitude) => {
  return new Promise((resolve) => {
    if (typeof AMap.plugin === 'function') {
      AMap.plugin('AMap.Geocoder', function () {
        try {
          const geocoder = new AMap.Geocoder({
            key: AMapKey,
          })
          console.log('创建地理编码器成功，开始调用 getAddress:', { longitude, latitude })
          geocoder.getAddress([longitude, latitude], function (status, result) {
            console.log('地理编码回调:', { status, result })
            if (status === 'complete' && result.info === 'OK') {
              console.log('地理编码成功，获取到地址:', result.regeocode.formattedAddress)
              const address = result.regeocode.formattedAddress || '未知位置'
              resolve(address)
            } else {
              console.error('地理编码失败:', result)
              handleGeocodingError(result)
              resolve(getFallbackAddress(latitude, longitude))
            }
          })
        } catch (error) {
          console.error('创建地理编码器时出错:', error)
          resolve(getFallbackAddress(latitude, longitude))
        }
      })
    } else {
      resolve(getFallbackAddress(latitude, longitude))
    }
  })
}

export const getUserLocation = () => {
  return new Promise((resolve) => {
    initAMap()
      .then((AMap) => {
        if (!AMap) {
          throw new Error('AMap 对象为 undefined')
        }

        console.log('AMap 对象:', AMap)

        if (typeof AMap.plugin === 'function') {
          console.log('AMap.plugin 是函数，开始加载 AMap.Geolocation')
          AMap.plugin('AMap.Geolocation', function () {
            console.log('AMap.Geolocation 加载成功')
            try {
              const geolocation = new AMap.Geolocation({
                enableHighAccuracy: true,
                timeout: 10000,
                buttonPosition: 'RB',
                buttonOffset: new AMap.Pixel(10, 20),
                zoomToAccuracy: true,
              })

              geolocation.getCurrentPosition(async function (status, result) {
                console.log('定位回调:', { status, result })
                if (status === 'complete') {
                  console.log('定位成功:', result)
                  window.locationResult = result
                  const latitude = result.position.lat
                  const longitude = result.position.lng
                  const address = await getAddressFromCoordinates(AMap, latitude, longitude)
                  resolve({
                    latitude,
                    longitude,
                    address,
                    addressComponent: result.addressComponent,
                  })
                } else {
                  console.error('定位失败:', result)
                  handleLocationError(result)
                  const defaultLocation = getDefaultLocation()
                  resolve(defaultLocation)
                }
              })
            } catch (error) {
              console.error('创建 Geolocation 实例时出错:', error)
              resolve(getDefaultLocation())
            }
          })
        } else {
          console.error('AMap.plugin 不是函数')
          resolve(getDefaultLocation())
        }
      })
      .catch((error) => {
        console.error('初始化 AMap 失败:', error)
        resolve(getDefaultLocation())
      })
  })
}

export const handleGeocodingError = (result) => {
  if (result.info === 'USERKEY_PLAT_NOMATCH') {
    console.error('API Key 平台不匹配，请确保使用 Web 端 API Key')
    console.error('解决方案：在高德地图开放平台上创建一个 Web 端 API Key，并更新到 .env 文件中')
  } else if (result.info === 'INVALID_USER_KEY') {
    console.error('API Key 无效，请检查 API Key 是否正确')
  } else if (result.info === 'OVER_QUERY_LIMIT') {
    console.error('API 调用次数超限，请检查 API Key 的配额')
  }
}

export const handleLocationError = (result) => {
  console.error('定位失败原因:', result.message)
}

export const getFallbackAddress = (latitude, longitude) => {
  if (window.locationResult && window.locationResult.addressComponent) {
    const { province, city, district } = window.locationResult.addressComponent
    const address = `${province || ''}${city || ''}${district || ''}`
    if (address && address !== '未知位置') {
      console.log('使用定位结果中的地址信息:', address)
      return address
    }
  }
  return `纬度: ${latitude}, 经度: ${longitude}`
}

export const getDefaultLocation = () => {
  return {
    latitude: 30.259167,
    longitude: 120.129167,
    address: '杭州市 · 西湖区',
    addressComponent: {
      province: '浙江省',
      city: '杭州市',
      district: '西湖区',
    },
  }
}
