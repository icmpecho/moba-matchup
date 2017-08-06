import * as $ from 'jquery'
import * as _ from 'lodash'
import router from '../../router'

const selectedPlayersCount = (state) => {
  return _.filter(state.players, 'selected').length
}

export default {
  namespaced: true,

  state: {
    players: [],
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
      if(player.selected) {
        player.selected = false
      } else if(selectedPlayersCount(state) < 10) {
        player.selected = true
      }
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
    },

    createGame({commit, state}) {
      const selectedPlayers = _.filter(state.players, 'selected')
      if(selectedPlayers.length <= 1) {
        return
      }
      const playerIds = _.map(selectedPlayers, p => p._id)
      const payload = {playerIds}
      $.post("/api/games", payload).then((data, status) => {
        if(status == 'success') {
          router.push({name: 'games'})
        } else {
          console.log(`[${status}] POST /api/games`)
        }
      })
    }
  },

  getters: {
    selectedPlayersCount
  }
}
