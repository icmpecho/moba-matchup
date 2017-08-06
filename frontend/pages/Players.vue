<template>
<div class="container">
  <div class="row">
    <div class="col-xs-12 col-md-8">
      <h1>Players</h1>
    </div>
    <div class="col-xs-6 col-md-4">
       <CreateGameButton :playersCount="selectedPlayersCount"></CreateGameButton>
    </div>
  </div>
  <PlayerList :players="players"></PlayerList>
</div>
</template>

<script>
import PlayerList from '../components/PlayerList.vue'
import CreateGameButton from '../components/CreateGameButton.vue'
import {mapState} from 'vuex'

export default {
  data: function () {
    return {}
  },
  computed: {
    players: function () {
      return this.$store.state.player.players
    },
    selectedPlayersCount: function () {
      return this.$store.getters['player/selectedPlayersCount']
    }
  },
  components: {
    PlayerList,
    CreateGameButton
  },
  created: function () {
    this.$store.dispatch('player/refreshPlayers')
  }
}
</script>

<style>
h1 {
  margin-top: 0px
}
table {
  margin-top: 10px
}
</style>