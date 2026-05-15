import http from './http'

export function getMarkers(params?: any) {
  return http.get('/markers', { params })
}

export function getMarker(id: number) {
  return http.get(`/markers/${id}`)
}

export function createMarker(data: any) {
  return http.post('/markers', data)
}

export function updateMarker(id: number, data: any) {
  return http.put(`/markers/${id}`, data)
}

export function deleteMarker(id: number) {
  return http.delete(`/markers/${id}`)
}
