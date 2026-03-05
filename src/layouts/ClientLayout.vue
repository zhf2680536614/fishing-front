<template>
  <div class="client-layout">
    <!-- 渐变流动背景 -->
    <div class="gradient-bg">
      <div class="gradient-blob blob-1"></div>
      <div class="gradient-blob blob-2"></div>
      <div class="gradient-blob blob-3"></div>
      <div class="gradient-blob blob-4"></div>
    </div>
    <!-- 波浪粒子背景 -->
    <div id="tsparticles" class="particles-container"></div>

    <!-- 顶部导航栏 -->
    <header class="header-glass">
      <div class="header-content">
        <!-- Logo区域 -->
        <div class="logo" @click="$router.push('/')">
          <div class="logo-icon-container">
            <!-- <el-icon class="logo-icon"><House /></el-icon> -->
          </div>
          <div class="logo-text-container">
            <span class="logo-text">鱼乐圈</span>
            <span class="sub-text">永不空军</span>
          </div>
        </div>

        <!-- 导航菜单 -->
        <nav class="nav-menu" v-if="!isMobile">
          <router-link to="/home" class="nav-item" active-class="active">
            <el-icon class="nav-icon"><House /></el-icon>
            <span>首页</span>
          </router-link>
          <router-link to="/map" class="nav-item" active-class="active">
            <el-icon class="nav-icon"><MapLocation /></el-icon>
            <span>智能钓点</span>
          </router-link>
          <router-link to="/community" class="nav-item" active-class="active">
            <el-icon class="nav-icon"><ChatLineSquare /></el-icon>
            <span>社区论坛</span>
          </router-link>
          <router-link to="/ai-tools" class="nav-item ai-link" active-class="active">
            <el-icon class="nav-icon"><Cpu /></el-icon>
            <span>AI 垂钓助手</span>
            <el-tag size="small" type="danger" effect="dark" round class="hot-tag">HOT</el-tag>
          </router-link>
          <router-link to="/market" class="nav-item" active-class="active">
            <el-icon class="nav-icon"><ShoppingBag /></el-icon>
            <span>装备交易</span>
          </router-link>
        </nav>

        <!-- 移动端菜单按钮 -->
        <div class="mobile-menu-btn" v-else @click="showMobileMenu = !showMobileMenu">
          <el-icon :size="28"><component :is="showMobileMenu ? 'Close' : 'Menu'" /></el-icon>
        </div>

        <!-- 右侧操作区 -->
        <div class="user-actions" v-if="!isMobile">

          <div class="user-profile" v-if="isLogin">
            <el-dropdown trigger="click">
              <div class="avatar-wrapper">
                <el-avatar
                  :size="40"
                  :src="userInfo?.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'"
                  class="user-avatar"
                />
                <span class="username">{{ userInfo?.nickname || userInfo?.username || '钓鱼佬' }}</span>
                <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu class="user-dropdown">
                  <el-dropdown-item @click="$router.push('/profile')">
                    <el-icon><User /></el-icon>
                    <span>个人中心</span>
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">
                    <el-icon><SwitchButton /></el-icon>
                    <span>退出登录</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="login-links" v-else>
            <el-button link class="login-btn" @click="$router.push('/login')">登录</el-button>
            <el-button type="primary" class="register-btn" @click="$router.push('/register')">注册</el-button>
          </div>
        </div>
      </div>

      <!-- 移动端导航菜单 -->
      <div class="mobile-nav" v-if="showMobileMenu">
        <div class="mobile-nav-content">
          <div class="mobile-nav-header">
            <div class="mobile-logo">
              <el-icon class="mobile-logo-icon"><House /></el-icon>
              <span class="mobile-logo-text">鱼乐圈</span>
            </div>
            <el-icon class="mobile-close-btn" @click="showMobileMenu = false"><Close /></el-icon>
          </div>
          <div class="mobile-nav-menu">
            <router-link
              to="/home"
              class="mobile-nav-item"
              active-class="active"
              @click="showMobileMenu = false"
            >
              <el-icon class="mobile-nav-icon"><House /></el-icon>
              <span>首页</span>
            </router-link>
            <router-link
              to="/map"
              class="mobile-nav-item"
              active-class="active"
              @click="showMobileMenu = false"
            >
              <el-icon class="mobile-nav-icon"><MapLocation /></el-icon>
              <span>智能钓点</span>
            </router-link>
            <router-link
              to="/community"
              class="mobile-nav-item"
              active-class="active"
              @click="showMobileMenu = false"
            >
              <el-icon class="mobile-nav-icon"><ChatLineSquare /></el-icon>
              <span>社区论坛</span>
            </router-link>
            <router-link
              to="/ai-tools"
              class="mobile-nav-item"
              active-class="active"
              @click="showMobileMenu = false"
            >
              <el-icon class="mobile-nav-icon"><Cpu /></el-icon>
              <span>AI 垂钓助手</span>
              <el-tag size="small" type="danger" effect="dark" round class="mobile-hot-tag"
                >HOT</el-tag
              >
            </router-link>
            <router-link
              to="/market"
              class="mobile-nav-item"
              active-class="active"
              @click="showMobileMenu = false"
            >
              <el-icon class="mobile-nav-icon"><ShoppingBag /></el-icon>
              <span>装备交易</span>
            </router-link>
            <router-link
              to="/profile"
              class="mobile-nav-item"
              active-class="active"
              @click="showMobileMenu = false"
            >
              <el-icon class="mobile-nav-icon"><User /></el-icon>
              <span>个人中心</span>
            </router-link>
          </div>
          <div class="mobile-actions">
            <el-button
              type="primary"
              class="mobile-post-btn"
              @click="$router.push('/community/post')"
            >
              <el-icon><Camera /></el-icon>
              <span>发布战报</span>
            </el-button>
            <div class="mobile-auth-buttons" v-if="!isLogin">
              <el-button link class="mobile-login-btn" @click="$router.push('/login')">登录</el-button>
              <el-button type="primary" plain class="mobile-register-btn" @click="$router.push('/register')">注册</el-button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主体内容区 (带过渡动画) -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 底部Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-col footer-brand">
          <div class="footer-logo">
            <span class="footer-logo-text">鱼乐圈</span>
          </div>
          <p class="footer-slogan">从不空军，只是在喂鱼</p>
          <p class="footer-tech">基于 Spring Boot 3 + Vue 3 + AI</p>
          <div class="footer-social">
            <a href="#" class="social-link"
              ><el-icon><ChatLineSquare /></el-icon
            ></a>
            <a href="#" class="social-link"
              ><el-icon><Message /></el-icon
            ></a>
            <a href="#" class="social-link"
              ><el-icon><Star /></el-icon
            ></a>
          </div>
        </div>
        <div class="footer-col">
          <h4 class="footer-title">快速入口</h4>
          <a href="#" @click.prevent="$router.push('/community')" class="footer-link">鱼获战报</a>
          <a href="#" @click.prevent="$router.push('/community/air-force')" class="footer-link"
            >空军疗伤</a
          >
          <a href="#" @click.prevent="$router.push('/ai-tools')" class="footer-link">AI 识鱼</a>
          <a href="#" @click.prevent="$router.push('/market')" class="footer-link">装备交易</a>
        </div>
        <div class="footer-col">
          <h4 class="footer-title">关于我们</h4>
          <a href="#" class="footer-link">平台介绍</a>
          <a href="#" class="footer-link">用户协议</a>
          <a href="#" class="footer-link">隐私政策</a>
          <a href="#" class="footer-link">联系我们</a>
        </div>
        <div class="footer-col">
          <h4 class="footer-title">联系我们</h4>
          <p class="footer-contact">
            <el-icon class="contact-icon"><Message /></el-icon> 官方邮箱: House@club.com
          </p>
          <p class="footer-contact">
            <el-icon class="contact-icon"><House /></el-icon> 合作微信: House_master
          </p>
          <p class="footer-contact">
            <el-icon class="contact-icon"><MapLocation /></el-icon> 地址: 钓鱼星球
          </p>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="copyright">© 2025 鱼乐圈 - 钓鱼佬与空军俱乐部. 保留所有权利.</div>
        <div class="footer-links">
          <a href="#" class="footer-bottom-link">用户协议</a>
          <a href="#" class="footer-bottom-link">隐私政策</a>
          <a href="#" class="footer-bottom-link">免责声明</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { loadSlim } from '@tsparticles/slim'
import { tsParticles } from '@tsparticles/engine'
import {
  House,
  MapLocation,
  ChatLineSquare,
  Cpu,
  ShoppingBag,
  User,
  SwitchButton,
  ArrowDown,
  Message,
  Star,
  Close,
  Camera,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'


const router = useRouter()
const userStore = useUserStore()

const isLogin = computed(() => userStore.isLogin)
const userInfo = computed(() => userStore.userInfo)
const showMobileMenu = ref(false)

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    userStore.clearUserInfo()
    ElMessage.success('已退出登录')
    router.push('/home')
  } catch (error) {
    console.log('取消退出登录')
  }
}

const isMobile = computed(() => {
  return window.innerWidth < 768
})

const handleResize = () => {
  if (window.innerWidth >= 768) {
    showMobileMenu.value = false
  }
}

// 波浪粒子配置
const particlesOptions = {
  fullScreen: false,
  background: {
    color: {
      value: 'transparent',
    },
  },
  fpsLimit: 60,
  particles: {
    color: {
      value: ['#667eea', '#764ba2', '#4facfe', '#00f2fe', '#43e97b'],
    },
    move: {
      direction: 'top',
      enable: true,
      outModes: {
        default: 'out',
        top: 'out',
        bottom: 'out',
      },
      random: true,
      speed: {
        min: 1,
        max: 3,
      },
      straight: false,
      trail: {
        enable: true,
        length: 20,
        fill: {
          color: {
            value: 'transparent',
          },
        },
      },
      vibrate: false,
      warp: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 40,
    },
    opacity: {
      value: {
        min: 0.1,
        max: 0.3,
      },
      animation: {
        enable: true,
        speed: 1,
        sync: false,
      },
    },
    shape: {
      type: 'circle',
    },
    size: {
      value: {
        min: 8,
        max: 20,
      },
      animation: {
        enable: true,
        speed: 2,
        sync: false,
      },
    },
    wobble: {
      enable: true,
      distance: 10,
      speed: {
        angle: 5,
        move: 10,
      },
    },
  },
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: 'repulse',
      },
    },
    modes: {
      repulse: {
        distance: 100,
        duration: 0.4,
      },
    },
  },
  detectRetina: true,
}

// 初始化粒子效果
const initParticles = async () => {
  await loadSlim(tsParticles)
  await tsParticles.load({
    id: 'tsparticles',
    options: particlesOptions,
  })
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  initParticles()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
/* 变量定义 */
:root {
  --primary-color: #4361ee;
  --secondary-color: #3f37c9;
  --accent-color: #4895ef;
  --text-color: #333;
  --text-light: #666;
  --text-lighter: #999;
  --bg-color: #f8f9fa;
  --white: #fff;
  --nav-height: 80px;
  --border-light: #e5e7eb;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
}

.client-layout {
  min-height: 100vh;
  background-color: var(--bg-color);
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 渐变流动背景 */
.gradient-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 50%, #f0f4f8 100%);

  .gradient-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.5;
    will-change: transform, opacity, filter;
  }

  .blob-1 {
    width: 600px;
    height: 600px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    top: -200px;
    left: -100px;
    animation: float 12s infinite ease-in-out, pulse 8s infinite ease-in-out;
    animation-delay: 0s, 0s;
  }

  .blob-2 {
    width: 500px;
    height: 500px;
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    top: 20%;
    right: -150px;
    animation: float 14s infinite ease-in-out, pulse 10s infinite ease-in-out;
    animation-delay: -3s, -2s;
  }

  .blob-3 {
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    bottom: -100px;
    left: 20%;
    animation: float 16s infinite ease-in-out, pulse 12s infinite ease-in-out;
    animation-delay: -6s, -4s;
  }

  .blob-4 {
    width: 350px;
    height: 350px;
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    bottom: 30%;
    right: 10%;
    animation: float 18s infinite ease-in-out, pulse 14s infinite ease-in-out;
    animation-delay: -9s, -6s;
  }
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    border-radius: 50%;
  }
  20% {
    transform: translate(100px, -80px) scale(1.2) rotate(72deg);
    border-radius: 60% 40% 50% 50%;
  }
  40% {
    transform: translate(-80px, 100px) scale(0.85) rotate(144deg);
    border-radius: 40% 60% 60% 40%;
  }
  60% {
    transform: translate(80px, 60px) scale(1.15) rotate(216deg);
    border-radius: 50% 50% 40% 60%;
  }
  80% {
    transform: translate(-60px, -100px) scale(0.9) rotate(288deg);
    border-radius: 60% 40% 40% 60%;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
    filter: blur(60px);
  }
  50% {
    opacity: 0.7;
    filter: blur(80px);
  }
}

/* 粒子背景容器 */
.particles-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

/* 顶部导航 - 现代简约风格 */
.header-glass {
  position: sticky;
  top: -80px;
  left: 0;
  width: 100vw;
  padding: 0.5vw 0vh;
  height: var(--nav-height);
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 1000;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.08);
  transition: all var(--transition-normal);

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 6px 40px rgba(0, 0, 0, 0.12);
  }

  .header-content {
    width: 90vw;
    max-width: 1400px;
    margin: 0 auto;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2vw;
  }
}

/* Logo区域 */
.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all var(--transition-normal);

  &:hover {
    transform: translateY(-2px);
  }

  .logo-icon-container {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 18px;
    box-shadow: 0 6px 20px rgba(67, 97, 238, 0.4);
    transition: all var(--transition-normal);

    &:hover {
      box-shadow: 0 8px 24px rgba(67, 97, 238, 0.5);
      transform: scale(1.05);
    }

    .logo-icon {
      font-size: 26px;
      color: white;
    }
  }

  .logo-text-container {
    display: flex;
    flex-direction: column;

    .logo-text {
      font-size: 22px;
      font-weight: 700;
      color: var(--text-color);
      line-height: 1.2;
      font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    }

    .sub-text {
      font-size: 13px;
      color: var(--text-light);
      font-weight: 500;
      line-height: 1.2;
      letter-spacing: 0.5px;
    }
  }
}

/* 导航菜单 */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 16px;

  .nav-item {
    text-decoration: none;
    color: var(--text-color);
    font-weight: 500;
    font-size: 15px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: var(--radius-lg);
    transition: all var(--transition-normal);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(67, 97, 238, 0.1), transparent);
      transition: left 0.5s ease;
    }

    &:hover::before {
      left: 100%;
    }

    &:hover,
    &.active {
      color: var(--primary-color);
      background-color: rgba(67, 97, 238, 0.08);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(67, 97, 238, 0.15);
    }

    .nav-icon {
      font-size: 18px;
      transition: transform var(--transition-normal);
    }

    &:hover .nav-icon {
      transform: scale(1.1);
    }

    .hot-tag {
      margin-left: 8px;
      animation: pulse 2s infinite;
      transition: all var(--transition-normal);
    }

    &:hover .hot-tag {
      transform: scale(1.05);
    }
  }

  .ai-link {
    position: relative;
  }
}

/* 用户操作区 */
.user-actions {
  display: flex;
  align-items: center;
  gap: 20px;

  .post-btn {
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    border: none;
    border-radius: var(--radius-lg);
    box-shadow: 0 6px 20px rgba(67, 97, 238, 0.4);
    transition: all var(--transition-normal);
    font-size: 15px;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(67, 97, 238, 0.5);
    }

    .btn-icon {
      font-size: 16px;
    }
  }

  .user-profile {
    .avatar-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all var(--transition-normal);
      background-color: rgba(255, 255, 255, 0.8);
      border: 1px solid var(--border-light);

      &:hover {
        background-color: rgba(67, 97, 238, 0.05);
        border-color: var(--primary-color);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(67, 97, 238, 0.15);
      }

      .user-avatar {
        border: 2px solid var(--border-light);
        transition: all var(--transition-normal);

        &:hover {
          border-color: var(--primary-color);
          transform: scale(1.05);
        }
      }

      .username {
        font-size: 15px;
        color: var(--text-color);
        font-weight: 500;
      }

      .dropdown-icon {
        font-size: 14px;
        color: var(--text-light);
        transition: transform var(--transition-normal);
      }

      &:hover .dropdown-icon {
        transform: rotate(180deg);
        color: var(--primary-color);
      }
    }

    .user-dropdown {
      border-radius: var(--radius-lg);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
      border: none;
      padding: 12px 0;
      background-color: white;

      .el-dropdown-item {
        font-size: 15px;
        padding: 12px 24px;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: all var(--transition-normal);

        &:hover {
          background-color: rgba(67, 97, 238, 0.08);
          color: var(--primary-color);
          padding-left: 28px;
        }

        .el-icon {
          font-size: 18px;
        }
      }
    }
  }

  .login-links {
    display: flex;
    align-items: center;
    gap: 16px;

    .login-btn {
      font-size: 15px;
      color: var(--text-color);
      font-weight: 500;

      &:hover {
        color: var(--primary-color);
      }
    }

    .register-btn {
      font-size: 15px;
      border-radius: var(--radius-lg);
      padding: 8px 20px;
      font-weight: 500;
      background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
      border: none;
      transition: all var(--transition-normal);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
      }
    }
  }
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  cursor: pointer;
  color: var(--text-color);
  padding: 8px;
  border-radius: var(--radius-md);
  transition: background-color var(--transition-normal);

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  @media (max-width: 768px) {
    display: block;
  }
}

/* 移动端导航 */
.mobile-nav {
  position: fixed;
  top: var(--nav-height);
  left: 0;
  width: 100vw;
  height: calc(100vh - var(--nav-height));
  background: var(--white);
  z-index: 999;
  box-shadow: var(--shadow-lg);
  animation: slideDown 0.3s ease;

  .mobile-nav-content {
    height: 100%;
    display: flex;
    flex-direction: column;

    .mobile-nav-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px;
      border-bottom: 1px solid var(--border-light);

      .mobile-logo {
        display: flex;
        align-items: center;
        gap: 10px;

        .mobile-logo-icon {
          font-size: 24px;
          color: var(--primary-color);
        }

        .mobile-logo-text {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-color);
        }
      }

      .mobile-close-btn {
        font-size: 24px;
        color: var(--text-color);
        cursor: pointer;
        padding: 4px;
        border-radius: var(--radius-md);
        transition: background-color var(--transition-normal);

        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
      }
    }

    .mobile-nav-menu {
      flex: 1;
      padding: 16px 0;

      .mobile-nav-item {
        text-decoration: none;
        color: var(--text-color);
        font-size: 16px;
        font-weight: 500;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: all var(--transition-normal);

        &:hover,
        &.active {
          color: var(--primary-color);
          background-color: rgba(67, 97, 238, 0.05);
        }

        .mobile-nav-icon {
          font-size: 20px;
        }

        .mobile-hot-tag {
          margin-left: auto;
          animation: pulse 2s infinite;
        }
      }
    }

    .mobile-actions {
      padding: 20px;
      border-top: 1px solid var(--border-light);

      .mobile-post-btn {
        width: 100%;
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
        border: none;
        border-radius: var(--radius-md);
        padding: 12px;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 16px;
      }

      .mobile-auth-buttons {
        display: flex;
        gap: 12px;

        .mobile-login-btn,
        .mobile-register-btn {
          flex: 1;
          font-size: 14px;
          padding: 10px;
          border-radius: var(--radius-md);
        }
      }
    }
  }
}

/* 内容区 */
.main-content {
  position: relative;
  z-index: 1;
  flex: 1;
  padding-bottom: 40px;
  /* 页面切换动画 */
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
  }

  .fade-slide-enter-from {
    opacity: 0;
    transform: translateY(10px);
  }

  .fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

/* Footer */
.footer {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.85), rgba(22, 33, 62, 0.9));
  backdrop-filter: blur(20px);
  color: var(--white);
  padding: 70px 0 40px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMC0xOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptLTE4IDBjMy4zMTQgMCA2LTIuNjg2IDYtNnMtMi42ODYtNi02LTZjLTMuMzE0IDAtNiAyLjY4Ni02IDZzMi42ODYgNiA2IDZ6bTAgMThjMy4zMTQgMCA2LTIuNjg2IDYtNnMtMi42ODYtNi02LTZjLTMuMzE0IDAtNiAyLjY4Ni02IDZzMi42ODYgNiA2IDZ6IiBzdHJva2U9IiMyMjIiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')
      repeat;
    opacity: 0.05;
    z-index: 0;
  }

  .footer-content {
    width: 90vw;
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 50px;
    padding: 0 2vw;
    position: relative;
    z-index: 1;
  }

  .footer-brand {
    .footer-logo {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 24px;
      transition: transform var(--transition-normal);

      &:hover {
        transform: translateY(-3px);
      }

      .footer-logo-icon {
        font-size: 36px;
        color: var(--primary-color);
        background: rgba(255, 255, 255, 0.1);
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
      }

      .footer-logo-text {
        font-size: 28px;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.9);
        font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
      }
    }

    .footer-slogan {
      font-size: 18px;
      color: rgba(255, 255, 255, 0.75);
      margin-bottom: 20px;
      font-weight: 500;
      line-height: 1.4;
    }

    .footer-tech {
      font-size: 15px;
      color: rgba(255, 255, 255, 0.55);
      margin-bottom: 30px;
      line-height: 1.4;
    }

    .footer-social {
      display: flex;
      gap: 16px;

      .social-link {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #d1d5db;
        transition: all var(--transition-normal);
        border: 1px solid rgba(255, 255, 255, 0.1);

        &:hover {
          background: var(--primary-color);
          color: var(--white);
          transform: translateY(-4px);
          box-shadow: 0 6px 20px rgba(67, 97, 238, 0.4);
          border-color: var(--primary-color);
        }

        .el-icon {
          font-size: 20px;
        }
      }
    }
  }

  .footer-col {
    .footer-title {
      font-size: 18px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.85);
      margin-bottom: 24px;
      position: relative;
      padding-bottom: 12px;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 50px;
        height: 3px;
        background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
        border-radius: 2px;
      }
    }

    .footer-link {
      display: block;
      color: rgba(255, 255, 255, 0.6);
      font-size: 15px;
      margin-bottom: 16px;
      text-decoration: none;
      transition: all var(--transition-normal);
      position: relative;
      padding-left: 20px;

      &::before {
        content: '→';
        position: absolute;
        left: 0;
        top: 0;
        color: var(--primary-color);
        transition: transform var(--transition-normal);
      }

      &:hover {
        color: var(--white);
        padding-left: 26px;

        &::before {
          transform: translateX(4px);
        }
      }
    }

    .footer-contact {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 15px;
      margin-bottom: 16px;
      transition: all var(--transition-normal);

      &:hover {
        color: rgba(255, 255, 255, 0.9);
      }

      .contact-icon {
        font-size: 18px;
        color: var(--primary-color);
        margin-top: 2px;
        flex-shrink: 0;
      }
    }
  }

  .footer-bottom {
    width: 90vw;
    max-width: 1400px;
    margin: 0 auto;
    margin-top: 60px;
    padding-top: 30px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 30px 2vw 0;
    position: relative;
    z-index: 1;

    .copyright {
      text-align: center;
      color: rgba(255, 255, 255, 0.45);
      font-size: 15px;
      line-height: 1.4;
    }

    .footer-links {
      display: flex;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;

      .footer-bottom-link {
        color: #9ca3af;
        font-size: 14px;
        text-decoration: none;
        transition: all var(--transition-normal);
        position: relative;

        &:hover {
          color: var(--white);
        }

        &::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--primary-color);
          transition: width var(--transition-normal);
        }

        &:hover::after {
          width: 100%;
        }
      }
    }
  }
}

/* 动画 */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  :root {
    --nav-height: 70px;
  }

  .header-content {
    padding: 0 16px !important;
  }

  .logo {
    .logo-icon-container {
      width: 40px;
      height: 40px;
      margin-right: 12px;

      .logo-icon {
        font-size: 20px;
      }
    }

    .logo-text-container {
      .logo-text {
        font-size: 18px;
      }

      .sub-text {
        font-size: 11px;
      }
    }
  }

  .nav-menu {
    display: none;
  }

  .user-actions {
    display: none;
  }

  .footer {
    padding: 40px 0 20px;

    .footer-content {
      gap: 30px;
    }

    .footer-bottom {
      margin-top: 30px;
      padding-top: 20px;

      .footer-links {
        flex-wrap: wrap;
        gap: 12px;
      }
    }
  }
}

@media (max-width: 480px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .footer-bottom {
    .footer-links {
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
  }
}

</style>
