<!--
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2021-12-07 11:57:57
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2021-12-10 11:43:40
 * @FilePath: /GraphInsight/src/App.vue
-->
<template>
    <div id="app" class="app-theme">
      <router-view name="top"/>
      <transition name="app-transition">
        <router-view/>
      </transition>
    </div>
</template>

<style lang="less">
@import "./assets/css/app-theme/theme.less";
#app {
  height: 100%;
}
.app-transition-enter, .app-transition-leave-to {
    opacity: 0;
}
.app-transition-enter-to, .app-transition-leave {
    opacity: 1;
}
.app-transition-enter-active{
    transition: all 1s;
}
</style>
