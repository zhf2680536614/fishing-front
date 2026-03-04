<template>
  <div class="home-container">
    <div class="background-gradient"></div>

    <div class="content-wrapper">
      <div class="hero-section">
        <el-row :gutter="32" class="hero-row">
          <el-col :xs="24" :lg="14" class="hero-left">
            <div class="welcome-content">
              <div class="greeting-badge">
                <el-icon><Sunny /></el-icon>
                <span>{{ greeting }}</span>
              </div>

              <h1 class="main-title">
                <span class="gradient-text">{{ greeting }},</span>
                <span class="highlight">钓鱼佬！</span>
              </h1>

              <p class="subtitle">"水太深，风浪大，AI 帮你算算卦。" —— 今日适钓指数查询中...</p>

              <div class="quick-actions">
                <el-button
                  type="primary"
                  size="large"
                  class="action-btn primary-btn"
                  @click="$router.push('/map')"
                >
                  <el-icon class="btn-icon"><MapLocation /></el-icon>
                  附近钓点
                </el-button>
                <el-button
                  size="large"
                  class="action-btn secondary-btn"
                  @click="$router.push('/ai-tools')"
                >
                  <el-icon class="btn-icon"><MagicStick /></el-icon>
                  AI 饵料配方
                </el-button>
              </div>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon-wrapper blue">
                    <el-icon><TrendCharts /></el-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ todayFishingCount.toLocaleString() }}</div>
                    <div class="stat-label">今日出钓</div>
                  </div>
                </div>

                <div class="stat-card warning">
                  <div class="stat-icon-wrapper orange">
                    <el-icon><Warning /></el-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ airForceCount }}</div>
                    <div class="stat-label">今日空军</div>
                  </div>
                </div>

                <div class="stat-card success">
                  <div class="stat-icon-wrapper green">
                    <el-icon><Trophy /></el-icon>
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ Math.floor(todayTotalWeight) }}<span class="unit">kg</span></div>
                    <div class="stat-label">今日鱼获</div>
                  </div>
                </div>
              </div>
            </div>
          </el-col>

          <el-col :xs="24" :lg="10" class="hero-right">
            <div class="weather-card">
              <div class="card-header">
                <div class="location-info">
                  <el-icon class="location-icon"><LocationInformation /></el-icon>
                  <span v-if="loadingLocation" class="location-loading">
                    <el-icon class="tiny-loading-icon"><Loading /></el-icon>
                    定位中...
                  </span>
                  <span v-else class="location-text">{{ weatherData.location }}</span>
                </div>
                <el-tag :type="weatherData.pressureStatus.type" size="small" round effect="dark">
                  {{ weatherData.pressureStatus.text }}
                </el-tag>
              </div>

                <div class="weather-main">
                  <div class="weather-left">
                    <div class="temperature">
                      <span class="temp-value">{{ weatherData.temperature }}</span>
                      <span class="temp-unit">°C</span>
                    </div>
                    <div class="weather-desc">
                      <div class="weather-icon-wrapper">
                        <el-icon class="weather-icon"><Cloudy /></el-icon>
                      </div>
                      <div class="weather-details">
                        <span class="weather-text">{{ weatherData.weather }}</span>
                        <span class="wind-text">{{ weatherData.wind }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- 适钓指数加载状态 -->
                  <div class="ai-score-section">
                    <div v-if="loadingFishingIndex" class="score-loading">
                      <el-icon class="small-loading-icon"><Loading /></el-icon>
                      <span class="score-loading-text">计算中...</span>
                    </div>
                    <div v-else class="score-ring">
                      <svg class="progress-ring" width="120" height="120">
                        <circle class="progress-ring-circle-bg" cx="60" cy="60" r="50" />
                        <circle
                          class="progress-ring-circle"
                          cx="60"
                          cy="60"
                          r="50"
                          :stroke-dasharray="circumference"
                          :stroke-dashoffset="dashOffset"
                        />
                      </svg>
                      <div class="score-content">
                        <span class="score-number">{{ weatherData.fishingScore }}</span>
                        <span class="score-label">适钓指数</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="weather-metrics">
                  <div class="metric-item">
                    <div class="metric-icon">
                      <el-icon><Odometer /></el-icon>
                    </div>
                    <div class="metric-info">
                      <span v-if="loadingWeather" class="metric-loading">
                        <el-icon class="tiny-loading-icon"><Loading /></el-icon>
                      </span>
                      <span v-else class="metric-value">{{ weatherData.pressure }}</span>
                      <span class="metric-label">气压 (hPa)</span>
                    </div>
                  </div>

                  <div class="metric-item">
                    <div class="metric-icon">
                      <el-icon><Clock /></el-icon>
                    </div>
                    <div class="metric-info">
                      <span v-if="loadingWeather" class="metric-loading">
                        <el-icon class="tiny-loading-icon"><Loading /></el-icon>
                      </span>
                      <span v-else class="metric-value">{{ weatherData.tide }}</span>
                      <span class="metric-label">潮汐</span>
                    </div>
                  </div>

                  <div class="metric-item">
                    <div class="metric-icon">
                      <el-icon><Sunny /></el-icon>
                    </div>
                    <div class="metric-info">
                      <span v-if="loadingWeather" class="metric-loading">
                        <el-icon class="tiny-loading-icon"><Loading /></el-icon>
                      </span>
                      <span v-else class="metric-value">{{ weatherData.humidity }}</span>
                      <span class="metric-label">湿度</span>
                    </div>
                  </div>
                </div>

                <div class="ai-advice">
                  <div class="advice-header">
                    <el-icon class="ai-icon"><Cpu /></el-icon>
                    <span class="advice-title">AI 垂钓建议</span>
                  </div>
                  <div v-if="loadingFishingIndex" class="advice-loading">
                    <el-icon class="small-loading-icon"><Loading /></el-icon>
                    <span>AI正在分析天气数据...</span>
                  </div>
                  <p v-else class="advice-text">
                    {{ weatherData.aiAdvice }}
                  </p>
                </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="hot-posts-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="fire-emoji">🔥</span>
            今日爆护榜
          </h2>
          <el-button link class="view-all-btn" @click="$router.push('/community')">
            查看全部
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </el-button>
        </div>

        <el-carousel :interval="5000" type="card" height="360px" class="posts-carousel">
          <el-carousel-item v-for="post in hotPosts" :key="post.id">
            <div class="post-card" @click="goToDetail(post.id)">
              <img :src="post.coverImage" class="post-image" alt="鱼获" />

              <div class="post-overlay">
                <div class="post-badges">
                  <el-tag v-if="post.fish_weight > 10" type="danger" effect="dark" size="small">
                    巨物
                  </el-tag>
                  <el-tag type="info" effect="dark" size="small">
                    {{ post.fish_species }}
                  </el-tag>
                </div>

                <h3 class="post-title">{{ post.title }}</h3>

                <div class="post-footer">
                  <div class="user-info">
                    <el-avatar :size="28" :src="post.user_avatar" />
                    <span class="username">{{ post.user_nickname }}</span>
                  </div>
                  <div class="fish-weight">
                    <el-icon><Trophy /></el-icon>
                    <span>{{ post.fish_weight }}斤</span>
                  </div>
                </div>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>

      <div class="features-section">
        <h2 class="section-title">探索俱乐部</h2>

        <div class="features-grid">
          <div class="feature-card blue" @click="$router.push('/map')">
            <div class="feature-icon-wrapper">
              <el-icon class="feature-icon"><MapLocation /></el-icon>
            </div>
            <div class="feature-content">
              <h3 class="feature-title">智能钓点地图</h3>
              <p class="feature-desc">查看野钓点，包含鱼种、收费等信息</p>
            </div>
            <el-icon class="feature-arrow"><ArrowRight /></el-icon>
          </div>

          <div class="feature-card green" @click="$router.push('/ai-tools')">
            <div class="feature-icon-wrapper">
              <el-icon class="feature-icon"><Camera /></el-icon>
            </div>
            <div class="feature-content">
              <h3 class="feature-title">AI 识鱼</h3>
              <p class="feature-desc">不认识鱼？拍照上传，AI 自动识别鱼种</p>
            </div>
            <el-icon class="feature-arrow"><ArrowRight /></el-icon>
          </div>

          <div class="feature-card purple" @click="goToAirForceCommunity">
            <div class="feature-icon-wrapper">
              <el-icon class="feature-icon"><ChatLineSquare /></el-icon>
            </div>
            <div class="feature-content">
              <h3 class="feature-title">空军疗伤社区</h3>
              <p class="feature-desc">除了鱼什么都钓到了？来这里吐槽，寻找心理安慰</p>
            </div>
            <el-icon class="feature-arrow"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  MapLocation,
  MagicStick,
  Warning,
  LocationInformation,
  Cpu,
  ArrowRight,
  Trophy,
  Camera,
  ChatLineSquare,
  Sunny,
  Cloudy,
  TrendCharts,
  Odometer,
  Clock,
  Loading,
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import {
  logApiKeyStatus,
  fetchFishingIndex,
  getUserLocation,
  fetchWeatherData,
  getTideStatus,
} from '@/api'
import { getHomeStats, getTodayHotPosts } from '@/api/home'
import { ElMessage } from 'element-plus'

const router = useRouter()

logApiKeyStatus()

const airForceCount = ref(0)
const todayFishingCount = ref(0)
const todayTotalWeight = ref(0)
const loadingLocation = ref(true)
const loadingWeather = ref(true)
const loadingFishingIndex = ref(true)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早安'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const weatherData = ref({
  location: '杭州市 · 西湖区',
  temperature: 24,
  weather: '多云转阴',
  wind: '东南风 3级',
  pressure: 1002,
  pressureStatus: {
    type: 'warning',
    text: '气压偏低',
  },
  tide: '涨潮中',
  humidity: '65%',
  fishingScore: 68,
  aiAdvice:
    '气压由 1005hPa 降至 1002hPa，水中溶氧量略降。建议使用长子线、小钩型，改钓浮或钓半水。饵料建议添加腥味以刺激开口。',
})

const hotPosts = ref([])

const circumference = 2 * Math.PI * 50

const dashOffset = computed(() => {
  const progress = weatherData.value.fishingScore / 100
  return circumference * (1 - progress)
})

const goToDetail = (id) => {
  router.push(`/community/post/${id}`)
}

const goToAirForceCommunity = () => {
  sessionStorage.setItem('community_active_tab', 'air-force')
  router.push('/community')
}

// 加载首页统计数据
const loadHomeStats = async () => {
  try {
    const stats = await getHomeStats()
    todayFishingCount.value = stats.todayFishingCount || 0
    airForceCount.value = stats.todayAirForceCount || 0
    todayTotalWeight.value = stats.todayTotalWeight || 0
  } catch (error) {
    console.error('获取首页统计数据失败:', error)
  }
}

// 加载今日爆护榜
const loadHotPosts = async () => {
  try {
    const posts = await getTodayHotPosts()
    hotPosts.value = posts.map(item => ({
      id: item.id,
      title: item.title,
      fish_species: item.fishSpecies,
      fish_weight: item.fishWeight,
      coverImage: item.coverImage || 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?q=80&w=800&auto=format&fit=crop',
      user_nickname: item.userNickname || '匿名用户',
      user_avatar: item.userAvatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    }))
  } catch (error) {
    console.error('获取今日爆护榜失败:', error)
    ElMessage.error('获取今日爆护榜失败')
  }
}

const loadWeatherAndFishingData = async () => {
  try {
    // 第一阶段：定位
    loadingLocation.value = true
    loadingWeather.value = true
    loadingFishingIndex.value = true
    console.log('开始获取位置')

    const location = await getUserLocation()
    console.log('获取到的位置信息:', location)
    loadingLocation.value = false

    // 第二阶段：获取天气数据
    console.log('开始获取天气数据')
    const weather = await fetchWeatherData(location.latitude, location.longitude)
    console.log('获取到的天气数据:', weather)

    const tideStatus = getTideStatus()

    // 先更新天气相关数据
    weatherData.value = {
      ...weatherData.value,
      location: location.address || '杭州市 · 西湖区',
      temperature: weather.temperature,
      weather: weather.weather,
      wind: weather.wind,
      pressure: weather.pressure,
      tide: tideStatus,
      humidity: `${weather.humidity}%`,
    }
    loadingWeather.value = false

    // 第三阶段：获取适钓指数和AI建议
    console.log('开始获取适钓指数')
    const fishingResponse = await fetchFishingIndex({
      location: location.address || '杭州市 · 西湖区',
      temperature: weather.temperature,
      weather: weather.weather,
      windSpeed: weather.windSpeed,
      windDirection: weather.windDirection,
      pressure: weather.pressure,
      humidity: weather.humidity,
    })

    // 防御性检查
    if (!fishingResponse) {
      console.error('获取适钓指数失败，使用默认值')
      return
    }

    weatherData.value = {
      ...weatherData.value,
      pressureStatus: {
        type: fishingResponse.pressureStatus?.includes('适宜')
          ? 'success'
          : fishingResponse.pressureStatus?.includes('偏低')
            ? 'warning'
            : 'info',
        text: fishingResponse.pressureStatus || '气压状态未知',
      },
      fishingScore: fishingResponse.fishingScore || 75,
      aiAdvice: fishingResponse.aiAdvice || '暂无AI建议',
    }
    console.log('适钓指数和AI建议更新成功')
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loadingLocation.value = false
    loadingWeather.value = false
    loadingFishingIndex.value = false
  }
}

onMounted(() => {
  loadWeatherAndFishingData()
  loadHomeStats()
  loadHotPosts()
})
</script>

<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.background-gradient {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.03;
  z-index: -1;
  pointer-events: none;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;
}

.hero-section {
  position: relative;
  z-index: 1;
  margin-bottom: 64px;
}

.hero-row {
  align-items: stretch;
}

.welcome-content {
  padding: 40px 0;
}

.greeting-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.main-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0 0 20px 0;
  line-height: 1.2;

  .gradient-text {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .highlight {
    color: #409eff;
  }
}

.subtitle {
  font-size: 1.2rem;
  color: #606266;
  margin-bottom: 40px;
  line-height: 1.6;
  max-width: 90%;
}

.quick-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 48px;

  .action-btn {
    padding: 16px 32px;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 8px;
    transition: all 0.3s ease;

    .btn-icon {
      font-size: 1.2rem;
      margin-right: 8px;
    }

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }
  }

  .primary-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;

    &:hover {
      background: linear-gradient(135deg, #5568d3 0%, #653a8f 100%);
    }
  }

  .secondary-btn {
    background: white;
    border: 2px solid #667eea;
    color: #667eea;

    &:hover {
      background: #f5f7ff;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .stat-icon-wrapper {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;

    &.blue {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    &.orange {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    &.green {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }
  }

  .stat-content {
    .stat-value {
      font-size: 1.8rem;
      font-weight: 800;
      color: #303133;
      line-height: 1;
      margin-bottom: 4px;

      .unit {
        font-size: 0.9rem;
        font-weight: 500;
        color: #909399;
        margin-left: 2px;
      }
    }

    .stat-label {
      font-size: 0.85rem;
      color: #909399;
      font-weight: 500;
    }
  }
}

.weather-card {
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(102, 126, 234, 0.1);
  position: relative;
}

.small-loading-icon {
  font-size: 1.5rem;
  color: #667eea;
  animation: spin 1s linear infinite;
}

.tiny-loading-icon {
  font-size: 1rem;
  color: #667eea;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.score-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  gap: 8px;
}

.score-loading-text {
  font-size: 0.8rem;
  color: #667eea;
  font-weight: 500;
}

.metric-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1rem;
}

.advice-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: #667eea;
  font-size: 0.9rem;
}

.location-loading {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #667eea;
  font-size: 0.9rem;
  font-weight: 500;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .location-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .location-icon {
      color: #667eea;
      font-size: 1.2rem;
    }

    .location-text {
      font-weight: 600;
      color: #303133;
      font-size: 1rem;
    }
  }
}

.weather-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.weather-left {
  flex: 1;
}

.temperature {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 16px;

  .temp-value {
    font-size: 4rem;
    font-weight: 700;
    color: #303133;
    line-height: 1;
  }

  .temp-unit {
    font-size: 1.5rem;
    font-weight: 600;
    color: #909399;
  }
}

.weather-desc {
  display: flex;
  align-items: center;
  gap: 12px;

  .weather-icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;

    .weather-icon {
      font-size: 1.5rem;
      color: white;
    }
  }

  .weather-details {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .weather-text {
      font-size: 1rem;
      font-weight: 600;
      color: #303133;
    }

    .wind-text {
      font-size: 0.85rem;
      color: #909399;
    }
  }
}

.ai-score-section {
  display: flex;
  justify-content: center;
  align-items: center;
}

.score-ring {
  position: relative;
  width: 120px;
  height: 120px;
}

.progress-ring {
  transform: rotate(-90deg);

  &-circle-bg {
    fill: none;
    stroke: #f0f0f0;
    stroke-width: 8;
  }

  &-circle {
    fill: none;
    stroke: url(#gradient);
    stroke-width: 8;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.5s ease;
  }
}

.score-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;

  .score-number {
    display: block;
    font-size: 1.8rem;
    font-weight: 800;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .score-label {
    font-size: 0.75rem;
    color: #909399;
    font-weight: 500;
  }
}

.weather-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9ff;
  border-radius: 12px;

  .metric-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #667eea;
    font-size: 1.2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .metric-info {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .metric-value {
      font-size: 1rem;
      font-weight: 700;
      color: #303133;
    }

    .metric-label {
      font-size: 0.75rem;
      color: #909399;
    }
  }
}

.ai-advice {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7ff 0%, #e8ecff 100%);
  border-radius: 16px;
  border: 1px solid rgba(102, 126, 234, 0.2);

  .advice-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    .ai-icon {
      font-size: 1.2rem;
      color: #667eea;
    }

    .advice-title {
      font-weight: 700;
      color: #667eea;
      font-size: 1rem;
    }
  }

  .advice-text {
    margin: 0;
    font-size: 0.9rem;
    color: #555;
    line-height: 1.6;
  }
}

.hot-posts-section {
  position: relative;
  z-index: 1;
  margin-bottom: 64px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;

  .section-title {
    font-size: 2rem;
    font-weight: 800;
    margin: 0;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 12px;

    .fire-emoji {
      font-size: 1.8rem;
    }
  }

  .view-all-btn {
    font-size: 1rem;
    font-weight: 600;
    color: #667eea;

    .arrow-icon {
      margin-left: 4px;
    }
  }
}

.posts-carousel {
  :deep(.el-carousel__indicators) {
    .el-carousel__indicator {
      .el-carousel__button {
        background-color: #667eea;
      }
    }
  }
}

.post-card {
  width: 100%;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
  }

  .post-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .post-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 24px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.85), transparent);
    color: white;

    .post-badges {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .post-title {
      margin: 0 0 16px 0;
      font-size: 1.3rem;
      font-weight: 700;
      line-height: 1.4;
      color: #fff;
    }

    .post-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .user-info {
        display: flex;
        align-items: center;
        gap: 10px;

        .username {
          font-size: 0.95rem;
          font-weight: 500;
        }
      }

      .fish-weight {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 700;
        font-size: 1.1rem;
        color: #ffd700;
      }
    }
  }
}

.features-section {
  position: relative;
  z-index: 1;
  margin-bottom: 48px;

  .section-title {
    font-size: 2rem;
    font-weight: 800;
    margin: 0 0 32px 0;
    color: #303133;
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-card {
  position: relative;
  padding: 32px;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);

    &::before {
      opacity: 1;
    }

    .feature-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }

  &.blue {
    .feature-icon-wrapper {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  }

  &.green {
    .feature-icon-wrapper {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
  }

  &.purple {
    .feature-icon-wrapper {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
  }

  .feature-icon-wrapper {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;

    .feature-icon {
      font-size: 1.8rem;
      color: white;
    }
  }

  .feature-content {
    .feature-title {
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0 0 12px 0;
      color: #303133;
    }

    .feature-desc {
      font-size: 0.95rem;
      color: #606266;
      line-height: 1.6;
      margin: 0;
    }
  }

  .feature-arrow {
    position: absolute;
    bottom: 24px;
    right: 24px;
    font-size: 1.5rem;
    color: #667eea;
    opacity: 0;
    transform: translateX(-10px);
    transition: all 0.3s ease;
  }
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .main-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 20px 16px;
  }

  .hero-section {
    margin-bottom: 48px;
  }

  .main-title {
    font-size: 2rem;
  }

  .quick-actions {
    flex-direction: column;

    .action-btn {
      width: 100%;
    }
  }

  .weather-metrics {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 1.5rem;
  }
}
</style>
