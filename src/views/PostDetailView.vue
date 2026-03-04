<template>
  <div class="post-detail-page">
    <div class="back-nav">
      <div class="container">
        <div class="back-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </div>
      </div>
    </div>

    <div class="container">
      <div v-if="loading" class="loading-wrapper">
        <el-skeleton :rows="12" animated />
      </div>

      <div v-else-if="post" class="post-detail">
        <div class="post-main">
          <div class="post-gallery" v-if="post.images && post.images.length > 0">
            <el-carousel 
              :autoplay="false" 
              indicator-position="outside" 
              arrow="always"
              height="500px"
              @change="handleCarouselChange"
            >
              <el-carousel-item v-for="(img, index) in post.images" :key="index">
                <div class="carousel-image-wrapper" @click="openImagePreview(index)">
                  <el-image 
                    :src="img" 
                    fit="cover" 
                    class="carousel-image"
                    :preview-src-list="[]"
                  />
                  <div class="image-overlay">
                    <el-icon class="preview-icon"><ZoomIn /></el-icon>
                    <span>点击预览</span>
                  </div>
                </div>
              </el-carousel-item>
            </el-carousel>
          </div>

          <div class="post-content-wrapper">
            <div class="post-header">
              <div class="author-info">
                <el-avatar :size="56" :src="post.userAvatar" />
                <div class="author-details">
                  <h3 class="author-name">{{ post.userNickname }}</h3>
                  <p class="post-time">{{ formatFullTime(post.createTime) }}</p>
                </div>
              </div>
              <el-tag 
                v-if="post.type === 0"
                :type="getFishTypeTag(post.fishSpecies)" 
                size="large"
                effect="dark"
                class="fish-tag"
              >
                {{ post.fishSpecies }}
              </el-tag>
              <el-tag 
                v-if="post.type === 1"
                type="danger" 
                size="large"
                effect="dark"
                class="fish-tag"
              >
                空军疗伤
              </el-tag>
            </div>

            <h1 class="post-title">{{ post.title }}</h1>

            <div class="post-body">
              <div class="post-text">{{ post.content }}</div>
              <div v-if="post.type === 1 && post.aiComment" class="ai-comfort-section">
                <div class="ai-comfort-header">
                  <el-icon class="ai-icon"><Cpu /></el-icon>
                  <span>AI 安慰师</span>
                </div>
                <p class="ai-comfort-text">{{ post.aiComment }}</p>
              </div>
            </div>

            <div v-if="post.type === 0" class="post-meta">
              <div class="meta-item">
                <div class="meta-icon">
                  <el-icon><Location /></el-icon>
                </div>
                <div class="meta-content">
                  <span class="meta-label">钓点位置</span>
                  <span class="meta-value">{{ post.addressName || '未知钓点' }}</span>
                </div>
              </div>
              <div class="meta-item">
                <div class="meta-icon">
                  <el-icon><Trophy /></el-icon>
                </div>
                <div class="meta-content">
                  <span class="meta-label">鱼获重量</span>
                  <span class="meta-value highlight">{{ post.fishWeight }} 斤</span>
                </div>
              </div>
            </div>

            <div class="post-stats-bar">
              <div class="stat-item" @click="handleLike">
                <el-icon :class="{ 'liked': isLiked }" class="stat-icon"><Star /></el-icon>
                <span class="stat-count">{{ post.likeCount }}</span>
                <span class="stat-label">点赞</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <el-icon class="stat-icon"><View /></el-icon>
                <span class="stat-count">{{ post.viewCount }}</span>
                <span class="stat-label">浏览</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <el-icon class="stat-icon"><ChatLineSquare /></el-icon>
                <span class="stat-count">{{ post.commentCount }}</span>
                <span class="stat-label">评论</span>
              </div>
            </div>
          </div>
        </div>

        <div class="comments-section">
          <div class="section-header">
            <h3>评论列表</h3>
            <span class="comment-count">{{ comments.length }} 条评论</span>
          </div>

          <div class="comment-form">
            <el-input
              v-model="commentContent"
              type="textarea"
              :rows="4"
              placeholder="分享你的想法..."
              class="comment-textarea"
            />
            <el-button 
              type="primary" 
              @click="submitComment" 
              :loading="submitting"
              class="submit-btn"
              size="large"
            >
              <el-icon><Promotion /></el-icon>
              发表评论
            </el-button>
          </div>

          <div class="comments-list">
            <div v-if="comments.length > 0">
              <div v-for="comment in comments" :key="comment.id" class="comment-card">
                <el-avatar :size="48" :src="comment.userAvatar" />
                <div class="comment-body">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.userNickname }}</span>
                    <span class="comment-time">{{ formatRelativeTime(comment.createTime) }}</span>
                  </div>
                  <p class="comment-text">{{ comment.content }}</p>
                  <el-tag v-if="comment.isAiGenerated" type="success" size="small" effect="plain">
                    <el-icon><Cpu /></el-icon>
                    AI 回复
                  </el-tag>
                </div>
              </div>
            </div>
            <div v-else class="empty-comments">
              <el-icon class="empty-icon"><ChatLineSquare /></el-icon>
              <p>暂无评论，快来抢沙发吧！</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <el-icon class="empty-icon"><DocumentDelete /></el-icon>
        <p>帖子不存在或已被删除</p>
        <el-button type="primary" @click="goBack">返回列表</el-button>
      </div>
    </div>

    <ImagePreview
      v-model:visible="imagePreviewVisible"
      :images="post?.images || []"
      :initial-index="currentImageIndex"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft, 
  Star, 
  View, 
  ChatLineSquare, 
  Location, 
  Trophy, 
  ZoomIn,
  Promotion,
  Cpu,
  DocumentDelete
} from '@element-plus/icons-vue'
import { getPostDetail, toggleLike } from '@/api/post'
import { getCommentList, createComment } from '@/api/comment'
import { ElMessage } from 'element-plus'
import ImagePreview from '@/components/common/ImagePreview.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const post = ref(null)
const comments = ref([])
const commentContent = ref('')
const submitting = ref(false)
const isLiked = ref(false)
const imagePreviewVisible = ref(false)
const currentImageIndex = ref(0)

const fetchPostDetail = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const result = await getPostDetail(id)
    
    post.value = {
      id: result.id,
      type: result.type,
      title: result.title,
      content: result.content,
      images: Array.isArray(result.images) ? result.images : [],
      fishSpecies: result.fishSpecies,
      fishWeight: result.fishWeight,
      addressName: result.addressName,
      aiComment: result.aiComment,
      userNickname: result.userNickname || '匿名用户',
      userAvatar: result.userAvatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      createTime: result.createTime,
      viewCount: result.viewCount || 0,
      likeCount: result.likeCount || 0,
      commentCount: result.commentCount || 0
    }
    
    await fetchComments()
  } catch (error) {
    console.error('获取帖子详情失败:', error)
    ElMessage.error('获取帖子详情失败')
  } finally {
    loading.value = false
  }
}

const fetchComments = async () => {
  try {
    const result = await getCommentList(route.params.id)
    comments.value = (result || []).map(item => ({
      id: item.id,
      userId: item.userId,
      content: item.content,
      userNickname: item.userNickname || '匿名用户',
      userAvatar: item.userAvatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      createTime: item.createTime,
      isAiGenerated: item.isAiGenerated || false
    }))
  } catch (error) {
    console.error('获取评论失败:', error)
  }
}

const handleLike = async () => {
  try {
    const result = await toggleLike(post.value.id)
    post.value.likeCount += 1
    ElMessage.success('点赞成功')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const submitComment = async () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  submitting.value = true
  try {
    await createComment({
      postId: post.value.id,
      content: commentContent.value
    })
    commentContent.value = ''
    ElMessage.success('评论成功')
    post.value.commentCount += 1
    await fetchComments()
  } catch (error) {
    ElMessage.error('评论失败')
  } finally {
    submitting.value = false
  }
}

const handleCarouselChange = (index) => {
  currentImageIndex.value = index
}

const openImagePreview = (index) => {
  currentImageIndex.value = index
  imagePreviewVisible.value = true
}

const formatFullTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}年${month}月${day}日 ${hours}:${minutes}`
}

const formatRelativeTime = (time) => {
  if (!time) return ''
  const now = new Date()
  const date = new Date(time)
  const diff = now - date
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return formatFullTime(time)
}

const getFishTypeTag = (species) => {
  const speciesMap = {
    翘嘴: 'primary',
    青鱼: 'success',
    鲫鱼: 'warning',
    鲤鱼: 'info',
    草鱼: 'danger'
  }
  return speciesMap[species] || 'info'
}

const goBack = () => {
  // 返回到社区论坛页面，并传递 activeTab 参数
  router.push({
    path: '/community',
    query: {
      activeTab: post.value && post.value.type === 1 ? 'air-force' : 'fish'
    }
  })
}

onMounted(() => {
  fetchPostDetail()
})
</script>

<style lang="scss" scoped>
.post-detail-page {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}

.back-nav {
  position: relative;
  z-index: 1;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 1.5vh 0;
  position: sticky;
  top: 0;
  z-index: 100;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2vw;
  }
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5vw;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 500;
  padding: 0.8vh 1.5vw;
  border-radius: var(--radius-md);
  transition: all 0.3s;

  &:hover {
    background: var(--bg-primary);
    color: var(--primary-color);
  }

  .el-icon {
    font-size: 1.2rem;
  }
}

.container {
  position: relative;
  z-index: 1;
  width: 90%;
  margin: 0 auto;
  padding: 2vh 1vw;
}

.loading-wrapper {
  background: white;
  border-radius: 16px;
  padding: 6vh 4vw;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.post-detail {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 3vh;
}

.post-main {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.post-gallery {
  :deep(.el-carousel) {
    .el-carousel__indicators--outside {
      bottom: 20px;
      
      .el-carousel__indicator {
        background-color: rgba(255, 255, 255, 0.5);
        
        &.is-active {
          background-color: var(--primary-color);
        }
      }
    }
    
    .el-carousel__arrow {
      background-color: rgba(0, 0, 0, 0.5);
      width: 50px;
      height: 50px;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.7);
      }
      
      .el-icon {
        font-size: 24px;
      }
    }
  }
}

.carousel-image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
  overflow: hidden;

  &:hover .image-overlay {
    opacity: 1;
  }
}

.carousel-image {
  width: 100%;
  height: 100%;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
  gap: 1vh;

  .preview-icon {
    font-size: 3rem;
  }

  span {
    font-size: 1.1rem;
    font-weight: 500;
  }
}

.post-content-wrapper {
  padding: 4vh 4vw;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3vh;
  padding-bottom: 2vh;
  border-bottom: 1px solid var(--border-light);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 1.5vw;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 0.5vh;

  .author-name {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .post-time {
    font-size: 0.9rem;
    color: var(--text-light);
    margin: 0;
  }
}

.fish-tag {
  font-size: 1rem;
  padding: 1vh 2vw;
  font-weight: 500;
}

.post-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 3vh;
  color: var(--text-primary);
  line-height: 1.4;
}

.post-body {
  margin-bottom: 4vh;
}

.post-text {
  font-size: 1.15rem;
  line-height: 2;
  color: var(--text-regular);
  white-space: pre-wrap;
}

.ai-comfort-section {
  margin-top: 3vh;
  padding: 2.5vh 3vw;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 12px;
  color: white;
}

.ai-comfort-header {
  display: flex;
  align-items: center;
  gap: 1vw;
  margin-bottom: 1.5vh;
  font-size: 1.1rem;
  font-weight: 600;

  .ai-icon {
    font-size: 1.3rem;
  }
}

.ai-comfort-text {
  font-size: 1rem;
  line-height: 1.8;
  opacity: 0.95;
}

.post-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2vh;
  margin-bottom: 4vh;
  padding: 3vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 1.5vw;
}

.meta-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .el-icon {
    font-size: 1.5rem;
  }
}

.meta-content {
  display: flex;
  flex-direction: column;
  gap: 0.5vh;

  .meta-label {
    font-size: 0.85rem;
    opacity: 0.9;
  }

  .meta-value {
    font-size: 1.2rem;
    font-weight: 600;

    &.highlight {
      font-size: 1.5rem;
      color: #ffd700;
    }
  }
}

.post-stats-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5vh 0;
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
  gap: 2vw;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5vh;
  cursor: pointer;
  padding: 0vh 2vw;
  border-radius: var(--radius-md);
  transition: all 0.3s;

  &:hover {
    background: var(--bg-primary);
    transform: translateY(-2px);
  }

  .stat-icon {
    font-size: 1.8rem;
    color: var(--text-secondary);
    transition: color 0.3s;

    &.liked {
      color: #ff6b6b;
    }
  }

  .stat-count {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .stat-label {
    font-size: 0.85rem;
    color: var(--text-light);
  }
}

.stat-divider {
  width: 1px;
  height: 50px;
  background: var(--border-light);
}

.comments-section {
  background: white;
  border-radius: 16px;
  padding: 4vh 4vw;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3vh;
  padding-bottom: 2vh;
  border-bottom: 2px solid var(--border-light);

  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }

  .comment-count {
    font-size: 1rem;
    color: var(--text-light);
    background: var(--bg-primary);
    padding: 0.5vh 1.5vw;
    border-radius: 20px;
  }
}

.comment-form {
  margin-bottom: 4vh;
  padding: 3vh;
  background: var(--bg-primary);
  border-radius: 12px;

  :deep(.el-textarea__inner) {
    font-size: 1rem;
    line-height: 1.6;
    border-radius: 8px;
  }
}

.submit-btn {
  margin-top: 2vh;
  padding: 1.2vh 3vw;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;

  .el-icon {
    margin-right: 0.5vw;
  }
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 2vh;
}

.comment-card {
  display: flex;
  gap: 1.5vw;
  padding: 2.5vh;
  background: var(--bg-primary);
  border-radius: 12px;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .comment-body {
    flex: 1;
  }

  .comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1vh;
  }

  .comment-author {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 1rem;
  }

  .comment-time {
    font-size: 0.85rem;
    color: var(--text-light);
  }

  .comment-text {
    color: var(--text-regular);
    line-height: 1.7;
    margin: 0 0 1vh 0;
    font-size: 1rem;
  }

  .el-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.3vw;
  }
}

.empty-comments {
  text-align: center;
  padding: 6vh 0;
  color: var(--text-light);

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 2vh;
    color: var(--border-color);
  }

  p {
    font-size: 1.1rem;
    margin: 0;
  }
}

.empty-state {
  text-align: center;
  padding: 10vh 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  .empty-icon {
    font-size: 6rem;
    color: var(--text-light);
    margin-bottom: 3vh;
  }

  p {
    font-size: 1.3rem;
    color: var(--text-secondary);
    margin-bottom: 3vh;
  }

  .el-button {
    padding: 1.2vh 3vw;
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .post-title {
    font-size: 1.6rem;
  }

  .post-text {
    font-size: 1rem;
  }

  .post-meta {
    grid-template-columns: 1fr;
  }

  .post-stats-bar {
    gap: 1vw;
  }

  .stat-icon {
    font-size: 1.4rem;
  }

  .stat-count {
    font-size: 1.1rem;
  }

  .comment-form {
    padding: 2vh;
  }
}
</style>
