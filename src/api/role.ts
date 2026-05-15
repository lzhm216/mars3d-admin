import http from './http'

export function getRoles(params?: any) {
  return http.get('/roles', { params })
}

export function getRole(id: number) {
  return http.get(`/roles/${id}`)
}

export function createRole(data: any) {
  return http.post('/roles', data)
}

export function updateRole(id: number, data: any) {
  return http.put(`/roles/${id}`, data)
}

export function deleteRole(id: number) {
  return http.delete(`/roles/${id}`)
}

export function assignPermissions(roleId: number, permissionIds: number[]) {
  return http.put(`/roles/${roleId}/permissions`, { permissionIds })
}

export function assignLayers(roleId: number, layers: any[]) {
  return http.put(`/roles/${roleId}/layers`, { layers })
}

export function getRoleLayers(roleId: number) {
  return http.get(`/roles/${roleId}/layers`)
}
