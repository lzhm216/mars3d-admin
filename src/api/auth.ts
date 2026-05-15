import http from './http'

export function login(data: { username: string; password: string }) {
  return http.post('/auth/login', data)
}

export function logout() {
  return http.post('/auth/logout')
}

export function refreshToken(refreshToken: string) {
  return http.post('/auth/refresh', { refreshToken })
}

export function getProfile() {
  return http.get('/auth/profile')
}

export function changePassword(data: { oldPassword: string; newPassword: string }) {
  return http.put('/auth/password', data)
}
