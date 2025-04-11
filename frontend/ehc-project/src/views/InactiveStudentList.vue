<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Alunos Inativos</h2>
      <router-link to="/" class="btn btn-primary">
        <i class="bi bi-arrow-left"></i> Voltar para Alunos Ativos
      </router-link>
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

    <div v-else-if="studentStore.inactiveStudents.length === 0" class="alert alert-info">
      Não há alunos inativos no momento.
    </div>

    <div v-else class="table-responsive">
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
          <tr v-for="student in studentStore.inactiveStudents" :key="student.id">
            <td>{{ student.name }}</td>
            <td>{{ student.cgm }}</td>
            <td>{{ formatDate(student.dob) }}</td>
            <td>{{ formatGender(student.gender) }}</td>
            <td>{{ student.guardian }}</td>
            <td>
              <button class="btn btn-sm btn-info me-1" @click="viewStudent(student)">
                <i class="bi bi-eye"></i>
              </button>
              <button class="btn btn-sm btn-success" @click="confirmRestore(student)">
                <i class="bi bi-arrow-counterclockwise"></i> Restaurar
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
      mode="view"
      @closed="onModalClosed"
    />

    <ConfirmModal
      ref="confirmModal"
      title="Confirmar Restauração"
      message="Deseja restaurar este aluno? Ele voltará para a lista de alunos ativos."
      confirmText="Restaurar"
      confirmButtonClass="btn-success"
      @confirm="restoreStudent"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStudentStore } from '../stores/student'
import StudentModal from '../components/StudentModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

export default {
  name: 'InactiveStudentList',
  components: {
    StudentModal,
    ConfirmModal,
  },

  setup() {
    const studentStore = useStudentStore()
    const studentModal = ref(null)
    const confirmModal = ref(null)
    const selectedStudent = ref(null)
    const studentToRestore = ref(null)

    onMounted(async () => {
      await studentStore.fetchInactiveStudents()
    })

    function formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    }

    function viewStudent(student) {
      selectedStudent.value = student
      studentModal.value.showModal()
    }

    function confirmRestore(student) {
      studentToRestore.value = student
      confirmModal.value.showModal()
    }

    async function restoreStudent() {
      if (studentToRestore.value) {
        const success = await studentStore.restoreStudent(studentToRestore.value.id)
        if (success) {
          confirmModal.value.closeModal()
        }
      }
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
      formatDate,
      formatGender,
      viewStudent,
      confirmRestore,
      restoreStudent,
      onModalClosed,
    }
  },
}
</script>
