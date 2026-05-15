<template>
  <div>
    <a-card title="个人信息">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="用户名">{{ authStore.userInfo?.username }}</a-descriptions-item>
        <a-descriptions-item label="昵称">{{ authStore.userInfo?.nickname }}</a-descriptions-item>
        <a-descriptions-item label="角色">
          <a-tag v-for="role in authStore.roles" :key="role.id" color="blue">{{ role.name }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="权限数">{{ authStore.permissions.length }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/modules/auth'
const authStore = useAuthStore()
</script>
