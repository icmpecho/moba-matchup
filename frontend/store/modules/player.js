import * as $ from 'jquery'

export default {
  namespaced: true,
  state: {
    players: []
  },
  mutations: {
    refreshPlayers(state, players) {
      state.players = players
    }
  },
  actions: {
    refreshPlayers({commit}) {
      $.get("/api/players").then((data, status) => {
        if(status == 'success') {
          commit('refreshPlayers', data)
        } else {
          console.log(`[${status}] /api/players`)
        }
      })
    }
  }
}
