<template>
  <div class="profile-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">个人中心</h1>
        <p class="page-description">查看你的钓鱼数据和个人信息</p>
      </div>
    </div>

    <!-- 个人信息卡片 -->
    <div class="container">
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-section">
            <el-avatar :size="120" :src="userInfo.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" class="profile-avatar" />
            <div class="user-basic-info">
              <h2 class="username">{{ userInfo.nickname }}</h2>
              <div class="user-meta">
                <el-tag v-if="userInfo.isMaster" type="success" effect="dark">钓鱼大师</el-tag>
                <span class="level">Lv.{{ userInfo.level }}</span>
                <span class="exp">经验值: {{ userInfo.expPoints }}/{{ getNextLevelExp(userInfo.expPoints) }}</span>
              </div>
              <p class="signature">{{ userInfo.signature || '暂无个性签名' }}</p>
            </div>
          </div>
          <div class="profile-actions">
            <el-button type="primary" @click="handleEditProfile">
              <el-icon><Edit /></el-icon> 编辑资料
            </el-button>
          </div>
        </div>
        <div class="profile-stats">
          <div class="stat-item">
            <div class="stat-number">{{ userInfo.fishingDays }}</div>
            <div class="stat-label">出钓天数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ userInfo.totalFishWeight }}kg</div>
            <div class="stat-label">总鱼获</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ userInfo.airForceCount }}</div>
            <div class="stat-label">空军次数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ userInfo.badgeCount }}</div>
            <div class="stat-label">获得勋章</div>
          </div>
        </div>
      </div>

      <!-- 功能标签页 -->
      <el-tabs v-model="activeTab" class="profile-tabs">
        <el-tab-pane label="闲置装备" name="equipment">
          <div class="tab-content">
            <div class="equipment-toolbar">
              <div class="search-box">
                <el-input
                  v-model="equipmentSearchKeyword"
                  placeholder="搜索装备名称"
                  :prefix-icon="Search"
                  clearable
                  @clear="handleSearchEquipment"
                  @keyup.enter="handleSearchEquipment"
                  size="large"
                />
              </div>
              <div class="batch-actions">
                <el-checkbox v-model="selectAllEquipment" @change="handleSelectAllEquipment">全选</el-checkbox>
                <el-button
                  type="danger"
                  :icon="Delete"
                  :disabled="selectedEquipment.length === 0"
                  @click="handleBatchDeleteEquipment"
                >
                  批量删除
                </el-button>
              </div>
            </div>
            <el-button type="primary" class="add-equipment-btn" @click="handleAddEquipment">
              <el-icon><Plus /></el-icon> 添加闲置装备
            </el-button>
            <div class="equipment-list">
              <div v-for="item in filteredEquipment" :key="item.id" class="equipment-item">
                <div class="equipment-checkbox">
                  <el-checkbox v-model="item.selected" @change="handleEquipmentSelect" />
                </div>
                <div class="equipment-image">
                  <el-carousel 
                    v-if="item.images && item.images.length > 0" 
                    height="180px" 
                    indicator-position="outside"
                    :autoplay="false"
                    arrow="hover"
                  >
                    <el-carousel-item v-for="(img, index) in item.images" :key="index">
                      <img 
                        :src="img" 
                        alt="装备图片" 
                        @click="handlePreviewImages(item.images, index)"
                        class="carousel-image"
                      />
                    </el-carousel-item>
                  </el-carousel>
                  <div v-else class="no-image">
                    <el-icon :size="48"><Picture /></el-icon>
                    <span>暂无图片</span>
                  </div>
                  <div class="equipment-status-tag" :class="getStatusClass(item.statusDictItemCode)">
                    {{ item.statusDictItemCode === 'on_sale' ? '在售' : item.statusDictItemCode === 'sold' ? '已售出' : '已下架' }}
                  </div>
                </div>
                <div class="equipment-content">
                  <div class="equipment-info">
                    <h3 class="equipment-name">{{ item.title }}</h3>
                    <p class="equipment-desc">{{ item.description }}</p>
                    <div class="equipment-meta">
                      <span class="equipment-price">¥{{ item.price }}</span>
                      <span v-if="item.originalPrice" class="original-price">¥{{ item.originalPrice }}</span>
                    </div>
                  </div>
                  <div class="equipment-actions">
                    <el-button circle size="small" @click="handleEditEquipment(item)" title="编辑">
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button 
                      circle
                      size="small" 
                      :type="item.statusDictItemCode === 'on_sale' ? 'warning' : 'primary'" 
                      @click="handleUpdateStatus(item.id, item.statusDictItemCode === 'on_sale' ? 'off_shelf' : 'on_sale')"
                      :title="item.statusDictItemCode === 'on_sale' ? '下架' : '上架'"
                    >
                      <el-icon v-if="item.statusDictItemCode === 'on_sale'"><Bottom /></el-icon>
                      <el-icon v-else><Top /></el-icon>
                    </el-button>
                    <el-button circle size="small" type="danger" @click="handleDeleteEquipment(item.id)" title="删除">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="filteredEquipment.length === 0" class="empty-equipment">
              <el-empty description="暂无闲置装备" />
            </div>
            
          </div>
        </el-tab-pane>
        <el-tab-pane label="勋章墙" name="medals">
          <div class="tab-content">
            <div class="medals-section">
              <h3 class="section-title">已获得的勋章</h3>
              <div v-if="obtainedMedals.length > 0" class="medals-grid">
                <div v-for="(medal, index) in obtainedMedals" :key="index" class="medal-item">
                  <div class="medal-icon">
                    <img :src="medal.badgeIcon" :alt="medal.badgeName" class="medal-img" />
                  </div>
                  <h4 class="medal-name">{{ medal.badgeName }}</h4>
                  <p class="medal-desc">{{ medal.description }}</p>
                  <span class="medal-date">{{ formatDate(medal.obtainDate) }}</span>
                </div>
              </div>
              <div v-else class="empty-medals">
                <el-empty description="暂未获得任何勋章" />
              </div>
            </div>
            
            <div class="medals-section">
              <h3 class="section-title">待解锁的勋章</h3>
              <div v-if="unobtainedMedals.length > 0" class="medals-grid">
                <div
                  class="medal-item locked"
                  v-for="(medal, index) in unobtainedMedals"
                  :key="index"
                >
                  <div class="medal-icon locked">
                    <img :src="medal.badgeIcon" :alt="medal.badgeName" class="medal-img locked" />
                  </div>
                  <h4 class="medal-name">{{ medal.badgeName }}</h4>
                  <p class="medal-desc">{{ medal.description }}</p>
                  <span class="medal-requirement">{{ getRequirementText(medal) }}</span>
                </div>
              </div>
              <div v-else class="empty-medals">
                <el-empty description="已获得所有勋章" />
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="我的订单" name="orders">
          <div class="tab-content">
            <div class="orders-content">
              <div class="orders-toolbar">
                <div class="search-box">
                  <el-input
                    v-model="orderSearchKeyword"
                    placeholder="搜索订单号或商品名称"
                    :prefix-icon="Search"
                    clearable
                    @clear="handleSearchOrders"
                    @keyup.enter="handleSearchOrders"
                    size="large"
                  />
                </div>
                <div class="batch-actions">
                  <el-checkbox v-model="selectAllOrders" @change="handleSelectAll">全选</el-checkbox>
                  <el-button
                    type="danger"
                    :icon="Delete"
                    :disabled="selectedOrders.length === 0"
                    @click="handleBatchDelete"
                  >
                    批量删除
                  </el-button>
                </div>
              </div>
              <div v-if="filteredOrders.length > 0" class="orders-list">
                <div v-for="order in filteredOrders" :key="order.id" class="order-item">
                  <div class="order-header">
                    <div class="order-info">
                      <el-checkbox v-model="order.selected" @change="handleOrderSelect" />
                      <span class="order-id">订单号：{{ order.id }}</span>
                      <span class="order-time">{{ formatTime(order.createTime) }}</span>
                    </div>
                    <el-tag :type="getStatusType(order.status)" size="small">
                      {{ order.statusText }}
                    </el-tag>
                  </div>
                  <div class="order-body">
                    <div class="order-gear">
                      <div class="gear-images" v-if="order.gearImages">
                        <div
                          v-for="(img, index) in getGearImages(order.gearImages)"
                          :key="index"
                          class="gear-image"
                          @click="handlePreviewImage(order.gearImages, index)"
                        >
                          <img :src="img" :alt="`装备图片 ${index + 1}`" />
                        </div>
                      </div>
                      <div class="gear-info">
                        <div class="gear-title">{{ order.gearTitle }}</div>
                        <div class="gear-price">¥{{ order.gearPrice }}</div>
                      </div>
                    </div>
                    <div class="order-total">
                      <span class="total-label">实付金额：</span>
                      <span class="total-amount">¥{{ order.totalAmount }}</span>
                    </div>
                  </div>
                  <div class="order-footer">
                    <div class="order-info-footer">
                      <div class="order-address">
                        <el-icon><Location /></el-icon>
                        {{ order.address }}
                      </div>
                      <div class="order-phone">
                        <el-icon><Phone /></el-icon>
                        {{ order.contactPhone }}
                      </div>
                    </div>
                    <div class="order-actions">
                      <el-button
                        v-if="order.statusDictItemCode === 'unpaid'"
                        type="primary"
                        size="small"
                        @click="handleConfirmPayment(order.id)"
                      >
                        确认付款
                      </el-button>
                      <el-button
                        v-if="order.statusDictItemCode !== 'shipped'"
                        type="danger"
                        size="small"
                        :icon="Delete"
                        @click="handleDeleteOrder(order.id)"
                      >
                        删除
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-orders">
                <el-empty description="暂无订单" />
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="数据统计" name="stats">
          <div class="tab-content">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-card-header">
                  <div class="stat-icon attendance-icon">
                    <el-icon><Calendar /></el-icon>
                  </div>
                  <div class="stat-title-wrapper">
                    <h3>每月出钓率</h3>
                    <p class="stat-subtitle">最近12个月出勤统计</p>
                  </div>
                </div>
                <div class="chart-container">
                  <div ref="attendanceChartRef" class="chart"></div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-card-header">
                  <div class="stat-icon weight-icon">
                    <el-icon><Timer /></el-icon>
                  </div>
                  <div class="stat-title-wrapper">
                    <h3>鱼获总重量趋势</h3>
                    <p class="stat-subtitle">最近15天鱼获统计（斤）</p>
                  </div>
                </div>
                <div class="chart-container">
                  <div ref="weightChartRef" class="chart"></div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-card-header">
                  <div class="stat-icon airforce-icon">
                    <el-icon><Cloudy /></el-icon>
                  </div>
                  <div class="stat-title-wrapper">
                    <h3>每月空军率</h3>
                    <p class="stat-subtitle">最近12个月空军统计</p>
                  </div>
                </div>
                <div class="chart-container">
                  <div ref="airForceChartRef" class="chart"></div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="收货地址" name="address">
          <div class="tab-content">
            <div class="address-content">
              <!-- 添加地址按钮 -->
              <div class="add-address-btn">
                <el-button type="primary" class="btn-add" @click="handleAddAddress">
                  <el-icon><Plus /></el-icon> 添加新地址
                </el-button>
              </div>

              <!-- 地址列表 -->
              <div class="address-list" v-if="addresses.length > 0">
                <div v-for="address in addresses" :key="address.id" class="address-item">
                  <div class="address-info">
                    <div class="address-header">
                      <span class="address-name">{{ address.name }}</span>
                      <span class="address-phone">{{ address.phone }}</span>
                      <el-tag v-if="address.isDefault === 1" type="primary" size="small">默认</el-tag>
                    </div>
                    <div class="address-detail">
                      {{ address.fullAddress }}
                    </div>
                  </div>
                  <div class="address-actions">
                    <el-button size="small" @click="handleEditAddress(address)">编辑</el-button>
                    <el-button size="small" type="danger" @click="handleDeleteAddress(address.id)">删除</el-button>
                    <el-button v-if="address.isDefault !== 1" size="small" @click="handleSetDefault(address.id)">设为默认</el-button>
                  </div>
                </div>
              </div>

              <!-- 空地址提示 -->
              <div v-else class="empty-address">
                <el-empty description="暂无收货地址" />
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 地址编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="收货人">
          <el-input v-model="form.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        
        <!-- 地图选点功能 -->
        <el-form-item label="地址选择">
          <MapSelector 
            @select-address="handleAddressSelect"
            :height="'300px'"
          />
        </el-form-item>
        
        <el-form-item label="省份">
          <el-input v-model="form.province" placeholder="请输入省份" />
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="form.city" placeholder="请输入城市" />
        </el-form-item>
        <el-form-item label="区县">
          <el-input v-model="form.district" placeholder="请输入区县" />
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="form.detailAddress" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="form.isDefault">设为默认地址</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑资料对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑个人资料"
      width="650px"
      :close-on-click-modal="false"
      class="edit-profile-dialog"
    >
      <el-form :model="editForm" label-width="90px" class="edit-form">
        <el-form-item label="昵称">
          <el-input 
            v-model="editForm.nickname" 
            placeholder="请输入昵称"
            maxlength="20"
            show-word-limit
            size="large"
          />
        </el-form-item>
        <el-form-item label="头像">
          <div class="avatar-upload-wrapper">
            <el-upload
              class="avatar-uploader"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleAvatarChange"
              :before-upload="beforeAvatarUpload"
            >
              <img v-if="editForm.avatar" :src="editForm.avatar" class="avatar" />
              <div v-else class="avatar-placeholder">
                <el-icon class="avatar-icon"><Plus /></el-icon>
                <span class="avatar-text">上传头像</span>
              </div>
            </el-upload>
            <div class="avatar-tip">
              <el-icon><InfoFilled /></el-icon>
              支持 JPG/PNG 格式，大小不超过 10MB
            </div>
          </div>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input 
            v-model="editForm.phone" 
            placeholder="请输入手机号"
            maxlength="11"
            size="large"
          />
        </el-form-item>
        <el-form-item label="个性签名">
          <el-input
            v-model="editForm.signature"
            type="textarea"
            :rows="4"
            placeholder="写一句个性签名，展示你的钓鱼态度"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button size="large" @click="editDialogVisible = false">
            <el-icon><Close /></el-icon> 取消
          </el-button>
          <el-button type="primary" size="large" @click="handleUpdateProfile">
            <el-icon><Check /></el-icon> 保存修改
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 图片预览组件 -->
    <ImagePreview
      v-model:visible="previewVisible"
      :images="previewImages"
      :initial-index="previewInitialIndex"
    />

    <!-- 闲置装备发布/编辑对话框（复用组件） -->
    <PublishGearDialog
      v-model:visible="equipmentDialogVisible"
      :mode="equipmentDialogMode"
      :edit-data="equipmentEditData"
      @success="handleEquipmentDialogSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { Edit, Plus, Lock, Trophy, Calendar, Star, Location, Cpu, Close, Check, InfoFilled, Phone, Search, Delete, Select, Picture, Timer, Cloudy, Top, Bottom, ShoppingBag, ArrowDown } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as addressApi from '@/api/address'
import * as userApi from '@/api/user'
import * as fishingStatsApi from '@/api/fishing-stats'
import * as dictApi from '@/api/dict'
import { uploadUserAvatar } from '@/api/file'
import { getUserOrders, confirmPayment, deleteOrder, batchDeleteOrders, deleteGearMarket, updateGearMarketStatus, getUserGearList } from '@/api/gear'
import MapSelector from '@/components/common/MapSelector.vue'
import ImagePreview from '@/components/common/ImagePreview.vue'
import PublishGearDialog from '@/components/business/PublishGearDialog.vue'
import { useUserStore } from '@/stores/user'
import { formatDateTime } from '@/utils/format'
import * as echarts from 'echarts'

const router = useRouter()
const userStore = useUserStore()

// 当前激活的标签页
const activeTab = ref('equipment')

// 用户信息
const userInfo = ref({
  id: '',
  nickname: '',
  avatar: '',
  signature: '',
  isMaster: 0,
  level: 1,
  expPoints: 0,
  fishingDays: 0,
  totalFishWeight: 0,
  airForceCount: 0,
  badgeCount: 0
})

// 订单列表
const orders = ref([])
const orderSearchKeyword = ref('')
const selectAllOrders = ref(false)
const selectedOrders = ref([])
const orderStatusDict = ref({})

// 图片预览
const previewVisible = ref(false)
const previewImages = ref([])
const previewInitialIndex = ref(0)

// 图表相关
const attendanceChartRef = ref(null)
const weightChartRef = ref(null)
const airForceChartRef = ref(null)
let attendanceChart = null
let weightChart = null
let airForceChart = null

// 钓鱼统计数据
const fishingStats = ref({
  monthlyFishingRates: [],
  dailyFishWeights: [],
  monthlyAirForceRates: []
})

// 过滤后的订单
const filteredOrders = computed(() => {
  if (!orderSearchKeyword.value) {
    return orders.value
  }
  const keyword = orderSearchKeyword.value.toLowerCase()
  return orders.value.filter(order => 
    order.id.toString().includes(keyword) || 
    order.gearTitle.toLowerCase().includes(keyword)
  )
})

// 勋章数据
const obtainedMedals = ref([])
const unobtainedMedals = ref([])

// 格式化时间
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 加载用户勋章数据
const loadUserBadges = async () => {
  try {
    const userId = userStore.userInfo?.id
    if (!userId) {
      return
    }
    const response = await userApi.getUserBadges(userId)
    obtainedMedals.value = response.obtained || []
    unobtainedMedals.value = response.unobtained || []
  } catch (error) {
    ElMessage.error('加载勋章数据失败')
  }
}

// 闲置装备相关
const equipmentList = ref([])
const equipmentSearchKeyword = ref('')
const selectAllEquipment = ref(false)
const selectedEquipment = ref([])

// 装备编辑对话框
const equipmentDialogVisible = ref(false)
const equipmentDialogMode = ref('create') // 'create' 或 'edit'
const equipmentEditData = ref(null)

// 过滤后的装备
const filteredEquipment = computed(() => {
  if (!equipmentSearchKeyword.value) {
    return equipmentList.value
  }
  const keyword = equipmentSearchKeyword.value.toLowerCase()
  return equipmentList.value.filter(item => 
    item.title.toLowerCase().includes(keyword) ||
    item.brand.toLowerCase().includes(keyword)
  )
})

// 地址管理相关
const addresses = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加地址')
const form = ref({
  id: null,
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  isDefault: 0
})

// 编辑资料相关
const editDialogVisible = ref(false)
const editForm = ref({
  nickname: '',
  avatar: '',
  phone: '',
  signature: ''
})

// 初始化图表
onMounted(() => {
  // 加载用户个人中心数据
  loadUserProfile()
  
  // 加载订单状态字典
  loadOrderStatusDict()

  // 检查是否有从其他页面跳转过来的标签页标记
  const savedTab = localStorage.getItem('activeProfileTab')
  if (savedTab) {
    activeTab.value = savedTab
    localStorage.removeItem('activeProfileTab')
    if (savedTab === 'address') {
      loadAddresses()
    }
  }

  // 如果当前是闲置装备标签页，立即加载装备列表
  if (activeTab.value === 'equipment') {
    loadEquipmentList()
  }
})

// 获取需求文本
const getRequirementText = (medal) => {
  switch (medal.requirementType) {
    case 'fishing_days':
      return `需要出钓 ${medal.requirementValue} 天`
    case 'fish_days':
      return `需要有鱼获 ${medal.requirementValue} 天`
    case 'air_force_days':
      return `需要空军 ${medal.requirementValue} 天`
    case 'total_weight':
      return `需要累计鱼获 ${medal.requirementValue} 斤`
    default:
      return '未知需求'
  }
}

// 监听标签页变化
watch(activeTab, (newTab) => {
  if (newTab === 'address') {
    loadAddresses()
  } else if (newTab === 'orders') {
    loadOrders()
  } else if (newTab === 'stats') {
    // 切换到数据统计标签页时，加载统计数据并初始化图表
    loadFishingStats().then(() => {
      nextTick(() => {
        initCharts()
      })
    })
  } else if (newTab === 'medals') {
    // 切换到勋章墙标签页时，加载勋章数据
    loadUserBadges()
  } else if (newTab === 'equipment') {
    // 切换到闲置装备标签页时，加载装备数据
    loadEquipmentList()
  }
})

// 加载钓鱼统计数据
const loadFishingStats = async () => {
  try {
    const userId = userStore.userInfo?.id
    if (!userId) {
      return
    }
    const response = await fishingStatsApi.getFishingStats(userId, {
      catchTypeCode: 'catch_report',
      airForceTypeCode: 'air_force'
    })
    fishingStats.value = response
  } catch (error) {
    ElMessage.error('加载钓鱼统计数据失败')
  }
}

// 初始化图表
const initCharts = () => {
  initAttendanceChart()
  initWeightChart()
  initAirForceChart()
}

// 初始化出钓率图表
const initAttendanceChart = () => {
  if (!attendanceChartRef.value) return
  
  if (attendanceChart) {
    attendanceChart.dispose()
  }
  
  attendanceChart = echarts.init(attendanceChartRef.value)
  
  const data = fishingStats.value.monthlyFishingRates || []
  const months = data.map(item => {
    const [year, month] = item.month.split('-')
    return `${month}月`
  })
  const rates = data.map(item => item.rate)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e0e6ed',
      borderWidth: 1,
      textStyle: {
        color: '#2c3e50'
      },
      formatter: function(params) {
        const item = data[params[0].dataIndex]
        return `
          <div style="font-weight:600;margin-bottom:5px">${item.monthName}</div>
          <div>出钓天数: <span style="color:#667eea;font-weight:600">${item.fishingDays}</span> 天</div>
          <div>当月天数: ${item.totalDays} 天</div>
          <div>出钓率: <span style="color:#667eea;font-weight:600">${item.rate}%</span></div>
        `
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: {
        lineStyle: {
          color: '#e0e6ed'
        }
      },
      axisLabel: {
        color: '#606266',
        fontSize: 11
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#606266',
        formatter: '{value}%'
      },
      splitLine: {
        lineStyle: {
          color: '#f0f2f5',
          type: 'dashed'
        }
      }
    },
    series: [{
      name: '出钓率',
      type: 'bar',
      data: rates,
      barWidth: '60%',
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#667eea' },
          { offset: 1, color: '#764ba2' }
        ])
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#764ba2' },
            { offset: 1, color: '#667eea' }
          ])
        }
      }
    }]
  }
  
  attendanceChart.setOption(option)
}

// 初始化鱼获重量图表
const initWeightChart = () => {
  if (!weightChartRef.value) return
  
  if (weightChart) {
    weightChart.dispose()
  }
  
  weightChart = echarts.init(weightChartRef.value)
  
  const data = fishingStats.value.dailyFishWeights || []
  const dates = data.map(item => item.date)
  const weights = data.map(item => item.totalWeight)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e0e6ed',
      borderWidth: 1,
      textStyle: {
        color: '#2c3e50'
      },
      formatter: function(params) {
        const item = data[params[0].dataIndex]
        return `
          <div style="font-weight:600;margin-bottom:5px">${item.fullDate}</div>
          <div>鱼获重量: <span style="color:#52c41a;font-weight:600">${item.totalWeight}</span> 斤</div>
          ${item.hasRecord ? '<div style="color:#52c41a;font-size:12px">✓ 有钓鱼记录</div>' : '<div style="color:#999;font-size:12px">无钓鱼记录</div>'}
        `
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: {
        lineStyle: {
          color: '#e0e6ed'
        }
      },
      axisLabel: {
        color: '#606266',
        fontSize: 10,
        rotate: 45
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#606266',
        formatter: '{value} 斤'
      },
      splitLine: {
        lineStyle: {
          color: '#f0f2f5',
          type: 'dashed'
        }
      }
    },
    series: [{
      name: '鱼获重量',
      type: 'line',
      data: weights,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#52c41a' },
          { offset: 1, color: '#95de64' }
        ])
      },
      itemStyle: {
        color: '#52c41a',
        borderWidth: 2,
        borderColor: '#fff'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
          { offset: 1, color: 'rgba(82, 196, 26, 0.05)' }
        ])
      },
      emphasis: {
        itemStyle: {
          color: '#52c41a',
          borderWidth: 3,
          borderColor: '#fff',
          shadowBlur: 10,
          shadowColor: 'rgba(82, 196, 26, 0.5)'
        }
      }
    }]
  }
  
  weightChart.setOption(option)
}

// 初始化空军率图表
const initAirForceChart = () => {
  if (!airForceChartRef.value) return
  
  if (airForceChart) {
    airForceChart.dispose()
  }
  
  airForceChart = echarts.init(airForceChartRef.value)
  
  const data = fishingStats.value.monthlyAirForceRates || []
  const months = data.map(item => {
    const [year, month] = item.month.split('-')
    return `${month}月`
  })
  const rates = data.map(item => item.rate)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e0e6ed',
      borderWidth: 1,
      textStyle: {
        color: '#2c3e50'
      },
      formatter: function(params) {
        const item = data[params[0].dataIndex]
        return `
          <div style="font-weight:600;margin-bottom:5px">${item.monthName}</div>
          <div>出钓次数: <span style="color:#667eea;font-weight:600">${item.totalTrips}</span> 次</div>
          <div>空军次数: <span style="color:#ff4d4f;font-weight:600">${item.airForceCount}</span> 次</div>
          <div>空军率: <span style="color:#ff4d4f;font-weight:600">${item.rate}%</span></div>
        `
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: {
        lineStyle: {
          color: '#e0e6ed'
        }
      },
      axisLabel: {
        color: '#606266',
        fontSize: 11
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#606266',
        formatter: '{value}%'
      },
      splitLine: {
        lineStyle: {
          color: '#f0f2f5',
          type: 'dashed'
        }
      }
    },
    series: [{
      name: '空军率',
      type: 'line',
      data: rates,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#ff4d4f' },
          { offset: 1, color: '#ff7875' }
        ])
      },
      itemStyle: {
        color: function(params) {
          const rate = params.value
          if (rate >= 50) return '#ff4d4f'
          if (rate >= 30) return '#faad14'
          return '#52c41a'
        },
        borderWidth: 2,
        borderColor: '#fff'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(255, 77, 79, 0.2)' },
          { offset: 1, color: 'rgba(255, 77, 79, 0.02)' }
        ])
      },
      emphasis: {
        itemStyle: {
          borderWidth: 3,
          borderColor: '#fff',
          shadowBlur: 10,
          shadowColor: 'rgba(255, 77, 79, 0.5)'
        }
      }
    }]
  }
  
  airForceChart.setOption(option)
}

// 窗口大小改变时重新渲染图表
const handleResize = () => {
  attendanceChart?.resize()
  weightChart?.resize()
  airForceChart?.resize()
}

window.addEventListener('resize', handleResize)

// 加载用户个人中心数据
const loadUserProfile = async () => {
  try {
    const userId = userStore.userInfo?.id
    if (!userId) {
      ElMessage.error('请先登录')
      router.push('/login')
      return
    }
    
    const response = await userApi.getProfile(userId)
    userInfo.value = response
  } catch (error) {
    ElMessage.error('加载个人中心数据失败')
  }
}

// 加载地址列表
const loadAddresses = async () => {
  try {
    const response = await addressApi.getUserAddresses()
    addresses.value = response
  } catch (error) {
    ElMessage.error('加载地址失败')
  }
}

// 打开编辑资料对话框
const handleEditProfile = () => {
  editForm.value = {
    nickname: userInfo.value.nickname,
    avatar: userInfo.value.avatar,
    phone: userInfo.value.phone,
    signature: userInfo.value.signature
  }
  editDialogVisible.value = true
}

// 处理头像上传
const handleAvatarChange = async (file) => {
  if (!file.raw) return

  const isJpgOrPng = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png'
  const isLt10M = file.raw.size / 1024 / 1024 < 10

  if (!isJpgOrPng) {
    ElMessage.error('只能上传 JPG/PNG 图片')
    return
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB')
    return
  }

  try {
    const url = await uploadUserAvatar(file.raw)
    editForm.value.avatar = url
    ElMessage.success('头像上传成功')
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败，请重试')
  }
}

// 头像上传前验证
const beforeAvatarUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isJpgOrPng) {
    ElMessage.error('只能上传 JPG/PNG 图片')
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB')
  }
  return isJpgOrPng && isLt10M
}

// 更新个人资料
const handleUpdateProfile = async () => {
  try {
    const userId = userStore.userInfo?.id
    if (!userId) {
      ElMessage.error('请先登录')
      router.push('/login')
      return
    }
    
    const response = await userApi.updateProfile(userId, editForm.value)
    ElMessage.success('资料更新成功')
    editDialogVisible.value = false
    loadUserProfile()
  } catch (error) {
    ElMessage.error('更新失败，请重试')
  }
}

// 计算总经验值上限
const getNextLevelExp = (currentExp) => {
  return 10000
}

// 加载订单状态字典
const loadOrderStatusDict = async () => {
  try {
    const response = await dictApi.getDictItems('order_status')
    orderStatusDict.value = response
  } catch (error) {
    console.error('加载订单状态字典失败:', error)
  }
}

// 加载订单列表
const loadOrders = async () => {
  try {
    const userId = userStore.userInfo?.id
    if (!userId) {
      ElMessage.error('请先登录')
      router.push('/login')
      return
    }
    const response = await getUserOrders(userId)
    orders.value = response
  } catch (error) {
    ElMessage.error('加载订单失败')
  }
}

// 格式化时间
const formatTime = (time) => {
  return formatDateTime(time)
}

// 获取订单状态类型
const getStatusType = (statusDictItemCode) => {
  if (!statusDictItemCode) return 'info'
  
  // 从数据字典中获取状态类型
  const statusItem = orderStatusDict.value?.find(item => item.itemCode === statusDictItemCode)
  if (statusItem?.color) {
    return statusItem.color
  }
  
  // 兜底逻辑
  const typeMap = {
    'unpaid': 'warning',
    'paid': 'primary',
    'shipped': 'info',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return typeMap[statusDictItemCode] || 'info'
}

// 确认付款
const handleConfirmPayment = async (orderId) => {
  try {
    await ElMessageBox.confirm('确认付款后，订单将在30分钟后自动完成', '确认付款', {
      confirmButtonText: '确认付款',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await confirmPayment(orderId)
    ElMessage.success('付款成功')
    await loadOrders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('付款失败，请重试')
    }
  }
}

// 获取装备图片
const getGearImages = (images) => {
  if (!images) return []
  if (Array.isArray(images)) return images
  try {
    return JSON.parse(images)
  } catch (e) {
    return images.split(',').map(img => img.trim()).filter(img => img)
  }
}

// 预览图片
const handlePreviewImage = (images, index) => {
  previewImages.value = getGearImages(images)
  previewInitialIndex.value = index
  previewVisible.value = true
}

// 预览装备图片
const handlePreviewImages = (images, index) => {
  previewImages.value = getGearImages(images)
  previewInitialIndex.value = index
  previewVisible.value = true
}

// 获取状态样式类
const getStatusClass = (statusDictItemCode) => {
  switch (statusDictItemCode) {
    case 'on_sale':
      return 'status-on-sale'
    case 'sold':
      return 'status-sold'
    case 'off_shelf':
      return 'status-off-sale'
    default:
      return 'status-off-sale'
  }
}

// 搜索订单
const handleSearchOrders = () => {
  // 使用computed属性自动过滤
}

// 全选/反选
const handleSelectAll = (checked) => {
  orders.value.forEach(order => {
    order.selected = checked
  })
  updateSelectedOrders()
}

// 订单选择变化
const handleOrderSelect = () => {
  updateSelectedOrders()
}

// 更新选中的订单
const updateSelectedOrders = () => {
  selectedOrders.value = orders.value.filter(order => order.selected).map(order => order.id)
  selectAllOrders.value = selectedOrders.value.length === orders.value.length && orders.value.length > 0
}

// 删除订单
const handleDeleteOrder = async (orderId) => {
  try {
    await ElMessageBox.confirm('确定要删除该订单吗？', '删除订单', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteOrder(orderId)
    ElMessage.success('删除成功')
    await loadOrders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请重试')
    }
  }
}

// 批量删除订单
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedOrders.value.length} 个订单吗？`, '批量删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await batchDeleteOrders(selectedOrders.value)
    ElMessage.success('批量删除成功')
    await loadOrders()
    selectAllOrders.value = false
    selectedOrders.value = []
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败，请重试')
    }
  }
}

// 添加地址
const handleAddAddress = () => {
  dialogTitle.value = '添加地址'
  form.value = {
    id: null,
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detailAddress: '',
    isDefault: 0
  }
  dialogVisible.value = true
}

// 编辑地址
const handleEditAddress = (address) => {
  dialogTitle.value = '编辑地址'
  form.value = {
    id: address.id,
    name: address.name,
    phone: address.phone,
    province: address.province,
    city: address.city,
    district: address.district,
    detailAddress: address.detailAddress,
    isDefault: address.isDefault
  }
  dialogVisible.value = true
}

// 删除地址
const handleDeleteAddress = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该地址吗？', '删除地址', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await addressApi.deleteAddress(id)
    ElMessage.success('删除成功')
    await loadAddresses()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 设为默认地址
const handleSetDefault = async (id) => {
  try {
    await addressApi.setDefaultAddress(id)
    ElMessage.success('设置成功')
    await loadAddresses()
  } catch (error) {
    ElMessage.error('设置失败')
  }
}

// 提交地址表单
const handleSubmit = async () => {
  try {
    if (!form.value.name || !form.value.phone || !form.value.province || !form.value.city || !form.value.detailAddress) {
      ElMessage.error('请填写完整的地址信息')
      return
    }
    
    const addressData = {
      ...form.value,
      isDefault: form.value.isDefault ? 1 : 0
    }
    
    if (form.value.id) {
      await addressApi.updateAddress(form.value.id, addressData)
      ElMessage.success('地址更新成功')
    } else {
      await addressApi.createAddress(addressData)
      ElMessage.success('地址添加成功')
    }
    
    dialogVisible.value = false
    await loadAddresses()
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  }
}

// 处理地图选择地址
const handleAddressSelect = (addressInfo) => {
  if (addressInfo.province) form.value.province = addressInfo.province
  if (addressInfo.city) form.value.city = addressInfo.city
  if (addressInfo.district) form.value.district = addressInfo.district
  if (addressInfo.address) form.value.detailAddress = addressInfo.address
}

// 加载闲置装备列表
const loadEquipmentList = async () => {
  try {
    const userId = userStore.userInfo?.id
    if (!userId) {
      ElMessage.error('请先登录')
      router.push('/login')
      return
    }
    // 调用后端接口获取用户的闲置装备列表
    const response = await getUserGearList()
    equipmentList.value = response.map(item => ({
      ...item,
      images: item.images || [],
      selected: false
    }))
  } catch (error) {
    ElMessage.error('加载闲置装备失败')
  }
}

// 搜索装备
const handleSearchEquipment = () => {
  // 使用computed属性自动过滤
}

// 全选/反选装备
const handleSelectAllEquipment = (checked) => {
  equipmentList.value.forEach(item => {
    item.selected = checked
  })
  updateSelectedEquipment()
}

// 装备选择变化
const handleEquipmentSelect = () => {
  updateSelectedEquipment()
}

// 更新选中的装备
const updateSelectedEquipment = () => {
  selectedEquipment.value = equipmentList.value.filter(item => item.selected).map(item => item.id)
  selectAllEquipment.value = selectedEquipment.value.length === equipmentList.value.length && equipmentList.value.length > 0
}

// 添加闲置装备
const handleAddEquipment = () => {
  equipmentDialogMode.value = 'create'
  equipmentEditData.value = null
  equipmentDialogVisible.value = true
}

// 编辑闲置装备
const handleEditEquipment = (item) => {
  equipmentDialogMode.value = 'edit'
  // 转换状态值为数据字典的code
  const statusMap = {
    0: 'on_sale',
    1: 'sold',
    2: 'off_shelf'
  }
  equipmentEditData.value = {
    id: item.id,
    title: item.title,
    description: item.description,
    price: item.price,
    originalPrice: item.originalPrice,
    images: item.images || [],
    categoryDictItemCode: item.categoryDictItemCode || item.category,
    statusDictItemCode: item.statusDictItemCode || statusMap[item.status] || 'on_sale'
  }
  equipmentDialogVisible.value = true
}

// 对话框成功回调
const handleEquipmentDialogSuccess = () => {
  loadEquipmentList()
}

// 删除闲置装备
const handleDeleteEquipment = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该闲置装备吗？', '删除装备', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 调用后端接口删除装备
    await deleteGearMarket(id)
    ElMessage.success('删除成功')
    await loadEquipmentList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请重试')
    }
  }
}

// 批量删除闲置装备
const handleBatchDeleteEquipment = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedEquipment.value.length} 个闲置装备吗？`, '批量删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 调用后端接口批量删除装备
    for (const id of selectedEquipment.value) {
      await deleteGearMarket(id)
    }
    ElMessage.success('批量删除成功')
    await loadEquipmentList()
    selectAllEquipment.value = false
    selectedEquipment.value = []
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败，请重试')
    }
  }
}

// 更新装备状态（上下架）
const handleUpdateStatus = async (id, statusCode) => {
  try {
    await updateGearMarketStatus(id, statusCode)
    ElMessage.success(statusCode === 'on_sale' ? '上架成功' : '下架成功')
    await loadEquipmentList()
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  }
}
</script>

<style scoped lang="scss">
.profile-page {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding-bottom: 4vh;
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 4vh 0;
  background: linear-gradient(135deg, rgba(67, 97, 238, 0.95), rgba(72, 149, 239, 0.95));
  backdrop-filter: blur(10px);
  color: white;
  box-shadow: 0 4px 20px rgba(67, 97, 238, 0.3);

  .page-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 0.5vh;
    color: white;
  }

  .page-description {
    font-size: 0.95rem;
    opacity: 0.9;
    margin: 0;
  }
}

/* 闲置装备相关样式 */
.equipment-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.1);

  .search-box {
    flex: 1;
    max-width: 400px;

    .el-input {
      width: 100%;

      .el-input__wrapper {
        border-radius: 10px;
        border: 1px solid #e4e7ed;

        &:focus-within {
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          border-color: #667eea;
        }
      }
    }
  }

  .batch-actions {
    display: flex;
    align-items: center;
    gap: 12px;

    .el-checkbox {
      font-size: 0.95rem;
      color: #606266;
    }

    .el-button {
      border-radius: 8px;
    }
  }
}

.equipment-list {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .equipment-item {
    display: flex;
    align-items: flex-start;
    padding: 24px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    border: 1px solid #f0f0f0;

    &:hover {
      box-shadow: 0 8px 30px 0 rgba(0, 0, 0, 0.15);
      transform: translateY(-3px);
      border-color: #e6e8eb;
    }

    .equipment-checkbox {
      margin-right: 20px;
      margin-top: 8px;

      .el-checkbox__input.is-checked .el-checkbox__inner {
        background-color: #667eea;
        border-color: #667eea;
      }
    }

    .equipment-image {
      width: 240px;
      height: 200px;
      border-radius: 12px;
      overflow: visible;
      margin-right: 24px;
      flex-shrink: 0;
      position: relative;

      .el-carousel {
        height: 180px !important;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);

        .el-carousel__container {
          height: 180px !important;
        }

        .carousel-image {
          width: 100%;
          height: 180px;
          object-fit: cover;
          cursor: zoom-in;
          transition: transform 0.3s ease;

          &:hover {
            transform: scale(1.02);
          }
        }

        .el-carousel__indicators {
          bottom: -25px;

          .el-carousel__indicator {
            .el-carousel__button {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background-color: #dcdfe6;
            }

            &.is-active .el-carousel__button {
              background-color: #667eea;
            }
          }
        }

        .el-carousel__arrow {
          background: rgba(0, 0, 0, 0.4);
          border-radius: 50%;
          width: 32px;
          height: 32px;

          &:hover {
            background: rgba(0, 0, 0, 0.6);
          }

          .el-icon {
            font-size: 14px;
          }
        }
      }

      .no-image {
        width: 100%;
        height: 180px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #f5f7fa;
        border-radius: 12px;
        color: #c0c4cc;
        gap: 8px;

        span {
          font-size: 14px;
        }
      }

      .equipment-status-tag {
        position: absolute;
        top: -8px;
        right: -8px;
        padding: 6px 14px;
        border-radius: 12px 0 12px 0;
        font-size: 12px;
        font-weight: 600;
        color: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        z-index: 10;

        &.status-on-sale {
          background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
        }

        &.status-sold {
          background: linear-gradient(135deg, #909399 0%, #a6a9ad 100%);
        }

        &.status-off-sale {
          background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
        }
      }
    }

    .equipment-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 200px;

      .equipment-info {
        flex: 1;

        .equipment-name {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #303133;
          line-height: 1.4;
          transition: color 0.3s ease;

          &:hover {
            color: #667eea;
          }
        }

        .equipment-desc {
          font-size: 14px;
          color: #606266;
          margin-bottom: 12px;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .equipment-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;

          .equipment-price {
            font-size: 22px;
            font-weight: 700;
            color: #f56c6c;
            font-family: 'Arial', sans-serif;
          }

          .original-price {
            font-size: 14px;
            color: #c0c4cc;
            text-decoration: line-through;
          }
        }
      }

      .equipment-actions {
        display: flex;
        gap: 12px;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #f0f0f0;

        .el-button {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          font-size: 14px;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
          }

          .el-icon {
            font-size: 16px;
          }
        }
      }
    }
  }
}

.empty-equipment {
  padding:40px 0;
  text-align: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.1);
}

.add-equipment-btn {
  margin-top: 12px;
  margin-bottom: 12px;
  width: 100%;
  border-radius: 10px;
  padding: 12px 0;
  font-size: 14px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2vw;
}

.profile-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 4vh;
  box-shadow: var(--shadow-lg);
  margin-bottom: 4vh;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 3vh;
}

.avatar-section {
  display: flex;
  gap: 2vw;
  align-items: center;

  .profile-avatar {
    border: 4px solid var(--primary-light);
    box-shadow: var(--shadow-md);
  }

  .user-basic-info {
    .username {
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 1vh;
      color: var(--text-primary);
    }

    .user-meta {
      display: flex;
      gap: 1vw;
      align-items: center;
      margin-bottom: 1vh;

      .level {
        background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
        color: white;
        padding: 0.3vh 1vw;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 600;
      }

      .exp {
        font-size: 0.9rem;
        color: var(--text-secondary);
      }
    }

    .signature {
      color: var(--text-secondary);
      line-height: 1.5;
    }
  }
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2vw;
  padding-top: 3vh;
  border-top: 1px solid var(--border-light);

  .stat-item {
    text-align: center;

    .stat-number {
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--primary-color);
      margin-bottom: 0.5vh;
    }

    .stat-label {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
  }
}

.profile-tabs {
  margin: 4vh 0;

  :deep(.el-tabs__header) {
    border-bottom: 1px solid var(--border-light);

    .el-tabs__nav {
      margin: 0;
    }

    .el-tabs__item {
      font-size: 1.1rem;
      font-weight: 500;
      padding: 2vh 2vw;

      &.is-active {
        color: var(--primary-color);

        &::after {
          background: var(--primary-color);
        }
      }
    }
  }
}

.tab-content {
  padding: 4vh 0;
}

.equipment-list {
  display: flex;
  flex-direction: column;
  gap: 2vh;
  margin-bottom: 3vh;
}

.equipment-item {
  display: flex;
  gap: 2vw;
  background: white;
  border-radius: var(--radius-lg);
  padding: 2vh;
  box-shadow: var(--shadow-md);

  .equipment-image {
    width: 100px;
    height: 100px;
    border-radius: var(--radius-md);
    overflow: hidden;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .equipment-info {
    flex: 1;

    .equipment-name {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.5vh;
      color: var(--text-primary);
    }

    .equipment-desc {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-bottom: 1vh;
      line-height: 1.4;
    }

    .equipment-meta {
      display: flex;
      justify-content: space-between;

      .equipment-brand {
        font-weight: 600;
        color: var(--primary-color);
      }

      .equipment-price {
        font-weight: 600;
        color: var(--danger-color);
      }
    }
  }
}

.add-equipment-btn {
  margin-top: 2vh;
}

.orders-content {
  background: white;
  border-radius: var(--radius-lg);
  padding: 4vh;
  box-shadow: var(--shadow-md);
}

.orders-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3vh;
  gap: 2vw;

  .search-box {
    flex: 1;
    max-width: 500px;

    :deep(.el-input__wrapper) {
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      &.is-focus {
        box-shadow: 0 2px 12px rgba(102, 126, 234, 0.15);
      }
    }

    :deep(.el-input-group__append) {
      .el-button {
        border-radius: 0 8px 8px 0;
        background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
        border: none;
        font-weight: 500;
        transition: all 0.3s;

        &:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
      }
    }
  }

  .batch-actions {
    display: flex;
    align-items: center;
    gap: 1vw;

    .el-checkbox {
      margin-right: 1vw;
    }
  }
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 2vh;
}

.order-item {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all 0.3s;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2vh 3vh;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-light);

    .order-info {
      display: flex;
      gap: 2vw;
      align-items: center;

      .order-id {
        font-weight: 600;
        color: var(--text-primary);
      }

      .order-time {
        font-size: 0.9rem;
        color: var(--text-secondary);
      }
    }
  }

  .order-body {
    padding: 3vh;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .order-gear {
      flex: 1;
      display: flex;
      gap: 2vw;
      align-items: center;

      .gear-images {
        display: flex;
        gap: 1vw;

        .gear-image {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;

          &:hover {
            transform: scale(1.05);
            box-shadow: var(--shadow-md);
          }

          &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0);
            transition: background 0.3s;
            border-radius: 8px;
          }

          &:hover::after {
            background: rgba(0, 0, 0, 0.1);
          }

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }

      .gear-info {
        flex: 1;

        .gear-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1vh;
        }

        .gear-price {
          font-size: 0.95rem;
          color: var(--text-secondary);
        }
      }
    }

    .order-total {
      text-align: right;

      .total-label {
        font-size: 0.9rem;
        color: var(--text-secondary);
      }

      .total-amount {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--primary-color);
      }
    }
  }

  .order-footer {
    padding: 2vh 3vh;
    border-top: 1px solid var(--border-light);
    display: flex;
    justify-content: space-between;
    align-items: center;

    .order-info-footer {
      display: flex;
      gap: 3vw;
      align-items: center;
      font-size: 0.9rem;
      color: var(--text-secondary);

      .order-address,
      .order-phone {
        display: flex;
        align-items: center;
        gap: 0.5vw;

        .el-icon {
          color: var(--primary-color);
        }
      }
    }

    .order-actions {
      .el-button {
        border-radius: 6px;
        font-weight: 500;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
      }
    }
  }
}

.empty-orders {
  padding: 8vh 0;
  text-align: center;
}

.address-content {
  background: white;
  border-radius: var(--radius-lg);
  padding: 4vh;
  box-shadow: var(--shadow-md);
}

.add-address-btn {
  margin-bottom: 3vh;

  .btn-add {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
    border: none;
    border-radius: var(--radius-md);
    padding: 10px 24px;
    font-weight: 600;

    &:hover {
      opacity: 0.9;
    }
  }
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 2vh;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2vh;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all 0.3s;

  &:hover {
    box-shadow: var(--shadow-sm);
  }

  .address-info {
    flex: 1;

    .address-header {
      display: flex;
      align-items: center;
      gap: 1vw;
      margin-bottom: 1vh;

      .address-name {
        font-weight: 600;
        color: var(--text-primary);
      }

      .address-phone {
        color: var(--text-secondary);
      }
    }

    .address-detail {
      color: var(--text-secondary);
      line-height: 1.5;
    }
  }

  .address-actions {
    display: flex;
    gap: 12px;

    .el-button {
      padding: 4px 12px;
    }
  }
}

.empty-address {
  text-align: center;
  padding: 8vh 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.medals-section {
  margin-bottom: 4vh;

  .section-title {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 2vh;
    color: var(--text-primary);
    border-bottom: 2px solid var(--primary-color);
    padding-bottom: 1vh;
  }
}

.empty-medals {
  padding: 4vh 0;
  text-align: center;
}

.medals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 2vw;
}

.medal-item {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: var(--radius-lg);
  padding: 2.5vh;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  &.locked {
    opacity: 0.7;
    background: linear-gradient(135deg, #f1f3f5 0%, #e9ecef 100%);
  }

  .medal-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 2vh;
    box-shadow: var(--shadow-sm);

    .medal-img {
      width: 70px;
      height: 70px;
      object-fit: contain;
      border-radius: 50%;
      transition: all 0.3s ease;

      &.locked {
        filter: grayscale(100%);
        opacity: 0.5;
      }
    }
  }

  .medal-name {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 1vh;
    color: var(--text-primary);
  }

  .medal-desc {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 2vh;
    line-height: 1.4;
    min-height: 40px;
  }

  .medal-date {
    font-size: 0.8rem;
    color: var(--primary-color);
    font-weight: 600;
  }

  .medal-requirement {
    font-size: 0.8rem;
    color: var(--warning-color);
    font-weight: 600;
    background: rgba(230, 162, 60, 0.1);
    padding: 0.5vh 1vw;
    border-radius: 20px;
    display: inline-block;
  }
}

// 数据统计样式
.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 3vh;
}

.stat-card {
  width: 100%;
  background: white;
  border-radius: var(--radius-lg);
  padding: 3vh;
  box-shadow: var(--shadow-md);
  transition: all 0.3s;

  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
  }

  .stat-card-header {
    display: flex;
    align-items: center;
    gap: 1.5vw;
    margin-bottom: 3vh;
    padding-bottom: 2vh;
    border-bottom: 1px solid var(--border-light);

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;

      :deep(.el-icon) {
        font-size: 28px;
        color: white;
      }

      &.attendance-icon {
        background: linear-gradient(135deg, #667eea, #764ba2);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
      }

      &.weight-icon {
        background: linear-gradient(135deg, #52c41a, #95de64);
        box-shadow: 0 8px 20px rgba(82, 196, 26, 0.3);
      }

      &.airforce-icon {
        background: linear-gradient(135deg, #ff4d4f, #ff7875);
        box-shadow: 0 8px 20px rgba(255, 77, 79, 0.3);
      }
    }

    .stat-title-wrapper {
      h3 {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 0.5vh 0;
      }

      .stat-subtitle {
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin: 0;
      }
    }
  }

  .chart-container {
    height: 320px;
    background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%);
    border-radius: var(--radius-md);
    padding: 1vh;

    .chart {
      width: 100%;
      height: 100%;
    }
  }
}

/* 编辑资料对话框样式 */
.edit-profile-dialog {
  :deep(.el-dialog__header) {
    padding: 24px 24px 16px;
    border-bottom: 1px solid var(--border-light);
    
    .el-dialog__title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  :deep(.el-dialog__body) {
    padding: 24px;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 24px 24px;
    border-top: 1px solid var(--border-light);
  }
}

.edit-form {
  .el-form-item {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    :deep(.el-form-item__label) {
      font-weight: 500;
      color: var(--text-primary);
      font-size: 0.95rem;
    }

    :deep(.el-input__wrapper) {
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      &.is-focus {
        box-shadow: 0 2px 12px rgba(102, 126, 234, 0.15);
      }
    }

    :deep(.el-textarea__inner) {
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      &:focus {
        box-shadow: 0 2px 12px rgba(102, 126, 234, 0.15);
      }
    }
  }
}

.avatar-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .avatar-uploader {
    :deep(.el-upload) {
      border: 2px dashed var(--border-color);
      border-radius: 12px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s;

      &:hover {
        border-color: var(--primary-color);
        background: var(--bg-secondary);
      }
    }

    :deep(.el-upload:hover) {
      .el-upload-dragger {
        border-color: var(--primary-color);
      }
    }

    .avatar {
      width: 120px;
      height: 120px;
      display: block;
      border-radius: 12px;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 120px;
      height: 120px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: var(--text-secondary);

      .avatar-icon {
        font-size: 32px;
        color: var(--primary-color);
      }

      .avatar-text {
        font-size: 0.9rem;
      }
    }
  }

  .avatar-tip {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    color: var(--text-secondary);
    padding: 8px 12px;
    background: var(--bg-secondary);
    border-radius: 6px;

    .el-icon {
      color: var(--primary-color);
      font-size: 14px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  .el-button {
    min-width: 120px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
    }

    &:last-child {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      border: none;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

      &:hover {
        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    gap: 3vh;
    align-items: flex-start;
  }

  .avatar-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .equipment-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .medals-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats-grid {
    display: flex;
    flex-direction: column;
    gap: 3vh;
  }

  .edit-profile-dialog {
    :deep(.el-dialog) {
      width: 90% !important;
      margin: 5vh auto;
    }
  }

  .avatar-upload-wrapper {
    .avatar-uploader {
      :deep(.el-upload) {
        width: 100px;
        height: 100px;
      }

      .avatar {
        width: 100px;
        height: 100px;
      }

      .avatar-placeholder {
        width: 100px;
        height: 100px;
      }
    }
  }
}
</style>