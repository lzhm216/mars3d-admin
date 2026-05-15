<template>
  <div>
    <a-card>
      <a-row style="margin-bottom: 16px" :gutter="16">
        <a-col :span="4">
          <a-input v-model:value="query.username" placeholder="用户名" allow-clear @change="loadData" />
        </a-col>
        <a-col :span="4">
          <a-select v-model:value="query.module" placeholder="模块" allow-clear style="width: 100%" @change="loadData">
            <a-select-option value="user">用户</a-select-option>
            <a-select-option value="role">角色</a-select-option>
            <a-select-option value="permission">权限</a-select-option>
            <a-select-option value="layer">图层</a-select-option>
            <a-select-option value="marker">标记</a-select-option>
            <a-select-option value="auth">认证</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="4">
          <a-select v-model:value="query.action" placeholder="操作" allow-clear style="width: 100%" @change="loadData">
            <a-select-option value="create">创建</a-select-option>
            <a-select-option value="update">更新</a-select-option>
            <a-select-option value="delete">删除</a-select-option>
            <a-select-option value="login">登录</a-select-option>
          </a-select>
        </a-col>
        <a-col :span="8">
          <a-range-picker v-model:value="dateRange" style="width: 100%" @change="onDateChange" />
        </a-col>
      </a-row>

      <a-table :columns="columns" :data-source="tableData" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'method'">
            <a-tag :color="methodColor(record.method)">{{ record.method }}</a-tag>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getLogs } from '@/api/log'
import dayjs from 'dayjs'

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '用户', dataIndex: 'username', key: 'username' },
  { title: '模块', dataIndex: 'module', key: 'module' },
  { title: '操作', dataIndex: 'action', key: 'action' },
  { title: '方法', key: 'method', width: 80 },
  { title: 'URL', dataIndex: 'url', key: 'url', ellipsis: true },
  { title: 'IP', dataIndex: 'ip', key: 'ip' },
  { title: '耗时', dataIndex: 'duration', key: 'duration', width: 80 },
  { title: '时间', dataIndex: 'createdAt', key: 'createdAt' },
]

const tableData = ref<any[]>([])
const loading = ref(false)
const pagination = ref({ current: 1, pageSize: 20, total: 0 })
const query = reactive({ username: '', module: undefined, action: undefined, startTime: '', endTime: '' })
const dateRange = ref<any>(null)

onMounted(() => loadData())

async function loadData() {
  loading.value = true
  try {
    const res: any = await getLogs({ page: pagination.value.current, pageSize: pagination.value.pageSize, ...query })
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

function onDateChange(dates: any) {
  if (dates) {
    query.startTime = dayjs(dates[0]).format('YYYY-MM-DD 00:00:00')
    query.endTime = dayjs(dates[1]).format('YYYY-MM-DD 23:59:59')
  } else {
    query.startTime = ''
    query.endTime = ''
  }
  loadData()
}

function methodColor(method: string) {
  const map: Record<string, string> = { POST: 'green', PUT: 'blue', DELETE: 'red', GET: 'cyan' }
  return map[method] || 'default'
}
</script>
