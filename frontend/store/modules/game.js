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
    },

    setMVP(state, data) {
      const index = _.findIndex(state.games, {_id: data.gameId})
      let game = _.cloneDeep(state.games[index])
      game.teams[data.teamId].mvp = data.playerId
      Vue.set(state.games, index, game)
    }
  },

  actions: {
    refreshGames({commit}) {
      commit('setLoading', null, { root: true })
      $.get("/api/games").then((data, status) => {
        if(status == 'success') {
          commit('refreshGames', data)
        } else {
          console.log(`[${status}] /api/games`)
        }
        commit('clearLoading', null, { root: true })
      })
    },

    cancelGame({commit}, gameId) {
      const url = `/api/games/${gameId}/cancel`
      commit('setLoading', null, { root: true })
      $.post(url).then((data, status) => {
        if(status == 'success') {
          commit('updateGame', data)
        } else {
          console.log(`[${status}] POST ${url}`)
        }
        commit('clearLoading', null, { root: true })
      })
    },

    submitWinner({commit, state}, data) {
      const game = _.find(state.games, {_id: data.gameId})
      const mvps = _.filter(
        [game.teams[0].mvp, game.teams[1].mvp], x => !_.isNil(x))
      const url = `/api/games/${data.gameId}/submit`
      const payload = {winner: data.winner, mvps: mvps}
      commit('setLoading', null, { root: true })
      $.post(url, payload).then((data, status) => {
        if(status == 'success') {
          commit('updateGame', data)
        } else {
          console.log(`[${status}] POST ${url}`)
        }
        commit('clearLoading', null, { root: true })
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
      commit('setLoading', null, { root: true })
      $.post(url, payload).then((data, status) => {
        if(status == 'success') {
          commit('prependGame', data)
        } else {
          console.log(`[${status}] POST ${url}`)
        }
        commit('clearLoading', null, { root: true })
      })
    },

    toggleMVP({commit}, data) {
      commit('setMVP', data)
    }
  },
}
