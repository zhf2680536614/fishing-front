<template>
  <div class="market-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">装备交易</h1>
        <p class="page-description">闲置装备流转，装备测评避坑</p>
      </div>
    </div>

    <!-- 功能导航 -->
    <div class="container">
      <el-tabs v-model="activeTab" class="market-tabs">
        <el-tab-pane label="闲置流转" name="second-hand">
          <div class="tab-content">
            <!-- 搜索和筛选 -->
            <div class="filter-bar">
              <div class="filter-left">
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索装备名称"
                  prefix-icon="Search"
                  class="search-input"
                />
                <el-select v-model="category" class="category-select">
                  <el-option label="全部类别" value="all" />
                  <el-option label="鱼竿" value="rod" />
                  <el-option label="钓箱" value="box" />
                  <el-option label="饵料" value="bait" />
                  <el-option label="其他" value="other" />
                </el-select>
                <el-select v-model="sortBy" class="sort-select">
                  <el-option label="最新发布" value="newest" />
                  <el-option label="价格从低到高" value="price_asc" />
                  <el-option label="价格从高到低" value="price_desc" />
                </el-select>
              </div>
              <div class="filter-right">
                <el-button type="primary">
                  <el-icon><Plus /></el-icon> 发布闲置
                </el-button>
              </div>
            </div>

            <!-- 装备列表 -->
            <div class="equipment-grid">
              <div v-for="item in filteredItems" :key="item.id" class="equipment-card">
                <div class="equipment-image">
                  <img :src="item.image" alt="装备图片" />
                  <el-tag v-if="item.isNew" type="success" class="new-tag"> 全新 </el-tag>
                </div>
                <div class="equipment-content">
                  <h3 class="equipment-title">{{ item.title }}</h3>
                  <div class="equipment-price">
                    <span class="current-price">¥{{ item.price }}</span>
                    <span class="original-price" v-if="item.originalPrice"
                      >¥{{ item.originalPrice }}</span
                    >
                  </div>
                  <div class="equipment-meta">
                    <span class="seller">{{ item.seller }}</span>
                    <span class="publish-time">{{ item.publishTime }}</span>
                  </div>
                  <div class="equipment-footer">
                    <el-button size="small" type="primary" plain> 查看详情 </el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div class="pagination">
              <el-pagination
                v-model:current-page="currentPage"
                :page-size="pageSize"
                :page-sizes="[10, 20, 30]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalItems"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="避坑指南" name="reviews">
          <div class="tab-content">
            <!-- 搜索和筛选 -->
            <div class="filter-bar">
              <div class="filter-left">
                <el-input
                  v-model="reviewKeyword"
                  placeholder="搜索装备名称"
                  prefix-icon="Search"
                  class="search-input"
                />
                <el-select v-model="reviewCategory" class="category-select">
                  <el-option label="全部类别" value="all" />
                  <el-option label="鱼竿" value="rod" />
                  <el-option label="钓箱" value="box" />
                  <el-option label="饵料" value="bait" />
                </el-select>
              </div>
              <div class="filter-right">
                <el-button type="primary">
                  <el-icon><Edit /></el-icon> 写测评
                </el-button>
              </div>
            </div>

            <!-- 测评列表 -->
            <div class="reviews-list">
              <div v-for="review in filteredReviews" :key="review.id" class="review-card">
                <div class="review-header">
                  <h3 class="review-title">{{ review.title }}</h3>
                  <div class="review-meta">
                    <span class="reviewer">{{ review.reviewer }}</span>
                    <span class="review-time">{{ review.reviewTime }}</span>
                  </div>
                </div>
                <div class="review-content">
                  <div class="review-rating">
                    <el-rate v-model="review.rating" disabled show-score />
                  </div>
                  <p class="review-text">{{ review.content }}</p>
                  <div class="ai-analysis" v-if="review.aiAnalysis">
                    <h4>
                      <el-icon class="ai-icon"><Cpu /></el-icon> AI 分析
                    </h4>
                    <div class="analysis-content">
                      <div class="analysis-item">
                        <span class="label">好评率：</span>
                        <span class="value">{{ review.aiAnalysis.goodRate }}%</span>
                      </div>
                      <div class="analysis-item">
                        <span class="label">关键词：</span>
                        <div class="keywords">
                          <el-tag
                            v-for="keyword in review.aiAnalysis.keywords"
                            :key="keyword"
                            size="small"
                          >
                            {{ keyword }}
                          </el-tag>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="review-footer">
                  <div class="review-stats">
                    <span class="stat-item">
                      <el-icon><View /></el-icon> {{ review.views }}
                    </span>
                    <span class="stat-item">
                      <el-icon><Star /></el-icon> {{ review.likes }}
                    </span>
                    <span class="stat-item">
                      <el-icon><ChatLineSquare /></el-icon> {{ review.comments }}
                    </span>
                  </div>
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
import { ref, computed } from 'vue'
import { Plus, Edit, Cpu, View, Star, ChatLineSquare } from '@element-plus/icons-vue'

// 响应式数据
const activeTab = ref('second-hand')
const searchKeyword = ref('')
const category = ref('all')
const sortBy = ref('newest')
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(56)
const reviewKeyword = ref('')
const reviewCategory = ref('all')

// 闲置装备数据
const equipmentItems = ref([
  {
    id: 1,
    title: '9成新 达亿瓦波纹鲤 4.5米',
    image:
      'https://images.unsplash.com/photo-1579098382271-091f68b2226b?w=800&auto=format&fit=crop',
    price: 899,
    originalPrice: 1299,
    seller: '钓鱼达人',
    publishTime: '2024-01-15',
    isNew: false,
    category: 'rod',
  },
  {
    id: 2,
    title: '全新 钓箱 带配件',
    image: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800&auto=format&fit=crop',
    price: 399,
    originalPrice: 599,
    seller: '路亚新手',
    publishTime: '2024-01-14',
    isNew: true,
    category: 'box',
  },
  {
    id: 3,
    title: '多种饵料组合 打包出售',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf96123e?w=800&auto=format&fit=crop',
    price: 120,
    originalPrice: 200,
    seller: '台钓老王',
    publishTime: '2024-01-13',
    isNew: false,
    category: 'bait',
  },
  {
    id: 4,
    title: '钓鱼伞 2.2米',
    image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=800&auto=format&fit=crop',
    price: 80,
    originalPrice: 150,
    seller: '野钓小王子',
    publishTime: '2024-01-12',
    isNew: false,
    category: 'other',
  },
])

// 测评数据
const reviews = ref([
  {
    id: 1,
    title: '达亿瓦波纹鲤使用体验',
    reviewer: '钓鱼达人',
    reviewTime: '2024-01-15',
    rating: 4.5,
    content: '这款鱼竿腰力好，手感轻，适合长时间垂钓。缺点是价格稍高，但一分钱一分货。',
    views: 1234,
    likes: 89,
    comments: 23,
    category: 'rod',
    aiAnalysis: {
      goodRate: 85,
      keywords: ['腰力好', '手感轻', '价格高', '耐用'],
    },
  },
  {
    id: 2,
    title: '某品牌钓箱质量问题',
    reviewer: '路亚新手',
    reviewTime: '2024-01-14',
    rating: 2.5,
    content: '钓箱做工粗糙，配件质量差，使用半年后合页就坏了。不推荐购买。',
    views: 892,
    likes: 45,
    comments: 18,
    category: 'box',
    aiAnalysis: {
      goodRate: 30,
      keywords: ['做工粗糙', '配件差', '不耐用'],
    },
  },
])

// 过滤后的装备列表
const filteredItems = computed(() => {
  let filtered = equipmentItems.value.filter((item) => {
    const matchesKeyword =
      !searchKeyword.value || item.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
    const matchesCategory = category.value === 'all' || item.category === category.value
    return matchesKeyword && matchesCategory
  })

  // 排序
  switch (sortBy.value) {
    case 'newest':
      return filtered.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime))
    case 'price_asc':
      return filtered.sort((a, b) => a.price - b.price)
    case 'price_desc':
      return filtered.sort((a, b) => b.price - a.price)
    default:
      return filtered
  }
})

// 过滤后的测评列表
const filteredReviews = computed(() => {
  return reviews.value.filter((review) => {
    const matchesKeyword =
      !reviewKeyword.value || review.title.toLowerCase().includes(reviewKeyword.value.toLowerCase())
    const matchesCategory =
      reviewCategory.value === 'all' || review.category === reviewCategory.value
    return matchesKeyword && matchesCategory
  })
})

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (current) => {
  currentPage.value = current
}
</script>

<style lang="scss" scoped>
.market-page {
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

.market-tabs {
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

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4vh;

  .filter-left {
    display: flex;
    gap: 1vw;

    .search-input {
      width: 300px;
    }

    .category-select,
    .sort-select {
      width: 150px;
    }
  }
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2vw;
  margin-bottom: 4vh;
}

.equipment-card {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  .equipment-image {
    position: relative;
    height: 200px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .new-tag {
      position: absolute;
      top: 1vh;
      right: 1vw;
    }
  }

  .equipment-content {
    padding: 2vh 2vw;

    .equipment-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 1vh;
      color: var(--text-primary);
    }

    .equipment-price {
      margin-bottom: 1vh;

      .current-price {
        font-size: 1.2rem;
        font-weight: 800;
        color: var(--danger-color);
      }

      .original-price {
        font-size: 0.9rem;
        color: var(--text-light);
        text-decoration: line-through;
        margin-left: 1vw;
      }
    }

    .equipment-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2vh;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 4vh;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 3vh;
}

.review-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 3vh;
  box-shadow: var(--shadow-md);

  .review-header {
    margin-bottom: 2vh;

    .review-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 1vh;
      color: var(--text-primary);
    }

    .review-meta {
      display: flex;
      gap: 2vw;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
  }

  .review-content {
    margin-bottom: 2vh;

    .review-rating {
      margin-bottom: 1.5vh;
    }

    .review-text {
      line-height: 1.6;
      color: var(--text-primary);
      margin-bottom: 2vh;
    }

    .ai-analysis {
      background: var(--bg-tertiary);
      padding: 2vh;
      border-radius: var(--radius-md);

      h4 {
        display: flex;
        align-items: center;
        gap: 0.8vw;
        margin-bottom: 1.5vh;
        color: var(--primary-color);

        .ai-icon {
          font-size: 1.1rem;
        }
      }

      .analysis-content {
        .analysis-item {
          display: flex;
          align-items: flex-start;
          gap: 1vw;
          margin-bottom: 1vh;

          .label {
            font-weight: 600;
            color: var(--text-secondary);
            min-width: 80px;
          }

          .value {
            font-weight: 500;
            color: var(--text-primary);
          }

          .keywords {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5vw;
            flex: 1;
          }
        }
      }
    }
  }

  .review-footer {
    border-top: 1px solid var(--border-light);
    padding-top: 2vh;

    .review-stats {
      display: flex;
      gap: 2vw;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 0.5vw;
        font-size: 0.9rem;
        color: var(--text-secondary);
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 1vh;

    .filter-left {
      flex-wrap: wrap;

      .search-input {
        flex: 1;
        min-width: 200px;
      }
    }
  }

  .equipment-grid {
    grid-template-columns: 1fr;
  }
}
</style>
