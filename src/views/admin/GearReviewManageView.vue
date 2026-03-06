<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Edit, Delete, View, Picture, Star } from '@element-plus/icons-vue'
import { getGearReviewPage, getGearReviewManageById, updateGearReviewManage, deleteGearReviewManage } from '@/api/gear'
import { getDictItems } from '@/api/dict'
import ImagePreview from '@/components/common/ImagePreview.vue'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const queryForm = ref({
  pageNum: 1,
  pageSize: 10,
  title: '',
  gearName: '',
  categoryDictItemCode: '',
  statusDictItemCode: ''
})

const categoryOptions = ref([])
const statusOptions = ref([])

const editDialogVisible = ref(false)
const viewDialogVisible = ref(false)
const editFormRef = ref(null)
const viewForm = ref({})
const editForm = ref({
  id: null,
  title: '',
  content: '',
  rating: 5.0,
  gearName: '',
  categoryDictTypeCode: 'gear_category',
  categoryDictItemCode: '',
  statusDictTypeCode: 'gear_review_status',
  statusDictItemCode: '',
  images: []
})

const editFormRules = {
  title: [
    { required: true, message: '请输入测评标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入测评内容', trigger: 'blur' }
  ],
  gearName: [
    { required: true, message: '请输入装备名称', trigger: 'blur' }
  ],
  rating: [
    { required: true, message: '请输入评分', trigger: 'change' }
  ],
  categoryDictItemCode: [
    { required: true, message: '请选择装备分类', trigger: 'change' }
  ],
  statusDictItemCode: [
    { required: true, message: '请选择测评状态', trigger: 'change' }
  ]
}

const previewVisible = ref(false)
const previewImages = ref([])

const fetchGearReviewList = async () => {
  loading.value = true
  try {
    const params = { ...queryForm.value }
    if (!params.title) delete params.title
    if (!params.gearName) delete params.gearName
    if (!params.categoryDictItemCode) delete params.categoryDictItemCode
    if (!params.statusDictItemCode) delete params.statusDictItemCode

    const result = await getGearReviewPage(params)
    tableData.value = result.list || []
    total.value = result.total || 0
  } catch (error) {
    console.error('获取装备测评列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryForm.value.pageNum = 1
  fetchGearReviewList()
}

const handleReset = () => {
  queryForm.value = {
    pageNum: 1,
    pageSize: 10,
    title: '',
    gearName: '',
    categoryDictItemCode: '',
    statusDictItemCode: ''
  }
  fetchGearReviewList()
}

const handleSizeChange = (val) => {
  queryForm.value.pageSize = val
  fetchGearReviewList()
}

const handleCurrentChange = (val) => {
  queryForm.value.pageNum = val
  fetchGearReviewList()
}

const handleView = async (row) => {
  try {
    const review = await getGearReviewManageById(row.id)
    viewForm.value = review
    viewDialogVisible.value = true
  } catch (error) {
    console.error('获取装备测评详情失败:', error)
  }
}

const handleEdit = async (row) => {
  try {
    const review = await getGearReviewManageById(row.id)
    editForm.value = {
      id: review.id,
      title: review.title,
      content: review.content,
      rating: review.rating,
      gearName: review.gearName,
      categoryDictTypeCode: review.categoryDictTypeCode || 'gear_category',
      categoryDictItemCode: review.categoryDictItemCode,
      statusDictTypeCode: review.statusDictTypeCode || 'gear_review_status',
      statusDictItemCode: review.statusDictItemCode,
      images: review.images || []
    }
    editDialogVisible.value = true
  } catch (error) {
    console.error('获取装备测评详情失败:', error)
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除测评 "${row.title}" 吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteGearReviewManage(row.id)
      ElMessage.success('删除成功')
      fetchGearReviewList()
    } catch (error) {
      console.error('删除装备测评失败:', error)
    }
  }).catch(() => {})
}

const handleImagePreview = (images, index = 0) => {
  if (images && images.length > 0) {
    previewImages.value = images
    previewVisible.value = true
  }
}

const handleRemoveImage = (index) => {
  editForm.value.images.splice(index, 1)
}

const submitEdit = async () => {
  if (!editFormRef.value) return

  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = { ...editForm.value }
        delete data.id
        await updateGearReviewManage(editForm.value.id, data)
        ElMessage.success('更新成功')
        editDialogVisible.value = false
        fetchGearReviewList()
      } catch (error) {
        console.error('更新装备测评失败:', error)
      }
    }
  })
}

const cancelEdit = () => {
  editDialogVisible.value = false
  setTimeout(() => {
    editFormRef.value?.resetFields()
  }, 300)
}

const getCategoryName = (code) => {
  const option = categoryOptions.value.find(opt => opt.value === code)
  return option ? option.label : code
}

const getStatusName = (code) => {
  const option = statusOptions.value.find(opt => opt.value === code)
  return option ? option.label : code
}

const getStatusType = (code) => {
  const option = statusOptions.value.find(opt => opt.value === code)
  return option?.type || 'info'
}

const getRatingColor = (rating) => {
  if (rating >= 4.5) return '#67C23A'
  if (rating >= 3.5) return '#E6A23C'
  if (rating >= 2.5) return '#F56C6C'
  return '#909399'
}

const fetchDictOptions = async () => {
  try {
    const categoryItems = await getDictItems('gear_category')
    categoryOptions.value = categoryItems.map(item => ({
      label: item.itemName,
      value: item.itemCode
    }))
  } catch (error) {
    console.error('获取装备分类字典失败:', error)
  }

  try {
    const statusItems = await getDictItems('gear_review_status')
    statusOptions.value = statusItems.map(item => ({
      label: item.itemName,
      value: item.itemCode,
      type: item.itemCode === 'published' ? 'success' : item.itemCode === 'pending' ? 'warning' : 'danger'
    }))
  } catch (error) {
    console.error('获取测评状态字典失败:', error)
  }
}

onMounted(() => {
  fetchDictOptions()
  fetchGearReviewList()
})
</script>

<style scoped>
.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-container {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.author-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70px;
}
</style>

<template>
  <div class="gear-review-manage-view">
    <!-- 顶部搜索卡片 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryForm" inline class="search-form" @keyup.enter="handleSearch">
        <el-form-item label="测评标题">
          <el-input v-model="queryForm.title" placeholder="请输入测评标题" clearable />
        </el-form-item>
        <el-form-item label="装备名称">
          <el-input v-model="queryForm.gearName" placeholder="请输入装备名称" clearable />
        </el-form-item>
        <el-form-item label="装备分类" style="width: 200px;">
          <el-select v-model="queryForm.categoryDictItemCode" placeholder="请选择分类" clearable class="w-150">
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="测评状态" style="width: 200px;">
          <el-select v-model="queryForm.statusDictItemCode" placeholder="请选择状态" clearable class="w-150">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="action-buttons">
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格内容卡片 -->
    <el-card class="table-card" shadow="never">
      <div class="table-toolbar">
        <span class="toolbar-title">装备测评列表</span>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        :header-cell-style="{ background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-primary)' }"
      >
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="title" label="测评标题" min-width="150" show-overflow-tooltip />
        <el-table-column prop="gearName" label="装备名称" width="120" show-overflow-tooltip />
        <el-table-column label="作者" width="120" align="center">
          <template #default="{ row }">
            <div class="author-info">
              <!-- <div class="avatar-container">
                <el-avatar v-if="row.userAvatar" :src="row.userAvatar" :size="32" />
                <el-avatar v-else :size="32" :icon="Picture" />
              </div> -->
              <span class="author-name" :title="row.userNickname">{{ row.userNickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="100" align="center">
          <template #default="{ row }">
            <el-tag effect="plain" type="info">{{ row.categoryDictItemName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="评分" width="100" align="center">
          <template #default="{ row }">
            <div class="rating-cell">
              <el-icon :style="{ color: getRatingColor(row.rating) }"><Star /></el-icon>
              <span class="rating-score" :style="{ color: getRatingColor(row.rating) }">{{ row.rating }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.statusDictItemCode)" effect="light">
              {{ row.statusDictItemName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="80" align="center">
          <template #default="{ row }">
            <el-button v-if="row.images && row.images.length > 0" type="primary" link @click="handleImagePreview(row.images)">
              <el-icon><Picture /></el-icon> {{ row.images.length }}张
            </el-button>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="170" align="center" />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryForm.pageNum"
          v-model:page-size="queryForm.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 查看详情弹窗 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="装备测评详情"
      width="700px"
      destroy-on-close
    >
      <div class="review-detail">
        <div class="detail-header">
          <h3 class="review-title">{{ viewForm.title }}</h3>
          <div class="review-meta">
            <span class="meta-item">
              <el-avatar v-if="viewForm.avatar" :src="viewForm.avatar" :size="24" />
              <el-avatar v-else :size="24" :icon="Picture" />
              {{ viewForm.nickname }}
            </span>
            <span class="meta-item">{{ viewForm.createTime }}</span>
            <el-tag effect="plain" size="small">{{ getCategoryName(viewForm.categoryDictItemCode) }}</el-tag>
          </div>
        </div>
        <div class="detail-content">
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">装备名称：</span>
              <span class="info-value">{{ viewForm.gearName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">评分：</span>
              <div class="rating-display">
                <el-rate :model-value="viewForm.rating" disabled show-score :colors="['#99A9BF', '#F7BA2A', '#FF9900']" />
              </div>
            </div>
          </div>
          <p class="content-text">{{ viewForm.content }}</p>
          <div v-if="viewForm.images && viewForm.images.length > 0" class="image-list">
            <img
              v-for="(img, index) in viewForm.images"
              :key="index"
              :src="img"
              class="preview-img"
              @click="handleImagePreview(viewForm.images, index)"
            />
          </div>
        </div>
        <div v-if="viewForm.aiAnalysis" class="detail-footer">
          <div class="ai-analysis">
            <h4 class="analysis-title">AI分析结果</h4>
            <div class="analysis-content">
              <div class="analysis-item">
                <span class="item-label">好评率：</span>
                <el-progress :percentage="viewForm.aiAnalysis.goodRate || 0" :color="viewForm.aiAnalysis.goodRate > 50 ? '#67C23A' : '#F56C6C'" />
              </div>
              <div class="analysis-item">
                <span class="item-label">关键词：</span>
                <el-tag v-for="keyword in (viewForm.aiAnalysis.keywords || [])" :key="keyword" size="small" class="keyword-tag">
                  {{ keyword }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑装备测评"
      width="650px"
      @close="cancelEdit"
      destroy-on-close
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="100px"
        class="edit-form"
      >
        <el-form-item label="测评标题" prop="title">
          <el-input v-model="editForm.title" placeholder="请输入测评标题" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="装备名称" prop="gearName">
          <el-input v-model="editForm.gearName" placeholder="请输入装备名称" maxlength="100" show-word-limit />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="装备分类" prop="categoryDictItemCode">
              <el-select v-model="editForm.categoryDictItemCode" placeholder="请选择分类" class="w-full">
                <el-option
                  v-for="item in categoryOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="测评状态" prop="statusDictItemCode">
              <el-select v-model="editForm.statusDictItemCode" placeholder="请选择状态" class="w-full">
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="评分" prop="rating">
          <el-rate v-model="editForm.rating" allow-half show-score :max="5" />
        </el-form-item>
        <el-form-item label="测评内容" prop="content">
          <el-input
            v-model="editForm.content"
            type="textarea"
            :rows="5"
            placeholder="请输入测评内容"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="图片">
          <div class="image-list-edit">
            <div v-for="(img, index) in editForm.images" :key="index" class="image-item">
              <img :src="img" class="thumbnail" @click="handleImagePreview(editForm.images, index)" />
              <el-button type="danger" link class="remove-btn" @click="handleRemoveImage(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelEdit">取消</el-button>
          <el-button type="primary" @click="submitEdit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 图片预览组件 -->
    <ImagePreview
      v-model:visible="previewVisible"
      :images="previewImages"
      :initial-index="0"
      @close="previewVisible = false"
    />
  </div>
</template>

<style lang="scss" scoped>
.gear-review-manage-view {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;
    
    .search-form {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      
      .el-form-item {
        margin-bottom: 0;
      }
      
      .action-buttons {
        margin-left: auto;
      }
    }
  }

  .table-card {
    .table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      
      .toolbar-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .author-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .author-name {
        font-size: 13px;
        color: var(--el-text-color-primary);
      }
    }

    .rating-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;

      .rating-score {
        font-weight: 600;
        font-size: 14px;
      }
    }

    .text-gray {
      color: var(--el-text-color-placeholder);
    }

    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .text-placeholder {
      color: var(--el-text-color-secondary);
      font-size: 12px;
    }
  }

  .review-detail {
    .detail-header {
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--el-border-color-light);

      .review-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 12px 0;
      }

      .review-meta {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 13px;
        color: var(--el-text-color-secondary);

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
      }
    }

    .detail-content {
      margin-bottom: 20px;

      .info-section {
        background: var(--el-fill-color-light);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;

        .info-row {
          display: flex;
          align-items: center;
          margin-bottom: 12px;

          &:last-child {
            margin-bottom: 0;
          }

          .info-label {
            width: 80px;
            font-size: 13px;
            color: var(--el-text-color-secondary);
            flex-shrink: 0;
          }

          .info-value {
            font-size: 14px;
            color: var(--el-text-color-primary);
            font-weight: 500;
          }

          .rating-display {
            display: flex;
            align-items: center;
          }
        }
      }

      .content-text {
        font-size: 14px;
        line-height: 1.8;
        color: var(--el-text-color-regular);
        margin-bottom: 16px;
        white-space: pre-wrap;
      }

      .image-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 8px;

        .preview-img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            transform: scale(1.02);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        }
      }
    }

    .detail-footer {
      .ai-analysis {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        padding: 16px;
        color: #fff;

        .analysis-title {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 12px 0;
        }

        .analysis-content {
          .analysis-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;

            &:last-child {
              margin-bottom: 0;
            }

            .item-label {
              width: 70px;
              font-size: 13px;
              flex-shrink: 0;
            }

            .keyword-tag {
              margin-right: 8px;
              background: rgba(255, 255, 255, 0.2);
              border-color: rgba(255, 255, 255, 0.3);
              color: #fff;
            }
          }
        }
      }
    }
  }

  .edit-form {
    padding-right: 20px;

    .w-full {
      width: 100%;
    }

    .image-list-edit {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;

      .image-item {
        position: relative;
        width: 100px;
        height: 100px;

        .thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 6px;
          cursor: pointer;
        }

        .remove-btn {
          position: absolute;
          top: -8px;
          right: -8px;
          padding: 4px;
          background: var(--el-color-danger);
          border-radius: 50%;
          color: #fff;

          &:hover {
            background: var(--el-color-danger-light-3);
          }
        }
      }
    }
  }
}
</style>
