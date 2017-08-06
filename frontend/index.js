import Bootstrap from 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap'
import Vue from 'vue'
import App from './App.vue'
import router from './router'

new Vue({
  el: '#app',
  router,
  render: h => h(App),
})
