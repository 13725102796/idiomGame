<template>
  <div>
    <div style="text-align: center; padding-bottom: 10px">
      {{user.username}}
      VS
      {{vsUser.username}}
    </div>

    <div class="text" @click="select">
      <span v-for="(item,idx) in idiomArr" :key="idx" :data-index="idx">{{item}}</span>
    </div>
    <div class="text select_box" @click="selectOne">
      <span
        v-for="(item,idx) in mixArr"
        :key="idx"
        :data-index="idx"
        :class="[(hideArr.indexOf(idx) > -1) && 'active']"
      >{{item}}</span>
    </div>

    <div class="result_box">
      <h2>pk结果：</h2>
      <div class="result">
        <div class="box self">
          <van-panel :title="user.username" status="在线">
            <div>
              <p class="time" v-for="(item,idx) in userData" :key="idx">
                第{{idx + 1}}局用时： {{item.time}}s
                <van-tag :type="item.result ?'success' : 'danger'"> {{item.result ? '获胜' : '失败'}}</van-tag>
              </p>
            </div>
          </van-panel>
        </div>
        <div class="box vs">
          <van-panel :title="vsUser.username || '无名氏'" status="在线">
            <div>
              <p class="time" v-for="(item,idx) in vsUserData" :key="idx">
                第{{idx + 1}}局用时： {{item.time}}s
                 <van-tag :type="item.result ?'success' : 'danger'"> {{item.result ? '获胜' : '失败'}}</van-tag>
              </p>
            </div>
          </van-panel>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import { shuffle } from "@/util";
export default {
  data() {
    return {
      idiom: {},
      allIdiom: [
        { val: "一刀两断", mixVal: "比喻断绝关系形容行事乾脆爽快" },
        { val: "一日千里", mixVal: "比喻进步神速或事业发展得很快" }
      ],
      idiomArr: [],
      mixArr: [],
      hideArr: [],
      userData: [],
      vsUserData: [],
      nowGameNum: 0,
      nowTime: '',
      successId: '',
    };
  },
  computed: {
    ...mapState(["user", "vsUser"])
  },
  methods: {
    select(e) {
      // console.log(e)
      if (e.target.nodeName.toLowerCase() === "span") {
        const index = parseInt(e.target.dataset.index);
        if (index == 0 || index == 2 || index == 4) {
          // 判断是否是取消选中
          const val = this.idiomArr[index];
          if (val && val != "*") {
            this.$set(this.idiomArr, index, "*");
            const idx = this.mixArr.indexOf(val);
            // 从选中组中移除
            this.hideArr.splice([this.hideArr.indexOf(idx)], 1);
          } else {
            console.log("该选项还没选择噢！");
          }
        }
      }
    },
    selectOne(e) {
      const canIndex = this.idiomArr.findIndex(item => {
        if (!item || item == "*") return item;
      });
      console.log(canIndex);
      // 判断可不可以添加
      if (canIndex > -1) {
        if (e.target.nodeName.toLowerCase() === "span") {
          const index = parseInt(e.target.dataset.index);
          this.hideArr.push(index);
          this.$set(this.idiomArr, canIndex, this.mixArr[index]);
          this.checkResult();
        }
      } else {
        console.log("您已经选完啦");
      }
    },
    checkResult() {
      const self = this
      const canIndex = this.idiomArr.findIndex(item => {
        if (!item || item == "*") return item;
      });

      if (canIndex == -1) {
        console.log("开始校验结果");
        const idiomStr = String(this.idiomArr.join(""));
        if (idiomStr === this.idiom.val) {
          // right
          this.$toast("回答正确");
          const time = new Date().getTime() - this.nowTime;
          console.log(self.user.username)
          this.$socket.emit("successGame", {
            vsId: self.vsUser.username,
            time: time,
            val: idiomStr
          });
        } else {
          this.$toast("回答错误");
        }
      }
    },
    init() {
      // this.idiomArr = [];
      // this.mixArr = [];
      console.log('开始初始化')
      this.hideArr = [];
      this.idiom = this.allIdiom[this.nowGameNum];

      const idiomArr = this.idiom.val.split("");
      const mixArr = this.idiom.mixVal.split("");
      if (idiomArr.length == 4) {
        mixArr.push(idiomArr[0], idiomArr[2]);
        idiomArr[0] = "*";
        idiomArr[2] = "*";
      }
      this.idiomArr = idiomArr;
      console.log(idiomArr);
      this.mixArr = shuffle(mixArr);

      this.nowTime = new Date().getTime()
    }
  },
  mounted() {
    // this.nowGameNum = 0
    // game init
    this.init()
    // 开启胜利监听
    

    const self = this;
    this.$socket.on("handleResult", function(data) {
      self.userData = data.selfMsg;
      self.vsUserData = data.vsMsg;
      // console.log(data)
      self.$toast(data.result ? "您获胜了" : "您失败了");
      self.successId = data.result ? self.user.username : self.vsUser.username
      // 判断进入下一个关卡
      self.nowGameNum++;
      console.log(self.nowGameNum)
      console.log(self.allIdiom[self.nowGameNum])
      if (self.allIdiom[self.nowGameNum]) {
        self.init()
        self.$toast("开始下一关");
        return 
      } else {
        self.$toast("游戏结束");
        console.log("游戏结束")

        // 把结果上传到服务器，通知socket,移除该两个玩家并清除数据
        self.$socket.emit('gameOver')
      }
    });
    this.$socket.on("gameOver",function(data){
      console.log(data)
      self.nowGameNum = 0
      // location.href = location.origin + '/room?room=' + self.successId
      self.$router.replace({path: '/room', query:{room: self.successId }})
    })
  }
};
</script>
<style lang="sass" scoped>
.text
  padding-bottom: 20px
  span
    display: inline-block
    margin-right: 10px
    width: 40px
    height: 40px
.select_box
  padding: 20px 60px
  .active
    visibility: hidden
.result
  display: flex
  .box
   flex: 1
</style>

