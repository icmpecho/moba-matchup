<<template>
<div class="panel" :class="panelClass">
  <div class="panel-heading">
    <h3 class="panel-title">
      Team {{teamId + 1}} <span class="badge pull-right">{{team.rating}}</span>
    </h3>
  </div>
  <ul class="list-group">
    <li class="list-group-item" v-for="player in team.players"
      :key="player._id" @click="toggleMVP(player._id)">
      <PlayerDetailButton :player="player"></PlayerDetailButton>
      {{player.name}}
      <span class="badge">{{player.rating}}</span>
      <span class="badge" v-if="player._id == team.mvp">MVP</span>
    </li>
  </ul>
  <div class="panel-footer" v-if="game.active">
    <div class="text-right">
      <button type="button" class="btn btn-success" @click="submitWinner">
        Win
      </button>
    </div>
  </div>
</div>
</template>

<<script>
import * as _ from 'lodash'
import PlayerDetailButton from './PlayerDetailButton.vue'

export default {
  props: ['game', 'teamId'],
  computed: {
    team() {
      return this.game.teams[this.teamId]
    },
    panelClass() {
      if(!_.isNil(this.game.winner)) {
        if(this.game.winner == this.teamId) {
          return 'panel-success'
        } else {
          return 'panel-danger'
        }
      } else {
        return 'panel-default'
      }
    }
  },
  methods: {
    submitWinner() {
      this.$store.dispatch('game/submitWinner',
        { gameId: this.game._id, winner: this.teamId })
    },
    toggleMVP(playerId) {
      if (this.game.active) {
        this.$store.dispatch('game/toggleMVP',
          { gameId: this.game._id, teamId: this.teamId, playerId: playerId })
      }
    },
  },
  components: {
    PlayerDetailButton
  }
}
</script>
