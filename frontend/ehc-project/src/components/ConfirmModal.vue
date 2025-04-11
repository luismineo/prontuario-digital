<template>
  <div
    class="modal fade"
    id="confirmModal"
    tabindex="-1"
    aria-labelledby="confirmModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="confirmModalLabel">{{ title }}</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          {{ message }}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button
            type="button"
            class="btn"
            :class="confirmButtonClass"
            @click="confirm"
            :disabled="loading"
          >
            {{ loading ? 'Processando...' : confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { Modal } from 'bootstrap'

export default {
  name: 'ConfirmModal',
  props: {
    title: {
      type: String,
      default: 'Confirmar',
    },
    message: {
      type: String,
      default: 'Tem certeza que deseja realizar esta ação?',
    },
    confirmText: {
      type: String,
      default: 'Confirmar',
    },
    confirmButtonClass: {
      type: String,
      default: 'btn-danger',
    },
  },

  emits: ['confirm', 'cancel'],

  setup(props, { emit }) {
    const loading = ref(false)
    const modalInstance = ref(null)

    function confirm() {
      loading.value = true
      emit('confirm')
      // O modal será fechado pelo componente pai após a conclusão da ação
    }

    function showModal() {
      if (!modalInstance.value) {
        const el = document.getElementById('confirmModal')
        if (el) {
          modalInstance.value = new Modal(el)
          el.addEventListener('hidden.bs.modal', () => {
            if (loading.value) {
              loading.value = false
            } else {
              emit('cancel')
            }
          })
        }
      }

      if (modalInstance.value) {
        modalInstance.value.show()
      }
    }

    function closeModal() {
      if (modalInstance.value) {
        modalInstance.value.hide()
      }
    }

    return {
      loading,
      confirm,
      showModal,
      closeModal,
    }
  },
}
</script>
