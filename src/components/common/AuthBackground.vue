<template>
  <div class="auth-background">
    <!-- 渐变流动背景 -->
    <div class="gradient-bg">
      <div class="gradient-blob blob-1"></div>
      <div class="gradient-blob blob-2"></div>
      <div class="gradient-blob blob-3"></div>
      <div class="gradient-blob blob-4"></div>
    </div>
    <!-- 波浪粒子背景 -->
    <div :id="particlesId" class="particles-container"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { loadSlim } from '@tsparticles/slim'
import { tsParticles } from '@tsparticles/engine'

const props = defineProps({
  particlesId: {
    type: String,
    default: 'auth-particles'
  }
})

// 波浪粒子配置
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
      value: ['#667eea', '#764ba2', '#4facfe', '#00f2fe', '#43e97b'],
    },
    move: {
      direction: 'top',
      enable: true,
      outModes: {
        default: 'out',
        top: 'out',
        bottom: 'out',
      },
      random: true,
      speed: {
        min: 1,
        max: 3,
      },
      straight: false,
      trail: {
        enable: true,
        length: 20,
        fill: {
          color: {
            value: 'transparent',
          },
        },
      },
      vibrate: false,
      warp: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 40,
    },
    opacity: {
      value: {
        min: 0.1,
        max: 0.3,
      },
      animation: {
        enable: true,
        speed: 1,
        sync: false,
      },
    },
    shape: {
      type: 'circle',
    },
    size: {
      value: {
        min: 8,
        max: 20,
      },
      animation: {
        enable: true,
        speed: 2,
        sync: false,
      },
    },
    wobble: {
      enable: true,
      distance: 10,
      speed: {
        angle: 5,
        move: 10,
      },
    },
  },
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: 'repulse',
      },
    },
    modes: {
      repulse: {
        distance: 100,
        duration: 0.4,
      },
    },
  },
  detectRetina: true,
}

// 初始化粒子效果
const initParticles = async () => {
  await loadSlim(tsParticles)
  await tsParticles.load({
    id: props.particlesId,
    options: particlesOptions,
  })
}

onMounted(() => {
  initParticles()
})
</script>

<style lang="scss" scoped>
.auth-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

/* 渐变流动背景 */
.gradient-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 50%, #f0f4f8 100%);

  .gradient-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.5;
    will-change: transform, opacity, filter;
  }

  .blob-1 {
    width: 600px;
    height: 600px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    top: -200px;
    left: -100px;
    animation: float 12s infinite ease-in-out, pulse 8s infinite ease-in-out;
    animation-delay: 0s, 0s;
  }

  .blob-2 {
    width: 500px;
    height: 500px;
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    top: 20%;
    right: -150px;
    animation: float 14s infinite ease-in-out, pulse 10s infinite ease-in-out;
    animation-delay: -3s, -2s;
  }

  .blob-3 {
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    bottom: -100px;
    left: 20%;
    animation: float 16s infinite ease-in-out, pulse 12s infinite ease-in-out;
    animation-delay: -6s, -4s;
  }

  .blob-4 {
    width: 350px;
    height: 350px;
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    bottom: 30%;
    right: 10%;
    animation: float 18s infinite ease-in-out, pulse 14s infinite ease-in-out;
    animation-delay: -9s, -6s;
  }
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    border-radius: 50%;
  }
  20% {
    transform: translate(100px, -80px) scale(1.2) rotate(72deg);
    border-radius: 60% 40% 50% 50%;
  }
  40% {
    transform: translate(-80px, 100px) scale(0.85) rotate(144deg);
    border-radius: 40% 60% 60% 40%;
  }
  60% {
    transform: translate(80px, 60px) scale(1.15) rotate(216deg);
    border-radius: 50% 50% 40% 60%;
  }
  80% {
    transform: translate(-60px, -100px) scale(0.9) rotate(288deg);
    border-radius: 60% 40% 40% 60%;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
    filter: blur(60px);
  }
  50% {
    opacity: 0.7;
    filter: blur(80px);
  }
}

/* 粒子背景容器 */
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}
</style>
