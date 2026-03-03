<template>
  <div class="post-manage-page">
    <div class="page-header">
      <h1 class="page-title">帖子管理</h1>
      <div class="page-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索帖子标题"
          prefix-icon="Search"
          class="search-input"
        />
        <el-select v-model="postType" class="type-select">
          <el-option label="全部类型" value="all" />
          <el-option label="鱼获战报" value="0" />
          <el-option label="空军吐槽" value="1" />
          <el-option label="装备测评" value="2" />
        </el-select>
      </div>
    </div>

    <div class="post-table">
      <el-table :data="posts" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="帖子信息" min-width="300">
          <template #default="scope">
            <div class="post-info">
              <div class="post-title">{{ scope.row.title }}</div>
              <div class="post-meta">
                <span class="author">{{ scope.row.user_nickname }}</span>
                <span class="time">{{ scope.row.create_time }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="getTypeTag(scope.row.type)">
              {{ getTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="view_count" label="浏览" width="80" />
        <el-table-column prop="like_count" label="点赞" width="80" />
        <el-table-column prop="comment_count" label="评论" width="80" />
        <el-table-column prop="ai_audit_status" label="审核状态" width="100">
          <template #default="scope">
            <el-tag :type="getAuditTag(scope.row.ai_audit_status)">
              {{ getAuditText(scope.row.ai_audit_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewPost(scope.row)"> 查看 </el-button>
            <el-button size="small" type="primary" @click="topPost(scope.row)"> 置顶 </el-button>
            <el-button size="small" type="danger" @click="deletePost(scope.row)"> 删除 </el-button>
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
        :total="totalPosts"
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
const postType = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const totalPosts = ref(256)

// 模拟帖子数据
const posts = ref([
  {
    id: 101,
    title: '这就是路亚的魅力！米级翘嘴',
    user_nickname: '路亚疯子',
    type: 0,
    view_count: 1256,
    like_count: 89,
    comment_count: 23,
    ai_audit_status: 1,
    create_time: '2024-01-15 14:30:00',
  },
  {
    id: 102,
    title: '守了三天三夜，终于上岸了',
    user_nickname: '台钓老王',
    type: 0,
    view_count: 2341,
    like_count: 156,
    comment_count: 45,
    ai_audit_status: 1,
    create_time: '2024-01-15 10:15:00',
  },
  {
    id: 201,
    title: '今天去了老钓点，一口都没有',
    user_nickname: '空军司令',
    type: 1,
    view_count: 892,
    like_count: 45,
    comment_count: 18,
    ai_audit_status: 1,
    create_time: '2024-01-15 08:30:00',
  },
  {
    id: 301,
    title: '达亿瓦波纹鲤使用体验',
    user_nickname: '钓鱼达人',
    type: 2,
    view_count: 1567,
    like_count: 123,
    comment_count: 34,
    ai_audit_status: 2,
    create_time: '2024-01-14 16:45:00',
  },
])

// 获取类型标签
const getTypeTag = (type) => {
  const typeMap = {
    0: 'success',
    1: 'warning',
    2: 'info',
  }
  return typeMap[type] || 'info'
}

// 获取类型文本
const getTypeText = (type) => {
  const typeMap = {
    0: '鱼获战报',
    1: '空军吐槽',
    2: '装备测评',
  }
  return typeMap[type] || '未知'
}

// 获取审核状态标签
const getAuditTag = (status) => {
  const statusMap = {
    0: 'danger',
    1: 'success',
    2: 'warning',
  }
  return statusMap[status] || 'info'
}

// 获取审核状态文本
const getAuditText = (status) => {
  const statusMap = {
    0: '违规',
    1: '正常',
    2: '疑似',
  }
  return statusMap[status] || '未知'
}

// 查看帖子
const viewPost = (post) => {
  console.log('查看帖子:', post)
}

// 置顶帖子
const topPost = (post) => {
  console.log('置顶帖子:', post)
}

// 删除帖子
const deletePost = (post) => {
  console.log('删除帖子:', post)
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
.post-manage-page {
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

    .type-select {
      width: 120px;
    }
  }
}

.post-table {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: 2vh;

  :deep(.el-table) {
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .post-info {
    .post-title {
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5vh;
      line-height: 1.4;
    }

    .post-meta {
      display: flex;
      gap: 1.5vw;
      font-size: 0.9rem;
      color: var(--text-secondary);
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
  .post-manage-page {
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
