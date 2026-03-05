<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { loadSlim } from '@tsparticles/slim'
import { tsParticles } from '@tsparticles/engine'
import {
  Odometer,
  User,
  Collection,
  MapLocation,
  ChatLineSquare,
  Goods,
  ChatDotRound,
  ShoppingCart,
  List,
  Medal,
  Document,
  Fold,
  Expand,
  SwitchButton,
  Setting,
  Bell,
  FullScreen,
  ArrowDown
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapse = ref(false)
const isFullscreen = ref(false)

const userInfo = computed(() => userStore.userInfo)

// 侧边栏菜单配置
const menuItems = [
  { path: '/admin/dashboard', icon: Odometer, title: '仪表盘' },
  { path: '/admin/users', icon: User, title: '用户管理' },
  { path: '/admin/fish', icon: Collection, title: '鱼类百科管理' },
  { path: '/admin/spots', icon: MapLocation, title: '钓点地图管理' },
  { path: '/admin/posts', icon: ChatLineSquare, title: '社区帖子管理' },
  { path: '/admin/gear-reviews', icon: Goods, title: '装备测评管理' },
  { path: '/admin/comments', icon: ChatDotRound, title: '帖子评论管理' },
  { path: '/admin/trades', icon: ShoppingCart, title: '装备交易管理' },
  { path: '/admin/orders', icon: List, title: '订单管理' },
  { path: '/admin/badges', icon: Medal, title: '勋章管理' },
  { path: '/admin/dict', icon: Document, title: '数据字典管理' },
]

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 切换侧边栏折叠
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 全屏切换
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    userStore.clearUserInfo()
    ElMessage.success('已退出登录')
    router.push('/admin-login')
  } catch (error) {
    console.log('取消退出登录')
  }
}

// 粒子背景配置 - 科技感风格
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
      value: ['#00d4ff', '#0099ff', '#00ffcc', '#66ffff'],
    },
    links: {
      color: '#00d4ff',
      distance: 150,
      enable: true,
      opacity: 0.15,
      width: 1,
    },
    move: {
      direction: 'none',
      enable: true,
      outModes: {
        default: 'bounce',
      },
      random: true,
      speed: {
        min: 0.5,
        max: 1.5,
      },
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 60,
    },
    opacity: {
      value: {
        min: 0.2,
        max: 0.5,
      },
      animation: {
        enable: true,
        speed: 0.5,
        sync: false,
      },
    },
    shape: {
      type: 'circle',
    },
    size: {
      value: {
        min: 2,
        max: 4,
      },
      animation: {
        enable: true,
        speed: 2,
        sync: false,
      },
    },
  },
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: 'grab',
      },
      onClick: {
        enable: true,
        mode: 'push',
      },
    },
    modes: {
      grab: {
        distance: 140,
        links: {
          opacity: 0.5,
        },
      },
      push: {
        quantity: 4,
      },
    },
  },
  detectRetina: true,
}

// 初始化粒子效果
const initParticles = async () => {
  await loadSlim(tsParticles)
  await tsParticles.load({
    id: 'admin-particles',
    options: particlesOptions,
  })
}

onMounted(() => {
  initParticles()
})

onUnmounted(() => {
  tsParticles.destroy('admin-particles')
})
</script>

<template>
  <div class="admin-layout">
    <!-- 科技感动态背景 -->
    <div class="tech-bg">
      <div class="grid-overlay"></div>
      <div class="glow-blob blob-1"></div>
      <div class="glow-blob blob-2"></div>
      <div class="glow-blob blob-3"></div>
    </div>
    <!-- 粒子背景 -->
    <div id="admin-particles" class="particles-container"></div>

    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ 'is-collapse': isCollapse }">
      <!-- Logo区域 -->
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">
            <el-icon><Setting /></el-icon>
          </div>
          <span v-show="!isCollapse" class="logo-text">管理后台</span>
        </div>
        <div v-show="!isCollapse" class="logo-subtitle">Fishing Admin</div>
      </div>

      <!-- 菜单区域 -->
      <div class="sidebar-menu">
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          background-color="transparent"
          text-color="#a0aec0"
          active-text-color="#00d4ff"
        >
          <el-menu-item
            v-for="item in menuItems"
            :key="item.path"
            :index="item.path"
            :route="item.path"
          >
            <el-icon class="menu-icon">
              <component :is="item.icon" />
            </el-icon>
            <template #title>
              <span class="menu-title">{{ item.title }}</span>
            </template>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 侧边栏底部 -->
      <div class="sidebar-footer">
        <div class="collapse-btn" @click="toggleCollapse">
          <el-icon :size="18">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="main-wrapper" :class="{ 'is-collapse': isCollapse }">
      <!-- 顶部导航栏 -->
      <header class="top-header">
        <div class="header-left">
          <breadcrumb />
        </div>
        <div class="header-right">
          <!-- 全屏按钮 -->
          <div class="header-btn" @click="toggleFullscreen">
            <el-icon :size="18"><FullScreen /></el-icon>
          </div>
          <!-- 管理员信息 -->
          <el-dropdown trigger="click">
            <div class="admin-profile">
              <el-avatar
                :size="36"
                :src="userInfo?.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'"
                class="admin-avatar"
              />
              <span class="admin-name">{{ userInfo?.nickname || '管理员' }}</span>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="admin-dropdown">
                <el-dropdown-item @click="router.push('/admin/profile')">
                  <el-icon><User /></el-icon>
                  <span>个人设置</span>
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 内容区域 -->
      <main class="content-area">
        <div class="content-wrapper">
          <router-view v-slot="{ Component }">
            <transition name="fade-slide" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// 科技感深色主题变量
:root {
  --admin-bg: #0f172a;
  --admin-sidebar-bg: rgba(15, 23, 42, 0.95);
  --admin-card-bg: rgba(30, 41, 59, 0.8);
  --admin-border: rgba(148, 163, 184, 0.1);
  --admin-text: #e2e8f0;
  --admin-text-secondary: #94a3b8;
  --admin-primary: #00d4ff;
  --admin-primary-hover: #00a8cc;
  --admin-sidebar-width: 240px;
  --admin-sidebar-collapse: 64px;
  --admin-header-height: 64px;
}

.admin-layout {
  min-height: 100vh;
  display: flex;
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}

// 科技感动态背景
.tech-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;

  // 网格背景
  .grid-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: gridMove 20s linear infinite;
  }

  // 发光光斑
  .glow-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.3;
    will-change: transform, opacity;
  }

  .blob-1 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(0, 212, 255, 0.4) 0%, transparent 70%);
    top: -150px;
    right: -100px;
    animation: techFloat 15s infinite ease-in-out;
  }

  .blob-2 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(0, 153, 255, 0.3) 0%, transparent 70%);
    bottom: -100px;
    left: 30%;
    animation: techFloat 18s infinite ease-in-out;
    animation-delay: -5s;
  }

  .blob-3 {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(0, 255, 204, 0.25) 0%, transparent 70%);
    top: 40%;
    left: -100px;
    animation: techFloat 20s infinite ease-in-out;
    animation-delay: -10s;
  }
}

@keyframes gridMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

@keyframes techFloat {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  33% {
    transform: translate(50px, -30px) scale(1.1);
    opacity: 0.4;
  }
  66% {
    transform: translate(-30px, 50px) scale(0.9);
    opacity: 0.25;
  }
}

// 粒子背景容器
.particles-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

// 侧边栏 - 使用 flex 布局而不是 fixed
.sidebar {
  width: var(--admin-sidebar-width);
  height: 100vh;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--admin-border);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: sticky;
  top: 0;
  overflow: hidden;

  &.is-collapse {
    width: var(--admin-sidebar-collapse);
  }

  // Logo区域
  .sidebar-header {
    padding: 24px 20px;
    border-bottom: 1px solid var(--admin-border);
    flex-shrink: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      .logo-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
        flex-shrink: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        .el-icon {
          font-size: 22px;
          color: #fff;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      }

      .logo-text {
        font-size: 20px;
        font-weight: 700;
        color: var(--admin-text);
        background: linear-gradient(135deg, #00d4ff 0%, #00ffcc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        white-space: nowrap;
        opacity: 1;
        transform: translateX(0);
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }
    }

    .logo-subtitle {
      font-size: 12px;
      color: var(--admin-text-secondary);
      margin-top: 4px;
      margin-left: 52px;
      letter-spacing: 1px;
      white-space: nowrap;
      opacity: 1;
      transform: translateX(0);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }

  // 折叠状态下的样式
  &.is-collapse {
    .sidebar-header {
      padding: 24px 0;
      display: flex;
      flex-direction: column;
      align-items: center;

      .logo {
        justify-content: center;
        gap: 0;

        .logo-icon {
          width: 36px;
          height: 36px;

          .el-icon {
            font-size: 20px;
          }
        }
      }

      .logo-text,
      .logo-subtitle {
        opacity: 0;
        transform: translateX(-10px);
        pointer-events: none;
      }
    }
  }

  // 菜单区域
  .sidebar-menu {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 16px 0;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 212, 255, 0.3);
      border-radius: 2px;
    }

    :deep(.el-menu) {
      border-right: none;
      background: transparent;

      .el-menu-item {
        height: 50px;
        line-height: 50px;
        margin: 4px 12px;
        padding: 0 16px;
        border-radius: 8px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;

        &:hover {
          background: rgba(0, 212, 255, 0.1);
          color: #00d4ff;
        }

        &.is-active {
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 153, 255, 0.1) 100%);
          border-left: 3px solid #00d4ff;
          box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);

          .menu-icon {
            color: #00d4ff;
          }
        }

        .menu-icon {
          font-size: 18px;
          color: var(--admin-text-secondary);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
        }

        .menu-title {
          font-size: 14px;
          font-weight: 500;
          opacity: 1;
          transform: translateX(0);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }
      }
    }
  }

  // 折叠状态下的菜单样式
  &.is-collapse {
    .sidebar-menu {
      :deep(.el-menu) {
        .el-menu-item {
          margin: 4px 8px;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;

          .menu-icon {
            margin: 0;
            font-size: 20px;
          }

          .menu-title {
            opacity: 0;
            transform: translateX(-10px);
            width: 0;
          }
        }
      }
    }

    .sidebar-footer {
      padding: 16px 8px;

      .collapse-btn {
        .el-icon {
          transform: rotate(180deg);
        }
      }
    }
  }

  // 侧边栏底部
  .sidebar-footer {
    padding: 16px;
    border-top: 1px solid var(--admin-border);
    flex-shrink: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    .collapse-btn {
      width: 100%;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      cursor: pointer;
      color: var(--admin-text-secondary);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: rgba(0, 212, 255, 0.1);
        color: #00d4ff;
      }

      .el-icon {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
    }
  }
}

// 主内容区
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; // 防止 flex 子项溢出
  min-height: 100vh;
  position: relative;
  z-index: 2;
}

// 顶部导航栏
.top-header {
  height: var(--admin-header-height);
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--admin-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;

  .header-left {
    display: flex;
    align-items: center;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .header-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      cursor: pointer;
      color: var(--admin-text-secondary);
      transition: all 0.3s ease;

      &:hover {
        background: rgba(0, 212, 255, 0.1);
        color: #00d4ff;
      }

      .notification-badge {
        :deep(.el-badge__content) {
          background: #f56c6c;
          border: none;
        }
      }
    }

    .admin-profile {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid var(--admin-border);

      &:hover {
        background: rgba(0, 212, 255, 0.05);
        border-color: rgba(0, 212, 255, 0.3);
      }

      .admin-avatar {
        border: 2px solid rgba(0, 212, 255, 0.3);
      }

      .admin-name {
        font-size: 14px;
        color: var(--admin-text);
        font-weight: 500;
        white-space: nowrap;
      }

      .dropdown-icon {
        font-size: 12px;
        color: var(--admin-text-secondary);
        transition: transform 0.3s ease;
      }

      &:hover .dropdown-icon {
        transform: rotate(180deg);
        color: #00d4ff;
      }
    }

    .admin-dropdown {
      background: rgba(30, 41, 59, 0.95);
      border: 1px solid var(--admin-border);
      backdrop-filter: blur(20px);

      .el-dropdown-item {
        color: var(--admin-text);

        &:hover {
          background: rgba(0, 212, 255, 0.1);
          color: #00d4ff;
        }

        .el-icon {
          margin-right: 8px;
        }
      }
    }
  }
}

// 内容区域
.content-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;

  .content-wrapper {
    min-height: calc(100vh - var(--admin-header-height) - 48px);
    background: var(--admin-card-bg);
    border-radius: 12px;
    border: 1px solid var(--admin-border);
    padding: 24px;
    backdrop-filter: blur(10px);
  }
}

// 页面切换动画
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

// 响应式设计
@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    position: relative;

    &.is-collapse {
      width: 100%;
      height: 64px;
      overflow: hidden;
    }
  }

  .main-wrapper {
    width: 100%;
  }
}
</style>
