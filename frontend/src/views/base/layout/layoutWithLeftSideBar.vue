<!--
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2021-12-07 17:53:06
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2021-12-08 14:27:17
 * @FilePath: /GraphInsight/src/views/base/layout/layoutWithLeftSideBar.vue
-->
<template>
    <div class="layout-left-sidebar">
        <sidebar></sidebar>
        <app-main class="app-main"></app-main>
    </div>
</template>

<script>
import sidebar from "@/views/base/sidebar/sidebar.vue";
import appMain from "@/views/base/appMain/appMain.vue";
export default {
    components: {
        sidebar,
        appMain
    }
}
</script>

<style lang="less" scoped>
.layout-left-sidebar {
    height: 100%;
    display: flex;
    .app-main {
        flex: 1;
    }
}
</style>