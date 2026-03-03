<template>
  <div class="dashboard-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">工作台</h1>
      <div class="page-info">
        <span class="date">{{ currentDate }}</span>
        <span class="time">{{ currentTime }}</span>
      </div>
    </div>

    <!-- 核心指标 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon user-icon">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.newUsers }}</div>
          <div class="stat-label">今日新增用户</div>
          <div class="stat-trend positive">
            <el-icon><ArrowUp /></el-icon> {{ stats.newUsersTrend }}%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon post-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.newPosts }}</div>
          <div class="stat-label">今日发帖量</div>
          <div class="stat-trend positive">
            <el-icon><ArrowUp /></el-icon> {{ stats.newPostsTrend }}%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon image-icon">
          <el-icon><Picture /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.imageUploads }}</div>
          <div class="stat-label">今日图片上传</div>
          <div class="stat-trend negative">
            <el-icon><ArrowDown /></el-icon> {{ stats.imageUploadsTrend }}%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon storage-icon">
          <el-icon><Folder /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.storageUsed }}</div>
          <div class="stat-label">MinIO存储占用</div>
          <div class="stat-trend warning">
            <el-icon><Warning /></el-icon> {{ stats.storageUsedPercentage }}%
          </div>
        </div>
      </div>
    </div>

    <!-- 鱼情分布 -->
    <div class="map-section">
      <div class="section-header">
        <h2 class="section-title">
          <el-icon class="title-icon"><MapLocation /></el-icon> 鱼情分布
        </h2>
        <div class="section-controls">
          <el-select v-model="mapTimeRange" class="time-select">
            <el-option label="近7天" value="7d" />
            <el-option label="近30天" value="30d" />
            <el-option label="近90天" value="90d" />
          </el-select>
        </div>
      </div>
      <div class="map-container">
        <div id="fishMap" class="map"></div>
      </div>
    </div>

    <!-- 数据图表 -->
    <div class="charts-section">
      <!-- AI 调用统计 -->
      <div class="chart-card">
        <div class="card-header">
          <h3 class="card-title">
            <el-icon class="title-icon"><Cpu /></el-icon> AI 调用统计
          </h3>
          <div class="card-controls">
            <el-select v-model="aiTimeRange" class="time-select">
              <el-option label="今日" value="today" />
              <el-option label="本周" value="week" />
              <el-option label="本月" value="month" />
            </el-select>
          </div>
        </div>
        <div class="chart-content">
          <div id="aiUsageChart" class="chart"></div>
        </div>
      </div>

      <!-- 用户活跃度 -->
      <div class="chart-card">
        <div class="card-header">
          <h3 class="card-title">
            <el-icon class="title-icon"><TrendCharts /></el-icon> 用户活跃度
          </h3>
          <div class="card-controls">
            <el-select v-model="activityTimeRange" class="time-select">
              <el-option label="本周" value="week" />
              <el-option label="本月" value="month" />
              <el-option label="本年" value="year" />
            </el-select>
          </div>
        </div>
        <div class="chart-content">
          <div id="activityChart" class="chart"></div>
        </div>
      </div>
    </div>

    <!-- 最近动态 -->
    <div class="activity-section">
      <div class="section-header">
        <h2 class="section-title">
          <el-icon class="title-icon"><Bell /></el-icon> 最近动态
        </h2>
      </div>
      <div class="activity-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon" :class="activity.type">
            <el-icon>{{ activity.icon }}</el-icon>
          </div>
          <div class="activity-content">
            <p class="activity-text">{{ activity.text }}</p>
            <span class="activity-time">{{ activity.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  User,
  Document,
  Picture,
  Folder,
  MapLocation,
  Cpu,
  TrendCharts,
  Bell,
  ArrowUp,
  ArrowDown,
  Warning,
  CirclePlus,
  Star,
} from '@element-plus/icons-vue'

// 响应式数据
const currentDate = ref('')
const currentTime = ref('')
const mapTimeRange = ref('7d')
const aiTimeRange = ref('week')
const activityTimeRange = ref('week')

// 核心指标数据
const stats = ref({
  newUsers: 28,
  newUsersTrend: 12.5,
  newPosts: 156,
  newPostsTrend: 8.3,
  imageUploads: 324,
  imageUploadsTrend: 3.2,
  storageUsed: '12.5 GB',
  storageUsedPercentage: 68,
})

// 最近动态
const recentActivities = ref([
  {
    id: 1,
    type: 'user',
    icon: CirclePlus,
    text: '用户 钓鱼佬007 注册成功',
    time: '10分钟前',
  },
  {
    id: 2,
    type: 'post',
    icon: Document,
    text: '用户 路亚疯子 发布了新帖子：这就是路亚的魅力！',
    time: '25分钟前',
  },
  {
    id: 3,
    type: 'image',
    icon: Picture,
    text: '用户 台钓老王 上传了3张鱼获图片',
    time: '1小时前',
  },
  {
    id: 4,
    type: 'ai',
    icon: Cpu,
    text: 'AI 识鱼功能被调用 12 次',
    time: '2小时前',
  },
  {
    id: 5,
    type: 'like',
    icon: Star,
    text: '帖子 守了三天三夜，终于上岸了 获得 56 个点赞',
    time: '3小时前',
  },
])

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// 初始化图表
const initCharts = () => {
  // 模拟图表初始化
  const charts = ['fishMap', 'aiUsageChart', 'activityChart']
  charts.forEach((chartId) => {
    const chartElement = document.getElementById(chartId)
    if (chartElement) {
      chartElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-light); font-size: 0.9rem;">
          <el-icon style="font-size: 2rem; margin-bottom: 10px; display: block; color: var(--primary-color);"><Cpu /></el-icon>
          <p>图表加载中...</p>
          <p style="font-size: 0.8rem; margin-top: 5px;">实际项目中会使用 ECharts</p>
        </div>
      `
    }
  })
}

// 生命周期
onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
  initCharts()
})
</script>

<style lang="scss" scoped>
.dashboard-page {
  padding: 2vw;
  height: 100%;
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3vh;

  .page-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }

  .page-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    .date {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .time {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--primary-color);
    }
  }
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2vw;
  margin-bottom: 3vh;
}

.stat-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 2vh;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: 1.5vw;
  transition: all var(--transition-normal);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;

    &.user-icon {
      background: linear-gradient(135deg, #4361ee, #4895ef);
      color: white;
    }

    &.post-icon {
      background: linear-gradient(135deg, #4cc9f0, #4895ef);
      color: white;
    }

    &.image-icon {
      background: linear-gradient(135deg, #4ade80, #4cc9f0);
      color: white;
    }

    &.storage-icon {
      background: linear-gradient(135deg, #fbbf24, #f87171);
      color: white;
    }
  }

  .stat-content {
    flex: 1;

    .stat-number {
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 0.5vh;
    }

    .stat-label {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-bottom: 0.5vh;
    }

    .stat-trend {
      font-size: 0.8rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.3vw;

      &.positive {
        color: var(--success-color);
      }

      &.negative {
        color: var(--danger-color);
      }

      &.warning {
        color: var(--warning-color);
      }
    }
  }
}

.map-section {
  background: white;
  border-radius: var(--radius-lg);
  padding: 2.5vh;
  box-shadow: var(--shadow-md);
  margin-bottom: 3vh;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5vh;

  .section-title {
    display: flex;
    align-items: center;
    gap: 1vw;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;

    .title-icon {
      color: var(--primary-color);
    }
  }

  .section-controls {
    .time-select {
      width: 120px;
    }
  }
}

.map-container {
  height: 400px;

  .map {
    width: 100%;
    height: 100%;
    border-radius: var(--radius-md);
    background: var(--bg-tertiary);
  }
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2vw;
  margin-bottom: 3vh;
}

.chart-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 2.5vh;
  box-shadow: var(--shadow-md);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2vh;

    .card-title {
      display: flex;
      align-items: center;
      gap: 1vw;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;

      .title-icon {
        color: var(--primary-color);
      }
    }

    .card-controls {
      .time-select {
        width: 100px;
      }
    }
  }

  .chart-content {
    height: 300px;

    .chart {
      width: 100%;
      height: 100%;
      border-radius: var(--radius-md);
      background: var(--bg-tertiary);
    }
  }
}

.activity-section {
  background: white;
  border-radius: var(--radius-lg);
  padding: 2.5vh;
  box-shadow: var(--shadow-md);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1.5vh;

  .activity-item {
    display: flex;
    gap: 1.5vw;
    padding: 1.5vh;
    border-radius: var(--radius-md);
    transition: background-color 0.3s;

    &:hover {
      background-color: var(--bg-tertiary);
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;

      &.user {
        background: rgba(67, 97, 238, 0.1);
        color: var(--primary-color);
      }

      &.post {
        background: rgba(76, 201, 240, 0.1);
        color: #4cc9f0;
      }

      &.image {
        background: rgba(74, 222, 128, 0.1);
        color: var(--success-color);
      }

      &.ai {
        background: rgba(251, 191, 36, 0.1);
        color: var(--warning-color);
      }

      &.like {
        background: rgba(248, 113, 113, 0.1);
        color: var(--danger-color);
      }
    }

    .activity-content {
      flex: 1;

      .activity-text {
        margin: 0 0 0.5vh 0;
        line-height: 1.4;
        color: var(--text-primary);
      }

      .activity-time {
        font-size: 0.8rem;
        color: var(--text-light);
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-page {
    padding: 2vh;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .charts-section {
    grid-template-columns: 1fr;
  }

  .map-container {
    height: 300px;
  }

  .chart-content {
    height: 250px;
  }
}
</style>
