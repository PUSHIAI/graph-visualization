/*
 * @Author: huangyixin
 * @Date: 2021-12-02 17:33:43
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-04-18 15:48:16
 * @Description: In User Settings Edit
 * @FilePath: /GraphInsight/src/main.js
 */
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import '@/assets/icons';

import '@/assets/css/common.less';
import '@/assets/css/elementOverwrite.less';
import '@/directives';
import './routerGuard'

Vue.use(ElementUI);

Vue.config.productionTip = false

import VueFullscreen from 'vue-fullscreen';
Vue.use(VueFullscreen)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
