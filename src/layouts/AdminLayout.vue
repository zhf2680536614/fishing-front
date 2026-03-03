<template>
  <div class="app-wrapper">
    <!-- 移动端遮罩层 -->
    <div v-if="!isCollapse && isMobile" class="mobile-mask" @click="toggleSidebar"></div>

    <!-- 左侧侧边栏 -->
    <aside class="sidebar-container" :class="{ 'is-collapsed': isCollapse }">
      <!-- Logo 区域 -->
      <div class="logo-wrapper">
        <img
          src="https://element-plus.org/images/element-plus-logo-small.svg"
          alt="logo"
          class="logo-img"
        />
        <h1 class="logo-title" :class="{ 'hide-title': isCollapse }">渔乐·管理台</h1>
      </div>

      <!-- 菜单区域 -->
      <el-scrollbar class="menu-scrollbar">
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :unique-opened="true"
          :collapse-transition="false"
          class="modern-menu"
          router
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><Odometer /></el-icon>
            <template #title>数据大屏</template>
          </el-menu-item>

          <el-sub-menu index="user">
            <template #title>
              <el-icon><User /></el-icon>
              <span>钓友会员</span>
            </template>
            <el-menu-item index="/admin/user-list">会员列表</el-menu-item>
            <el-menu-item index="/admin/verify-master">大师认证</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="content">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>鱼获圈子</span>
            </template>
            <el-menu-item index="/admin/post-manage">帖子管理</el-menu-item>
            <el-menu-item index="/admin/ai-audit">AI 鉴鱼审核</el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/admin/spots">
            <el-icon><MapLocation /></el-icon>
            <template #title>钓点地图</template>
          </el-menu-item>

          <el-sub-menu index="system">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统设置</span>
            </template>
            <el-menu-item index="/admin/ai-config">AI 参数</el-menu-item>
            <el-menu-item index="/admin/dict-manage">字典管理</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </aside>

    <!-- 右侧内容区 -->
    <div class="main-container" :class="{ 'is-collapsed': isCollapse }">
      <!-- 顶部 Header (毛玻璃效果) -->
      <header class="navbar">
        <div class="navbar-left">
          <div class="hamburger" @click="toggleSidebar">
            <el-icon :size="20">
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
          </div>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentPageName }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="navbar-right">
          <div class="action-btn" @click="toggleFullScreen">
            <el-tooltip content="全屏" effect="dark" placement="bottom">
              <el-icon :size="18"><FullScreen /></el-icon>
            </el-tooltip>
          </div>

          <div class="action-btn">
            <el-badge is-dot class="badge-dot">
              <el-icon :size="18"><Bell /></el-icon>
            </el-badge>
          </div>

          <el-dropdown class="avatar-container" trigger="click" @command="handleCommand">
            <div class="avatar-wrapper">
              <el-avatar
                :size="32"
                src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
              />
              <span class="user-name" v-if="!isMobile">超级管理员</span>
              <el-icon class="el-icon--right"><CaretBottom /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="modern-dropdown">
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 内容 View -->
      <section class="app-main">
        <div class="page-container">
          <router-view v-slot="{ Component }">
            <transition name="page-fade" mode="out-in">
              <component :is="Component" :key="route.path" />
            </transition>
          </router-view>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Odometer,
  User,
  Document,
  MapLocation,
  Setting,
  Fold,
  Expand,
  FullScreen,
  Bell,
  CaretBottom,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)
const isMobile = ref(false)

// 响应式检测
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) isCollapse.value = true
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})
onBeforeUnmount(() => {
  window.addEventListener('resize', checkMobile)
})

const toggleSidebar = () => (isCollapse.value = !isCollapse.value)
const activeMenu = computed(() => route.path)

const currentPageName = computed(() => {
  const map = {
    '/admin/dashboard': '数据大屏',
    '/admin/user-list': '会员列表',
    '/admin/verify-master': '大师认证',
    '/admin/post-manage': '帖子管理',
    '/admin/ai-audit': 'AI 鉴鱼审核',
    '/admin/spots': '钓点地图',
  }
  return map[route.path] || '工作台'
})

const toggleFullScreen = () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen()
  else if (document.exitFullscreen) document.exitFullscreen()
}

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessage.success('已安全退出')
    router.push('/login')
  }
}
</script>

<style lang="scss" scoped>
/* ========== 现代 SaaS 风格变量 ========== */
:root {
  --sidebar-w: 260px;
  --sidebar-w-collapsed: 72px;
  --header-h: 70px;

  --c-brand: #0ea5e9; /* 天蓝色，贴合“渔乐”主题 */
  --c-brand-rgb: 14, 165, 233; /* 对应天蓝色的RGB值 */
  --c-brand-light: #f0f9ff;
  --c-brand-dark: #0284c7; /* 深色品牌色 */
  --c-bg-app: #f8fafc; /* 新版极浅灰底色 */
  --c-bg-surface: #ffffff;
  --c-bg-card: #ffffff; /* 卡片背景 */
  --c-text-main: #0f172a; /* 深灰蓝主文本 */
  --c-text-sub: #64748b; /* 灰色辅助文本 */
  --c-text-muted: #94a3b8; /* 浅灰色弱化文本 */
  --c-border: #e2e8f0; /* 边框颜色 */
  --c-success: #10b981; /* 成功绿 */
  --c-warning: #f59e0b; /* 警告橙 */
  --c-danger: #ef4444; /* 危险红 */
  --c-info: #3b82f6; /* 信息蓝 */

  /* 苹果风阻尼动画 */
  --transition-bouncy: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  --shadow-float: 0 10px 15px -3px rgba(14, 165, 233, 0.1), 0 4px 6px -2px rgba(14, 165, 233, 0.05);
  --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  --shadow-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.app-wrapper {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: var(--c-bg-app);
  overflow: hidden;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
}

/* ========== 左侧侧边栏 (现代化设计) ========== */
.sidebar-container {
  width: var(--sidebar-w);
  background: linear-gradient(180deg, var(--c-bg-surface), #f8fafc);
  transition: var(--transition-bouncy);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  box-shadow: inset -1px 0 0 0 var(--c-border);
  border-right: none;
  overflow: hidden;

  &.is-collapsed {
    width: var(--sidebar-w-collapsed);
  }

  .logo-wrapper {
    height: var(--header-h);
    display: flex;
    align-items: center;
    padding: 0 20px;
    flex-shrink: 0;
    border-bottom: 1px solid var(--c-border);
    background: linear-gradient(135deg, rgba(14, 165, 233, 0.05), transparent);

    .logo-img {
      width: 36px;
      height: 36px;
      transition: var(--transition-bouncy);
      filter: drop-shadow(0 2px 2px rgba(14, 165, 233, 0.1));
    }

    .logo-title {
      margin-left: 14px;
      color: var(--c-text-main);
      font-weight: 700;
      font-size: 19px;
      white-space: nowrap;
      transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: linear-gradient(90deg, var(--c-brand), #0284c7);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 0.5px;
      
      &.hide-title {
        opacity: 0;
        width: 0;
        overflow: hidden;
      }
    }
  }

  /* 现代化菜单样式 */
  .modern-menu {
    border-right: none;
    background: transparent;
    padding: 12px 8px;

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      height: 48px;
      line-height: 48px;
      margin-bottom: 6px;
      border-radius: 12px;
      color: var(--c-text-sub);
      transition: var(--transition-bouncy);
      padding: 0 16px;
      position: relative;
      overflow: hidden;

      .el-icon {
        font-size: 20px;
        margin-right: 14px;
        transition: var(--transition-bouncy);
      }

      &:hover {
        background: linear-gradient(90deg, rgba(var(--c-brand-rgb), 0.05), transparent);
        color: var(--c-text-main);
        transform: translateX(4px);
        
        .el-icon {
          transform: scale(1.1);
        }
      }
    }

    /* 激活状态：渐变背景 + 发光效果 */
    :deep(.el-menu-item.is-active) {
      background: linear-gradient(90deg, var(--c-brand-light), #e0f2fe);
      color: var(--c-brand);
      font-weight: 600;
      position: relative;
      box-shadow: 0 4px 12px -4px rgba(var(--c-brand-rgb), 0.2);

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        height: 24px;
        width: 4px;
        background: linear-gradient(180deg, var(--c-brand), #0284c7);
        border-radius: 0 2px 2px 0;
        opacity: 1;
        transition: var(--transition-bouncy);
      }
      
      &:hover {
        transform: translateX(4px);
        background: linear-gradient(90deg, var(--c-brand-light), #bae6fd);
      }
    }
    
    /* 子菜单标题样式 */
    :deep(.el-sub-menu__title) {
      font-weight: 500;
      
      &:hover {
        background: linear-gradient(90deg, rgba(var(--c-brand-rgb), 0.03), transparent);
      }
    }
  }

  /* 折叠状态的特殊处理 */
  &.is-collapsed .modern-menu {
    padding: 12px 4px;
    :deep(.el-menu-item.is-active::before) {
      opacity: 1;
    }
    :deep(.el-tooltip__trigger) {
      justify-content: center;
    }
    :deep(.el-sub-menu__title) {
      padding: 0 !important;
      justify-content: center;
      .el-icon {
        margin: 0;
      }
    }
  }
}

/* ========== 右侧主体 ========== */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: var(--transition-bouncy);
}

/* 顶部现代化 Header */
.navbar {
  height: var(--header-h);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.85), rgba(248, 250, 252, 0.85));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.7);
  z-index: 100;
  box-shadow: 0 4px 6px -6px rgba(0, 0, 0, 0.1);

  .navbar-left {
    display: flex;
    align-items: center;

    .hamburger {
      cursor: pointer;
      margin-right: 24px;
      color: var(--c-text-main);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 12px;
      transition: var(--transition-bouncy);
      background: rgba(var(--c-brand-rgb), 0.05);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, transparent, rgba(var(--c-brand-rgb), 0.1), transparent);
        opacity: 0;
        transition: opacity 0.3s;
      }
      
      &:hover {
        background: rgba(var(--c-brand-rgb), 0.1);
        color: var(--c-brand);
        transform: translateY(-2px);
        
        &::before {
          opacity: 1;
        }
      }
    }
  }

  .navbar-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .action-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 14px;
      cursor: pointer;
      color: var(--c-text-sub);
      transition: var(--transition-bouncy);
      position: relative;
      overflow: hidden;
      background: transparent;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, transparent, rgba(var(--c-brand-rgb), 0.08), transparent);
        opacity: 0;
        transition: opacity 0.3s;
      }

      &:hover {
        background: rgba(var(--c-brand-rgb), 0.08);
        color: var(--c-brand);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px -4px rgba(var(--c-brand-rgb), 0.15);
        
        &::before {
          opacity: 1;
        }
      }
    }

    .avatar-container {
      margin-left: 16px;
      cursor: pointer;
      padding: 6px;
      border-radius: 24px;
      border: 1px solid transparent;
      transition: var(--transition-bouncy);
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(var(--c-brand-rgb), 0.05), rgba(var(--c-brand-rgb), 0.1));
        opacity: 0;
        transition: opacity 0.3s;
      }

      &:hover {
        border-color: rgba(var(--c-brand-rgb), 0.3);
        background: rgba(var(--c-brand-rgb), 0.05);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px -4px rgba(var(--c-brand-rgb), 0.15);
        
        &::before {
          opacity: 1;
        }
      }

      .avatar-wrapper {
        display: flex;
        align-items: center;

        .user-name {
          margin: 0 10px;
          font-size: 15px;
          color: var(--c-text-main);
          font-weight: 500;
          letter-spacing: 0.2px;
        }
      }
    }
  }
}

/* 面包屑重写 */
:deep(.el-breadcrumb) {
  font-size: 15px;
  font-weight: 500;
  
  .el-breadcrumb__inner {
    color: var(--c-text-sub);
    font-weight: 400;
    
    &.is-link {
      color: var(--c-text-main);
      font-weight: 500;
      transition: all 0.2s ease;
      
      &:hover {
        color: var(--c-brand);
        transform: translateX(2px);
      }
    }
  }
  
  .el-breadcrumb__separator {
    color: var(--c-text-muted);
    font-weight: 400;
  }
}

/* 内容区域 */
.app-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  position: relative;
  background: var(--c-bg-app);

  /* 内容卡片化，让灰色背景透出来 */
  .page-container {
    background: var(--c-bg-card);
    border-radius: 16px;
    padding: 28px;
    min-height: calc(100vh - var(--header-h) - 48px);
    box-shadow: var(--shadow-card);
    border: 1px solid var(--c-border);
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: var(--shadow-hover);
      transform: translateY(-2px);
    }
  }
}

/* ========== 极速丝滑的路由切换动画 ========== */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
  filter: blur(2px);
}
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.98);
  filter: blur(2px);
}

/* 新增页面加载动画 */
.page-scale-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.page-scale-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-scale-fade-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
.page-scale-fade-leave-to {
  opacity: 0;
  transform: scale(1.05) translateY(-10px);
}

/* ========== 滚动条美化 ========== */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--c-text-muted);
  border-radius: 4px;
  transition: background 0.2s ease;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--c-text-main);
}

/* 特殊滚动区域样式 */
.menu-scrollbar {
  width: 100%;
  
  :deep(.el-scrollbar__wrap) {
    overflow-x: hidden;
  }
}

/* ========== 移动端完美适配 ========== */
.mobile-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle, rgba(15, 23, 42, 0.3) 0%, rgba(15, 23, 42, 0.5) 100%);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 999;
  animation: fadeIn 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  transition: opacity 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(4px);
  }
}

@media screen and (max-width: 768px) {
  :root {
    --header-h: 60px;
  }
  
  .app-wrapper {
    height: 100svh; /* 使用新的视口单位提高兼容性 */
  }
  
  .sidebar-container {
    position: fixed;
    height: 100svh;
    left: 0;
    top: 0;
    transform: translateX(-100%);
    box-shadow: 12px 0 24px -6px rgba(0, 0, 0, 0.15);
    transition: transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);

    &.is-collapsed {
      transform: translateX(0);
      width: var(--sidebar-w) !important; /* 移动端展开时保持宽尺寸 */
    }
    
    &.is-collapsed ~ .main-container {
      transform: translateX(var(--sidebar-w));
    }
  }

  .main-container {
    transition: transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  
  .navbar {
    padding: 0 18px;
    height: var(--header-h);
    
    .navbar-left {
      .hamburger {
        margin-right: 16px;
      }
    }
  }
  
  .app-main {
    padding: 16px 12px;
  }
  
  .page-container {
    padding: 16px 12px;
    min-height: calc(100svh - var(--header-h) - 32px);
    border-radius: 16px;
  }
  
  /* 针对小屏幕设备进一步优化 */
  @media screen and (max-width: 480px) {
    .sidebar-container {
      width: calc(100vw - 20px) !important;
    }
    
    .navbar {
      padding: 0 14px;
    }
    
    .page-container {
      padding: 14px 10px;
      margin: 0 8px;
    }
    
    .user-name {
      display: none;
    }
    
    .hamburger {
      margin-right: 12px !important;
    }
  }
}
</style>
