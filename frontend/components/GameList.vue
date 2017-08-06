<<template>
<div>
  <div class="row" v-for="game in games" :key="game._id">
    <div class="col-xs-12">
      <GameDetail :game="game"></GameDetail>
    </div>
  </div>
</div>
</template>

<<script>
import GameDetail from './GameDetail.vue'

export default {
  props: ['games'],
  components: {
    GameDetail
  }
}
</script>
