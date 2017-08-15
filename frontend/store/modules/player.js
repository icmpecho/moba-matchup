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
    currentPlayer: null,
  },

  mutations: {
    refreshPlayers(state, players) {
      state.players = _.map(players, p => {
        p.selected = false
        return p
      })
    },
    clearAllSelection(state) {
      state.players = _.map(state.players, p => {
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
    },
    setCurrentPlayer(state, playerDetail) {
      state.currentPlayer = playerDetail
    }
  },

  actions: {
    refreshPlayers({commit}) {
      commit('setLoading', null, { root: true })
      $.get("/api/players").then((data, status) => {
        if(status == 'success') {
          commit('refreshPlayers', data)
        } else {
          console.log(`[${status}] /api/players`)
        }
        commit('clearLoading', null, { root: true })
      })
    },
    clearAllSelection({commit}) {
      commit('clearAllSelection')
    },
    createGame({commit, state}) {
      const selectedPlayers = _.filter(state.players, 'selected')
      if(selectedPlayers.length <= 1) {
        return
      }
      const playerIds = _.map(selectedPlayers, p => p._id)
      const payload = {playerIds}
      commit('setLoading', null, { root: true })
      $.post("/api/games", payload).then((data, status) => {
        if(status == 'success') {
          router.push({name: 'games'})
        } else {
          console.log(`[${status}] POST /api/games`)
        }
        commit('clearLoading', null, { root: true })
      })
    },

    createPlayer({commit, dispatch}, playerId){
      const payload = {name:playerId}
      commit('setLoading', null, { root: true })
      $.post("/api/players", payload).then((data, status) => {
        if(status == 'success') {
          console.log("Create complete.")
          dispatch('refreshPlayers')
        } else {
          console.log(`[${status}] POST /api/players`)
        }
        commit('clearLoading', null, { root: true })
      })
    },

    loadPlayerDetail({commit}, playerId) {
      const url = `/api/players/${playerId}`
      commit('setLoading', null, { root: true })
      $.get(url).then((data, status) => {
        if(status == 'success') {
          commit('setCurrentPlayer', data)
        } else {
          console.log(`[${status}] ${url}`)
        }
        commit('clearLoading', null, { root: true })
      })
    },
  },

  getters: {
    selectedPlayersCount
  }
}
