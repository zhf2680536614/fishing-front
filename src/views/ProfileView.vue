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
            <el-avatar :size="120" :src="userInfo.avatar" class="profile-avatar" />
            <div class="user-basic-info">
              <h2 class="username">{{ userInfo.nickname }}</h2>
              <div class="user-meta">
                <el-tag v-if="userInfo.isMaster" type="success" effect="dark">钓鱼大师</el-tag>
                <span class="level">Lv.{{ userInfo.level }}</span>
                <span class="exp">经验值: {{ userInfo.exp }}/{{ userInfo.nextLevelExp }}</span>
              </div>
              <p class="signature">{{ userInfo.signature }}</p>
            </div>
          </div>
          <div class="profile-actions">
            <el-button type="primary">
              <el-icon><Edit /></el-icon> 编辑资料
            </el-button>
          </div>
        </div>
        <div class="profile-stats">
          <div class="stat-item">
            <div class="stat-number">{{ userStats.fishingDays }}</div>
            <div class="stat-label">出钓天数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ userStats.totalWeight }}kg</div>
            <div class="stat-label">总鱼获</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ userStats.airForceCount }}</div>
            <div class="stat-label">空军次数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ userStats.medals.length }}</div>
            <div class="stat-label">获得勋章</div>
          </div>
        </div>
      </div>

      <!-- 功能标签页 -->
      <el-tabs v-model="activeTab" class="profile-tabs">
        <el-tab-pane label="数字钓箱" name="equipment">
          <div class="tab-content">
            <div class="equipment-list">
              <div v-for="item in equipmentList" :key="item.id" class="equipment-item">
                <div class="equipment-image">
                  <img :src="item.image" alt="装备图片" />
                </div>
                <div class="equipment-info">
                  <h3 class="equipment-name">{{ item.name }}</h3>
                  <p class="equipment-desc">{{ item.description }}</p>
                  <div class="equipment-meta">
                    <span class="equipment-brand">{{ item.brand }}</span>
                    <span class="equipment-price">¥{{ item.price }}</span>
                  </div>
                </div>
              </div>
            </div>
            <el-button type="primary" class="add-equipment-btn">
              <el-icon><Plus /></el-icon> 添加装备
            </el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="勋章墙" name="medals">
          <div class="tab-content">
            <div class="medals-grid">
              <div v-for="medal in userStats.medals" :key="medal.id" class="medal-item">
                <div class="medal-icon">
                  <el-icon :size="48">{{ medal.icon }}</el-icon>
                </div>
                <h4 class="medal-name">{{ medal.name }}</h4>
                <p class="medal-desc">{{ medal.description }}</p>
                <span class="medal-date">{{ medal.obtainDate }}</span>
              </div>
              <div
                class="medal-item locked"
                v-for="(lockedMedal, index) in lockedMedals"
                :key="index"
              >
                <div class="medal-icon locked">
                  <el-icon :size="48"><Lock /></el-icon>
                </div>
                <h4 class="medal-name">{{ lockedMedal.name }}</h4>
                <p class="medal-desc">{{ lockedMedal.description }}</p>
                <span class="medal-requirement">{{ lockedMedal.requirement }}</span>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="数据统计" name="stats">
          <div class="tab-content">
            <div class="stats-grid">
              <div class="stat-card">
                <h3>年度出勤率</h3>
                <div class="chart-container">
                  <div id="attendanceChart" class="chart"></div>
                </div>
              </div>
              <div class="stat-card">
                <h3>鱼获总重量趋势</h3>
                <div class="chart-container">
                  <div id="weightChart" class="chart"></div>
                </div>
              </div>
              <div class="stat-card">
                <h3>空军率分析</h3>
                <div class="chart-container">
                  <div id="airForceChart" class="chart"></div>
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
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Edit, Plus, Lock, Trophy, Calendar, Star, Location, Cpu } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as addressApi from '@/api/address'
import MapSelector from '@/components/common/MapSelector.vue'

// 响应式数据
const activeTab = ref('equipment')
const router = useRouter()

// 用户信息
const userInfo = ref({
  nickname: '钓鱼佬007',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  signature: '从不空军，只是在喂鱼。',
  isMaster: true,
  level: 8,
  exp: 1250,
  nextLevelExp: 2000,
})

// 用户统计数据
const userStats = ref({
  fishingDays: 128,
  totalWeight: 356.8,
  airForceCount: 42,
  medals: [
    {
      id: 1,
      name: '永不空军',
      description: '连续5次有鱼获',
      icon: Trophy,
      obtainDate: '2024-01-10',
    },
    {
      id: 2,
      name: '路亚大师',
      description: '成功钓到10条翘嘴',
      icon: Star,
      obtainDate: '2024-01-05',
    },
    {
      id: 3,
      name: '坚持者',
      description: '连续30天出钓',
      icon: Calendar,
      obtainDate: '2024-01-01',
    },
  ],
})

// 锁定的勋章
const lockedMedals = ref([
  {
    name: '空军司令',
    description: '连续10次空军',
    requirement: '还需7次空军',
  },
  {
    name: '巨物猎手',
    description: '钓到20斤以上的鱼',
    requirement: '还需15斤',
  },
])

// 装备列表
const equipmentList = ref([
  {
    id: 1,
    name: '达亿瓦波纹鲤 4.5米',
    description: '日本进口，腰力好，适合钓大型鱼类',
    brand: '达亿瓦',
    price: 1299,
    image:
      'https://images.unsplash.com/photo-1579098382271-091f68b2226b?w=800&auto=format&fit=crop',
  },
  {
    id: 2,
    name: '钓箱',
    description: '带升降脚，多功能钓箱',
    brand: '连球',
    price: 599,
    image: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800&auto=format&fit=crop',
  },
  {
    id: 3,
    name: '钓鱼伞',
    description: '2.2米，防紫外线',
    brand: '美人鱼',
    price: 150,
    image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=800&auto=format&fit=crop',
  },
])

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

// 初始化图表
onMounted(() => {
  // 模拟图表初始化
  // 实际项目中会使用 ECharts
  initCharts()
  
  // 检查是否有从其他页面跳转过来的标签页标记
  const savedTab = localStorage.getItem('activeProfileTab')
  if (savedTab) {
    activeTab.value = savedTab
    localStorage.removeItem('activeProfileTab')
    if (savedTab === 'address') {
      loadAddresses()
    }
  }
})

// 监听标签页变化，当切换到地址标签页时加载地址列表
watch(activeTab, (newTab) => {
  if (newTab === 'address') {
    loadAddresses()
  }
})

// 初始化图表
const initCharts = () => {
  // 这里可以集成 ECharts
  // 由于是模拟环境，我们只创建占位符
  const charts = ['attendanceChart', 'weightChart', 'airForceChart']
  charts.forEach((chartId) => {
    const chartElement = document.getElementById(chartId)
    if (chartElement) {
      chartElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-light); font-size: 0.9rem;">
          <el-icon style="font-size: 2rem; margin-bottom: 10px; display: block; color: var(--primary-color);"><Cpu /></el-icon>
          <p>图表加载中...</p>
          <p style="font-size: 0.8rem; margin-top: 5px;">实际项目中会使用 ECharts</p>
        </div>
      `
    }
  })
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

// 提交表单
const handleSubmit = async () => {
  // 表单验证
  if (!form.value.name) {
    ElMessage.warning('请输入收货人姓名')
    return
  }
  if (!form.value.phone) {
    ElMessage.warning('请输入联系电话')
    return
  }
  if (!form.value.province || !form.value.city || !form.value.district) {
    ElMessage.warning('请完善地区信息')
    return
  }
  if (!form.value.detailAddress) {
    ElMessage.warning('请输入详细地址')
    return
  }

  try {
    if (form.value.id) {
      // 更新地址
      await addressApi.updateAddress(form.value.id, form.value)
      ElMessage.success('地址更新成功')
    } else {
      // 创建地址
      await addressApi.createAddress(form.value)
      ElMessage.success('地址添加成功')
    }
    dialogVisible.value = false
    loadAddresses()
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  }
}

// 删除地址
const handleDeleteAddress = async (id) => {
  try {
    await addressApi.deleteAddress(id)
    ElMessage.success('地址删除成功')
    loadAddresses()
  } catch (error) {
    ElMessage.error('删除失败，请重试')
  }
}

// 设置默认地址
const handleSetDefault = async (id) => {
  try {
    await addressApi.setDefaultAddress(id)
    ElMessage.success('设置默认地址成功')
    loadAddresses()
  } catch (error) {
    ElMessage.error('设置失败，请重试')
  }
}

// 处理地图选择地址
const handleAddressSelect = (address) => {
  console.log('选择的地址:', address)
  form.value.province = address.province
  form.value.city = address.city
  form.value.district = address.district
  form.value.detailAddress = address.detailAddress
  ElMessage.success('地址选择成功')
}
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

.page-header {
  padding: 8vh 0 4vh;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;

  .page-title {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 1vh;
    color: white;
  }

  .page-description {
    font-size: 1.1rem;
    opacity: 0.9;
  }
}

.profile-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: 4vh;
  box-shadow: var(--shadow-lg);
  margin: 4vh 0;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4vh;

  .avatar-section {
    display: flex;
    gap: 3vw;

    .profile-avatar {
      border: 3px solid var(--primary-color);
    }

    .user-basic-info {
      .username {
        font-size: 1.5rem;
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
          font-weight: 600;
          color: var(--primary-color);
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

.medals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2vw;
}

.medal-item {
  background: white;
  border-radius: var(--radius-lg);
  padding: 3vh;
  box-shadow: var(--shadow-md);
  text-align: center;
  transition: all var(--transition-normal);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  &.locked {
    opacity: 0.6;
  }

  .medal-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 2vh;

    &.locked {
      background: var(--border-light);
    }

    :deep(.el-icon) {
      color: white;
    }
  }

  .medal-name {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1vh;
    color: var(--text-primary);
  }

  .medal-desc {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 1.5vh;
    line-height: 1.4;
  }

  .medal-date,
  .medal-requirement {
    font-size: 0.8rem;
    color: var(--text-light);
  }

  .medal-requirement {
    color: var(--warning-color);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3vw;
}

.stat-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 3vh;
  box-shadow: var(--shadow-md);

  h3 {
    margin-bottom: 2vh;
    color: var(--text-primary);
  }

  .chart-container {
    height: 300px;

    .chart {
      width: 100%;
      height: 100%;
      border-radius: var(--radius-md);
      background: var(--bg-tertiary);
      display: flex;
      align-items: center;
      justify-content: center;
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
    grid-template-columns: 1fr;
  }
}
</style>
