<!--
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2021-12-07 14:52:21
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2021-12-08 14:28:11
 * @FilePath: /GraphInsight/src/views/base/layout/layout.vue
-->
<template>
    <div class="layout">
        <app-main></app-main>
    </div>
</template>

<script>
import appMain from "@/views/base/appMain/appMain.vue"
export default {
    components: {
        appMain
    }
}
</script>

<style lang="less" scoped>
.layout {
    height: 100%;
}
</style>