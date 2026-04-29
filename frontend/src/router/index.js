/*
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2021-12-07 11:57:57
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2021-12-10 10:36:31
 * @FilePath: /GraphInsight/src/router/index.js
 */
import Vue from 'vue'
import VueRouter from 'vue-router'
import layout from '@/views/base/layout/layout.vue'
import layoutWithLeftSideBar from '@/views/base/layout/layoutWithLeftSideBar.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/frontPage'
  },
  {
    path: '/frontPage',
    components: {
      default: layout,
    },
    name: '主页',
    redirect: '/frontPage/index',
    children: [{
      path: 'index',
      component: () => import('@/views/modules/frontPage/index.vue')
    }]
  },
  {
    path: '/visibleGraph',
    components: {
      default: layout,
    },
    redirect: '/visibleGraph/index',
    name: '可视化',
    children: [{
      path: 'index',
      component: () => import('@/views/modules/visibleGraph/index.vue')
    }]
  }
]

const router = new VueRouter({
  routes
})

export default router
