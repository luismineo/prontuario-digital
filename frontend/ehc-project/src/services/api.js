import axios from 'axios'

const api = axios.create({
  baseURL: 'api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

export default {
  getStudents() {
    return api.get(`/students/`)
  },

  getStudent(uuid) {
    return api.get(`/students/${uuid}/`)
  },

  createStudent(student) {
    return api.post(`/students/`, student)
  },

  updateStudent(uuid, student) {
    return api.put(`/students/${uuid}/`, student)
  },

  deleteStudent(uuid) {
    return api.delete(`/students/${uuid}/`)
  },

  getInactiveStudents() {
    return api.get(`/students/inactive/`)
  },

  restoreStudent(uuid) {
    return api.put(`students/${uuid}/restore/`)
  },
}
