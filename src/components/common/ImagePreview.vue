<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="visible" class="image-preview-overlay" @click.self="close">
        <div class="preview-container">
          <div class="preview-header">
            <span class="preview-counter">{{ currentIndex + 1 }} / {{ images.length }}</span>
            <button class="close-btn" @click="close">
              <el-icon><Close /></el-icon>
            </button>
          </div>
          
          <div class="preview-content">
            <button class="nav-btn prev-btn" @click="prevImage" :disabled="currentIndex === 0">
              <el-icon><ArrowLeft /></el-icon>
            </button>
            
            <div class="image-wrapper">
              <img :src="currentImage" :alt="`图片 ${currentIndex + 1}`" @click="close" />
            </div>
            
            <button class="nav-btn next-btn" @click="nextImage" :disabled="currentIndex === images.length - 1">
              <el-icon><ArrowRight /></el-icon>
            </button>
          </div>
          
          <div class="preview-footer">
            <div class="thumbnail-list">
              <div
                v-for="(image, index) in images"
                :key="index"
                class="thumbnail-item"
                :class="{ active: index === currentIndex }"
                @click="goToImage(index)"
              >
                <img :src="image" :alt="`缩略图 ${index + 1}`" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Close, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  images: {
    type: Array,
    default: () => []
  },
  initialIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:visible', 'close'])

const currentIndex = ref(props.initialIndex)

const currentImage = computed(() => {
  return props.images[currentIndex.value] || ''
})

const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
  }
}

const goToImage = (index) => {
  currentIndex.value = index
}

const close = () => {
  emit('update:visible', false)
  emit('close')
}

const handleKeydown = (e) => {
  if (!props.visible) return
  
  switch (e.key) {
    case 'ArrowLeft':
      prevImage()
      break
    case 'ArrowRight':
      nextImage()
      break
    case 'Escape':
      close()
      break
  }
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    currentIndex.value = props.initialIndex
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="scss" scoped>
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  color: white;
}

.preview-counter {
  font-size: 16px;
  font-weight: 500;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .el-icon {
    font-size: 24px;
  }
}

.preview-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 0 30px;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .el-icon {
    font-size: 28px;
  }
}

.image-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 80%;
  max-height: 70vh;

  img {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
    cursor: pointer;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
}

.preview-footer {
  padding: 20px 30px;
  display: flex;
  justify-content: center;
}

.thumbnail-list {
  display: flex;
  gap: 10px;
  max-width: 80%;
  overflow-x: auto;
  padding: 10px;
}

.thumbnail-item {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
  flex-shrink: 0;

  &:hover {
    border-color: rgba(255, 255, 255, 0.5);
  }

  &.active {
    border-color: white;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .preview-header {
    padding: 15px 20px;
  }

  .preview-content {
    padding: 0 10px;
    gap: 10px;
  }

  .nav-btn {
    width: 40px;
    height: 40px;

    .el-icon {
      font-size: 20px;
    }
  }

  .image-wrapper {
    max-height: 60vh;

    img {
      max-height: 60vh;
    }
  }

  .thumbnail-list {
    max-width: 100%;
  }

  .thumbnail-item {
    width: 50px;
    height: 50px;
  }
}
</style>
