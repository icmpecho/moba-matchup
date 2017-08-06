import Vue from 'vue'
import Router from 'vue-router'
import Players from './pages/Players.vue'
import Games from './pages/Games.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    { path: '/players', component: Players },
    { path: '/games', component: Games },
  ]
})