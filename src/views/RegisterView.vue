<template>
  <div class="register-page">
    <!-- 动态背景 -->
    <AuthBackground particles-id="register-particles" />

    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <div class="logo-section">
            <div class="logo-icon">
              <el-icon><House /></el-icon>
            </div>
            <h1 class="app-name">
              <span class="text-gradient">鱼乐圈</span>
            </h1>
            <p class="app-slogan">加入钓友大家庭</p>
          </div>
        </div>

        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          class="register-form"
          @submit.prevent="handleRegister"
        >
          <div class="form-title">
            <h2>创建账户</h2>
            <p>开启您的钓鱼之旅</p>
          </div>

          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
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
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请确认密码"
              size="large"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="nickname">
            <el-input
              v-model="registerForm.nickname"
              placeholder="请输入昵称（选填）"
              size="large"
              clearable
            >
              <template #prefix>
                <el-icon><UserFilled /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="phone">
            <el-input
              v-model="registerForm.phone"
              placeholder="请输入手机号（选填）"
              size="large"
              clearable
            >
              <template #prefix>
                <el-icon><Phone /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="register-btn"
              :loading="loading"
              @click="handleRegister"
            >
              <el-icon class="btn-icon"><ArrowRight /></el-icon>
              立即注册
            </el-button>
          </el-form-item>

          <div class="form-footer">
            <span class="footer-text">已有账号？</span>
            <router-link to="/login" class="login-link">立即登录</router-link>
          </div>
        </el-form>
      </div>

      <!-- 装饰元素 -->
      <div class="decoration fish-icon fish-1">🎣</div>
      <div class="decoration fish-icon fish-2">🐟</div>
      <div class="decoration fish-icon fish-3">🦈</div>
      <div class="decoration fish-icon fish-4">🎏</div>
      <div class="decoration wave wave-1"></div>
      <div class="decoration wave wave-2"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { House, User, Lock, UserFilled, Phone, ArrowRight } from '@element-plus/icons-vue'
import { register } from '@/api/user'
import { useUserStore } from '@/stores/user'
import AuthBackground from '@/components/common/AuthBackground.vue'

const router = useRouter()
const userStore = useUserStore()

const registerFormRef = ref(null)
const loading = ref(false)

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  phone: '',
  roleDictTypeCode: 'user_role',
  roleDictItemCode: 'user',
  statusDictTypeCode: 'user_status',
  statusDictItemCode: 'normal',
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: '用户名只能包含字母、数字和下划线',
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' },
  ],
  nickname: [
    { max: 20, message: '昵称长度不能超过 20 个字符', trigger: 'blur' },
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号',
      trigger: 'blur',
    },
  ],
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await register({
          username: registerForm.username,
          password: registerForm.password,
          nickname: registerForm.nickname || registerForm.username,
          phone: registerForm.phone,
          roleDictTypeCode: registerForm.roleDictTypeCode,
          roleDictItemCode: registerForm.roleDictItemCode,
          statusDictTypeCode: registerForm.statusDictTypeCode,
          statusDictItemCode: registerForm.statusDictItemCode,
        })
        userStore.setToken(res.token)
        userStore.setUserInfo(res)
        ElMessage.success('注册成功')
        router.push('/home')
      } catch (error) {
        console.error('注册失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.register-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.register-container {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 28px;
  padding: 40px;
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
    background: linear-gradient(90deg, #667eea, #764ba2, #4facfe, #00f2fe);
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

.register-header {
  text-align: center;
  margin-bottom: 28px;
}

.logo-section {
  .logo-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    box-shadow:
      0 8px 32px rgba(102, 126, 234, 0.4),
      0 0 0 4px rgba(102, 126, 234, 0.1);
    animation: iconFloat 3s ease-in-out infinite;

    .el-icon {
      font-size: 32px;
      color: white;
    }
  }

  @keyframes iconFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  .app-name {
    font-size: 32px;
    font-weight: 800;
    margin: 0 0 8px 0;
    letter-spacing: 2px;

    .text-gradient {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #4facfe 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 2px 10px rgba(102, 126, 234, 0.2);
    }
  }

  .app-slogan {
    font-size: 14px;
    color: #909399;
    margin: 0;
    letter-spacing: 2px;
    font-weight: 500;
  }
}

.register-form {
  .form-title {
    text-align: center;
    margin-bottom: 24px;

    h2 {
      font-size: 24px;
      font-weight: 700;
      color: #303133;
      margin: 0 0 8px 0;
    }

    p {
      font-size: 14px;
      color: #909399;
      margin: 0;
    }
  }

  .el-form-item {
    margin-bottom: 16px;
  }

  .el-input {
    :deep(.el-input__wrapper) {
      border-radius: 12px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.8);
      box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.04),
        0 0 0 1px rgba(0, 0, 0, 0.05) inset;
      transition: all 0.3s ease;

      &:hover {
        box-shadow:
          0 4px 16px rgba(0, 0, 0, 0.08),
          0 0 0 1px rgba(102, 126, 234, 0.2) inset;
      }

      &.is-focus {
        box-shadow:
          0 4px 20px rgba(102, 126, 234, 0.15),
          0 0 0 2px rgba(102, 126, 234, 0.2) inset;
      }
    }

    :deep(.el-input__prefix) {
      margin-right: 10px;

      .el-icon {
        font-size: 18px;
        color: #909399;
        transition: color 0.3s ease;
      }
    }

    :deep(.el-input__inner) {
      font-size: 14px;

      &::placeholder {
        color: #c0c4cc;
      }
    }

    &:focus-within {
      :deep(.el-input__prefix .el-icon) {
        color: #667eea;
      }
    }
  }

  .register-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    box-shadow:
      0 8px 24px rgba(102, 126, 234, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.2) inset;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin-top: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    .btn-icon {
      font-size: 16px;
      transition: transform 0.3s ease;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow:
        0 12px 32px rgba(102, 126, 234, 0.5),
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
    text-align: center;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);

    .footer-text {
      font-size: 14px;
      color: #909399;
    }

    .login-link {
      font-size: 14px;
      color: #667eea;
      font-weight: 600;
      text-decoration: none;
      margin-left: 6px;
      transition: all 0.3s ease;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 0;
        height: 2px;
        background: linear-gradient(90deg, #667eea, #764ba2);
        transition: width 0.3s ease;
      }

      &:hover {
        color: #764ba2;

        &::after {
          width: 100%;
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

.fish-icon {
  font-size: 36px;
  opacity: 0.12;
  animation: swim 20s linear infinite;
  filter: blur(1px);
}

.fish-1 {
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.fish-2 {
  top: 40%;
  right: 8%;
  font-size: 28px;
  animation-delay: -5s;
}

.fish-3 {
  bottom: 30%;
  left: 10%;
  font-size: 24px;
  animation-delay: -10s;
}

.fish-4 {
  top: 70%;
  right: 5%;
  font-size: 32px;
  animation-delay: -15s;
}

@keyframes swim {
  0% {
    transform: translateX(0) translateY(0) rotate(0deg);
  }
  25% {
    transform: translateX(30px) translateY(-20px) rotate(5deg);
  }
  50% {
    transform: translateX(0) translateY(-10px) rotate(0deg);
  }
  75% {
    transform: translateX(-30px) translateY(-30px) rotate(-5deg);
  }
  100% {
    transform: translateX(0) translateY(0) rotate(0deg);
  }
}

.wave {
  width: 200px;
  height: 200px;
  border: 2px solid rgba(102, 126, 234, 0.1);
  border-radius: 50%;
  animation: ripple 8s ease-out infinite;
}

.wave-1 {
  bottom: -100px;
  right: -50px;
}

.wave-2 {
  top: -80px;
  left: -60px;
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
  .register-card {
    padding: 32px 20px;
    border-radius: 24px;
  }

  .logo-section {
    .app-name {
      font-size: 28px;
    }
  }

  .fish-icon {
    display: none;
  }
}
</style>
