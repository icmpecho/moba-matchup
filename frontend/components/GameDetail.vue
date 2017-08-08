<<template>
<div class="panel" :class="panelClass">
  <div class="panel-heading">
    <h3 class="panel-title">{{created}}<span class="pull-right">{{gameStatus}}</span></h3>
  </div>
  <div class="panel-body">
  </div>
  <div class="container-fluid">
    <div class="row">
      <div class="col-xs-12 col-md-6">
        <TeamDetail :game="game" :teamId="0"></TeamDetail>
      </div>
      <div class="col-xs-12 col-md-6">
        <TeamDetail :game="game" :teamId="1"></TeamDetail>
      </div>
    </div>
  </div>
  <div class="panel-footer" v-if="game.active">
    <div class="text-right">
      <button type="button" class="btn btn-danger" @click="cancel">
        Cancel
      </button>
    </div>
  </div>
  <div class="panel-footer" v-if="!game.active">
    <div class="text-right">
      <button type="button" class="btn btn-default" @click="reCreate">
        Re Create
      </button>
    </div>
  </div>
</div>
</template>

<<script>
import * as _ from 'lodash'
import * as moment from 'moment'
import TeamDetail from './TeamDetail.vue'

export default {
  props: ['game'],
  computed: {
    gameStatus() {
      if(this.game.canceled) {
        return 'Canceled'
      } else if (!_.isNil(this.game.winner)) {
        return 'Ended'
      } else {
        return 'In Progress'
      }
    },
    panelClass() {
      if(this.gameStatus == 'Canceled') {
        return 'panel-danger'
      } else if(this.gameStatus == 'Ended') {
        return 'panel-success'
      } else if(this.gameStatus == 'In Progress') {
        return 'panel-primary'
      } else {
        return 'panel-default'
      }
    },
    created() {
      return moment(this.game.created).fromNow()
    }
  },
  methods: {
    cancel() {
      this.$store.dispatch('game/cancelGame', this.game._id)
    },
    reCreate() {
      this.$store.dispatch('game/reCreateGame', this.game)
    }
  },
  components: {
    TeamDetail
  }
}
</script>
