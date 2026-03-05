<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, View, Edit, Delete, ShoppingBag, User, Phone, Location } from '@element-plus/icons-vue'
import { getOrderPage, getOrderManageById, updateOrderStatus, deleteOrderManage } from '@/api/order'
import { getDictItems } from '@/api/dict'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const queryForm = ref({
  pageNum: 1,
  pageSize: 10,
  gearTitle: '',
  statusDictItemCode: '',
  userId: null,
  contactPhone: '',
  startTime: '',
  endTime: ''
})

const statusOptions = ref([])

const viewDialogVisible = ref(false)
const editStatusDialogVisible = ref(false)
const viewForm = ref({})
const editStatusForm = ref({
  id: null,
  statusDictTypeCode: 'order_status',
  statusDictItemCode: ''
})
const editStatusFormRef = ref(null)

const editStatusFormRules = {
  statusDictItemCode: [
    { required: true, message: '请选择订单状态', trigger: 'change' }
  ]
}

const fetchOrderList = async () => {
  loading.value = true
  try {
    const params = { ...queryForm.value }
    if (!params.gearTitle) delete params.gearTitle
    if (!params.statusDictItemCode) delete params.statusDictItemCode
    if (!params.userId) delete params.userId
    if (!params.contactPhone) delete params.contactPhone
    if (!params.startTime) delete params.startTime
    if (!params.endTime) delete params.endTime

    const result = await getOrderPage(params)
    tableData.value = result.list || []
    total.value = result.total || 0
  } catch (error) {
    console.error('获取订单列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryForm.value.pageNum = 1
  fetchOrderList()
}

const handleReset = () => {
  queryForm.value = {
    pageNum: 1,
    pageSize: 10,
    gearTitle: '',
    statusDictItemCode: '',
    userId: null,
    contactPhone: '',
    startTime: '',
    endTime: ''
  }
  fetchOrderList()
}

const handleSizeChange = (val) => {
  queryForm.value.pageSize = val
  fetchOrderList()
}

const handleCurrentChange = (val) => {
  queryForm.value.pageNum = val
  fetchOrderList()
}

const handleView = async (row) => {
  try {
    const order = await getOrderManageById(row.id)
    viewForm.value = order
    viewDialogVisible.value = true
  } catch (error) {
    console.error('获取订单详情失败:', error)
  }
}

const handleEditStatus = (row) => {
  editStatusForm.value = {
    id: row.id,
    statusDictTypeCode: 'order_status',
    statusDictItemCode: row.statusDictItemCode
  }
  editStatusDialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除订单 "${row.gearTitle}" 吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteOrderManage(row.id)
      ElMessage.success('删除成功')
      fetchOrderList()
    } catch (error) {
      console.error('删除订单失败:', error)
    }
  }).catch(() => {})
}

const submitStatusEdit = async () => {
  if (!editStatusFormRef.value) return

  await editStatusFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await updateOrderStatus(editStatusForm.value.id, {
          statusDictTypeCode: editStatusForm.value.statusDictTypeCode,
          statusDictItemCode: editStatusForm.value.statusDictItemCode
        })
        ElMessage.success('更新成功')
        editStatusDialogVisible.value = false
        fetchOrderList()
      } catch (error) {
        console.error('更新订单状态失败:', error)
      }
    }
  })
}

const cancelStatusEdit = () => {
  editStatusDialogVisible.value = false
  setTimeout(() => {
    editStatusFormRef.value?.resetFields()
  }, 300)
}

const getStatusName = (code) => {
  const option = statusOptions.value.find(opt => opt.value === code)
  return option ? option.label : code
}

const getStatusType = (code) => {
  const option = statusOptions.value.find(opt => opt.value === code)
  return option?.type || 'info'
}

const fetchDictOptions = async () => {
  try {
    const statusItems = await getDictItems('order_status')
    statusOptions.value = statusItems.map(item => ({
      label: item.itemName,
      value: item.itemCode,
      type: item.itemCode === 'unpaid' ? 'warning' : item.itemCode === 'paid' ? 'primary' : item.itemCode === 'shipped' ? 'success' : item.itemCode === 'completed' ? 'success' : 'info'
    }))
  } catch (error) {
    console.error('获取订单状态字典失败:', error)
  }
}

onMounted(() => {
  fetchDictOptions()
  fetchOrderList()
})
</script>

<template>
  <div class="order-manage-view">
    <!-- 顶部搜索卡片 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryForm" inline class="search-form" @keyup.enter="handleSearch">
        <el-form-item label="装备标题">
          <el-input v-model="queryForm.gearTitle" placeholder="请输入装备标题" clearable />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="queryForm.statusDictItemCode" placeholder="请选择状态" clearable class="w-150">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input-number v-model="queryForm.userId" placeholder="请输入用户ID" :min="1" :controls="false" class="w-120" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="queryForm.contactPhone" placeholder="请输入联系电话" clearable />
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker
            v-model="queryForm.startTime"
            type="datetime"
            placeholder="开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            class="w-180"
          />
          <span class="date-separator">-</span>
          <el-date-picker
            v-model="queryForm.endTime"
            type="datetime"
            placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            class="w-180"
          />
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
          <el-icon><ShoppingBag /></el-icon>
          订单列表
        </span>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        :header-cell-style="{ background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-primary)' }"
      >
        <el-table-column prop="id" label="订单ID" width="80" align="center" />
        <el-table-column label="用户信息" width="180" align="center">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar v-if="row.avatar" :src="row.avatar" :size="32" />
              <el-avatar v-else :size="32" :icon="User" />
              <div class="user-detail">
                <div class="user-nickname">{{ row.nickname }}</div>
                <div class="user-id">ID: {{ row.userId }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="gearTitle" label="装备标题" min-width="150" show-overflow-tooltip />
        <el-table-column label="价格" width="100" align="center">
          <template #default="{ row }">
            <span class="price-text">¥{{ row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.statusDictItemCode)" effect="light">
              {{ getStatusName(row.statusDictItemCode) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="联系电话" width="130" align="center">
          <template #default="{ row }">
            <div class="phone-info">
              <el-icon><Phone /></el-icon>
              <span>{{ row.contactPhone }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="170" align="center" />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="primary" link @click="handleEditStatus(row)">修改状态</el-button>
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
      title="订单详情"
      width="700px"
      destroy-on-close
    >
      <div class="order-detail">
        <div class="detail-header">
          <h3 class="order-title">订单 #{{ viewForm.id }}</h3>
          <el-tag :type="getStatusType(viewForm.statusDictItemCode)" effect="light" size="large">
            {{ getStatusName(viewForm.statusDictItemCode) }}
          </el-tag>
        </div>

        <div class="detail-content">
          <div class="section">
            <h4 class="section-title">用户信息</h4>
            <div class="user-detail-info">
              <div class="info-item">
                <span class="label">用户ID：</span>
                <span class="value">{{ viewForm.userId }}</span>
              </div>
              <div class="info-item">
                <span class="label">用户名：</span>
                <span class="value">{{ viewForm.username }}</span>
              </div>
              <div class="info-item">
                <span class="label">昵称：</span>
                <span class="value">{{ viewForm.nickname }}</span>
              </div>
              <div class="info-item">
                <span class="label">手机号：</span>
                <span class="value">{{ viewForm.phone }}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h4 class="section-title">装备信息</h4>
            <div class="gear-detail-info">
              <div class="info-item">
                <span class="label">装备ID：</span>
                <span class="value">{{ viewForm.gearId }}</span>
              </div>
              <div class="info-item">
                <span class="label">装备标题：</span>
                <span class="value">{{ viewForm.gearTitle }}</span>
              </div>
              <div class="info-item">
                <span class="label">装备价格：</span>
                <span class="value price-value">¥{{ viewForm.gearPrice }}</span>
              </div>
              <div class="info-item">
                <span class="label">订单金额：</span>
                <span class="value price-value">¥{{ viewForm.totalAmount }}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h4 class="section-title">收货信息</h4>
            <div class="address-info">
              <div class="info-item">
                <span class="label">联系电话：</span>
                <span class="value">{{ viewForm.contactPhone }}</span>
              </div>
              <div class="info-item">
                <span class="label">收货地址：</span>
                <span class="value">{{ viewForm.address }}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h4 class="section-title">订单信息</h4>
            <div class="order-info">
              <div class="info-item">
                <span class="label">下单时间：</span>
                <span class="value">{{ viewForm.createTime }}</span>
              </div>
              <div class="info-item">
                <span class="label">更新时间：</span>
                <span class="value">{{ viewForm.updateTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 修改状态弹窗 -->
    <el-dialog
      v-model="editStatusDialogVisible"
      title="修改订单状态"
      width="500px"
      @close="cancelStatusEdit"
      destroy-on-close
    >
      <el-form
        ref="editStatusFormRef"
        :model="editStatusForm"
        :rules="editStatusFormRules"
        label-width="100px"
      >
        <el-form-item label="订单状态" prop="statusDictItemCode">
          <el-select v-model="editStatusForm.statusDictItemCode" placeholder="请选择状态" class="w-full">
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
          <el-button @click="cancelStatusEdit">取消</el-button>
          <el-button type="primary" @click="submitStatusEdit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.order-manage-view {
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

        .w-180 {
          width: 180px;
        }

        .date-separator {
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

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .user-detail {
        text-align: left;

        .user-nickname {
          font-size: 13px;
          color: var(--el-text-color-primary);
          margin-bottom: 2px;
        }

        .user-id {
          font-size: 11px;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .price-text {
      font-size: 14px;
      font-weight: 600;
      color: var(--el-color-danger);
    }

    .phone-info {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: var(--el-text-color-regular);
    }

    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .order-detail {
    .detail-header {
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--el-border-color-light);
      display: flex;
      justify-content: space-between;
      align-items: center;

      .order-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0;
      }
    }

    .detail-content {
      .section {
        margin-bottom: 24px;

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin: 0 0 12px 0;
          display: flex;
          align-items: center;
          gap: 6px;

          &::before {
            content: '';
            width: 3px;
            height: 14px;
            background-color: var(--el-color-primary);
            border-radius: 2px;
          }
        }

        .info-item {
          display: flex;
          margin-bottom: 10px;
          font-size: 14px;

          .label {
            width: 100px;
            color: var(--el-text-color-secondary);
            flex-shrink: 0;
          }

          .value {
            flex: 1;
            color: var(--el-text-color-primary);
            word-break: break-all;

            &.price-value {
              font-weight: 600;
              color: var(--el-color-danger);
            }
          }
        }
      }
    }
  }

  .w-full {
    width: 100%;
  }
}
</style>
