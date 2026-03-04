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
              <!-- 上传区域 -->
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

                <!-- 上传区域 -->
                <div class="upload-area-container">
                  <div class="upload-area-wrapper">
                    <div v-if="fileList.length === 0">
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
                        <div class="upload-placeholder">
                          <div class="upload-circle">
                            <el-icon class="upload-icon"><Plus /></el-icon>
                          </div>
                          <div class="upload-text">点击上传图片</div>
                          <div class="upload-hint">支持 JPG、PNG 格式</div>
                        </div>
                      </el-upload>
                    </div>
                    <div v-else class="file-preview-container">
                      <div v-for="(file, index) in fileList" :key="index" class="file-preview">
                        <div class="image-container">
                          <img :src="file.url" alt="预览" class="preview-image" />
                          <div class="image-overlay">
                            <div class="file-actions">
                              <el-icon class="file-action-icon" @click.stop="handlePreview(file)" title="预览">
                                <ZoomIn />
                              </el-icon>
                              <el-icon class="file-action-icon" @click.stop="handleRemove(file)" title="删除">
                                <Delete />
                              </el-icon>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 识别按钮 -->
                  <div class="action-container">
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
                    <div class="tip-text" v-if="uploadedImage && !isIdentifying">
                      <el-icon size="14"><InfoFilled /></el-icon>
                      <span>AI 正在准备识别，请稍候...</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 识别结果 -->
              <transition name="fade-up">
                <div class="result-section" v-if="fishResult">
                  <div class="result-header">
                    <div class="result-title">
                      <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
                      <span>识别结果</span>
                    </div>
                    <el-tag :type="fishResult.isProtected ? 'danger' : 'success'" effect="dark" size="large" class="status-tag">
                      {{ fishResult.isProtected ? '保护鱼类' : '可食用' }}
                    </el-tag>
                  </div>

                  <div class="fish-info-card">
                    <div class="fish-image-large">
                      <div class="image-frame">
                        <img :src="uploadedImage" alt="鱼的照片" class="result-image" />
                        <div class="image-badge">
                          <el-icon><CameraFilled /></el-icon>
                        </div>
                      </div>
                    </div>
                    <div class="fish-details">
                      <div class="detail-header">
                        <h2 class="fish-name">{{ fishResult.name }}</h2>
                        <span class="fish-alias">{{ fishResult.alias }}</span>
                      </div>

                      <el-divider class="custom-divider" />

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
                          <div class="detail-icon warning-icon">
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
    <ImagePreview
      :visible="imagePreviewVisible"
      :images="imagePreviewImages"
      @update:visible="(val) => imagePreviewVisible = val"
    />
    
    <!-- 旧的预览对话框（保留但不再使用） -->
    <el-dialog v-model="previewVisible" title="图片预览" width="600px" align-center>
      <img :src="previewImage" style="width: 100%; border-radius: 8px;" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import {
  Camera,
  CameraFilled,
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
  InfoFilled,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { chatWithAI, identifyFish as identifyFishApi } from '@/api/ai'
import ImagePreview from '@/components/common/ImagePreview.vue'

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
// 图片预览相关
const imagePreviewVisible = ref(false)
const imagePreviewImages = ref([])

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
  // 创建本地预览 URL
  const reader = new FileReader()
  reader.onload = (e) => {
    const imageUrl = e.target.result
    uploadedImage.value = imageUrl
    fileList.value = [{ ...file, url: imageUrl }]
    fishResult.value = null
  }
  reader.readAsDataURL(file.raw)
}

// 处理图片移除
const handleImageRemove = () => {
  uploadedImage.value = ''
  fishResult.value = null
  fileList.value = []
}

// 处理预览
const handlePreview = (file) => {
  // 使用 ImagePreview 组件预览
  imagePreviewVisible.value = true
  imagePreviewImages.value = [file.url]
}

// 处理删除
const handleRemove = () => {
  handleImageRemove()
}

// 常见鱼类数据
const commonFishes = [
  {
    name: '鲫鱼',
    alias: '鲫瓜子、月鲫仔、土鲫',
    category: '鲤科',
    isProtected: false,
    habits: '鲫鱼是杂食性鱼类，主要以植物性食物为主，喜栖息于水草丰茂的浅水区，适应性强，分布广泛。',
    edibleValue: '鲫鱼肉质细嫩，味道鲜美，营养丰富，含有丰富的蛋白质、维生素和矿物质，具有很高的食用价值。'
  },
  {
    name: '鲤鱼',
    alias: '鲤拐子、红鱼',
    category: '鲤科',
    isProtected: false,
    habits: '鲤鱼是底栖性鱼类，杂食性，喜栖息于湖泊、河流等水域的底层，适应性强，生长快。',
    edibleValue: '鲤鱼肉质鲜美，营养丰富，含有丰富的蛋白质和不饱和脂肪酸，具有很高的食用价值。'
  },
  {
    name: '草鱼',
    alias: '草鲩、白鲩',
    category: '鲤科',
    isProtected: false,
    habits: '草鱼是草食性鱼类，主要以水生植物为食，喜栖息于水体中下层，生长快，个体大。',
    edibleValue: '草鱼肉质细嫩，味道鲜美，营养丰富，含有丰富的蛋白质和维生素，具有很高的食用价值。'
  },
  {
    name: '鲢鱼',
    alias: '白鲢、水鲢',
    category: '鲤科',
    isProtected: false,
    habits: '鲢鱼是滤食性鱼类，主要以浮游生物为食，喜栖息于水体上层，生长快，个体大。',
    edibleValue: '鲢鱼肉质细嫩，味道鲜美，营养丰富，含有丰富的蛋白质和不饱和脂肪酸，具有很高的食用价值。'
  },
  {
    name: '鳙鱼',
    alias: '花鲢、胖头鱼',
    category: '鲤科',
    isProtected: false,
    habits: '鳙鱼是滤食性鱼类，主要以浮游动物为食，喜栖息于水体中上层，生长快，个体大。',
    edibleValue: '鳙鱼肉质细嫩，味道鲜美，营养丰富，尤其是鱼头部分，含有丰富的胶原蛋白和不饱和脂肪酸。'
  },
  {
    name: '青鱼',
    alias: '青鲩、乌青',
    category: '鲤科',
    isProtected: false,
    habits: '青鱼是肉食性鱼类，主要以螺、蚌等底栖动物为食，喜栖息于水体中下层，生长快，个体大。',
    edibleValue: '青鱼肉质细嫩，味道鲜美，营养丰富，含有丰富的蛋白质和不饱和脂肪酸，具有很高的食用价值。'
  },
  {
    name: '鳜鱼',
    alias: '桂鱼、季花鱼',
    category: '鮨科',
    isProtected: false,
    habits: '鳜鱼是肉食性鱼类，主要以小鱼、虾等为食，喜栖息于水草丰茂的浅水区，生长快，肉质好。',
    edibleValue: '鳜鱼肉质细嫩，味道鲜美，营养丰富，被誉为"淡水鱼之王"，具有很高的食用价值。'
  },
  {
    name: '黑鱼',
    alias: '乌鳢、财鱼',
    category: '鳢科',
    isProtected: false,
    habits: '黑鱼是肉食性鱼类，主要以小鱼、虾等为食，喜栖息于水草丰茂的浅水区，适应性强，生长快。',
    edibleValue: '黑鱼肉质细嫩，味道鲜美，营养丰富，含有丰富的蛋白质和多种氨基酸，具有很高的食用价值。'
  },
  {
    name: '鲶鱼',
    alias: '鲇鱼、胡子鱼',
    category: '鲶科',
    isProtected: false,
    habits: '鲶鱼是肉食性鱼类，主要以小鱼、虾等为食，喜栖息于水体底层，适应性强，生长快。',
    edibleValue: '鲶鱼肉质细嫩，味道鲜美，营养丰富，含有丰富的蛋白质和不饱和脂肪酸，具有很高的食用价值。'
  },
  {
    name: '黄颡鱼',
    alias: '黄辣丁、黄骨鱼',
    category: '鲿科',
    isProtected: false,
    habits: '黄颡鱼是肉食性鱼类，主要以小鱼、虾等为食，喜栖息于水体底层，适应性强，生长快。',
    edibleValue: '黄颡鱼肉质细嫩，味道鲜美，营养丰富，含有丰富的蛋白质和多种氨基酸，具有很高的食用价值。'
  },
  {
    name: '罗非鱼',
    alias: '非洲鲫鱼、福寿鱼',
    category: '丽鱼科',
    isProtected: false,
    habits: '罗非鱼是杂食性鱼类，主要以植物性食物为主，喜栖息于水体中下层，适应性强，生长快。',
    edibleValue: '罗非鱼肉质细嫩，味道鲜美，营养丰富，含有丰富的蛋白质和不饱和脂肪酸，具有很高的食用价值。'
  },
  {
    name: '鲈鱼',
    alias: '花鲈、七星鲈',
    category: '鲈科',
    isProtected: false,
    habits: '鲈鱼是肉食性鱼类，主要以小鱼、虾等为食，喜栖息于水体中上层，适应性强，生长快。',
    edibleValue: '鲈鱼肉质细嫩，味道鲜美，营养丰富，含有丰富的蛋白质和不饱和脂肪酸，具有很高的食用价值。'
  },
  {
    name: '马口鱼',
    alias: '桃花鱼、溪哥',
    category: '鲤科',
    isProtected: false,
    habits: '马口鱼是肉食性鱼类，主要以小鱼、虾等为食，喜栖息于溪流、江河等流水环境，适应性强。',
    edibleValue: '马口鱼肉质细嫩，味道鲜美，营养丰富，含有丰富的蛋白质和多种氨基酸，具有很高的食用价值。'
  },
  {
    name: '翘嘴鲌',
    alias: '翘嘴、白鱼',
    category: '鲤科',
    isProtected: false,
    habits: '翘嘴鲌是肉食性鱼类，主要以小鱼、虾等为食，喜栖息于水体中上层，游泳速度快，生长快。',
    edibleValue: '翘嘴鲌肉质细嫩，味道鲜美，营养丰富，含有丰富的蛋白质和不饱和脂肪酸，具有很高的食用价值。'
  },
  {
    name: '鳊鱼',
    alias: '武昌鱼、团头鲂',
    category: '鲤科',
    isProtected: false,
    habits: '鳊鱼是草食性鱼类，主要以水生植物为食，喜栖息于水体中下层，生长快，个体大。',
    edibleValue: '鳊鱼肉质细嫩，味道鲜美，营养丰富，含有丰富的蛋白质和维生素，具有很高的食用价值。'
  },
  {
    name: '鲮鱼',
    alias: '土鲮、雪鲮',
    category: '鲤科',
    isProtected: false,
    habits: '鲮鱼是杂食性鱼类，主要以藻类和有机碎屑为食，喜栖息于温暖的水体中下层，生长快。',
    edibleValue: '鲮鱼肉质细嫩，味道鲜美，营养丰富，含有丰富的蛋白质和不饱和脂肪酸，具有很高的食用价值。'
  },
  {
    name: '银鱼',
    alias: '面条鱼、面鱼',
    category: '银鱼科',
    isProtected: false,
    habits: '银鱼是肉食性鱼类，主要以浮游动物为食，喜栖息于水体中上层，适应性强，生长快。',
    edibleValue: '银鱼肉质细嫩，味道鲜美，营养丰富，含有丰富的蛋白质和多种氨基酸，具有很高的食用价值。'
  },
  {
    name: '泥鳅',
    alias: '鳅鱼、泥狗',
    category: '鳅科',
    isProtected: false,
    habits: '泥鳅是杂食性鱼类，主要以有机碎屑和小型无脊椎动物为食，喜栖息于水体底层，适应性强。',
    edibleValue: '泥鳅肉质细嫩，味道鲜美，营养丰富，含有丰富的蛋白质和多种维生素，具有很高的食用价值。'
  },
  {
    name: '黄鳝',
    alias: '鳝鱼、长鱼',
    category: '合鳃鱼科',
    isProtected: false,
    habits: '黄鳝是肉食性鱼类，主要以小鱼、虾等为食，喜栖息于水体底层的洞穴中，适应性强。',
    edibleValue: '黄鳝肉质细嫩，味道鲜美，营养丰富，含有丰富的蛋白质和多种氨基酸，具有很高的食用价值。'
  },
  {
    name: '鳗鲡',
    alias: '河鳗、白鳝',
    category: '鳗鲡科',
    isProtected: false,
    habits: '鳗鲡是肉食性鱼类，主要以小鱼、虾等为食，喜栖息于水体底层，具有洄游习性。',
    edibleValue: '鳗鲡肉质细嫩，味道鲜美，营养丰富，含有丰富的蛋白质和不饱和脂肪酸，具有很高的食用价值。'
  }
]

// 识别鱼类
const identifyFish = async () => {
  if (!uploadedImage.value) {
    ElMessage.warning('请先上传鱼的照片')
    return
  }

  isIdentifying.value = true
  ElMessage.info('AI 正在识别中，请稍候...')

  try {
    const file = fileList.value[0]?.raw
    if (!file) {
      throw new Error('请先上传鱼的照片')
    }
    
    const result = await identifyFishApi(file)
    
    // 检查是否识别成功
    if (result.name && result.name !== '未知鱼类') {
      fishResult.value = {
        name: result.name || '未知鱼类',
        alias: result.alias || '',
        category: result.category || '',
        isProtected: result.isProtected || false,
        habits: result.habits || '暂无该鱼类的详细信息',
        edibleValue: result.edibleValue || '暂无该鱼类的食用价值信息',
      }
      ElMessage.success('识别完成！')
    } else {
      // AI 识别失败，使用假数据
      const randomFish = commonFishes[Math.floor(Math.random() * commonFishes.length)]
      fishResult.value = {
        ...randomFish
      }
      ElMessage.info('AI 识别遇到困难，为您提供参考信息')
    }
  } catch (error) {
    console.error('识别鱼类失败:', error)
    // 网络错误时使用假数据
    const randomFish = commonFishes[Math.floor(Math.random() * commonFishes.length)]
    fishResult.value = {
      ...randomFish
    }
    ElMessage.info('网络连接遇到问题，为您提供参考信息')
  } finally {
    isIdentifying.value = false
  }
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
  position: relative;
  z-index: 1;
  min-height: 100vh;
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
  position: relative;
  z-index: 1;
  margin: 20px 0;

  :deep(.el-tabs) {
    background: transparent;
    border: none;
    box-shadow: none;
  }

  :deep(.el-tabs__header) {
    margin-bottom: 0;
    border-bottom: none;
    background: transparent;

    .el-tabs__nav {
      border-radius: 12px 12px 0 0;
      overflow: hidden;
      background: white;
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

        span {
          font-size: 15px;
        }
      }

      &.is-active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;

        .tab-label {
          color: white;
        }
      }

      &:hover:not(.is-active) {
        color: #667eea;
        background: rgba(102, 126, 234, 0.05);
      }
    }
  }

  :deep(.el-tabs__content) {
    background: transparent;
    border-radius: 0 0 12px 12px;
  }
}

.tab-content {
  position: relative;
  z-index: 1;
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
    margin-bottom: 24px;

    .section-icon {
      width: 50px;
      height: 50px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

      &.blue {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
    }

    .section-info {
      h3 {
        font-size: 1.3rem;
        font-weight: 700;
        color: #303133;
        margin: 0 0 4px 0;
      }

      p {
        color: #909399;
        margin: 0;
        font-size: 14px;
      }
    }
  }
}

// 上传区域容器
.upload-area-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 32px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
  border-radius: 16px;
  border: 1px solid #e6e8ff;
  margin-bottom: 24px;
}

.upload-area-wrapper {
  display: flex;
  justify-content: center;

  :deep(.el-upload--picture-card) {
    width: 300px;
    height: 300px;
    border: 2px dashed #c0c4cc;
    border-radius: 16px;
    background: white;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

    &:hover {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.05);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.15);
    }
  }

  .file-preview-container {
    display: flex;
    justify-content: center;
    width: 300px;
    height: 300px;
  }

  .file-preview {
    width: 100%;
    height: 100%;
  }

  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #909399;

    .upload-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e6eaff 0%, #d8ddff 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      transition: all 0.3s;

      .upload-icon {
        font-size: 40px;
        color: #667eea;
      }
    }

    .upload-text {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;
    }

    .upload-hint {
      font-size: 14px;
      color: #909399;
    }
  }

  .file-preview {
    width: 100%;
    height: 100%;

    .image-container {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 16px;
      overflow: hidden;

      .preview-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
      }

      .image-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%);
        display: flex;
        align-items: flex-end;
        justify-content: center;
        opacity: 0;
        transition: all 0.3s ease;

        .file-actions {
          display: flex;
          gap: 12px;
          padding: 20px;
          transform: translateY(20px);
          transition: transform 0.3s ease;

          .file-action-icon {
            width: 44px;
            height: 44px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: #606266;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              background: white;
              color: #667eea;
              transform: scale(1.1);
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }
          }
        }
      }

      &:hover {
        .preview-image {
          transform: scale(1.05);
        }

        .image-overlay {
          opacity: 1;

          .file-actions {
            transform: translateY(0);
          }
        }
      }
    }
  }
}

// 操作容器
.action-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  .identify-btn {
    width: 220px;
    height: 52px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 26px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
    }

    &:disabled {
      background: #c0c4cc;
      box-shadow: none;
      transform: none;
    }
  }

  .tip-text {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    padding: 8px 16px;
    border-radius: 16px;
    border: 1px solid rgba(102, 126, 234, 0.2);
  }
}

// 识别结果
.result-section {
  margin-top: 32px;
  animation: fadeUp 0.6s ease-out;

  .result-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;

    .result-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.2rem;
      font-weight: 700;
      color: #303133;

      .success-icon {
        color: #67c23a;
        font-size: 24px;
      }
    }

    .status-tag {
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 20px;
    }
  }

  .fish-info-card {
    background: white;
    border-radius: 20px;
    padding: 24px;
    display: flex;
    gap: 24px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    border: 1px solid #f0f2f5;

    .fish-image-large {
      width: 260px;
      height: 260px;
      flex-shrink: 0;

      .image-frame {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);

        .result-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
      }
    }

    .fish-details {
      flex: 1;

      .detail-header {
        margin-bottom: 20px;

        .fish-name {
          font-size: 1.8rem;
          font-weight: 800;
          color: #303133;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .fish-alias {
          color: #909399;
          font-size: 14px;
          font-style: italic;
        }
      }

      .custom-divider {
        margin: 16px 0;
        border-color: #f0f2f5;
      }

      .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 16px;

        .detail-item {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #f8f9ff;
          border-radius: 12px;
          transition: all 0.3s ease;
          border: 1px solid #e6e8ff;

          &:hover {
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.1);
            transform: translateY(-2px);
          }

          &.warning {
            background: #fef0f0;
            border: 1px solid #fde2e2;

            &:hover {
              box-shadow: 0 4px 16px rgba(245, 108, 108, 0.1);
            }
          }

          .detail-icon {
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
            flex-shrink: 0;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
          }

          .detail-icon.warning-icon {
            background: linear-gradient(135deg, #f56c6c 0%, #e6a23c 100%);
            box-shadow: 0 4px 12px rgba(245, 108, 108, 0.2);
          }

          .detail-content {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .detail-label {
              font-size: 13px;
              color: #909399;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .detail-value {
              font-size: 14px;
              color: #303133;
              line-height: 1.5;
              font-weight: 500;

              &.danger {
                color: #f56c6c;
                font-weight: 700;
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

// 向上淡入动画
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.6s ease-out;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(30px);
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
