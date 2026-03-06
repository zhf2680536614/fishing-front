<template>
  <div class="map-selector">
    <!-- 搜索框 -->
    <div class="map-search">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索地址"
        style="width: 100%;"
        clearable
      />

      <!-- 搜索结果列表 -->
      <div class="search-results" v-if="showSearchResults && searchResults.length > 0">
        <div
          v-for="(result, index) in searchResults"
          :key="index"
          class="search-result-item"
          @click="selectSearchResult(result)"
        >
          <div class="result-name">{{ result.formattedAddress }}</div>
          <div class="result-address">{{ result.addressComponent.city }} {{ result.addressComponent.district }}</div>
        </div>
      </div>
      <div class="search-results empty" v-if="showSearchResults && searchKeyword && searchResults.length === 0 && !searchLoading">
        <div class="no-result">未找到相关地址</div>
      </div>
    </div>
    
    <!-- 地图容器 -->
    <div id="map-container" class="map-container"></div>
    
    <!-- 地图提示 -->
    <p class="map-hint">提示：在地图上点击选择地址，或使用搜索功能</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { initAMapSecurity, AMapKey } from '@/api/config'
import { initAMap } from '@/api/location'

// 定义组件属性
const props = defineProps({
  // 初始地址
  initialAddress: {
    type: Object,
    default: () => ({
      province: '',
      city: '',
      district: '',
      detailAddress: ''
    })
  },
  // 地图高度
  height: {
    type: String,
    default: '300px'
  }
})

// 定义组件事件
const emit = defineEmits(['select-address'])

// 响应式数据
const searchKeyword = ref('')
const searchResults = ref([])
const showSearchResults = ref(false)
const searchLoading = ref(false)
const mapInstance = ref(null)
const geocoder = ref(null)
const mapLoadingPromise = ref(null)
const mapInitialized = ref(false)
let searchTimer = null

// 初始化地图
const initMap = async () => {
  // 首先初始化安全密钥
  initAMapSecurity()
  
  // 等待 DOM 渲染完成
  await nextTick()
  
  // 如果已经初始化过，直接返回
  if (mapInitialized.value && mapInstance.value) {
    return
  }
  
  // 如果已经有加载中的 Promise，直接等待
  if (mapLoadingPromise.value) {
    return mapLoadingPromise.value
  }
  
  // 检查地图容器是否存在
  const container = document.getElementById('map-container')
  if (!container) {
    console.error('地图容器不存在')
    return
  }
  
  // 清空容器
  container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #909399;">地图加载中...</div>'
  
  try {
    // 使用项目中已经验证过的 initAMap 函数来初始化地图
    const AMap = await initAMap()
    if (AMap) {
      await createMap()
      mapInitialized.value = true
    } else {
      throw new Error('无法获取 AMap 对象')
    }
  } catch (error) {
    console.error('地图加载失败:', error)
    const container = document.getElementById('map-container')
    if (container) {
      container.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 1rem;">
          <div style="text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 12px; color: #f56c6c;">⚠️</div>
            <p>地图加载失败，请检查网络连接</p>
            <p style="font-size: 0.8rem; opacity: 0.8; margin-top: 8px;">错误信息: ${error.message}</p>
          </div>
        </div>
      `
    }
  } finally {
    mapLoadingPromise.value = null
  }
}

// 创建地图实例
const createMap = async () => {
  // 确保 DOM 元素存在
  const mapElement = document.getElementById('map-container')
  if (!mapElement) {
    throw new Error('地图容器元素不存在')
  }
  
  // 销毁旧的地图实例（如果存在）
  if (mapInstance.value) {
    mapInstance.value.destroy()
    mapInstance.value = null
  }
  
  // 清空容器
  mapElement.innerHTML = ''
  
  try {
    // 初始化地图
    mapInstance.value = new window.AMap.Map('map-container', {
      center: [116.397428, 39.90923],
      zoom: 13,
      viewMode: '3D'
    })

    // 异步加载控件插件
    window.AMap.plugin(['AMap.Scale', 'AMap.ToolBar'], () => {
      if (!mapInstance.value) return
      try {
        // 添加比例尺控件
        mapInstance.value.addControl(new window.AMap.Scale())
        // 添加工具条控件（包含缩放按钮）
        mapInstance.value.addControl(new window.AMap.ToolBar({
          position: 'RB',
          offset: [20, 20]
        }))
      } catch (e) {
        console.warn('添加地图控件失败:', e)
      }
    })

    // 添加点击事件
    mapInstance.value.on('click', (e) => {
      const lnglat = e.lnglat
      // 逆地理编码获取地址信息
      getAddressByLngLat(lnglat.lng, lnglat.lat)
    })
    
    // 初始化地理编码器
    geocoder.value = new window.AMap.Geocoder()
  } catch (error) {
    throw new Error(`地图初始化失败: ${error.message}`)
  }
}

// 通过经纬度获取地址信息
const getAddressByLngLat = (lng, lat) => {
  if (!geocoder.value) {
    ElMessage.warning('地图未初始化，无法获取地址信息')
    return
  }

  geocoder.value.getAddress([lng, lat], (status, result) => {
    if (status === 'complete' && result.info === 'OK') {
      const addressComponent = result.regeocode.addressComponent

      const city = addressComponent.city || addressComponent.district || ''

      const address = {
        longitude: lng,
        latitude: lat,
        province: addressComponent.province || '',
        city: city,
        district: addressComponent.district || '',
        detailAddress: result.regeocode.formattedAddress || ''
      }
      console.log('逆地理编码结果:', result)
      console.log('地址组件:', addressComponent)
      console.log('返回的地址数据:', address)

      // 在地图上标记点
      if (mapInstance.value && window.AMap) {
        // 清除之前的标记
        mapInstance.value.clearMap()
        // 添加新标记
        new window.AMap.Marker({
          position: [lng, lat],
          map: mapInstance.value
        })
      }

      // 触发地址选择事件
      emit('select-address', address)
    } else {
      console.error('地理编码失败:', status, result)
      ElMessage.error('获取地址信息失败，请重试')
    }
  })
}

// 搜索地址
const handleSearch = () => {
  if (!searchKeyword.value) {
    showSearchResults.value = false
    return
  }

  if (!geocoder.value) {
    ElMessage.warning('地图未初始化，无法搜索地址')
    return
  }

  searchLoading.value = true
  showSearchResults.value = true

  geocoder.value.getLocation(searchKeyword.value, (status, result) => {
    searchLoading.value = false
    if (status === 'complete' && result.info === 'OK') {
      searchResults.value = result.geocodes || []
    } else {
      searchResults.value = []
      console.error('搜索失败:', status, result)
      ElMessage.error('搜索失败，请重试')
    }
  })
}

// 监听搜索关键词变化，自动搜索（带防抖）
watch(searchKeyword, (newVal) => {
  // 清除之前的定时器
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  if (!newVal || newVal.trim() === '') {
    showSearchResults.value = false
    searchResults.value = []
    return
  }

  // 设置新的定时器，500ms 后执行搜索
  searchTimer = setTimeout(() => {
    handleSearch()
  }, 500)
})

// 选择搜索结果
const selectSearchResult = (result) => {
  const addressComponent = result.addressComponent

  const city = addressComponent.city || addressComponent.district || ''

  const address = {
    longitude: result.location.lng,
    latitude: result.location.lat,
    province: addressComponent.province || '',
    city: city,
    district: addressComponent.district || '',
    detailAddress: result.formattedAddress || ''
  }
  console.log('搜索结果:', result)
  console.log('搜索结果地址组件:', addressComponent)
  console.log('搜索结果返回的地址数据:', address)

  // 移动地图到搜索结果位置
  if (mapInstance.value && result.location) {
    const location = result.location
    mapInstance.value.setCenter([location.lng, location.lat])
    mapInstance.value.setZoom(15)

    // 清除之前的标记
    if (window.AMap) {
      mapInstance.value.clearMap()
      // 添加新标记
      new window.AMap.Marker({
        position: [location.lng, location.lat],
        map: mapInstance.value
      })
    }
  }

  // 触发地址选择事件
  emit('select-address', address)

  // 关闭搜索结果
  showSearchResults.value = false
  searchKeyword.value = ''
}

// 销毁地图实例
const destroyMap = () => {
  if (mapInstance.value) {
    mapInstance.value.destroy()
    mapInstance.value = null
  }
  geocoder.value = null
  mapInitialized.value = false
}

// 点击外部关闭搜索结果
const handleClickOutside = (e) => {
  const searchWrapper = document.querySelector('.map-search')
  if (searchWrapper && !searchWrapper.contains(e.target)) {
    showSearchResults.value = false
  }
}

// 监听组件挂载
onMounted(async () => {
  await initMap()
  document.addEventListener('click', handleClickOutside)
})

// 监听组件卸载
onUnmounted(() => {
  destroyMap()
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.map-selector {
  width: 100%;
  
  .map-search {
    position: relative;
    margin-bottom: 12px;
    
    .search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      margin-top: 4px;
      max-height: 300px;
      overflow-y: auto;
      z-index: 100;
      
      .search-result-item {
        padding: 12px 16px;
        cursor: pointer;
        transition: background-color 0.2s;
        
        &:hover {
          background-color: var(--bg-tertiary);
        }
        
        .result-name {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        
        .result-address {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
      }
      
      &.empty {
        padding: 20px;
        text-align: center;
        
        .no-result {
          color: var(--text-secondary);
        }
      }
    }
  }
  
  .map-container {
    width: 100%;
    height: v-bind(height);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
  }
  
  .map-hint {
    margin-top: 8px;
    font-size: 0.8rem;
    color: var(--text-secondary);
  }
}

@media (max-width: 768px) {
  .map-selector {
    .map-container {
      height: 250px;
    }
  }
}
</style>