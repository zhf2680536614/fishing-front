<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Delete, Edit, Document } from '@element-plus/icons-vue'
import {
  getFishPage, getFishById, createFish, updateFish, deleteFish
} from '@/api/fish'

const loading = ref(false)

// 表格数据
const tableData = ref([])
const total = ref(0)
const queryForm = ref({
  pageNum: 1,
  pageSize: 10,
  name: '',
  alias: '',
  category: '',
  protectionLevel: null
})

// 编辑弹窗
const editDialogVisible = ref(false)
const editFormRef = ref(null)
const isAddMode = ref(false)
const editForm = ref({
  id: null,
  name: '',
  alias: '',
  category: '',
  protectionLevel: 0,
  habits: '',
  edibleValue: '',
  imgUrl: ''
})

const editFormRules = {
  name: [
    { required: true, message: '请输入鱼类名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请输入科属', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  protectionLevel: [
    { required: true, message: '请选择保护级别', trigger: 'change' }
  ]
}

// 保护级别选项
const protectionLevelOptions = ref([
  { label: '普通', value: 0 },
  { label: '保护动物(需放流)', value: 1 }
])

// 获取列表
const fetchList = async () => {
  loading.value = true
  try {
    const params = { ...queryForm.value }
    if (!params.name) delete params.name
    if (!params.alias) delete params.alias
    if (!params.category) delete params.category
    if (params.protectionLevel === null) delete params.protectionLevel
    
    const result = await getFishPage(params)
    tableData.value = result.list || []
    total.value = result.total || 0
  } catch (error) {
    console.error('获取鱼类百科列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryForm.value.pageNum = 1
  fetchList()
}

const handleReset = () => {
  queryForm.value = {
    pageNum: 1,
    pageSize: 10,
    name: '',
    alias: '',
    category: '',
    protectionLevel: null
  }
  fetchList()
}

// 分页处理
const handleSizeChange = (val) => {
  queryForm.value.pageSize = val
  fetchList()
}

const handleCurrentChange = (val) => {
  queryForm.value.pageNum = val
  fetchList()
}

// 编辑
const handleEdit = async (row) => {
  isAddMode.value = false
  try {
    const fish = await getFishById(row.id)
    editForm.value = {
      id: fish.id,
      name: fish.name,
      alias: fish.alias || '',
      category: fish.category,
      protectionLevel: fish.protectionLevel,
      habits: fish.habits || '',
      edibleValue: fish.edibleValue || '',
      imgUrl: fish.imgUrl || ''
    }
    editDialogVisible.value = true
  } catch (error) {
    console.error('获取鱼类百科信息失败:', error)
  }
}

const handleAdd = () => {
  isAddMode.value = true
  editForm.value = {
    id: null,
    name: '',
    alias: '',
    category: '',
    protectionLevel: 0,
    habits: '',
    edibleValue: '',
    imgUrl: ''
  }
  editDialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除鱼类百科 "${row.name}" 吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteFish(row.id)
      ElMessage.success('删除成功')
      fetchList()
    } catch (error) {
      console.error('删除鱼类百科失败:', error)
    }
  }).catch(() => {})
}

const submitEdit = async () => {
  if (!editFormRef.value) return
  
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = {
          name: editForm.value.name,
          alias: editForm.value.alias,
          category: editForm.value.category,
          protectionLevel: editForm.value.protectionLevel,
          habits: editForm.value.habits,
          edibleValue: editForm.value.edibleValue,
          imgUrl: editForm.value.imgUrl
        }
        
        if (isAddMode.value) {
          await createFish(data)
          ElMessage.success('添加成功')
        } else {
          await updateFish(editForm.value.id, data)
          ElMessage.success('更新成功')
        }
        editDialogVisible.value = false
        fetchList()
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

// 获取保护级别名称
const getProtectionLevelName = (level) => {
  const option = protectionLevelOptions.value.find(opt => opt.value === level)
  return option ? option.label : level
}

// 获取保护级别类型
const getProtectionLevelType = (level) => {
  return level === 1 ? 'warning' : 'success'
}

// 初始化
onMounted(() => {
  fetchList()
})
</script>

<template>
  <div class="fish-manage-view">
    <!-- 搜索卡片 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryForm" inline class="search-form" @keyup.enter="handleSearch">
        <el-form-item label="鱼类名称">
          <el-input v-model="queryForm.name" placeholder="请输入鱼类名称" clearable />
        </el-form-item>
        <el-form-item label="别名">
          <el-input v-model="queryForm.alias" placeholder="请输入别名" clearable />
        </el-form-item>
        <el-form-item label="科属">
          <el-input v-model="queryForm.category" placeholder="请输入科属" clearable />
        </el-form-item>
        <el-form-item label="保护级别">
          <el-select v-model="queryForm.protectionLevel" placeholder="请选择保护级别" clearable class="w-150">
            <el-option
              v-for="item in protectionLevelOptions"
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
        <span class="toolbar-title">鱼类百科列表</span>
        <div class="toolbar-actions">
          <el-button type="primary" @click="handleAdd" class="add-btn">
            <el-icon><Plus /></el-icon> 添加鱼类
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
        <el-table-column prop="name" label="鱼类名称" width="120" show-overflow-tooltip />
        <el-table-column prop="alias" label="别名" width="120" show-overflow-tooltip />
        <el-table-column prop="category" label="科属" width="120" show-overflow-tooltip />
        <el-table-column prop="habits" label="生活习性" min-width="200" show-overflow-tooltip />
        <el-table-column prop="edibleValue" label="食用价值" min-width="150" show-overflow-tooltip />
        <el-table-column label="保护级别" width="150" align="center">
          <template #default="{ row }">
            <el-tag :type="getProtectionLevelType(row.protectionLevel)" effect="light">
              {{ getProtectionLevelName(row.protectionLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="imgUrl" label="标准图鉴" width="100" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.imgUrl"
              :src="row.imgUrl"
              :preview-src-list="[row.imgUrl]"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px;"
            />
            <span v-else class="text-placeholder">暂无图片</span>
          </template>
        </el-table-column>
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

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="isAddMode ? '添加鱼类' : '编辑鱼类'"
      width="800px"
      @close="cancelEdit"
      destroy-on-close
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="鱼类名称" prop="name">
              <el-input v-model="editForm.name" placeholder="请输入鱼类名称" maxlength="50" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="别名" prop="alias">
              <el-input v-model="editForm.alias" placeholder="请输入别名" maxlength="100" show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="科属" prop="category">
              <el-input v-model="editForm.category" placeholder="请输入科属" maxlength="50" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保护级别" prop="protectionLevel">
              <el-select v-model="editForm.protectionLevel" placeholder="请选择保护级别" class="w-full">
                <el-option
                  v-for="item in protectionLevelOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="标准图鉴" prop="imgUrl">
          <el-input v-model="editForm.imgUrl" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="生活习性" prop="habits">
          <el-input 
            v-model="editForm.habits" 
            type="textarea" 
            :rows="4"
            placeholder="请输入生活习性" 
            maxlength="1000" 
            show-word-limit 
          />
        </el-form-item>
        <el-form-item label="食用价值" prop="edibleValue">
          <el-input 
            v-model="editForm.edibleValue" 
            type="textarea" 
            :rows="3"
            placeholder="请输入食用价值" 
            maxlength="200" 
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
  </div>
</template>

<style lang="scss" scoped>
.fish-manage-view {
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

    .text-placeholder {
      color: var(--el-text-color-secondary);
      font-size: 12px;
    }
  }

  .w-100 {
    width: 100px;
  }

  .w-150 {
    width: 150px;
  }

  .w-full {
    width: 100%;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
