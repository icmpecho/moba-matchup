<template>
<div class="container">
  <h1>Games</h1>
  <GameDetail :game="game"></GameDetail>
</div>
</template>

<script>
import GameDetail from '../components/GameDetail.vue'

export default {
  data: function () {
    return {
      game: {
        _id: 'aaa',
        created: '2017-08-06T13:28:25Z',
        teams: [
          {
            players: [
              {
                _id: 'bbb',
                name: 'Player1',
                rating: 1,
              },
              {
                _id: 'ccc',
                name: 'Player4',
                rating: 4,
              },
            ],
            rating: 5,
          },
          {
            players: [
              {
                _id: 'ddd',
                name: 'Player2',
                rating: 2,
              },
              {
                _id: 'eee',
                name: 'Player3',
                rating: 3,
              },
            ],
            rating: 5,
          }
        ],
        canceled: false
      }
    }
  },
  components: {
    GameDetail
  }
}
</script>
