<!--
 * @Author: huangyixin
 * @Date: 2021-12-15 11:10:39
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-04-11 10:11:45
 * @Description: In User Settings Edit
 * @FilePath: /GraphInsight/src/views/modules/visibleGraph/sidebar/leftSidebar/expand/expand4Multi.vue
-->
<template>
    <div class="expand-panel flex-column">
        <div class="flex-shrink">
            <div class="fs14 relative">已选节点<span class="select-number">{{ selectNodes.length }}</span></div>
            <ul class="select-node-list" v-if="selectNodes.length>0">
                <li class="select-node-item" v-for="item of selectNodes" :key="item.id"  :title="item.name">
                    <div class="select-node-name">{{ item.name || item.id }}</div>
                    <span class="select-node-item-close" v-if="selectNodes.length>2" @click="cancelSelectionOne(item.id)"><i class="el-icon-close"></i></span>
                </li>
            </ul>
            <div class="select-tip fs12 font-color-sub" v-else>
                请选择需要展开的节点
            </div>
        </div>
        <div class="expand-select-con flex flex-column">
            <div class="fs14 mt18 flex-shrink mb10">展开类型选择</div>
            <div class="expand-select-tree flex">
                <!-- <div class="expand-select-tree-title fs14">概念</div>
                <el-tree
                    ref="nodeTree"
                    :data="nodeTreeData"
                    show-checkbox
                    node-key="id"
                    :props="defaultProps"
                    default-expand-all
                    :default-checked-keys="defaultCheckedNode"
                ></el-tree> -->
                <div class="expand-select-tree-title fs14">关系</div>
                <el-tree
                    class="mb10"
                    ref="linkTree"
                    :data="linkTreeData"
                    show-checkbox
                    node-key="id"
                    :props="defaultProps"
                    default-expand-all
                    :default-checked-keys="defaultCheckedLink"
                ></el-tree>
            </div>
        </div>
        <div class="flex-shrink bottom-btn-con" style="margin-bottom:-22px">
            <el-button type="primary" size="small" style="width:100%" icon="el-icon-cpu" round @click="expandNodes" :loading="loading">展开</el-button>
        </div>
    </div>
</template>

<script>
import service from '@/api/service';
import {show_message} from '@/utils/message';

export default {
    data() {
        return {
            nodeTreeData: [],
            linkTreeData: [],
            defaultProps: {
                children: 'children',
                label: 'name'
            },
            defaultCheckedNode: [],
            defaultCheckedLink: [],
            loading:false
        }
    },
    props:{
        selectNodes:Array,
        nodeTypes:Array,
        linkTypes:Array,
        projectId:Number,
    },
    watch:{
        nodeTypes(){
            this.setNodeType();
        },
        linkTypes(){
            this.setLinkType();
        }
    },
    mounted(){
        this.setNodeType();
        this.setLinkType();
    },
    methods: {
        cancelSelectionOne(id){
            this.$emit('cancelSelectionOne',id)
        },
        setNodeType(){
            this.nodeTreeData = this.nodeTypes.map(e=>{
                return{
                    id:e,
                    name:e
                }
            });
        },
        setLinkType(){
            this.linkTreeData = this.linkTypes.map(e=>{
                return{
                    id:e,
                    name:e
                }
            });
        },
        expandNodes(){
            let params = {
                param: {
                    idList:this.selectNodes.map(e=>`${e.id}`),
                    // vertexLabelList:this.$refs.nodeTree.getCheckedNodes().map(e => e.name),
                    edgeTypeList:this.$refs.linkTree.getCheckedNodes().map(e => e.name)
                },
                urlParam: {
                    projectId: this.projectId
                }
            };
            this.loading = true;
            this.$emit("searchingExpandNode", true);
            service.doRequest("expandNode", params).then(result => {
                if (result.status == 200) {
                    this.$emit('addNode',result.data.vertexList,result.data.edgeList.map(e=>{
                        return {
                            ...e,
                            source:e.startVertexId,
                            target:e.endVertexId
                        }
                    }));
                }else{
                    show_message(result.message);
                }
                this.loading = false;
                this.$emit("searchingExpandNode", false);
            },()=>{
                this.loading = false;
                this.$emit("searchingExpandNode", false);
            });
        }
    }
}
</script>

<style lang="less" scoped>
.expand-panel {
    padding:10px 18px 22px;
    overflow: hidden;
    height:100%;
    .select-number{
        font-size: 10px;
        background: #0D86FF;
        color: #fff;
        padding: 2px 8px;
        border-radius: 10px;
        position: absolute;
        left: 60px;
        top: 1px;
    }
    .select-node-list{
        margin-top: 12px;
        margin-right: -18px;
        margin-left: -18px;
        padding: 0 18px;
        max-height: 174px;
        overflow: auto;
        .select-node-item{
            background: #F6F6F9;
            position: relative;
            border-radius: 16px;
            margin-bottom: 6px;
            padding:8px 20px 8px 16px;
            line-height: 14px;
            .select-node-name{
                font-size: 12px;
                color: #464C5D;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                width:100%;
            }
            .select-node-item-close{
                position: absolute;
                right: 6px;
                height: 16px;
                width: 16px;
                border-radius: 8px;
                background: #C3CDE2;
                font-size: 10px;
                text-align: center;
                line-height: 16px;
                color: #fff;
                cursor: pointer;
                top: 50%;
                margin-top:-8px;
                display: none;
            }
            &:hover{
                background: #E8EFFF;
                .select-node-name{
                    color:#0D86FF;
                }
                .select-node-item-close{
                    display: block;
                }
            }
        }
    }
    .expand-select-con{
        overflow: hidden;
        .expand-select-tree{
            border-radius: 6px;
            margin: 0 -18px;
            padding:0 18px;
            overflow: auto;
            .expand-select-tree-title{
                background: #F7F8FA;
                padding: 10px 0 7px 16px;
                background: #F7F8FA;
                border-bottom:1px solid #D0D9E2;
            }
            .expand-select-tree-title:last-child{
                border-top:1px solid #D0D9E2;
            }
            /deep/ .el-tree{
                background: #F7F8FA;
                padding-top: 10px;
                padding-left: 4px;
            }
        }
    }
    .select-tip{
        text-align: center;
        height:48px;
        padding-top: 24px;
    }
}
</style>