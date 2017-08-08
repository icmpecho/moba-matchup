import * as $ from 'jquery'
import * as _ from 'lodash'
import Vue from 'vue'

export default {
  namespaced: true,

  state: {
    games: []
  },

  mutations: {
    refreshGames(state, games) {
      state.games = games
    },

    updateGame(state, game) {
      const index = _.findIndex(state.games, {_id: game._id})
      Vue.set(state.games, index, game)
    },

    prependGame(state, game) {
      state.games.unshift(game)
    }
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
    },

    cancelGame({commit}, gameId) {
      const url = `/api/games/${gameId}/cancel`
      $.post(url).then((data, status) => {
        if(status == 'success') {
          commit('updateGame', data)
        } else {
          console.log(`[${status}] POST ${url}`)
        }
      })
    },

    submitWinner({commit}, data) {
      const url = `/api/games/${data.gameId}/submit`
      const payload = {winner: data.winner}
      $.post(url, payload).then((data, status) => {
        if(status == 'success') {
          commit('updateGame', data)
        } else {
          console.log(`[${status}] POST ${url}`)
        }
      })
    },

    reCreateGame({commit}, game) {
      const mapId = (p) => p._id
      const playerIds = _.concat(
        _.map(game.teams[0].players, mapId),
        _.map(game.teams[1].players, mapId)
      )
      const payload = {playerIds}
      const url = '/api/games'
      $.post(url, payload).then((data, status) => {
        if(status == 'success') {
          commit('prependGame', data)
        } else {
          console.log(`[${status}] POST ${url}`)
        }
      })
    }
  },
}
