<script setup>
import { ref } from 'vue'

const tableData = ref([])
</script>

<template>
  <div class="post-manage-view">
    <h2 class="page-title">社区帖子管理</h2>
    <div class="content-card">
      <el-empty description="社区帖子管理功能开发中" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.post-manage-view {
  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #e2e8f0;
    margin-bottom: 24px;
  }

  .content-card {
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 12px;
    padding: 40px;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
