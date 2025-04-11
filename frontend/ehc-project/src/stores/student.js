import { defineStore } from 'pinia'
import api from '@/services/api'

export const useStudentStore = defineStore('student', {
  state: () => ({
    students: [],
    inactiveStudents: [],
    loading: false,
    error: null,
    alert: {
      message: null,
      type: null,
      show: false,
    },
  }),

  actions: {
    // Métodos para gerenciar alertas
    setAlert(message, type = 'info') {
      this.alert = { message, type, show: true }
      setTimeout(() => {
        this.clearAlert()
      }, 5000)
    },

    clearAlert() {
      this.alert = { message: null, type: null, show: false }
    },

    // Formatação de dados
    formatStudentData(student) {
      return {
        ...student,
        dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
      }
    },

    // CRUD operations
    async fetchStudents() {
      this.loading = true
      try {
        const response = await api.getStudents()
        this.students = response.data
      } catch (error) {
        this.error = error.response?.data?.detail || error.message
        this.setAlert(`Erro ao carregar alunos: ${this.error}`, 'danger')
      } finally {
        this.loading = false
      }
    },

    async fetchInactiveStudents() {
      this.loading = true
      try {
        const response = await api.getInactiveStudents()
        this.inactiveStudents = response.data
      } catch (error) {
        this.error = error.response?.data?.detail || error.message
        this.setAlert(`Erro ao carregar alunos inativos: ${this.error}`, 'danger')
      } finally {
        this.loading = false
      }
    },

    async getStudent(id) {
      this.loading = true
      try {
        const response = await api.getStudent(id)
        return this.formatStudentData(response.data)
      } catch (error) {
        this.error = error.response?.data?.detail || error.message
        this.setAlert(`Erro ao buscar aluno: ${this.error}`, 'danger')
        return null
      } finally {
        this.loading = false
      }
    },

    async createStudent(studentData) {
      this.loading = true
      try {
        const response = await api.createStudent(studentData)
        this.students.push(response.data)
        this.setAlert('Aluno cadastrado com sucesso!', 'success')
        return response.data
      } catch (error) {
        this.error = error.response?.data || error.message
        this.setAlert(`Erro ao cadastrar aluno: ${JSON.stringify(this.error)}`, 'danger')
        return null
      } finally {
        this.loading = false
      }
    },

    async updateStudent(id, studentData) {
      this.loading = true
      try {
        const response = await api.updateStudent(id, studentData)
        const index = this.students.findIndex((s) => s.id === id)
        if (index !== -1) {
          this.students[index] = response.data
        }
        this.setAlert('Aluno atualizado com sucesso!', 'success')
        return response.data
      } catch (error) {
        this.error = error.response?.data || error.message
        this.setAlert(`Erro ao atualizar aluno: ${JSON.stringify(this.error)}`, 'danger')
        return null
      } finally {
        this.loading = false
      }
    },

    async deleteStudent(id) {
      this.loading = true
      try {
        await api.deleteStudent(id)
        this.students = this.students.filter((s) => s.id !== id)
        this.setAlert('Aluno removido com sucesso!', 'success')
        return true
      } catch (error) {
        this.error = error.response?.data?.detail || error.message
        this.setAlert(`Erro ao remover aluno: ${this.error}`, 'danger')
        return false
      } finally {
        this.loading = false
      }
    },

    async restoreStudent(id) {
      this.loading = true
      try {
        const response = await api.restoreStudent(id)
        // Remover da lista de inativos
        this.inactiveStudents = this.inactiveStudents.filter((s) => s.id !== id)
        // Adicionar à lista de ativos
        this.students.push(response.data)
        this.setAlert('Aluno restaurado com sucesso!', 'success')
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || error.message
        this.setAlert(`Erro ao restaurar aluno: ${this.error}`, 'danger')
        return null
      } finally {
        this.loading = false
      }
    },
  },
})
