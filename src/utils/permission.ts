import { useAuthStore } from '@/store/modules/auth'

export function hasPermission(code: string | string[]): boolean {
  const authStore = useAuthStore()
  const perms = Array.isArray(code) ? code : [code]

  // admin 角色拥有全部权限
  if (authStore.roles.some((r) => r.code === 'admin')) {
    return true
  }

  return perms.some((p) => authStore.permissions.includes(p))
}
