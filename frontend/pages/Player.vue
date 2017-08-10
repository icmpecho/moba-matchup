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
              <td>{{player.recent.bestWith.name}}</td>
              <td>{{player.recent.bestAgainst.name}}</td>
            </tr>
            <tr>
              <td>Playing badly</td>
              <td>{{player.recent.worstWith.name}}</td>
              <td>{{player.recent.worstAgainst.name}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<<script>
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
    }
  },
  created: function() {
    this.$store.dispatch('player/loadPlayerDetail', this.$route.params.playerId)
  }
}
</script>

<<style scoped>
.label {
  margin-right: 2px
}
</style>
