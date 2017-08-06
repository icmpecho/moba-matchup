<<template>
<div>
  <div class="row">
    <GameDetail v-for="game in games" :key="game._id" :game="game"></GameDetail>
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
