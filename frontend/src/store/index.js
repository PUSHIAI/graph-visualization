/*
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2021-12-07 11:57:57
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-04-18 15:43:59
 * @FilePath: /GraphInsight/src/store/index.js
 */
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    abortControllerArr: new AbortController()
  },
  mutations: {
    resetAbortController(state) {
      state.abortControllerArr = new AbortController();
    }
  },
  actions: {
  },
  modules: {
  }
})
