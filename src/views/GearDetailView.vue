<template>
  <div class="gear-detail-page">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <el-button type="primary" plain @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon> 返回列表
        </el-button>
        <h1 class="page-title">装备详情</h1>
      </div>

      <!-- 装备详情 -->
      <div class="gear-detail">
        <!-- 图片轮播 -->
        <div class="image-section">
          <el-carousel :interval="3000" type="card" height="400px">
            <el-carousel-item v-for="(image, index) in gearDetail.images" :key="index">
              <img :src="image" alt="装备图片" @click="handlePreviewImage(gearDetail.images, index)" />
            </el-carousel-item>
          </el-carousel>
        </div>

        <!-- 装备信息 -->
        <div class="info-section">
          <h2 class="gear-title">{{ gearDetail.title }}</h2>
          <div class="gear-price">
            <span class="current-price">¥{{ gearDetail.price }}</span>
            <span class="original-price" v-if="gearDetail.originalPrice">¥{{ gearDetail.originalPrice }}</span>
          </div>
          <div class="gear-meta">
            <div class="meta-item">
              <el-icon><User /></el-icon>
              <span>{{ gearDetail.nickname || gearDetail.username }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Timer /></el-icon>
              <span>{{ formatTime(gearDetail.createTime) }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Location /></el-icon>
              <span>{{ gearDetail.category === 'rod' ? '鱼竿' : gearDetail.category === 'box' ? '钓箱' : gearDetail.category === 'bait' ? '饵料' : '其他' }}</span>
            </div>
          </div>
          <div class="gear-description">
            <h3>商品描述</h3>
            <p>{{ gearDetail.description }}</p>
          </div>
          <div class="action-buttons">
            <el-button type="primary" size="large" class="buy-btn" @click="handleBuy">
              <el-icon><ShoppingCart /></el-icon> 立即购买
            </el-button>
            <el-button type="info" size="large" class="contact-btn" @click="showContactDialog">
              <el-icon><ChatDotRound /></el-icon> 联系卖家
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片预览 -->
    <ImagePreview
      v-model:visible="previewVisible"
      :images="previewImages"
      :initial-index="previewInitialIndex"
    />

    <!-- 联系卖家对话框 -->
    <el-dialog
      v-model="contactDialogVisible"
      title="联系卖家"
      width="400px"
    >
      <div class="contact-dialog-content">
        <div class="contact-info">
          <div class="info-item">
            <span class="label">卖家名称：</span>
            <span class="value">{{ gearDetail.nickname || gearDetail.username }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系电话：</span>
            <span class="value phone-number">{{ gearDetail.phone || '暂无联系电话' }}</span>
          </div>
          <div class="info-item">
            <span class="label">商品名称：</span>
            <span class="value">{{ gearDetail.title }}</span>
          </div>
        </div>
        <div class="contact-tips">
          <el-alert
            title="温馨提示"
            type="info"
            :closable="false"
            show-icon
          >
            请文明交流，保护个人隐私
          </el-alert>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="contactDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="copyPhoneNumber" :disabled="!gearDetail.phone">复制手机号</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 购买确认对话框 -->
    <el-dialog
      v-model="buyDialogVisible"
      title="确认购买"
      width="500px"
    >
      <div class="buy-dialog-content">
        <div class="buy-info">
          <img :src="gearDetail.images && gearDetail.images.length > 0 ? gearDetail.images[0] : ''" alt="装备图片" class="buy-image" />
          <div class="buy-details">
            <h4>{{ gearDetail.title }}</h4>
            <p class="buy-price">¥{{ gearDetail.price }}</p>
            <p class="buy-seller">卖家：{{ gearDetail.nickname || gearDetail.username }}</p>
          </div>
        </div>
        <div class="buy-form">
          <el-form label-width="80px">
            <el-form-item label="收货地址">
              <el-select v-model="selectedAddress" placeholder="请选择收货地址" size="large">
                <el-option 
                  v-for="address in addresses" 
                  :key="address.id" 
                  :label="address.fullAddress + ' (' + address.name + ' ' + address.phone + ')'" 
                  :value="address.id" 
                />
              </el-select>
              <el-button type="text" size="small" @click="goToAddressManage" style="margin-top: 8px">
                管理收货地址
              </el-button>
            </el-form-item>
            <el-form-item label="联系方式">
              <el-input v-model="contactPhone" placeholder="请输入联系电话" size="large" />
            </el-form-item>
          </el-form>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="buyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmBuy">确认购买</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { ArrowLeft, User, Timer, Location, ShoppingCart, ChatDotRound, Star } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as gearApi from '@/api/gear'
import * as addressApi from '@/api/address'
import ImagePreview from '@/components/common/ImagePreview.vue'

const route = useRoute()
const router = useRouter()

// 响应式数据
const gearId = computed(() => route.params.id)
const gearDetail = ref({})
const loading = ref(false)

// 图片预览
const previewVisible = ref(false)
const previewImages = ref([])
const previewInitialIndex = ref(0)

// 购买相关
const buyDialogVisible = ref(false)
const contactDialogVisible = ref(false)
const selectedAddress = ref('')
const contactPhone = ref('')
const addresses = ref([])

// 加载装备详情
const loadGearDetail = async () => {
  loading.value = true
  try {
    const detail = await gearApi.getGearMarketDetail(gearId.value)
    gearDetail.value = detail
  } catch (error) {
    ElMessage.error('加载装备详情失败')
  } finally {
    loading.value = false
  }
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 预览图片
const handlePreviewImage = (images, index) => {
  previewImages.value = images
  previewInitialIndex.value = index
  previewVisible.value = true
}

// 加载用户地址
const loadAddresses = async () => {
  try {
    const response = await addressApi.getUserAddresses()
    addresses.value = response
  } catch (error) {
    ElMessage.error('加载地址失败')
  }
}

// 处理购买
const handleBuy = async () => {
  await loadAddresses()
  buyDialogVisible.value = true
}

// 确认购买
const confirmBuy = async () => {
  // 检查是否是自己的商品
  const userStore = useUserStore()
  if (userStore.userId && gearDetail.value.userId && userStore.userId.toString() === gearDetail.value.userId.toString()) {
    ElMessage.warning('不能购买自己发布的商品')
    return
  }
  
  try {
    const orderData = {
      gearId: gearDetail.value.id,
      address: selectedAddress.value,
      contactPhone: contactPhone.value
    }
    await gearApi.createOrder(orderData)
    ElMessage.success('购买成功！')
    buyDialogVisible.value = false
  } catch (error) {
    if (error.message && (error.message.includes('已下架') || error.message.includes('已售出') || error.message.includes('不能购买自己的商品'))) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('购买失败，请重试')
    }
  }
}

// 返回列表
const goBack = () => {
  router.push('/market')
}

// 跳转到地址管理页面
const goToAddressManage = () => {
  buyDialogVisible.value = false
  router.push('/profile')
  // 存储一个标记，让个人中心页面自动切换到地址标签页
  localStorage.setItem('activeProfileTab', 'address')
}

// 显示联系卖家对话框
const showContactDialog = () => {
  contactDialogVisible.value = true
}

// 复制手机号
const copyPhoneNumber = async () => {
  if (!gearDetail.value.phone) {
    ElMessage.warning('暂无联系电话')
    return
  }
  try {
    await navigator.clipboard.writeText(gearDetail.value.phone)
    ElMessage.success('手机号已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 监听地址选择变化，自动填充联系电话
watch(selectedAddress, (newAddressId) => {
  if (newAddressId) {
    const selectedAddr = addresses.value.find(addr => addr.id === newAddressId)
    if (selectedAddr) {
      contactPhone.value = selectedAddr.phone
    }
  }
})

// 页面加载时
onMounted(() => {
  loadGearDetail()
})
</script>

<style lang="scss" scoped>
.gear-detail-page {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 3vh 0;
}

.container {
  position: relative;
  z-index: 1;
  width: 85%;
  margin: 0 auto;
}

.page-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  margin-bottom: 3vh;
  padding: 2vh 0;
  border-bottom: 1px solid var(--border-color);

  .back-btn {
    margin-right: 2vw;
    transition: all 0.3s;

    &:hover {
      transform: translateX(-3px);
    }
  }

  .page-title {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--text-primary);
    text-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }
}

.gear-detail {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 3vh;
  background: white;
  border-radius: var(--radius-xl);
  padding: 4vh;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  margin-bottom: 3vh;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 15px 35px rgba(0,0,0,0.12);
  }

  .image-section {
    width: 100%;
    .el-carousel {
      width: 100%;
      height: 450px;
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);

      .el-carousel__item {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            transform: scale(1.03);
          }
        }
      }

      .el-carousel__indicators {
        bottom: 15px;
      }

      .el-carousel__button {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin: 0 6px;
      }
    }
  }

  .info-section {
    width: 100%;
    .gear-title {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 2vh;
      line-height: 1.3;
    }

    .gear-price {
      margin-bottom: 3vh;
      padding: 2vh;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: var(--radius-lg);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);

      .current-price {
        font-size: 2.2rem;
        font-weight: 800;
        color: var(--danger-color);
        margin-right: 1vw;
        text-shadow: 0 1px 2px rgba(245,108,108,0.2);
      }

      .original-price {
        font-size: 1.2rem;
        color: var(--text-secondary);
        text-decoration: line-through;
      }
    }

    .gear-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2vh;
      margin-bottom: 3vh;
      padding: 2.5vh;
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);

      .meta-item {
        display: flex;
        align-items: center;
        gap: 1vw;
        font-size: 0.95rem;
        color: var(--text-secondary);
        padding: 0.5vh 0;

        .el-icon {
          color: var(--primary-color);
        }
      }
    }

    .gear-description {
      margin-bottom: 4vh;
      padding: 2.5vh;
      background: #f8f9fa;
      border-radius: var(--radius-lg);
      border-left: 4px solid var(--primary-color);

      h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1.5vh;
      }

      p {
        line-height: 1.7;
        color: var(--text-secondary);
        white-space: pre-wrap;
      }
    }

    .action-buttons {
      display: flex;
      gap: 2vh;

      .buy-btn {
        flex: 1;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        border: none;
        border-radius: var(--radius-lg);
        padding: 1.8vh 0;
        font-weight: 600;
        font-size: 1.1rem;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 16px rgba(102,126,234,0.3);
        }
      }

      .contact-btn {
        flex: 1;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border: 2px solid var(--primary-color);
        color: var(--primary-color);
        border-radius: var(--radius-lg);
        padding: 1.8vh 0;
        font-weight: 600;
        font-size: 1.1rem;
        transition: all 0.3s;

        &:hover {
          background: var(--primary-color);
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 8px 16px rgba(102,126,234,0.3);
        }
      }
    }
  }
}



.contact-dialog-content {
  .contact-info {
    margin-bottom: 2vh;

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.2vh 0;
      border-bottom: 1px solid var(--border-color);

      &:last-child {
        border-bottom: none;
      }

      .label {
        font-weight: 600;
        color: var(--text-primary);
        width: 80px;
      }

      .value {
        flex: 1;
        color: var(--text-secondary);
        text-align: right;

        &.phone-number {
          font-weight: 600;
          color: var(--primary-color);
          font-size: 1.1rem;
        }
      }
    }
  }

  .contact-tips {
    margin-top: 2vh;
  }
}

.buy-dialog-content {
  .buy-info {
    display: flex;
    gap: 2vw;
    margin-bottom: 3vh;
    padding: 2.5vh;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: var(--radius-lg);
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);

    .buy-image {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border-radius: var(--radius-lg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .buy-details {
      flex: 1;

      h4 {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1.2vh;
        line-height: 1.4;
      }

      .buy-price {
        font-size: 1.4rem;
        font-weight: 800;
        color: var(--danger-color);
        margin-bottom: 0.8vh;
        text-shadow: 0 1px 2px rgba(245,108,108,0.2);
      }

      .buy-seller {
        font-size: 0.95rem;
        color: var(--text-secondary);
      }
    }
  }

  .buy-form {
    .el-form-item {
      margin-bottom: 2.5vh;

      .el-form-item__label {
        font-weight: 600;
        color: var(--text-primary);
      }

      .el-input {
        border-radius: var(--radius-md);
      }

      .el-select {
        border-radius: var(--radius-md);
      }
    }
  }
}

@media (max-width: 768px) {
  .gear-detail {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;

    .buy-btn,
    .contact-btn {
      width: 100%;
    }
  }

  .seller-card {
    flex-direction: column;
    text-align: center;
  }

  .related-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>