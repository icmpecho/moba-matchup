import Vue from 'vue'
import Router from 'vue-router'
import Players from './pages/Players.vue'
import Games from './pages/Games.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    { path: '/', redirect: '/games' },
    { path: '/players', name: 'players', component: Players },
    { path: '/games', name: 'games', component: Games },
  ]
})