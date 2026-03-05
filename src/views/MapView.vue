<template>
  <div class="map-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">智能钓点地图</h1>
        <p class="page-description">发现附近的优质钓点，AI 智能推荐最佳钓位</p>
      </div>
    </div>

    <!-- 地图搜索栏 -->
    <div class="search-section">
      <div class="container">
        <div class="search-bar">
          <div class="search-input-wrapper">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索钓点名称或地址"
              prefix-icon="Search"
              class="search-input"
              @input="handleSearchInput"
              @focus="showSearchResults = true"
              clearable
            />
            <!-- 搜索结果下拉 -->
            <div class="search-results" v-if="showSearchResults && searchResults.length > 0">
              <div
                v-for="spot in searchResults"
                :key="spot.id"
                class="search-result-item"
                @click="selectSearchResult(spot)"
              >
                <div class="result-name">{{ spot.name }}</div>
                <div class="result-address">{{ spot.address }}</div>
              </div>
            </div>
            <div
              class="search-results empty"
              v-if="
                showSearchResults && searchKeyword && searchResults.length === 0 && !searchLoading
              "
            >
              <div class="no-result">未找到相关钓点</div>
            </div>
          </div>
          <el-select
            v-model="spotType"
            class="type-select"
            @change="handleTypeChange"
            placeholder="全部类型"
          >
            <el-option label="全部类型" value="all" />
            <el-option
              v-for="type in spotTypes"
              :key="type.itemCode"
              :label="type.itemName"
              :value="type.itemCode"
            />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 地图容器 -->
    <div class="map-container">
      <div id="map" class="map"></div>

      <!-- 加载蒙版 -->
      <div class="map-loading-mask" v-if="mapLoading">
        <div class="loading-content">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <p class="loading-text">地图加载中...</p>
        </div>
      </div>

      <!-- 侧边栏 -->
      <div class="sidebar" :class="{ open: showSidebar }">
        <div class="sidebar-header">
          <h3>钓点详情</h3>
          <el-icon class="close-btn" @click="showSidebar = false"><Close /></el-icon>
        </div>
        <div class="sidebar-content" v-if="selectedSpot">
          <div class="spot-image-carousel">
            <el-carousel
              height="220px"
              indicator-position="none"
              v-if="selectedSpot.images && selectedSpot.images.length > 0"
              :autoplay="false"
            >
              <el-carousel-item v-for="(img, index) in selectedSpot.images" :key="index">
                <img :src="img" alt="钓点图片" class="carousel-img" />
              </el-carousel-item>
            </el-carousel>
            <div v-else class="spot-image-single">
              <img :src="selectedSpot.image" alt="钓点图片" />
            </div>
            <div
              class="carousel-indicators"
              v-if="selectedSpot.images && selectedSpot.images.length > 1"
            >
              <span
                v-for="(_, index) in selectedSpot.images"
                :key="index"
                class="indicator-dot"
              ></span>
            </div>
          </div>
          <div class="spot-info-section">
            <h4 class="spot-name">{{ selectedSpot.name }}</h4>
            <div class="spot-meta">
              <el-tag :type="getTypeTagType(selectedSpot.type)" size="small">{{
                getTypeText(selectedSpot.type)
              }}</el-tag>
              <span class="spot-rating">
                <el-icon><Star /></el-icon>
                {{ selectedSpot.rating?.toFixed(1) || '4.5' }}分
              </span>
              <span class="spot-price">{{ selectedSpot.price }}</span>
            </div>
            <div class="spot-details">
              <div class="detail-item">
                <el-icon class="detail-icon"><MapLocation /></el-icon>
                <span>{{ selectedSpot.address }}</span>
              </div>
              <div class="detail-item">
                <el-icon class="detail-icon"><Collection /></el-icon>
                <span>{{ selectedSpot.fishInfo || '暂无鱼种信息' }}</span>
              </div>
            </div>
            <div class="ai-recommendation">
              <div class="ai-header">
                <el-icon class="ai-icon"><Cpu /></el-icon>
                <span>AI 智能分析</span>
              </div>
              <div v-if="aiLoading" class="ai-loading">
                <el-icon class="loading-spinner"><Loading /></el-icon>
                <span>AI 分析中...</span>
              </div>
              <p class="ai-content" v-else>{{ aiAnalysis || '暂无分析结果' }}</p>
            </div>
            <div class="sidebar-actions">
              <el-button type="primary" class="action-btn" @click="navigateToSpot">
                <el-icon><MapLocation /></el-icon> 导航前往
              </el-button>
            </div>
          </div>
        </div>
        <div class="empty-sidebar" v-else>
          <el-icon class="empty-icon"><MapLocation /></el-icon>
          <p>点击地图上的钓点查看详情</p>
        </div>
      </div>
    </div>

    <!-- 推荐钓点 -->
    <div class="spots-list-section">
      <div class="container">
        <h2 class="section-title">
          <el-icon class="title-icon"><Star /></el-icon> AI智能推荐钓点
        </h2>
        <div class="spots-grid recommend-grid">
          <div
            v-for="spot in recommendSpots"
            :key="spot.id"
            class="spot-card"
            @click="selectSpot(spot)"
          >
            <div class="spot-card-image">
              <img :src="spot.image" alt="钓点图片" />
              <el-tag :type="getTypeTagType(spot.type)" class="spot-tag">{{
                getTypeText(spot.type)
              }}</el-tag>
            </div>
            <div class="spot-card-content">
              <h4>{{ spot.name }}</h4>
              <div class="spot-card-meta">
                <span class="distance">{{ spot.distance.toFixed(1) }}km</span>
                <span class="rating">{{ spot.rating.toFixed(1) }}分</span>
              </div>
              <p class="spot-card-desc">{{ spot.address }}</p>
              <div class="spot-card-footer">
                <span class="price">{{ spot.price }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import {
  Search,
  Close,
  MapLocation,
  Star,
  Cpu,
  ChatLineSquare,
  Collection,
  Loading,
} from '@element-plus/icons-vue'
import { getSpotList, getRecommendSpots, searchSpots, analyzeSpot } from '@/api/spot'
import { getDictItems } from '@/api/dict'

// 响应式数据
const searchKeyword = ref('')
const spotType = ref('all')
const spotTypes = ref([]) // 钓点类型列表
const loading = ref(false)
const showSidebar = ref(false)
const selectedSpot = ref(null)
const spots = ref([])
const recommendSpots = ref([])
const searchResults = ref([])
const showSearchResults = ref(false)
const searchLoading = ref(false)
const mapLoading = ref(true)
const map = ref(null)
const markers = ref([])
const aiLoading = ref(false)
const aiAnalysis = ref('')
let searchTimer = null
let mapLoadingPromise = null
let mapInitialized = false

// 搜索输入处理（防抖）
const handleSearchInput = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  if (!searchKeyword.value) {
    searchResults.value = []
    showSearchResults.value = false
    return
  }

  searchTimer = setTimeout(async () => {
    searchLoading.value = true
    showSearchResults.value = true
    try {
      const typeParam = spotType.value === 'all' ? null : spotType.value
      const data = await searchSpots(searchKeyword.value, typeParam)
      searchResults.value = data
    } catch (error) {
      console.error('搜索失败:', error)
      searchResults.value = []
    } finally {
      searchLoading.value = false
    }
  }, 300)
}

// 选择搜索结果
const selectSearchResult = (spot) => {
  showSearchResults.value = false
  searchKeyword.value = ''
  searchResults.value = []
  selectSpot(spot)
}

// 类型变化处理
const handleTypeChange = async () => {
  // 重新加载推荐钓点
  await loadRecommendSpots()
  // 重新加载地图标记
  await loadSpotsByType()
}

// 根据类型加载钓点
const loadSpotsByType = async () => {
  try {
    let data
    if (spotType.value !== 'all') {
      data = await searchSpots(null, spotType.value)
    } else {
      data = await getSpotList()
    }
    spots.value = data
    addMarkers()
  } catch (error) {
    console.error('加载钓点数据失败:', error)
  }
}

// 点击外部关闭搜索结果
const handleClickOutside = (e) => {
  const wrapper = document.querySelector('.search-input-wrapper')
  if (wrapper && !wrapper.contains(e.target)) {
    showSearchResults.value = false
  }
}

// 选择钓点
const selectSpot = (spot) => {
  selectedSpot.value = spot
  showSidebar.value = true
  // 地图定位到选中的钓点
  if (map.value && spot.longitude && spot.latitude) {
    map.value.setCenter([spot.longitude, spot.latitude])
    map.value.setZoom(15)
  }
  // 调用 AI 分析
  fetchAIAnalysis(spot)
}

// 获取 AI 分析
const fetchAIAnalysis = (spot) => {
  aiLoading.value = true
  aiAnalysis.value = ''

  analyzeSpot(
    spot.name,
    spot.type, // 直接传递类型编码
    spot.address,
    spot.fishInfo,
    (content) => {
      aiAnalysis.value += content
    },
    () => {
      aiLoading.value = false
    },
    (error) => {
      aiLoading.value = false
      aiAnalysis.value = 'AI 分析暂时不可用'
      console.error('AI 分析失败:', error)
    },
  )
}

// 导航到钓点
const navigateToSpot = () => {
  if (selectedSpot.value && selectedSpot.value.longitude && selectedSpot.value.latitude) {
    const { longitude, latitude, name } = selectedSpot.value
    // 调用高德地图导航
    window.open(
      `https://uri.amap.com/marker?position=${longitude},${latitude}&name=${encodeURIComponent(name)}&src=application`,
    )
  }
}

// 获取类型标签类型
const getTypeTagType = (type) => {
  const typeMap = {
    0: 'success',
    1: 'warning',
    2: 'primary',
    wild: 'success',
    paid: 'warning',
    lure: 'primary',
  }
  return typeMap[type] || 'info'
}

// 获取类型文本
const getTypeText = (type) => {
  const typeMap = {
    0: '野钓',
    1: '黑坑',
    2: '路亚',
    wild: '野钓',
    paid: '黑坑',
    lure: '路亚',
  }
  return typeMap[type] || '未知'
}

// 初始化地图
const initMap = async () => {
  // 等待 DOM 渲染完成
  await nextTick()

  // 如果已经初始化过，直接返回
  if (mapInitialized && map.value) {
    return
  }

  // 如果已经有加载中的 Promise，直接等待
  if (mapLoadingPromise) {
    return mapLoadingPromise
  }

  // 加载高德地图API
  if (!window.AMap) {
    mapLoadingPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${import.meta.env.VITE_AMAP_KEY}`
      script.onload = async () => {
        try {
          await loadMap()
          mapInitialized = true
          resolve()
        } catch (error) {
          reject(error)
        }
      }
      script.onerror = () => {
        reject(new Error('高德地图脚本加载失败'))
      }
      document.head.appendChild(script)
    })

    try {
      await mapLoadingPromise
    } finally {
      mapLoadingPromise = null
    }
  } else {
    await loadMap()
    mapInitialized = true
  }
}

// 加载地图
const loadMap = async () => {
  mapLoading.value = true
  try {
    // 确保 DOM 元素存在
    const mapElement = document.getElementById('map')
    if (!mapElement) {
      throw new Error('地图容器元素不存在')
    }

    // 销毁旧的地图实例（如果存在）
    if (map.value) {
      map.value.destroy()
      map.value = null
    }

    // 初始化地图
    map.value = new window.AMap.Map('map', {
      center: [120.15507, 30.274085], // 默认杭州
      zoom: 11,
      viewMode: '3D',
      scrollWheel: false, // 禁用鼠标滚轮缩放
    })

    // 异步加载控件插件
    window.AMap.plugin(['AMap.Scale', 'AMap.ToolBar'], () => {
      if (!map.value) return
      try {
        // 添加比例尺控件
        map.value.addControl(new window.AMap.Scale())
        // 添加工具条控件（包含缩放按钮）
        map.value.addControl(
          new window.AMap.ToolBar({
            position: 'LT',
            offset: [20, 20],
          }),
        )
      } catch (e) {
        console.warn('添加地图控件失败:', e)
      }
    })

    // 加载钓点数据
    await loadSpots()
    // 加载推荐钓点
    await loadRecommendSpots()

    // 加载完成
    mapLoading.value = false
  } catch (error) {
    console.error('地图初始化失败:', error)
    mapLoading.value = false
    // 显示错误信息
    const mapElement = document.getElementById('map')
    if (mapElement) {
      mapElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 1.2rem;">
          <div style="text-align: center;">
            <el-icon style="font-size: 3rem; margin-bottom: 20px; color: #f56c6c;"><Warning /></el-icon>
            <p>地图加载失败，请检查网络连接</p>
            <p style="font-size: 0.9rem; opacity: 0.8; margin-top: 10px;">错误信息: ${error.message}</p>
          </div>
        </div>
      `
    }
  }
}

// 加载钓点数据
const loadSpots = async () => {
  try {
    const data = await getSpotList()
    spots.value = data
    // 在地图上标记钓点
    addMarkers()
  } catch (error) {
    console.error('加载钓点数据失败:', error)
    spots.value = []
  }
}

// 加载推荐钓点
const loadRecommendSpots = async () => {
  try {
    const typeParam = spotType.value === 'all' ? null : spotType.value
    const data = await getRecommendSpots(typeParam)
    recommendSpots.value = data
  } catch (error) {
    console.error('加载推荐钓点失败:', error)
    recommendSpots.value = []
  }
}

// 获取钓点类型
const fetchSpotTypes = async () => {
  try {
    const data = await getDictItems('fishing_spot_type')
    spotTypes.value = data
  } catch (error) {
    console.error('获取钓点类型失败:', error)
    spotTypes.value = []
  }
}

// 添加标记
const addMarkers = () => {
  if (!map.value) return

  // 清除之前的标记
  markers.value.forEach((marker) => marker.remove())
  markers.value = []

  // 添加新标记
  spots.value.forEach((spot) => {
    if (spot.longitude && spot.latitude) {
      // 使用默认图标，避免SVG数据URL可能的问题
      const marker = new window.AMap.Marker({
        position: [spot.longitude, spot.latitude],
        title: spot.name,
      })

      // 添加点击事件
      marker.on('click', () => {
        selectSpot(spot)
      })

      marker.setMap(map.value)
      markers.value.push(marker)
    }
  })
}

// 初始化
onMounted(() => {
  initMap()
  fetchSpotTypes() // 获取钓点类型
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  // 销毁地图实例
  if (map.value) {
    map.value.destroy()
    map.value = null
  }
  // 重置初始化状态
  mapInitialized = false
  mapLoadingPromise = null
  markers.value = []
})
</script>

<style lang="scss" scoped>
.map-page {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 4vh 0;
  background: linear-gradient(135deg, rgba(67, 97, 238, 0.95), rgba(72, 149, 239, 0.95));
  backdrop-filter: blur(10px);
  color: white;
  box-shadow: 0 4px 20px rgba(67, 97, 238, 0.3);

  .page-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 0.5vh;
    color: white;
  }

  .page-description {
    font-size: 0.95rem;
    opacity: 0.9;
    margin: 0;
  }
}

.search-section {
  position: relative;
  z-index: 1;
  background: white;
  padding: 4vh 0;
  box-shadow: var(--shadow-md);

  .search-bar {
    display: flex;
    gap: 1vw;

    .search-input-wrapper {
      flex: 1;
      position: relative;

      .search-input {
        height: 50px;
      }

      .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        margin-top: 8px;
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

    .type-select {
      width: 150px;

      :deep(.el-select__wrapper) {
        height: 50px;
        box-sizing: border-box;
      }

      :deep(.el-input__inner) {
        height: 48px;
        line-height: 48px;
      }
    }
  }
}

.map-container {
  position: relative;
  z-index: 1;
  height: 80vh;
  margin: 4vh 0;

  .map {
    width: 100%;
    height: 100%;
    border-radius: var(--radius-xl);
    overflow: hidden;
  }

  .map-loading-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    border-radius: var(--radius-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;

    .loading-content {
      text-align: center;

      .loading-icon {
        font-size: 3rem;
        color: var(--primary-color);
        animation: spin 1s linear infinite;
      }

      .loading-text {
        margin-top: 1rem;
        font-size: 1rem;
        color: var(--text-secondary);
      }
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .sidebar {
    position: absolute;
    right: 20px;
    top: 20px;
    bottom: 20px;
    width: 380px;
    max-height: calc(100% - 40px);
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    border-radius: 16px;
    transform: translateX(calc(100% + 40px));
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 100;

    &.open {
      transform: translateX(0);
    }

    .sidebar-header {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;

      h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .close-btn {
        font-size: 1.2rem;
        cursor: pointer;
        color: var(--text-secondary);
        padding: 4px;
        border-radius: 50%;
        transition: all 0.2s;

        &:hover {
          color: var(--text-primary);
          background: rgba(0, 0, 0, 0.05);
        }
      }
    }

    .sidebar-content {
      flex: 1;
      overflow-y: auto;
      padding: 0;

      .spot-image-carousel {
        position: relative;
        width: 100%;
        height: 220px;
        flex-shrink: 0;

        .el-carousel {
          height: 100%;
          border-radius: 0;
        }

        .carousel-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .spot-image-single {
          width: 100%;
          height: 100%;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .carousel-indicators {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
          z-index: 10;

          .indicator-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            transition: all 0.2s;
          }
        }
      }

      .spot-info-section {
        padding: 20px;

        .spot-name {
          margin: 0 0 12px 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .spot-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;

          .spot-rating {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 0.9rem;
            color: var(--warning-color);
            font-weight: 500;

            .el-icon {
              font-size: 1rem;
            }
          }

          .spot-price {
            font-weight: 600;
            color: var(--primary-color);
            font-size: 0.95rem;
          }
        }

        .spot-details {
          margin-bottom: 16px;

          .detail-item {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 12px;
            font-size: 0.9rem;
            color: var(--text-regular);
            line-height: 1.5;

            .detail-icon {
              color: var(--primary-color);
              font-size: 1rem;
              margin-top: 2px;
              flex-shrink: 0;
            }

            span {
              flex: 1;
            }
          }
        }

        .ai-recommendation {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08));
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          border: 1px solid rgba(102, 126, 234, 0.15);

          .ai-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 10px;
            font-weight: 600;
            font-size: 0.9rem;
            color: var(--primary-color);

            .ai-icon {
              font-size: 1.1rem;
            }
          }

          .ai-loading {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.85rem;
            color: var(--text-secondary);

            .loading-spinner {
              font-size: 1rem;
              animation: spin 1s linear infinite;
              color: var(--primary-color);
            }
          }

          .ai-content {
            font-size: 0.85rem;
            line-height: 1.7;
            color: var(--text-regular);
            margin: 0;
          }
        }

        .sidebar-actions {
          padding-top: 8px;

          .action-btn {
            width: 100%;
            height: 44px;
            font-size: 0.95rem;
            font-weight: 500;
            border-radius: 10px;
          }
        }
      }
    }

    .empty-sidebar {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40px;

      .empty-icon {
        font-size: 3rem;
        color: var(--text-light);
        margin-bottom: 16px;
      }

      p {
        color: var(--text-secondary);
        margin: 0;
        font-size: 0.95rem;
      }
    }
  }
}

.spots-list-section {
  position: relative;
  z-index: 1;
  padding: 0.1vh 0;

  .section-title {
    display: flex;
    align-items: center;
    gap: 1vw;
    margin-bottom: 4vh;
    font-size: 1.5rem;

    .title-icon {
      color: var(--primary-color);
    }
  }

  .spots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2vw;

    &.recommend-grid {
      grid-template-columns: repeat(4, 1fr);
      max-width: 1400px;
      margin: 0 auto;
    }
  }

  .spot-card {
    background: white;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-md);
    transition: all var(--transition-normal);
    cursor: pointer;

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .spot-card-image {
      position: relative;
      height: 180px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .spot-tag {
        position: absolute;
        top: 1vh;
        left: 1vw;
      }
    }

    .spot-card-content {
      padding: 2vh 2vw;

      h4 {
        margin-bottom: 1vh;
        font-size: 1.1rem;
      }

      .spot-card-meta {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1vh;
        font-size: 0.9rem;

        .distance {
          color: var(--text-secondary);
        }

        .rating {
          color: var(--warning-color);
          font-weight: 600;
        }
      }

      .spot-card-desc {
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin-bottom: 2vh;
        line-height: 1.5;
      }

      .spot-card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .price {
          font-weight: 600;
          color: var(--primary-color);
        }
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .spots-grid {
    &.recommend-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;

    .search-input-wrapper {
      width: 100%;
    }

    .type-select {
      width: 100%;
    }
  }

  .map-container {
    .sidebar {
      width: calc(100% - 20px);
      right: 10px;
      top: 10px;
      bottom: 10px;
      max-height: calc(100% - 20px);
      border-radius: 12px;
      transform: translateY(-100%);

      &.open {
        transform: translateY(0);
      }
    }
  }

  .spots-grid {
    grid-template-columns: 1fr;

    &.recommend-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
