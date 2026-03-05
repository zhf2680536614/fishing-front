<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox, ElTabs, ElTabPane } from 'element-plus'
import { Search, Refresh, Plus, Delete, Edit, Document, List } from '@element-plus/icons-vue'
import {
  getDictTypePage, getAllDictTypes, getDictTypeById, createDictType, updateDictType, deleteDictType,
  getDictItemPage, getDictItemById, createDictItem, updateDictItem, deleteDictItem
} from '@/api/dict'

// ==================== 字典类型管理 ====================

const loading = ref(false)
const activeTab = ref('type')

// 字典类型数据
const typeTableData = ref([])
const typeTotal = ref(0)
const typeQueryForm = ref({
  pageNum: 1,
  pageSize: 10,
  dictCode: '',
  dictName: '',
  status: null
})

// 字典类型编辑
const typeEditDialogVisible = ref(false)
const typeEditFormRef = ref(null)
const typeIsAddMode = ref(false)
const typeEditForm = ref({
  id: null,
  dictCode: '',
  dictName: '',
  parentId: 0,
  description: '',
  sortOrder: 0,
  status: 1
})

const typeEditFormRules = {
  dictCode: [
    { required: true, message: '请输入字典编码', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  dictName: [
    { required: true, message: '请输入字典名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  sortOrder: [
    { required: true, message: '请输入排序顺序', trigger: 'blur' },
    { type: 'number', min: 0, message: '排序顺序必须大于等于0', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 状态选项
const statusOptions = ref([
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
])

// ==================== 字典项管理 ====================

// 字典项数据
const itemTableData = ref([])
const itemTotal = ref(0)
const itemQueryForm = ref({
  pageNum: 1,
  pageSize: 10,
  dictTypeId: null,
  itemCode: '',
  itemName: '',
  status: null
})

// 字典类型下拉选项
const dictTypeOptions = ref([])

// 字典项编辑
const itemEditDialogVisible = ref(false)
const itemEditFormRef = ref(null)
const itemIsAddMode = ref(false)
const itemEditForm = ref({
  id: null,
  dictTypeId: null,
  itemCode: '',
  itemName: '',
  value: '',
  description: '',
  sortOrder: 0,
  status: 1
})

const itemEditFormRules = {
  dictTypeId: [
    { required: true, message: '请选择字典类型', trigger: 'change' }
  ],
  itemCode: [
    { required: true, message: '请输入字典项编码', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  itemName: [
    { required: true, message: '请输入字典项名称', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  value: [
    { required: true, message: '请输入字典项值', trigger: 'blur' }
  ],
  sortOrder: [
    { required: true, message: '请输入排序顺序', trigger: 'blur' },
    { type: 'number', min: 0, message: '排序顺序必须大于等于0', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// ==================== 方法 ====================

// 获取字典类型列表
const fetchDictTypeList = async () => {
  loading.value = true
  try {
    const params = { ...typeQueryForm.value }
    if (!params.dictCode) delete params.dictCode
    if (!params.dictName) delete params.dictName
    if (params.status === null) delete params.status
    
    const result = await getDictTypePage(params)
    typeTableData.value = result.list || []
    typeTotal.value = result.total || 0
  } catch (error) {
    console.error('获取字典类型列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取字典项列表
const fetchDictItemList = async () => {
  loading.value = true
  try {
    const params = { ...itemQueryForm.value }
    if (!params.itemCode) delete params.itemCode
    if (!params.itemName) delete params.itemName
    if (params.status === null) delete params.status
    if (params.dictTypeId === null) delete params.dictTypeId
    
    const result = await getDictItemPage(params)
    itemTableData.value = result.list || []
    itemTotal.value = result.total || 0
  } catch (error) {
    console.error('获取字典项列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取所有字典类型（用于下拉选择）
const fetchDictTypeOptions = async () => {
  try {
    const result = await getAllDictTypes()
    dictTypeOptions.value = result.map(item => ({
      label: item.dictName,
      value: item.id
    }))
  } catch (error) {
    console.error('获取字典类型失败:', error)
  }
}

// 字典类型搜索
const handleTypeSearch = () => {
  typeQueryForm.value.pageNum = 1
  fetchDictTypeList()
}

const handleTypeReset = () => {
  typeQueryForm.value = {
    pageNum: 1,
    pageSize: 10,
    dictCode: '',
    dictName: '',
    status: null
  }
  fetchDictTypeList()
}

// 字典项搜索
const handleItemSearch = () => {
  itemQueryForm.value.pageNum = 1
  fetchDictItemList()
}

const handleItemReset = () => {
  itemQueryForm.value = {
    pageNum: 1,
    pageSize: 10,
    dictTypeId: null,
    itemCode: '',
    itemName: '',
    status: null
  }
  fetchDictItemList()
}

// 分页处理
const handleTypeSizeChange = (val) => {
  typeQueryForm.value.pageSize = val
  fetchDictTypeList()
}

const handleTypeCurrentChange = (val) => {
  typeQueryForm.value.pageNum = val
  fetchDictTypeList()
}

const handleItemSizeChange = (val) => {
  itemQueryForm.value.pageSize = val
  fetchDictItemList()
}

const handleItemCurrentChange = (val) => {
  itemQueryForm.value.pageNum = val
  fetchDictItemList()
}

// 字典类型编辑
const handleTypeEdit = async (row) => {
  typeIsAddMode.value = false
  try {
    const type = await getDictTypeById(row.id)
    typeEditForm.value = {
      id: type.id,
      dictCode: type.dictCode,
      dictName: type.dictName,
      parentId: type.parentId || 0,
      description: type.description || '',
      sortOrder: type.sortOrder || 0,
      status: type.status
    }
    typeEditDialogVisible.value = true
  } catch (error) {
    console.error('获取字典类型信息失败:', error)
  }
}

const handleTypeAdd = () => {
  typeIsAddMode.value = true
  typeEditForm.value = {
    id: null,
    dictCode: '',
    dictName: '',
    parentId: 0,
    description: '',
    sortOrder: 0,
    status: 1
  }
  typeEditDialogVisible.value = true
}

const handleTypeDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除字典类型 "${row.dictName}" 吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteDictType(row.id)
      ElMessage.success('删除成功')
      fetchDictTypeList()
      // 刷新字典类型选项
      fetchDictTypeOptions()
    } catch (error) {
      console.error('删除字典类型失败:', error)
    }
  }).catch(() => {})
}

const submitTypeEdit = async () => {
  if (!typeEditFormRef.value) return
  
  await typeEditFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = {
          dictCode: typeEditForm.value.dictCode,
          dictName: typeEditForm.value.dictName,
          parentId: typeEditForm.value.parentId,
          description: typeEditForm.value.description,
          sortOrder: typeEditForm.value.sortOrder,
          status: typeEditForm.value.status
        }
        
        if (typeIsAddMode.value) {
          await createDictType(data)
          ElMessage.success('添加成功')
        } else {
          await updateDictType(typeEditForm.value.id, data)
          ElMessage.success('更新成功')
        }
        typeEditDialogVisible.value = false
        fetchDictTypeList()
        // 刷新字典类型选项
        fetchDictTypeOptions()
      } catch (error) {
        console.error('操作失败:', error)
      }
    }
  })
}

const cancelTypeEdit = () => {
  typeEditDialogVisible.value = false
  setTimeout(() => {
    typeEditFormRef.value?.resetFields()
  }, 300)
}

// 字典项编辑
const handleItemEdit = async (row) => {
  itemIsAddMode.value = false
  try {
    const item = await getDictItemById(row.id)
    itemEditForm.value = {
      id: item.id,
      dictTypeId: item.dictTypeId,
      itemCode: item.itemCode,
      itemName: item.itemName,
      value: item.value,
      description: item.description || '',
      sortOrder: item.sortOrder || 0,
      status: item.status
    }
    itemEditDialogVisible.value = true
  } catch (error) {
    console.error('获取字典项信息失败:', error)
  }
}

const handleItemAdd = () => {
  itemIsAddMode.value = true
  itemEditForm.value = {
    id: null,
    dictTypeId: dictTypeOptions.value.length > 0 ? dictTypeOptions.value[0].value : null,
    itemCode: '',
    itemName: '',
    value: '',
    description: '',
    sortOrder: 0,
    status: 1
  }
  itemEditDialogVisible.value = true
}

const handleItemDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除字典项 "${row.itemName}" 吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteDictItem(row.id)
      ElMessage.success('删除成功')
      fetchDictItemList()
    } catch (error) {
      console.error('删除字典项失败:', error)
    }
  }).catch(() => {})
}

const submitItemEdit = async () => {
  if (!itemEditFormRef.value) return
  
  await itemEditFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = {
          dictTypeId: itemEditForm.value.dictTypeId,
          itemCode: itemEditForm.value.itemCode,
          itemName: itemEditForm.value.itemName,
          value: itemEditForm.value.value,
          description: itemEditForm.value.description,
          sortOrder: itemEditForm.value.sortOrder,
          status: itemEditForm.value.status
        }
        
        if (itemIsAddMode.value) {
          await createDictItem(data)
          ElMessage.success('添加成功')
        } else {
          await updateDictItem(itemEditForm.value.id, data)
          ElMessage.success('更新成功')
        }
        itemEditDialogVisible.value = false
        fetchDictItemList()
      } catch (error) {
        console.error('操作失败:', error)
      }
    }
  })
}

const cancelItemEdit = () => {
  itemEditDialogVisible.value = false
  setTimeout(() => {
    itemEditFormRef.value?.resetFields()
  }, 300)
}

// 获取状态名称
const getStatusName = (status) => {
  const option = statusOptions.value.find(opt => opt.value === status)
  return option ? option.label : status
}

// 获取状态类型
const getStatusType = (status) => {
  return status === 1 ? 'success' : 'danger'
}

// 切换标签时刷新数据
watch(activeTab, (newTab) => {
  if (newTab === 'item') {
    fetchDictItemList()
  }
})

// 初始化
onMounted(() => {
  fetchDictTypeList()
  fetchDictTypeOptions()
})
</script>

<template>
  <div class="dict-manage-view">
    <!-- 标签页 -->
    <el-tabs v-model="activeTab" type="card" class="dict-tabs">
      <!-- 字典类型管理 -->
      <el-tab-pane label="字典类型管理" name="type" :icon="Document">
        <!-- 搜索卡片 -->
        <el-card class="search-card" shadow="never">
          <el-form :model="typeQueryForm" inline class="search-form" @keyup.enter="handleTypeSearch">
            <el-form-item label="字典编码">
              <el-input v-model="typeQueryForm.dictCode" placeholder="请输入字典编码" clearable />
            </el-form-item>
            <el-form-item label="字典名称">
              <el-input v-model="typeQueryForm.dictName" placeholder="请输入字典名称" clearable />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="typeQueryForm.status" placeholder="请选择状态" clearable class="w-100">
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item class="action-buttons">
              <el-button type="primary" :icon="Search" @click="handleTypeSearch">搜索</el-button>
              <el-button :icon="Refresh" @click="handleTypeReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 表格内容卡片 -->
        <el-card class="table-card" shadow="never">
          <div class="table-toolbar">
            <span class="toolbar-title">字典类型列表</span>
            <div class="toolbar-actions">
              <el-button type="primary" @click="handleTypeAdd" class="add-btn">
                <el-icon><Plus /></el-icon> 添加字典类型
              </el-button>
            </div>
          </div>

          <el-table
            v-loading="loading"
            :data="typeTableData"
            border
            style="width: 100%"
            :header-cell-style="{ background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-primary)' }"
          >
            <el-table-column prop="id" label="ID" width="80" align="center" />
            <el-table-column prop="dictCode" label="字典编码" width="150" show-overflow-tooltip />
            <el-table-column prop="dictName" label="字典名称" width="150" show-overflow-tooltip />
            <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
            <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" effect="light">
                  {{ getStatusName(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="170" align="center" />
            <el-table-column label="操作" width="150" fixed="right" align="center">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleTypeEdit(row)">
                  <el-icon><Edit /></el-icon>编辑
                </el-button>
                <el-button type="danger" link @click="handleTypeDelete(row)">
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="typeQueryForm.pageNum"
              v-model:page-size="typeQueryForm.pageSize"
              :page-sizes="[10, 20, 50]"
              :total="typeTotal"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleTypeSizeChange"
              @current-change="handleTypeCurrentChange"
            />
          </div>
        </el-card>

        <!-- 字典类型编辑弹窗 -->
        <el-dialog
          v-model="typeEditDialogVisible"
          :title="typeIsAddMode ? '添加字典类型' : '编辑字典类型'"
          width="600px"
          @close="cancelTypeEdit"
          destroy-on-close
        >
          <el-form
            ref="typeEditFormRef"
            :model="typeEditForm"
            :rules="typeEditFormRules"
            label-width="120px"
          >
            <el-form-item label="字典编码" prop="dictCode">
              <el-input v-model="typeEditForm.dictCode" placeholder="请输入字典编码" maxlength="50" show-word-limit />
            </el-form-item>
            <el-form-item label="字典名称" prop="dictName">
              <el-input v-model="typeEditForm.dictName" placeholder="请输入字典名称" maxlength="100" show-word-limit />
            </el-form-item>
            <el-form-item label="父级类型" prop="parentId">
              <el-select v-model="typeEditForm.parentId" placeholder="请选择父级类型" class="w-full">
                <el-option label="顶级" value="0" />
                <el-option
                  v-for="item in dictTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  v-if="!typeEditForm.id || item.value !== typeEditForm.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="描述" prop="description">
              <el-input 
                v-model="typeEditForm.description" 
                type="textarea" 
                :rows="3"
                placeholder="请输入描述" 
                maxlength="200" 
                show-word-limit 
              />
            </el-form-item>
            <el-form-item label="排序顺序" prop="sortOrder">
              <el-input-number 
                v-model="typeEditForm.sortOrder" 
                :min="0" 
                :controls="false"
                class="w-full"
                placeholder="请输入排序顺序，数字越小越靠前"
              />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="typeEditForm.status" placeholder="请选择状态" class="w-full">
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="cancelTypeEdit">取消</el-button>
              <el-button type="primary" @click="submitTypeEdit">确定</el-button>
            </span>
          </template>
        </el-dialog>
      </el-tab-pane>

      <!-- 字典项管理 -->
      <el-tab-pane label="字典项管理" name="item" :icon="List">
        <!-- 搜索卡片 -->
        <el-card class="search-card" shadow="never">
          <el-form :model="itemQueryForm" inline class="search-form" @keyup.enter="handleItemSearch">
            <el-form-item label="字典类型">
              <el-select v-model="itemQueryForm.dictTypeId" placeholder="请选择字典类型" clearable class="w-150">
                <el-option
                  v-for="item in dictTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="字典项编码">
              <el-input v-model="itemQueryForm.itemCode" placeholder="请输入字典项编码" clearable />
            </el-form-item>
            <el-form-item label="字典项名称">
              <el-input v-model="itemQueryForm.itemName" placeholder="请输入字典项名称" clearable />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="itemQueryForm.status" placeholder="请选择状态" clearable class="w-100">
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item class="action-buttons">
              <el-button type="primary" :icon="Search" @click="handleItemSearch">搜索</el-button>
              <el-button :icon="Refresh" @click="handleItemReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 表格内容卡片 -->
        <el-card class="table-card" shadow="never">
          <div class="table-toolbar">
            <span class="toolbar-title">字典项列表</span>
            <div class="toolbar-actions">
              <el-button type="primary" @click="handleItemAdd" class="add-btn" :disabled="dictTypeOptions.length === 0">
                <el-icon><Plus /></el-icon> 添加字典项
              </el-button>
            </div>
          </div>

          <el-table
            v-loading="loading"
            :data="itemTableData"
            border
            style="width: 100%"
            :header-cell-style="{ background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-primary)' }"
          >
            <el-table-column prop="id" label="ID" width="80" align="center" />
            <el-table-column label="字典类型" width="150" align="center">
              <template #default="{ row }">
                <span>{{ dictTypeOptions.find(opt => opt.value === row.dictTypeId)?.label || row.dictTypeId }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="itemCode" label="字典项编码" width="150" show-overflow-tooltip />
            <el-table-column prop="itemName" label="字典项名称" width="150" show-overflow-tooltip />
            <el-table-column prop="value" label="字典项值" width="100" show-overflow-tooltip />
            <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
            <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" effect="light">
                  {{ getStatusName(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="170" align="center" />
            <el-table-column label="操作" width="150" fixed="right" align="center">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleItemEdit(row)">
                  <el-icon><Edit /></el-icon>编辑
                </el-button>
                <el-button type="danger" link @click="handleItemDelete(row)">
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="itemQueryForm.pageNum"
              v-model:page-size="itemQueryForm.pageSize"
              :page-sizes="[10, 20, 50]"
              :total="itemTotal"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleItemSizeChange"
              @current-change="handleItemCurrentChange"
            />
          </div>
        </el-card>

        <!-- 字典项编辑弹窗 -->
        <el-dialog
          v-model="itemEditDialogVisible"
          :title="itemIsAddMode ? '添加字典项' : '编辑字典项'"
          width="600px"
          @close="cancelItemEdit"
          destroy-on-close
        >
          <el-form
            ref="itemEditFormRef"
            :model="itemEditForm"
            :rules="itemEditFormRules"
            label-width="120px"
          >
            <el-form-item label="字典类型" prop="dictTypeId">
              <el-select v-model="itemEditForm.dictTypeId" placeholder="请选择字典类型" class="w-full">
                <el-option
                  v-for="item in dictTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="字典项编码" prop="itemCode">
              <el-input v-model="itemEditForm.itemCode" placeholder="请输入字典项编码" maxlength="50" show-word-limit />
            </el-form-item>
            <el-form-item label="字典项名称" prop="itemName">
              <el-input v-model="itemEditForm.itemName" placeholder="请输入字典项名称" maxlength="100" show-word-limit />
            </el-form-item>
            <el-form-item label="字典项值" prop="value">
              <el-input v-model="itemEditForm.value" placeholder="请输入字典项值" />
            </el-form-item>
            <el-form-item label="描述" prop="description">
              <el-input 
                v-model="itemEditForm.description" 
                type="textarea" 
                :rows="3"
                placeholder="请输入描述" 
                maxlength="200" 
                show-word-limit 
              />
            </el-form-item>
            <el-form-item label="排序顺序" prop="sortOrder">
              <el-input-number 
                v-model="itemEditForm.sortOrder" 
                :min="0" 
                :controls="false"
                class="w-full"
                placeholder="请输入排序顺序，数字越小越靠前"
              />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="itemEditForm.status" placeholder="请选择状态" class="w-full">
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="cancelItemEdit">取消</el-button>
              <el-button type="primary" @click="submitItemEdit">确定</el-button>
            </span>
          </template>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.dict-manage-view {
  padding: 20px;

  .dict-tabs {
    margin-bottom: 20px;
  }

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
      
      .add-btn {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }

  .w-100 {
    width: 100px;
  }

  .w-150 {
    width: 150px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
