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
          <el-input
            v-model="searchKeyword"
            placeholder="搜索钓点名称或地址"
            prefix-icon="Search"
            class="search-input"
          />
          <el-select v-model="spotType" class="type-select">
            <el-option label="全部类型" value="all" />
            <el-option label="野钓点" value="wild" />
            <el-option label="黑坑/收费" value="paid" />
            <el-option label="路亚基地" value="lure" />
          </el-select>
          <el-button type="primary" class="search-btn">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
        </div>
      </div>
    </div>

    <!-- 地图容器 -->
    <div class="map-container">
      <div id="map" class="map"></div>

      <!-- 侧边栏 -->
      <div class="sidebar" :class="{ open: showSidebar }">
        <div class="sidebar-header">
          <h3>钓点详情</h3>
          <el-icon class="close-btn" @click="showSidebar = false"><Close /></el-icon>
        </div>
        <div class="sidebar-content" v-if="selectedSpot">
          <div class="spot-image">
            <img :src="selectedSpot.image" alt="钓点图片" />
          </div>
          <h4>{{ selectedSpot.name }}</h4>
          <div class="spot-meta">
            <el-tag :type="getTypeTagType(selectedSpot.type)">{{
              getTypeText(selectedSpot.type)
            }}</el-tag>
            <div class="price">{{ selectedSpot.price }}</div>
          </div>
          <div class="spot-info">
            <div class="info-item">
              <el-icon class="info-icon"><MapLocation /></el-icon>
              <span>{{ selectedSpot.address }}</span>
            </div>
            <div class="info-item">
              <el-icon class="info-icon"><Collection /></el-icon>
              <span>{{ selectedSpot.fishInfo }}</span>
            </div>
            <div class="info-item">
              <el-icon class="info-icon"><Star /></el-icon>
              <span>{{ selectedSpot.rating }}分</span>
            </div>
          </div>
          <div class="ai-recommendation">
            <h5>
              <el-icon class="ai-icon"><Cpu /></el-icon> AI 智能推荐
            </h5>
            <p>{{ selectedSpot.aiRecommendation }}</p>
          </div>
          <div class="sidebar-actions">
            <el-button type="primary" class="action-btn">
              <el-icon><MapLocation /></el-icon> 导航前往
            </el-button>
            <el-button class="action-btn">
              <el-icon><ChatLineSquare /></el-icon> 查看评论
            </el-button>
          </div>
        </div>
        <div class="empty-sidebar" v-else>
          <el-icon class="empty-icon"><MapLocation /></el-icon>
          <p>点击地图上的钓点查看详情</p>
        </div>
      </div>
    </div>

    <!-- 钓点列表 -->
    <div class="spots-list-section">
      <div class="container">
        <h2 class="section-title">
          <el-icon class="title-icon"><MapLocation /></el-icon> 附近钓点
        </h2>
        <div class="spots-grid">
          <div
            v-for="spot in filteredSpots"
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
                <span class="distance">{{ spot.distance }}km</span>
                <span class="rating">{{ spot.rating }}分</span>
              </div>
              <p class="spot-card-desc">{{ spot.address }}</p>
              <div class="spot-card-footer">
                <span class="price">{{ spot.price }}</span>
                <el-button size="small" type="primary" plain> 查看详情 </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Search,
  Close,
  MapLocation,
  Star,
  Cpu,
  ChatLineSquare,
  Collection,
} from '@element-plus/icons-vue'

// 响应式数据
const searchKeyword = ref('')
const spotType = ref('all')
const showSidebar = ref(false)
const selectedSpot = ref(null)

// 模拟钓点数据
const spots = ref([
  {
    id: 1,
    name: '西湖垂钓区',
    type: 'wild',
    address: '杭州市西湖区西湖景区',
    price: '免费',
    fishInfo: '鲫鱼、鲤鱼、草鱼',
    rating: 4.8,
    distance: 2.5,
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf96123e?w=800&auto=format&fit=crop',
    aiRecommendation:
      '根据历史数据和地形分析，建议在湖西岸的芦苇丛附近垂钓，水深2-3米，使用蚯蚓或商品饵，最佳垂钓时间为清晨6-9点。',
  },
  {
    id: 2,
    name: '钱塘江野钓点',
    type: 'wild',
    address: '杭州市江干区钱塘江畔',
    price: '免费',
    fishInfo: '翘嘴、鲈鱼、鲶鱼',
    rating: 4.5,
    distance: 5.8,
    image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=800&auto=format&fit=crop',
    aiRecommendation: '建议在潮水退潮时垂钓，选择缓流区域，使用路亚假饵，目标鱼种为翘嘴和鲈鱼。',
  },
  {
    id: 3,
    name: '千岛湖黑坑',
    type: 'paid',
    address: '杭州市淳安县千岛湖',
    price: '100元/天',
    fishInfo: '青鱼、草鱼、鳙鱼',
    rating: 4.9,
    distance: 120,
    image: 'https://images.unsplash.com/photo-1547129840-34d82276c408?w=800&auto=format&fit=crop',
    aiRecommendation:
      '根据季节和天气分析，建议使用玉米或颗粒饲料打窝，主钓青鱼，钓点选择在深水区。',
  },
  {
    id: 4,
    name: '西溪湿地路亚基地',
    type: 'lure',
    address: '杭州市余杭区西溪湿地',
    price: '150元/天',
    fishInfo: '鲈鱼、鳜鱼、黑鱼',
    rating: 4.7,
    distance: 8.2,
    image:
      'https://images.unsplash.com/photo-1579098382271-091f68b2226b?w=800&auto=format&fit=crop',
    aiRecommendation:
      '建议使用软虫或硬饵，在芦苇丛边缘和结构复杂的区域搜索，重点关注清晨和傍晚时段。',
  },
])

// 过滤后的钓点列表
const filteredSpots = computed(() => {
  return spots.value.filter((spot) => {
    const matchesKeyword =
      !searchKeyword.value ||
      spot.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      spot.address.toLowerCase().includes(searchKeyword.value.toLowerCase())
    const matchesType = spotType.value === 'all' || spot.type === spotType.value
    return matchesKeyword && matchesType
  })
})

// 选择钓点
const selectSpot = (spot) => {
  selectedSpot.value = spot
  showSidebar.value = true
  // 这里可以添加地图标记定位逻辑
}

// 获取类型标签类型
const getTypeTagType = (type) => {
  const typeMap = {
    wild: 'success',
    paid: 'warning',
    lure: 'primary',
  }
  return typeMap[type] || 'info'
}

// 获取类型文本
const getTypeText = (type) => {
  const typeMap = {
    wild: '野钓',
    paid: '黑坑',
    lure: '路亚',
  }
  return typeMap[type] || '未知'
}

// 初始化地图
onMounted(() => {
  // 这里可以集成高德或百度地图API
  // 由于是模拟环境，我们只创建一个占位地图
  const mapElement = document.getElementById('map')
  if (mapElement) {
    mapElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    mapElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-size: 1.2rem;">
        <div style="text-align: center;">
          <el-icon style="font-size: 3rem; margin-bottom: 20px;"><MapLocation /></el-icon>
          <p>地图加载中...</p>
          <p style="font-size: 0.9rem; opacity: 0.8; margin-top: 10px;">实际项目中会集成高德/百度地图API</p>
        </div>
      </div>
    `
  }
})
</script>

<style lang="scss" scoped>
.map-page {
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

.search-section {
  background: white;
  padding: 4vh 0;
  box-shadow: var(--shadow-md);

  .search-bar {
    display: flex;
    gap: 1vw;

    .search-input {
      flex: 1;
      height: 50px;
    }

    .type-select {
      width: 150px;
      height: 50px;
    }

    .search-btn {
      height: 50px;
      padding: 0 2vw;
    }
  }
}

.map-container {
  position: relative;
  height: 80vh;
  margin: 4vh 0;

  .map {
    width: 100%;
    height: 100%;
    border-radius: var(--radius-xl);
    overflow: hidden;
  }

  .sidebar {
    position: absolute;
    right: 0;
    top: 0;
    width: 350px;
    height: 100%;
    background: white;
    box-shadow: var(--shadow-lg);
    border-radius: var(--radius-xl) 0 0 var(--radius-xl);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column;

    &.open {
      transform: translateX(0);
    }

    .sidebar-header {
      padding: 2vh 2vw;
      border-bottom: 1px solid var(--border-light);
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 1.2rem;
      }

      .close-btn {
        font-size: 1.2rem;
        cursor: pointer;
        color: var(--text-light);

        &:hover {
          color: var(--text-primary);
        }
      }
    }

    .sidebar-content {
      flex: 1;
      padding: 2vh 2vw;
      overflow-y: auto;

      .spot-image {
        width: 100%;
        height: 150px;
        border-radius: var(--radius-lg);
        overflow: hidden;
        margin-bottom: 2vh;
        position: relative;

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

      h4 {
        margin-bottom: 1vh;
        font-size: 1.1rem;
      }

      .spot-meta {
        display: flex;
        align-items: center;
        gap: 1vw;
        margin-bottom: 2vh;

        .price {
          font-weight: 600;
          color: var(--primary-color);
        }
      }

      .spot-info {
        margin-bottom: 2vh;

        .info-item {
          display: flex;
          align-items: center;
          gap: 0.8vw;
          margin-bottom: 1vh;

          .info-icon {
            color: var(--primary-color);
          }
        }
      }

      .ai-recommendation {
        background: var(--bg-tertiary);
        padding: 2vh;
        border-radius: var(--radius-lg);
        margin-bottom: 2vh;

        h5 {
          display: flex;
          align-items: center;
          gap: 0.8vw;
          margin-bottom: 1vh;
          color: var(--primary-color);

          .ai-icon {
            font-size: 1.1rem;
          }
        }

        p {
          font-size: 0.9rem;
          line-height: 1.6;
          margin: 0;
        }
      }

      .sidebar-actions {
        display: flex;
        gap: 1vw;

        .action-btn {
          flex: 1;
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
      padding: 4vh;

      .empty-icon {
        font-size: 3rem;
        color: var(--text-light);
        margin-bottom: 2vh;
      }

      p {
        color: var(--text-light);
        margin: 0;
      }
    }
  }
}

.spots-list-section {
  padding: 6vh 0;

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
@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;

    .search-input,
    .type-select,
    .search-btn {
      width: 100% !important;
    }
  }

  .sidebar {
    width: 100% !important;
    border-radius: var(--radius-xl) 0 0 var(--radius-xl);
  }

  .spots-grid {
    grid-template-columns: 1fr;
  }
}
</style>
