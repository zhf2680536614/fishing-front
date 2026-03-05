<script setup>
import { ref } from 'vue'

const form = ref({
  nickname: '',
  email: '',
  phone: '',
})
</script>

<template>
  <div class="admin-profile-view">
    <h2 class="page-title">个人设置</h2>
    <div class="content-card">
      <el-empty description="个人设置功能开发中" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-profile-view {
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
