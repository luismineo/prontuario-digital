<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Lista de Alunos</h2>
      <div>
        <button class="btn btn-primary me-2" @click="openCreateModal">
          <i class="bi bi-plus-circle"></i> Novo Aluno
        </button>
        <router-link to="/inactive" class="btn btn-secondary">
          <i class="bi bi-archive"></i> Alunos Inativos
        </router-link>
      </div>
    </div>

    <div
      v-if="studentStore.alert.show"
      class="alert"
      :class="`alert-${studentStore.alert.type}`"
      role="alert"
    >
      {{ studentStore.alert.message }}
      <button type="button" class="btn-close float-end" @click="studentStore.clearAlert"></button>
    </div>

    <div v-if="studentStore.loading" class="text-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
    </div>

    <div v-else-if="studentStore.students.length === 0" class="alert alert-info">
      Nenhum aluno cadastrado. Clique em "Novo Aluno" para começar.
    </div>

    <div v-else class="table-responsive">
      <!-- Na seção da tabela em StudentList.vue -->
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>Nome</th>
            <th>CGM</th>
            <th>Data de Nascimento</th>
            <th>Gênero</th>
            <th>Responsável</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in studentStore.students" :key="student.id">
            <td>{{ student.name }}</td>
            <td>{{ student.cgm }}</td>
            <td>{{ formatDate(student.dob) }}</td>
            <td>{{ formatGender(student.gender) }}</td>
            <td>{{ student.guardian }}</td>
            <td>
              <button class="btn btn-sm btn-info me-1" @click="viewStudent(student)">
                <i class="bi bi-eye"></i>
              </button>
              <button class="btn btn-sm btn-primary me-1" @click="editStudent(student)">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-danger" @click="confirmDelete(student)">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modais -->
    <StudentModal
      ref="studentModal"
      :student="selectedStudent"
      :mode="modalMode"
      @saved="onStudentSaved"
      @closed="onModalClosed"
    />

    <ConfirmModal
      ref="confirmModal"
      title="Confirmar Exclusão"
      message="Tem certeza que deseja excluir este aluno? Esta ação pode ser revertida posteriormente."
      confirmText="Excluir"
      @confirm="deleteStudent"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStudentStore } from '../stores/student'
import StudentModal from '../components/StudentModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

export default {
  name: 'StudentList',
  components: {
    StudentModal,
    ConfirmModal,
  },

  setup() {
    const studentStore = useStudentStore()
    const studentModal = ref(null)
    const confirmModal = ref(null)
    const selectedStudent = ref(null)
    const modalMode = ref('create')
    const studentToDelete = ref(null)

    onMounted(async () => {
      await studentStore.fetchStudents()
    })

    function formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    }

    function openCreateModal() {
      selectedStudent.value = null
      modalMode.value = 'create'
      studentModal.value.showModal()
    }

    function viewStudent(student) {
      selectedStudent.value = student
      modalMode.value = 'view'
      studentModal.value.showModal()
    }

    function editStudent(student) {
      selectedStudent.value = student
      modalMode.value = 'edit'
      studentModal.value.showModal()
    }

    function confirmDelete(student) {
      studentToDelete.value = student
      confirmModal.value.showModal()
    }

    async function deleteStudent() {
      if (studentToDelete.value) {
        const success = await studentStore.deleteStudent(studentToDelete.value.id)
        if (success) {
          confirmModal.value.closeModal()
        }
      }
    }

    function onStudentSaved() {
      // Atualizar a lista após salvar
      studentStore.fetchStudents()
    }

    function onModalClosed() {
      selectedStudent.value = null
    }

    function formatGender(gender) {
      const genders = {
        M: 'Masculino',
        F: 'Feminino',
        O: 'Outro',
      }
      return genders[gender] || gender
    }

    return {
      studentStore,
      studentModal,
      confirmModal,
      selectedStudent,
      modalMode,
      formatDate,
      formatGender,
      openCreateModal,
      viewStudent,
      editStudent,
      confirmDelete,
      deleteStudent,
      onStudentSaved,
      onModalClosed,
    }
  },
}
</script>
