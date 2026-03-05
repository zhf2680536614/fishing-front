<template>
  <div class="community-post-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="container">
        <div class="header-content">
          <div class="header-left">
            <el-button class="back-btn" text @click="$router.back()">
              <el-icon><ArrowLeft /></el-icon> 返回
            </el-button>
            <h1 class="page-title">发布战报</h1>
            <p class="page-description">分享你的钓鱼收获，与钓友们一起交流</p>
          </div>
          <div class="header-decoration">
            <el-icon class="decoration-icon"><Trophy /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 发布表单 -->
    <div class="container">
      <div class="form-wrapper">
        <!-- 基本信息卡片 -->
        <div class="post-form-card">
          <div class="form-section-title">
            <el-icon><EditPen /></el-icon>
            <span>基本信息</span>
          </div>

          <el-form :model="formData" label-position="top" class="custom-form">
            <!-- 标题 -->
            <el-form-item label="战报标题">
              <el-input
                v-model="formData.title"
                placeholder="给你的战报起个响亮的标题，比如：米级翘嘴上岸！"
                size="large"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>

            <!-- 鱼种和重量 -->
            <div class="form-row">
              <el-form-item label="鱼种" class="form-item-half">
                <el-select
                  v-model="formData.fishSpeciesDictItemCode"
                  placeholder="选择鱼种"
                  size="large"
                  class="full-width"
                  :loading="loadingFishSpecies"
                >
                  <el-option
                    v-for="fish in fishSpeciesList"
                    :key="fish.itemCode"
                    :label="fish.itemName"
                    :value="fish.itemCode"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="重量（斤）" class="form-item-half">
                <el-input-number
                  v-model="formData.fishWeight"
                  :min="0"
                  :max="500"
                  :step="0.1"
                  :precision="1"
                  size="large"
                  class="full-width"
                  placeholder="0.0"
                />
              </el-form-item>
            </div>

            <!-- 钓点 -->
            <el-form-item label="钓点位置">
              <el-input
                v-model="formData.address"
                placeholder="在哪里钓到的？例如：西湖公园东侧"
                size="large"
              >
                <template #prefix>
                  <el-icon><Location /></el-icon>
                </template>
              </el-input>
              <!-- 地图选择器 -->
              <div class="map-selector-wrapper">
                <MapSelector
                  height="300px"
                  @select-address="handleSelectAddress"
                />
              </div>
            </el-form-item>

            <!-- 内容 -->
            <el-form-item label="详细内容">
              <el-input
                v-model="formData.content"
                type="textarea"
                :rows="5"
                placeholder="分享你的钓鱼心得：用了什么饵料？什么钓法？天气如何？"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <!-- 图片上传 -->
            <el-form-item label="上传图片">
              <div class="uploader-wrapper">
                <el-upload
                  v-model:file-list="fileList"
                  action="#"
                  list-type="picture-card"
                  :auto-upload="false"
                  :on-change="handleFileChange"
                  :on-remove="handleRemove"
                  :on-preview="handlePreview"
                  :limit="5"
                  accept="image/*"
                  class="custom-uploader"
                  :disabled="uploadingImages"
                >
                  <div class="upload-trigger" v-if="fileList.length < 5 && !uploadingImages">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                    <span class="upload-text">上传图片</span>
                    <span class="upload-hint">{{ fileList.length }}/5</span>
                  </div>
                  <div class="upload-trigger" v-if="uploadingImages">
                    <el-icon class="upload-icon is-loading"><Loading /></el-icon>
                    <span class="upload-text">上传中...</span>
                  </div>
                </el-upload>
                <p class="upload-tip">
                  <el-icon><InfoFilled /></el-icon>
                  支持 JPG、PNG 格式，单张不超过 10MB，最多上传 5 张图片
                </p>
              </div>
            </el-form-item>

            <!-- 图片预览组件 -->
            <ImagePreview
              v-model:visible="previewVisible"
              :images="previewList"
              :initial-index="previewIndex"
              @close="previewVisible = false"
            />
          </el-form>
        </div>

        <!-- 发布提示与提交 -->
        <div class="submit-section">
          <div class="submit-card">
            <div class="submit-tips">
              <h4><el-icon><InfoFilled /></el-icon> 发布提示</h4>
              <ul>
                <li>请确保图片清晰，能看清鱼获</li>
                <li>填写真实重量，不要虚报</li>
                <li>分享钓点经验，帮助更多钓友</li>
              </ul>
            </div>
            <div class="submit-actions">
              <el-button size="large" @click="$router.back()">取消</el-button>
              <el-button type="primary" size="large" @click="submitForm" :loading="submitting">
                <el-icon><Promotion /></el-icon> 发布战报
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Plus,
  ArrowLeft,
  Trophy,
  EditPen,
  Location,
  InfoFilled,
  Promotion,
  Loading,
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createPost } from '@/api/post'
import { uploadPostImage } from '@/api/file'
import { getProfile } from '@/api/user'
import { getDictItems } from '@/api/dict'
import ImagePreview from '@/components/common/ImagePreview.vue'
import { useUserStore } from '@/stores/user'
import MapSelector from '@/components/common/MapSelector.vue'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const formData = ref({
  title: '',
  content: '',
  typeDictTypeCode: 'post_type',
  typeDictItemCode: 'catch_report',
  fishSpeciesDictTypeCode: 'fish_species',
  fishSpeciesDictItemCode: '',
  fishWeight: 0,
  address: '',
  statusDictTypeCode: 'common_status',
  statusDictItemCode: 'enabled',
  images: []
})

// 鱼种列表
const fishSpeciesList = ref([])
const loadingFishSpecies = ref(false)

// 处理地图选择地址
const handleSelectAddress = (address) => {
  // 将详细地址填充到地址输入框
  formData.value.address = address.detailAddress || ''
  ElMessage.success('已选择位置：' + address.city + address.district)
}

// 上传文件列表
const fileList = ref([])

const submitting = ref(false)
const uploadingImages = ref(false)

// 图片预览相关
const previewVisible = ref(false)
const previewList = ref([])
const previewIndex = ref(0)

// 加载鱼种字典
const loadFishSpecies = async () => {
  loadingFishSpecies.value = true
  try {
    const response = await getDictItems('fish_species')
    fishSpeciesList.value = response
    console.log('鱼种列表:', fishSpeciesList.value)
  } catch (error) {
    console.error('获取鱼种列表失败:', error)
    ElMessage.error('获取鱼种列表失败')
  } finally {
    loadingFishSpecies.value = false
  }
}

// 处理文件上传 - 上传到 MinIO
const handleFileChange = async (file) => {
  console.log('文件变更:', file)
  if (!file.raw) return

  // 检查文件类型
  const isImage = file.raw.type.startsWith('image/')
  if (!isImage) {
    ElMessage.warning('只能上传图片文件')
    return
  }

  // 检查文件大小（10MB）
  const isLt10M = file.raw.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.warning('图片大小不能超过 10MB')
    return
  }

  uploadingImages.value = true
  try {
    // 上传到 MinIO
    const url = await uploadPostImage(file.raw)
    console.log('上传结果:', url)

    if (url) {
      // 设置文件的 URL 为 MinIO 返回的 URL
      file.url = url
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
  console.log('预览图片:', file)
  console.log('图片URL:', file.url)
  
  previewList.value = fileList.value
    .filter(f => f.url && !f.url.startsWith('blob:'))
    .map(f => f.url)
  previewIndex.value = fileList.value.findIndex(f => f === file)
  
  console.log('预览列表:', previewList.value)
  console.log('当前索引:', previewIndex.value)
  
  // 显示预览组件
  previewVisible.value = true
}

// 提交表单
const submitForm = async () => {
  // 表单验证
  if (!formData.value.title.trim()) {
    ElMessage.warning('请输入战报标题')
    return
  }
  if (!formData.value.fishSpeciesDictItemCode) {
    ElMessage.warning('请选择鱼种')
    return
  }
  if (formData.value.fishWeight <= 0) {
    ElMessage.warning('请输入正确的重量')
    return
  }

  submitting.value = true

  try {
    // 准备提交数据
    const submitData = {
      title: formData.value.title,
      content: formData.value.content,
      typeDictTypeCode: formData.value.typeDictTypeCode,
      typeDictItemCode: formData.value.typeDictItemCode,
      fishSpeciesDictTypeCode: formData.value.fishSpeciesDictTypeCode,
      fishSpeciesDictItemCode: formData.value.fishSpeciesDictItemCode,
      fishWeight: formData.value.fishWeight,
      address: formData.value.address,
      aiAuditStatusDictTypeCode: 'ai_audit_status',
      aiAuditStatusDictItemCode: 'normal',
      statusDictTypeCode: formData.value.statusDictTypeCode,
      statusDictItemCode: formData.value.statusDictItemCode,
      // 提取图片URL列表（只取已上传成功的）
      images: fileList.value
        .filter(file => file.url && !file.url.startsWith('blob:'))
        .map(file => file.url)
    }

    console.log('提交数据:', submitData)

    // 调用后端接口
    const result = await createPost(submitData)
    console.log('发布成功:', result)

    ElMessage.success('战报发布成功！经验值已增加！')
    
    // 重新获取用户信息，更新经验值
    if (userStore.userInfo?.id) {
      try {
        const updatedUserInfo = await getProfile(userStore.userInfo.id)
        // 合并更新用户信息
        userStore.setUserInfo({
          ...userStore.userInfo,
          ...updatedUserInfo
        })
      } catch (error) {
        console.error('更新用户信息失败:', error)
      }
    }
    
    router.push('/community')
  } catch (error) {
    console.error('发布失败:', error)
    ElMessage.error(error.message || '发布失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 页面加载时获取鱼种列表
onMounted(() => {
  loadFishSpecies()
})
</script>

<style lang="scss" scoped>
.community-post-page {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding-bottom: 60px;
}

.page-header {
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
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
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-description {
  font-size: 1.1rem;
  opacity: 0.9;
}

.header-decoration {
  .decoration-icon {
    font-size: 80px;
    opacity: 0.2;
    transform: rotate(-15deg);
  }
}

.form-wrapper {
  width: 85%;
  margin: -30px auto 0;
  position: relative;
  z-index: 2;
}

.post-form-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.form-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-light);

  .el-icon {
    color: var(--primary-color);
    font-size: 1.3rem;
  }
}

.custom-form {
  .el-form-item {
    margin-bottom: 24px;

    :deep(.el-form-item__label) {
      font-weight: 500;
      color: var(--text-primary);
      padding-bottom: 8px;
    }
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-item-half {
  margin-bottom: 0;
}

.full-width {
  width: 100%;
}

.map-selector-wrapper {
  margin-top: 12px;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.uploader-wrapper {
  .custom-uploader {
    :deep(.el-upload--picture-card) {
      width: 120px;
      height: 120px;
      border: 2px dashed var(--border-color);
      border-radius: 12px;
      transition: all 0.3s;

      &:hover {
        border-color: var(--primary-color);
        background: var(--bg-secondary);
      }
    }

    :deep(.el-upload-list__item) {
      width: 120px;
      height: 120px;
      border-radius: 12px;
      overflow: hidden;

      .el-image {
        width: 100%;
        height: 100%;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }

  .upload-trigger {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-secondary);

    .upload-icon {
      font-size: 28px;
      margin-bottom: 8px;
    }

    .upload-text {
      font-size: 13px;
      margin-bottom: 4px;
    }

    .upload-hint {
      font-size: 12px;
      color: var(--text-light);
    }
  }

  .upload-tip {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 12px;
    font-size: 12px;
    color: var(--text-secondary);

    .el-icon {
      color: var(--primary-color);
    }
  }
}

.submit-section {
  margin-top: 24px;
}

.submit-card {
  background: white;
  border-radius: 16px;
  padding: 24px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.submit-tips {
  h4 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--text-primary);
    margin-bottom: 12px;

    .el-icon {
      color: var(--primary-color);
    }
  }

  ul {
    margin: 0;
    padding-left: 20px;

    li {
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 6px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.submit-actions {
  display: flex;
  gap: 12px;

  .el-button {
    min-width: 100px;

    &:last-child {
      min-width: 140px;
    }
  }
}

/* 响应式设计 */
@media (max-width: 992px) {
  .form-wrapper {
    width: 95%;
  }

  .submit-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .submit-actions {
    width: 100%;

    .el-button {
      flex: 1;
    }
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.8rem;
  }

  .header-decoration {
    display: none;
  }

  .post-form-card {
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .submit-card {
    padding: 20px;
  }

  .submit-actions {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}
</style>
