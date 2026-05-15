import http from './http'

export function getUsers(params?: any) {
  return http.get('/users', { params })
}

export function getUser(id: number) {
  return http.get(`/users/${id}`)
}

export function createUser(data: any) {
  return http.post('/users', data)
}

export function updateUser(id: number, data: any) {
  return http.put(`/users/${id}`, data)
}

export function deleteUser(id: number) {
  return http.delete(`/users/${id}`)
}

export function toggleUserStatus(id: number) {
  return http.put(`/users/${id}/status`)
}

export function assignRoles(userId: number, roleIds: number[]) {
  return http.post(`/users/${userId}/roles`, { roleIds })
}
