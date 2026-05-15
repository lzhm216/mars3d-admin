<template>
  <div>
    <a-card>
      <a-row style="margin-bottom: 16px" justify="space-between">
        <a-col>
          <a-space>
            <a-input-search v-model:value="query.keyword" placeholder="搜索图层名称" style="width: 200px" @search="loadData" />
            <a-select v-model:value="query.type" placeholder="类型" allow-clear style="width: 140px" @change="loadData">
              <a-select-option value="wms">WMS</a-select-option>
              <a-select-option value="geojson">GeoJSON</a-select-option>
              <a-select-option value="arcgis">ArcGIS</a-select-option>
              <a-select-option value="tileset">Tileset</a-select-option>
              <a-select-option value="graphic">Graphic</a-select-option>
            </a-select>
          </a-space>
        </a-col>
        <a-col>
          <a-button type="primary" v-permission="'map:layer:create'" @click="openForm()">
            新增图层
          </a-button>
        </a-col>
      </a-row>

      <a-table :columns="columns" :data-source="tableData" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'config'">
            <a-button size="small" @click="openConfigEditor(record)">查看配置</a-button>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a v-permission="'map:layer:edit'" @click="openForm(record)">编辑</a>
              <a-popconfirm v-permission="'map:layer:delete'" title="确认删除？" @confirm="handleDelete(record.id)">
                <a style="color: #ff4d4f">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal v-model:open="formVisible" :title="editingId ? '编辑图层' : '新增图层'" @ok="handleSubmit" :width="600">
      <a-form :model="formData" :label-col="{ span: 5 }">
        <a-form-item label="名称" required>
          <a-input v-model:value="formData.name" />
        </a-form-item>
        <a-form-item label="类型" required>
          <a-select v-model:value="formData.type">
            <a-select-option value="wms">WMS</a-select-option>
            <a-select-option value="geojson">GeoJSON</a-select-option>
            <a-select-option value="arcgis">ArcGIS</a-select-option>
            <a-select-option value="tileset">Tileset</a-select-option>
            <a-select-option value="graphic">Graphic</a-select-option>
            <a-select-option value="wfs">WFS</a-select-option>
            <a-select-option value="czml">CZML</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="URL">
          <a-input v-model:value="formData.url" />
        </a-form-item>
        <a-form-item label="分组ID">
          <a-input-number v-model:value="formData.groupId" :min="0" />
        </a-form-item>
        <a-form-item label="分组名称">
          <a-input v-model:value="formData.groupName" />
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="formData.sortOrder" :min="0" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- JSON 配置编辑器弹窗 -->
    <a-modal v-model:open="configVisible" title="图层 JSON 配置" @ok="handleConfigSave" :width="800">
      <a-textarea v-model:value="configJson" :rows="18" style="font-family: monospace" />
      <div v-if="configError" style="color: #ff4d4f; margin-top: 8px">{{ configError }}</div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getLayers, createLayer, updateLayer, deleteLayer } from '@/api/layer'

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '分组', dataIndex: 'groupName', key: 'groupName', width: 100 },
  { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 80 },
  { title: '配置', key: 'config', width: 120 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' as const },
]

const tableData = ref<any[]>([])
const loading = ref(false)
const pagination = ref({ current: 1, pageSize: 20, total: 0 })
const query = reactive({ keyword: '', type: undefined })

const formVisible = ref(false)
const editingId = ref<number | null>(null)
const formData = reactive({ name: '', type: 'wms', url: '', groupId: 0, groupName: '', sortOrder: 0 })

const configVisible = ref(false)
const configJson = ref('')
const configError = ref('')
const configLayerId = ref(0)

onMounted(() => loadData())

async function loadData() {
  loading.value = true
  try {
    const res: any = await getLayers({ page: pagination.value.current, pageSize: pagination.value.pageSize, ...query })
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
    name: record?.name || '',
    type: record?.type || 'wms',
    url: record?.url || '',
    groupId: record?.groupId || 0,
    groupName: record?.groupName || '',
    sortOrder: record?.sortOrder || 0,
  })
  formVisible.value = true
}

async function handleSubmit() {
  if (editingId.value) {
    await updateLayer(editingId.value, formData)
    message.success('更新成功')
  } else {
    await createLayer(formData)
    message.success('创建成功')
  }
  formVisible.value = false
  loadData()
}

async function handleDelete(id: number) {
  await deleteLayer(id)
  message.success('删除成功')
  loadData()
}

function openConfigEditor(record: any) {
  configLayerId.value = record.id
  configJson.value = JSON.stringify(record.config || {}, null, 2)
  configError.value = ''
  configVisible.value = true
}

async function handleConfigSave() {
  try {
    const parsed = JSON.parse(configJson.value)
    configError.value = ''
    await updateLayer(configLayerId.value, { config: parsed })
    message.success('配置保存成功')
    configVisible.value = false
    loadData()
  } catch (e: any) {
    configError.value = 'JSON 格式错误: ' + e.message
  }
}
</script>
