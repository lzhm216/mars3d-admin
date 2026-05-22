<template>
  <div>
    <a-card>
      <a-row style="margin-bottom: 16px" justify="space-between">
        <a-col>
          <a-space>
            <a-input-search v-model:value="query.keyword" placeholder="搜索图层名称" style="width: 200px" @search="loadData" />
            <a-select v-model:value="query.type" placeholder="类型" allow-clear style="width: 140px" @change="loadData">
              <a-select-option v-for="item in LAYER_TYPES" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-select-option>
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
          <template v-if="column.key === 'category'">
            <a-tag :color="record.category === 'terrain' ? 'purple' : record.category === 'basemap' ? 'blue' : 'green'">
              {{ record.category === 'terrain' ? '地形服务' : record.category === 'basemap' ? '底图服务' : '专题图层' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'show'">
            <a-tag :color="record.show ? 'success' : 'default'">
              {{ record.show ? '是' : '否' }}
            </a-tag>
          </template>
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
        <a-form-item label="分类" required>
          <a-select v-model:value="formData.category">
            <a-select-option value="terrain">地形数据</a-select-option>
            <a-select-option value="basemap">地图底图</a-select-option>
            <a-select-option value="layer">专题图层</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="类型" required>
          <a-select v-model:value="formData.type">
            <a-select-option v-for="item in LAYER_TYPES" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="URL">
          <a-input v-model:value="formData.url" />
        </a-form-item>
        <a-form-item label="父级ID">
          <a-input-number v-model:value="formData.pid" style="width: 100%" placeholder="不选代表无父图层" />
        </a-form-item>
        <a-form-item label="所属大组">
          <a-select v-model:value="formData.groupId" placeholder="请选择大分组" allow-clear>
            <a-select-option v-for="g in groupList" :key="g.id" :value="g.id">{{ g.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="默认加载">
          <a-switch v-model:checked="formData.show" />
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="formData.sortOrder" :min="0" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- JSON 配置编辑器弹窗 -->
    <a-modal v-model:open="configVisible" title="图层 JSON 配置" @ok="handleConfigSave" :width="800" :ok-button-props="{ disabled: !!configError }">
      <div style="margin-bottom: 8px;">
        <a-space>
          <a-button size="small" type="primary" ghost @click="formatJson">格式化 JSON</a-button>
          <a-button size="small" @click="minifyJson">压缩 JSON</a-button>
        </a-space>
      </div>
      <a-textarea v-model:value="configJson" :rows="18" style="font-family: monospace; background-color: #fafafa;" />
      <div v-if="configError" style="color: #ff4d4f; margin-top: 8px; white-space: pre-wrap;">{{ configError }}</div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { getLayers, createLayer, updateLayer, deleteLayer, getLayerGroups } from '@/api/layer'

const LAYER_TYPES = [
  { value: 'terrain', label: 'Terrain (地形)' },
  { value: 'wms', label: 'WMS' },
  { value: 'geojson', label: 'GeoJSON' },
  { value: 'arcgis', label: 'ArcGIS' },
  { value: 'tileset', label: 'Tileset (3D Tiles)' },
  { value: 'graphic', label: 'Graphic (标绘)' },
  { value: 'wfs', label: 'WFS' },
  { value: 'czml', label: 'CZML' },
  { value: 'group', label: 'Group (组)' },
  { value: 'xyz', label: 'XYZ 瓦片' },
  { value: 'wmts', label: 'WMTS' },
  { value: 'tdt', label: '天地图' }
]

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '分类', key: 'category', width: 100 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '父级ID', dataIndex: 'pid', key: 'pid', width: 80 },
  { title: '默认加载', key: 'show', width: 100 },
  { title: '分组', dataIndex: 'groupName', key: 'groupName', width: 100 },
  { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 80 },
  { title: '配置', key: 'config', width: 120 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' as const },
]

const tableData = ref<any[]>([])
const groupList = ref<any[]>([])
const loading = ref(false)
const pagination = ref({ current: 1, pageSize: 20, total: 0 })
const query = reactive({ keyword: '', type: undefined })

const formVisible = ref(false)
const editingId = ref<number | null>(null)
const formData = reactive({
  name: '',
  category: 'layer',
  type: 'wms',
  url: '',
  pid: undefined as number | undefined,
  groupId: undefined as number | undefined,
  show: false,
  sortOrder: 0
})

const configVisible = ref(false)
const configJson = ref('')
const configError = ref('')
const configLayerId = ref(0)

onMounted(async () => {
  loadData()
  try {
    const res: any = await getLayerGroups()
    groupList.value = res.data || []
  } catch (e) {
    console.error('获取图层分组列表失败:', e)
  }
})

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
    category: record?.category || 'layer',
    type: record?.type || 'wms',
    url: record?.url || '',
    pid: record?.pid || undefined,
    groupId: record?.groupId || undefined,
    show: record?.show ?? false,
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

watch(configJson, (val) => {
  if (!val.trim()) {
    configError.value = ''
    return
  }
  try {
    JSON.parse(val)
    configError.value = ''
  } catch (e: any) {
    configError.value = 'JSON 格式错误: ' + e.message
  }
})

function formatJson() {
  try {
    const parsed = JSON.parse(configJson.value)
    configJson.value = JSON.stringify(parsed, null, 2)
    configError.value = ''
  } catch (e: any) {
    configError.value = '格式化失败: ' + e.message
  }
}

function minifyJson() {
  try {
    const parsed = JSON.parse(configJson.value)
    configJson.value = JSON.stringify(parsed)
    configError.value = ''
  } catch (e: any) {
    configError.value = '压缩失败: ' + e.message
  }
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
