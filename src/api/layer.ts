import http from './http'

export function getLayers(params?: any) {
  return http.get('/map-layers', { params })
}

export function getLayer(id: number) {
  return http.get(`/map-layers/${id}`)
}

export function createLayer(data: any) {
  return http.post('/map-layers', data)
}

export function updateLayer(id: number, data: any) {
  return http.put(`/map-layers/${id}`, data)
}

export function deleteLayer(id: number) {
  return http.delete(`/map-layers/${id}`)
}

export function exportLayerConfig() {
  return http.get('/map-layers/config/export')
}

export function getLayerGroups() {
  return http.get('/map-layers/groups')
}
