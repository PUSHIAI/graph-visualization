<!--
 * @Author: huangyixin
 * @Date: 2021-12-15 11:10:39
 * @LastEditors: huangyixin
 * @LastEditTime: 2022-03-18 09:48:27
 * @Description: In User Settings Edit
 * @FilePath: /GraphInsight/src/views/modules/visibleGraph/sidebar/leftSidebar/expand/expand4Single.vue
-->
<template>
    <div class="expand-panel flex-column">
        <template v-if="!loading">
            <div class="expand-panel-title flex-shrink">
                {{ dbclickNode.name }}
                <el-tooltip effect="dark" content="刷新展开数据">
                     <i class="el-icon-refresh refresh-icon" @click="forceExpand"></i>
                </el-tooltip>
            </div>
            <div class="link-group flex">
                <!-- 出度边 -->
                <div>
                    <div class="link-group-title fs14">
                        <img class="flex-shrink mr4" src="@icons/png/expand/out.png" style="width:21px"/>
                        <span class="font-color-sub mr4">出度边</span>
                        <span>{{ statis.outInGraphCount }}</span>
                        <span>/</span>
                        <span>{{ statis.outCount }}</span>
                        <span class="link-group-content-node-icon" @click.stop="addInOutLink('out')" v-if="statis.outInGraphCount<statis.outCount"><i class="el-icon-plus"></i></span>
                    </div>
                    <ul class="link-group-content">
                        <!-- 第一层，按照节点类型 -->
                        <li v-for="(nodeType,nodeKey) in outLinks" :key='`out-${nodeKey}`'>
                            <div class="link-group-content-type flex-left-center fs12">
                                <span class="mr4 flex text-ellipsis">{{ nodeKey }}</span>
                                <span class="flex-shrink">{{ outStatis[nodeKey].inGraphCount }}</span>
                                <span class="flex-shrink">/</span>
                                <span class="flex-shrink">{{ outStatis[nodeKey].count }}</span>
                                <span class="link-group-content-node-icon" @click.stop="addNodeType('out',nodeKey)" v-if="outStatis[nodeKey].inGraphCount<outStatis[nodeKey].count"><i class="el-icon-plus"></i></span>
                            </div>
                            <!-- 第二层，按照边的类型 -->
                            <ul class="link-group-content-typeMain">
                                <li v-for="(v,k) in nodeType" :key='`out-${nodeKey}-${k}`'>
                                    <div class="link-group-content-linkType fs12 flex-left-center" @click="toggleList(nodeKey,v,k,'out')" :style="{'cursor':v.nodeCountInGraph==v.nodeCount?'default':'pointer',opacity:v.nodeCountInGraph==v.nodeCount?0.5:1}">
                                        <i :class="v.expand?'el-icon-caret-bottom':'el-icon-caret-right'" class="mr8" v-if="v.nodeCountInGraph!=v.nodeCount"></i>
                                        <div class="link-group-content-dot" v-else><span></span></div>
                                        <span class="mr4">{{ k }}</span>
                                        <span>{{ v.nodeCountInGraph }}</span>
                                        <span>/</span>
                                        <span>{{ v.nodeCount }}</span>
                                        <span class="link-group-content-node-icon" v-if="v.nodeCountInGraph!=v.nodeCount" @click.stop="addLinkType(v.nodes)"><i class="el-icon-plus"></i></span>
                                    </div>
                                    <ul class="link-group-content-node" v-show="v.expand">
                                        <li class="fs12" v-for="(nv,nk) in v.nodes" :key='`out-${nodeKey}-${k}-${nk}`' @click="addData(nv)" v-show="nv.linkCountInGraph<nv.linkCount">
                                            <span class="mr4">{{ nv.node.name || nk }}</span>
                                            <span>{{ nv.linkCountInGraph }}</span>
                                            <span>/</span>
                                            <span>{{ nv.linkCount }}</span>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <!-- 入度边 -->
                <div>
                    <div class="link-group-title fs14">
                        <img class="flex-shrink mr4" src="@icons/png/expand/in.png" style="width:21px"/>
                        <span class="font-color-sub mr4">入度边</span>
                        <span>{{ statis.inInGraphCount }}</span>
                        <span>/</span>
                        <span>{{ statis.inCount }}</span>
                        <span class="link-group-content-node-icon" @click.stop="addInOutLink('in')"  v-if="statis.inInGraphCount<statis.inCount"><i class="el-icon-plus"></i></span>
                    </div>
                    <ul class="link-group-content">
                        <!-- 第一层，按照节点类型 -->
                        <li v-for="(nodeType,nodeKey) in inLinks" :key='`in-${nodeKey}`'>
                            <div class="link-group-content-type flex-left-center fs12">
                                <span class="mr4 flex text-ellipsis">{{ nodeKey }}</span>
                                <span class="flex-shrink">{{ inStatis[nodeKey].inGraphCount }}</span>
                                <span class="flex-shrink">/</span>
                                <span class="flex-shrink">{{ inStatis[nodeKey].count }}</span>
                                <span class="link-group-content-node-icon" @click.stop="addNodeType('in',nodeKey)" v-if="inStatis[nodeKey].inGraphCount<inStatis[nodeKey].count"><i class="el-icon-plus"></i></span>
                            </div>
                            <!-- 第二层，按照边的类型 -->
                            <ul class="link-group-content-typeMain">
                                <li v-for="(v,k) in nodeType" :key='`in-${nodeKey}-${k}`'>
                                    <div class="link-group-content-linkType fs12 flex-left-center" @click="toggleList(nodeKey,v,k,'in')" :style="{'cursor':v.nodeCountInGraph==v.nodeCount?'default':'pointer',opacity:v.nodeCountInGraph==v.nodeCount?0.5:1}">
                                        <i :class="v.expand?'el-icon-caret-bottom':'el-icon-caret-right'" class="mr8" v-if="v.nodeCountInGraph!=v.nodeCount"></i>
                                        <div class="link-group-content-dot" v-else><span></span></div>
                                        <span class="mr4">{{ k }}</span>
                                        <span>{{ v.nodeCountInGraph }}</span>
                                        <span>/</span>
                                        <span>{{ v.nodeCount }}</span>
                                        <span class="link-group-content-node-icon" v-if="v.nodeCountInGraph!=v.nodeCount" @click.stop="addLinkType(v.nodes)"><i class="el-icon-plus"></i></span>
                                    </div>
                                    <ul class="link-group-content-node" v-show="v.expand">
                                        <li class="fs12" v-for="(nv,nk) in v.nodes" :key='`in-${nodeKey}-${k}-${nk}`' @click="addData(nv)" v-show="nv.linkCountInGraph<nv.linkCount">
                                            <span class="mr4">{{ nv.node.name || nk }}</span>
                                            <span>{{ nv.linkCountInGraph }}</span>
                                            <span>/</span>
                                            <span>{{ nv.linkCount }}</span>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="flex-shrink bottom-btn-con" style="margin:0" v-if="!isAddAll">
                <el-button type="primary" size="small" style="width:100%" icon="el-icon-plus" round @click="addAll">添加全部</el-button>
            </div>
        </template>
        <div class="expand-loading flex flex-column flex-center" v-else>
            <ring-loader color="#0D86FF" :size="90"></ring-loader>
            <span class="expand-loading-text mt10">“{{ dbclickNode.name }}”关联数据查询中...</span>
            <!-- <span class="mt10">加载中...</span> -->
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
            thisNode:{},
            isAddAll:true,
            // 出度入度的统计
            statis:{
                inCount:0,
                outCount:0,
                inInGraphCount:0,
                outInGraphCount:0
            },
            // 出度入度下实体类型的统计
            inStatis:{},
            outStatis:{},
            cache:{},
            isForce:false
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
        forceExpand(){
            this.isForce = true;
            this.expandNodes();
        },
        expandNodes(){
            this.inLinks = {};
            this.outLinks = {};
            this.isAddAll = true;
        
            if(this.loading){
                service.cancelRequest();
            }

            if(this.cache[this.dbclickNode.id] && this.isForce == false){
                this.allData = this.cache[this.dbclickNode.id];
                this.dealRelation(this.allData);
            }else{
                this.isForce = false;
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
                        this.cache[this.dbclickNode.id] = result.data; //缓存数据
                        this.allData = result.data;
                        this.dealRelation(this.allData);
                    }else{
                        show_message(result.message);
                    }
                    this.loading = false;
                },()=>{
                    this.loading = false;
                });
            }
        },
        dealRelation(graph){
            let nodeMap = {},
                linkGroup = {
                    in:{},
                    out:{}
                },
                totalLink = 0,
                inCount = new Set(),
                inInGraphCount = new Set(),
                outCount = new Set(),
                outInGraphCount = new Set();
            this.inStatis = {};
            this.outStatis = {};

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
                    linkPartition = linkGroup[isSource?'out':'in'],
                    labels = otherNode.labels,
                    isCount = false,
                    statis = isSource?this.outStatis:this.inStatis;
                // 按节点类型分类
                for(let label of labels){
                    if(!linkPartition[label]){
                        linkPartition[label] = {};
                    }
                    if(!statis[label]){
                        statis[label] = {
                            count:0,
                            inGraphCount:0
                        }
                    }
                    let linkPart = linkPartition[label];
                    // 按照边的类型分类
                    if(!linkPart[link.type]){
                        linkPart[link.type] = {
                            expand:false,
                            nodes:{},
                            nodeCount:0, //该类型的线有几个点
                            nodeCountInGraph:0, //该类型还能添加几个点
                        }
                    }
                    if(!linkPart[link.type].nodes[otherNodeId]){
                        linkPart[link.type].nodes[otherNodeId] = {
                            node:otherNode,
                            links:[],
                            linkCount:0,
                            linkCountInGraph:0
                        }
                    }
                    linkPart[link.type].nodes[otherNodeId].linkCount++;
                    linkPart[link.type].nodeCount++;
                    statis[label].count++;
                    if(isSource){
                        outCount.add(link.id);
                    }else{
                        inCount.add(link.id);
                    }
                    if(this.linkInGraphId.includes(link.id)){
                        linkPart[link.type].nodes[otherNodeId].linkCountInGraph++;
                        linkPart[link.type].nodeCountInGraph++;
                        statis[label].inGraphCount++;
                        if(isSource){
                            outInGraphCount.add(link.id);
                        }else{
                            inInGraphCount.add(link.id);
                        }
                        if(!isCount){
                            totalLink++;
                            isCount = true;
                        }
                    }
                    linkPart[link.type].nodes[otherNodeId].links.push(link);
                }
            }
            this.inLinks = linkGroup.in;
            this.outLinks = linkGroup.out;
            this.statis.inCount = inCount.size;
            this.statis.outCount = outCount.size;
            this.statis.inInGraphCount = inInGraphCount.size;
            this.statis.outInGraphCount = outInGraphCount.size;
            if(totalLink == this.allData.edgeList.length){
                this.isAddAll = true;
            }else{
                this.isAddAll = false;
            }
            console.log(this.inLinks,this.outLinks);
        },
        //根据画布的数据更新刷新数量统计
        updateLinkGroup(){
            let totalLink = new Set(),
                inStatisCount = new Set(),
                outStatisCount = new Set();
            //置空统计信息
            this.statis.inInGraphCount = 0;
            this.statis.outInGraphCount = 0;
            for(let key in this.inStatis){
                this.inStatis[key].inGraphCount = 0;
            }
            for(let key in this.outStatis){
                this.outStatis[key].inGraphCount = 0;
            }

            for(let nodeType in this.inLinks){
                //第一层 节点类型
                let nodeTypeValue = this.inLinks[nodeType],
                    nodeTypeStatisCount = 0;
                for(let k in nodeTypeValue){
                    //第二层 边类型
                    let linkType = nodeTypeValue[k],
                        nodeCountInGraph = 0;
                        
                    for(let nodeKey in linkType.nodes){
                        let nodeValue = linkType.nodes[nodeKey],
                            count = 0;
                        for(let link of nodeValue.links){
                            if(this.linkInGraphId.includes(link.id)){
                                totalLink.add(link.id);
                                count++;
                                nodeCountInGraph++;
                                nodeTypeStatisCount++;
                                inStatisCount.add(link.id);
                            }
                        }
                        nodeValue.linkCountInGraph = count;
                    }
                    linkType.nodeCountInGraph = nodeCountInGraph;
                }
                this.inStatis[nodeType].inGraphCount = nodeTypeStatisCount;
            }
            this.statis.inInGraphCount = inStatisCount.size;

            for(let nodeType in this.outLinks){
                //第一层 节点类型
                let nodeTypeValue = this.outLinks[nodeType],
                    nodeTypeStatisCount = 0;
                for(let k in nodeTypeValue){
                    //第二层 边类型
                    let linkType = nodeTypeValue[k],
                        nodeCountInGraph = 0;
                        
                    for(let nodeKey in linkType.nodes){
                        let nodeValue = linkType.nodes[nodeKey],
                            count = 0;
                        for(let link of nodeValue.links){
                            if(this.linkInGraphId.includes(link.id)){
                                totalLink.add(link.id);
                                count++;
                                nodeCountInGraph++;
                                nodeTypeStatisCount++;
                                outStatisCount.add(link.id);
                            }
                        }
                        nodeValue.linkCountInGraph = count;
                    }
                    linkType.nodeCountInGraph = nodeCountInGraph;
                }
                this.outStatis[nodeType].inGraphCount = nodeTypeStatisCount;
            }
            this.statis.outInGraphCount = outStatisCount.size;

            if(totalLink.size == this.allData.edgeList.length){
                this.isAddAll = true;
            }else{
                this.isAddAll = false;
            }
            console.log(this.inLinks,this.outLinks);
        },
        toggleList(nodeKey,value,key,type){
            if(value.nodeCountInGraph==value.nodeCount){
                return;
            }
            if(type == 'in'){
                for(let k in this.outLinks[nodeKey]){
                    this.outLinks[nodeKey][k].expand = false;
                }
                for(let k in this.inLinks[nodeKey]){
                    let item = this.inLinks[nodeKey][k];
                    if(k == key){
                        item.expand = !item.expand;
                    }else{
                        item.expand = false;
                    }
                }
            }else{
                for(let k in this.inLinks[nodeKey]){
                    this.inLinks[nodeKey][k].expand = false;
                }
                for(let k in this.outLinks[nodeKey]){
                    let item = this.outLinks[nodeKey][k];
                    if(k == key){
                        item.expand = !item.expand;
                    }else{
                        item.expand = false;
                    }
                }
            }
        },
        //添加一个节点
        addData(graph){
            this.$emit('addNode',[graph.node,this.thisNode],graph.links.map(e=>{
                return {
                    ...e,
                    source:e.startVertexId,
                    target:e.endVertexId
                }
            }));
        },
        //添加某一个实体类型下面某一个关系的全部点边
        addLinkType(data){
            let nodes = [this.thisNode], links = [];
            for(let nodeId in data){
                let nodeIdValue = data[nodeId];
                nodes.push(nodeIdValue.node);
                for(let link of nodeIdValue.links){
                    links.push({
                        ...link,
                        source:link.startVertexId,
                        target:link.endVertexId
                    });
                }
            }
            this.$emit('addNode',nodes,links);
        },
        //添加一个label类型下面的说有点边
        addNodeType(type,nodeType){
            let data = type == 'out' ? this.outLinks : this.inLinks,
                nodeTypeData = data[nodeType],
                linkSet = new Set(),
                nodeSet = new Set(),
                nodes = [],
                links = [];
            //添加当前节点
            nodeSet.add(this.thisNode.id);
            nodes.push(this.thisNode);
            //添加点边
            for(let linkType in nodeTypeData){
                let linkTypeData = nodeTypeData[linkType].nodes;
                for(let oneType in linkTypeData){
                    let oneTypeValue = linkTypeData[oneType];
                    if(!nodeSet.has(oneTypeValue.node.id)){
                        nodeSet.add(oneTypeValue.node.id);
                        nodes.push(oneTypeValue.node);
                    }
                    for(let link of oneTypeValue.links){
                        if(!linkSet.has(link.id)){
                            linkSet.add(link.id);
                            links.push({
                                ...link,
                                source:link.startVertexId,
                                target:link.endVertexId
                            });
                        }
                    }
                }
            }
            this.$emit('addNode',nodes,links);
        },
        //添加出度或者入度的所有点边
        addInOutLink(type){
            let data = type == 'out' ? this.outLinks : this.inLinks,
                linkSet = new Set(),
                nodeSet = new Set(),
                nodes = [],
                links = [];
            //添加当前节点
            nodeSet.add(this.thisNode.id);
            nodes.push(this.thisNode);
            //添加点边
            for(let nodeType in data){
                let nodeTypeData = data[nodeType];
                for(let linkType in nodeTypeData){
                    let linkTypeData = nodeTypeData[linkType].nodes;
                    for(let oneType in linkTypeData){
                        let oneTypeValue = linkTypeData[oneType];
                        if(!nodeSet.has(oneTypeValue.node.id)){
                            nodeSet.add(oneTypeValue.node.id);
                            nodes.push(oneTypeValue.node);
                        }
                        for(let link of oneTypeValue.links){
                            if(!linkSet.has(link.id)){
                                linkSet.add(link.id);
                                links.push({
                                    ...link,
                                    source:link.startVertexId,
                                    target:link.endVertexId
                                });
                            }
                        }
                    }
                }
            }
            this.$emit('addNode',nodes,links);
        },
        //添加所有
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
    overflow: hidden;
    height:100%;
    .expand-panel-title{
        padding:0px 34px 0 18px;
        margin-bottom: 10px;
        position: relative;
        i{
            position: absolute;
            right: 10px;
            top: 3px;
            &:hover{
                color:#0D86FF;
            }
        }
    }
    .link-group{
        overflow: auto;
        .link-group-title{
            padding:10px 18px;
            position: relative;
            .link-group-content-node-icon{
                right:19px;
                // top:13px;
                line-height: 14px;
            }
            &:hover{
                .link-group-content-node-icon{
                    display: block;
                }
            }
        }
        .link-group-content{
            padding: 0 12px;
            &>li{
                margin-bottom: 12px;
            }
            .link-group-content-type{
                background: #F6F6F9;
                padding: 6px 30px 6px 12px;
                border-radius: 16px;
                position: relative;
                height: 30px;
                span:first-child{
                    color:#040C15;
                }
                .link-group-content-node-icon{
                    // top:7px;
                }
                &:hover{
                    .link-group-content-node-icon{
                        display: block;
                    }
                }
            }
            .link-group-content-typeMain{
                padding-left: 10px;
                .link-group-content-linkType{
                    margin-top:10px;
                    cursor: pointer;
                    position: relative;
                    padding-left:20px;
                    padding-right: 36px;
                    .link-group-content-dot{
                        width:12px;
                        height:12px;
                        margin-right: 8px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        span{
                            width:6px;
                            height:6px;
                            background: #040C15;
                            border-radius: 6px;
                            display: inline-block;
                        }
                    }
                    &:hover{
                        .link-group-content-node-icon{
                            display: block;
                        }
                    }
                }
                .link-group-content-node{   
                    color: #464C5D;
                    padding-left:40px;
                    li{
                        margin: 8px 0px;
                        cursor: pointer;
                        position: relative;
                        padding-right: 30px;
                        display: flex;
                        align-items: center;
                        &:hover{
                            color:#0D86FF;
                            span:first-child{
                                text-decoration: underline;
                            }
                        }
                    }
                }
            }
        }
    }
}
.link-group-content-node-icon{
    position: absolute;
    height:16px;
    width:16px;
    text-align: center;
    line-height: 16px;
    background: #0D86FF;
    border-radius: 16px;
    right: 7px;
    font-weight: 800;
    top: 50%;
    margin-top:-8px;
    display: none;
    opacity: 0.52;
    cursor: pointer;
    box-shadow: 0 0 6px rgb(146,196,245);
    i{
        color:white;
        font-weight: 800;
        font-size: 11px;
    }
    &:hover{
        opacity: 1;
    }
}
.expand-loading{
    padding: 20px;
    .expand-loading-text{
        text-align: center;
        line-height: 26px;
    }
}
.refresh-icon{
    position: absolute;
    right:10px;
    top:10px;
    cursor: pointer;
}
</style>