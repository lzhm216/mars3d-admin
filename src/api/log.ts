import http from './http'

export function getLogs(params?: any) {
  return http.get('/logs', { params })
}

export function getLogStats() {
  return http.get('/logs/stats')
}
