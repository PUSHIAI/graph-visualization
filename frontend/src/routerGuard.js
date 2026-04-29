/*
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2022-04-18 15:41:51
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-04-19 17:19:22
 * @FilePath: /GraphInsight/src/routerGuard.js
 */
import router from './router'
import store from './store'

router.beforeEach(async function(to, from, next){
    console.log(from,to);
    console.log("store:", store);
    // 跳转路由时取消前路由页面下的接口请求
    store.state.abortControllerArr.abort();
    store.commit("resetAbortController");
    next();
})