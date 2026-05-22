import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

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
    const authStore = useAuthStore()
    const permissions = authStore.permissions || []
    const roles = authStore.roles || []
    const isAdmin = roles.some((r: any) => r.code === 'admin')

    if (isAdmin) {
      menuList.value = defaultMenus
      return
    }

    // 页面路径与对应需要的系统权限码映射
    const permMap: Record<string, string> = {
      '/system/user': 'system:user',
      '/system/role': 'system:role',
      '/system/permission': 'system:permission',
      '/system/log': 'system:log',
      '/mapconfig/layers': 'map:layer',
      '/mapconfig/markers': 'map:marker',
      '/mapconfig/bookmarks': 'map:bookmark',
    }

    const filtered = defaultMenus.map((item) => {
      const menu = { ...item }
      if (menu.children) {
        menu.children = menu.children.filter((child) => {
          const required = permMap[child.path || '']
          return !required || permissions.includes(required)
        })
      }
      return menu
    }).filter((menu) => {
      // 若一级菜单带有子树但其下所有叶子节点均无权访问，则隐藏此大类菜单
      if (menu.children && menu.children.length === 0) {
        return false
      }
      return true
    })

    menuList.value = filtered
  }

  function toggleCollapsed() {
    collapsed.value = !collapsed.value
  }

  return { collapsed, menuList, initMenus, toggleCollapsed }
})
