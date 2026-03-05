<script setup>
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'
import {
  User,
  UserFilled,
  Document,
  ChatDotRound,
  ShoppingCart,
  Location,
  Collection,
  TrendCharts
} from '@element-plus/icons-vue'
import { getDashboardStats } from '@/api/dashboard'

const loading = ref(false)
const stats = ref({
  totalUsers: 0,
  todayNewUsers: 0,
  totalPosts: 0,
  todayNewPosts: 0,
  totalComments: 0,
  totalOrders: 0,
  totalSpots: 0,
  totalFish: 0,
  pendingPosts: 0,
  pendingReviews: 0,
  totalAiCalls: 0,
  userTrend: [],
  postTrend: [],
  orderTrend: [],
  postTypeDistribution: [],
  fishSpeciesDistribution: [],
  latestUsers: [],
  latestPosts: [],
  latestOrders: []
})

const userTrendChartRef = ref(null)
const postTrendChartRef = ref(null)
const orderTrendChartRef = ref(null)
const postTypeChartRef = ref(null)

const statCards = computed(() => [
  { title: '总用户数', value: stats.value.totalUsers, icon: User, color: '#00d4ff', trend: stats.value.todayNewUsers, trendText: '今日新增' },
  { title: '帖子总数', value: stats.value.totalPosts, icon: Document, color: '#00ffcc', trend: stats.value.todayNewPosts, trendText: '今日新增' },
  { title: '评论总数', value: stats.value.totalComments, icon: ChatDotRound, color: '#0099ff', trend: null, trendText: null },
  { title: '订单总数', value: stats.value.totalOrders, icon: ShoppingCart, color: '#f56c6c', trend: null, trendText: null },
  { title: '钓点总数', value: stats.value.totalSpots, icon: Location, color: '#67c23a', trend: null, trendText: null },
  { title: '鱼类百科', value: stats.value.totalFish, icon: Collection, color: '#e6a23c', trend: null, trendText: null },
  { title: '待审核帖子', value: stats.value.pendingPosts, icon: TrendCharts, color: '#f56c6c', trend: null, trendText: null },
  { title: 'AI调用次数', value: stats.value.totalAiCalls, icon: UserFilled, color: '#909399', trend: null, trendText: null }
])

const fetchStats = async () => {
  loading.value = true
  try {
    const data = await getDashboardStats()
    stats.value = data
    await initCharts()
  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
  } finally {
    loading.value = false
  }
}

const initCharts = async () => {
  await initUserTrendChart()
  await initPostTrendChart()
  await initOrderTrendChart()
  await initPostTypeChart()
}

const initUserTrendChart = () => {
  if (!userTrendChartRef.value) return
  const chart = echarts.init(userTrendChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: stats.value.userTrend.map(item => item.date),
      axisLine: {
        lineStyle: {
          color: '#94a3b8'
        }
      },
      axisLabel: {
        color: '#94a3b8'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#94a3b8'
        }
      },
      axisLabel: {
        color: '#94a3b8'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      }
    },
    series: [
      {
        name: '用户数',
        type: 'line',
        smooth: true,
        data: stats.value.userTrend.map(item => item.value),
        itemStyle: {
          color: '#00d4ff'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 212, 255, 0.3)' },
            { offset: 1, color: 'rgba(0, 212, 255, 0.05)' }
          ])
        }
      }
    ]
  }
  chart.setOption(option)
}

const initPostTrendChart = () => {
  if (!postTrendChartRef.value) return
  const chart = echarts.init(postTrendChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: stats.value.postTrend.map(item => item.date),
      axisLine: {
        lineStyle: {
          color: '#94a3b8'
        }
      },
      axisLabel: {
        color: '#94a3b8'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#94a3b8'
        }
      },
      axisLabel: {
        color: '#94a3b8'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      }
    },
    series: [
      {
        name: '帖子数',
        type: 'line',
        smooth: true,
        data: stats.value.postTrend.map(item => item.value),
        itemStyle: {
          color: '#00ffcc'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 255, 204, 0.3)' },
            { offset: 1, color: 'rgba(0, 255, 204, 0.05)' }
          ])
        }
      }
    ]
  }
  chart.setOption(option)
}

const initOrderTrendChart = () => {
  if (!orderTrendChartRef.value) return
  const chart = echarts.init(orderTrendChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: stats.value.orderTrend.map(item => item.date),
      axisLine: {
        lineStyle: {
          color: '#94a3b8'
        }
      },
      axisLabel: {
        color: '#94a3b8'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#94a3b8'
        }
      },
      axisLabel: {
        color: '#94a3b8'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      }
    },
    series: [
      {
        name: '订单数',
        type: 'line',
        smooth: true,
        data: stats.value.orderTrend.map(item => item.value),
        itemStyle: {
          color: '#f56c6c'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
          ])
        }
      }
    ]
  }
  chart.setOption(option)
}

const initPostTypeChart = () => {
  if (!postTypeChartRef.value) return
  const chart = echarts.init(postTypeChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      textStyle: {
        color: '#e2e8f0'
      }
    },
    series: [
      {
        name: '帖子类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: 'rgba(30, 41, 59, 0.8)',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
            color: '#e2e8f0'
          }
        },
        labelLine: {
          show: false
        },
        data: stats.value.postTypeDistribution.map(item => ({
          value: item.count,
          name: item.typeName
        }))
      }
    ],
    color: ['#00d4ff', '#00ffcc', '#0099ff', '#f56c6c', '#e6a23c', '#67c23a']
  }
  chart.setOption(option)
}

const handleResize = () => {
  if (userTrendChartRef.value) {
    echarts.getInstanceByDom(userTrendChartRef.value)?.resize()
  }
  if (postTrendChartRef.value) {
    echarts.getInstanceByDom(postTrendChartRef.value)?.resize()
  }
  if (orderTrendChartRef.value) {
    echarts.getInstanceByDom(orderTrendChartRef.value)?.resize()
  }
  if (postTypeChartRef.value) {
    echarts.getInstanceByDom(postTypeChartRef.value)?.resize()
  }
}

onMounted(() => {
  fetchStats()
  window.addEventListener('resize', handleResize)
})
</script>

<template>
  <div class="dashboard-view" v-loading="loading">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div v-for="stat in statCards" :key="stat.title" class="stat-card">
        <div class="stat-icon" :style="{ backgroundColor: stat.color + '20', color: stat.color }">
          <el-icon :size="32"><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-title">{{ stat.title }}</div>
          <div v-if="stat.trend !== null" class="stat-trend">
            <span class="trend-value">+{{ stat.trend }}</span>
            <span class="trend-text">{{ stat.trendText }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-row">
      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">用户增长趋势</span>
          </div>
        </template>
        <div ref="userTrendChartRef" class="chart-container"></div>
      </el-card>

      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">帖子增长趋势</span>
          </div>
        </template>
        <div ref="postTrendChartRef" class="chart-container"></div>
      </el-card>

      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">订单增长趋势</span>
          </div>
        </template>
        <div ref="orderTrendChartRef" class="chart-container"></div>
      </el-card>
    </div>

    <!-- 第二行图表 -->
    <div class="charts-row">
      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">帖子类型分布</span>
          </div>
        </template>
        <div ref="postTypeChartRef" class="chart-container"></div>
      </el-card>

      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">最新动态</span>
          </div>
        </template>
        <div class="latest-activities">
          <div v-for="post in stats.latestPosts" :key="post.id" class="activity-item">
            <div class="activity-avatar">
              <el-avatar :size="40" :src="post.avatar" />
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ post.title }}</div>
              <div class="activity-user">{{ post.username }}</div>
              <div class="activity-time">{{ post.createTime }}</div>
            </div>
          </div>
          <el-empty v-if="stats.latestPosts.length === 0" description="暂无数据" />
        </div>
      </el-card>
    </div>

    <!-- 最新数据列表 -->
    <div class="latest-section">
      <el-card class="latest-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">最新用户</span>
          </div>
        </template>
        <div class="latest-list">
          <div v-for="user in stats.latestUsers" :key="user.id" class="latest-item">
            <el-avatar :size="40" :src="user.avatar" />
            <div class="latest-info">
              <div class="latest-name">{{ user.nickname || user.username }}</div>
              <div class="latest-time">{{ user.createTime }}</div>
            </div>
          </div>
          <el-empty v-if="stats.latestUsers.length === 0" description="暂无数据" />
        </div>
      </el-card>

      <el-card class="latest-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">最新订单</span>
          </div>
        </template>
        <div class="latest-list">
          <div v-for="order in stats.latestOrders" :key="order.id" class="latest-item">
            <div class="order-icon">
              <el-icon :size="32" color="#00d4ff"><ShoppingCart /></el-icon>
            </div>
            <div class="latest-info">
              <div class="latest-name">{{ order.gearTitle }}</div>
              <div class="latest-detail">
                <span class="order-amount">¥{{ order.totalAmount }}</span>
                <el-tag :type="order.status === '已完成' ? 'success' : 'warning'" size="small">
                  {{ order.status }}
                </el-tag>
              </div>
              <div class="latest-time">{{ order.createTime }}</div>
            </div>
          </div>
          <el-empty v-if="stats.latestOrders.length === 0" description="暂无数据" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-view {
  padding: 20px;

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 50px;
    margin-bottom: 20px;

    .stat-card {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        border-color: rgba(0, 212, 255, 0.3);
        box-shadow: 0 8px 32px rgba(0, 212, 255, 0.1);
      }

      .stat-icon {
        width: 64px;
        height: 64px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #e2e8f0;
          line-height: 1.2;
        }

        .stat-title {
          font-size: 14px;
          color: #94a3b8;
          margin-top: 4px;
        }

        .stat-trend {
          margin-top: 8px;
          font-size: 12px;

          .trend-value {
            color: #67c23a;
            font-weight: 600;
            margin-right: 4px;
          }

          .trend-text {
            color: #94a3b8;
          }
        }
      }
    }
  }

  .charts-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
    margin-bottom: 20px;

    .chart-card {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;

      :deep(.el-card__header) {
        background: transparent;
        border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        padding: 16px 20px;
      }

      :deep(.el-card__body) {
        padding: 20px;
      }

      .card-header {
        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #e2e8f0;
        }
      }

      .chart-container {
        width: 100%;
        height: 300px;
      }

      .latest-activities {
        max-height: 300px;
        overflow-y: auto;

        .activity-item {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);

          &:last-child {
            border-bottom: none;
          }

          .activity-avatar {
            flex-shrink: 0;
          }

          .activity-content {
            flex: 1;
            min-width: 0;

            .activity-title {
              font-size: 14px;
              font-weight: 500;
              color: #e2e8f0;
              margin-bottom: 4px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .activity-user {
              font-size: 12px;
              color: #94a3b8;
              margin-bottom: 2px;
            }

            .activity-time {
              font-size: 12px;
              color: #64748b;
            }
          }
        }
      }
    }
  }

  .latest-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;

    .latest-card {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;

      :deep(.el-card__header) {
        background: transparent;
        border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        padding: 16px 20px;
      }

      :deep(.el-card__body) {
        padding: 20px;
      }

      .card-header {
        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #e2e8f0;
        }
      }

      .latest-list {
        max-height: 300px;
        overflow-y: auto;

        .latest-item {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);

          &:last-child {
            border-bottom: none;
          }

          .order-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background: rgba(0, 212, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .latest-info {
            flex: 1;
            min-width: 0;

            .latest-name {
              font-size: 14px;
              font-weight: 500;
              color: #e2e8f0;
              margin-bottom: 4px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .latest-detail {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 4px;

              .order-amount {
                font-size: 14px;
                font-weight: 600;
                color: #f56c6c;
              }
            }

            .latest-time {
              font-size: 12px;
              color: #64748b;
            }
          }
        }
      }
    }
  }
}
</style>
