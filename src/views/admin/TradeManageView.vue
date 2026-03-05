<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, View, Picture, Goods } from '@element-plus/icons-vue'
import { getGearMarketPage, getGearMarketManageById, saveGearMarketManage, updateGearMarketManage, deleteGearMarketManage } from '@/api/gear'
import { getDictItems } from '@/api/dict'
import { uploadImage } from '@/api/file'
import ImagePreview from '@/components/common/ImagePreview.vue'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const queryForm = ref({
  pageNum:1,
  pageSize: 10,
  title: '',
  categoryDictItemCode: '',
  statusDictItemCode: '',
  userId: null,
  minPrice: null,
  maxPrice: null
})

const categoryOptions = ref([])
const statusOptions = ref([])

const editDialogVisible = ref(false)
const viewDialogVisible = ref(false)
const isEdit = ref(false)
const editFormRef = ref(null)
const viewForm = ref({})
const editForm = ref({
  id: null,
  userId: null,
  title: '',
  description: '',
  price: 0,
  originalPrice: null,
  images: [],
  categoryDictTypeCode: 'gear_category',
  categoryDictItemCode: '',
  statusDictTypeCode: 'gear_market_status',
  statusDictItemCode: ''
})

const editFormRules = {
  title: [
    { required: true, message: '请输入商品标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入商品描述', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格必须大于0', trigger: 'blur' }
  ],
  categoryDictItemCode: [
    { required: true, message: '请选择装备分类', trigger: 'change' }
  ],
  statusDictItemCode: [
    { required: true, message: '请选择商品状态', trigger: 'change' }
  ]
}

const previewVisible = ref(false)
const previewImages = ref([])
const uploadLoading = ref(false)

const fetchGearMarketList = async () => {
  loading.value = true
  try {
    const params = { ...queryForm.value }
    if (!params.title) delete params.title
    if (!params.categoryDictItemCode) delete params.categoryDictItemCode
    if (!params.statusDictItemCode) delete params.statusDictItemCode
    if (!params.userId) delete params.userId
    if (!params.minPrice) delete params.minPrice
    if (!params.maxPrice) delete params.maxPrice

    const result = await getGearMarketPage(params)
    tableData.value = result.list || []
    total.value = result.total || 0
  } catch (error) {
    console.error('获取装备交易列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryForm.value.pageNum =1
  fetchGearMarketList()
}

const handleReset = () => {
  queryForm.value = {
    pageNum:1,
    pageSize: 10,
    title: '',
    categoryDictItemCode: '',
    statusDictItemCode: '',
    userId: null,
    minPrice: null,
    maxPrice: null
  }
  fetchGearMarketList()
}

const handleSizeChange = (val) => {
  queryForm.value.pageSize = val
  fetchGearMarketList()
}

const handleCurrentChange = (val) => {
  queryForm.value.pageNum = val
  fetchGearMarketList()
}

const handleAdd = () => {
  isEdit.value = false
  editForm.value = {
    id: null,
    userId: null,
    title: '',
    description: '',
    price: 0,
    originalPrice: null,
    images: [],
    categoryDictTypeCode: 'gear_category',
    categoryDictItemCode: '',
    statusDictTypeCode: 'gear_market_status',
    statusDictItemCode: 'on_sale'
  }
  editDialogVisible.value = true
}

const handleView = async (row) => {
  try {
    const gear = await getGearMarketManageById(row.id)
    viewForm.value = gear
    viewDialogVisible.value = true
  } catch (error) {
    console.error('获取装备交易详情失败:', error)
  }
}

const handleEdit = async (row) => {
  try {
    const gear = await getGearMarketManageById(row.id)
    editForm.value = {
      id: gear.id,
      userId: gear.userId,
      title: gear.title,
      description: gear.description,
      price: gear.price,
      originalPrice: gear.originalPrice,
      images: gear.images || [],
      categoryDictTypeCode: gear.categoryDictTypeCode || 'gear_category',
      categoryDictItemCode: gear.categoryDictItemCode,
      statusDictTypeCode: gear.statusDictTypeCode || 'gear_market_status',
      statusDictItemCode: gear.statusDictItemCode
    }
    isEdit.value = true
    editDialogVisible.value = true
  } catch (error) {
    console.error('获取装备交易详情失败:', error)
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除商品 "${row.title}" 吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteGearMarketManage(row.id)
      ElMessage.success('删除成功')
      fetchGearMarketList()
    } catch (error) {
      console.error('删除装备交易失败:', error)
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
  editForm.value.images.splice(index,1)
}

const handleImageUpload = async (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG) {
    ElMessage.error('上传图片只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }

  uploadLoading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await uploadImage(formData)
    editForm.value.images.push(res.url)
    ElMessage.success('上传成功')
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败')
  } finally {
    uploadLoading.value = false
  }
  return false
}

const submitEdit = async () => {
  if (!editFormRef.value) return

  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = { ...editForm.value }
        delete data.id
        if (isEdit.value) {
          await updateGearMarketManage(editForm.value.id, data)
          ElMessage.success('更新成功')
        } else {
          await saveGearMarketManage(data)
          ElMessage.success('添加成功')
        }
        editDialogVisible.value = false
        fetchGearMarketList()
      } catch (error) {
        console.error(isEdit.value ? '更新装备交易失败:' : '添加装备交易失败:', error)
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

const getDiscount = (price, originalPrice) => {
  if (!originalPrice || originalPrice <= 0 || originalPrice <= price) return null
  return Math.round((price / originalPrice) * 10)
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
    const statusItems = await getDictItems('gear_market_status')
    statusOptions.value = statusItems.map(item => ({
      label: item.itemName,
      value: item.itemCode,
      type: item.itemCode === 'on_sale' ? 'success' : item.itemCode === 'sold' ? 'info' : 'warning'
    }))
  } catch (error) {
    console.error('获取装备市场状态字典失败:', error)
  }
}

onMounted(() => {
  fetchDictOptions()
  fetchGearMarketList()
})
</script>

<template>
  <div class="gear-market-manage-view">
    <!-- 顶部搜索卡片 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryForm" inline class="search-form" @keyup.enter="handleSearch">
        <el-form-item label="商品标题">
          <el-input v-model="queryForm.title" placeholder="请输入商品标题" clearable />
        </el-form-item>
        <el-form-item label="装备分类">
          <el-select v-model="queryForm.categoryDictItemCode" placeholder="请选择分类" clearable class="w-150">
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品状态">
          <el-select v-model="queryForm.statusDictItemCode" placeholder="请选择状态" clearable class="w-150">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="卖家ID">
          <el-input-number v-model="queryForm.userId" placeholder="请输入卖家ID" :min="1" :controls="false" class="w-120" />
        </el-form-item>
        <el-form-item label="价格范围">
          <el-input-number v-model="queryForm.minPrice" placeholder="最低价" :min="0" :controls="false" class="w-100" />
          <span class="price-separator">-</span>
          <el-input-number v-model="queryForm.maxPrice" placeholder="最高价" :min="0" :controls="false" class="w-100" />
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
          <el-icon><Goods /></el-icon>
          装备交易列表
        </span>
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增商品</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        :header-cell-style="{ background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-primary)' }"
      >
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="title" label="商品标题" min-width="150" show-overflow-tooltip />
        <el-table-column label="卖家" width="120" align="center">
          <template #default="{ row }">
            <div class="seller-info">
              <el-avatar v-if="row.avatar" :src="row.avatar" :size="32" />
              <el-avatar v-else :size="32" :icon="Picture" />
              <span class="seller-name">{{ row.nickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="100" align="center">
          <template #default="{ row }">
            <el-tag effect="plain" type="info">{{ getCategoryName(row.categoryDictItemCode) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="120" align="center">
          <template #default="{ row }">
            <div class="price-cell">
              <span class="current-price">¥{{ row.price }}</span>
              <span v-if="row.originalPrice && row.originalPrice > row.price" class="original-price">¥{{ row.originalPrice }}</span>
              <el-tag v-if="getDiscount(row.price, row.originalPrice)" type="danger" size="small" class="discount-tag">
                {{ getDiscount(row.price, row.originalPrice) }}折
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.statusDictItemCode)" effect="light">
              {{ getStatusName(row.statusDictItemCode) }}
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
        <el-table-column label="操作" width="180" fixed="right" align="center">
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
      title="商品详情"
      width="700px"
      destroy-on-close
    >
      <div class="gear-detail">
        <div class="detail-header">
          <h3 class="gear-title">{{ viewForm.title }}</h3>
          <div class="gear-meta">
            <el-tag effect="plain" size="small">{{ getCategoryName(viewForm.categoryDictItemCode) }}</el-tag>
            <el-tag :type="getStatusType(viewForm.statusDictItemCode)" effect="light" size="small">
              {{ getStatusName(viewForm.statusDictItemCode) }}
            </el-tag>
          </div>
        </div>

        <div class="detail-content">
          <div class="price-section">
            <div class="price-display">
              <span class="price-label">现价：</span>
              <span class="price-value">¥{{ viewForm.price }}</span>
            </div>
            <div v-if="viewForm.originalPrice && viewForm.originalPrice > viewForm.price" class="original-price-display">
              <span class="price-label">原价：</span>
              <span class="price-value line-through">¥{{ viewForm.originalPrice }}</span>
              <el-tag v-if="getDiscount(viewForm.price, viewForm.originalPrice)" type="danger" size="small">
                {{ getDiscount(viewForm.price, viewForm.originalPrice) }}折
              </el-tag>
            </div>
          </div>

          <div class="seller-section">
            <h4 class="section-title">卖家信息</h4>
            <div class="seller-detail">
              <el-avatar v-if="viewForm.avatar" :src="viewForm.avatar" :size="48" />
              <el-avatar v-else :size="48" :icon="Picture" />
              <div class="seller-meta">
                <div class="seller-nickname">{{ viewForm.nickname }}</div>
                <div class="seller-username">@{{ viewForm.username }}</div>
                <div v-if="viewForm.phone" class="seller-phone">电话：{{ viewForm.phone }}</div>
              </div>
            </div>
          </div>

          <div class="description-section">
            <h4 class="section-title">商品描述</h4>
            <p class="description-text">{{ viewForm.description }}</p>
          </div>

          <div v-if="viewForm.images && viewForm.images.length > 0" class="images-section">
            <h4 class="section-title">商品图片</h4>
            <div class="image-list">
              <img
                v-for="(img, index) in viewForm.images"
                :key="index"
                :src="img"
                class="preview-img"
                @click="handleImagePreview(viewForm.images, index)"
              />
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 编辑/新增弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="isEdit ? '编辑商品' : '新增商品'"
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
        <el-form-item label="商品标题" prop="title">
          <el-input v-model="editForm.title" placeholder="请输入商品标题" maxlength="100" show-word-limit />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="现价" prop="price">
              <el-input-number v-model="editForm.price" :min="0" :precision="2" :step="10" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="原价">
              <el-input-number v-model="editForm.originalPrice" :min="0" :precision="2" :step="10" class="w-full" />
            </el-form-item>
          </el-col>
        </el-row>
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
            <el-form-item label="商品状态" prop="statusDictItemCode">
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
        <el-form-item label="卖家ID" v-if="!isEdit">
          <el-input-number v-model="editForm.userId" placeholder="请输入卖家ID" :min="1" :controls="false" class="w-full" />
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入商品描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="商品图片">
          <div class="image-upload-wrapper">
            <div class="image-list-edit">
              <div v-for="(img, index) in editForm.images" :key="index" class="image-item">
                <img :src="img" class="thumbnail" @click="handleImagePreview(editForm.images, index)" />
                <el-button type="danger" link class="remove-btn" @click="handleRemoveImage(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <el-upload
              class="upload-btn"
              action="#"
              :show-file-list="false"
              :before-upload="handleImageUpload"
              accept="image/jpeg,image/png"
            >
              <el-button type="primary" plain :loading="uploadLoading">
                <el-icon><Plus /></el-icon> 上传图片
              </el-button>
            </el-upload>
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
.gear-market-manage-view {
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

        .w-150 {
          width: 150px;
        }

        .w-120 {
          width: 120px;
        }

        .w-100 {
          width: 100px;
        }

        .price-separator {
          margin: 0 8px;
          color: var(--el-text-color-secondary);
        }

        @media (max-width: 1200px) {
          margin-bottom: 16px;
        }
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
        display: flex;
        align-items: center;
        gap: 8px;

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

    .seller-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .seller-name {
        font-size: 13px;
        color: var(--el-text-color-primary);
      }
    }

    .price-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;

      .current-price {
        font-size: 14px;
        font-weight: 600;
        color: var(--el-color-danger);
      }

      .original-price {
        font-size: 12px;
        color: var(--el-text-color-placeholder);
        text-decoration: line-through;
      }

      .discount-tag {
        font-size: 10px;
      }
    }

    .text-gray {
      color: var(--el-text-color-placeholder);
    }

    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .gear-detail {
    .detail-header {
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--el-border-color-light);

      .gear-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 12px 0;
      }

      .gear-meta {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    .detail-content {
      .price-section {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 20px;
        color: #fff;

        .price-display {
          display: flex;
          align-items: baseline;
          margin-bottom: 8px;

          .price-label {
            font-size: 14px;
            margin-right: 8px;
          }

          .price-value {
            font-size: 24px;
            font-weight: 600;
          }
        }

        .original-price-display {
          display: flex;
          align-items: center;
          gap: 8px;

          .price-label {
            font-size: 13px;
          }

          .price-value {
            font-size: 14px;

            &.line-through {
              text-decoration: line-through;
              opacity: 0.8;
            }
          }
        }
      }

      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 12px 0;
      }

      .seller-section {
        margin-bottom: 20px;

        .seller-detail {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--el-fill-color-light);
          padding: 16px;
          border-radius: 8px;

          .seller-meta {
            .seller-nickname {
              font-size: 14px;
              font-weight: 500;
              color: var(--el-text-color-primary);
              margin-bottom: 4px;
            }

            .seller-username {
              font-size: 12px;
              color: var(--el-text-color-secondary);
              margin-bottom: 4px;
            }

            .seller-phone {
              font-size: 12px;
              color: var(--el-color-primary);
            }
          }
        }
      }

      .description-section {
        margin-bottom: 20px;

        .description-text {
          font-size: 14px;
          line-height: 1.8;
          color: var(--el-text-color-regular);
          background: var(--el-fill-color-light);
          padding: 16px;
          border-radius: 8px;
          white-space: pre-wrap;
        }
      }

      .images-section {
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
    }
  }

  .edit-form {
    padding-right: 20px;

    .w-full {
      width: 100%;
    }

    .image-upload-wrapper {
      .image-list-edit {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 12px;

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

      .upload-btn {
        .el-button {
          width: 100px;
          height: 100px;
          border: 1px dashed var(--el-border-color);
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;

          &:hover {
            border-color: var(--el-color-primary);
          }
        }
      }
    }
  }
}
</style>
