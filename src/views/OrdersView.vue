<template>
  <div class="orders-page">
    <div class="container">
      <h1 class="page-title">我的订单</h1>
      
      <!-- 订单状态筛选 -->
      <div class="order-tabs">
        <el-tabs v-model="activeStatus" @tab-click="handleTabClick">
          <el-tab-pane label="全部" name="all">
            <div class="tab-content">
              <el-empty v-if="orders.length === 0" description="暂无订单" />
              <div v-else class="order-list">
                <div v-for="order in orders" :key="order.id" class="order-card">
                  <div class="order-header">
                    <span class="order-time">{{ formatTime(order.createTime) }}</span>
                    <span :class="['order-status', order.statusText]" v-html="order.statusText" />
                  </div>
                  <div class="order-content">
                    <div class="order-item">
                      <div class="order-item-image">
                        <img :src="'/api/gear-market/' + order.gearId + '/image'" alt="装备图片" />
                      </div>
                      <div class="order-item-info">
                        <h4 class="order-item-title">{{ order.gearTitle }}</h4>
                        <div class="order-item-price">
                          <span>¥{{ order.gearPrice }}</span>
                          <span>x{{ order.quantity }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="order-footer">
                    <div class="order-total">
                      总计：<span class="total-price">¥{{ order.totalAmount }}</span>
                    </div>
                    <div class="order-actions">
                      <el-button v-if="order.status === 0" type="primary" size="small" @click="handlePay(order)">
                        立即支付
                      </el-button>
                      <el-button v-if="order.status === 1" type="info" size="small" @click="handleCancel(order)">
                        取消订单
                      </el-button>
                      <el-button v-if="order.status === 2" type="success" size="small" @click="handleConfirmReceipt(order)">
                        确认收货
                      </el-button>
                      <el-button v-if="order.status === 3" type="warning" size="small" @click="handleReview(order)">
                        评价
                      </el-button>
                      <el-button v-if="order.status !== 4" type="default" size="small" @click="handleViewDetail(order)">
                        查看详情
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="待付款" name="0" />
          <el-tab-pane label="待发货" name="1" />
          <el-tab-pane label="待收货" name="2" />
          <el-tab-pane label="已完成" name="3" />
          <el-tab-pane label="已取消" name="4" />
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import * as orderApi from '@/api/order'

const router = useRouter()

// 响应式数据
const activeStatus = ref('all')
const orders = ref([])
const loading = ref(false)

// 加载订单列表
const loadOrders = async () => {
  loading.value = true
  try {
    // 这里应该调用订单列表接口
    // 暂时使用模拟数据
    orders.value = [
      {
        id: 1,
        userId: 1,
        gearId: 1,
        gearTitle: '9成新钓竿，碳素材质，手感轻盈',
        gearPrice: 199.99,
        quantity: 1,
        totalAmount: 199.99,
        status: 0,
        statusText: '待付款',
        address: '北京市朝阳区某某街道123号',
        contactPhone: '13800138000',
        createTime: new Date().toISOString()
      },
      {
        id: 2,
        userId: 1,
        gearId: 2,
        gearTitle: '全新钓箱，带升降脚，大容量',
        gearPrice: 399.99,
        quantity: 1,
        totalAmount: 399.99,
        status: 1,
        statusText: '待发货',
        address: '北京市朝阳区某某街道123号',
        contactPhone: '13800138000',
        createTime: new Date().toISOString()
      }
    ]
  } catch (error) {
    ElMessage.error('加载订单失败')
  } finally {
    loading.value = false
  }
}

// 处理标签点击
const handleTabClick = () => {
  loadOrders()
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

// 处理支付
const handlePay = (order) => {
  ElMessage.info('支付功能开发中')
}

// 处理取消订单
const handleCancel = (order) => {
  ElMessage.info('取消订单功能开发中')
}

// 处理确认收货
const handleConfirmReceipt = (order) => {
  ElMessage.info('确认收货功能开发中')
}

// 处理评价
const handleReview = (order) => {
  ElMessage.info('评价功能开发中')
}

// 查看详情
const handleViewDetail = (order) => {
  ElMessage.info('订单详情功能开发中')
}

// 页面加载时
onMounted(() => {
  loadOrders()
})
</script>

<style lang="scss" scoped>
.orders-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 2vh 0;
}

.container {
  width: 90%;
  margin: 0 auto;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4vh;
  padding: 2vh 0;
  border-bottom: 1px solid var(--border-color);
}

.order-tabs {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;

  .tab-content {
    padding: 4vh;
  }

  .order-list {
    .order-card {
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      margin-bottom: 2vh;
      overflow: hidden;

      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2vh;
        background: var(--bg-primary);

        .order-time {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .order-status {
          font-size: 0.9rem;
          font-weight: 600;

          &.待付款 {
            color: var(--warning-color);
          }

          &.待发货 {
            color: var(--primary-color);
          }

          &.待收货 {
            color: var(--info-color);
          }

          &.已完成 {
            color: var(--success-color);
          }

          &.已取消 {
            color: var(--text-secondary);
          }
        }
      }

      .order-content {
        padding: 2vh;

        .order-item {
          display: flex;
          gap: 2vw;

          .order-item-image {
            width: 100px;
            height: 100px;
            flex-shrink: 0;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              border-radius: var(--radius-md);
            }
          }

          .order-item-info {
            flex: 1;

            .order-item-title {
              font-size: 1.1rem;
              font-weight: 500;
              color: var(--text-primary);
              margin-bottom: 1vh;
              line-height: 1.4;
            }

            .order-item-price {
              display: flex;
              justify-content: space-between;
              font-size: 1rem;
              color: var(--text-secondary);
            }
          }
        }
      }

      .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2vh;
        border-top: 1px solid var(--border-color);

        .order-total {
          font-size: 1rem;
          color: var(--text-secondary);

          .total-price {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--danger-color);
            margin-left: 0.5vw;
          }
        }

        .order-actions {
          display: flex;
          gap: 1vw;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .order-item {
    flex-direction: column;

    .order-item-image {
      width: 100%;
      height: 200px;
    }
  }

  .order-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 2vh;

    .order-actions {
      width: 100%;
      justify-content: space-between;

      button {
        flex: 1;
        margin-right: 1vw;

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
}
</style>