import http from './http'

export function getPermissionTree() {
  return http.get('/permissions/tree')
}

export function getPermissions() {
  return http.get('/permissions')
}

export function createPermission(data: any) {
  return http.post('/permissions', data)
}

export function updatePermission(id: number, data: any) {
  return http.put(`/permissions/${id}`, data)
}

export function deletePermission(id: number) {
  return http.delete(`/permissions/${id}`)
}
