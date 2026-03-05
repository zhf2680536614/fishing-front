<template>
  <div class="about-page">
    <div class="about-header">
      <h1 class="page-title">平台介绍</h1>
      <p class="page-subtitle">关于鱼乐圈 - 钓鱼爱好者的专属社区</p>
    </div>
    
    <div class="about-content">
      <div class="about-section">
        <h2 class="section-title">关于我们</h2>
        <div class="section-content">
          <p>鱼乐圈是一个专为钓鱼爱好者打造的综合性平台，致力于为广大钓友提供专业的钓鱼资源、交流社区和智能工具。我们的使命是让每一位钓鱼爱好者都能享受到高质量的钓鱼体验，无论是新手还是资深钓友，都能在这里找到属于自己的一片天地。</p>
          <p>我们汇聚了来自全国各地的钓鱼爱好者，共同分享钓鱼经验、交流钓技、分享鱼获喜悦。同时，我们提供智能钓点推荐、AI垂钓助手等创新功能，帮助钓友们提升钓鱼技能，增加钓鱼乐趣。</p>
        </div>
      </div>
      
      <div class="about-section">
        <h2 class="section-title">平台特色</h2>
        <div class="feature-grid">
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon class="icon-large"><MapLocation /></el-icon>
            </div>
            <h3 class="feature-title">智能钓点推荐</h3>
            <p class="feature-desc">基于大数据分析，为您推荐最佳钓点，提高钓鱼成功率</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon class="icon-large"><Cpu /></el-icon>
            </div>
            <h3 class="feature-title">AI垂钓助手</h3>
            <p class="feature-desc">利用人工智能技术，为您提供实时钓鱼建议和鱼种识别</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon class="icon-large"><ChatLineSquare /></el-icon>
            </div>
            <h3 class="feature-title">社区论坛</h3>
            <p class="feature-desc">与全国钓友交流经验，分享鱼获，学习钓技</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon class="icon-large"><ShoppingBag /></el-icon>
            </div>
            <h3 class="feature-title">装备交易</h3>
            <p class="feature-desc">安全便捷的钓鱼装备交易平台，让您轻松买卖装备</p>
          </div>
        </div>
      </div>
      
      <div class="about-section">
        <h2 class="section-title">我们的愿景</h2>
        <div class="section-content">
          <p>我们希望通过鱼乐圈平台，构建一个充满活力、互助共享的钓鱼社区。我们相信，钓鱼不仅仅是一种休闲活动，更是一种生活态度，一种与自然和谐相处的方式。</p>
          <p>未来，我们将继续创新，为钓友们提供更多实用的功能和服务，让钓鱼变得更加简单、有趣、有意义。我们期待与您一起，探索钓鱼的无限乐趣！</p>
        </div>
      </div>
      
      <div class="about-section">
        <h2 class="section-title">平台优势</h2>
        <div class="advantage-list">
          <div class="advantage-item">
            <div class="advantage-number">01</div>
            <div class="advantage-content">
              <h3>专业团队</h3>
              <p>由资深钓鱼爱好者和技术专家组成的团队，深入了解钓鱼需求</p>
            </div>
          </div>
          <div class="advantage-item">
            <div class="advantage-number">02</div>
            <div class="advantage-content">
              <h3>技术创新</h3>
              <p>融合AI、大数据等先进技术，为钓鱼体验赋能</p>
            </div>
          </div>
          <div class="advantage-item">
            <div class="advantage-number">03</div>
            <div class="advantage-content">
              <h3>用户至上</h3>
              <p>以用户需求为中心，持续优化产品和服务</p>
            </div>
          </div>
          <div class="advantage-item">
            <div class="advantage-number">04</div>
            <div class="advantage-content">
              <h3>社区活力</h3>
              <p>活跃的用户社区，丰富的内容分享和互动</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MapLocation, Cpu, ChatLineSquare, ShoppingBag } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.about-page {
  padding: 60px 0;
  position: relative;
  z-index: 1;
}

.about-header {
  text-align: center;
  margin-bottom: 60px;
  
  .page-title {
    font-size: 36px;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: 16px;
    position: relative;
    display: inline-block;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -12px;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 4px;
      background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
      border-radius: 2px;
    }
  }
  
  .page-subtitle {
    font-size: 18px;
    color: var(--text-light);
    margin-top: 24px;
  }
}

.about-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.about-section {
  margin-bottom: 80px;
  
  .section-title {
    font-size: 28px;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 32px;
    position: relative;
    padding-left: 20px;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 10px;
      width: 4px;
      height: 24px;
      background: linear-gradient(180deg, var(--primary-color), var(--accent-color));
      border-radius: 2px;
    }
  }
  
  .section-content {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    p {
      font-size: 16px;
      line-height: 1.8;
      color: var(--text-light);
      margin-bottom: 20px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.feature-item {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
  
  .feature-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 24px;
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
    
    .icon-large {
      font-size: 32px;
      color: white;
    }
  }
  
  .feature-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 16px;
  }
  
  .feature-desc {
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-light);
  }
}

.advantage-list {
  margin-top: 40px;
}

.advantage-item {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .advantage-number {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 700;
    color: white;
    box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
    flex-shrink: 0;
  }
  
  .advantage-content {
    flex: 1;
    
    h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 8px;
    }
    
    p {
      font-size: 14px;
      line-height: 1.6;
      color: var(--text-light);
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .about-page {
    padding: 40px 0;
  }
  
  .about-header {
    margin-bottom: 40px;
    
    .page-title {
      font-size: 28px;
    }
    
    .page-subtitle {
      font-size: 16px;
    }
  }
  
  .about-section {
    margin-bottom: 60px;
    
    .section-title {
      font-size: 24px;
    }
    
    .section-content {
      padding: 24px;
    }
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .advantage-item {
    flex-direction: column;
    text-align: center;
    gap: 16px;
    
    .advantage-content {
      h3 {
        font-size: 16px;
      }
    }
  }
}
</style>