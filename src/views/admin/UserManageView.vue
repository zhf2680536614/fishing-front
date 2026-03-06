<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, UserFilled, Plus, Upload, Delete, Edit, Loading, InfoFilled, Close } from '@element-plus/icons-vue' // 引入图标
import { getUserPage, getUserManageById, updateUserManage, deleteUser, register } from '@/api/user'
import { getDictItems } from '@/api/dict'
import { uploadUserAvatar } from '@/api/file'
import ImagePreview from '@/components/common/ImagePreview.vue'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const queryForm = ref({
  pageNum: 1,
  pageSize: 8,
  username: '',
  nickname: '',
  phone: '',
  roleDictItemCode: '',
  statusDictItemCode: ''
})

const roleOptions = ref([])
const statusOptions = ref([])

const editDialogVisible = ref(false)
const editFormRef = ref(null)
const isAddMode = ref(false)
const uploadingAvatar = ref(false)
const previewVisible = ref(false)
const previewImages = ref([])
const editForm = ref({
  id: null,
  username: '',
  password: '',
  nickname: '',
  avatar: '',
  phone: '',
  signature: '',
  roleDictTypeCode: 'user_role',
  roleDictItemCode: '',
  statusDictTypeCode: 'user_status',
  statusDictItemCode: ''
})

const editFormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  roleDictItemCode: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  statusDictItemCode: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

const fetchUserList = async () => {
  loading.value = true
  try {
    const params = { ...queryForm.value }
    if (!params.username) delete params.username
    if (!params.nickname) delete params.nickname
    if (!params.phone) delete params.phone
    if (!params.roleDictItemCode) delete params.roleDictItemCode
    if (!params.statusDictItemCode) delete params.statusDictItemCode
    
    const result = await getUserPage(params)
    tableData.value = result.list || []
    total.value = result.total || 0
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryForm.value.pageNum = 1
  fetchUserList()
}

const handleReset = () => {
  queryForm.value = {
    pageNum: 1,
    pageSize: 10,
    username: '',
    nickname: '',
    phone: '',
    roleDictItemCode: '',
    statusDictItemCode: ''
  }
  fetchUserList()
}

const handleSizeChange = (val) => {
  queryForm.value.pageSize = val
  fetchUserList()
}

const handleCurrentChange = (val) => {
  queryForm.value.pageNum = val
  fetchUserList()
}

const handleEdit = async (row) => {
  isAddMode.value = false
  try {
    const user = await getUserManageById(row.id)
    editForm.value = {
      id: user.id,
      username: user.username,
      password: '', // 密码不显示
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone,
      signature: user.signature,
      roleDictTypeCode: user.roleDictTypeCode,
      roleDictItemCode: user.roleDictItemCode,
      statusDictTypeCode: user.statusDictTypeCode,
      statusDictItemCode: user.statusDictItemCode
    }
    editDialogVisible.value = true
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

const handleAdd = () => {
  isAddMode.value = true
  editForm.value = {
    id: null,
    username: '',
    password: '',
    nickname: '',
    avatar: '',
    phone: '',
    signature: '',
    roleDictTypeCode: 'user_role',
    roleDictItemCode: roleOptions.value.length > 0 ? roleOptions.value[0].value : '',
    statusDictTypeCode: 'user_status',
    statusDictItemCode: statusOptions.value.length > 0 ? statusOptions.value[0].value : ''
  }
  editDialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${row.nickname}" 吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteUser(row.id)
      ElMessage.success('删除成功')
      fetchUserList()
    } catch (error) {
      console.error('删除用户失败:', error)
    }
  }).catch(() => {})
}

const handleAvatarUpload = async (file) => {
  if (!file.raw) return

  const isImage = file.raw.type.startsWith('image/')
  if (!isImage) {
    ElMessage.warning('只能上传图片文件')
    return
  }

  const isLt10M = file.raw.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.warning('图片大小不能超过 10MB')
    return
  }

  uploadingAvatar.value = true
  try {
    const url = await uploadUserAvatar(file.raw)
    if (url) {
      editForm.value.avatar = url
      ElMessage.success('头像上传成功')
    } else {
      ElMessage.error('上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('头像上传失败')
  } finally {
    uploadingAvatar.value = false
  }
}

const handleAvatarRemove = () => {
  ElMessageBox.confirm(
    '确定要移除头像吗？',
    '移除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    editForm.value.avatar = ''
    ElMessage.success('头像已移除')
  }).catch(() => {})
}

const previewTableAvatar = (avatarUrl) => {
  if (avatarUrl) {
    previewImages.value = [avatarUrl]
    previewVisible.value = true
  }
}

const submitEdit = async () => {
  if (!editFormRef.value) return
  
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isAddMode.value) {
          // 添加用户
          const registerData = {
            username: editForm.value.username,
            password: editForm.value.password,
            nickname: editForm.value.nickname,
            phone: editForm.value.phone,
            roleDictTypeCode: editForm.value.roleDictTypeCode,
            roleDictItemCode: editForm.value.roleDictItemCode,
            statusDictTypeCode: editForm.value.statusDictTypeCode,
            statusDictItemCode: editForm.value.statusDictItemCode
          }
          if (editForm.value.avatar) {
            registerData.avatar = editForm.value.avatar
          }
          await register(registerData)
          ElMessage.success('添加成功')
        } else {
          // 更新用户
          const data = { ...editForm.value }
          delete data.id
          delete data.username // 用户名不能修改
          delete data.password // 密码为空时不更新
          if (!data.password) {
            delete data.password
          }
          await updateUserManage(editForm.value.id, data)
          ElMessage.success('更新成功')
        }
        editDialogVisible.value = false
        fetchUserList()
      } catch (error) {
        console.error('操作失败:', error)
      }
    }
  })
}

const cancelEdit = () => {
  editDialogVisible.value = false
  setTimeout(() => {
    editFormRef.value?.resetFields()
  }, 300)
}

const getRoleName = (code) => {
  const option = roleOptions.value.find(opt => opt.value === code)
  return option ? option.label : code
}

const getStatusName = (code) => {
  const option = statusOptions.value.find(opt => opt.value === code)
  return option ? option.label : code
}

const getStatusType = (code) => {
  const option = statusOptions.value.find(opt => opt.value === code)
  return option?.type || 'info'
}

const fetchDictOptions = async () => {
  try {
    const roleItems = await getDictItems('user_role')
    roleOptions.value = roleItems.map(item => ({
      label: item.itemName,
      value: item.itemCode
    }))
  } catch (error) {
    console.error('获取角色字典失败:', error)
  }

  try {
    const statusItems = await getDictItems('user_status')
    statusOptions.value = statusItems.map(item => ({
      label: item.itemName,
      value: item.itemCode,
      type: item.itemCode === 'normal' ? 'success' : 'danger'
    }))
  } catch (error) {
    console.error('获取状态字典失败:', error)
  }
}

onMounted(() => {
  fetchDictOptions()
  fetchUserList()
})
</script>

<template>
  <div class="user-manage-view">
    <!-- 顶部搜索卡片 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryForm" inline class="search-form" @keyup.enter="handleSearch">
        <el-form-item label="用户名">
          <el-input v-model="queryForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="queryForm.nickname" placeholder="请输入昵称" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="queryForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="queryForm.roleDictItemCode" placeholder="请选择角色" clearable class="w-150">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.statusDictItemCode" placeholder="请选择状态" clearable class="w-150">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="action-buttons">
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格内容卡片 -->
    <el-card class="table-card" shadow="never">
      <div class="table-toolbar">
        <span class="toolbar-title">用户列表</span>
        <!-- 这里预留了插槽，以后可以放“新增用户”、“导出”等按钮 -->
        <div class="toolbar-actions">
          <el-button type="primary" @click="handleAdd" class="add-user-btn">
            <el-icon><Plus /></el-icon> 添加用户
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        :header-cell-style="{ background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-primary)' }"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="username" label="用户名" width="120" show-overflow-tooltip />
        <el-table-column prop="nickname" label="昵称" width="120" show-overflow-tooltip />
        <el-table-column label="头像" width="80" align="center">
          <template #default="{ row }">
            <el-avatar 
              v-if="row.avatar" 
              :src="row.avatar" 
              :size="40" 
              style="cursor: pointer;" 
              @click="previewTableAvatar(row.avatar)"
            />
            <el-avatar v-else :size="40" :icon="UserFilled" style="background: var(--el-fill-color);" />
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="130" align="center" />
        <el-table-column prop="signature" label="个性签名" min-width="150" show-overflow-tooltip />
        <el-table-column label="角色" width="100" align="center">
          <template #default="{ row }">
            <el-tag effect="plain" type="info">{{ getRoleName(row.roleDictItemCode) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.statusDictItemCode)" effect="light">
              {{ getStatusName(row.statusDictItemCode) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="经验值" width="100" align="center">
          <template #default="{ row }">
            <span style="color: var(--el-color-primary); font-weight: bold;">{{ row.expPoints || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="是否大师" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isMaster === 1 ? 'warning' : 'info'" effect="dark" round>
              {{ row.isMaster === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="180" align="center" />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryForm.pageNum"
          v-model:page-size="queryForm.pageSize"
          :page-size="8"
          :total="total"
          layout="total, prev, pager, next, jumper"
          :page-sizes="[8]"
          :prev-text="'上一页'"
          :next-text="'下一页'"
          :total-text="'共 '"
          :info-text="' 条'"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑用户信息"
      width="550px"
      @close="cancelEdit"
      destroy-on-close
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="120px"
        class="edit-form"
      >
        <el-form-item v-if="isAddMode" label="用户名" prop="username">
          <el-input v-model="editForm.username" placeholder="请输入用户名" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item v-if="isAddMode" label="密码" prop="password">
          <el-input v-model="editForm.password" type="password" placeholder="请输入密码" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="editForm.nickname" placeholder="请输入昵称" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="头像">
          <div class="avatar-upload-section">
            <el-upload
              action="#"
              :auto-upload="false"
              :on-change="handleAvatarUpload"
              :disabled="uploadingAvatar"
              accept="image/*"
              class="avatar-uploader"
            >
              <div v-if="!editForm.avatar" class="upload-trigger">
                <el-icon class="upload-icon"><Upload /></el-icon>
                <span>点击上传头像</span>
                <span class="upload-hint">支持 JPG、PNG 格式，大小不超过 10MB</span>
              </div>
              <div v-else class="avatar-preview">
                <img :src="editForm.avatar" alt="头像" class="avatar-img" />
                <div class="avatar-actions">
                  <el-button type="text" @click.stop="handleAvatarRemove" class="remove-btn">
                    <el-icon><Delete /></el-icon> 移除
                  </el-button>
                </div>
              </div>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="个性签名" prop="signature">
          <el-input
            v-model="editForm.signature"
            type="textarea"
            :rows="3"
            placeholder="这个人很懒，什么都没留下..."
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="角色" prop="roleDictItemCode">
              <el-select v-model="editForm.roleDictItemCode" placeholder="请选择角色" class="w-full">
                <el-option
                  v-for="item in roleOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="statusDictItemCode">
              <el-select v-model="editForm.statusDictItemCode" placeholder="请选择状态" class="w-full">
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelEdit">取消</el-button>
          <el-button type="primary" @click="submitEdit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 图片预览组件 -->
    <ImagePreview
      v-model:visible="previewVisible"
      :images="previewImages"
      :initial-index="0"
      @close="previewVisible = false"
    />
  </div>
</template>

<style lang="scss" scoped>
.user-manage-view {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;
    
    .search-form {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      
      .el-form-item {
        margin-bottom: 0;
      }
      
      .action-buttons {
        margin-left: auto;
      }
    }
  }

  .table-card {
    .table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      
      .toolbar-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
      
      .add-user-btn {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .text-placeholder {
      color: var(--el-text-color-secondary);
      font-size: 12px;
    }
  }

  /* 头像上传样式 */
  .avatar-upload-section {
    margin-bottom: 16px;

    .avatar-uploader {
      width: 140px;
      height: 140px;
      border: 2px dashed var(--el-border-color);
      border-radius: 8px;
      position: relative;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: var(--el-color-primary);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
      }

      .upload-trigger {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--el-text-color-secondary);
        text-align: center;
        padding: 20px;

        .upload-icon {
          font-size: 32px;
          margin-bottom: 12px;
          color: var(--el-color-primary);
        }

        span {
          display: block;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .upload-hint {
          font-size: 12px;
          color: var(--el-text-color-placeholder);
          margin-top: 8px;
        }
      }

      .avatar-preview {
        position: relative;
        width: 100%;
        height: 100%;
        cursor: pointer;

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 6px;
          transition: transform 0.3s ease;

          &:hover {
            transform: scale(1.05);
          }
        }

        .avatar-actions {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
          padding: 12px;
          display: flex;
          justify-content: center;
          gap: 16px;
          opacity: 0;
          transition: opacity 0.3s ease;

          &:hover {
            opacity: 1;
          }

          .preview-btn,
          .remove-btn {
            color: #fff;
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 4px;
            transition: background-color 0.3s ease;

            &:hover {
              background-color: rgba(255, 255, 255, 0.2);
            }

            .el-icon {
              font-size: 14px;
              margin-right: 4px;
            }
          }

          .remove-btn:hover {
            color: var(--el-color-danger);
          }
        }

        &:hover .avatar-actions {
          opacity: 1;
        }
      }
    }
  }

  /* 表格头像样式 */
  :deep(.el-avatar) {
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  /* 弹窗内部样式优化 */
  .edit-form {
    padding-right: 20px; // 防止滚动条或边距太贴近右侧
    
    .w-full {
      width: 100%;
    }
  }

  /* 新增用户按钮 */
  .add-user-btn {
    font-weight: 500;
  }
}
</style>