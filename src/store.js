import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: {},
    vsUser: {},
    handleGame: false,
    // removeUser: ''
  },
  mutations: {
    SETUSER: (state, data)=>{
      state.user = data
    },
    SETVSUSER: (state, data)=>{
      state.vsUser = data
    },
    SETHANDLEGAME: (state, data)=>{
      state.handleGame = data
    }
  },
  actions: {
    
  }
})
