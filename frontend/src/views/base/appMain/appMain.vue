<!--
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2021-12-07 15:33:51
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2021-12-10 11:40:38
 * @FilePath: /GraphInsight/src/views/base/appMain/appMain.vue
-->
<template>
    <div class="app-main">
        <transition name="app-main-transition">
            <router-view/>
        </transition>
    </div>
</template>

<script>
export default {
    
}
</script>

<style lang="less" scoped>
.app-main {
    height: 100%;
}
.app-main-transition-enter, .app-main-transition-leave-to {
    opacity: 0;
}
.app-main-transition-enter-to, .app-main-transition-leave {
    opacity: 1;
}
.app-main-transition-enter-active{
    transition: all 1s;
}
</style>