import * as $ from 'jquery'
import * as _ from 'lodash'


export default {
  namespaced: true,

  state: {
    games: []
  },

  mutations: {
    refreshGames(state, games) {
      state.games = games
    },
  },

  actions: {
    refreshGames({commit}) {
      $.get("/api/games").then((data, status) => {
        if(status == 'success') {
          commit('refreshGames', data)
        } else {
          console.log(`[${status}] /api/games`)
        }
      })
    }
  },
}
