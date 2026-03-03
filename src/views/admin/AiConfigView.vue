<template>
  <div class="ai-config-page">
    <div class="page-header">
      <h1 class="page-title">AI 参数设置</h1>
    </div>

    <div class="config-card">
      <h3 class="card-title">OpenAI API 配置</h3>
      <el-form :model="aiConfig" label-width="120px">
        <el-form-item label="API Key">
          <el-input
            v-model="aiConfig.openaiApiKey"
            type="password"
            placeholder="请输入 OpenAI API Key"
          />
        </el-form-item>
        <el-form-item label="模型选择">
          <el-select v-model="aiConfig.openaiModel" placeholder="选择模型">
            <el-option label="gpt-3.5-turbo" value="gpt-3.5-turbo" />
            <el-option label="gpt-4" value="gpt-4" />
            <el-option label="gpt-4-turbo" value="gpt-4-turbo" />
          </el-select>
        </el-form-item>
        <el-form-item label="温度设置">
          <el-slider v-model="aiConfig.openaiTemperature" :min="0" :max="1" :step="0.1" />
        </el-form-item>
      </el-form>
    </div>

    <div class="config-card">
      <h3 class="card-title">国内大模型配置</h3>
      <el-form :model="aiConfig" label-width="120px">
        <el-form-item label="模型类型">
          <el-select v-model="aiConfig.domesticModel" placeholder="选择模型">
            <el-option label="智谱AI" value="zhipu" />
            <el-option label="通义千问" value="tongyi" />
            <el-option label="文心一言" value="wenxin" />
          </el-select>
        </el-form-item>
        <el-form-item label="API Key">
          <el-input
            v-model="aiConfig.domesticApiKey"
            type="password"
            placeholder="请输入 API Key"
          />
        </el-form-item>
      </el-form>
    </div>

    <div class="config-card">
      <h3 class="card-title">Prompt 模板设置</h3>
      <el-form :model="aiConfig" label-width="120px">
        <el-form-item label="识鱼提示词">
          <el-input
            v-model="aiConfig.fishIdentifyPrompt"
            type="textarea"
            :rows="3"
            placeholder="请输入识鱼提示词"
          />
        </el-form-item>
        <el-form-item label="配饵建议提示词">
          <el-input
            v-model="aiConfig.baitAdvicePrompt"
            type="textarea"
            :rows="3"
            placeholder="请输入配饵建议提示词"
          />
        </el-form-item>
        <el-form-item label="安慰师提示词">
          <el-input
            v-model="aiConfig.comfortPrompt"
            type="textarea"
            :rows="3"
            placeholder="请输入安慰师提示词"
          />
        </el-form-item>
      </el-form>
    </div>

    <div class="form-actions">
      <el-button>取消</el-button>
      <el-button type="primary" @click="saveConfig">保存配置</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// AI 配置数据
const aiConfig = ref({
  openaiApiKey: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  openaiModel: 'gpt-3.5-turbo',
  openaiTemperature: 0.7,
  domesticModel: 'zhipu',
  domesticApiKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  fishIdentifyPrompt: '请识别这张图片中的鱼类，包括名称、种类、特征等信息。',
  baitAdvicePrompt: '根据用户提供的季节、钓点、目标鱼种等信息，提供详细的饵料配方建议。',
  comfortPrompt: '当用户发布空军动态时，生成幽默的安慰语，鼓励用户下次再接再厉。',
})

// 保存配置
const saveConfig = () => {
  console.log('保存AI配置:', aiConfig.value)
  // 这里可以添加保存逻辑
}
</script>

<style lang="scss" scoped>
.ai-config-page {
  padding: 2vw;
  height: 100%;
  overflow-y: auto;
}

.page-header {
  margin-bottom: 2vh;

  .page-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }
}

.config-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 2.5vh;
  box-shadow: var(--shadow-md);
  margin-bottom: 2vh;

  .card-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 2vh;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1vw;
  margin-top: 3vh;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-config-page {
    padding: 2vh;
  }

  .form-actions {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
}
</style>
