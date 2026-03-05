import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import ClientLayout from '../layouts/ClientLayout.vue'
import AdminLayout from '../layouts/AdminLayout.vue'

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/admin-login',
    component: () => import('../views/AdminLoginView.vue'),
    meta: { title: '管理员登录' },
  },
  {
    path: '/register',
    component: () => import('../views/RegisterView.vue'),
    meta: { title: '注册' },
  },
  {
    path: '/',
    component: ClientLayout,
    children: [
      { path: 'home', component: () => import('../views/HomeView.vue'), meta: { title: '首页' } },
      {
        path: 'map',
        component: () => import('../views/MapView.vue'),
        meta: { title: '智能钓点地图' },
      },
      {
        path: 'community',
        component: () => import('../views/CommunityView.vue'),
        meta: { title: '社区论坛' },
      },
      {
        path: 'community/post',
        component: () => import('../views/CommunityPostView.vue'),
        meta: { title: '发布战报', requiresAuth: true },
      },
      {
        path: 'community/post/:id',
        component: () => import('../views/PostDetailView.vue'),
        meta: { title: '帖子详情' },
      },
      {
        path: 'community/air-force',
        component: () => import('../views/CommunityAirForceView.vue'),
        meta: { title: '空军疗伤' },
      },
      {
        path: 'ai-tools',
        component: () => import('../views/AiToolsView.vue'),
        meta: { title: 'AI 垂钓助手' },
      },
      {
        path: 'market',
        component: () => import('../views/MarketView.vue'),
        meta: { title: '装备交易' },
      },
      {
        path: 'market/detail/:id',
        component: () => import('../views/GearDetailView.vue'),
        meta: { title: '装备详情' },
      },
      {
        path: 'orders',
        component: () => import('../views/OrdersView.vue'),
        meta: { title: '我的订单', requiresAuth: true },
      },
      {
        path: 'profile',
        component: () => import('../views/ProfileView.vue'),
        meta: { title: '个人中心', requiresAuth: true },
      },
      {
        path: 'about/introduction',
        component: () => import('../views/about/PlatformIntroduction.vue'),
        meta: { title: '平台介绍' },
      },
      {
        path: 'about/agreement',
        component: () => import('../views/about/UserAgreement.vue'),
        meta: { title: '用户协议' },
      },
      {
        path: 'about/privacy',
        component: () => import('../views/about/PrivacyPolicy.vue'),
        meta: { title: '隐私政策' },
      },
      {
        path: 'about/contact',
        component: () => import('../views/about/ContactUs.vue'),
        meta: { title: '联系我们' },
      },
    ],
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    redirect: '/admin/dashboard',
    children: [
      { path: 'dashboard', component: () => import('../views/admin/DashboardView.vue'), meta: { title: '仪表盘' } },
      { path: 'users', component: () => import('../views/admin/UserManageView.vue'), meta: { title: '用户管理' } },
      { path: 'fish', component: () => import('../views/admin/FishManageView.vue'), meta: { title: '鱼类百科管理' } },
      { path: 'spots', component: () => import('../views/admin/SpotManageView.vue'), meta: { title: '钓点地图管理' } },
      { path: 'posts', component: () => import('../views/admin/PostManageView.vue'), meta: { title: '社区帖子管理' } },
      { path: 'gear-reviews', component: () => import('../views/admin/GearReviewManageView.vue'), meta: { title: '装备测评管理' } },
      { path: 'comments', component: () => import('../views/admin/CommentManageView.vue'), meta: { title: '帖子评论管理' } },
      { path: 'trades', component: () => import('../views/admin/TradeManageView.vue'), meta: { title: '装备交易管理' } },
      { path: 'orders', component: () => import('../views/admin/OrderManageView.vue'), meta: { title: '订单管理' } },
      { path: 'badges', component: () => import('../views/admin/BadgeManageView.vue'), meta: { title: '勋章管理' } },
      { path: 'dict', component: () => import('../views/admin/DictManageView.vue'), meta: { title: '数据字典管理' } },
      { path: 'profile', component: () => import('../views/admin/AdminProfileView.vue'), meta: { title: '个人设置' } },
    ],
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: '页面未找到' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 钓鱼俱乐部` : '钓鱼俱乐部'

  const token = localStorage.getItem('token')
  const userInfo = localStorage.getItem('userInfo')

  if (to.meta.requiresAuth && !token) {
    ElMessage.warning('请先登录')
    next({ path: '/home', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.requiresAdmin) {
    if (!userInfo) {
      ElMessage.warning('请先登录')
      next({ path: '/home' })
      return
    }
    try {
      const user = JSON.parse(userInfo)
      if (user.roleDictItemCode !== 'admin') {
        ElMessage.error('无权限访问管理后台')
        next({ path: '/home' })
        return
      }
    } catch {
      ElMessage.error('用户信息解析失败')
      next({ path: '/home' })
      return
    }
  }

  next()
})

router.afterEach((to, from) => {
  console.log(`[路由跳转] ${from.path} -> ${to.path}`)
})

export default router
