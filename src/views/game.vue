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
                <van-tag :type="item.result ?'success' : 'danger'">{{item.result ? '获胜' : '失败'}}</van-tag>
              </p>
            </div>
          </van-panel>
        </div>
        <div class="box vs">
          <van-panel :title="vsUser.username || '无名氏'" status="在线">
            <div>
              <p class="time" v-for="(item,idx) in vsUserData" :key="idx">
                第{{idx + 1}}局用时： {{item.time}}s
                <van-tag :type="item.result ?'success' : 'danger'">{{item.result ? '获胜' : '失败'}}</van-tag>
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
import { shuffle, rnd } from "@/util";
import { setTimeout } from "timers";
// var vsTimer = null

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
      nowTime: "",
      successId: "",
      vsTimer: "",
      isRobot: false
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
      const self = this;
      const canIndex = this.idiomArr.findIndex(item => {
        if (!item || item == "*") return item;
      });

      if (canIndex == -1) {
        console.log("开始校验结果");
        const idiomStr = String(this.idiomArr.join(""));
        if (idiomStr === this.idiom.val) {
          // right
          this.$toast("回答正确");
          // checkRobot
          const time = new Date().getTime() - this.nowTime;
          if (self.isRobot) {
            // clear
            console.log('清除定时器')
            console.log(self.vsTimer)
            clearTimeout(self.vsTimer._id || '');
            self.userData.push({
              time: time,
              result: true
            });
            self.vsUserData.push({
              time: "",
              result: false
            });
            
            self.nextOne()
          } else {
            this.$socket.emit("successGame", {
              vsId: self.vsUser.username,
              time: time,
              val: idiomStr
            });
          }

          console.log(self.user.username);
        } else {
          this.$toast("回答错误");
        }
      }
    },
    init() {
      // this.idiomArr = [];
      // this.mixArr = [];
      console.log("开始初始化");
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

      this.nowTime = new Date().getTime();
    },
    robotAct() {
      const random = rnd(1, 6);
      console.log('添加定时器');
      // clearTimeout(this.vsTimer._id || '')
      console.log(this.vsTimer)
      this.vsTimer = setTimeout(() => {
        // 机器人获胜
        console.log("您失败了")
        this.$toast("您失败了");
        this.userData.push({
          time: "",
          result: false
        });

        const time = new Date().getTime() - this.nowTime;
        this.vsUserData.push({
          time: time,
          result: true
        });
        this.nextOne();
      }, random * 2000);
      // console.log(vsTimer)
    },
    nextOne() {

      this.nowGameNum++
      if (this.allIdiom[this.nowGameNum]) {
        
        this.$toast("开始下一关");
        setTimeout(()=>{
          this.init()
          this.robotAct()
        },5000)
        
        return;
      } else {
        this.$toast("游戏结束");
        console.log("游戏结束");
        this.getResult()
        // 统计结果，传到服务器
        // 回到首页
        // this.$router.replace('/home')
      }
    },
    getResult(){
      const selfWin = this.userData.filter(item=>{
        if(item.result) return item
      })
      const vsWin = this.vsUserData.filter(item=>{
        if(item.result) return item
      })
      if(selfWin.length > vsWin.length) {
        console.log('您获得了最终的胜利')
      } else {
        console.log('对方获得了最终的胜利')
      }
    }
  },
  mounted() {
    // check robot
    this.init();

    if (this.vsUser.type && this.vsUser.type == "robot") {
      this.isRobot = true;
      this.robotAct();
    } else {
      // game init
      // 开启胜利监听

      const self = this;
      this.$socket.on("handleResult", function(data) {
        self.userData = data.selfMsg;
        self.vsUserData = data.vsMsg;
        // console.log(data)
        self.$toast(data.result ? "您获胜了" : "您失败了");
        self.successId = data.result
          ? self.user.username
          : self.vsUser.username;
        // 判断进入下一个关卡
        self.nowGameNum++;
        console.log(self.nowGameNum);
        console.log(self.allIdiom[self.nowGameNum]);
        if (self.allIdiom[self.nowGameNum]) {
          self.init();
          self.$toast("开始下一关");
          return;
        } else {
          self.$toast("游戏结束");
          console.log("游戏结束");

          // 把结果上传到服务器，通知socket,移除该两个玩家并清除数据
          self.$socket.emit("gameOver");
        }
      });
      this.$socket.on("gameOver", function(data) {
        console.log(data);
        self.nowGameNum = 0;
        // location.href = location.origin + '/room?room=' + self.successId
        self.$router.replace({
          path: "/room",
          query: { room: self.successId }
        });
      });
    }
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

