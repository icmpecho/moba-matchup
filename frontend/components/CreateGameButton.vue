<template>
<button type="button" class="btn" :class="btnClass">
  Create Game <span class="badge">{{playersCount}}</span>
</button>
</template>

<<script>
export default {
  props: ['playersCount'],
  computed: {
    btnClass() {
      if(this.playersCount == 10) {
        return 'btn-success'
      } else if(this.playersCount > 0) {
        return 'btn-warning'
      } else {
        return 'btn-danger'
      }
    }
  }
}
</script>
