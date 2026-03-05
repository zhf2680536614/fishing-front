<template>
  <el-dialog
    v-model="dialogVisible"
    title=""
    width="680px"
    :close-on-click-modal="false"
    @close="handleClose"
    class="publish-dialog"
  >
    <!-- 头部 -->
    <div class="dialog-header">
      <div class="header-left">
        <h2 class="dialog-title">发布闲置装备</h2>
        <p class="dialog-subtitle">让你的闲置装备找到新主人</p>
      </div>
      <div class="header-icon">
        <el-icon><ShoppingBag /></el-icon>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="dialog-content">
      <!-- 标题 -->
      <div class="form-group">
        <label class="form-label">
          <span class="label-icon">✦</span>
          商品标题
        </label>
        <input
          v-model="form.title"
          type="text"
          class="custom-input"
          placeholder="请输入商品标题，如：9成新达亿瓦波纹鲤4.5米"
          maxlength="100"
        />
        <div class="input-hint">{{ form.title.length }}/100</div>
      </div>

      <!-- 分类和价格 -->
      <div class="form-row">
        <div class="form-group half">
          <label class="form-label">
            <span class="label-icon">✦</span>
            装备分类
          </label>
          <div class="select-wrapper">
            <select v-model="form.categoryDictItemCode" class="custom-select">
              <option value="">请选择分类</option>
              <option v-for="item in gearCategories" :key="item.itemCode" :value="item.itemCode">{{ item.itemName }}</option>
            </select>
            <el-icon class="select-arrow"><ArrowDown /></el-icon>
          </div>
        </div>

        <div class="form-group half">
          <label class="form-label">
            <span class="label-icon">✦</span>
            商品价格
          </label>
          <div class="price-input-wrapper">
            <span class="currency">¥</span>
            <input
              v-model.number="form.price"
              type="number"
              class="custom-input price-input"
              placeholder="0"
              min="0"
            />
          </div>
        </div>
      </div>

      <!-- 原价 -->
      <div class="form-group">
        <label class="form-label optional">
          <span class="label-icon">✦</span>
          原价（选填）
        </label>
        <div class="price-input-wrapper">
          <span class="currency">¥</span>
          <input
            v-model.number="form.originalPrice"
            type="number"
            class="custom-input price-input"
            placeholder="0"
            min="0"
          />
          <span class="price-hint">填写原价可显示折扣标签</span>
        </div>
      </div>

      <!-- 描述 -->
      <div class="form-group">
        <label class="form-label">
          <span class="label-icon">✦</span>
          商品描述
        </label>
        <textarea
          v-model="form.description"
          class="custom-textarea"
          placeholder="请描述商品的新旧程度、使用情况、配件信息等，让买家更了解商品"
          maxlength="500"
        ></textarea>
        <div class="input-hint">{{ form.description.length }}/500</div>
      </div>

      <!-- 图片上传 -->
      <div class="form-group">
        <label class="form-label">
          <span class="label-icon">✦</span>
          商品图片
        </label>
        <div class="upload-section">
          <div class="upload-grid">
            <div
              v-for="(img, index) in imageList"
              :key="index"
              class="upload-image-item"
            >
              <img :src="img" alt="商品图片" />
              <div class="image-actions">
                <span class="delete-btn" @click="handleRemoveImage(index)">
                  <el-icon><Delete /></el-icon>
                </span>
              </div>
              <span v-if="index === 0" class="cover-tag">封面</span>
            </div>
            
            <div v-if="imageList.length < 9" class="upload-trigger" @click="handleSelectImage">
              <div class="trigger-content">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <span>上传图片</span>
                <span class="upload-count">{{ imageList.length }}/9</span>
              </div>
            </div>
          </div>
          <p class="upload-tip">建议上传真实实物照片，前一张将作为封面图</p>
        </div>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          multiple
          style="display: none"
          @change="handleFileChange"
        />
      </div>
    </div>

    <!-- 底部 -->
    <template #footer>
      <div class="dialog-footer">
        <div class="footer-hint">
          <span class="hint-icon">💡</span>
          完善信息有助于提高曝光率
        </div>
        <div class="footer-actions">
          <el-button class="cancel-btn" @click="handleClose">取消</el-button>
          <el-button 
            type="primary" 
            class="submit-btn" 
            :loading="submitting" 
            @click="handleSubmit"
          >
            <el-icon v-if="!submitting"><Check /></el-icon>
            发布闲置
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, ArrowDown, ShoppingBag, Check } from '@element-plus/icons-vue'
import * as gearApi from '@/api/gear'
import { uploadPostImages } from '@/api/file'
import { getDictItems } from '@/api/dict'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const fileInputRef = ref(null)
const submitting = ref(false)
const imageUrls = ref([])
const gearCategories = ref([]) // 装备分类列表

const form = ref({
  title: '',
  categoryDictTypeCode: 'gear_category',
  categoryDictItemCode: '',
  statusDictTypeCode: 'gear_market_status',
  statusDictItemCode: 'on_sale',
  price: null,
  originalPrice: null,
  description: '',
  images: []
})

const imageList = computed(() => {
  return imageUrls.value
})

watch(() => props.visible, (val) => {
  if (val) {
    form.value = {
      title: '',
      categoryDictTypeCode: 'gear_category',
      categoryDictItemCode: '',
      statusDictTypeCode: 'gear_market_status',
      statusDictItemCode: 'on_sale',
      price: null,
      originalPrice: null,
      description: '',
      images: []
    }
    imageUrls.value = []
  }
})

// 获取装备分类
const fetchGearCategories = async () => {
  try {
    const data = await getDictItems('gear_category')
    gearCategories.value = data
  } catch (error) {
    console.error('获取装备分类失败:', error)
    gearCategories.value = []
  }
}

// 组件挂载时获取装备分类
onMounted(() => {
  fetchGearCategories()
})

const handleSelectImage = () => {
  fileInputRef.value?.click()
}

const handleFileChange = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  const remaining = 9 - imageUrls.value.length
  const filesToUpload = Array.from(files).slice(0, remaining)

  if (filesToUpload.length === 0) {
    ElMessage.warning('已达到最大上传数量')
    return
  }

  try {
    const response = await uploadPostImages(filesToUpload)
    const urls = Array.isArray(response) ? response : [response]
    imageUrls.value = [...imageUrls.value, ...urls]
    form.value.images = [...imageUrls.value]
  } catch (error) {
    ElMessage.error('图片上传失败')
  }

  event.target.value = ''
}

const handleRemoveImage = (index) => {
  imageUrls.value.splice(index, 1)
  form.value.images = [...imageUrls.value]
}

const handleClose = () => {
  dialogVisible.value = false
}

const handleSubmit = async () => {
  if (!form.value.title.trim()) {
    ElMessage.warning('请输入商品标题')
    return
  }
  if (!form.value.categoryDictItemCode) {
    ElMessage.warning('请选择装备分类')
    return
  }
  if (!form.value.price || form.value.price <= 0) {
    ElMessage.warning('请输入商品价格')
    return
  }
  if (!form.value.description.trim()) {
    ElMessage.warning('请输入商品描述')
    return
  }
  if (form.value.images.length === 0) {
    ElMessage.warning('请至少上传一张商品图片')
    return
  }

  submitting.value = true
  try {
    const data = {
      title: form.value.title,
      categoryDictTypeCode: form.value.categoryDictTypeCode,
      categoryDictItemCode: form.value.categoryDictItemCode,
      statusDictTypeCode: form.value.statusDictTypeCode,
      statusDictItemCode: form.value.statusDictItemCode,
      price: form.value.price,
      originalPrice: form.value.originalPrice,
      description: form.value.description,
      images: form.value.images
    }
    await gearApi.createGearMarket(data)
    ElMessage.success('发布成功')
    emit('success')
    handleClose()
  } catch (error) {
    ElMessage.error(error.message || '发布失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss">
.publish-dialog {
  .el-dialog__header {
    padding: 0;
    margin: 0;
  }
  
  .el-dialog__body {
    padding: 0;
  }
  
  .el-dialog__footer {
    padding: 0;
    border-top: 1px solid #f0f0f0;
  }
}
</style>

<style lang="scss" scoped>
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px 12px 0 0;
  color: white;

  .header-left {
    .dialog-title {
      font-size: 1.4rem;
      font-weight: 700;
      margin: 0 0 6px 0;
    }

    .dialog-subtitle {
      font-size: 0.9rem;
      opacity: 0.9;
      margin: 0;
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
  min-height: 100px;
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

.price-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;

  .currency {
    position: absolute;
    left: 14px;
    color: #f56c6c;
    font-weight: 600;
    font-size: 1rem;
  }

  .price-input {
    padding-left: 28px;
  }

  .price-hint {
    position: absolute;
    right: 14px;
    font-size: 0.75rem;
    color: #c0c4cc;
  }
}

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
        color: #667eea;
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
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.05);
    }
  }

  .upload-tip {
    margin-top: 10px;
    font-size: 0.8rem;
    color: #c0c4cc;
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
</style>
