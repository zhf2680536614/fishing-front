<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, View, Picture, Upload, Remove } from '@element-plus/icons-vue'
import { getPostPage, getPostManageById, updatePost, deletePost } from '@/api/post'
import { getDictItems } from '@/api/dict'
import { uploadPostImages } from '@/api/file'
import ImagePreview from '@/components/common/ImagePreview.vue'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const queryForm = ref({
  pageNum: 1,
  pageSize: 10,
  title: '',
  typeDictItemCode: '',
  statusDictItemCode: '',
  aiAuditStatusDictItemCode: ''
})

const typeOptions = ref([])
const statusOptions = ref([])
const aiAuditStatusOptions = ref([])
const fishSpeciesOptions = ref([])

const editDialogVisible = ref(false)
const viewDialogVisible = ref(false)
const editFormRef = ref(null)
const viewForm = ref({})
const editForm = ref({
  id: null,
  typeDictTypeCode: 'post_type',
  typeDictItemCode: '',
  title: '',
  content: '',
  images: [],
  fishSpeciesDictTypeCode: 'fish_species',
  fishSpeciesDictItemCode: '',
  fishWeight: null,
  spotId: null,
  addressName: '',
  aiAuditStatusDictTypeCode: 'ai_audit_status',
  aiAuditStatusDictItemCode: '',
  aiAuditReason: '',
  statusDictTypeCode: 'post_status',
  statusDictItemCode: '',
  aiComment: ''
})

const editFormRules = {
  title: [
    { required: true, message: '请输入帖子标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入帖子内容', trigger: 'blur' }
  ],
  typeDictItemCode: [
    { required: true, message: '请选择帖子类型', trigger: 'change' }
  ],
  statusDictItemCode: [
    { required: true, message: '请选择帖子状态', trigger: 'change' }
  ]
}

const previewVisible = ref(false)
const previewImages = ref([])

const fetchPostList = async () => {
  loading.value = true
  try {
    const params = { ...queryForm.value }
    if (!params.title) delete params.title
    if (!params.typeDictItemCode) delete params.typeDictItemCode
    if (!params.statusDictItemCode) delete params.statusDictItemCode
    if (!params.aiAuditStatusDictItemCode) delete params.aiAuditStatusDictItemCode

    const result = await getPostPage(params)
    tableData.value = result.list || []
    total.value = result.total || 0
  } catch (error) {
    console.error('获取帖子列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryForm.value.pageNum = 1
  fetchPostList()
}

const handleReset = () => {
  queryForm.value = {
    pageNum: 1,
    pageSize: 10,
    title: '',
    typeDictItemCode: '',
    statusDictItemCode: '',
    aiAuditStatusDictItemCode: ''
  }
  fetchPostList()
}

const handleSizeChange = (val) => {
  queryForm.value.pageSize = val
  fetchPostList()
}

const handleCurrentChange = (val) => {
  queryForm.value.pageNum = val
  fetchPostList()
}

const handleView = async (row) => {
  try {
    const post = await getPostManageById(row.id)
    viewForm.value = post
    viewDialogVisible.value = true
  } catch (error) {
    console.error('获取帖子详情失败:', error)
  }
}

const handleEdit = async (row) => {
  try {
    const post = await getPostManageById(row.id)
    editForm.value = {
      id: post.id,
      typeDictTypeCode: post.typeDictTypeCode || 'post_type',
      typeDictItemCode: post.typeDictItemCode,
      title: post.title,
      content: post.content,
      images: post.images || [],
      fishSpeciesDictTypeCode: post.fishSpeciesDictTypeCode || 'fish_species',
      fishSpeciesDictItemCode: post.fishSpeciesDictItemCode,
      fishWeight: post.fishWeight,
      spotId: post.spotId,
      addressName: post.addressName,
      aiAuditStatusDictTypeCode: post.aiAuditStatusDictTypeCode || 'ai_audit_status',
      aiAuditStatusDictItemCode: post.aiAuditStatusDictItemCode,
      aiAuditReason: post.aiAuditReason,
      statusDictTypeCode: post.statusDictTypeCode || 'post_status',
      statusDictItemCode: post.statusDictItemCode,
      aiComment: post.aiComment
    }
    editDialogVisible.value = true
  } catch (error) {
    console.error('获取帖子详情失败:', error)
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除帖子 "${row.title}" 吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deletePost(row.id)
      ElMessage.success('删除成功')
      fetchPostList()
    } catch (error) {
      console.error('删除帖子失败:', error)
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

const handleUpload = async (file) => {
  try {
    const result = await uploadPostImages([file.raw])
    if (result && result.length > 0) {
      editForm.value.images.push(result[0])
      ElMessage.success('图片上传成功')
    }
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败')
  }
  return false // 阻止自动上传
}

const handleUploadBefore = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  return true
}

const submitEdit = async () => {
  if (!editFormRef.value) return

  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = { ...editForm.value }
        delete data.id
        await updatePost(editForm.value.id, data)
        ElMessage.success('更新成功')
        editDialogVisible.value = false
        fetchPostList()
      } catch (error) {
        console.error('更新帖子失败:', error)
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

const getTypeName = (code) => {
  const option = typeOptions.value.find(opt => opt.value === code)
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

const getAiAuditStatusName = (code) => {
  const option = aiAuditStatusOptions.value.find(opt => opt.value === code)
  return option ? option.label : code
}

const getAiAuditStatusType = (code) => {
  const option = aiAuditStatusOptions.value.find(opt => opt.value === code)
  return option?.type || 'info'
}

const getFishSpeciesName = (code) => {
  const option = fishSpeciesOptions.value.find(opt => opt.value === code)
  return option ? option.label : code
}

const fetchDictOptions = async () => {
  try {
    const typeItems = await getDictItems('post_type')
    typeOptions.value = typeItems.map(item => ({
      label: item.itemName,
      value: item.itemCode
    }))
  } catch (error) {
    console.error('获取帖子类型字典失败:', error)
  }

  try {
    const statusItems = await getDictItems('common_status')
    statusOptions.value = statusItems.map(item => ({
      label: item.itemName,
      value: item.itemCode,
      type: item.itemCode === 'enabled' ? 'success' : 'danger'
    }))
  } catch (error) {
    console.error('获取通用状态字典失败:', error)
  }

  try {
    const aiAuditItems = await getDictItems('ai_audit_status')
    aiAuditStatusOptions.value = aiAuditItems.map(item => ({
      label: item.itemName,
      value: item.itemCode,
      type: item.itemCode === 'approved' ? 'success' : item.itemCode === 'rejected' ? 'danger' : 'warning'
    }))
  } catch (error) {
    console.error('获取AI审核状态字典失败:', error)
  }

  try {
    const fishItems = await getDictItems('fish_species')
    fishSpeciesOptions.value = fishItems.map(item => ({
      label: item.itemName,
      value: item.itemCode
    }))
  } catch (error) {
    console.error('获取鱼种字典失败:', error)
  }
}

onMounted(() => {
  fetchDictOptions()
  fetchPostList()
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

.image-list-edit {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  overflow: hidden;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  padding: 2px;
}

.upload-area {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.upload-area:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.upload-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  transition: all 0.3s ease;
}

.upload-icon:hover {
  color: #409eff;
}

.upload-icon-large {
  font-size: 24px;
  margin-bottom: 8px;
  transition: transform 0.3s ease;
}

.upload-icon:hover .upload-icon-large {
  transform: scale(1.2) rotate(10deg);
}

.upload-text {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  line-height: 1.4;
}
</style>

<template>
  <div class="post-manage-view">
    <!-- 顶部搜索卡片 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryForm" inline class="search-form" @keyup.enter="handleSearch">
        <el-form-item label="帖子标题">
          <el-input v-model="queryForm.title" placeholder="请输入帖子标题" clearable />
        </el-form-item>
        <el-form-item label="帖子类型" style="width: 200px;">
          <el-select v-model="queryForm.typeDictItemCode" placeholder="请选择类型" clearable class="w-150">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="帖子状态" style="width: 200px;">
          <el-select v-model="queryForm.statusDictItemCode" placeholder="请选择状态" clearable class="w-150">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="AI审核状态" style="width: 200px;">
          <el-select v-model="queryForm.aiAuditStatusDictItemCode" placeholder="请选择审核状态" clearable class="w-150">
            <el-option
              v-for="item in aiAuditStatusOptions"
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
        <span class="toolbar-title">帖子列表</span>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        :header-cell-style="{ background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-primary)' }"
      >
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="title" label="标题" min-width="150" show-overflow-tooltip />
        <el-table-column label="作者" width="120" align="center">
          <template #default="{ row }">
            <div class="author-info">
              <div class="avatar-container">
                <el-avatar v-if="row.userAvatar" :src="row.userAvatar" :size="32" />
                <el-avatar v-else :size="32" :icon="Picture" />
              </div>
              <span class="author-name" :title="row.userNickname">{{ row.userNickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag effect="plain" type="info">{{ row.typeDictItemName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="鱼种" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.fishSpeciesDictItemName">{{ row.fishSpeciesDictItemName }}</span>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>
        <el-table-column label="重量" width="90" align="center">
          <template #default="{ row }">
            <span v-if="row.fishWeight" class="fish-weight">{{ row.fishWeight }} 斤</span>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>
        <el-table-column label="浏览/点赞/评论" width="140" align="center">
          <template #default="{ row }">
            <div class="stats-info">
              <span><el-icon><View /></el-icon> {{ row.viewCount || 0 }}</span>
              <span>👍 {{ row.likeCount || 0 }}</span>
              <span>💬 {{ row.commentCount || 0 }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="AI审核" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getAiAuditStatusType(row.aiAuditStatusDictItemCode)" effect="light">
              {{ row.aiAuditStatusDictItemName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.statusDictItemCode)" effect="light">
              {{ row.statusDictItemName }}
            </el-tag>
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
      title="帖子详情"
      width="700px"
      destroy-on-close
    >
      <div class="post-detail">
        <div class="detail-header">
          <h3 class="post-title">{{ viewForm.title }}</h3>
          <div class="post-meta">
            <span class="meta-item">
              <el-avatar v-if="viewForm.userAvatar" :src="viewForm.userAvatar" :size="24" />
              <el-avatar v-else :size="24" :icon="Picture" />
              {{ viewForm.userNickname }}
            </span>
            <span class="meta-item">{{ viewForm.createTime }}</span>
            <el-tag :type="getTypeName(viewForm.typeDictItemCode) ? 'info' : 'info'" size="small">
              {{ getTypeName(viewForm.typeDictItemCode) }}
            </el-tag>
          </div>
        </div>
        <div class="detail-content">
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
        <div class="detail-footer">
          <div class="info-row">
            <span class="info-label">鱼种：</span>
            <span class="info-value">{{ getFishSpeciesName(viewForm.fishSpeciesDictItemCode) || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">重量：</span>
            <span class="info-value">{{ viewForm.fishWeight ? viewForm.fishWeight + ' 斤' : '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">钓点：</span>
            <span class="info-value">{{ viewForm.spotName || viewForm.addressName || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">AI审核：</span>
            <el-tag :type="getAiAuditStatusType(viewForm.aiAuditStatusDictItemCode)" size="small">
              {{ getAiAuditStatusName(viewForm.aiAuditStatusDictItemCode) }}
            </el-tag>
            <span v-if="viewForm.aiAuditReason" class="audit-reason">原因：{{ viewForm.aiAuditReason }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">AI评论：</span>
            <span class="info-value ai-comment">{{ viewForm.aiComment || '-' }}</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑帖子"
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
        <el-form-item label="帖子标题" prop="title">
          <el-input v-model="editForm.title" placeholder="请输入帖子标题" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="帖子内容" prop="content">
          <el-input
            v-model="editForm.content"
            type="textarea"
            :rows="5"
            placeholder="请输入帖子内容"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="帖子类型" prop="typeDictItemCode">
              <el-select v-model="editForm.typeDictItemCode" placeholder="请选择类型" class="w-full">
                <el-option
                  v-for="item in typeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="帖子状态" prop="statusDictItemCode">
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
        <el-row>
          <el-col :span="12">
            <el-form-item label="鱼种">
              <el-select v-model="editForm.fishSpeciesDictItemCode" placeholder="请选择鱼种" clearable class="w-full">
                <el-option
                  v-for="item in fishSpeciesOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重量(斤)">
              <el-input-number v-model="editForm.fishWeight" :min="0" :precision="2" :step="0.1" class="w-full" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="AI审核状态">
          <el-select v-model="editForm.aiAuditStatusDictItemCode" placeholder="请选择审核状态" clearable class="w-full">
            <el-option
              v-for="item in aiAuditStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="审核原因">
          <el-input v-model="editForm.aiAuditReason" placeholder="请输入审核原因" />
        </el-form-item>
        <el-form-item label="AI评论">
          <el-input
            v-model="editForm.aiComment"
            type="textarea"
            :rows="2"
            placeholder="AI安慰语（空军帖子专用）"
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
            <div class="upload-area">
              <el-upload
                class="upload-btn"
                :auto-upload="false"
                :on-change="handleUpload"
                :before-upload="handleUploadBefore"
                :show-file-list="false"
                accept="image/*"
              >
                <div class="upload-icon">
                  <el-icon class="upload-icon-large"><Upload /></el-icon>
                  <span class="upload-text">添加图片</span>
                </div>
              </el-upload>
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
.post-manage-view {
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

    .stats-info {
      display: flex;
      justify-content: center;
      gap: 12px;
      font-size: 12px;
      color: var(--el-text-color-secondary);

      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .fish-weight {
      color: var(--el-color-primary);
      font-weight: 500;
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

  .post-detail {
    .detail-header {
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--el-border-color-light);

      .post-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 12px 0;
      }

      .post-meta {
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
      background: var(--el-fill-color-light);
      border-radius: 8px;
      padding: 16px;

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
          font-size: 13px;
          color: var(--el-text-color-primary);

          &.ai-comment {
            font-style: italic;
            color: var(--el-color-primary);
          }
        }

        .audit-reason {
          margin-left: 12px;
          font-size: 12px;
          color: var(--el-color-danger);
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
