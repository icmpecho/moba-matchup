<<template>
<div class="panel" :class="panelClass">
  <div class="panel-heading">
    <h3 class="panel-title">
      Team {{teamId + 1}} <span class="badge pull-right">{{team.rating}}</span>
    </h3>
  </div>
  <ul class="list-group">
    <li class="list-group-item" v-for="player in team.players" :key="player._id">
      {{player.name}} <span class="badge">{{player.rating}}</span>
    </li>
  </ul>
  <div class="panel-footer" v-if="gameIsInProgress">
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
    },
    gameIsInProgress() {
      return _.isNil(this.game.winner) && !this.game.canceled
    }
  },
  methods: {
    submitWinner() {
      this.$store.dispatch('game/submitWinner',
        { gameId: this.game._id, winner: this.teamId })
    }
  }
}
</script>
