<<template>
<div>
  <div class="row" v-for="game in games" :key="game._id">
    <GameDetail :game="game"></GameDetail>
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
