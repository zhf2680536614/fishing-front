<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Delete, Edit, Medal } from '@element-plus/icons-vue'
import { getBadgePage, getBadgeManageById, createBadge, updateBadge, deleteBadge } from '@/api/badge'
import ImagePreview from '@/components/common/ImagePreview.vue'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const queryForm = ref({
  pageNum: 1,
  pageSize: 10,
  badgeName: '',
  requirementType: ''
})

// 需求类型选项（根据数据库DDL定义）
const requirementTypeOptions = ref([
  { label: '出钓天数', value: 'fishing_days' },
  { label: '有鱼获天数', value: 'fish_days' },
  { label: '空军天数', value: 'air_force_days' },
  { label: '累计重量', value: 'total_weight' }
])

const editDialogVisible = ref(false)
const editFormRef = ref(null)
const isAddMode = ref(false)
const uploadingIcon = ref(false)
const previewVisible = ref(false)
const previewImages = ref([])
const editForm = ref({
  id: null,
  badgeName: '',
  badgeIcon: '',
  description: '',
  requirementType: '',
  requirementValue: 0,
  sortOrder: 0
})

const editFormRules = {
  badgeName: [
    { required: true, message: '请输入勋章名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入勋章描述', trigger: 'blur' },
    { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
  ],
  requirementType: [
    { required: true, message: '请选择需求类型', trigger: 'change' }
  ],
  requirementValue: [
    { required: true, message: '请输入需求值', trigger: 'blur' },
    { type: 'number', min: 0, message: '需求值必须大于等于0', trigger: 'blur' }
  ],
  sortOrder: [
    { required: true, message: '请输入排序顺序', trigger: 'blur' },
    { type: 'number', min: 0, message: '排序顺序必须大于等于0', trigger: 'blur' }
  ]
}

const fetchBadgeList = async () => {
  loading.value = true
  try {
    const params = { ...queryForm.value }
    if (!params.badgeName) delete params.badgeName
    if (!params.requirementType) delete params.requirementType
    
    const result = await getBadgePage(params)
    tableData.value = result.list || []
    total.value = result.total || 0
  } catch (error) {
    console.error('获取勋章列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryForm.value.pageNum = 1
  fetchBadgeList()
}

const handleReset = () => {
  queryForm.value = {
    pageNum: 1,
    pageSize: 10,
    badgeName: '',
    requirementType: ''
  }
  fetchBadgeList()
}

const handleSizeChange = (val) => {
  queryForm.value.pageSize = val
  fetchBadgeList()
}

const handleCurrentChange = (val) => {
  queryForm.value.pageNum = val
  fetchBadgeList()
}

const handleEdit = async (row) => {
  isAddMode.value = false
  try {
    const badge = await getBadgeManageById(row.id)
    editForm.value = {
      id: badge.id,
      badgeName: badge.badgeName,
      badgeIcon: badge.badgeIcon,
      description: badge.description,
      requirementType: badge.requirementType,
      requirementValue: badge.requirementValue,
      sortOrder: badge.sortOrder
    }
    editDialogVisible.value = true
  } catch (error) {
    console.error('获取勋章信息失败:', error)
  }
}

const handleAdd = () => {
  isAddMode.value = true
  editForm.value = {
    id: null,
    badgeName: '',
    badgeIcon: '',
    description: '',
    requirementType: '',
    requirementValue: 0,
    sortOrder: 0
  }
  editDialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除勋章 "${row.badgeName}" 吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteBadge(row.id)
      ElMessage.success('删除成功')
      fetchBadgeList()
    } catch (error) {
      console.error('删除勋章失败:', error)
    }
  }).catch(() => {})
}

const handleIconUpload = async (file) => {
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

  // 使用 FileReader 读取本地图片预览
  const reader = new FileReader()
  reader.onload = (e) => {
    editForm.value.badgeIcon = e.target.result
    ElMessage.success('图片已选择（预览模式）')
  }
  reader.readAsDataURL(file.raw)
}

const handleIconRemove = () => {
  ElMessageBox.confirm(
    '确定要移除图标吗？',
    '移除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    editForm.value.badgeIcon = ''
    ElMessage.success('图标已移除')
  }).catch(() => {})
}

const previewTableIcon = (iconUrl) => {
  if (iconUrl) {
    previewImages.value = [iconUrl]
    previewVisible.value = true
  }
}

const submitEdit = async () => {
  if (!editFormRef.value) return
  
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = {
          badgeName: editForm.value.badgeName,
          badgeIcon: editForm.value.badgeIcon,
          description: editForm.value.description,
          requirementType: editForm.value.requirementType,
          requirementValue: editForm.value.requirementValue,
          sortOrder: editForm.value.sortOrder
        }
        
        if (isAddMode.value) {
          await createBadge(data)
          ElMessage.success('添加成功')
        } else {
          await updateBadge(editForm.value.id, data)
          ElMessage.success('更新成功')
        }
        editDialogVisible.value = false
        fetchBadgeList()
      } catch (error) {
        console.error('操作失败:', error)
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

const getRequirementTypeName = (code) => {
  const option = requirementTypeOptions.value.find(opt => opt.value === code)
  return option ? option.label : code
}

const getRequirementTypeTag = (code) => {
  const tagMap = {
    'fishing_days': 'success',
    'fish_days': 'primary',
    'air_force_days': 'info',
    'total_weight': 'warning'
  }
  return tagMap[code] || 'info'
}

onMounted(() => {
  fetchBadgeList()
})
</script>

<template>
  <div class="badge-manage-view">
    <!-- 顶部搜索卡片 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryForm" inline class="search-form" @keyup.enter="handleSearch">
        <el-form-item label="勋章名称">
          <el-input v-model="queryForm.badgeName" placeholder="请输入勋章名称" clearable />
        </el-form-item>
        <el-form-item label="需求类型">
          <el-select v-model="queryForm.requirementType" placeholder="请选择类型" clearable class="w-150">
            <el-option
              v-for="item in requirementTypeOptions"
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
        <span class="toolbar-title">
          <el-icon><Medal /></el-icon>
          勋章列表
        </span>
        <div class="toolbar-actions">
          <el-button type="primary" @click="handleAdd" class="add-badge-btn">
            <el-icon><Plus /></el-icon> 添加勋章
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        :header-cell-style="{ background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-primary)' }"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="图标" width="80" align="center">
          <template #default="{ row }">
            <el-avatar 
              v-if="row.badgeIcon" 
              :src="row.badgeIcon" 
              :size="40" 
              shape="square"
              style="cursor: pointer;" 
              @click="previewTableIcon(row.badgeIcon)"
            />
            <el-avatar v-else :size="40" shape="square" :icon="Medal" />
          </template>
        </el-table-column>
        <el-table-column prop="badgeName" label="勋章名称" width="120" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="需求类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getRequirementTypeTag(row.requirementType)" effect="light">
              {{ getRequirementTypeName(row.requirementType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="requirementValue" label="需求值" width="100" align="center">
          <template #default="{ row }">
            <span class="value-text">
              {{ row.requirementType === 'total_weight' ? row.requirementValue + ' 斤' : row.requirementValue + ' 天' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="170" align="center" />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
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

    <!-- 编辑/新增弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="isAddMode ? '添加勋章' : '编辑勋章'"
      width="600px"
      @close="cancelEdit"
      destroy-on-close
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="100px"
      >
        <el-form-item label="勋章图标">
          <div class="avatar-uploader-wrapper">
            <el-upload
              class="avatar-uploader"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleIconUpload"
              accept="image/*"
            >
              <el-avatar
                v-if="editForm.badgeIcon"
                :src="editForm.badgeIcon"
                :size="100"
                shape="square"
                class="uploaded-avatar"
              />
              <div v-else class="upload-placeholder">
                <el-icon :size="32"><Plus /></el-icon>
                <span>点击上传</span>
              </div>
            </el-upload>
            <div v-if="editForm.badgeIcon" class="avatar-actions">
              <el-button type="danger" link size="small" @click="handleIconRemove">
                <el-icon><Delete /></el-icon>移除
              </el-button>
            </div>
          </div>
          <div class="upload-tip">建议上传正方形图片，大小不超过10MB</div>
        </el-form-item>
        
        <el-form-item label="勋章名称" prop="badgeName">
          <el-input v-model="editForm.badgeName" placeholder="请输入勋章名称" maxlength="50" show-word-limit />
        </el-form-item>
        
        <el-form-item label="勋章描述" prop="description">
          <el-input 
            v-model="editForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入勋章描述" 
            maxlength="200" 
            show-word-limit 
          />
        </el-form-item>
        
        <el-form-item label="需求类型" prop="requirementType">
          <el-select v-model="editForm.requirementType" placeholder="请选择需求类型" class="w-full">
            <el-option
              v-for="item in requirementTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="需求值" prop="requirementValue">
          <el-input-number 
            v-model="editForm.requirementValue" 
            :min="0" 
            :precision="editForm.requirementType === 'total_weight' ? 2 : 0"
            :controls="false"
            class="w-full"
            placeholder="请输入需求值"
          />
          <div class="form-tip">
            {{ editForm.requirementType === 'total_weight' ? '单位：斤' : '单位：天' }}
          </div>
        </el-form-item>
        
        <el-form-item label="排序顺序" prop="sortOrder">
          <el-input-number 
            v-model="editForm.sortOrder" 
            :min="0" 
            :controls="false"
            class="w-full"
            placeholder="请输入排序顺序，数字越小越靠前"
          />
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
    <ImagePreview v-model="previewVisible" :images="previewImages" />
  </div>
</template>

<style lang="scss" scoped>
.badge-manage-view {
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
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .add-badge-btn {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .value-text {
      font-weight: 600;
      color: var(--el-color-primary);
    }

    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }

  .w-150 {
    width: 150px;
  }

  .w-full {
    width: 100%;
  }

  .avatar-uploader-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;

    .avatar-uploader {
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);

      &:hover {
        border-color: var(--el-color-primary);
      }

      .uploaded-avatar {
        display: block;
      }

      .upload-placeholder {
        width: 100px;
        height: 100px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--el-text-color-secondary);
        font-size: 12px;
        gap: 8px;
      }
    }

    .avatar-actions {
      display: flex;
      gap: 8px;
    }
  }

  .upload-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
  }

  .form-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
