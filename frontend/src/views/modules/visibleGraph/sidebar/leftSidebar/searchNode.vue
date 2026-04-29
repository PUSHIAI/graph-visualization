<!--
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2021-12-10 13:50:37
 * @Feature: 
 * @LastEditors: huangyixin
 * @LastEditTime: 2022-03-16 16:46:36
 * @FilePath: /GraphInsight/src/views/modules/visibleGraph/sidebar/leftSidebar/searchNode.vue
-->
<template>
    <div class="search-node">
        <el-tabs class="custom-tabs custom-tabs-title" v-model="activeTab" @tab-click="tabClick">
            <el-tab-pane label="基础查询" name="basicSearch">
                <basicSearch ref="basicSearch" @addNode="addNode" :nodeTypes="nodeTypes" :nodeAttributes="nodeAttributes" :projectId="projectId" :nodesIdsInGraph="nodesIdsInGraph"></basicSearch>
            </el-tab-pane>
            <el-tab-pane label="名单查询" name="batchUpload">
                <batchUpload @addNode="addNode" :projectId="projectId"></batchUpload>
            </el-tab-pane>
            <!-- <el-tab-pane label="cypher" name="cypher">
                
            </el-tab-pane> -->
        </el-tabs>
    </div>
</template>

<script>
import basicSearch from './searchTab/basicSearch.vue';
import batchUpload from './searchTab/batchUpload.vue';

export default {
    props:{
        nodeTypes:Array,
        nodeAttributes:Array,
        projectId:Number,
        nodesIdsInGraph:Array
    },
    components:{batchUpload,basicSearch},
    data() {
        return {
            activeTab: 'basicSearch',
        }
    },
    activated(){
        this.tabClick();
    },
    methods: {
        addNode(nodes = [],links = []){
            console.log(nodes,links);
            this.$emit('emitEvent','addNode',nodes,links);
        },
        tabClick(){
            switch(this.activeTab){
                case 'basicSearch':
                    // this.$nextTick(()=>{
                        setTimeout(()=>{
                            this.$refs.basicSearch.$refs.searchInput.$el.children[0].focus();
                        },0);
                    // });
                    break;
            }
        }
    }
}
</script>

<style lang="less" scoped>
.search-node {
}
</style>