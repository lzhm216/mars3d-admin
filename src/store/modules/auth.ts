import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, getProfile, logout as logoutApi } from '@/api/auth'
import { getToken, setToken, removeToken, setRefreshToken } from '@/utils/auth'

interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string | null
  roles: { id: number; name: string; code: string }[]
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getToken())
  const userInfo = ref<UserInfo | null>(null)
  const permissions = ref<string[]>([])
  const menus = ref<any[]>([])

  const isLoggedIn = computed(() => !!token.value)
  const roles = computed(() => userInfo.value?.roles || [])

  async function login(username: string, password: string) {
    const res: any = await loginApi({ username, password })
    const data = res.data
    token.value = data.accessToken
    setToken(data.accessToken)
    setRefreshToken(data.refreshToken)
    userInfo.value = data.user
    return data
  }

  async function fetchProfile() {
    const res: any = await getProfile()
    const data = res.data
    userInfo.value = {
      id: data.id,
      username: data.username,
      nickname: data.nickname,
      avatar: data.avatar,
      roles: data.roles,
    }
    permissions.value = data.permissions || []
    menus.value = data.menus || []
    return data
  }

  async function logout() {
    try {
      await logoutApi()
    } catch {}
    token.value = null
    userInfo.value = null
    permissions.value = []
    menus.value = []
    removeToken()
  }

  function resetState() {
    token.value = null
    userInfo.value = null
    permissions.value = []
    menus.value = []
    removeToken()
  }

  return {
    token,
    userInfo,
    permissions,
    menus,
    isLoggedIn,
    roles,
    login,
    fetchProfile,
    logout,
    resetState,
  }
})
