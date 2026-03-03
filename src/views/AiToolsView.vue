<template>
  <div class="ai-tools-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="container">
        <div class="header-content">
          <div class="header-icon">
            <el-icon><Cpu /></el-icon>
          </div>
          <div class="header-text">
            <h1 class="page-title">AI 垂钓助手</h1>
            <p class="page-description">智能识别鱼类，专业配饵建议，让钓鱼更科学</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能导航 -->
    <div class="container">
      <el-tabs v-model="activeTab" class="ai-tools-tabs" type="border-card">
        <!-- 智能配饵顾问 -->
        <el-tab-pane name="bait-advisor">
          <template #label>
            <div class="tab-label">
              <el-icon><ChatDotRound /></el-icon>
              <span>智能配饵顾问</span>
            </div>
          </template>
          <div class="tab-content">
            <div class="ai-bait-card">
              <!-- 聊天头部 -->
              <div class="chat-header">
                <div class="chat-avatar">
                  <el-icon><Cpu /></el-icon>
                </div>
                <div class="chat-info">
                  <h3>智能配饵顾问</h3>
                  <p>
                    <span class="status-dot"></span>
                    在线
                  </p>
                </div>
              </div>

              <div class="chat-container">
                <!-- 聊天记录 -->
                <div class="chat-messages" ref="chatMessagesRef">
                  <!-- 欢迎消息 -->
                  <div class="message bot-message welcome-message">
                    <div class="message-avatar">
                      <div class="avatar-bg">
                        <el-icon><Cpu /></el-icon>
                      </div>
                    </div>
                    <div class="message-content">
                      <div class="message-bubble">
                        <div class="message-text">
                          <p>你好！我是智能配饵顾问 🎣</p>
                          <p>我可以为你提供专业的钓鱼饵料建议，包括：</p>
                          <ul>
                            <li>根据季节、天气推荐饵料</li>
                            <li>针对目标鱼种的配方建议</li>
                            <li>钓点环境分析</li>
                          </ul>
                          <p>请问有什么可以帮助你的？</p>
                        </div>
                      </div>
                      <span class="message-time">{{ formatTime(new Date()) }}</span>
                    </div>
                  </div>

                  <!-- 消息列表 -->
                  <div
                    v-for="(msg, index) in chatMessages"
                    :key="index"
                    :class="['message', msg.type === 'user' ? 'user-message' : 'bot-message']"
                  >
                    <div class="message-avatar">
                      <div v-if="msg.type === 'user'" class="avatar-bg user">
                        <el-icon><UserFilled /></el-icon>
                      </div>
                      <div v-else class="avatar-bg">
                        <el-icon><Cpu /></el-icon>
                      </div>
                    </div>
                    <div class="message-content">
                      <div class="message-bubble">
                        <div class="message-text" v-html="formatMessage(msg.content)"></div>
                      </div>
                      <span class="message-time">{{ formatTime(msg.time) }}</span>
                    </div>
                  </div>

                  <!-- 流式输出中 -->
                  <div v-if="isStreaming" class="message bot-message streaming-message">
                    <div class="message-avatar">
                      <div class="avatar-bg">
                        <el-icon><Cpu /></el-icon>
                      </div>
                    </div>
                    <div class="message-content">
                      <div class="message-bubble">
                        <div class="message-text" v-html="formatMessage(streamingContent)"></div>
                        <span class="cursor"></span>
                      </div>
                    </div>
                  </div>

                  <!-- 思考中 -->
                  <div v-if="isTyping" class="message bot-message typing-message">
                    <div class="message-avatar">
                      <div class="avatar-bg">
                        <el-icon><Cpu /></el-icon>
                      </div>
                    </div>
                    <div class="message-content">
                      <div class="message-bubble">
                        <div class="typing-indicator">
                          <span class="typing-dot"></span>
                          <span class="typing-dot"></span>
                          <span class="typing-dot"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 快捷问题 -->
                <div class="quick-questions" v-if="chatMessages.length === 0 && !isStreaming && !isTyping">
                  <div class="quick-title">💡 快捷问题</div>
                  <div class="quick-tags">
                    <el-button
                      v-for="(question, index) in quickQuestions"
                      :key="index"
                      type="info"
                      plain
                      round
                      size="small"
                      @click="useQuickQuestion(question)"
                    >
                      {{ question }}
                    </el-button>
                  </div>
                </div>

                <!-- 输入框 -->
                <div class="chat-input-wrapper">
                  <div class="chat-input">
                    <el-input
                      v-model="userInput"
                      placeholder="请输入你的问题，例如：春季在水库钓鲫鱼用什么饵料？"
                      @keyup.enter="sendMessage"
                      :disabled="isStreaming || isTyping"
                      maxlength="500"
                      show-word-limit
                      type="textarea"
                      :rows="2"
                      resize="none"
                    />
                    <el-button
                      type="primary"
                      circle
                      size="large"
                      @click="sendMessage"
                      :disabled="!userInput.trim() || isStreaming || isTyping"
                      class="send-btn"
                    >
                      <el-icon><Promotion /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- AI 识鱼 -->
        <el-tab-pane name="fish-id">
          <template #label>
            <div class="tab-label">
              <el-icon><Camera /></el-icon>
              <span>AI 识鱼</span>
            </div>
          </template>
          <div class="tab-content">
            <div class="ai-fish-id-card">
              <div class="upload-section">
                <div class="section-header">
                  <div class="section-icon blue">
                    <el-icon><Camera /></el-icon>
                  </div>
                  <div class="section-info">
                    <h3>上传鱼的照片</h3>
                    <p>支持 JPG、PNG 格式，建议上传清晰的鱼体照片</p>
                  </div>
                </div>

                <div class="upload-area-wrapper">
                  <el-upload
                    class="upload-demo"
                    action="#"
                    :auto-upload="false"
                    :on-change="handleImageUpload"
                    :on-remove="handleImageRemove"
                    list-type="picture-card"
                    :limit="1"
                    :file-list="fileList"
                  >
                    <template #default>
                      <div class="upload-placeholder">
                        <el-icon class="upload-icon"><Plus /></el-icon>
                        <div class="upload-text">点击上传图片</div>
                        <div class="upload-hint">支持 JPG、PNG 格式</div>
                      </div>
                    </template>
                    <template #file="{ file }">
                      <div class="file-preview">
                        <img :src="file.url" alt="预览" />
                        <div class="file-actions">
                          <el-icon class="file-action-icon" @click.stop="handlePreview(file)">
                            <ZoomIn />
                          </el-icon>
                          <el-icon class="file-action-icon" @click.stop="handleRemove(file)">
                            <Delete />
                          </el-icon>
                        </div>
                      </div>
                    </template>
                  </el-upload>
                </div>

                <el-button
                  type="primary"
                  class="identify-btn"
                  size="large"
                  @click="identifyFish"
                  :disabled="!uploadedImage || isIdentifying"
                  :loading="isIdentifying"
                >
                  <el-icon><MagicStick /></el-icon>
                  {{ isIdentifying ? '识别中...' : '开始识别' }}
                </el-button>
              </div>

              <!-- 识别结果 -->
              <transition name="fade">
                <div class="result-section" v-if="fishResult">
                  <div class="result-header">
                    <div class="result-title">
                      <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
                      <span>识别结果</span>
                    </div>
                    <el-tag :type="fishResult.isProtected ? 'danger' : 'success'" effect="dark" size="large">
                      {{ fishResult.isProtected ? '保护鱼类' : '可食用' }}
                    </el-tag>
                  </div>

                  <div class="fish-info-card">
                    <div class="fish-image-large">
                      <img :src="uploadedImage" alt="鱼的照片" />
                    </div>
                    <div class="fish-details">
                      <div class="detail-header">
                        <h2 class="fish-name">{{ fishResult.name }}</h2>
                        <span class="fish-alias">{{ fishResult.alias }}</span>
                      </div>

                      <el-divider />

                      <div class="detail-grid">
                        <div class="detail-item">
                          <div class="detail-icon">
                            <el-icon><Collection /></el-icon>
                          </div>
                          <div class="detail-content">
                            <span class="detail-label">科属</span>
                            <span class="detail-value">{{ fishResult.category }}</span>
                          </div>
                        </div>

                        <div class="detail-item">
                          <div class="detail-icon">
                            <el-icon><Orange /></el-icon>
                          </div>
                          <div class="detail-content">
                            <span class="detail-label">生活习性</span>
                            <span class="detail-value">{{ fishResult.habits }}</span>
                          </div>
                        </div>

                        <div class="detail-item">
                          <div class="detail-icon">
                            <el-icon><Dish /></el-icon>
                          </div>
                          <div class="detail-content">
                            <span class="detail-label">食用价值</span>
                            <span class="detail-value">{{ fishResult.edibleValue }}</span>
                          </div>
                        </div>

                        <div class="detail-item warning" v-if="fishResult.isProtected">
                          <div class="detail-icon">
                            <el-icon><WarningFilled /></el-icon>
                          </div>
                          <div class="detail-content">
                            <span class="detail-label">保护状态</span>
                            <span class="detail-value danger">保护鱼类，建议放流</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 图片预览 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="600px" align-center>
      <img :src="previewImage" style="width: 100%; border-radius: 8px;" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import {
  Camera,
  Delete,
  Cpu,
  Plus,
  ZoomIn,
  MagicStick,
  CircleCheckFilled,
  Collection,
  WarningFilled,
  ChatDotRound,
  UserFilled,
  Promotion,
  Orange,
  Dish,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { chatWithAI } from '@/api/ai'

// 响应式数据
const activeTab = ref('bait-advisor')
const uploadedImage = ref('')
const fileList = ref([])
const fishResult = ref(null)
const chatMessages = ref([])
const userInput = ref('')
const isTyping = ref(false)
const isStreaming = ref(false)
const streamingContent = ref('')
const isIdentifying = ref(false)
const chatMessagesRef = ref(null)
const previewVisible = ref(false)
const previewImage = ref('')

// 快捷问题
const quickQuestions = [
  '春季水库钓鲫鱼用什么饵料？',
  '夏季钓鲤鱼的最佳饵料配方',
  '秋季野钓草鱼的技巧',
  '冬季钓鲫鱼的饵料选择',
  '黑坑钓鲤鱼用什么小药？',
  '夜钓需要准备什么装备？',
]

// 处理图片上传
const handleImageUpload = (file) => {
  uploadedImage.value = file.url
  fishResult.value = null
}

// 处理图片移除
const handleImageRemove = () => {
  uploadedImage.value = ''
  fishResult.value = null
  fileList.value = []
}

// 处理预览
const handlePreview = (file) => {
  previewImage.value = file.url
  previewVisible.value = true
}

// 处理删除
const handleRemove = () => {
  handleImageRemove()
}

// 识别鱼类
const identifyFish = () => {
  if (!uploadedImage.value) {
    ElMessage.warning('请先上传鱼的照片')
    return
  }

  isIdentifying.value = true
  ElMessage.info('AI 正在识别中，请稍候...')

  setTimeout(() => {
    fishResult.value = {
      name: '翘嘴鲌',
      alias: '白鱼、翘嘴、大白鱼',
      category: '鲤科 鲌亚科',
      isProtected: false,
      habits: '翘嘴是一种肉食性鱼类，喜欢在中上层水域活动，以小鱼、虾类为食，性格凶猛，游速快，喜欢在水流较缓的湖泊、水库中生活。',
      edibleValue: '翘嘴肉质鲜美，营养丰富，富含蛋白质和多种微量元素，是常见的食用鱼类，适合清蒸、红烧等多种烹饪方式。',
    }
    isIdentifying.value = false
    ElMessage.success('识别完成！')
  }, 2000)
}

// 格式化时间
const formatTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 格式化消息内容（处理换行等）
const formatMessage = (content) => {
  if (!content) return ''
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })
}

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() || isStreaming.value || isTyping.value) {
    return
  }

  const question = userInput.value.trim()

  // 添加用户消息
  chatMessages.value.push({
    type: 'user',
    content: question,
    time: new Date(),
  })

  userInput.value = ''
  scrollToBottom()

  // 显示思考中
  isTyping.value = true

  try {
    // 调用流式接口
    await chatWithAI(question, {
      onStart: () => {
        isTyping.value = false
        isStreaming.value = true
        streamingContent.value = ''
      },
      onMessage: (content) => {
        streamingContent.value += content
        scrollToBottom()
      },
      onComplete: (fullContent) => {
        isStreaming.value = false
        chatMessages.value.push({
          type: 'bot',
          content: fullContent,
          time: new Date(),
        })
        streamingContent.value = ''
        scrollToBottom()
      },
      onError: (error) => {
        isTyping.value = false
        isStreaming.value = false
        streamingContent.value = ''
        ElMessage.error('AI 响应失败，请稍后重试')
        console.error('AI Chat Error:', error)
      },
    })
  } catch (error) {
    isTyping.value = false
    isStreaming.value = false
    streamingContent.value = ''
    ElMessage.error('请求失败，请检查网络连接')
    console.error('Send Message Error:', error)
  }
}

// 使用快捷问题
const useQuickQuestion = (question) => {
  userInput.value = question
  sendMessage()
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style lang="scss" scoped>
.ai-tools-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  padding-bottom: 20px;
}

.page-header {
  padding: 24px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.5;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;
    z-index: 1;
  }

  .header-icon {
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .header-text {
    .page-title {
      font-size: 2rem;
      font-weight: 800;
      margin: 0 0 4px 0;
      color: white;
    }

    .page-description {
      font-size: 1rem;
      opacity: 0.9;
      margin: 0;
    }
  }
}

.container {
  max-width: 95%;
  margin: 0 auto;
  padding: 0 20px;
}

.ai-tools-tabs {
  margin: 20px 0;

  :deep(.el-tabs__header) {
    margin-bottom: 0;
    border-bottom: none;

    .el-tabs__nav {
      border-radius: 12px 12px 0 0;
      overflow: hidden;
    }

    .el-tabs__item {
      font-size: 16px;
      font-weight: 500;
      padding: 0 30px;
      height: 56px;
      line-height: 56px;
      transition: all 0.3s;

      .tab-label {
        display: flex;
        align-items: center;
        gap: 8px;

        .el-icon {
          font-size: 18px;
        }
      }

      &.is-active {
        background: #667eea;
        color: white;
      }

      &:hover:not(.is-active) {
        color: #667eea;
        background: rgba(102, 126, 234, 0.1);
      }
    }
  }

  :deep(.el-tabs__content) {
    background: white;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
}

.tab-content {
  padding: 20px;
}

// AI 识鱼卡片
.ai-fish-id-card {
  max-width: 100%;
  margin: 0 auto;
}

.upload-section {
  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .section-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;

      &.blue {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
    }

    .section-info {
      h3 {
        font-size: 1.2rem;
        font-weight: 600;
        color: #303133;
        margin: 0 0 2px 0;
      }

      p {
        color: #909399;
        margin: 0;
        font-size: 13px;
      }
    }
  }
}

.upload-area-wrapper {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;

  :deep(.el-upload--picture-card) {
    width: 260px;
    height: 260px;
    border: 2px dashed #dcdfe6;
    border-radius: 10px;
    background: #f5f7fa;
    transition: all 0.3s;

    &:hover {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.05);
    }
  }

  :deep(.el-upload-list--picture-card) {
    .el-upload-list__item {
      width: 260px;
      height: 260px;
      border-radius: 10px;
      margin: 0;
    }
  }

  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #909399;

    .upload-icon {
      font-size: 40px;
      margin-bottom: 12px;
      color: #c0c4cc;
    }

    .upload-text {
      font-size: 15px;
      font-weight: 500;
      color: #606266;
      margin-bottom: 8px;
    }

    .upload-hint {
      font-size: 13px;
      color: #909399;
    }
  }

  .file-preview {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 12px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .file-actions {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      opacity: 0;
      transition: opacity 0.3s;

      .file-action-icon {
        width: 40px;
        height: 40px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        color: #606266;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: #f56c6c;
          color: white;
          transform: scale(1.1);
        }
      }
    }

    &:hover .file-actions {
      opacity: 1;
    }
  }
}

.identify-btn {
  width: 200px;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
  }

  &:disabled {
    background: #c0c4cc;
    box-shadow: none;
  }
}

// 识别结果
.result-section {
  margin-top: 24px;
  animation: slideUp 0.5s ease;

  .result-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .result-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      color: #303133;

      .success-icon {
        color: #67c23a;
        font-size: 20px;
      }
    }
  }

  .fish-info-card {
    background: #f5f7fa;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    gap: 16px;

    .fish-image-large {
      width: 220px;
      height: 220px;
      border-radius: 10px;
      overflow: hidden;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .fish-details {
      flex: 1;

      .detail-header {
        margin-bottom: 12px;

        .fish-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: #303133;
          margin: 0 0 4px 0;
        }

        .fish-alias {
          color: #909399;
          font-size: 13px;
        }
      }

      .detail-grid {
        display: grid;
        gap: 10px;

        .detail-item {
          display: flex;
          gap: 10px;
          padding: 10px;
          background: white;
          border-radius: 8px;
          transition: all 0.3s;

          &:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }

          &.warning {
            background: #fef0f0;
            border: 1px solid #fde2e2;
          }

          .detail-icon {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
            flex-shrink: 0;
          }

          .detail-content {
            display: flex;
            flex-direction: column;
            gap: 2px;

            .detail-label {
              font-size: 12px;
              color: #909399;
              font-weight: 500;
            }

            .detail-value {
              font-size: 13px;
              color: #303133;
              line-height: 1.4;

              &.danger {
                color: #f56c6c;
                font-weight: 600;
              }
            }
          }
        }
      }
    }
  }
}

// AI 配饵顾问
.ai-bait-card {
  max-width: 100%;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  .chat-avatar {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.3);
  }

  .chat-info {
    h3 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 2px 0;
    }

    p {
      margin: 0;
      font-size: 12px;
      opacity: 0.9;
      display: flex;
      align-items: center;
      gap: 4px;

      .status-dot {
        width: 6px;
        height: 6px;
        background: #67c23a;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }
    }
  }
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f8f9fa;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 3px;
  }
}

.message {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease;

  &.user-message {
    flex-direction: row-reverse;

    .message-content {
      align-items: flex-end;

      .message-bubble {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-bottom-right-radius: 4px;
      }
    }
  }

  &.bot-message {
    .message-content {
      align-items: flex-start;

      .message-bubble {
        background: white;
        color: #303133;
        border-bottom-left-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
    }
  }

  &.welcome-message {
    .message-bubble {
      background: #e6f7ff !important;
      border: 1px solid #91d5ff;

      .message-text {
        ul {
          margin: 6px 0;
          padding-left: 18px;

          li {
            margin: 3px 0;
            color: #096dd9;
          }
        }
      }
    }
  }

  &.streaming-message {
    .cursor {
      display: inline-block;
      width: 2px;
      height: 16px;
      background: #667eea;
      margin-left: 4px;
      animation: blink 1s infinite;
      vertical-align: middle;
    }
  }
}

.message-avatar {
  flex-shrink: 0;

  .avatar-bg {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;

    &.user {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
  }
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  gap: 3px;

  .message-bubble {
    padding: 10px 14px;
    border-radius: 14px;
    line-height: 1.5;
    font-size: 14px;

    .message-text {
      word-break: break-word;

      :deep(strong) {
        font-weight: 600;
      }

      :deep(em) {
        font-style: italic;
      }
    }
  }

  .message-time {
    font-size: 11px;
    color: #c0c4cc;
    padding: 0 4px;
  }
}

// 输入框
.chat-input-wrapper {
  padding: 12px 16px;
  background: white;
  border-top: 1px solid #ebeef5;
}

.chat-input {
  display: flex;
  gap: 10px;
  align-items: flex-end;

  :deep(.el-textarea__inner) {
    border-radius: 16px;
    padding: 10px 14px;
    resize: none;

    &:focus {
      border-color: #667eea;
    }
  }

  .send-btn {
    flex-shrink: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    width: 42px;
    height: 42px;

    &:hover:not(:disabled) {
      transform: scale(1.05);
    }

    &:disabled {
      background: #c0c4cc;
    }

    .el-icon {
      font-size: 18px;
    }
  }
}

// 快捷问题
.quick-questions {
  padding: 12px 16px;
  background: white;
  border-top: 1px solid #ebeef5;

  .quick-title {
    font-size: 12px;
    color: #909399;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .quick-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    .el-button {
      border-radius: 14px;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
  }
}

// 打字指示器
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 4px;

  .typing-dot {
    width: 8px;
    height: 8px;
    background: #667eea;
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

// 动画
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(103, 194, 58, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0);
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

// 响应式设计
@media (max-width: 768px) {
  .page-header {
    padding: 24px 0;

    .header-content {
      flex-direction: column;
      text-align: center;

      .header-icon {
        width: 60px;
        height: 60px;
        font-size: 30px;
      }

      .header-text {
        .page-title {
          font-size: 1.8rem;
        }
      }
    }
  }

  .tab-content {
    padding: 16px;
  }

  .fish-info-card {
    flex-direction: column;

    .fish-image-large {
      width: 100%;
      height: 200px;
    }
  }

  .chat-container {
    height: 500px;
  }

  .message-content {
    max-width: 85%;
  }

  .quick-tags {
    .el-button {
      font-size: 12px;
    }
  }
}
</style>
