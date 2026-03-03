<template>
  <div class="verify-master-page">
    <div class="page-header">
      <h1 class="page-title">大师认证</h1>
      <div class="page-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户昵称"
          prefix-icon="Search"
          class="search-input"
        />
      </div>
    </div>

    <div class="verify-table">
      <el-table :data="verifyRequests" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户信息" min-width="200">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :size="40" :src="scope.row.avatar" />
              <div class="user-details">
                <div class="username">{{ scope.row.username }}</div>
                <div class="nickname">{{ scope.row.nickname }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="fish_weight" label="最大鱼获" width="100">
          <template #default="scope"> {{ scope.row.fish_weight }}斤 </template>
        </el-table-column>
        <el-table-column prop="fishing_days" label="出钓天数" width="100" />
        <el-table-column prop="apply_time" label="申请时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" @click="approveRequest(scope.row)">
              通过
            </el-button>
            <el-button size="small" type="danger" @click="rejectRequest(scope.row)">
              拒绝
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
        :total="totalRequests"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 响应式数据
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalRequests = ref(24)

// 模拟认证请求数据
const verifyRequests = ref([
  {
    id: 1,
    username: 'user1',
    nickname: '钓鱼佬007',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    phone: '13900139000',
    fish_weight: 28.5,
    fishing_days: 128,
    apply_time: '2024-01-15 10:00:00',
  },
  {
    id: 2,
    username: 'user2',
    nickname: '路亚疯子',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    phone: '13700137000',
    fish_weight: 12.5,
    fishing_days: 89,
    apply_time: '2024-01-14 15:30:00',
  },
  {
    id: 3,
    username: 'user3',
    nickname: '台钓老王',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    phone: '13600136000',
    fish_weight: 32.0,
    fishing_days: 156,
    apply_time: '2024-01-13 09:15:00',
  },
])

// 批准请求
const approveRequest = (request) => {
  console.log('批准认证请求:', request)
}

// 拒绝请求
const rejectRequest = (request) => {
  console.log('拒绝认证请求:', request)
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
.verify-master-page {
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
    .search-input {
      width: 300px;
    }
  }
}

.verify-table {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: 2vh;

  :deep(.el-table) {
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1vw;

    .user-details {
      .username {
        font-weight: 600;
        color: var(--text-primary);
      }
      .nickname {
        font-size: 0.9rem;
        color: var(--text-secondary);
      }
    }
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 2vh;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .verify-master-page {
    padding: 2vh;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1vh;
  }

  .search-input {
    width: 100% !important;
  }
}
</style>
