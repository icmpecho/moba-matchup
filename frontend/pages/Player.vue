<<template>
  <div class="container">
    <ol class="breadcrumb">
      <li><router-link to="/players">Players</router-link></li>
      <li class="active">{{player.name}}</li>
    </ol>
    <div class="page-header">
      <h2>{{player.name}}</h2>
    </div>
    <p> Total games played: <b>{{player.totalGames}}</b></p>
    <div class="panel panel-default">
      <div class="panel-heading">
        <h3 class="panel-title">Last {{player.recent.gameResults.length}} games</h3>
      </div>
      <div class="panel-body">
        <p>
          <span class="label" v-for="result in player.recent.gameResults"
              :class="resultClass(result)">
            {{resultText(result)}}
          </span>
        </p>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th></th>
              <th>With</th>
              <th>Against</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Playing well</td>
              <td><PlayerDetailButton :player="player.recent.bestWith"></PlayerDetailButton>{{player.recent.bestWith.name}}</td>
              <td><PlayerDetailButton :player="player.recent.bestAgainst"></PlayerDetailButton>{{player.recent.bestAgainst.name}}</td>
            </tr>
            <tr>
              <td>Playing badly</td>
              <td><PlayerDetailButton :player="player.recent.worstWith"></PlayerDetailButton>{{player.recent.worstWith.name}}</td>
              <td><PlayerDetailButton :player="player.recent.worstAgainst"></PlayerDetailButton>{{player.recent.worstAgainst.name}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import PlayerDetailButton from "../components/PlayerDetailButton.vue"

export default {
  computed: {
    player: function() {
      return this.$store.state.player.currentPlayer
    }
  },
  methods: {
    resultText: function(result) {
      if(result) {
        return 'W'
      }
      return 'L'
    },
    resultClass: function(result) {
      if(result) {
        return 'label-success'
      }
      return 'label-danger'
    },
    fetchData: function() {
      this.$store.dispatch(
        'player/loadPlayerDetail', this.$route.params.playerId)
    }
  },
  created: function() {
    this.fetchData()
  },
  watch: {
    '$route': 'fetchData'
  },
  components: {
    PlayerDetailButton
  }
}
</script>

<style scoped>
.label {
  margin-right: 2px
}
</style>
