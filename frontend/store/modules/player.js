import * as $ from 'jquery'
import * as _ from 'lodash'

export default {
  namespaced: true,
  state: {
    players: []
  },
  mutations: {
    refreshPlayers(state, players) {
      state.players = _.map(players, p => {
        p.selected = false
        return p
      })
    },
    toggleSelection(state, playerId) {
      const player = _.find(state.players, {'_id': playerId})
      player.selected = !player.selected
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
