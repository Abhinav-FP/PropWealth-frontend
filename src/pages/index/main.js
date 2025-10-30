import Vue from 'vue'
import App from './App.vue'
import vuetify from '../../plugins/vuetify'
import '../../plugins/toast'

Vue.config.productionTip = false

// Silence Vue warnings/errors when suppression is active
const __suppress = process.env.VUE_APP_SUPPRESS_CONSOLE
if (__suppress === undefined || String(__suppress).toLowerCase() === 'true') {
  Vue.config.silent = true
  Vue.config.warnHandler = () => {}
  Vue.config.errorHandler = () => {}
}

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
