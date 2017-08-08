<template>
<div>
  <div id="header">
    <div class="container">
      <div class="row">
        <div class="col-xs-12 col-md-6">
          <h1>Players</h1>
        </div>
         <div class="col-xs-12 col-md-2">
           <CreatePlayerModal>
           </CreatePlayerModal>
        </div>
        <div class="col-xs-12 col-md-2">
          <CreateGameButton :playersCount="selectedPlayersCount" @click.native="createGame">
          </CreateGameButton>
        </div>
        <div class="col-xs-12 col-md-2">
          <button type="button" class="btn btn-default" @click="clear">
            Clear All Selection
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="container">
    <PlayerList :players="players"></PlayerList>
  </div>
</div>
</template>

<script>
import PlayerList from '../components/PlayerList.vue'
import CreateGameButton from '../components/CreateGameButton.vue'
import CreatePlayerModal from '../components/CreatePlayerModal.vue'

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
  methods: {
    createGame: function () {
      this.$store.dispatch('player/createGame')
    },
    clear: function () {
       this.$store.dispatch('player/clearAllSelection')
    }
  },
  components: {
    PlayerList,
    CreateGameButton,
    CreatePlayerModal
  },
  created: function () {
    this.$store.dispatch('player/refreshPlayers')
  },
  mounted: function () {
    const refreshAffix = () => {
      console.log(`affix ${$('nav').outerHeight()}`)
      $('#header').data('bs.affix').options.offset = $('nav').outerHeight()
    }
    $('#nav-menu').on('shown.bs.collapse', refreshAffix)
    $('#nav-menu').on('hidden.bs.collapse', refreshAffix)
    $('#header').affix({offset: {top: $('nav').outerHeight()}})
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
#header {
  background-color: white
}
.affix {
  top: 0;
  width: 100%;
  padding-top: 20px;
  padding-bottom: 10px
}
.affix-top {
  width: 100%
}
</style>