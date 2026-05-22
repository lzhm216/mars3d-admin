import { createRouter, createWebHistory } from 'vue-router'
import { message } from 'ant-design-vue'
import { getToken } from '@/utils/auth'
import { useAuthStore } from '@/store/modules/auth'
import { useMenuStore } from '@/store/modules/menu'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/index.vue'),
      meta: { hidden: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/BasicLayout.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/dashboard/index.vue'),
          meta: { title: '首页' },
        },
        // 系统管理
        {
          path: 'system/user',
          name: 'SystemUser',
          component: () => import('@/views/system/user/index.vue'),
          meta: { title: '用户管理', permission: 'system:user' },
        },
        {
          path: 'system/role',
          name: 'SystemRole',
          component: () => import('@/views/system/role/index.vue'),
          meta: { title: '角色管理', permission: 'system:role' },
        },
        {
          path: 'system/permission',
          name: 'SystemPermission',
          component: () => import('@/views/system/permission/index.vue'),
          meta: { title: '权限管理', permission: 'system:permission' },
        },
        {
          path: 'system/log',
          name: 'SystemLog',
          component: () => import('@/views/system/log/index.vue'),
          meta: { title: '日志管理', permission: 'system:log' },
        },
        // 地图配置
        {
          path: 'mapconfig/layers',
          name: 'MapLayers',
          component: () => import('@/views/mapconfig/layers/index.vue'),
          meta: { title: '图层管理', permission: 'map:layer' },
        },
        {
          path: 'mapconfig/markers',
          name: 'MapMarkers',
          component: () => import('@/views/mapconfig/markers/index.vue'),
          meta: { title: '标记管理', permission: 'map:marker' },
        },
        {
          path: 'mapconfig/bookmarks',
          name: 'MapBookmarks',
          component: () => import('@/views/mapconfig/bookmarks/index.vue'),
          meta: { title: '书签管理', permission: 'map:bookmark' },
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('@/views/profile/index.vue'),
          meta: { title: '个人信息', hidden: true },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard',
    },
  ],
})

// 路由守卫
const whiteList = ['/login']

// 权限判定函数
function checkRoutePermission(to: any, authStore: any): boolean {
  if (!to.meta || !to.meta.permission) {
    return true
  }
  const requiredPermission = to.meta.permission as string
  const permissions = authStore.permissions || []
  const roles = authStore.userInfo?.roles || []

  // 超管直接放行
  if (roles.some((r: any) => r.code === 'admin')) {
    return true
  }

  if (!permissions.includes(requiredPermission)) {
    message.warning('您没有权限访问该页面')
    return false
  }
  return true
}

router.beforeEach(async (to, _from, next) => {
  const token = getToken()

  if (token) {
    if (to.path === '/login') {
      next('/dashboard')
      return
    }

    const authStore = useAuthStore()
    if (!authStore.userInfo) {
      try {
        await authStore.fetchProfile()
        const menuStore = useMenuStore()
        menuStore.initMenus()
        
        // 校验目标页面权限
        if (!checkRoutePermission(to, authStore)) {
          next('/dashboard')
          return
        }
        
        next({ ...to, replace: true })
      } catch {
        authStore.resetState()
        next(`/login?redirect=${to.path}`)
      }
    } else {
      // 校验目标页面权限
      if (!checkRoutePermission(to, authStore)) {
        next('/dashboard')
        return
      }
      next()
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})

export default router
