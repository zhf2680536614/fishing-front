<template>
  <div class="spots-page">
    <div class="page-header">
      <h1 class="page-title">钓点管理</h1>
      <div class="page-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索钓点名称"
          prefix-icon="Search"
          class="search-input"
        />
        <el-button type="primary">
          <el-icon><Plus /></el-icon> 新增钓点
        </el-button>
      </div>
    </div>

    <div class="spots-table">
      <el-table :data="spots" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="钓点名称" min-width="150" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="getTypeTag(scope.row.type)">
              {{ getTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" min-width="200" />
        <el-table-column prop="price_desc" label="收费" width="120" />
        <el-table-column prop="fish_info" label="常见鱼种" min-width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="editSpot(scope.row)"> 编辑 </el-button>
            <el-button
              size="small"
              :type="scope.row.status === 1 ? 'danger' : 'success'"
              @click="toggleStatus(scope.row)"
            >
              {{ scope.row.status === 1 ? '下架' : '上架' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalSpots"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'

// 响应式数据
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalSpots = ref(1024)

// 模拟钓点数据
const spots = ref([
  {
    id: 1,
    name: '西湖垂钓区',
    type: 0,
    address: '杭州市西湖区西湖景区',
    price_desc: '免费',
    fish_info: '鲫鱼、鲤鱼、草鱼',
    status: 1,
  },
  {
    id: 2,
    name: '钱塘江野钓点',
    type: 0,
    address: '杭州市江干区钱塘江畔',
    price_desc: '免费',
    fish_info: '翘嘴、鲈鱼、鲶鱼',
    status: 1,
  },
  {
    id: 3,
    name: '千岛湖黑坑',
    type: 1,
    address: '杭州市淳安县千岛湖',
    price_desc: '100元/天',
    fish_info: '青鱼、草鱼、鳙鱼',
    status: 1,
  },
  {
    id: 4,
    name: '西溪湿地路亚基地',
    type: 2,
    address: '杭州市余杭区西溪湿地',
    price_desc: '150元/天',
    fish_info: '鲈鱼、鳜鱼、黑鱼',
    status: 0,
  },
])

// 获取类型标签
const getTypeTag = (type) => {
  const typeMap = {
    0: 'success',
    1: 'warning',
    2: 'primary',
  }
  return typeMap[type] || 'info'
}

// 获取类型文本
const getTypeText = (type) => {
  const typeMap = {
    0: '野钓',
    1: '黑坑',
    2: '路亚',
  }
  return typeMap[type] || '未知'
}

// 获取状态标签
const getStatusTag = (status) => {
  const statusMap = {
    0: 'danger',
    1: 'success',
    2: 'warning',
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '审核中',
    1: '已发布',
    2: '已下架',
  }
  return statusMap[status] || '未知'
}

// 编辑钓点
const editSpot = (spot) => {
  console.log('编辑钓点:', spot)
}

// 切换状态
const toggleStatus = (spot) => {
  spot.status = spot.status === 1 ? 2 : 1
  console.log('切换钓点状态:', spot)
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (current) => {
  currentPage.value = current
}
</script>

<style lang="scss" scoped>
.spots-page {
  padding: 2vw;
  height: 100%;
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2vh;

  .page-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }

  .page-actions {
    display: flex;
    gap: 1vw;

    .search-input {
      width: 300px;
    }
  }
}

.spots-table {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: 2vh;

  :deep(.el-table) {
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 2vh;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .spots-page {
    padding: 2vh;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1vh;
  }

  .page-actions {
    flex-direction: column;

    .search-input {
      width: 100%;
    }
  }
}
</style>
