<template>
  <div>
    <a-card>
      <a-row style="margin-bottom: 16px" :gutter="16">
        <a-col :span="4">
          <a-select v-model:value="query.type" placeholder="类型" allow-clear style="width: 100%" @change="loadData">
            <a-select-option value="point">点</a-select-option>
            <a-select-option value="polyline">线</a-select-option>
            <a-select-option value="polygon">面</a-select-option>
            <a-select-option value="label">标注</a-select-option>
          </a-select>
        </a-col>
      </a-row>

      <a-table :columns="columns" :data-source="tableData" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag>{{ record.type }}</a-tag>
          </template>
          <template v-if="column.key === 'geometry'">
            <a-tooltip>
              <template #title>
                <pre style="max-width: 400px; max-height: 200px; overflow: auto">{{ JSON.stringify(record.geometry, null, 2) }}</pre>
              </template>
              <a-button size="small">查看 GeoJSON</a-button>
            </a-tooltip>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-popconfirm v-permission="'map:marker:delete'" title="确认删除？" @confirm="handleDelete(record.id)">
                <a style="color: #ff4d4f">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getMarkers, deleteMarker } from '@/api/marker'

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '类型', key: 'type', width: 80 },
  { title: '几何数据', key: 'geometry', width: 130 },
  { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
  { title: '操作', key: 'action', width: 100 },
]

const tableData = ref<any[]>([])
const loading = ref(false)
const pagination = ref({ current: 1, pageSize: 20, total: 0 })
const query = reactive({ type: undefined })

onMounted(() => loadData())

async function loadData() {
  loading.value = true
  try {
    const res: any = await getMarkers({ page: pagination.value.current, pageSize: pagination.value.pageSize, ...query })
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

async function handleDelete(id: number) {
  await deleteMarker(id)
  message.success('删除成功')
  loadData()
}
</script>
