<template>
  <div class="home">
    
    <div class="container">
      <div style="padding-bottom: 10px">当前用户名： {{user.username}}</div>

      <van-button plain hairline type="primary" size="small" @click="toPlay">{{randomPlay ? '匹配中...' : '开始匹配'}}</van-button>
      <van-button plain hairline type="primary" size="small" @click="invitPlay">邀请挑战</van-button>
    </div>
  </div>
</template>

<script>
// import { parseInt } from '@/util'
import { mapState } from 'vuex'
export default {
  name: "home",
  components: {},
  data() {
    return {
      randomPlay: false
      // user: {
      //   username: ""
      // }
    };
  },
  computed: {
    ...mapState([
      'user'
    ])
  },
  methods: {
    toPlay(){
      this.randomPlay = !this.randomPlay
      if (this.randomPlay) {
        this.$socket.emit('play')
      } else {
        this.$socket.emit('clearPlay')
      }
    },
    invitPlay(){
      console.log('创建房间')
      this.$socket.emit('createRoom', this.user.username)
    }
  },
  mounted(){
     // 玩家登陆成功
    const query = this.$route.query
    const self = this
		this.$socket.on('home', function (data) {
			if (data.flag) {
				console.log('该用户已在线了！请换个昵称登陆！')
			} else {  
        console.log(query)
				if (query.room) {
					// 直接进入房间
					self.$socket.emit('comeIn', {
						userId: query.room,
						selfId: data.name
					})
				}
			}
    })
  }
};
</script>
<style lang="sass" scoped>

</style>

