<!--
 * @Author: huangyixin
 * @Date: 2021-12-15 11:10:39
 * @LastEditors: huangyixin
 * @LastEditTime: 2022-01-19 20:59:34
 * @Description: In User Settings Edit
 * @FilePath: /GraphInsight/src/views/modules/visibleGraph/sidebar/leftSidebar/expand/expand4SingleBackup.vue
-->
<template>
    <div class="expand-panel flex-column">
        <div class="expand-panel-title flex-shrink">{{ dbclickNode.name }}</div>
        <template v-if="!loading">
            <div class="link-group flex">
                <div>
                    <div class="flex-left link-group-title">
                        <img class="flex-shrink mr4" src="@icons/png/expand/out.png" style="width:21px"/>
                        <span class="font-color-sub fs14 flex">出度边</span>
                    </div>
                    <ul class="link-group-content">
                        <li v-for="(v,k) in inLinks" :key='`out-${k}`'>
                            <div class="link-group-content-type fs12" @click="toggleList(v,k,'in')">
                                <i :class="v.expand?'el-icon-caret-bottom':'el-icon-caret-right'" class="mr8" :style="{'opacity':v.nodeLeftCount==v.nodeCount?0:1}"></i>
                                <span class="mr4">{{ k }}</span>
                                <span>{{ v.nodeLeftCount }}</span>
                                <span>/</span>
                                <span>{{ v.nodeCount }}</span>
                            </div>
                            <ul class="link-group-content-node" v-show="v.expand">
                                <li class="fs12" v-for="(nv,nk) in v.nodes" :key='`out-${k}-${nk}`' @click="addData(nv)" v-show="nv.linkCountInGraph<nv.linkCount">
                                    <span class="mr4">{{ nv.node.name || nk }}</span>
                                    <span>{{ nv.linkCountInGraph }}</span>
                                    <span>/</span>
                                    <span>{{ nv.linkCount }}</span>
                                    <span class="link-group-content-node-icon"><i class="el-icon-plus"></i></span>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <div>
                    <div class="flex-left link-group-title">
                        <img class="flex-shrink mr4" src="@icons/png/expand/in.png" style="width:21px"/>
                        <span class="font-color-sub fs14 flex">入度边</span>
                    </div>
                    <ul class="link-group-content">
                        <li v-for="(v,k) in outLinks" :key='`out-${k}`'>
                            <div class="link-group-content-type fs12" @click="toggleList(v,k,'out')">
                                <i :class="v.expand?'el-icon-caret-bottom':'el-icon-caret-right'" class="mr8" :style="{'opacity':v.nodeLeftCount==v.nodeCount?0:1}"></i>
                                <span class="mr4">{{ k }}</span>
                                <span>{{ v.nodeLeftCount }}</span>
                                <span>/</span>
                                <span>{{ v.nodeCount }}</span>
                            </div>
                            <ul class="link-group-content-node" v-show="v.expand">
                                <li class="fs12" v-for="(nv,nk) in v.nodes" :key='`out-${k}-${nk}`' @click="addData(nv)" v-show="nv.linkCountInGraph<nv.linkCount">
                                    <span class="mr4">{{ nv.node.name || nk }}</span>
                                    <span>{{ nv.linkCountInGraph }}</span>
                                    <span>/</span>
                                    <span>{{ nv.linkCount }}</span>
                                    <span class="link-group-content-node-icon"><i class="el-icon-plus"></i></span>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="flex-shrink bottom-btn-con" style="margin:0 0 -22px">
                <el-button type="primary" size="small" style="width:100%" icon="el-icon-plus" round @click="addAll">添加全部</el-button>
            </div>
        </template>
        <div class="flex flex-column flex-center" v-else>
            <ring-loader color="#0D86FF" :size="90"></ring-loader>
            <span class="mt10">加载中...</span>
        </div>
    </div>
</template>

<script>
import service from '@/api/service';
import {show_message} from '@/utils/message';
import { RingLoader } from '@saeris/vue-spinners';

export default {
    components:{
        RingLoader
    },
    data() {
        return {
            loading:false,
            inLinks:{},
            outLinks:{},
            thisNode:{}
        }
    },
    props:{
        dbclickNode:Object,
        nodeTypes:Array,
        linkTypes:Array,
        projectId:Number,
        linkInGraphId:Array
    },
    computed:{
    },
    watch:{
        dbclickNode(){
            this.expandNodes();
        },
        linkInGraphId(){
            this.updateLinkGroup();
        }
    },
    mounted(){
        this.expandNodes();
    },
    methods: {
        expandNodes(){
            this.inLinks = {};
            this.outLinks = {};

            if(this.loading){
                service.cancelRequest();
            }

            let params = {
                param: {
                    idList:[this.dbclickNode.id]
                },
                urlParam: {
                    projectId: this.projectId
                }
            };
            this.loading = true;
            service.doRequest("expandNode", params).then(result => {
                if (result.status == 200) {
                    this.allData = result.data;
                    this.dealRelation(result.data);
                }else{
                    show_message(result.message);
                }
                this.loading = false;
            },()=>{
                this.loading = false;
            });
        },
        dealRelation(graph){
            let nodeMap = {},
                linkGroup = {
                    in:{},
                    out:{}
                };
            for(let node of graph.vertexList){
                nodeMap[node.id] = node;
                if(this.dbclickNode.id == node.id){
                    this.thisNode = node;
                }
            }
            for(let link of graph.edgeList){
                let isSource = link.startVertexId == this.dbclickNode.id,
                    otherNodeId =  isSource ? link.endVertexId : link.startVertexId,
                    otherNode = nodeMap[otherNodeId],
                    linkPart = linkGroup[isSource?'out':'in'];
                
                // 按照边的类型分类
                if(!linkPart[link.type]){
                    linkPart[link.type] = {
                        expand:false,
                        nodes:{},
                        nodeCount:0, //该类型的线有几个点
                        nodeLeftCount:0, //该类型还能添加几个点
                    }
                }
                if(!linkPart[link.type].nodes[otherNodeId]){
                    linkPart[link.type].nodes[otherNodeId] = {
                        node:otherNode,
                        links:[],
                        linkCount:0,
                        linkCountInGraph:0
                    }
                    linkPart[link.type].nodeCount++;
                }
                linkPart[link.type].nodes[otherNodeId].linkCount++;
                if(this.linkInGraphId.includes(link.id)){
                    linkPart[link.type].nodes[otherNodeId].linkCountInGraph++;
                }else{
                    linkPart[link.type].nodes[otherNodeId].links.push(link);
                }
            }
            this.inLinks = linkGroup.in;
            this.outLinks = linkGroup.out;
            this.updateLinkGroup();
        },
        updateLinkGroup(){
            for(let k in this.inLinks){
                let linkType = this.inLinks[k],
                    nodeCount = 0,
                    nodeLeftCount = 0;
                     
                for(let nodeKey in linkType.nodes){
                    let nodeValue = linkType.nodes[nodeKey],
                        count = 0;
                    nodeCount++;
                    for(let link of nodeValue.links){
                        if(this.linkInGraphId.includes(link.id)){
                            count++;
                        }
                    }
                    nodeValue.linkCountInGraph = count;
                    if(nodeValue.linkCountInGraph == nodeValue.linkCount){
                        nodeLeftCount++;
                    }
                }
                linkType.nodeLeftCount = nodeLeftCount;
                linkType.nodeCount = nodeCount;
            }
            for(let k in this.outLinks){
                let linkType = this.outLinks[k],
                    nodeCount = 0,
                    nodeLeftCount = 0;
                for(let nodeKey in linkType.nodes){
                    let nodeValue = linkType.nodes[nodeKey],
                        count = 0;
                    nodeCount++;
                    for(let link of nodeValue.links){
                        if(this.linkInGraphId.includes(link.id)){
                            count++;
                        }
                    }
                    nodeValue.linkCountInGraph = count;
                    if(nodeValue.linkCountInGraph == nodeValue.linkCount){
                        nodeLeftCount++;
                    }
                }
                linkType.nodeLeftCount = nodeLeftCount;
                linkType.nodeCount = nodeCount;
            }
            console.log(this.inLinks,this.outLinks);
        },
        toggleList(value,key,type){
            if(value.nodeLeftCount==value.nodeCount){
                console.log('return');
                return;
            }
            if(type == 'in'){
                for(let k in this.outLinks){
                    this.outLinks[k].expand = false;
                }
                for(let k in this.inLinks){
                    let item = this.inLinks[k];
                    if(k == key){
                        item.expand = !item.expand;
                    }else{
                        item.expand = false;
                    }
                }
            }else{
                for(let k in this.inLinks){
                    this.inLinks[k].expand = false;
                }
                for(let k in this.outLinks){
                    let item = this.outLinks[k];
                    if(k == key){
                        item.expand = !item.expand;
                    }else{
                        item.expand = false;
                    }
                }
            }
        },
        addData(graph){
            this.$emit('addNode',[graph.node,this.thisNode],graph.links.map(e=>{
                return {
                    ...e,
                    source:e.startVertexId,
                    target:e.endVertexId
                }
            }));
        },
        addAll(){
            this.$emit('addNode',this.allData.vertexList,this.allData.edgeList.map(e=>{
                return {
                    ...e,
                    source:e.startVertexId,
                    target:e.endVertexId
                }
            }));
        },
    }
}
</script>

<style lang="less" scoped>
.expand-panel {
    padding:0px 0px 22px;
    overflow: hidden;
    height:100%;
    .expand-panel-title{
        padding:0 18px;
        margin-bottom: 10px;
    }
    .link-group{
        overflow: auto;
        .link-group-title{
            padding:10px 18px;
        }
        .link-group-content{
            padding: 0 12px;
            &>li{
                margin-bottom: 12px;
            }
            .link-group-content-type{
                background: #F6F6F9;
                padding: 6px 12px;
                border-radius: 16px;
                &:hover{
                    cursor:pointer;
                }
                span{
                    color:#040C15;
                }
            }
            .link-group-content-node{
                padding-left: 36px;
                color: #464C5D;
                li{
                    margin: 8px 0px;
                    cursor: pointer;
                    position: relative;
                    padding-right: 30px;
                    .link-group-content-node-icon{
                        position: absolute;
                        height:16px;
                        width:16px;
                        text-align: center;
                        line-height: 16px;
                        background: #0D86FF;
                        border-radius: 16px;
                        right: 10px;
                        font-weight: 800;
                        top: 1px;
                        display: none;
                        i{
                            color:white;
                            font-weight: 800;
                            font-size: 11px;
                        }
                    }
                    &:hover{
                        color:#0D86FF;
                        .link-group-content-node-icon{
                            display: block;
                        }
                    }
                }
            }
        }
    }
}
</style>