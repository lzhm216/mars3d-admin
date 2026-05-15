<template>
  <div>
    <a-card>
      <a-row style="margin-bottom: 16px" justify="space-between">
        <a-col><h3 style="margin: 0">权限管理</h3></a-col>
        <a-col>
          <a-button type="primary" v-permission="'system:permission:create'" @click="openForm()">
            新增权限
          </a-button>
        </a-col>
      </a-row>

      <a-table
        :columns="columns"
        :data-source="treeData"
        :loading="loading"
        row-key="id"
        :pagination="false"
        :default-expand-all-rows="true"
        :indent-size="20"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag v-if="record.type === 1" color="blue">菜单</a-tag>
            <a-tag v-else-if="record.type === 2" color="green">按钮</a-tag>
            <a-tag v-else color="orange">API</a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a v-permission="'system:permission:edit'" @click="openForm(record)">编辑</a>
              <a-popconfirm
                v-permission="'system:permission:delete'"
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

    <a-modal v-model:open="formVisible" :title="editingId ? '编辑权限' : '新增权限'" @ok="handleSubmit">
      <a-form :model="formData" :label-col="{ span: 5 }">
        <a-form-item label="父级">
          <a-tree-select
            v-model:value="formData.parentId"
            :tree-data="treeData"
            :field-names="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="顶级"
            allow-clear
            tree-default-expand-all
          />
        </a-form-item>
        <a-form-item label="名称" required>
          <a-input v-model:value="formData.name" />
        </a-form-item>
        <a-form-item label="编码" required>
          <a-input v-model:value="formData.code" placeholder="如 system:user:list" />
        </a-form-item>
        <a-form-item label="类型" required>
          <a-radio-group v-model:value="formData.type">
            <a-radio :value="1">菜单</a-radio>
            <a-radio :value="2">按钮</a-radio>
            <a-radio :value="3">API</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="路径">
          <a-input v-model:value="formData.path" placeholder="路由路径或API路径" />
        </a-form-item>
        <a-form-item label="图标">
          <a-input v-model:value="formData.icon" />
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="formData.sortOrder" :min="0" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getPermissionTree, createPermission, updatePermission, deletePermission } from '@/api/permission'

const columns = [
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '编码', dataIndex: 'code', key: 'code' },
  { title: '类型', key: 'type', width: 80 },
  { title: '路径', dataIndex: 'path', key: 'path' },
  { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 80 },
  { title: '操作', key: 'action', width: 150 },
]

const treeData = ref<any[]>([])
const loading = ref(false)
const formVisible = ref(false)
const editingId = ref<number | null>(null)
const formData = reactive({
  parentId: 0,
  name: '',
  code: '',
  type: 1 as number,
  path: '',
  icon: '',
  sortOrder: 0,
})

onMounted(() => loadData())

async function loadData() {
  loading.value = true
  try {
    const res: any = await getPermissionTree()
    treeData.value = res.data || []
  } finally {
    loading.value = false
  }
}

function openForm(record?: any) {
  editingId.value = record?.id || null
  Object.assign(formData, {
    parentId: record?.parentId || 0,
    name: record?.name || '',
    code: record?.code || '',
    type: record?.type || 1,
    path: record?.path || '',
    icon: record?.icon || '',
    sortOrder: record?.sortOrder || 0,
  })
  formVisible.value = true
}

async function handleSubmit() {
  if (editingId.value) {
    await updatePermission(editingId.value, formData)
    message.success('更新成功')
  } else {
    await createPermission(formData)
    message.success('创建成功')
  }
  formVisible.value = false
  loadData()
}

async function handleDelete(id: number) {
  await deletePermission(id)
  message.success('删除成功')
  loadData()
}
</script>
