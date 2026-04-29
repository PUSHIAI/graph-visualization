<!--
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2022-02-11 15:05:45
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-03-08 11:24:25
 * @FilePath: /GraphInsight/src/views/modules/visibleGraph/sidebar/leftSidebar/editGraph.vue
-->
<template>
    <div class="edit-graph">
        <el-tabs class="custom-tabs custom-tabs-title" v-model="activeTab" @tab-click="tabClick">
            <el-tab-pane label="新增点" name="addNode">
                <add-node
                    :nodeTypes="nodeTypes"
                    @addVertex="addVertex"
                    @getGraphInfo="getGraphInfo"
                ></add-node>
            </el-tab-pane>
            <el-tab-pane label="新增边" name="addLink">
                <add-link
                    :selectNodes="selectNodes"
                    :linkTypes="linkTypes"
                    @cancelSelection="cancelSelection"
                    @addEdge="addEdge"
                    @getGraphInfo="getGraphInfo"
                ></add-link>
            </el-tab-pane>
            <el-tab-pane label="批量新增" name="batchAdd">
                <batch-add
                    @getGraphInfo="getGraphInfo"
                ></batch-add>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import addNode from "./editTab/addNode.vue"
import addLink from "./editTab/addLink.vue"
import batchAdd from "./editTab/batchAdd.vue"
export default {
    components: {
        addNode,
        addLink,
        batchAdd
    },
    props: {
        selectNodes: {
            type: Array,
            default: function() {
                return []
            }
        },
        nodeTypes: {
            type: Array,
            default: function() {
                return []
            }
        },
        linkTypes: {
            type: Array,
            default: function() {
                return []
            }
        },
    },
    data() {
        return {
            activeTab: 'addNode'
        }
    },
    methods: {
        tabClick() {

        },
        cancelSelection() {
            this.$emit("emitEvent", "cancelSelection");
        },
        addVertex(nodes) {
            this.$emit("emitEvent", "addNewElements", nodes);
        },
        addEdge(links) {
            this.$emit("emitEvent", "addNewElements", [], links);
        },
        getGraphInfo() {
            this.$emit("emitEvent", "getGraphInfo");
        }
    }
}
</script>

<style lang="less" scoped>

</style>