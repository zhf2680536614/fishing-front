<template>
  <div class="ai-audit-page">
    <div class="page-header">
      <h1 class="page-title">AI 智能审核</h1>
      <div class="page-actions">
        <el-button type="primary">
          <el-icon><Refresh /></el-icon> 刷新数据
        </el-button>
      </div>
    </div>

    <div class="audit-stats">
      <div class="stat-card">
        <div class="stat-number">{{ stats.totalPosts }}</div>
        <div class="stat-label">今日审核</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-number">{{ stats.suspiciousPosts }}</div>
        <div class="stat-label">疑似违规</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-number">{{ stats.violationPosts }}</div>
        <div class="stat-label">确认违规</div>
      </div>
      <div class="stat-card success">
        <div class="stat-number">{{ stats.passPosts }}</div>
        <div class="stat-label">审核通过</div>
      </div>
    </div>

    <div class="audit-table">
      <el-table :data="auditList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="内容" min-width="300">
          <template #default="scope">
            <div class="audit-content">
              <div class="content-text">{{ scope.row.content }}</div>
              <div class="content-meta">
                <span class="author">{{ scope.row.user_nickname }}</span>
                <span class="time">{{ scope.row.create_time }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="audit_type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.audit_type === 'text' ? 'info' : 'warning'">
              {{ scope.row.audit_type === 'text' ? '文本' : '图片' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ai_audit_status" label="AI 审核" width="100">
          <template #default="scope">
            <el-tag :type="getAuditTag(scope.row.ai_audit_status)">
              {{ getAuditText(scope.row.ai_audit_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ai_audit_reason" label="审核原因" min-width="200" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" type="success" @click="passAudit(scope.row)"> 通过 </el-button>
            <el-button size="small" type="danger" @click="rejectAudit(scope.row)"> 拒绝 </el-button>
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
        :total="totalAudits"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Refresh } from '@element-plus/icons-vue'

// 响应式数据
const currentPage = ref(1)
const pageSize = ref(10)
const totalAudits = ref(156)

// 统计数据
const stats = ref({
  totalPosts: 156,
  suspiciousPosts: 12,
  violationPosts: 5,
  passPosts: 139,
})

// 模拟审核数据
const auditList = ref([
  {
    id: 1,
    content: '今天去钓鱼，收获不错！',
    user_nickname: '钓鱼佬007',
    audit_type: 'text',
    ai_audit_status: 1,
    ai_audit_reason: '正常内容',
    create_time: '2024-01-15 14:30:00',
  },
  {
    id: 2,
    content: '出售各种钓鱼装备，价格优惠',
    user_nickname: '装备商',
    audit_type: 'text',
    ai_audit_status: 2,
    ai_audit_reason: '疑似广告内容',
    create_time: '2024-01-15 13:45:00',
  },
  {
    id: 3,
    content: '这是一张鱼获图片',
    user_nickname: '路亚疯子',
    audit_type: 'image',
    ai_audit_status: 1,
    ai_audit_reason: '正常图片',
    create_time: '2024-01-15 12:30:00',
  },
  {
    id: 4,
    content: '骂人内容，不文明用语',
    user_nickname: '不良用户',
    audit_type: 'text',
    ai_audit_status: 0,
    ai_audit_reason: '包含敏感词',
    create_time: '2024-01-15 11:15:00',
  },
])

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

// 通过审核
const passAudit = (item) => {
  item.ai_audit_status = 1
  console.log('通过审核:', item)
}

// 拒绝审核
const rejectAudit = (item) => {
  item.ai_audit_status = 0
  console.log('拒绝审核:', item)
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
.ai-audit-page {
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
}

.audit-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5vw;
  margin-bottom: 2vh;

  .stat-card {
    background: white;
    border-radius: var(--radius-lg);
    padding: 2vh;
    box-shadow: var(--shadow-md);
    text-align: center;

    &.warning {
      border-left: 4px solid var(--warning-color);
    }

    &.danger {
      border-left: 4px solid var(--danger-color);
    }

    &.success {
      border-left: 4px solid var(--success-color);
    }

    .stat-number {
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 0.5vh;
    }

    .stat-label {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
  }
}

.audit-table {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: 2vh;

  :deep(.el-table) {
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .audit-content {
    .content-text {
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 0.5vh;
      line-height: 1.4;
    }

    .content-meta {
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
  .ai-audit-page {
    padding: 2vh;
  }

  .audit-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
