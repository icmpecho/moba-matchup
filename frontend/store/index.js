import Vue from 'vue'
import Vuex from 'vuex'
import Player from './modules/player'
import Game from './modules/game'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    player: Player,
    game: Game,
  }
})
