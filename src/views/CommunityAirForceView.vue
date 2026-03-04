<template>
  <div class="air-force-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="container">
        <div class="header-content">
          <div class="header-left">
            <el-button class="back-btn" text @click="$router.back()">
              <el-icon><ArrowLeft /></el-icon> 返回
            </el-button>
            <h1 class="page-title">
              <!-- <el-icon class="title-icon"><WarningFilled /></el-icon> -->
              空军疗伤室
            </h1>
            <p class="page-description">分享你的空军故事，获得AI温暖安慰</p>
          </div>
          <div class="header-stats">
            <div class="stat-card">
              <div class="stat-icon">✈️</div>
              <div class="stat-info">
                <div class="stat-number">{{ todayAirForce }}</div>
                <div class="stat-label">今日空军</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-info">
                <div class="stat-number">{{ airForceRate }}%</div>
                <div class="stat-label">空军率</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🔥</div>
              <div class="stat-info">
                <div class="stat-number">{{ maxStreak }}</div>
                <div class="stat-label">最长连空</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="container">
      <div class="content-wrapper">
        <!-- 空军打卡模块 -->
        <div class="checkin-section">
          <!-- 空军打卡卡片 -->
          <div class="checkin-card">
            <div class="card-header">
              <div class="header-icon">
                <el-icon><EditPen /></el-icon>
              </div>
              <div class="header-title">
                <h2>一键空军打卡</h2>
                <p>记录今天的空军经历，AI会为你送上温暖安慰</p>
              </div>
            </div>
            
            <div class="card-body">
              <div class="form-group">
                <label class="form-label">
                  <el-icon><ChatDotRound /></el-icon>
                  空军经历
                </label>
                <el-input
                  v-model="airForceContent"
                  type="textarea"
                  :rows="5"
                  placeholder="今天去钓鱼，一口都没有，完美空军！分享一下你的空军经历吧..."
                  maxlength="500"
                  show-word-limit
                  class="custom-textarea"
                />
              </div>

              <div class="form-group">
                <label class="form-label">
                  <el-icon><Picture /></el-icon>
                  现场照片（可选）
                </label>
                <el-upload
                  v-model:file-list="fileList"
                  action="#"
                  list-type="picture-card"
                  :auto-upload="false"
                  :on-change="handleFileChange"
                  :on-remove="handleRemove"
                  :on-preview="handlePreview"
                  :limit="3"
                  accept="image/*"
                  class="custom-uploader"
                  :disabled="uploadingImages"
                >
                  <div class="upload-trigger" v-if="fileList.length < 3 && !uploadingImages">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                    <span class="upload-text">上传照片</span>
                    <span class="upload-hint">{{ fileList.length }}/3</span>
                  </div>
                  <div class="upload-trigger" v-if="uploadingImages">
                    <el-icon class="upload-icon is-loading"><Loading /></el-icon>
                    <span class="upload-text">上传中...</span>
                  </div>
                </el-upload>
                <p class="upload-tip">
                  <el-icon><InfoFilled /></el-icon>
                  上传空军现场照片，让AI更好地安慰你（最多3张）
                </p>
              </div>

              <div class="form-actions">
                <el-button size="large" @click="resetForm">重置</el-button>
                <el-button 
                  type="danger" 
                  size="large" 
                  @click="submitAirForce"
                  :loading="submitting"
                  class="submit-btn"
                >
                  <el-icon><Check /></el-icon>
                  {{ submitting ? 'AI安慰生成中...' : '确认空军打卡' }}
                </el-button>
              </div>
            </div>
          </div>

          <!-- 打卡提示 -->
          <div class="tips-card">
            <div class="tips-header">
              <el-icon><InfoFilled /></el-icon>
              <span>打卡提示</span>
            </div>
            <ul class="tips-list">
              <li>真实记录空军经历，不要虚报</li>
              <li>上传现场照片可以让AI更好地安慰你</li>
              <li>每次打卡都会获得AI专属安慰语</li>
              <li>连续打卡可获得"空军司令"勋章</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片预览组件 -->
    <ImagePreview
      v-model:visible="previewVisible"
      :images="previewList"
      :initial-index="previewIndex"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  WarningFilled,
  ChatDotRound,
  ArrowLeft,
  EditPen,
  Plus,
  Loading,
  InfoFilled,
  Check,
  Picture,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import ImagePreview from '@/components/common/ImagePreview.vue'
import { uploadPostImage } from '@/api/file'
import { checkinAirForce, getAirForceStats } from '@/api/airforce'

const router = useRouter()

// 响应式数据
const airForceContent = ref('')
const fileList = ref([])
const submitting = ref(false)
const uploadingImages = ref(false)

// 统计数据
const todayAirForce = ref(0)
const airForceRate = ref(0)
const maxStreak = ref(0)

// 图片预览
const previewVisible = ref(false)
const previewList = ref([])
const previewIndex = ref(0)

// 处理文件上传
const handleFileChange = async (file) => {
  if (!file.raw) return
  
  const isImage = file.raw.type.startsWith('image/')
  if (!isImage) {
    ElMessage.warning('只能上传图片文件')
    return
  }
  
  const isLt10M = file.raw.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.warning('图片大小不能超过 10MB')
    return
  }
  
  uploadingImages.value = true
  try {
    const result = await uploadPostImage(file.raw)
    if (result) {
      file.url = result
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error('上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('图片上传失败')
  } finally {
    uploadingImages.value = false
  }
}

// 处理文件移除
const handleRemove = () => {
  console.log('文件移除')
}

// 处理图片预览
const handlePreview = (file) => {
  previewList.value = fileList.value
    .filter(f => f.url && !f.url.startsWith('blob:'))
    .map(f => f.url)
  previewIndex.value = fileList.value.findIndex(f => f === file)
  previewVisible.value = true
}

// 重置表单
const resetForm = () => {
  airForceContent.value = ''
  fileList.value = []
}

// 提交空军打卡
const submitAirForce = async () => {
  if (!airForceContent.value.trim()) {
    ElMessage.warning('请输入你的空军经历')
    return
  }

  submitting.value = true
  try {
    const submitData = {
      content: airForceContent.value,
      images: fileList.value
        .filter(file => file.url && !file.url.startsWith('blob:'))
        .map(file => file.url)
    }

    console.log('提交空军打卡:', submitData)

    const result = await checkinAirForce(submitData)
    console.log('打卡结果:', result)

    if (result) {
      ElMessage.success('空军打卡成功！AI正在为你生成安慰语...')

      fetchStats()

      resetForm()
    } else {
      ElMessage.error('打卡失败')
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error(error.message || '提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const result = await getAirForceStats()
    if (result) {
      todayAirForce.value = result.todayAirForce || 0
      airForceRate.value = result.airForceRate || 0
      maxStreak.value = result.maxStreak || 0
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchStats()
})
</script>

<style lang="scss" scoped>
.air-force-page {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding-bottom: 60px;
}

.page-header {
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: white;
  padding: 40px 0 60px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.5;
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 1;
  gap: 40px;
}

.header-left {
  flex: 1;
}

.back-btn {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  padding: 0;
  margin-bottom: 16px;

  &:hover {
    color: rgb(88, 88, 88);
  }
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .title-icon {
    font-size: 2rem;
  }
}

.page-description {
  font-size: 1.1rem;
  opacity: 0.9;
}

.header-stats {
  display: flex;
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);

  .stat-icon {
    font-size: 2rem;
  }

  .stat-info {
    .stat-number {
      font-size: 1.8rem;
      font-weight: 800;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.85rem;
      opacity: 0.9;
      margin-top: 4px;
    }
  }
}

.content-wrapper {
  display: flex;
  justify-content: center;
  margin-top: -30px;
  position: relative;
  z-index: 2;
}

.checkin-section {
  width: 85%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1200px;
}

.checkin-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  .card-header {
    background: linear-gradient(135deg, #fef2f2, #fee2e2);
    padding: 24px;
    display: flex;
    align-items: flex-start;
    gap: 16px;

    .header-icon {
      width: 48px;
      height: 48px;
      background: #ef4444;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .header-title {
      h2 {
        font-size: 1.25rem;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 4px;
      }

      p {
        font-size: 0.875rem;
        color: #6b7280;
      }
    }
  }

  .card-body {
    padding: 24px;
  }
}

.form-group {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;

  .el-icon {
    color: #ef4444;
  }
}

.custom-textarea {
  :deep(.el-textarea__inner) {
    border-radius: 12px;
    padding: 12px;
    resize: none;

    &:focus {
      border-color: #ef4444;
    }
  }
}

.custom-uploader {
  :deep(.el-upload--picture-card) {
    width: 100px;
    height: 100px;
    border: 2px dashed #e5e7eb;
    border-radius: 12px;
    transition: all 0.3s;

    &:hover {
      border-color: #ef4444;
      background: #fef2f2;
    }
  }

  :deep(.el-upload-list__item) {
    width: 100px;
    height: 100px;
    border-radius: 12px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;

  .upload-icon {
    font-size: 24px;
    margin-bottom: 4px;
  }

  .upload-text {
    font-size: 12px;
  }

  .upload-hint {
    font-size: 11px;
    color: #d1d5db;
    margin-top: 2px;
  }
}

.upload-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 12px;
  color: #9ca3af;

  .el-icon {
    color: #ef4444;
  }
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;

  .el-button {
    flex: 1;
  }

  .submit-btn {
    background: linear-gradient(135deg, #ef4444, #f87171);
    border: none;

    &:hover {
      background: linear-gradient(135deg, #dc2626, #ef4444);
    }
  }
}

.tips-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  .tips-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 12px;

    .el-icon {
      color: #f59e0b;
    }
  }

  .tips-list {
    margin: 0;
    padding-left: 20px;

    li {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 8px;
      line-height: 1.5;

      &:last-child {
        margin-bottom: 0;
      }

      &::marker {
        color: #ef4444;
      }
    }
  }
}

.right-section {
  .posts-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;

    .card-header {
      padding: 20px 24px;
      border-bottom: 1px solid #f3f4f6;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        font-size: 1.125rem;
        font-weight: 700;
        color: #1f2937;
        display: flex;
        align-items: center;
        gap: 8px;

        .el-icon {
          color: #ef4444;
        }
      }
    }
  }
}

.posts-list {
  padding: 0 24px;
}

.post-item {
  padding: 24px 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .user-details {
      display: flex;
      flex-direction: column;

      .username {
        font-weight: 600;
        color: #1f2937;
        font-size: 0.95rem;
      }

      .post-time {
        font-size: 0.8rem;
        color: #9ca3af;
        margin-top: 2px;
      }
    }
  }

  .air-force-tag {
    font-weight: 600;
  }
}

.post-content {
  .post-text {
    font-size: 0.95rem;
    line-height: 1.7;
    color: #374151;
    margin-bottom: 12px;
  }

  .post-images {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;

    .image-item {
      width: 120px;
      height: 120px;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      position: relative;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
      }

      &:hover img {
        transform: scale(1.05);
      }

      .image-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.2rem;
        font-weight: 600;
      }
    }
  }
}

.ai-comfort {
  display: flex;
  gap: 12px;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;

  .ai-avatar {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #10b981, #34d399);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  .ai-content {
    flex: 1;

    .ai-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;

      .ai-name {
        font-weight: 600;
        color: #059669;
        font-size: 0.9rem;
      }
    }

    .ai-text {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.6;
      color: #374151;
    }
  }
}

.post-footer {
  .post-actions {
    display: flex;
    gap: 8px;

    .el-button {
      color: #6b7280;

      &:hover {
        color: #ef4444;
      }

      &.el-button--danger {
        color: #ef4444;
      }
    }
  }
}

.comment-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;

  .comment-input {
    margin-bottom: 12px;
  }

  .comment-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .comment-item {
      display: flex;
      gap: 10px;
      align-items: flex-start;

      .comment-content {
        flex: 1;
        background: #f9fafb;
        padding: 10px 14px;
        border-radius: 12px;

        .comment-user {
          font-weight: 600;
          color: #374151;
          font-size: 0.85rem;
          margin-right: 8px;
        }

        .comment-text {
          color: #6b7280;
          font-size: 0.85rem;
          line-height: 1.5;
        }
      }
    }
  }
}

.load-more {
  padding: 20px;
  text-align: center;

  .no-more {
    color: #9ca3af;
    font-size: 0.875rem;
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }

  .header-stats {
    display: none;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 30px 0 40px;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .content-wrapper {
    margin-top: -20px;
  }

  .checkin-card .card-header,
  .checkin-card .card-body {
    padding: 16px;
  }

  .post-images .image-item {
    width: 100px;
    height: 100px;
  }
}
</style>
