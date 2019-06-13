const server = require('http').createServer()
const io = require('socket.io')(server)

server.listen(3000, function () {
  console.log('server starting port: 3000')
})

var users = {},
  usocket = {}
// io
// 监听连接
io.on('connection', function (socket) {
  // 玩家登陆

  socket.on('login', function (name) {
    var flag = players.some(function (value) {
      console.log(value.name)
      return value.name === name
    })
    if (flag) {
      socket.emit('home', {
        'flag': true
      })
    } else {
      io.emit('putMessage', {
        'name': name,
        'playerCount': playerCount
      })
      console.log(name + '登陆成功！')
      // 创建玩家
      new Player(socket, name)
      socket.emit('home', {
        'playerCount': playerCount,
        'name': name,
        'gameCount': gameCount
      })

    }
    // create 房间
    socket.on('createRoom', function (userId) {
      users[userId] = userId;
      usocket[userId] = socket;
      usocket[userId].emit('to' + userId, {
        code: 200,
        msg: '创建成功',
        action: 'createRoom'
      });
      // usocket[userId].emit('succCreateRoom',)
    })


  })

  socket.on('disconnecting', (reason) => {
    console.log('disconnecting - ' + reason)
  });

  socket.on('error', function (data) {
    console.log(JSON.stringify(data) + ' - error');
  });

})


// 当服务器关闭的时候
io.on('close', function (socket) {
  console.log('服务器关闭')
})

// 玩家在线总数
playerCount = 0
// 已开启的棋局数
gameCount = 0
// 玩家在线集合
players = []

function Player(socket, name) {
  this.socket = socket // socket对象,玩家通过它来监听数据
  this.name = name // 玩家的名称
  this.state = 0 // 0代表空闲, 1在游戏中
  this.pipei = false // 是否在匹配
  this.fz = false // 是否是房主
  // this.successNum = 0
  this.userData = []

  playerCount++ // 没添加一个玩家，当前在线人数加1

  var self = this

  // 监听玩家是否退出游戏
  this.socket.on('disconnect', function () {
    // 删除数组中的玩家
    // 新的删除方式
    players = players.filter(function (value) {
      return value.name !== self.name
    })
    delete usocket.selfId
    playerCount--
    // 如果退出游戏的玩家正在进行游戏，那么这局游戏也该退出
    // 给与对手胜利

    if (self.state === 1) {
      gameCount--
    }
    clearInterval(self.timer)
    console.log(self.name + '已退出游戏')
    io.emit('putMessage', {
      'name': self.name,
      'action': 'disconnect'
    })

  })

  // 玩家开始匹配
  this.socket.on('play', function () {
    // 如果空闲玩家总数大于或等于2，那么开始游戏
    if (playerCount >= 2) {
      self.pipei = true
      // 如果已经有人在开始匹配了，那么这个玩家就不需要走下面函数了，因为继续执行的话相当于再开一个棋局
      if (isExistFZ(self) > 0) {
        // 保持不动就好，房主会自动找到你的
        return
      }
      // 如果没有房主，那么这个玩家将成为房主
      self.fz = true
      // 可用的玩家数
      var player2 = null
      self.timer = setInterval(function () {
        console.log('正在匹配...')
        if (player2 = findPlayer(self)) {
          console.log('匹配成功')
          // 这里生成了一个游戏局，并监听他们的行为！！！！
          self.gamePlay = new Game(self, player2)
          player2.gamePlay = self.gamePlay
          clearInterval(self.timer)
        }
      }, 1000)
      // 这个时间可以取随机数 比如 5~8s
      setTimeout(() => {
        // 如果6秒内没有匹配到，则匹配智能
        if (self.pipei && self.fz) {
          clearInterval(self.timer)
          self.pipei = false
          self.fz = false
          socket.emit('player less')
        }
      }, 6000)
    } else {
      self.timer = setTimeout(() => {
        socket.emit('player less')
      }, 3000)

    }
  })

  // 取消匹配
  this.socket.on('clearPlay', function () {
    clearInterval(self.timer)
    clearTimeout(self.timer)
  })

  // 监听数据
  this.socket.on('data', function (data) {
    if (self.flag) {
      add_pieces(self.gamePlay, data)
    }
  })

  // 加入房间
  this.socket.on('comeIn', function (data) {
    var userId = data.userId
    var selfId = data.selfId
    if (!usocket[userId]) {
      // 房间已解散
      socket.emit('to' + selfId, {
        code: 502,
        msg: '房间已解散',
        action: 'comeInRoom',
        // selfId: selfId,
        userId: userId
      });
      return
    }
    usocket[selfId] = socket;
    console.log(selfId + ',加入房间成功！')

    // regist ready 
    // console.log(usocket)
    usocket[selfId].emit('to' + selfId, {
      code: 200,
      msg: '加入房间成功',
      action: 'comeInRoom',
      // selfId: selfId,
      userId: userId
    });
    usocket[userId].emit('to' + userId, {
      code: 200,
      msg: '加入房间成功',
      action: 'comeInRoom',
      // selfId: selfId,
      userId: selfId,
      fz: true,
    });
  })

  // 离开房间
  this.socket.on('removeRoom', function (data) {
    var userId = data.userId
    var selfId = data.selfId
    if (data.action && data.action == 'disconnect') {
      delete usocket.userId
      // 通知对方退出
      if (usocket[selfId]) {
        usocket[selfId].emit('to' + selfId, {
          code: 200,
          msg: userId + '已经退出房间成功',
          action: 'removeRoom',
          // selfId: selfId,
          userId: selfId,
        });
      }
    } else {
      console.log(userId + '离开了房间')
      delete usocket.selfId
      // 通知对方退出
      if (usocket[userId]) {
        usocket[userId].emit('to' + userId, {
          code: 200,
          msg: selfId + '已经退出房间成功',
          action: 'removeRoom',
          // selfId: selfId,
          userId: selfId,
        });
      }
    }


  })

  // 玩家准备
  this.socket.on('ready', function (data) {
    const selfId = data.userId
    const vsId = data.vsId
    if (data.cancel) {
      console.log(selfId + ',玩家已取消准备')
      usocket[vsId].emit('to' + vsId, {
        code: 200,
        msg: selfId,
        action: 'ready',
        cancel: true
      });
    } else {
      console.log(selfId + ',玩家已准备')
      usocket[vsId].emit('to' + vsId, {
        code: 200,
        msg: selfId + '玩家已准备',
        action: 'ready',
      });
    }


  })
  // 玩家开始
  this.socket.on('startGame', function (data) {
    const selfId = data.userId
    const vsId = data.vsId
    var player2 = findIdPlayer(vsId)
    // console.log(player2)
    self.socket.emit('play', {
      'name': data.vsId,
    })
    console.log(vsId)
    player2.socket.emit('play', {
      'name': data.userId,
    })

  })

  // 玩家通关
  this.socket.on('successGame', function (data) {
    // const successId = data.successId
    const vsId = data.vsId
    var player2 = findIdPlayer(vsId)
    // self.successNum ++
    self.userData.push({
      time: data.time,
      val: data.val,
      result: true
    })
    player2.userData.push({
      time: '',
      val: data.val,
      result: false
    })
    self.socket.emit('handleResult', {
      selfMsg: self.userData,
      vsMsg: player2.userData,
      result: true
    })
    player2.socket.emit('handleResult', {
      selfMsg: player2.userData,
      vsMsg: self.userData,
      result: false
    })
  })
  // 清除闯关数据
  this.socket.on('gameOver', function (data) {
    self.userData = []
    self.socket.emit('gameOver', {

    })
  })


  players.push(this)

}


// 棋局
function Game(play1, play2) {
  gameCount++

  // 一局棋局上的两个玩家
  this.play1 = play1
  this.play2 = play2

  // 修改游戏状态
  this.play1.state = 1
  this.play2.state = 1
  // 在游戏中，是否匹配为false
  this.play1.pipei = false
  this.play2.pipei = false

  this.play1.fz = false
  this.play1.fz = false
  // 因为在这里对player1和player2玩家进行数据监听的话，那么不管是player1还是player2在客户端触发了的data事件，
  // 这里的player1和player2的监听方法都会被调用，造成监听函数被重复执行两次的现象

  this.play1.socket.emit('play', {
    'name': this.play2.name
  })
  this.play2.socket.emit('play', {
    'name': this.play1.name
  })
}

// 是否有房主在匹配
function isExistFZ(player1) {
  // 过滤出所有的空闲玩家，并返回成一个数组
  var availablePlayers = players.filter(function (val) {
    // 玩家空闲状态，并已经在匹配
    return val.state === 0 && val.pipei && player1 !== val && val.fz
  })
  return availablePlayers.length
}

// 返回一个可用的玩家
function findPlayer(player1) {
  // 过滤出所有的空闲玩家，并返回成一个数组
  var availablePlayers = players.filter(function (val) {
    // 玩家空闲状态，并已经在匹配
    return val.state === 0 && val.pipei && player1 !== val && !val.fz
  })
  if (availablePlayers.length > 0) {
    // 从空闲玩家中随机选取一个玩家
    var index = ~~(Math.random() * availablePlayers.length)
    // 将选中的玩家返回出去
    return availablePlayers[index]
  }
  return null
}

// 返回一个具有该Id的玩家
function findIdPlayer(userId) {
  var player = players.filter(function (val) {
    if (val.name == userId) return val
  })
  return player[0]
}

// 选中词语
function add_pieces(self, data) {
  console.log(data)
  // check_result(self, self.arr, position, color)

}