<template>
  <div class="profile-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">个人中心</h1>
        <p class="page-description">查看你的钓鱼数据和个人信息</p>
      </div>
    </div>

    <!-- 个人信息卡片 -->
    <div class="container">
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-section">
            <el-avatar :size="120" :src="userInfo.avatar" class="profile-avatar" />
            <div class="user-basic-info">
              <h2 class="username">{{ userInfo.nickname }}</h2>
              <div class="user-meta">
                <el-tag v-if="userInfo.isMaster" type="success" effect="dark">钓鱼大师</el-tag>
                <span class="level">Lv.{{ userInfo.level }}</span>
                <span class="exp">经验值: {{ userInfo.exp }}/{{ userInfo.nextLevelExp }}</span>
              </div>
              <p class="signature">{{ userInfo.signature }}</p>
            </div>
          </div>
          <div class="profile-actions">
            <el-button type="primary">
              <el-icon><Edit /></el-icon> 编辑资料
            </el-button>
          </div>
        </div>
        <div class="profile-stats">
          <div class="stat-item">
            <div class="stat-number">{{ userStats.fishingDays }}</div>
            <div class="stat-label">出钓天数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ userStats.totalWeight }}kg</div>
            <div class="stat-label">总鱼获</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ userStats.airForceCount }}</div>
            <div class="stat-label">空军次数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ userStats.medals.length }}</div>
            <div class="stat-label">获得勋章</div>
          </div>
        </div>
      </div>

      <!-- 功能标签页 -->
      <el-tabs v-model="activeTab" class="profile-tabs">
        <el-tab-pane label="数字钓箱" name="equipment">
          <div class="tab-content">
            <div class="equipment-list">
              <div v-for="item in equipmentList" :key="item.id" class="equipment-item">
                <div class="equipment-image">
                  <img :src="item.image" alt="装备图片" />
                </div>
                <div class="equipment-info">
                  <h3 class="equipment-name">{{ item.name }}</h3>
                  <p class="equipment-desc">{{ item.description }}</p>
                  <div class="equipment-meta">
                    <span class="equipment-brand">{{ item.brand }}</span>
                    <span class="equipment-price">¥{{ item.price }}</span>
                  </div>
                </div>
              </div>
            </div>
            <el-button type="primary" class="add-equipment-btn">
              <el-icon><Plus /></el-icon> 添加装备
            </el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="勋章墙" name="medals">
          <div class="tab-content">
            <div class="medals-grid">
              <div v-for="medal in userStats.medals" :key="medal.id" class="medal-item">
                <div class="medal-icon">
                  <el-icon :size="48">{{ medal.icon }}</el-icon>
                </div>
                <h4 class="medal-name">{{ medal.name }}</h4>
                <p class="medal-desc">{{ medal.description }}</p>
                <span class="medal-date">{{ medal.obtainDate }}</span>
              </div>
              <div
                class="medal-item locked"
                v-for="(lockedMedal, index) in lockedMedals"
                :key="index"
              >
                <div class="medal-icon locked">
                  <el-icon :size="48"><Lock /></el-icon>
                </div>
                <h4 class="medal-name">{{ lockedMedal.name }}</h4>
                <p class="medal-desc">{{ lockedMedal.description }}</p>
                <span class="medal-requirement">{{ lockedMedal.requirement }}</span>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="数据统计" name="stats">
          <div class="tab-content">
            <div class="stats-grid">
              <div class="stat-card">
                <h3>年度出勤率</h3>
                <div class="chart-container">
                  <div id="attendanceChart" class="chart"></div>
                </div>
              </div>
              <div class="stat-card">
                <h3>鱼获总重量趋势</h3>
                <div class="chart-container">
                  <div id="weightChart" class="chart"></div>
                </div>
              </div>
              <div class="stat-card">
                <h3>空军率分析</h3>
                <div class="chart-container">
                  <div id="airForceChart" class="chart"></div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Edit, Plus, Lock, Trophy, Calendar, Star } from '@element-plus/icons-vue'

// 响应式数据
const activeTab = ref('equipment')

// 用户信息
const userInfo = ref({
  nickname: '钓鱼佬007',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  signature: '从不空军，只是在喂鱼。',
  isMaster: true,
  level: 8,
  exp: 1250,
  nextLevelExp: 2000,
})

// 用户统计数据
const userStats = ref({
  fishingDays: 128,
  totalWeight: 356.8,
  airForceCount: 42,
  medals: [
    {
      id: 1,
      name: '永不空军',
      description: '连续5次有鱼获',
      icon: Trophy,
      obtainDate: '2024-01-10',
    },
    {
      id: 2,
      name: '路亚大师',
      description: '成功钓到10条翘嘴',
      icon: Star,
      obtainDate: '2024-01-05',
    },
    {
      id: 3,
      name: '坚持者',
      description: '连续30天出钓',
      icon: Calendar,
      obtainDate: '2024-01-01',
    },
  ],
})

// 锁定的勋章
const lockedMedals = ref([
  {
    name: '空军司令',
    description: '连续10次空军',
    requirement: '还需7次空军',
  },
  {
    name: '巨物猎手',
    description: '钓到20斤以上的鱼',
    requirement: '还需15斤',
  },
])

// 装备列表
const equipmentList = ref([
  {
    id: 1,
    name: '达亿瓦波纹鲤 4.5米',
    description: '日本进口，腰力好，适合钓大型鱼类',
    brand: '达亿瓦',
    price: 1299,
    image:
      'https://images.unsplash.com/photo-1579098382271-091f68b2226b?w=800&auto=format&fit=crop',
  },
  {
    id: 2,
    name: '钓箱',
    description: '带升降脚，多功能钓箱',
    brand: '连球',
    price: 599,
    image: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800&auto=format&fit=crop',
  },
  {
    id: 3,
    name: '钓鱼伞',
    description: '2.2米，防紫外线',
    brand: '美人鱼',
    price: 150,
    image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=800&auto=format&fit=crop',
  },
])

// 初始化图表
onMounted(() => {
  // 模拟图表初始化
  // 实际项目中会使用 ECharts
  initCharts()
})

// 初始化图表
const initCharts = () => {
  // 这里可以集成 ECharts
  // 由于是模拟环境，我们只创建占位符
  const charts = ['attendanceChart', 'weightChart', 'airForceChart']
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
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

.page-header {
  padding: 8vh 0 4vh;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;

  .page-title {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 1vh;
    color: white;
  }

  .page-description {
    font-size: 1.1rem;
    opacity: 0.9;
  }
}

.profile-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: 4vh;
  box-shadow: var(--shadow-lg);
  margin: 4vh 0;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4vh;

  .avatar-section {
    display: flex;
    gap: 3vw;

    .profile-avatar {
      border: 3px solid var(--primary-color);
    }

    .user-basic-info {
      .username {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1vh;
        color: var(--text-primary);
      }

      .user-meta {
        display: flex;
        gap: 1vw;
        align-items: center;
        margin-bottom: 1vh;

        .level {
          font-weight: 600;
          color: var(--primary-color);
        }

        .exp {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
      }

      .signature {
        color: var(--text-secondary);
        line-height: 1.5;
      }
    }
  }
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2vw;
  padding-top: 3vh;
  border-top: 1px solid var(--border-light);

  .stat-item {
    text-align: center;

    .stat-number {
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--primary-color);
      margin-bottom: 0.5vh;
    }

    .stat-label {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
  }
}

.profile-tabs {
  margin: 4vh 0;

  :deep(.el-tabs__header) {
    border-bottom: 1px solid var(--border-light);

    .el-tabs__nav {
      margin: 0;
    }

    .el-tabs__item {
      font-size: 1.1rem;
      font-weight: 500;
      padding: 2vh 2vw;

      &.is-active {
        color: var(--primary-color);

        &::after {
          background: var(--primary-color);
        }
      }
    }
  }
}

.tab-content {
  padding: 4vh 0;
}

.equipment-list {
  display: flex;
  flex-direction: column;
  gap: 2vh;
  margin-bottom: 3vh;
}

.equipment-item {
  display: flex;
  gap: 2vw;
  background: white;
  border-radius: var(--radius-lg);
  padding: 2vh;
  box-shadow: var(--shadow-md);

  .equipment-image {
    width: 100px;
    height: 100px;
    border-radius: var(--radius-md);
    overflow: hidden;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .equipment-info {
    flex: 1;

    .equipment-name {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.5vh;
      color: var(--text-primary);
    }

    .equipment-desc {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-bottom: 1vh;
      line-height: 1.4;
    }

    .equipment-meta {
      display: flex;
      justify-content: space-between;

      .equipment-brand {
        font-weight: 600;
        color: var(--primary-color);
      }

      .equipment-price {
        font-weight: 600;
        color: var(--danger-color);
      }
    }
  }
}

.add-equipment-btn {
  margin-top: 2vh;
}

.medals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2vw;
}

.medal-item {
  background: white;
  border-radius: var(--radius-lg);
  padding: 3vh;
  box-shadow: var(--shadow-md);
  text-align: center;
  transition: all var(--transition-normal);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  &.locked {
    opacity: 0.6;
  }

  .medal-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 2vh;

    &.locked {
      background: var(--border-light);
    }

    :deep(.el-icon) {
      color: white;
    }
  }

  .medal-name {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1vh;
    color: var(--text-primary);
  }

  .medal-desc {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 1.5vh;
    line-height: 1.4;
  }

  .medal-date,
  .medal-requirement {
    font-size: 0.8rem;
    color: var(--text-light);
  }

  .medal-requirement {
    color: var(--warning-color);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3vw;
}

.stat-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 3vh;
  box-shadow: var(--shadow-md);

  h3 {
    margin-bottom: 2vh;
    color: var(--text-primary);
  }

  .chart-container {
    height: 300px;

    .chart {
      width: 100%;
      height: 100%;
      border-radius: var(--radius-md);
      background: var(--bg-tertiary);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    gap: 3vh;
    align-items: flex-start;
  }

  .avatar-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .equipment-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .medals-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
