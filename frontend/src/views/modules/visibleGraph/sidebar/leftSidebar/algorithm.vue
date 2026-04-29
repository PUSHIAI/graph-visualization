<!--
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2021-12-10 13:50:37
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-03-29 14:45:59
 * @FilePath: /GraphInsight/src/views/modules/visibleGraph/sidebar/leftSidebar/algorithm.vue
-->
<template>
    <div class="">
        <el-tabs class="custom-tabs custom-tabs-title" v-model="activeTab">
            <el-tab-pane label="最短路径" name="shortPath">
                <shortPath 
                    ref="shortPath" 
                    :selectNodes="selectNodes" 
                    :projectId="projectId" 
                    @shortPath="shortPath"
                    @resetPaths="resetPaths"
                ></shortPath>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import shortPath from './algorithm/shortPath.vue';

export default {
    props:{
        selectNodes:Array,
        projectId:Number,
    },
    components:{shortPath},
    data() {
        return {
            activeTab:'shortPath'
        }
    },
    methods: {
        shortPath(nodes,links){
            this.$emit('emitEvent','shortPath',nodes,links);
        },
        resetPaths() {
            this.$emit('emitEvent', 'clearShortPath');
        }
    }
}
</script>

<style lang="less" scoped>
.custom-tabs{
    /deep/ .el-tab-pane{
        width:100%;
    }
}
</style>