<template>
  <div class="contact-page">
    <div class="contact-header">
      <h1 class="page-title">联系我们</h1>
      <p class="page-subtitle">如有任何问题或建议，欢迎与我们联系</p>
    </div>
    
    <div class="contact-content">
      <div class="contact-info">
        <h2 class="section-title">联系方式</h2>
        <div class="contact-list">
          <div class="contact-item">
            <div class="contact-icon">
              <el-icon class="icon-large"><Message /></el-icon>
            </div>
            <div class="contact-details">
              <h3 class="contact-title">官方邮箱</h3>
              <p class="contact-text">House@club.com</p>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <el-icon class="icon-large"><House /></el-icon>
            </div>
            <div class="contact-details">
              <h3 class="contact-title">合作微信</h3>
              <p class="contact-text">House_master</p>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <el-icon class="icon-large"><MapLocation /></el-icon>
            </div>
            <div class="contact-details">
              <h3 class="contact-title">地址</h3>
              <p class="contact-text">钓鱼星球</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="contact-form">
        <h2 class="section-title">留言反馈</h2>
        <el-form :model="form" label-position="top" class="form-container">
          <el-form-item label="姓名" required>
            <el-input v-model="form.name" placeholder="请输入您的姓名" />
          </el-form-item>
          <el-form-item label="邮箱" required>
            <el-input v-model="form.email" type="email" placeholder="请输入您的邮箱" />
          </el-form-item>
          <el-form-item label="主题" required>
            <el-input v-model="form.subject" placeholder="请输入留言主题" />
          </el-form-item>
          <el-form-item label="留言内容" required>
            <el-input v-model="form.content" type="textarea" :rows="5" placeholder="请输入您的留言内容" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm" class="submit-btn">提交留言</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Message, House, MapLocation } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const form = ref({
  name: '',
  email: '',
  subject: '',
  content: ''
})

const submitForm = () => {
  // 这里可以添加表单验证逻辑
  if (!form.value.name || !form.value.email || !form.value.subject || !form.value.content) {
    ElMessage.error('请填写所有必填字段')
    return
  }
  
  // 模拟提交成功
  ElMessage.success('留言提交成功，我们会尽快回复您！')
  // 重置表单
  form.value = {
    name: '',
    email: '',
    subject: '',
    content: ''
  }
}
</script>

<style lang="scss" scoped>
.contact-page {
  padding: 60px 0;
  position: relative;
  z-index: 1;
}

.contact-header {
  text-align: center;
  margin-bottom: 60px;
  
  .page-title {
    font-size: 36px;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: 16px;
    position: relative;
    display: inline-block;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -12px;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 4px;
      background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
      border-radius: 2px;
    }
  }
  
  .page-subtitle {
    font-size: 18px;
    color: var(--text-light);
    margin-top: 24px;
  }
}

.contact-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
}

.contact-info {
  .section-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 32px;
    position: relative;
    padding-left: 20px;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 10px;
      width: 4px;
      height: 20px;
      background: linear-gradient(180deg, var(--primary-color), var(--accent-color));
      border-radius: 2px;
    }
  }
  
  .contact-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .contact-item {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all var(--transition-normal);
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }
    
    .contact-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
      flex-shrink: 0;
      
      .icon-large {
        font-size: 24px;
        color: white;
      }
    }
    
    .contact-details {
      flex: 1;
      
      .contact-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-color);
        margin-bottom: 8px;
      }
      
      .contact-text {
        font-size: 15px;
        color: var(--text-light);
        line-height: 1.6;
      }
    }
  }
}

.contact-form {
  .section-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 32px;
    position: relative;
    padding-left: 20px;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 10px;
      width: 4px;
      height: 20px;
      background: linear-gradient(180deg, var(--primary-color), var(--accent-color));
      border-radius: 2px;
    }
  }
  
  .form-container {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    .submit-btn {
      width: 100%;
      padding: 12px;
      font-size: 16px;
      font-weight: 500;
      background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
      border: none;
      border-radius: 8px;
      transition: all var(--transition-normal);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .contact-page {
    padding: 40px 0;
  }
  
  .contact-header {
    margin-bottom: 40px;
    
    .page-title {
      font-size: 28px;
    }
    
    .page-subtitle {
      font-size: 16px;
    }
  }
  
  .contact-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .contact-info {
    .section-title {
      font-size: 20px;
    }
    
    .contact-item {
      padding: 20px;
      
      .contact-icon {
        width: 50px;
        height: 50px;
        
        .icon-large {
          font-size: 20px;
        }
      }
    }
  }
  
  .contact-form {
    .section-title {
      font-size: 20px;
    }
    
    .form-container {
      padding: 24px;
    }
  }
}
</style>