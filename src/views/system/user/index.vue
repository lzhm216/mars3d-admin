<template>
  <div>
    <a-card>
      <a-row style="margin-bottom: 16px" justify="space-between">
        <a-col>
          <a-space>
            <a-input-search
              v-model:value="query.keyword"
              placeholder="搜索用户名/昵称"
              style="width: 240px"
              @search="loadData"
            />
            <a-select v-model:value="query.status" placeholder="状态" allow-clear style="width: 100px" @change="loadData">
              <a-select-option :value="1">启用</a-select-option>
              <a-select-option :value="0">禁用</a-select-option>
            </a-select>
          </a-space>
        </a-col>
        <a-col>
          <a-button type="primary" v-permission="'system:user:create'" @click="openForm()">
            新增用户
          </a-button>
        </a-col>
      </a-row>

      <a-table
        :columns="columns"
        :data-source="tableData"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'green' : 'red'">
              {{ record.status === 1 ? '启用' : '禁用' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'roles'">
            <a-tag v-for="role in record.roles" :key="role.id" color="blue">{{ role.name }}</a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a v-permission="'system:user:edit'" @click="openForm(record)">编辑</a>
              <a v-permission="'system:user:edit'" @click="openRoleForm(record)">分配角色</a>
              <a v-permission="'system:user:edit'" @click="handleToggleStatus(record)">
                {{ record.status === 1 ? '禁用' : '启用' }}
              </a>
              <a-popconfirm
                v-permission="'system:user:delete'"
                title="确认删除？"
                @confirm="handleDelete(record.id)"
              >
                <a style="color: #ff4d4f">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="formVisible"
      :title="editingId ? '编辑用户' : '新增用户'"
      @ok="handleSubmit"
      :confirm-loading="submitting"
    >
      <a-form :model="formData" :label-col="{ span: 5 }">
        <a-form-item label="用户名" required>
          <a-input v-model:value="formData.username" :disabled="!!editingId" />
        </a-form-item>
        <a-form-item label="密码" :required="!editingId">
          <a-input-password v-model:value="formData.password" :placeholder="editingId ? '留空不修改' : '请输入密码'" />
        </a-form-item>
        <a-form-item label="昵称">
          <a-input v-model:value="formData.nickname" />
        </a-form-item>
        <a-form-item label="邮箱">
          <a-input v-model:value="formData.email" />
        </a-form-item>
        <a-form-item label="手机号">
          <a-input v-model:value="formData.phone" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 分配角色弹窗 -->
    <a-modal
      v-model:open="roleFormVisible"
      title="分配角色"
      @ok="handleAssignRoles"
      :confirm-loading="roleSubmitting"
    >
      <p style="margin-bottom: 12px">当前用户：<strong>{{ roleUserName }}</strong></p>
      <a-select
        v-model:value="selectedRoleIds"
        mode="multiple"
        placeholder="请选择角色"
        style="width: 100%"
        :loading="roleLoading"
      >
        <a-select-option v-for="role in allRoles" :key="role.id" :value="role.id">
          {{ role.name }}（{{ role.code }}）
        </a-select-option>
      </a-select>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getUsers, createUser, updateUser, deleteUser, toggleUserStatus, assignRoles } from '@/api/user'
import { getRoles } from '@/api/role'

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '角色', key: 'roles' },
  { title: '状态', key: 'status', width: 80 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
  { title: '操作', key: 'action', width: 240, fixed: 'right' as const },
]

const tableData = ref<any[]>([])
const loading = ref(false)
const pagination = ref({ current: 1, pageSize: 20, total: 0 })
const query = reactive({ keyword: '', status: undefined as number | undefined })

const formVisible = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const formData = reactive({
  username: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
})

// 角色分配相关
const roleFormVisible = ref(false)
const roleSubmitting = ref(false)
const roleUserId = ref<number>(0)
const roleUserName = ref('')
const roleLoading = ref(false)
const allRoles = ref<any[]>([])
const selectedRoleIds = ref<number[]>([])

onMounted(() => loadData())

async function loadData() {
  loading.value = true
  try {
    const res: any = await getUsers({
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      ...query,
    })
    tableData.value = res.data?.list || []
    pagination.value.total = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

function handleTableChange(pag: any) {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadData()
}

function openForm(record?: any) {
  editingId.value = record?.id || null
  Object.assign(formData, {
    username: record?.username || '',
    password: '',
    nickname: record?.nickname || '',
    email: record?.email || '',
    phone: record?.phone || '',
  })
  formVisible.value = true
}

async function handleSubmit() {
  submitting.value = true
  try {
    if (editingId.value) {
      const data: any = { ...formData }
      if (!data.password) delete data.password
      await updateUser(editingId.value, data)
      message.success('更新成功')
    } else {
      await createUser(formData)
      message.success('创建成功')
    }
    formVisible.value = false
    loadData()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id: number) {
  await deleteUser(id)
  message.success('删除成功')
  loadData()
}

async function handleToggleStatus(record: any) {
  await toggleUserStatus(record.id)
  message.success('操作成功')
  loadData()
}

// 打开角色分配弹窗
async function openRoleForm(record: any) {
  roleUserId.value = record.id
  roleUserName.value = record.username
  selectedRoleIds.value = (record.roles || []).map((r: any) => r.id)
  roleFormVisible.value = true

  // 加载所有角色
  roleLoading.value = true
  try {
    const res: any = await getRoles({ pageSize: 999 })
    allRoles.value = res.data?.list || []
  } finally {
    roleLoading.value = false
  }
}

// 提交角色分配
async function handleAssignRoles() {
  roleSubmitting.value = true
  try {
    await assignRoles(roleUserId.value, selectedRoleIds.value)
    message.success('角色分配成功')
    roleFormVisible.value = false
    loadData()
  } finally {
    roleSubmitting.value = false
  }
}
</script>
