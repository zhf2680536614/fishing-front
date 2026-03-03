<template>
  <div class="dict-manage-page">
    <div class="page-header">
      <h1 class="page-title">字典管理</h1>
      <div class="page-actions">
        <el-button type="primary">
          <el-icon><Plus /></el-icon> 新增字典
        </el-button>
      </div>
    </div>

    <div class="dict-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="鱼类百科" name="fish">
          <div class="tab-content">
            <div class="fish-table">
              <el-table :data="fishList" style="width: 100%">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column label="鱼类信息" min-width="200">
                  <template #default="scope">
                    <div class="fish-info">
                      <img :src="scope.row.img_url" alt="鱼类图片" class="fish-image" />
                      <div class="fish-details">
                        <div class="fish-name">{{ scope.row.name }}</div>
                        <div class="fish-alias">{{ scope.row.alias }}</div>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="category" label="科属" width="150" />
                <el-table-column prop="protection_level" label="保护级别" width="120">
                  <template #default="scope">
                    <el-tag :type="scope.row.protection_level ? 'danger' : 'success'">
                      {{ scope.row.protection_level ? '保护动物' : '普通' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150" fixed="right">
                  <template #default="scope">
                    <el-button size="small" @click="editFish(scope.row)"> 编辑 </el-button>
                    <el-button size="small" type="danger" @click="deleteFish(scope.row)">
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <div class="pagination">
              <el-pagination
                v-model:current-page="currentPage"
                :page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalFish"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="系统标签" name="tag">
          <div class="tab-content">
            <div class="tag-list">
              <div v-for="tag in tags" :key="tag.id" class="tag-item">
                <span class="tag-name">{{ tag.name }}</span>
                <div class="tag-actions">
                  <el-button size="small" @click="editTag(tag)"> 编辑 </el-button>
                  <el-button size="small" type="danger" @click="deleteTag(tag)"> 删除 </el-button>
                </div>
              </div>
            </div>
            <el-button type="primary" class="add-tag-btn">
              <el-icon><Plus /></el-icon> 添加标签
            </el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'

// 响应式数据
const activeTab = ref('fish')
const currentPage = ref(1)
const pageSize = ref(10)
const totalFish = ref(156)

// 模拟鱼类数据
const fishList = ref([
  {
    id: 1,
    name: '鲫鱼',
    alias: '鲫瓜子、土鲫',
    category: '鲤科',
    protection_level: 0,
    img_url:
      'https://images.unsplash.com/photo-1520186994231-6ea0019d8cc2?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 2,
    name: '鲤鱼',
    alias: '鲤拐子、红鱼',
    category: '鲤科',
    protection_level: 0,
    img_url:
      'https://images.unsplash.com/photo-1505342730-a94747714800?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 3,
    name: '青鱼',
    alias: '青鲩、乌青',
    category: '鲤科',
    protection_level: 0,
    img_url:
      'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 4,
    name: '翘嘴',
    alias: '白鱼、翘嘴鲌',
    category: '鲤科',
    protection_level: 0,
    img_url:
      'https://images.unsplash.com/photo-1579098382271-091f68b2226b?q=80&w=800&auto=format&fit=crop',
  },
])

// 模拟标签数据
const tags = ref([
  { id: 1, name: '台钓' },
  { id: 2, name: '路亚' },
  { id: 3, name: '海钓' },
  { id: 4, name: '野钓' },
  { id: 5, name: '黑坑' },
])

// 编辑鱼类
const editFish = (fish) => {
  console.log('编辑鱼类:', fish)
}

// 删除鱼类
const deleteFish = (fish) => {
  console.log('删除鱼类:', fish)
}

// 编辑标签
const editTag = (tag) => {
  console.log('编辑标签:', tag)
}

// 删除标签
const deleteTag = (tag) => {
  console.log('删除标签:', tag)
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (current) => {
  currentPage.value = current
}
</script>

<style lang="scss" scoped>
.dict-manage-page {
  padding: 2vw;
  height: 100%;
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2vh;

  .page-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }
}

.dict-tabs {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);

  :deep(.el-tabs__header) {
    border-bottom: 1px solid var(--border-light);

    .el-tabs__nav {
      margin: 0;
    }
  }
}

.tab-content {
  padding: 2.5vh;
}

.fish-table {
  margin-bottom: 2vh;

  :deep(.el-table) {
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .fish-info {
    display: flex;
    align-items: center;
    gap: 1vw;

    .fish-image {
      width: 60px;
      height: 60px;
      border-radius: var(--radius-md);
      object-fit: cover;
    }

    .fish-details {
      .fish-name {
        font-weight: 600;
        color: var(--text-primary);
      }
      .fish-alias {
        font-size: 0.9rem;
        color: var(--text-secondary);
      }
    }
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 2vh;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5vw;
  margin-bottom: 2vh;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 1vw;
  background: var(--bg-tertiary);
  padding: 1vh 1.5vw;
  border-radius: var(--radius-md);

  .tag-name {
    font-weight: 600;
    color: var(--text-primary);
  }
}

.add-tag-btn {
  margin-top: 1vh;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dict-manage-page {
    padding: 2vh;
  }

  .fish-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5vh;
  }

  .tag-list {
    flex-direction: column;

    .tag-item {
      width: 100%;
      justify-content: space-between;
    }
  }
}
</style>
