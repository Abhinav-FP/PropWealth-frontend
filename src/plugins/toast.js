import Vue from 'vue'
import Swal from 'sweetalert2'

// Configure a reusable SweetAlert toast instance
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
})

// Provide a minimal $toast API compatible with existing calls
Vue.prototype.$toast = {
  success(message) {
    const text = typeof message === 'string' && message.trim() ? message : 'Success'
    Toast.fire({ icon: 'success', title: text })
  },
  error(message) {
    const text = typeof message === 'string' && message.trim() ? message : 'Something went wrong'
    Toast.fire({ icon: 'error', title: text })
  },
}