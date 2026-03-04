<template>
  <div class="community-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">社区论坛</h1>
        <p class="page-description">分享你的钓鱼故事，与钓友们交流经验</p>
      </div>
    </div>

    <!-- 导航标签 -->
    <div class="nav-tabs">
      <div class="container">
        <el-tabs v-model="activeTab" class="community-tabs" @tab-change="saveTabState">
          <el-tab-pane label="爆护战报" name="posts">
            <div class="tab-content">
              <!-- 筛选栏 -->
              <div class="filter-bar">
                <div class="filter-left">
                  <el-select v-model="sortBy" class="sort-select" placeholder="排序方式">
                    <el-option label="最新发布" value="newest" />
                    <el-option label="最多点赞" value="most_likes" />
                    <el-option label="最多评论" value="most_comments" />
                  </el-select>
                </div>
                <div class="filter-right">
                  <el-button type="primary" size="large" @click="$router.push('/community/post')" class="publish-btn">
                    <el-icon><Plus /></el-icon> 发布战报
                  </el-button>
                </div>
              </div>

              <!-- 帖子列表 -->
              <div class="posts-list">
                <div
                  v-for="post in sortedPosts"
                  :key="post.id"
                  class="post-card"
                  @click="viewPostDetail(post.id)"
                >
                  <div class="post-image">
                    <img :src="post.coverImage" alt="鱼获" />
                    <el-tag
                      v-if="post.fish_weight > 10"
                      type="danger"
                      effect="dark"
                      class="giant-tag"
                    >
                      巨物
                    </el-tag>
                  </div>
                  <div class="post-content">
                    <div class="post-header">
                      <div class="user-info">
                        <el-avatar :size="40" :src="post.user_avatar" />
                        <div class="user-details">
                          <span class="username">{{ post.user_nickname }}</span>
                          <span class="post-time">{{ post.create_time }}</span>
                        </div>
                      </div>
                      <el-tag :type="getFishTypeTag(post.fish_species)" size="small">
                        {{ post.fish_species }}
                      </el-tag>
                    </div>
                    <h3 class="post-title">{{ post.title }}</h3>
                    <div class="post-footer">
                      <div class="post-stats">
                        <span class="stat-item">
                          <el-icon><View /></el-icon> {{ post.view_count }}
                        </span>
                        <span class="stat-item" @click.stop="handleLike(post.id)">
                          <el-icon><Star /></el-icon> {{ post.like_count }}
                        </span>
                        <span class="stat-item" @click.stop="handleComment(post.id)">
                          <el-icon><ChatLineSquare /></el-icon> {{ post.comment_count }}
                        </span>
                      </div>
                      <div class="fish-weight">
                        <el-icon><Trophy /></el-icon>
                        <span>{{ post.fish_weight }}斤</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 查看更多 -->
              <div class="load-more-section">
                <el-button 
                  v-if="hasMorePosts" 
                  @click="loadMorePosts" 
                  :loading="loadingMore"
                  class="load-more-btn"
                >
                  <el-icon v-if="!loadingMore"><ArrowDown /></el-icon>
                  {{ loadingMore ? '加载中...' : '查看更多' }}
                </el-button>
                <div v-else class="no-more">
                  没有更多内容了
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="空军疗伤" name="air-force">
            <div class="tab-content">
              <!-- 空军疗伤横幅 -->
              <div class="air-force-banner">
                <div class="banner-content">
                  <div class="banner-icon">✈️</div>
                  <div class="banner-text">
                    <h3>空军疗伤室</h3>
                    <p>分享你的空军故事，获得AI温暖安慰</p>
                  </div>
                  <el-button type="danger" size="large" @click="$router.push('/community/air-force')" class="checkin-btn">
                    <!-- <el-icon><Warning /></el-icon> -->
                    一键空军打卡
                  </el-button>
                </div>
                <div class="banner-stats">
                  <div class="stat-item">
                    <div class="stat-number">{{ totalAirForce }}</div>
                    <div class="stat-label">今日空军</div>
                  </div>
                  <div class="stat-divider"></div>
                  <div class="stat-item">
                    <div class="stat-number">{{ airForceRate }}%</div>
                    <div class="stat-label">空军率</div>
                  </div>
                </div>
              </div>

              <!-- 空军动态列表 -->
              <div class="air-force-list">
                <div class="list-header">
                  <h4>钓友们的空军故事</h4>
                  <el-radio-group v-model="airForceSort" size="small" @change="fetchAirForcePosts()">
                    <el-radio-button label="newest" style="margin-right: 10px;">最新</el-radio-button>
                    <el-radio-button label="hottest">最热</el-radio-button>
                  </el-radio-group>
                </div>
                <div v-for="post in airForcePosts" :key="post.id" class="air-force-card" @click="goToPostDetail(post.id)">
                  <div class="post-header">
                    <div class="user-info">
                      <el-avatar :size="40" :src="post.user_avatar" />
                      <div class="user-details">
                        <span class="username">{{ post.user_nickname }}</span>
                        <span class="post-time">{{ post.create_time }}</span>
                      </div>
                    </div>
                    
                  </div>
                  <div class="post-content">
                    <p class="post-text">{{ post.content }}</p>
                    <div class="ai-comfort" v-if="post.ai_comment">
                      <div class="ai-avatar">
                        <el-icon class="ai-icon"><Cpu /></el-icon>
                      </div>
                      <div class="ai-content">
                        <span class="ai-label">AI 安慰师</span>
                        <p>{{ post.ai_comment }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="post-footer">
                    <div class="post-stats">
                      <span class="stat-item">
                        <el-icon><View /></el-icon> {{ post.view_count }}
                      </span>
                      <span class="stat-item" @click.stop="handleLike(post.id, true)">
                        <el-icon><Star /></el-icon> {{ post.like_count }}
                      </span>
                      <span class="stat-item" @click.stop="handleComment(post.id)">
                        <el-icon><ChatLineSquare /></el-icon> {{ post.comment_count }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- 查看更多 -->
                <div class="load-more-section">
                  <el-button 
                    v-if="hasMoreAirForce" 
                    @click="loadMoreAirForcePosts" 
                    :loading="loadingMore"
                    class="load-more-btn"
                  >
                    <el-icon v-if="!loadingMore"><ArrowDown /></el-icon>
                    {{ loadingMore ? '加载中...' : '查看更多' }}
                  </el-button>
                  <div v-else class="no-more">
                    没有更多内容了
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { View, Star, ChatLineSquare, Trophy, Warning, Cpu, Plus, ArrowRight, ArrowDown } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { getPostList, toggleLike, incrementView } from '@/api/post'
import { getAirForceStats, getAirForcePosts } from '@/api/airforce'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

// 从 sessionStorage 恢复标签页状态，优先使用 URL query 参数
const getSavedTab = () => {
  // 优先使用 URL query 参数
  const queryTab = route.query.activeTab
  if (queryTab) {
    return queryTab === 'air-force' ? 'air-force' : 'posts'
  }
  const savedTab = sessionStorage.getItem('community_active_tab')
  return savedTab || 'posts'
}

// 响应式数据
const activeTab = ref(getSavedTab())

// 监听路由 query 参数变化
watch(() => route.query.activeTab, (newTab) => {
  if (newTab) {
    activeTab.value = newTab === 'air-force' ? 'air-force' : 'posts'
    // 更新 sessionStorage
    sessionStorage.setItem('community_active_tab', activeTab.value)
  }
}, { immediate: true })

// 监听标签页变化并保存到 sessionStorage
const saveTabState = (tab) => {
  sessionStorage.setItem('community_active_tab', tab)
}

const sortBy = ref('newest')
const airForceSort = ref('newest')
const currentPage = ref(1)
const pageSize = ref(10)
const totalPosts = ref(0)
const totalAirForce = ref(0)
const airForceRate = ref(0)
const loading = ref(false)
const loadingMore = ref(false)
const hasMorePosts = ref(true)
const hasMoreAirForce = ref(true)

// 帖子数据
const posts = ref([])

// 空军动态数据
const airForcePosts = ref([])
const airForcePageNum = ref(1)

// 回到顶部相关


// 点赞功能
const handleLike = async (postId, isAirForce = false) => {
  try {
    let result
    if (isAirForce) {
      result = await import('@/api/airforce').then(module => module.toggleLike(postId))
    } else {
      result = await toggleLike(postId)
    }
    
    if (isAirForce) {
      const post = airForcePosts.value.find(p => p.id === postId)
      if (post) {
        post.like_count += 1
      }
    } else {
      const post = posts.value.find(p => p.id === postId)
      if (post) {
        post.like_count += 1
      }
    }
    ElMessage.success('点赞成功')
  } catch (error) {
    console.error('点赞失败:', error)
    ElMessage.error('点赞失败')
  }
}



// 评论功能
const handleComment = (postId) => {
  router.push(`/community/post/${postId}`)
}

const goToPostDetail = (postId) => {
  router.push(`/community/post/${postId}`)
}

const fetchPosts = async (isLoadMore = false) => {
  loading.value = true
  try {
    const pageNum = isLoadMore ? currentPage.value + 1 : 1
    const result = await getPostList(0, pageNum, pageSize.value)
    
    if (result && Array.isArray(result)) {
      const newPosts = result.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        fish_species: item.fishSpecies,
        fish_weight: item.fishWeight,
        coverImage: item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?q=80&w=800&auto=format&fit=crop',
        user_nickname: item.userNickname || '匿名用户',
        user_avatar: item.userAvatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        create_time: item.createTime,
        view_count: item.viewCount || 0,
        like_count: item.likeCount || 0,
        comment_count: item.commentCount || 0,
      }))
      
      if (isLoadMore) {
        posts.value.push(...newPosts)
        currentPage.value = pageNum
      } else {
        posts.value = newPosts
        currentPage.value = 1
      }
      
      totalPosts.value = posts.value.length
      hasMorePosts.value = newPosts.length === pageSize.value
    }
  } catch (error) {
    console.error('获取帖子列表失败:', error)
    ElMessage.error('获取帖子列表失败')
  } finally {
    loading.value = false
  }
}

// 加载更多帖子
const loadMorePosts = async () => {
  if (loadingMore.value || !hasMorePosts.value) return
  loadingMore.value = true
  try {
    await fetchPosts(true)
  } finally {
    loadingMore.value = false
  }
}

// 获取空军统计数据
const fetchAirForceStats = async () => {
  try {
    const result = await getAirForceStats()
    if (result) {
      totalAirForce.value = result.todayAirForce || 0
      airForceRate.value = result.airForceRate || 0
    }
  } catch (error) {
    console.error('获取空军统计数据失败:', error)
  }
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

// 获取空军帖子列表
const fetchAirForcePosts = async (isLoadMore = false) => {
  try {
    const pageNum = isLoadMore ? airForcePageNum.value + 1 : 1
    const result = await getAirForcePosts({
      pageNum: pageNum,
      pageSize: 10,
      sortType: airForceSort.value
    })
    if (result && Array.isArray(result)) {
      const newPosts = result.map(item => ({
        id: item.id,
        content: item.content,
        user_nickname: item.userNickname || '匿名用户',
        user_avatar: item.userAvatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        create_time: formatTime(item.createTime),
        view_count: item.viewCount || 0,
        like_count: item.likeCount || 0,
        comment_count: item.commentCount || 0,
        ai_comment: item.aiComment,
      }))
      
      if (isLoadMore) {
        airForcePosts.value.push(...newPosts)
        airForcePageNum.value = pageNum
      } else {
        airForcePosts.value = newPosts
        airForcePageNum.value = 1
      }
      
      hasMoreAirForce.value = newPosts.length === 10
    }
  } catch (error) {
    console.error('获取空军帖子失败:', error)
  }
}

// 加载更多空军帖子
const loadMoreAirForcePosts = async () => {
  if (loadingMore.value || !hasMoreAirForce.value) return
  loadingMore.value = true
  try {
    await fetchAirForcePosts(true)
  } finally {
    loadingMore.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchPosts()
  fetchAirForceStats()
  fetchAirForcePosts()
})

// 排序后的帖子
const sortedPosts = computed(() => {
  const sorted = [...posts.value]
  switch (sortBy.value) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.create_time) - new Date(a.create_time))
    case 'most_likes':
      return sorted.sort((a, b) => b.like_count - a.like_count)
    case 'most_comments':
      return sorted.sort((a, b) => b.comment_count - a.comment_count)
    default:
      return sorted
  }
})

// 查看帖子详情
const viewPostDetail = async (id) => {
  try {
    await incrementView(id)
  } catch (error) {
    console.error('增加浏览量失败:', error)
  }
  router.push(`/community/post/${id}`)
}

// 获取鱼种标签类型
const getFishTypeTag = (species) => {
  const speciesMap = {
    翘嘴: 'primary',
    青鱼: 'success',
    鲫鱼: 'warning',
    鲤鱼: 'info',
    草鱼: 'danger',
  }
  return speciesMap[species] || 'info'
}


</script>

<style lang="scss" scoped>
.community-page {
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

.nav-tabs {
  position: relative;
  z-index: 1;
  margin-bottom: 1vh;

  .community-tabs {
    :deep(.el-tabs) {
      background: transparent;
    }

    :deep(.el-tabs__header) {
      background: white;
      box-shadow: var(--shadow-md);
      border-bottom: 1px solid var(--border-light);

      .el-tabs__nav {
        margin: 0;
      }

      .el-tabs__item {
        font-size: 1.1rem;
        font-weight: 500;
        padding: 3vh 2vw;

        &.is-active {
          color: var(--primary-color);

          &::after {
            background: var(--primary-color);
          }
        }
      }
    }

    :deep(.el-tabs__content) {
      background: transparent;
    }

    :deep(.el-tab-pane) {
      background: transparent;
    }
  }
}

.tab-content {
  position: relative;
  z-index: 1;
  padding: 1vh 0;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4vh;
  padding: 1vh 2vw;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);

  .sort-select {
    width: 180px;
    
    :deep(.el-input__wrapper) {
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
    }
  }
}

.publish-btn {
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

.posts-list {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 2vh;
}

.post-card {
  display: flex;
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .post-image {
    width: 200px;
    height: 150px;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .giant-tag {
      position: absolute;
      top: 1vh;
      left: 1vw;
    }
  }

  .post-content {
    flex: 1;
    padding: 2vh 2vw;
    display: flex;
    flex-direction: column;
  }

  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1vh;

    .user-info {
      display: flex;
      align-items: center;
      gap: 1vw;

      .user-details {
        display: flex;
        flex-direction: column;

        .username {
          font-weight: 600;
          color: var(--text-primary);
        }

        .post-time {
          font-size: 0.8rem;
          color: var(--text-light);
        }
      }
    }
  }

  .post-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1vh;
    color: var(--text-primary);
  }

  .post-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;

    .post-stats {
      display: flex;
      gap: 1.5vw;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 0.5vw;
        font-size: 0.9rem;
        color: var(--text-secondary);
      }
    }

    .fish-weight {
      display: flex;
      align-items: center;
      gap: 0.5vw;
      font-weight: 600;
      color: var(--warning-color);
      font-size: 1rem;
    }
  }
}

.load-more-section {
  margin-top: 4vh;
  display: flex;
  justify-content: center;
  padding: 2vh 0;
  position: relative;
  z-index: 1;
  
  .load-more-btn {
    min-width: 180px;
    height: 48px;
    border-radius: 24px;
    border: 2px solid transparent;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
    color: white;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(67, 97, 238, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(67, 97, 238, 0.4);
      background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
    }
    
    &:active {
      transform: translateY(0);
    }
    
    .el-icon {
      margin-right: 6px;
      font-size: 1.1rem;
    }
  }
  
  .no-more {
    color: var(--text-light);
    font-size: 0.9rem;
    padding: 1.5vh 0;
    display: flex;
    align-items: center;
    gap: 8px;
    
    &::before {
      content: '';
      width: 30px;
      height: 1px;
      background: var(--border-color);
    }
    
    &::after {
      content: '';
      width: 30px;
      height: 1px;
      background: var(--border-color);
    }
  }
}

.air-force-banner {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  border-radius: var(--radius-lg);
  padding: 3vh 3vw;
  margin-bottom: 4vh;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  box-shadow: var(--shadow-lg);

  .banner-content {
    display: flex;
    align-items: center;
    gap: 2vw;

    .banner-icon {
      font-size: 3rem;
    }

    .banner-text {
      h3 {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0 0 0.5vh 0;
      }

      p {
        margin: 0;
        opacity: 0.9;
        font-size: 0.95rem;
      }
    }

    .checkin-btn {
      background: white;
      color: #ee5a6f;
      border: none;
      font-weight: 600;
      padding: 1.2vh 2vw;
      font-size: 1rem;

      &:hover {
        background: rgba(255, 255, 255, 0.9);
        transform: translateY(-2px);
      }
    }
  }

  .banner-stats {
    display: flex;
    align-items: center;
    gap: 2vw;

    .stat-divider {
      width: 1px;
      height: 50px;
      background: rgba(255, 255, 255, 0.3);
    }

    .stat-item {
      text-align: center;

      .stat-number {
        font-size: 2rem;
        font-weight: 800;
        color: white;
      }

      .stat-label {
        font-size: 0.9rem;
        opacity: 0.9;
      }
    }
  }
}

.air-force-list {
  display: flex;
  flex-direction: column;
  gap: 2vh;

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2vh;
    padding: 1.5vh 2vw;
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);

    h4 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    :deep(.el-radio-group) {
      .el-radio-button__inner {
        border-radius: var(--radius-md);
        border: 1px solid var(--border-color);
        padding: 0.8vh 1.5vw;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all var(--transition-normal);
        
        &:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }
      }

      .el-radio-button__original-radio:checked + .el-radio-button__inner {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: white;
        box-shadow: var(--shadow-sm);
      }
    }
  }
}

.air-force-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 2vh 2vw;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2vh;

    .user-info {
      display: flex;
      align-items: center;
      gap: 1vw;

      .user-details {
        display: flex;
        flex-direction: column;

        .username {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .post-time {
          font-size: 0.8rem;
          color: var(--text-light);
          margin-top: 0.3vh;
        }
      }
    }
  }

  .post-content {
    margin-bottom: 2vh;

    .post-text {
      line-height: 1.6;
      color: var(--text-primary);
      margin-bottom: 2vh;
      font-size: 0.95rem;
    }

    .ai-comfort {
      display: flex;
      gap: 1vw;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      padding: 1.5vh 1.5vw;
      border-radius: var(--radius-md);
      border-left: 4px solid #10b981;

      .ai-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        .ai-icon {
          color: white;
          font-size: 1.2rem;
        }
      }

      .ai-content {
        flex: 1;

        .ai-label {
          font-size: 0.8rem;
          color: #059669;
          font-weight: 600;
          display: block;
          margin-bottom: 0.5vh;
        }

        p {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--text-secondary);
        }
      }
    }
  }

  .post-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 2vh;
    padding-top: 2vh;
    border-top: 1px solid var(--border-color);

    .post-stats {
      display: flex;
      gap: 1.5vw;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 0.5vw;
        font-size: 0.9rem;
        color: var(--text-secondary);
        padding: 0.5vh 1vw;
        border-radius: var(--radius-md);
        transition: all var(--transition-normal);
        
        &:hover {
          background: var(--bg-primary);
          color: var(--primary-color);
        }
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .post-card {
    flex-direction: column;

    .post-image {
      width: 100%;
      height: 200px;
    }
  }

  .air-force-banner {
    flex-direction: column;
    gap: 3vh;
    text-align: center;

    .banner-content {
      flex-direction: column;
      gap: 2vh;

      .banner-icon {
        font-size: 2.5rem;
      }

      .banner-text {
        h3 {
          font-size: 1.3rem;
        }
      }

      .checkin-btn {
        width: 100%;
      }
    }

    .banner-stats {
      justify-content: center;
      gap: 4vw;

      .stat-divider {
        height: 40px;
      }

      .stat-item {
        .stat-number {
          font-size: 1.5rem;
        }
      }
    }
  }
}
</style>
