<template>
  <div>
    <div style="text-align: center; padding-bottom: 10px">
      {{user.username}}
      VS
      {{vsUser.username ? vsUser.username : '等待加入中。。。'}}
      <van-tag round type="success" v-show="isFz && handleGame">准备</van-tag>
    </div>
    <van-button
      v-if="isFz"
      v-show="vsUser.username"
      plain
      hairline
      type="primary"
      size="small"
      @click="startGame"
    >开始游戏</van-button>
    <van-button
      v-else
      plain
      hairline
      type="primary"
      size="small"
      @click="ready"
    >{{isReady ? '取消准备' : '准备'}}</van-button>
    <div style="margin-top: 400px">
      <van-button plain hairline type="danger" size="small" @click="leveRoom">离开房间</van-button>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      isFz: true,
      isReady: false
    };
  },
  computed: {
    ...mapState(["user", "vsUser", "handleGame"])
  },
  methods: {
    startGame() {
      if (!this.handleGame) return this.$toast("玩家还没准备！");
      const userId = this.user.username;
      const vsId = this.vsUser.username;
      console.log("点击游戏开始");
      this.$socket.emit("startGame", {
        userId: userId,
        vsId: vsId
      });
    },
    ready() {
      const userId = this.user.username;
      const vsId = this.vsUser.username;
      this.isReady = !this.isReady;
      if (this.isReady) {
        console.log("玩家已准备");
        this.$socket.emit("ready", { userId: userId, vsId: vsId });
      } else {
        console.log("已取消准备");
        this.$socket.emit("ready", {
          userId: userId,
          vsId: vsId,
          cancel: true
        });
        // $("#ready").text("准备");
      }
    },
    leveRoom() {
      const userId = this.user.username;
      const vsId = this.vsUser.username;
      this.$socket.emit("removeRoom", { selfId: userId, userId: vsId });
      this.$router.replace("/home");
    },
    init() {
      this.$store.commit("SETHANDLEGAME", false);
      this.isReady = false;
      const query = this.$route.query;
      console.log(query)
      if (query.room && query.room != this.user.username) {
        this.isFz = false;
      } else {
        this.isFz = true;
      }
    }
  },
  mounted() {
    // 初始化 准备状态
    this.init()
  },
  watch: {
    "$route": function(to,from){
      this.init()

    }
  }
};
</script>

