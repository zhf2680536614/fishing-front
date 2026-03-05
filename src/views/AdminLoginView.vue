<template>
  <div class="admin-login-page">
    <!-- 动态背景 -->
    <AuthBackground particles-id="admin-login-particles" />

    <div class="admin-login-container">
      <div class="admin-login-card">
        <div class="login-header">
          <div class="logo-section">
            <div class="logo-icon">
              <el-icon><Setting /></el-icon>
            </div>
            <h1 class="app-name">
              <span class="text-gradient">管理后台</span>
            </h1>
            <p class="app-slogan">鱼乐圈 · 系统管理</p>
          </div>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <div class="form-title">
            <h2>管理员登录</h2>
            <p>请输入管理员账号和密码</p>
          </div>

          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入管理员账号"
              size="large"
              clearable
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              <el-icon class="btn-icon"><ArrowRight /></el-icon>
              登录管理后台
            </el-button>
          </el-form-item>

          <div class="form-footer">
            <router-link to="/login" class="back-link">
              <el-icon><ArrowLeft /></el-icon>
              返回用户登录
            </router-link>
          </div>
        </el-form>
      </div>

      <!-- 装饰元素 -->
      <div class="decoration gear-icon gear-1">⚙️</div>
      <div class="decoration gear-icon gear-2">🔧</div>
      <div class="decoration gear-icon gear-3">🔒</div>
      <div class="decoration wave wave-1"></div>
      <div class="decoration wave wave-2"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Setting, User, Lock, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { login } from '@/api/user'
import { useUserStore } from '@/stores/user'
import AuthBackground from '@/components/common/AuthBackground.vue'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
})

const loginRules = {
  username: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await login(loginForm)
        // 检查是否为管理员
        if (res.roleDictItemCode !== 'admin') {
          ElMessage.error('该账号无管理员权限')
          return
        }
        userStore.setToken(res.token)
        userStore.setUserInfo(res)
        ElMessage.success('管理员登录成功')
        router.push('/admin')
      } catch (error) {
        console.error('登录失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.admin-login-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.admin-login-container {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.admin-login-card {
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 28px;
  padding: 48px 40px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #1a1a2e, #16213e, #0f3460, #e94560);
    background-size: 300% 100%;
    animation: gradientFlow 3s ease infinite;
  }
}

@keyframes gradientFlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.logo-section {
  .logo-icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    box-shadow:
      0 8px 32px rgba(15, 52, 96, 0.4),
      0 0 0 4px rgba(15, 52, 96, 0.1);
    animation: iconFloat 3s ease-in-out infinite;

    .el-icon {
      font-size: 36px;
      color: white;
    }
  }

  @keyframes iconFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  .app-name {
    font-size: 36px;
    font-weight: 800;
    margin: 0 0 10px 0;
    letter-spacing: 2px;

    .text-gradient {
      background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 50%, #e94560 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 2px 10px rgba(15, 52, 96, 0.2);
    }
  }

  .app-slogan {
    font-size: 15px;
    color: #909399;
    margin: 0;
    letter-spacing: 3px;
    font-weight: 500;
  }
}

.login-form {
  .form-title {
    text-align: center;
    margin-bottom: 32px;

    h2 {
      font-size: 26px;
      font-weight: 700;
      color: #303133;
      margin: 0 0 10px 0;
    }

    p {
      font-size: 14px;
      color: #909399;
      margin: 0;
    }
  }

  .el-form-item {
    margin-bottom: 20px;
  }

  .el-input {
    :deep(.el-input__wrapper) {
      border-radius: 14px;
      padding: 14px 18px;
      background: rgba(255, 255, 255, 0.8);
      box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.04),
        0 0 0 1px rgba(0, 0, 0, 0.05) inset;
      transition: all 0.3s ease;

      &:hover {
        box-shadow:
          0 4px 16px rgba(0, 0, 0, 0.08),
          0 0 0 1px rgba(15, 52, 96, 0.2) inset;
      }

      &.is-focus {
        box-shadow:
          0 4px 20px rgba(15, 52, 96, 0.15),
          0 0 0 2px rgba(15, 52, 96, 0.2) inset;
      }
    }

    :deep(.el-input__prefix) {
      margin-right: 12px;

      .el-icon {
        font-size: 20px;
        color: #909399;
        transition: color 0.3s ease;
      }
    }

    :deep(.el-input__inner) {
      font-size: 15px;

      &::placeholder {
        color: #c0c4cc;
      }
    }

    &:focus-within {
      :deep(.el-input__prefix .el-icon) {
        color: #0f3460;
      }
    }
  }

  .login-btn {
    width: 100%;
    height: 52px;
    font-size: 17px;
    font-weight: 600;
    border-radius: 14px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    border: none;
    box-shadow:
      0 8px 24px rgba(15, 52, 96, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.2) inset;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin-top: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    .btn-icon {
      font-size: 18px;
      transition: transform 0.3s ease;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow:
        0 12px 32px rgba(15, 52, 96, 0.5),
        0 0 0 1px rgba(255, 255, 255, 0.3) inset;

      .btn-icon {
        transform: translateX(4px);
      }
    }

    &:active {
      transform: translateY(0);
    }
  }

  .form-footer {
    display: flex;
    justify-content: center;
    margin-top: 28px;
    padding-top: 24px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #606266;
      text-decoration: none;
      transition: all 0.3s ease;
      padding: 8px 16px;
      border-radius: 10px;

      .el-icon {
        font-size: 14px;
        transition: transform 0.3s ease;
      }

      &:hover {
        color: #0f3460;
        background: rgba(15, 52, 96, 0.08);

        .el-icon {
          transform: translateX(-4px);
        }
      }
    }
  }
}

/* 装饰元素 */
.decoration {
  position: fixed;
  pointer-events: none;
  z-index: 5;
}

.gear-icon {
  font-size: 36px;
  opacity: 0.12;
  animation: rotate 20s linear infinite;
  filter: blur(1px);
}

.gear-1 {
  top: 15%;
  right: 10%;
  animation-duration: 25s;
}

.gear-2 {
  top: 50%;
  left: 8%;
  font-size: 28px;
  animation-duration: 20s;
  animation-direction: reverse;
}

.gear-3 {
  bottom: 25%;
  right: 12%;
  font-size: 32px;
  animation-duration: 30s;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.wave {
  width: 200px;
  height: 200px;
  border: 2px solid rgba(15, 52, 96, 0.1);
  border-radius: 50%;
  animation: ripple 8s ease-out infinite;
}

.wave-1 {
  bottom: -100px;
  left: -50px;
}

.wave-2 {
  top: -80px;
  right: -60px;
  animation-delay: -4s;
}

@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 0.3;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* 响应式适配 */
@media (max-width: 480px) {
  .admin-login-card {
    padding: 36px 24px;
    border-radius: 24px;
  }

  .logo-section {
    .app-name {
      font-size: 28px;
    }
  }

  .gear-icon {
    display: none;
  }
}
</style>
