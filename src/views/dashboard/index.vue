<template>
  <div class="dashboard">
    <a-row :gutter="16" style="margin-bottom: 24px">
      <a-col :span="6">
        <a-card>
          <a-statistic title="用户总数" :value="stats.userCount" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="图层总数" :value="stats.layerCount" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="标记总数" :value="stats.markerCount" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="今日登录" :value="stats.todayLogins" />
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :span="12">
        <a-card title="系统信息">
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="系统名称">Mars3D 后台管理系统</a-descriptions-item>
            <a-descriptions-item label="后端框架">NestJS + TypeORM</a-descriptions-item>
            <a-descriptions-item label="前端框架">Vue 3 + Vite + Ant Design Vue</a-descriptions-item>
            <a-descriptions-item label="数据库">PostgreSQL</a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="最近操作日志">
          <a-list :data-source="recentLogs" size="small" :loading="logsLoading">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>{{ item.username }} - {{ item.action }}</template>
                  <template #description>{{ item.module }} | {{ item.url }}</template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getLogStats, getLogs } from '@/api/log'
import { getUsers } from '@/api/user'
import { getLayers } from '@/api/layer'
import { getMarkers } from '@/api/marker'

const stats = ref({ userCount: 0, layerCount: 0, markerCount: 0, todayLogins: 0 })
const recentLogs = ref<any[]>([])
const logsLoading = ref(false)

onMounted(async () => {
  try {
    const [logStats, users, layers, markers, logs] = await Promise.all([
      getLogStats(),
      getUsers({ pageSize: 1 }),
      getLayers({ pageSize: 1 }),
      getMarkers({ pageSize: 1 }),
      getLogs({ pageSize: 5 }),
    ])
    stats.value.todayLogins = (logStats as any).data?.todayLogins || 0
    stats.value.userCount = (users as any).data?.total || 0
    stats.value.layerCount = (layers as any).data?.total || 0
    stats.value.markerCount = (markers as any).data?.total || 0
    recentLogs.value = (logs as any).data?.list || []
  } catch {}
})
</script>
