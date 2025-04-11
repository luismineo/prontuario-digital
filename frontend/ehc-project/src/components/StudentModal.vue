<template>
  <div
    class="modal fade"
    id="studentModal"
    tabindex="-1"
    aria-labelledby="studentModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="studentModalLabel">
            {{
              isEditing ? 'Editar Aluno' : isViewing ? 'Detalhes do Aluno' : 'Cadastrar Novo Aluno'
            }}
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="name" class="form-label">Nome Completo*</label>
                <input
                  type="text"
                  class="form-control"
                  id="name"
                  v-model="form.name"
                  :disabled="isViewing"
                  required
                />
              </div>
              <div class="col-md-6">
                <label for="cgm" class="form-label">CGM*</label>
                <input
                  type="text"
                  class="form-control"
                  id="cgm"
                  v-model="form.cgm"
                  :disabled="isViewing"
                  required
                />
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <label for="dob" class="form-label">Data de Nascimento*</label>
                <input
                  type="date"
                  class="form-control"
                  id="dob"
                  v-model="form.dob"
                  :disabled="isViewing"
                  required
                />
              </div>
              <div class="col-md-6">
                <label for="gender" class="form-label">Gênero*</label>
                <select
                  class="form-select"
                  id="gender"
                  v-model="form.gender"
                  :disabled="isViewing"
                  required
                >
                  <option value="">Selecione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="O">Outro</option>
                </select>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <label for="guardian" class="form-label">Nome do Responsável*</label>
                <input
                  type="text"
                  class="form-control"
                  id="guardian"
                  v-model="form.guardian"
                  :disabled="isViewing"
                  required
                />
              </div>
              <div class="col-md-6">
                <label for="guardian_cpf" class="form-label">CPF do Responsável*</label>
                <input
                  v-if="!isViewing"
                  type="text"
                  class="form-control"
                  id="guardian_cpf"
                  v-model="form.guardian_cpf"
                  v-mask="'###.###.###-##'"
                  required
                />
                <input
                  v-else
                  type="text"
                  class="form-control"
                  id="guardian_cpf_view"
                  :value="formattedCPF"
                  disabled
                />
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-12">
                <label for="address" class="form-label">Endereço*</label>
                <input
                  type="text"
                  class="form-control"
                  id="address"
                  v-model="form.address"
                  :disabled="isViewing"
                  required
                />
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-4">
                <label for="cep" class="form-label">CEP*</label>
                <input
                  v-if="!isViewing"
                  type="text"
                  class="form-control"
                  id="cep"
                  v-model="form.cep"
                  v-mask="'##.###-###'"
                  required
                />
                <input
                  v-else
                  type="text"
                  class="form-control"
                  id="cep_view"
                  :value="formattedCEP"
                  disabled
                />
              </div>
              <div class="col-md-4">
                <label for="city" class="form-label">Cidade*</label>
                <input
                  type="text"
                  class="form-control"
                  id="city"
                  v-model="form.city"
                  :disabled="isViewing"
                  required
                />
              </div>
              <div class="col-md-4">
                <label for="state" class="form-label">Estado*</label>
                <input
                  type="text"
                  class="form-control"
                  id="state"
                  v-model="form.state"
                  :disabled="isViewing"
                  required
                  maxlength="2"
                />
              </div>
            </div>

            <div class="modal-footer">
              <!-- <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Fechar
              </button> -->
              <button v-if="!isViewing" type="submit" class="btn btn-primary" :disabled="loading">
                {{ loading ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue'
import { useStudentStore } from '../stores/student'
import { Modal } from 'bootstrap'

export default {
  name: 'StudentModal',
  props: {
    student: {
      type: Object,
      default: null,
    },
    mode: {
      type: String,
      default: 'create', // 'create', 'edit', 'view'
      validator: (value) => ['create', 'edit', 'view'].includes(value),
    },
  },

  emits: ['saved', 'closed'],

  setup(props, { emit }) {
    const studentStore = useStudentStore()
    const loading = ref(false)
    const modalInstance = ref(null)

    const form = reactive({
      name: '',
      cgm: '',
      dob: '',
      gender: '',
      guardian: '',
      guardian_cpf: '',
      address: '',
      cep: '',
      city: '',
      state: '',
    })

    const isEditing = computed(() => props.mode === 'edit')
    const isViewing = computed(() => props.mode === 'view')

    watch(
      () => props.student,
      (newStudent) => {
        if (newStudent) {
          Object.keys(form).forEach((key) => {
            if (key in newStudent) {
              form[key] = newStudent[key]
            }
          })
        } else {
          resetForm()
        }
      },
      { immediate: true },
    )

    const formattedCPF = computed(() => {
      const cpf = form.guardian_cpf.replace(/\D/g, '')
      if (cpf.length === 11) {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      }
      return form.guardian_cpf
    })

    const formattedCEP = computed(() => {
      const cep = form.cep.replace(/\D/g, '')
      if (cep.length === 8) {
        return cep.replace(/(\d{5})(\d{3})/, '$1-$2')
      }
      return form.cep
    })

    function resetForm() {
      Object.keys(form).forEach((key) => {
        form[key] = ''
      })
    }

    async function submitForm() {
      loading.value = true
      try {
        let result

        if (isEditing.value) {
          result = await studentStore.updateStudent(props.student.id, form)
        } else {
          result = await studentStore.createStudent(form)
        }

        if (result) {
          emit('saved', result)
          closeModal()
        }
      } finally {
        loading.value = false
      }
    }

    function closeModal() {
      if (modalInstance.value) {
        modalInstance.value.hide()
      }
    }

    function showModal() {
      if (!modalInstance.value) {
        const el = document.getElementById('studentModal')
        if (el) {
          modalInstance.value = new Modal(el)
          el.addEventListener('hidden.bs.modal', () => {
            emit('closed')
          })
        }
      }

      if (modalInstance.value) {
        modalInstance.value.show()
      }
    }

    return {
      form,
      loading,
      isEditing,
      isViewing,
      formattedCPF,
      formattedCEP,
      submitForm,
      showModal,
      closeModal,
    }
  },
}
</script>
