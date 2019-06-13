<template>
  <div id="app">
    <div id="nav">
      <!-- <router-link to="/">Home</router-link>|
      <router-link to="/about">About</router-link> -->
    </div>
    <router-view/>
    <van-dialog v-model="show" title="输入登录用户名" show-cancel-button @confirm="toLogin">
      <van-cell-group>
        <van-field v-model="value" placeholder="请输入用户名"/>
      </van-cell-group>
    </van-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  mounted(){
    // console.log(this.$store)
   
    const self = this
    // 玩家太少了，人不够
		this.$socket.on('player less', function () {
			console.log('开启智能匹配！')
      console.log('游戏开始')
      self.$router.push('/game')
      self.$store.commit('SETVSUSER', {username: '我是智能机器人'})
		})
		this.$socket.on('play', function (data) {
			console.log(data)
      console.log('真人匹配成功！您的对手是：' + data.name)
      self.$store.commit('SETVSUSER', {username: data.name})
      console.log('游戏开始')
      self.$router.push('/game')

		})
		this.$socket.on('putMessage', function (data) {
      if(data.action && data.action == 'disconnect' ){
        console.log(data.name + '下线了')
        // 判断有没有再对局中
        console.log(self.vsUser.username)
        if(self.vsUser.username) {
          self.$socket.emit('removeRoom',{
            userId: self.vsUser.username,
            selfId: self.value,
            action: 'disconnect'
          })
        }
        
      } else {
        console.log(data.name + '上线了')
      }

    })
    
  },
  data() {
    return {
      show: true,
      value: "111"
    };
  },
  computed: {
    ...mapState([
      'user',
      'vsUser'
    ])
  },
  methods: {
    toLogin() {
      const self = this
      if (!this.value) {
        this.$toast("请输入您的用户名");
        this.show = true;
        return;
      }
      this.$socket.emit("login", this.value);
      
      this.$store.commit('SETUSER', {username: this.value})
      // 建立角色与服务器的双向通信
      this.$socket.on("to" + this.value, function(data) {
        if (data.code && data.code == 200) {
          console.log(data);
          if (data.action == "createRoom") {
            self.$router.push('/room')
          }
          if (data.action == "comeInRoom") {
            self.$store.commit('SETVSUSER', {username: data.userId})
            if (data.fz) {
							// 显示开始游戏按钮
						} else {
							self.$router.push({path: '/room', query:{room: data.userId}})
						}
          }
          if (data.action == "ready") {
            if(data.cancel){
							self.$store.commit('SETHANDLEGAME', false)
						} else {
							self.$store.commit('SETHANDLEGAME', true)
						}
          }
          if (data.action == "removeRoom") {
            // 判断是否处于游戏状态中 
            console.log(location.pathname)
            if(location.pathname === '/game') {
              // 给与胜利提示
              console.log('您获胜了，对方中途退出！')
              // self.$socket.emit('gameOver',{})
              // self.$toast('您获胜了！')   

            } else {
              self.$store.commit('SETVSUSER', {})	
              self.$store.commit('SETHANDLEGAME', false)	
              self.$router.replace('/room?room='+ self.value)
            }
            
          }
        } else {
          console.log(data.msg);
        }
      });

    }
  }
};
</script>


<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
