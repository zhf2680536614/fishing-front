<script setup>
import { ref } from 'vue'

const stats = ref([
  { title: '总用户数', value: 1234, icon: 'User', color: '#00d4ff' },
  { title: '今日新增', value: 56, icon: 'UserFilled', color: '#00ffcc' },
  { title: '帖子总数', value: 892, icon: 'Document', color: '#0099ff' },
  { title: '待审核', value: 23, icon: 'Warning', color: '#f56c6c' },
])
</script>

<template>
  <div class="dashboard-view">
    <h2 class="page-title">仪表盘</h2>
    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.title" class="stat-card">
        <div class="stat-icon" :style="{ backgroundColor: stat.color + '20', color: stat.color }">
          <el-icon :size="32"><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-title">{{ stat.title }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-view {
  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #e2e8f0;
    margin-bottom: 24px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;

    .stat-card {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        border-color: rgba(0, 212, 255, 0.3);
        box-shadow: 0 8px 32px rgba(0, 212, 255, 0.1);
      }

      .stat-icon {
        width: 64px;
        height: 64px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .stat-info {
        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #e2e8f0;
          line-height: 1.2;
        }

        .stat-title {
          font-size: 14px;
          color: #94a3b8;
          margin-top: 4px;
        }
      }
    }
  }
}
</style>
