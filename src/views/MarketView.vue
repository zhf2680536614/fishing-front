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
        <el-tab-pane label="装备测评" name="reviews">
          <div class="tab-content">
            <!-- 搜索和筛选 -->
            <div class="filter-bar">
              <div class="filter-left">
                <el-input
                  v-model="reviewKeyword"
                  placeholder="搜索装备名称或测评内容"
                  prefix-icon="Search"
                  class="search-input"
                  @keyup.enter="handleReviewSearch"
                />
                <el-select v-model="reviewCategory" class="category-select" @change="handleReviewSearch">
                  <el-option label="全部类别" value="all" />
                  <el-option label="鱼竿" value="rod" />
                  <el-option label="钓箱" value="box" />
                  <el-option label="饵料" value="bait" />
                  <el-option label="其他" value="other" />
                </el-select>
                <el-button type="primary" class="search-btn" @click="handleReviewSearch">
                  <el-icon><Search /></el-icon> 搜索
                </el-button>
                <el-button class="reset-btn" @click="handleReviewReset">
                  重置
                </el-button>
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
                <div class="review-grid">
                  <div class="review-card-skeleton" v-for="i in 4" :key="i">
                    <el-skeleton-item variant="image" style="width: 100%; height: 180px" />
                    <div class="skeleton-content">
                      <el-skeleton-item variant="h3" style="width: 80%" />
                      <el-skeleton-item variant="text" style="width: 60%" />
                      <el-skeleton-item variant="text" style="width: 40%" />
                    </div>
                  </div>
                </div>
              </template>
              <div v-if="!reviewLoading" class="review-grid">
                <div v-for="review in reviews" :key="review.id" class="review-card">
                  <!-- 图片区域 -->
                  <div class="review-card-image" v-if="review.images && review.images.length > 0">
                    <img :src="review.images[0]" alt="测评图片" @click="handlePreviewImage(review.images, 0)" />
                    <div class="image-count" v-if="review.images.length > 1">
                      <el-icon><Picture /></el-icon>
                      {{ review.images.length }}
                    </div>
                  </div>
                  <div class="review-card-image no-image" v-else>
                    <el-icon><Goods /></el-icon>
                    <span>暂无图片</span>
                  </div>
                  
                  <!-- 内容区域 -->
                  <div class="review-card-body">
                    <div class="review-card-header">
                      <el-tag size="small" :type="getCategoryType(review.category)" class="category-tag">
                        {{ getCategoryName(review.category) }}
                      </el-tag>
                      <el-rate v-model="review.rating" disabled size="small" />
                    </div>
                    
                    <h3 class="review-card-title">{{ review.title }}</h3>
                    <p class="review-card-gear">{{ review.gearName }}</p>
                    
                    <div class="review-card-content">{{ review.content }}</div>
                    
                    <div class="review-card-footer">
                      <div class="author-info">
                        <el-avatar :size="24" :src="review.avatar" />
                        <span class="author-name">{{ review.nickname || review.username }}</span>
                      </div>
                      <span class="publish-time">{{ formatTime(review.createTime) }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="!reviewLoading && reviews.length === 0" class="empty-state">
                  <el-empty description="暂无装备测评" />
                </div>
              </div>
            </el-skeleton>

            <!-- 查看更多 -->
            <div v-if="!reviewLoading" class="load-more">
              <el-button 
                type="primary" 
                plain 
                :loading="reviewLoadingMore"
                @click="handleReviewLoadMore"
                v-if="hasMoreReviews"
              >
                查看更多
              </el-button>
              <div v-else-if="reviews.length > 0" class="no-more">
                没有更多了
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <!-- 发布闲置对话框 -->
      <PublishGearDialog
        v-model:visible="publishDialogVisible"
        @success="handlePublishSuccess"
      />
      
      <!-- 写测评对话框 -->
      <el-dialog
        v-model="reviewDialogVisible"
        title=""
        width="680px"
        :close-on-click-modal="false"
        class="publish-dialog review-dialog"
      >
        <!-- 头部 -->
        <div class="dialog-header">
          <div class="header-left">
            <h2 class="dialog-title">写装备测评</h2>
            <p class="dialog-subtitle">分享你的真实使用体验，帮助其他钓友选购</p>
          </div>
          <div class="header-icon review-icon">
            <el-icon><Edit /></el-icon>
          </div>
        </div>

        <!-- 表单内容 -->
        <div class="dialog-content">
          <!-- 标题 -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">✦</span>
              测评标题
            </label>
            <input
              v-model="reviewForm.title"
              type="text"
              class="custom-input"
              placeholder="请输入测评标题，如：达亿瓦波纹鲤4.5米深度测评"
              maxlength="100"
            />
            <div class="input-hint">{{ reviewForm.title.length }}/100</div>
          </div>

          <!-- 装备名称和分类 -->
          <div class="form-row">
            <div class="form-group half">
              <label class="form-label">
                <span class="label-icon">✦</span>
                装备名称
              </label>
              <input
                v-model="reviewForm.gearName"
                type="text"
                class="custom-input"
                placeholder="如：达亿瓦波纹鲤"
                maxlength="50"
              />
            </div>

            <div class="form-group half">
              <label class="form-label">
                <span class="label-icon">✦</span>
                装备分类
              </label>
              <div class="select-wrapper">
                <select v-model="reviewForm.category" class="custom-select">
                  <option value="">请选择分类</option>
                  <option value="rod">🐟 鱼竿</option>
                  <option value="box">📦 钓箱</option>
                  <option value="bait">🦗 饵料</option>
                  <option value="other">📿 其他</option>
                </select>
                <el-icon class="select-arrow"><ArrowDown /></el-icon>
              </div>
            </div>
          </div>

          <!-- 评分 -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">✦</span>
              综合评分
            </label>
            <div class="rating-wrapper">
              <el-rate v-model="reviewForm.rating" allow-half size="large" />
              <span class="rating-score" v-if="reviewForm.rating > 0">{{ reviewForm.rating }} 分</span>
            </div>
          </div>

          <!-- 测评内容 -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">✦</span>
              测评内容
            </label>
            <textarea
              v-model="reviewForm.content"
              class="custom-textarea"
              placeholder="请详细描述装备的使用体验、优缺点、适用场景等，帮助其他钓友做出选择"
              maxlength="1000"
            ></textarea>
            <div class="input-hint">{{ reviewForm.content.length }}/1000</div>
          </div>

          <!-- 图片上传 -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">✦</span>
              测评图片
            </label>
            <div class="upload-section">
              <div class="upload-grid">
                <div
                  v-for="(img, index) in reviewForm.images"
                  :key="index"
                  class="upload-image-item"
                >
                  <img :src="img" alt="测评图片" />
                  <div class="image-actions">
                    <span class="delete-btn" @click="handleRemoveReviewImage(index)">
                      <el-icon><Delete /></el-icon>
                    </span>
                  </div>
                  <span v-if="index === 0" class="cover-tag">封面</span>
                </div>
                
                <div v-if="reviewForm.images.length < 9" class="upload-trigger" @click="handleSelectReviewImage">
                  <div class="trigger-content">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                    <span>上传图片</span>
                    <span class="upload-count">{{ reviewForm.images.length }}/9</span>
                  </div>
                </div>
              </div>
              <p class="upload-tip">建议上传真实使用照片，前一张将作为封面图</p>
            </div>
            <input
              ref="reviewFileInputRef"
              type="file"
              accept="image/*"
              multiple
              style="display: none"
              @change="handleReviewFileChange"
            />
          </div>
        </div>

        <!-- 底部 -->
        <template #footer>
          <div class="dialog-footer">
            <div class="footer-hint">
              <span class="hint-icon">💡</span>
              真实详细的测评更容易获得推荐
            </div>
            <div class="footer-actions">
              <el-button class="cancel-btn" @click="reviewDialogVisible = false">取消</el-button>
              <el-button 
                type="primary" 
                class="submit-btn" 
                :loading="reviewSubmitting"
                @click="submitReview"
              >
                <el-icon v-if="!reviewSubmitting"><Check /></el-icon>
                发布测评
              </el-button>
            </div>
          </div>
        </template>
      </el-dialog>
      
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
import { Plus, Edit, Search, Delete, Picture, Goods, ArrowDown, Check } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import * as gearApi from '@/api/gear'
import { uploadPostImages } from '@/api/file'
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
const reviewLoadingMore = ref(false)
const hasMoreReviews = ref(true)
const reviewPageNum = ref(1)
const reviewPageSize = 8

// 发布对话框
const publishDialogVisible = ref(false)

// 写测评对话框
const reviewDialogVisible = ref(false)
const reviewSubmitting = ref(false)
const reviewFileInputRef = ref(null)
const reviewForm = ref({
  gearName: '',
  category: '',
  rating: 5,
  title: '',
  content: '',
  images: []
})

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
const loadReviewList = async (isLoadMore = false) => {
  if (isLoadMore) {
    reviewLoadingMore.value = true
  } else {
    reviewLoading.value = true
    reviews.value = []
    reviewPageNum.value = 1
    hasMoreReviews.value = true
  }
  try {
    const response = await gearApi.getGearReviewList({
      pageNum: reviewPageNum.value,
      pageSize: reviewPageSize,
      category: reviewCategory.value === 'all' ? null : reviewCategory.value,
      keyword: reviewKeyword.value
    })
    if (isLoadMore) {
      reviews.value = [...reviews.value, ...response.records]
    } else {
      reviews.value = response.records
    }
    totalReviews.value = response.total
    hasMoreReviews.value = response.records.length === reviewPageSize
    reviewPageNum.value++
  } catch (error) {
    ElMessage.error('加载测评列表失败')
  } finally {
    reviewLoading.value = false
    reviewLoadingMore.value = false
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
  reviewForm.value = {
    gearName: '',
    category: '',
    rating: 5,
    title: '',
    content: '',
    images: []
  }
  reviewDialogVisible.value = true
}

// 选择测评图片
const handleSelectReviewImage = () => {
  reviewFileInputRef.value?.click()
}

// 处理测评图片文件变化
const handleReviewFileChange = async (e) => {
  const files = Array.from(e.target.files)
  if (files.length === 0) return
  
  // 检查图片数量限制
  if (reviewForm.value.images.length + files.length > 9) {
    ElMessage.warning('最多上传9张图片')
    return
  }
  
  // 上传图片
  try {
    const urls = await uploadPostImages(files)
    reviewForm.value.images = [...reviewForm.value.images, ...urls]
    ElMessage.success('上传成功')
  } catch (error) {
    ElMessage.error('上传失败')
  }
  
  // 清空input
  e.target.value = ''
}

// 移除测评图片
const handleRemoveReviewImage = (index) => {
  reviewForm.value.images.splice(index, 1)
}

// 提交测评
const submitReview = async () => {
  if (!reviewForm.value.gearName) {
    ElMessage.warning('请输入装备名称')
    return
  }
  if (!reviewForm.value.category) {
    ElMessage.warning('请选择分类')
    return
  }
  if (!reviewForm.value.title) {
    ElMessage.warning('请输入标题')
    return
  }
  if (!reviewForm.value.content) {
    ElMessage.warning('请输入内容')
    return
  }
  
  reviewSubmitting.value = true
  try {
    await gearApi.createGearReview(reviewForm.value)
    ElMessage.success('发布成功')
    reviewDialogVisible.value = false
    loadReviewList()
  } catch (error) {
    ElMessage.error('发布失败')
  } finally {
    reviewSubmitting.value = false
  }
}

// 搜索测评
const handleReviewSearch = () => {
  loadReviewList()
}

// 重置测评筛选
const handleReviewReset = () => {
  reviewKeyword.value = ''
  reviewCategory.value = 'all'
  loadReviewList()
}

// 加载更多测评
const handleReviewLoadMore = () => {
  if (!reviewLoadingMore.value && hasMoreReviews.value) {
    loadReviewList(true)
  }
}

// 获取分类名称
const getCategoryName = (category) => {
  const map = {
    'rod': '鱼竿',
    'box': '钓箱',
    'bait': '饵料',
    'other': '其他'
  }
  return map[category] || '其他'
}

// 获取分类标签类型
const getCategoryType = (category) => {
  const map = {
    'rod': 'success',
    'box': 'warning',
    'bait': 'danger',
    'other': 'info'
  }
  return map[category] || 'info'
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

// 装备测评网格布局
.review-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 4vh;
}

.review-card-skeleton {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  .skeleton-content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

.review-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  }

  .review-card-image {
    position: relative;
    height: 180px;
    overflow: hidden;
    background: #f5f7fa;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.05);
      }
    }

    &.no-image {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #909399;
      gap: 8px;

      .el-icon {
        font-size: 48px;
      }

      span {
        font-size: 14px;
      }
    }

    .image-count {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 4px;
      backdrop-filter: blur(4px);
    }
  }

  .review-card-body {
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;

    .review-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .category-tag {
        font-weight: 500;
      }
    }

    .review-card-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #303133;
      margin-bottom: 8px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .review-card-gear {
      font-size: 0.9rem;
      color: #606266;
      margin-bottom: 12px;
      font-weight: 500;

      &::before {
        content: '🎣 ';
      }
    }

    .review-card-content {
      font-size: 0.95rem;
      color: #606266;
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 16px;
      flex: 1;
    }

    .review-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #ebeef5;

      .author-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .author-name {
          font-size: 0.85rem;
          color: #606266;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .publish-time {
        font-size: 0.8rem;
        color: #909399;
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

  .review-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1200px) {
  .review-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

/* 图片上传样式 */
.upload-section {
  .upload-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .upload-image-item {
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid #e4e7ed;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-actions {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;

      .delete-btn {
        width: 32px;
        height: 32px;
        background: #f56c6c;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        .el-icon {
          color: white;
          font-size: 16px;
        }
      }
    }

    &:hover .image-actions {
      opacity: 1;
    }
  }

  .upload-trigger {
    width: 100px;
    height: 100px;
    border: 2px dashed #e4e7ed;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    background: #fafafa;

    .trigger-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;

      .upload-icon {
        font-size: 24px;
        color: var(--primary-color);
      }

      span {
        font-size: 0.8rem;
        color: #909399;
      }

      .upload-count {
        font-size: 0.7rem;
        color: #c0c4cc;
      }
    }

    &:hover {
      border-color: var(--primary-color);
      background: rgba(102, 126, 234, 0.05);
    }
  }

  .upload-tip {
    margin-top: 10px;
    font-size: 0.8rem;
    color: #c0c4cc;
  }

  .cover-tag {
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(102, 126, 234, 0.9);
    color: white;
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 4px;
  }
}

// 发布对话框样式
.publish-dialog {
  :deep(.el-dialog__header) {
    display: none;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }

  :deep(.el-dialog__footer) {
    padding: 0;
    border-top: 1px solid #ebeef5;
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 28px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    .header-left {
      .dialog-title {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 6px;
      }

      .dialog-subtitle {
        font-size: 0.9rem;
        opacity: 0.9;
      }
    }

    .header-icon {
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      .el-icon {
        font-size: 26px;
      }

      &.review-icon {
        background: rgba(255, 255, 255, 0.25);
      }
    }
  }

  .dialog-content {
    padding: 24px 28px;
    max-height: 65vh;
    overflow-y: auto;
  }

  .form-group {
    margin-bottom: 20px;

    &.half {
      flex: 1;
    }
  }

  .form-row {
    display: flex;
    gap: 16px;
  }

  .form-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.95rem;
    font-weight: 600;
    color: #303133;
    margin-bottom: 10px;

    .label-icon {
      color: #667eea;
      font-size: 0.8rem;
    }

    &.optional {
      color: #909399;
      font-weight: 500;
    }
  }

  .custom-input,
  .custom-select,
  .custom-textarea {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #e4e7ed;
    border-radius: 10px;
    font-size: 0.95rem;
    color: #303133;
    background: #fafafa;
    transition: all 0.3s;
    outline: none;

    &:focus {
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    &::placeholder {
      color: #c0c4cc;
    }
  }

  .custom-textarea {
    resize: vertical;
    min-height: 120px;
    line-height: 1.6;
  }

  .input-hint {
    text-align: right;
    font-size: 0.8rem;
    color: #c0c4cc;
    margin-top: 6px;
  }

  .select-wrapper {
    position: relative;

    .custom-select {
      appearance: none;
      cursor: pointer;
      padding-right: 36px;
    }

    .select-arrow {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #909399;
      pointer-events: none;
    }
  }

  // 评分区域样式
  .rating-wrapper {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px 0;

    .rating-score {
      font-size: 1.1rem;
      font-weight: 600;
      color: #ff9900;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 28px;

    .footer-hint {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: #909399;

      .hint-icon {
        font-size: 1rem;
      }
    }

    .footer-actions {
      display: flex;
      gap: 12px;

      .cancel-btn {
        padding: 10px 24px;
        border-radius: 10px;
        border: 1px solid #dcdfe6;
        color: #606266;

        &:hover {
          border-color: #667eea;
          color: #667eea;
        }
      }

      .submit-btn {
        padding: 10px 28px;
        border-radius: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        font-weight: 600;

        &:hover {
          opacity: 0.9;
        }
      }
    }
  }
}
</style>
