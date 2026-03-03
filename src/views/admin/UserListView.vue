<template>
  <div class="user-list-page">
    <div class="page-header">
      <h1 class="page-title">用户列表</h1>
      <div class="page-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户名或昵称"
          prefix-icon="Search"
          class="search-input"
        />
        <el-button type="primary">
          <el-icon><Plus /></el-icon> 新增用户
        </el-button>
      </div>
    </div>

    <div class="user-table">
      <el-table :data="users" style="width: 100%">
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
        <el-table-column prop="role" label="角色" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.role === 1 ? 'primary' : 'info'">
              {{ scope.row.role === 1 ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_master" label="大师认证" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.is_master ? 'success' : 'info'">
              {{ scope.row.is_master ? '已认证' : '未认证' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status ? 'success' : 'danger'">
              {{ scope.row.status ? '正常' : '封禁' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="注册时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="editUser(scope.row)"> 编辑 </el-button>
            <el-button
              size="small"
              :type="scope.row.status ? 'danger' : 'success'"
              @click="toggleStatus(scope.row)"
            >
              {{ scope.row.status ? '封禁' : '解封' }}
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
        :total="totalUsers"
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
const totalUsers = ref(128)

// 模拟用户数据
const users = ref([
  {
    id: 1,
    username: 'admin',
    nickname: '管理员',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    phone: '13800138000',
    role: 1,
    is_master: false,
    status: 1,
    create_time: '2024-01-01 00:00:00',
  },
  {
    id: 2,
    username: 'user1',
    nickname: '钓鱼佬007',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    phone: '13900139000',
    role: 0,
    is_master: true,
    status: 1,
    create_time: '2024-01-02 12:00:00',
  },
  {
    id: 3,
    username: 'user2',
    nickname: '路亚疯子',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    phone: '13700137000',
    role: 0,
    is_master: false,
    status: 1,
    create_time: '2024-01-03 18:00:00',
  },
  {
    id: 4,
    username: 'user3',
    nickname: '台钓老王',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    phone: '13600136000',
    role: 0,
    is_master: false,
    status: 0,
    create_time: '2024-01-04 09:00:00',
  },
])

// 编辑用户
const editUser = (user) => {
  console.log('编辑用户:', user)
}

// 切换状态
const toggleStatus = (user) => {
  user.status = !user.status
  console.log('切换用户状态:', user)
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
.user-list-page {
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

.user-table {
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
  .user-list-page {
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
