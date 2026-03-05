<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Delete, View, Picture, ChatDotRound } from '@element-plus/icons-vue'
import { getCommentPage, getCommentManageById, deleteCommentManage } from '@/api/comment'
import { getDictItems } from '@/api/dict'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const queryForm = ref({
  pageNum: 1,
  pageSize: 10,
  postId: null,
  userId: null,
  content: '',
  isAiGeneratedDictItemCode: ''
})

const aiGeneratedOptions = ref([])

const viewDialogVisible = ref(false)
const viewForm = ref({})

const fetchCommentList = async () => {
  loading.value = true
  try {
    const params = { ...queryForm.value }
    if (!params.postId) delete params.postId
    if (!params.userId) delete params.userId
    if (!params.content) delete params.content
    if (!params.isAiGeneratedDictItemCode) delete params.isAiGeneratedDictItemCode

    const result = await getCommentPage(params)
    tableData.value = result.list || []
    total.value = result.total || 0
  } catch (error) {
    console.error('获取评论列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryForm.value.pageNum = 1
  fetchCommentList()
}

const handleReset = () => {
  queryForm.value = {
    pageNum: 1,
    pageSize: 10,
    postId: null,
    userId: null,
    content: '',
    isAiGeneratedDictItemCode: ''
  }
  fetchCommentList()
}

const handleSizeChange = (val) => {
  queryForm.value.pageSize = val
  fetchCommentList()
}

const handleCurrentChange = (val) => {
  queryForm.value.pageNum = val
  fetchCommentList()
}

const handleView = async (row) => {
  try {
    const comment = await getCommentManageById(row.id)
    viewForm.value = comment
    viewDialogVisible.value = true
  } catch (error) {
    console.error('获取评论详情失败:', error)
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除这条评论吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteCommentManage(row.id)
      ElMessage.success('删除成功')
      fetchCommentList()
    } catch (error) {
      console.error('删除评论失败:', error)
    }
  }).catch(() => {})
}

const getAiGeneratedName = (code) => {
  const option = aiGeneratedOptions.value.find(opt => opt.value === code)
  return option ? option.label : code
}

const getAiGeneratedType = (code) => {
  return code === 'yes' ? 'danger' : 'success'
}

const getContentPreview = (content) => {
  if (!content) return '-'
  return content.length > 50 ? content.substring(0, 50) + '...' : content
}

const fetchDictOptions = async () => {
  try {
    const items = await getDictItems('ai_generated')
    aiGeneratedOptions.value = items.map(item => ({
      label: item.itemName,
      value: item.itemCode,
      type: item.itemCode === 'yes' ? 'danger' : 'success'
    }))
  } catch (error) {
    console.error('获取AI生成字典失败:', error)
    // 如果字典不存在，使用默认值
    aiGeneratedOptions.value = [
      { label: '是', value: 'yes', type: 'danger' },
      { label: '否', value: 'no', type: 'success' }
    ]
  }
}

onMounted(() => {
  fetchDictOptions()
  fetchCommentList()
})
</script>

<template>
  <div class="comment-manage-view">
    <!-- 顶部搜索卡片 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryForm" inline class="search-form" @keyup.enter="handleSearch">
        <el-form-item label="帖子ID">
          <el-input-number v-model="queryForm.postId" placeholder="请输入帖子ID" :min="1" :controls="false" class="w-150" />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input-number v-model="queryForm.userId" placeholder="请输入用户ID" :min="1" :controls="false" class="w-150" />
        </el-form-item>
        <el-form-item label="评论内容">
          <el-input v-model="queryForm.content" placeholder="请输入评论内容" clearable class="w-200" />
        </el-form-item>
        <el-form-item label="AI生成">
          <el-select v-model="queryForm.isAiGeneratedDictItemCode" placeholder="请选择" clearable class="w-120">
            <el-option
              v-for="item in aiGeneratedOptions"
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
          <el-icon><ChatDotRound /></el-icon>
          评论列表
        </span>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        :header-cell-style="{ background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-primary)' }"
      >
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="postId" label="帖子ID" width="90" align="center" />
        <el-table-column prop="postTitle" label="帖子标题" min-width="150" show-overflow-tooltip />
        <el-table-column label="评论者" width="120" align="center">
          <template #default="{ row }">
            <div class="author-info">
              <el-avatar v-if="row.avatar" :src="row.avatar" :size="32" />
              <el-avatar v-else :size="32" :icon="Picture" />
              <span class="author-name">{{ row.nickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评论内容" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="content-preview">{{ getContentPreview(row.content) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="AI生成" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getAiGeneratedType(row.isAiGeneratedDictItemCode)" effect="light" size="small">
              {{ getAiGeneratedName(row.isAiGeneratedDictItemCode) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="评论时间" width="170" align="center" />
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
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
      title="评论详情"
      width="600px"
      destroy-on-close
    >
      <div class="comment-detail">
        <div class="detail-section">
          <h4 class="section-title">评论信息</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">评论ID：</span>
              <span class="info-value">{{ viewForm.id }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">帖子ID：</span>
              <span class="info-value">{{ viewForm.postId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">评论时间：</span>
              <span class="info-value">{{ viewForm.createTime }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">AI生成：</span>
              <el-tag :type="getAiGeneratedType(viewForm.isAiGeneratedDictItemCode)" effect="light" size="small">
                {{ getAiGeneratedName(viewForm.isAiGeneratedDictItemCode) }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">帖子信息</h4>
          <div class="post-info">
            <span class="post-title">{{ viewForm.postTitle || '未知帖子' }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">评论者信息</h4>
          <div class="author-detail">
            <el-avatar v-if="viewForm.avatar" :src="viewForm.avatar" :size="48" />
            <el-avatar v-else :size="48" :icon="Picture" />
            <div class="author-meta">
              <div class="author-name">{{ viewForm.nickname }}</div>
              <div class="author-username">@{{ viewForm.username }}</div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">评论内容</h4>
          <div class="content-box">
            {{ viewForm.content }}
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.comment-manage-view {
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

        .w-150 {
          width: 150px;
        }

        .w-200 {
          width: 200px;
        }

        .w-120 {
          width: 120px;
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

    .author-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .author-name {
        font-size: 13px;
        color: var(--el-text-color-primary);
      }
    }

    .content-preview {
      color: var(--el-text-color-regular);
    }

    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .comment-detail {
    .detail-section {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 12px 0;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--el-border-color-light);
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;

        .info-item {
          display: flex;
          align-items: center;

          .info-label {
            font-size: 13px;
            color: var(--el-text-color-secondary);
            width: 80px;
            flex-shrink: 0;
          }

          .info-value {
            font-size: 13px;
            color: var(--el-text-color-primary);
          }
        }
      }

      .post-info {
        background: var(--el-fill-color-light);
        padding: 12px 16px;
        border-radius: 6px;

        .post-title {
          font-size: 14px;
          color: var(--el-text-color-primary);
          font-weight: 500;
        }
      }

      .author-detail {
        display: flex;
        align-items: center;
        gap: 12px;
        background: var(--el-fill-color-light);
        padding: 16px;
        border-radius: 6px;

        .author-meta {
          .author-name {
            font-size: 14px;
            font-weight: 500;
            color: var(--el-text-color-primary);
            margin-bottom: 4px;
          }

          .author-username {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }
      }

      .content-box {
        background: var(--el-fill-color-light);
        padding: 16px;
        border-radius: 6px;
        font-size: 14px;
        line-height: 1.8;
        color: var(--el-text-color-regular);
        white-space: pre-wrap;
        word-break: break-all;
      }
    }
  }
}
</style>
