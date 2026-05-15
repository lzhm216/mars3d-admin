import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface MenuItem {
  key: string
  label: string
  icon?: string
  path?: string
  children?: MenuItem[]
}

export const useMenuStore = defineStore('menu', () => {
  const collapsed = ref(false)
  const menuList = ref<MenuItem[]>([])

  // 静态菜单（当后端菜单不可用时的降级方案）
  const defaultMenus: MenuItem[] = [
    {
      key: '/dashboard',
      label: '首页',
      path: '/dashboard',
    },
    {
      key: '/system',
      label: '系统管理',
      children: [
        { key: '/system/user', label: '用户管理', path: '/system/user' },
        { key: '/system/role', label: '角色管理', path: '/system/role' },
        { key: '/system/permission', label: '权限管理', path: '/system/permission' },
        { key: '/system/log', label: '日志管理', path: '/system/log' },
      ],
    },
    {
      key: '/mapconfig',
      label: '地图配置',
      children: [
        { key: '/mapconfig/layers', label: '图层管理', path: '/mapconfig/layers' },
        { key: '/mapconfig/markers', label: '标记管理', path: '/mapconfig/markers' },
        { key: '/mapconfig/bookmarks', label: '书签管理', path: '/mapconfig/bookmarks' },
      ],
    },
  ]

  function initMenus() {
    menuList.value = defaultMenus
  }

  function toggleCollapsed() {
    collapsed.value = !collapsed.value
  }

  return { collapsed, menuList, initMenus, toggleCollapsed }
})
