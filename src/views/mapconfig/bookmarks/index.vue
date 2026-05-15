<template>
  <div>
    <a-card>
      <a-table :columns="columns" :data-source="tableData" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'view'">
            <a-tooltip>
              <template #title>
                <pre style="max-width: 400px; max-height: 200px; overflow: auto">{{ JSON.stringify(record.view, null, 2) }}</pre>
              </template>
              <a-button size="small">查看视角</a-button>
            </a-tooltip>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/api/http'

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '视角配置', key: 'view', width: 120 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
]

const tableData = ref<any[]>([])
const loading = ref(false)
const pagination = ref({ current: 1, pageSize: 20, total: 0 })

onMounted(() => loadData())

async function loadData() {
  loading.value = true
  try {
    const res: any = await http.get('/bookmarks', { params: { page: pagination.value.current, pageSize: pagination.value.pageSize } })
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
</script>
