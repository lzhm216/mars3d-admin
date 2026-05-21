<template>
  <div>
    <a-card>
      <a-row style="margin-bottom: 16px" justify="space-between">
        <a-col>
          <a-input-search
            v-model:value="query.keyword"
            placeholder="搜索角色名称/编码"
            style="width: 240px"
            @search="loadData"
          />
        </a-col>
        <a-col>
          <a-button type="primary" v-permission="'system:role:create'" @click="openForm()">
            新增角色
          </a-button>
        </a-col>
      </a-row>

      <a-table :columns="columns" :data-source="tableData" :loading="loading" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'permissions'">
            <a-tag color="blue">{{ record.permissions?.length || 0 }} 个权限</a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a v-permission="'system:role:edit'" @click="openForm(record)">编辑</a>
              <a v-permission="'system:role:edit'" @click="openPermModal(record)">分配权限</a>
              <a v-permission="'system:role:edit'" @click="openLayerPermModal(record)">分配图层</a>
              <a-popconfirm
                v-permission="'system:role:delete'"
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
    <a-modal v-model:open="formVisible" :title="editingId ? '编辑角色' : '新增角色'" @ok="handleSubmit">
      <a-form :model="formData" :label-col="{ span: 5 }">
        <a-form-item label="角色名称" required>
          <a-input v-model:value="formData.name" />
        </a-form-item>
        <a-form-item label="角色编码" required>
          <a-input v-model:value="formData.code" :disabled="!!editingId" />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="formData.description" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 权限分配弹窗 -->
    <a-modal v-model:open="permVisible" title="分配权限" @ok="handlePermSubmit" :width="500">
      <a-tree
        v-if="permTree.length"
        v-model:checkedKeys="checkedPermIds"
        :tree-data="permTree"
        checkable
        :field-names="{ key: 'id', title: 'name', children: 'children' }"
        :default-expand-all="true"
      />
    </a-modal>

    <!-- 图层权限分配弹窗 -->
    <a-modal v-model:open="layerPermVisible" title="分配图层权限" @ok="handleLayerPermSubmit" :width="500">
      <a-spin :spinning="layerLoading">
        <a-tree
          v-if="layerTree.length"
          v-model:checkedKeys="checkedLayerIds"
          :tree-data="layerTree"
          checkable
          :field-names="{ key: 'id', title: 'name', children: 'children' }"
          :default-expand-all="true"
        />
        <div v-else style="text-align: center; color: #999; padding: 20px 0;">暂无图层数据</div>
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getRoles, createRole, updateRole, deleteRole, assignPermissions, assignLayers, getRoleLayers } from '@/api/role'
import { getLayers } from '@/api/layer'
import { getPermissionTree } from '@/api/permission'

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '角色名称', dataIndex: 'name', key: 'name' },
  { title: '角色编码', dataIndex: 'code', key: 'code' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '权限', key: 'permissions' },
  { title: '操作', key: 'action', width: 220, fixed: 'right' as const },
]

const tableData = ref<any[]>([])
const loading = ref(false)
const query = reactive({ keyword: '' })
const formVisible = ref(false)
const editingId = ref<number | null>(null)
const formData = reactive({ name: '', code: '', description: '' })

const permVisible = ref(false)
const permTree = ref<any[]>([])
const checkedPermIds = ref<number[]>([])
const currentRoleId = ref<number>(0)

const layerPermVisible = ref(false)
const layerLoading = ref(false)
const layerTree = ref<any[]>([])
const checkedLayerIds = ref<number[]>([])

onMounted(() => loadData())

async function loadData() {
  loading.value = true
  try {
    const res: any = await getRoles({ pageSize: 100, ...query })
    tableData.value = res.data?.list || []
  } finally {
    loading.value = false
  }
}

function openForm(record?: any) {
  editingId.value = record?.id || null
  Object.assign(formData, {
    name: record?.name || '',
    code: record?.code || '',
    description: record?.description || '',
  })
  formVisible.value = true
}

async function handleSubmit() {
  if (editingId.value) {
    await updateRole(editingId.value, formData)
    message.success('更新成功')
  } else {
    await createRole(formData)
    message.success('创建成功')
  }
  formVisible.value = false
  loadData()
}

async function handleDelete(id: number) {
  await deleteRole(id)
  message.success('删除成功')
  loadData()
}

async function openPermModal(record: any) {
  currentRoleId.value = record.id
  checkedPermIds.value = (record.permissions || []).map((p: any) => p.id)
  const res: any = await getPermissionTree()
  permTree.value = res.data || []
  permVisible.value = true
}

async function handlePermSubmit() {
  await assignPermissions(currentRoleId.value, checkedPermIds.value)
  message.success('权限分配成功')
  permVisible.value = false
  loadData()
}

async function openLayerPermModal(record: any) {
  currentRoleId.value = record.id
  layerLoading.value = true
  layerPermVisible.value = true
  checkedLayerIds.value = []
  try {
    // 1. 获取所有图层并构建前端树结构
    const resLayers: any = await getLayers({ page: 1, pageSize: 9999 })
    const allLayers = resLayers.data?.list || []
    layerTree.value = buildTreeData(allLayers)

    // 2. 获取该角色已经绑定的图层权限列表
    const resRoleLayers: any = await getRoleLayers(record.id)
    const roleLayers = resRoleLayers.data || []
    // 过滤出有 read 权限的图层 ID 作为选中项
    checkedLayerIds.value = roleLayers.filter((rl: any) => rl.canRead).map((rl: any) => rl.layerId)
  } catch (e) {
    message.error('加载图层数据失败')
  } finally {
    layerLoading.value = false
  }
}

function buildTreeData(list: any[]): any[] {
  const map = new Map<number, any>()
  const roots: any[] = []

  list.forEach(item => {
    map.set(item.id, { ...item, key: item.id, children: [] })
  })

  list.forEach(item => {
    const mapped = map.get(item.id)
    if (item.pid && map.has(item.pid)) {
      map.get(item.pid).children.push(mapped)
    } else {
      roots.push(mapped)
    }
  })

  return roots
}

async function handleLayerPermSubmit() {
  layerLoading.value = true
  try {
    const layersPayload = checkedLayerIds.value.map(id => ({
      layerId: id,
      canRead: true,
      canEdit: true
    }))

    await assignLayers(currentRoleId.value, layersPayload)
    message.success('图层权限分配成功')
    layerPermVisible.value = false
    loadData()
  } catch (e) {
    message.error('保存图层权限失败')
  } finally {
    layerLoading.value = false
  }
}
</script>
