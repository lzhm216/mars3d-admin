<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="menuStore.collapsed" collapsible :width="220">
      <div class="logo">
        <h2 v-if="!menuStore.collapsed">Mars3D Admin</h2>
        <h2 v-else>M3D</h2>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        theme="dark"
        @click="handleMenuClick"
      >
        <template v-for="item in menuStore.menuList" :key="item.key">
          <a-sub-menu v-if="item.children?.length" :key="item.key">
            <template #title>
              <span>{{ item.label }}</span>
            </template>
            <a-menu-item v-for="child in item.children" :key="child.key">
              {{ child.label }}
            </a-menu-item>
          </a-sub-menu>
          <a-menu-item v-else :key="item.key">
            {{ item.label }}
          </a-menu-item>
        </template>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <a-layout-header class="header">
        <div class="header-left">
          <MenuFoldOutlined
            v-if="!menuStore.collapsed"
            class="trigger"
            @click="menuStore.toggleCollapsed"
          />
          <MenuUnfoldOutlined v-else class="trigger" @click="menuStore.toggleCollapsed" />
          <a-breadcrumb style="margin-left: 16px">
            <a-breadcrumb-item>首页</a-breadcrumb-item>
            <a-breadcrumb-item v-if="$route.meta.title">{{ $route.meta.title }}</a-breadcrumb-item>
          </a-breadcrumb>
        </div>
        <div class="header-right">
          <a-dropdown>
            <span class="user-info">
              <UserOutlined />
              <span style="margin-left: 8px">{{ authStore.userInfo?.nickname || authStore.userInfo?.username }}</span>
            </span>
            <template #overlay>
              <a-menu @click="handleUserMenu">
                <a-menu-item key="profile">
                  <UserOutlined /> 个人信息
                </a-menu-item>
                <a-menu-item key="password">
                  <LockOutlined /> 修改密码
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout">
                  <LogoutOutlined /> 退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Modal, message } from 'ant-design-vue'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LockOutlined,
  LogoutOutlined,
} from '@ant-design/icons-vue'
import { useAuthStore } from '@/store/modules/auth'
import { useMenuStore } from '@/store/modules/menu'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const menuStore = useMenuStore()

const selectedKeys = ref<string[]>([route.path])
const openKeys = ref<string[]>([])

watch(
  () => route.path,
  (path) => {
    selectedKeys.value = [path]
    // 自动展开父菜单
    const parts = path.split('/')
    if (parts.length > 2) {
      openKeys.value = ['/' + parts[1]]
    }
  },
  { immediate: true }
)

function handleMenuClick({ key }: { key: string }) {
  router.push(key)
}

function handleUserMenu({ key }: { key: string }) {
  switch (key) {
    case 'profile':
      router.push('/profile')
      break
    case 'password':
      // TODO: 打开修改密码弹窗
      message.info('修改密码功能开发中')
      break
    case 'logout':
      Modal.confirm({
        title: '确认退出',
        content: '确定要退出登录吗？',
        onOk: async () => {
          await authStore.logout()
          router.push('/login')
        },
      })
      break
  }
}
</script>

<style scoped>
.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.logo h2 {
  color: #fff;
  margin: 0;
  font-size: 18px;
}
.header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.header-left {
  display: flex;
  align-items: center;
}
.header-right {
  display: flex;
  align-items: center;
}
.trigger {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
}
.trigger:hover {
  color: #1890ff;
}
.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
}
.content {
  margin: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 4px;
  min-height: 280px;
}
</style>
