<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Upload, Delete, Edit, MapLocation, Picture } from '@element-plus/icons-vue'
import { getSpotPage, getSpotManageById, createSpot, updateSpot, deleteSpot } from '@/api/spot'
import { getDictItems } from '@/api/dict'
import { uploadSpotImage } from '@/api/file'
import ImagePreview from '@/components/common/ImagePreview.vue'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const queryForm = ref({
  pageNum: 1,
  pageSize: 10,
  name: '',
  province: '',
  city: '',
  typeDictItemCode: '',
  statusDictItemCode: ''
})

const spotTypeOptions = ref([])
const spotStatusOptions = ref([])
const fishSpeciesOptions = ref([])

const editDialogVisible = ref(false)
const editFormRef = ref(null)
const isAddMode = ref(false)
const uploadingImage = ref(false)
const previewVisible = ref(false)
const previewImages = ref([])
const previewInitialIndex = ref(0)

const editForm = ref({
  id: null,
  name: '',
  typeDictTypeCode: 'fishing_spot_type',
  typeDictItemCode: '',
  longitude: null,
  latitude: null,
  province: '',
  city: '',
  address: '',
  priceDesc: '免费',
  fishInfoDictTypeCode: 'fish_species',
  fishInfoDictItemCodes: [],
  images: [],
  bestPositionDesc: '',
  statusDictTypeCode: 'fishing_spot_status',
  statusDictItemCode: ''
})

const editFormRules = {
  name: [
    { required: true, message: '请输入钓点名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  typeDictItemCode: [
    { required: true, message: '请选择钓点类型', trigger: 'change' }
  ],
  longitude: [
    { required: true, message: '请输入经度', trigger: 'blur' },
    { type: 'number', min: -180, max: 180, message: '经度范围 -180 到 180', trigger: 'blur' }
  ],
  latitude: [
    { required: true, message: '请输入纬度', trigger: 'blur' },
    { type: 'number', min: -90, max: 90, message: '纬度范围 -90 到 90', trigger: 'blur' }
  ],
  province: [
    { required: true, message: '请输入省份', trigger: 'blur' }
  ],
  city: [
    { required: true, message: '请输入城市', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入详细地址', trigger: 'blur' }
  ],
  statusDictItemCode: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

const fetchSpotList = async () => {
  loading.value = true
  try {
    const params = { ...queryForm.value }
    if (!params.name) delete params.name
    if (!params.province) delete params.province
    if (!params.city) delete params.city
    if (!params.typeDictItemCode) delete params.typeDictItemCode
    if (!params.statusDictItemCode) delete params.statusDictItemCode

    const result = await getSpotPage(params)
    tableData.value = result.list || []
    total.value = result.total || 0
  } catch (error) {
    console.error('获取钓点列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryForm.value.pageNum = 1
  fetchSpotList()
}

const handleReset = () => {
  queryForm.value = {
    pageNum: 1,
    pageSize: 10,
    name: '',
    province: '',
    city: '',
    typeDictItemCode: '',
    statusDictItemCode: ''
  }
  fetchSpotList()
}

const handleSizeChange = (val) => {
  queryForm.value.pageSize = val
  fetchSpotList()
}

const handleCurrentChange = (val) => {
  queryForm.value.pageNum = val
  fetchSpotList()
}

const handleEdit = async (row) => {
  isAddMode.value = false
  try {
    const spot = await getSpotManageById(row.id)
    editForm.value = {
      id: spot.id,
      name: spot.name,
      typeDictTypeCode: spot.typeDictTypeCode || 'fishing_spot_type',
      typeDictItemCode: spot.typeDictItemCode,
      longitude: spot.longitude,
      latitude: spot.latitude,
      province: spot.province,
      city: spot.city,
      address: spot.address,
      priceDesc: spot.priceDesc || '免费',
      fishInfoDictTypeCode: spot.fishInfoDictTypeCode || 'fish_species',
      fishInfoDictItemCodes: spot.fishInfoDictItemCodes || [],
      images: spot.images || [],
      bestPositionDesc: spot.bestPositionDesc || '',
      statusDictTypeCode: spot.statusDictTypeCode || 'fishing_spot_status',
      statusDictItemCode: spot.statusDictItemCode
    }
    editDialogVisible.value = true
  } catch (error) {
    console.error('获取钓点信息失败:', error)
  }
}

const handleAdd = () => {
  isAddMode.value = true
  editForm.value = {
    id: null,
    name: '',
    typeDictTypeCode: 'fishing_spot_type',
    typeDictItemCode: spotTypeOptions.value.length > 0 ? spotTypeOptions.value[0].value : '',
    longitude: null,
    latitude: null,
    province: '',
    city: '',
    address: '',
    priceDesc: '免费',
    fishInfoDictTypeCode: 'fish_species',
    fishInfoDictItemCodes: [],
    images: [],
    bestPositionDesc: '',
    statusDictTypeCode: 'fishing_spot_status',
    statusDictItemCode: spotStatusOptions.value.length > 0 ? spotStatusOptions.value[0].value : ''
  }
  editDialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除钓点 "${row.name}" 吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteSpot(row.id)
      ElMessage.success('删除成功')
      fetchSpotList()
    } catch (error) {
      console.error('删除钓点失败:', error)
    }
  }).catch(() => {})
}

const handleImageUpload = async (file) => {
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

  uploadingImage.value = true
  try {
    const url = await uploadSpotImage(file.raw)
    if (url) {
      editForm.value.images.push(url)
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error('上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('图片上传失败')
  } finally {
    uploadingImage.value = false
  }
}

const handleImageRemove = (index) => {
  ElMessageBox.confirm(
    '确定要移除这张图片吗？',
    '移除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    editForm.value.images.splice(index, 1)
    ElMessage.success('图片已移除')
  }).catch(() => {})
}

const previewTableImages = (images, index) => {
  if (images && images.length > 0) {
    previewImages.value = images
    previewInitialIndex.value = index || 0
    previewVisible.value = true
  }
}

const submitEdit = async () => {
  if (!editFormRef.value) return

  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = { ...editForm.value }
        delete data.id

        if (isAddMode.value) {
          await createSpot(data)
          ElMessage.success('添加成功')
        } else {
          await updateSpot(editForm.value.id, data)
          ElMessage.success('更新成功')
        }
        editDialogVisible.value = false
        fetchSpotList()
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

const getSpotTypeName = (code) => {
  const option = spotTypeOptions.value.find(opt => opt.value === code)
  return option ? option.label : code
}

const getSpotStatusName = (code) => {
  const option = spotStatusOptions.value.find(opt => opt.value === code)
  return option ? option.label : code
}

const getSpotStatusType = (code) => {
  const map = {
    'pending': 'warning',
    'published': 'success',
    'offline': 'info'
  }
  return map[code] || 'info'
}

const getFishSpeciesNames = (codes) => {
  if (!codes || codes.length === 0) return '-'
  return codes.map(code => {
    const option = fishSpeciesOptions.value.find(opt => opt.value === code)
    return option ? option.label : code
  }).join('、')
}

const fetchDictOptions = async () => {
  try {
    const typeItems = await getDictItems('fishing_spot_type')
    spotTypeOptions.value = typeItems.map(item => ({
      label: item.itemName,
      value: item.itemCode
    }))
  } catch (error) {
    console.error('获取钓点类型字典失败:', error)
  }

  try {
    const statusItems = await getDictItems('fishing_spot_status')
    spotStatusOptions.value = statusItems.map(item => ({
      label: item.itemName,
      value: item.itemCode
    }))
  } catch (error) {
    console.error('获取钓点状态字典失败:', error)
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
  fetchSpotList()
})
</script>

<template>
  <div class="spot-manage-view">
    <!-- 顶部搜索卡片 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryForm" inline class="search-form" @keyup.enter="handleSearch">
        <el-form-item label="钓点名称">
          <el-input v-model="queryForm.name" placeholder="请输入钓点名称" clearable />
        </el-form-item>
        <el-form-item label="省份">
          <el-input v-model="queryForm.province" placeholder="请输入省份" clearable />
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="queryForm.city" placeholder="请输入城市" clearable />
        </el-form-item>
        <el-form-item label="钓点类型">
          <el-select v-model="queryForm.typeDictItemCode" placeholder="请选择类型" clearable class="w-150">
            <el-option
              v-for="item in spotTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.statusDictItemCode" placeholder="请选择状态" clearable class="w-150">
            <el-option
              v-for="item in spotStatusOptions"
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
        <span class="toolbar-title">钓点列表</span>
        <div class="toolbar-actions">
          <el-button type="primary" @click="handleAdd" class="add-spot-btn">
            <el-icon><Plus /></el-icon> 添加钓点
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
        <el-table-column prop="name" label="钓点名称" width="150" show-overflow-tooltip />
        <el-table-column label="类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag effect="plain" type="info">{{ getSpotTypeName(row.typeDictItemCode) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="位置" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="location-info">
              <el-icon><MapLocation /></el-icon>
              <span>{{ row.province }} {{ row.city }} {{ row.address }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="坐标" width="180" align="center">
          <template #default="{ row }">
            <span class="coordinate">{{ row.longitude?.toFixed(6) }}, {{ row.latitude?.toFixed(6) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="priceDesc" label="收费" width="100" align="center" />
        <el-table-column label="常见鱼种" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="fish-species">{{ getFishSpeciesNames(row.fishInfoDictItemCodes) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="100" align="center">
          <template #default="{ row }">
            <div v-if="row.images && row.images.length > 0" class="image-preview-trigger" @click="previewTableImages(row.images, 0)">
              <el-icon><Picture /></el-icon>
              <span>{{ row.images.length }}张</span>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getSpotStatusType(row.statusDictItemCode)" effect="light">
              {{ getSpotStatusName(row.statusDictItemCode) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creatorName" label="创建者" width="120" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
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

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="isAddMode ? '添加钓点' : '编辑钓点信息'"
      width="700px"
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
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="钓点名称" prop="name">
              <el-input v-model="editForm.name" placeholder="请输入钓点名称" maxlength="100" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="钓点类型" prop="typeDictItemCode">
              <el-select v-model="editForm.typeDictItemCode" placeholder="请选择类型" class="w-full">
                <el-option
                  v-for="item in spotTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="经度" prop="longitude">
              <el-input-number v-model="editForm.longitude" :precision="6" :step="0.000001" placeholder="请输入经度" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度" prop="latitude">
              <el-input-number v-model="editForm.latitude" :precision="6" :step="0.000001" placeholder="请输入纬度" class="w-full" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="省份" prop="province">
              <el-input v-model="editForm.province" placeholder="请输入省份" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="城市" prop="city">
              <el-input v-model="editForm.city" placeholder="请输入城市" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="详细地址" prop="address">
          <el-input v-model="editForm.address" placeholder="请输入详细地址" maxlength="200" show-word-limit />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="收费描述">
              <el-input v-model="editForm.priceDesc" placeholder="如：免费、50元/天" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="statusDictItemCode">
              <el-select v-model="editForm.statusDictItemCode" placeholder="请选择状态" class="w-full">
                <el-option
                  v-for="item in spotStatusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="常见鱼种">
          <el-select
            v-model="editForm.fishInfoDictItemCodes"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择常见鱼种"
            class="w-full"
          >
            <el-option
              v-for="item in fishSpeciesOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="钓点图片">
          <div class="image-upload-section">
            <el-upload
              action="#"
              :auto-upload="false"
              :on-change="handleImageUpload"
              :disabled="uploadingImage"
              accept="image/*"
              class="image-uploader"
              :show-file-list="false"
            >
              <div class="upload-trigger">
                <el-icon class="upload-icon"><Upload /></el-icon>
                <span>点击上传图片</span>
                <span class="upload-hint">支持 JPG、PNG 格式，大小不超过 10MB</span>
              </div>
            </el-upload>

            <div v-if="editForm.images && editForm.images.length > 0" class="image-preview-list">
              <div
                v-for="(img, index) in editForm.images"
                :key="index"
                class="image-preview-item"
              >
                <img :src="img" alt="钓点图片" @click="previewTableImages(editForm.images, index)" />
                <div class="image-actions">
                  <el-button type="danger" link size="small" @click="handleImageRemove(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="最佳钓位">
          <el-input
            v-model="editForm.bestPositionDesc"
            type="textarea"
            :rows="3"
            placeholder="请输入AI推荐的最佳钓位描述..."
            maxlength="500"
            show-word-limit
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
    <ImagePreview
      v-model:visible="previewVisible"
      :images="previewImages"
      :initial-index="previewInitialIndex"
      @close="previewVisible = false"
    />
  </div>
</template>

<style lang="scss" scoped>
.spot-manage-view {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 40px);

  :deep(.el-card) {
    border-radius: 8px;
    border: 1px solid var(--el-border-color-light);
  }

  .search-card {
    margin-bottom: 16px;

    .search-form {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;

      .el-form-item {
        margin-bottom: 0;
        margin-right: 0;
        flex: 0 0 auto;

        .el-input {
          width: 180px;
        }

        @media (max-width: 1200px) {
          margin-bottom: 16px;
        }
      }

      .w-150 {
        width: 150px;
      }

      .action-buttons {
        margin-right: 0;
        display: flex;
        gap: 8px;
        align-items: center;
      }
    }
  }

  .table-card {
    .table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .toolbar-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        position: relative;
        padding-left: 10px;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 16px;
          background-color: var(--el-color-primary);
          border-radius: 2px;
        }
      }
    }

    :deep(.el-table) {
      border-radius: 4px;
      overflow: hidden;
    }

    .location-info {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--el-text-color-regular);

      .el-icon {
        color: var(--el-color-primary);
      }
    }

    .coordinate {
      font-family: monospace;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    .fish-species {
      color: var(--el-text-color-regular);
    }

    .image-preview-trigger {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--el-color-primary);
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
    }

    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .edit-form {
    padding-right: 20px;

    .w-full {
      width: 100%;
    }
  }

  .image-upload-section {
    .image-uploader {
      width: 140px;
      height: 100px;
      border: 2px dashed var(--el-border-color);
      border-radius: 8px;
      position: relative;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 12px;

      &:hover {
        border-color: var(--el-color-primary);
      }

      .upload-trigger {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--el-text-color-secondary);
        text-align: center;
        padding: 10px;

        .upload-icon {
          font-size: 24px;
          margin-bottom: 8px;
          color: var(--el-color-primary);
        }

        span {
          display: block;
          font-size: 12px;
          margin-bottom: 2px;
        }

        .upload-hint {
          font-size: 10px;
          color: var(--el-text-color-placeholder);
          margin-top: 4px;
        }
      }
    }

    .image-preview-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .image-preview-item {
        position: relative;
        width: 100px;
        height: 100px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid var(--el-border-color);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: pointer;

          &:hover {
            opacity: 0.9;
          }
        }

        .image-actions {
          position: absolute;
          top: 0;
          right: 0;
          padding: 4px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 0 0 0 8px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        &:hover .image-actions {
          opacity: 1;
        }
      }
    }
  }

  .add-spot-btn {
    font-weight: 500;
  }
}
</style>
