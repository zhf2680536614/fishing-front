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
                  @keyup.enter="handleSearch"
                />
                <el-select v-model="category" class="category-select" @change="handleSearch">
                  <el-option label="全部类别" value="all" />
                  <el-option label="鱼竿" value="rod" />
                  <el-option label="钓箱" value="box" />
                  <el-option label="饵料" value="bait" />
                  <el-option label="其他" value="other" />
                </el-select>
                <el-select v-model="sortBy" class="sort-select" @change="handleSearch">
                  <el-option label="最新发布" value="newest" />
                  <el-option label="价格从低到高" value="price_asc" />
                  <el-option label="价格从高到低" value="price_desc" />
                </el-select>
                <el-button type="primary" class="search-btn" @click="handleSearch">
                  <el-icon><Search /></el-icon> 搜索
                </el-button>
                <el-button class="reset-btn" @click="handleReset">
                  重置
                </el-button>
              </div>
              <div class="filter-right">
                <el-button type="primary" @click="handlePublish">
                  <el-icon><Plus /></el-icon> 发布闲置
                </el-button>
              </div>
            </div>

            <!-- 装备列表 -->
            <el-skeleton :loading="loading" :rows="8" animated>
              <template #template>
                <div class="equipment-card">
                  <div class="equipment-image">
                    <el-skeleton-item variant="image" style="width: 100%; height: 200px" />
                  </div>
                  <div class="equipment-content">
                    <el-skeleton-item variant="h3" style="width: 80%" />
                    <el-skeleton-item variant="p" style="width: 60%" />
                    <el-skeleton-item variant="p" style="width: 40%" />
                    <el-skeleton-item variant="text" style="width: 90%" />
                  </div>
                </div>
              </template>
              <div v-if="!loading" class="equipment-grid">
                <div v-for="item in equipmentItems" :key="item.id" class="equipment-card">
                  <div class="equipment-image" @click="handlePreviewImage(item.images, 0)">
                    <el-carousel v-if="item.images && item.images.length > 0" height="200px" indicator-position="outside" :autoplay="false">
                      <el-carousel-item v-for="(image, index) in item.images" :key="index">
                        <img :src="image" alt="装备图片" style="width: 100%; height: 100%; object-fit: cover;" />
                      </el-carousel-item>
                    </el-carousel>
                    <div v-else class="no-image">无图片</div>
                    <el-tag v-if="item.originalPrice && item.originalPrice > item.price" type="success" class="new-tag"> 优惠 </el-tag>
                  </div>
                  <div class="equipment-content" @click="handleViewDetail(item)">
                    <h3 class="equipment-title">{{ item.title }}</h3>
                    <div class="equipment-price">
                      <span class="current-price">¥{{ item.price }}</span>
                      <span class="original-price" v-if="item.originalPrice">¥{{ item.originalPrice }}</span>
                    </div>
                    <div class="equipment-meta">
                      <span class="seller">{{ item.nickname || item.username }}</span>
                      <span class="publish-time">{{ formatTime(item.createTime) }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="!loading && equipmentItems.length === 0" class="empty-state">
                  <el-empty description="暂无闲置装备" />
                </div>
              </div>
            </el-skeleton>

            <!-- 查看更多 -->
            <div v-if="!loading" class="load-more">
              <el-button 
                type="primary" 
                plain 
                :loading="loadingMore"
                @click="handleLoadMore"
                v-if="hasMore"
              >
                查看更多
              </el-button>
              <div v-else-if="equipmentItems.length > 0" class="no-more">
                没有更多了
              </div>
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
                  @keyup.enter="handleSearch"
                />
                <el-select v-model="reviewCategory" class="category-select" @change="handleSearch">
                  <el-option label="全部类别" value="all" />
                  <el-option label="鱼竿" value="rod" />
                  <el-option label="钓箱" value="box" />
                  <el-option label="饵料" value="bait" />
                </el-select>
              </div>
              <div class="filter-right">
                <el-button type="primary" @click="handleWriteReview">
                  <el-icon><Edit /></el-icon> 写测评
                </el-button>
              </div>
            </div>

            <!-- 测评列表 -->
            <el-skeleton :loading="reviewLoading" :rows="5" animated>
              <template #template>
                <div class="review-card">
                  <div class="review-header">
                    <el-skeleton-item variant="h3" style="width: 70%" />
                    <el-skeleton-item variant="text" style="width: 40%" />
                  </div>
                  <div class="review-content">
                    <el-skeleton-item variant="p" style="width: 100%" />
                    <el-skeleton-item variant="p" style="width: 90%" />
                    <el-skeleton-item variant="p" style="width: 80%" />
                  </div>
                </div>
              </template>
              <div v-if="!reviewLoading" class="reviews-list">
                <div v-for="review in reviews" :key="review.id" class="review-card">
                  <div class="review-header">
                    <h3 class="review-title">{{ review.title }}</h3>
                    <div class="review-meta">
                      <span class="reviewer">{{ review.nickname || review.username }}</span>
                      <span class="review-time">{{ formatTime(review.createTime) }}</span>
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
                              v-for="(keyword, index) in review.aiAnalysis.keywords"
                              :key="index"
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
                <div v-if="!reviewLoading && reviews.length === 0" class="empty-state">
                  <el-empty description="暂无装备测评" />
                </div>
              </div>
            </el-skeleton>

            <!-- 分页 -->
            <div class="pagination">
              <el-pagination
                v-model:current-page="currentPage"
                :page-size="pageSize"
                :page-sizes="[10, 20, 30]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalReviews"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <!-- 发布闲置对话框 -->
      <PublishGearDialog
        v-model:visible="publishDialogVisible"
        @success="handlePublishSuccess"
      />
      
      <!-- 图片预览 -->
      <ImagePreview
        v-model:visible="previewVisible"
        :images="previewImages"
        :initial-index="previewInitialIndex"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Plus, Edit, Cpu, View, Star, ChatLineSquare, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import * as gearApi from '@/api/gear'
import PublishGearDialog from '@/components/business/PublishGearDialog.vue'
import ImagePreview from '@/components/common/ImagePreview.vue'

// 响应式数据
const activeTab = ref('second-hand')
const searchKeyword = ref('')
const category = ref('all')
const sortBy = ref('newest')
const currentPage = ref(1)
const pageSize = ref(8) // 首次加载8条
const totalItems = ref(0)
const equipmentItems = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)

// 路由
const router = useRouter()

// 图片预览
const previewVisible = ref(false)
const previewImages = ref([])
const previewInitialIndex = ref(0)

const reviewKeyword = ref('')
const reviewCategory = ref('all')
const reviews = ref([])
const totalReviews = ref(0)
const reviewLoading = ref(false)

// 发布对话框
const publishDialogVisible = ref(false)

// 加载闲置装备列表
const loadEquipmentList = async (isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true
  } else {
    loading.value = true
    equipmentItems.value = [] // 重置列表
    currentPage.value = 1
    hasMore.value = true
  }
  try {
    const response = await gearApi.getGearMarketList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      category: category.value,
      keyword: searchKeyword.value,
      sortBy: sortBy.value
    })
    if (isLoadMore) {
      // 加载更多，追加数据
      equipmentItems.value = [...equipmentItems.value, ...response.records]
    } else {
      // 首次加载，替换数据
      equipmentItems.value = response.records
    }
    totalItems.value = response.total
    // 判断是否还有更多数据
    hasMore.value = equipmentItems.value.length < totalItems.value
    // 增加页码
    currentPage.value++
  } catch (error) {
    ElMessage.error('加载装备列表失败')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 加载测评列表
const loadReviewList = async () => {
  reviewLoading.value = true
  try {
    const response = await gearApi.getGearReviewList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      category: reviewCategory.value,
      keyword: reviewKeyword.value
    })
    reviews.value = response.records
    totalReviews.value = response.total
  } catch (error) {
    ElMessage.error('加载测评列表失败')
  } finally {
    reviewLoading.value = false
  }
}

// 查看更多
const handleLoadMore = () => {
  if (!loadingMore.value && hasMore.value) {
    loadEquipmentList(true)
  }
}

// 重置
const handleReset = () => {
  searchKeyword.value = ''
  category.value = 'all'
  sortBy.value = 'newest'
  handleSearch()
}

// 搜索和筛选
const handleSearch = () => {
  loadEquipmentList()
}

// 发布闲置
const handlePublish = () => {
  publishDialogVisible.value = true
}

// 发布成功回调
const handlePublishSuccess = () => {
  loadEquipmentList()
}

// 写测评
const handleWriteReview = () => {
  // 这里可以跳转到写测评页面或打开弹窗
  ElMessage.info('写测评功能开发中')
}

// 查看详情
const handleViewDetail = (item) => {
  router.push(`/market/detail/${item.id}`)
}

// 预览图片
const handlePreviewImage = (images, index) => {
  previewImages.value = images
  previewInitialIndex.value = index
  previewVisible.value = true
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 监听标签切换
watch(activeTab, (newTab) => {
  if (newTab === 'second-hand') {
    loadEquipmentList()
  } else {
    loadReviewList()
  }
})

// 页面加载时
onMounted(() => {
  loadEquipmentList()
})
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
  margin: 1vh 0;

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

    .search-btn {
      margin-left: 8px;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      border: none;
      border-radius: var(--radius-md);
      padding: 1.2vh 2.5vw;
      font-weight: 600;
      font-size: 1rem;
      transition: all var(--transition-normal);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
    }

    .reset-btn {
      margin-left: 8px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.2vh 2.5vw;
      font-weight: 500;
      font-size: 1rem;
      transition: all var(--transition-normal);
      
      &:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
        background: var(--bg-primary);
      }
    }
  }

  .filter-right {
    .el-button {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      border: none;
      border-radius: var(--radius-md);
      padding: 1.2vh 2.5vw;
      font-weight: 600;
      font-size: 1rem;
      transition: all var(--transition-normal);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
    }
  }
}

.load-more {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 4vh;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;

  .no-more {
    color: #909399;
    font-size: 14px;
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

      .no-image {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f7fa;
        color: #909399;
        border: 1px dashed #dcdfe6;
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

.empty-state {
  grid-column: 1 / -1;
  padding: 8vh 0;
  text-align: center;
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
