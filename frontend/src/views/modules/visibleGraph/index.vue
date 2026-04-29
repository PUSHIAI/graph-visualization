<!--
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2021-12-09 16:17:44
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-04-19 17:55:26
 * @FilePath: /GraphInsight/src/views/modules/visibleGraph/index.vue
-->
<template>
    <div class="visible-graph">
        <!-- <transition name="navbar-transition"> -->
            <div class="navbar" v-if="transitionFlag">
                <div class="graph-title">
                    <!-- <div class="logo-background flex-center" @click="backToFrontPage"> 
                        <svg-icon iconClass="common-platform-logo" className="platform-logo"></svg-icon>
                    </div> -->
                    <img src="@icons/png/logo/logo.jpg" class="logo-img" @click="backToFrontPage"/>
                    <div class="graph-name">
                        {{$route.query.name}}
                        <!-- <svg-icon iconClass="graphToolbox-dropdown" className="dropdown-icon"></svg-icon> -->
                    </div>
                </div>
                <div class="graph-toolbox">
                    <toolbox @emitEvent="emitEvent"></toolbox>
                </div>
            </div>
        <!-- </transition> -->
        <div class="main"
            v-loading="pageLoading"
            element-loading-text="加载图谱数据中"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(255, 255, 255, 0.6)"
        >
            <!-- <transition name="left-sidebar-transition"> -->
                <div class="left-sidebar" v-dragSidebar="'right'" v-if="transitionFlag">
                    <div class="sidebar-menu flex-shrink">
                        <div 
                            v-for="item in leftSidebarMenu"
                            :key="item.value"
                            :class="['menu-item', activeLeftMenu == item.value ? 'active-icon' : '']"
                            @click="changeLeftMenu(item)"
                        >
                            <transition name="background-fade">
                                <svg-icon v-if="activeLeftMenu == item.value" iconClass="visibleGraph-white-background" className="menu-background"></svg-icon>
                            </transition>
                            <svg-icon :iconClass="item.icon" className="menu-icon"></svg-icon>
                            <div class="menu-item-name">{{ item.name }}</div>
                        </div>
                    </div>
                    <div class="sidebar-panel">
                        <keep-alive>
                            <component
                                :is="leftSidebarPanel"
                                :ref="activeLeftMenu"
                                class="sidebar-components"
                                @emitEvent="emitEvent"
                                :selectNodes="selectNodes"
                                :nodeTypes="nodeTypes"
                                :linkTypes="linkTypes"
                                :styleTypes="styleTypes"
                                :nodeAttributes="nodeAttributes"
                                :projectId="projectId"
                                :nodesIdsInGraph="nodesIdsInGraph"
                                :dbclickNode="dbclickNode"
                                :linkInGraphId="linkInGraphId"
                            >
                            </component>
                        </keep-alive>
                    </div>
                </div>
            <!-- </transition> -->
            <div class="app-graph">
                <fullscreen class="application-canvas" id="application-canvas" v-model="fullscreen"  @change="fullscreenChange"></fullscreen>
                <div class="searchNodeForm">
                    <el-select v-model="searchString" filterable clearable placeholder="查找节点" @change="searchStringChange" size="small" popper-class="searchNodeForm-popper">
                        <el-option
                            v-for="item in nodeInGraph"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                        >
                            <div class="searchNodeForm-popper-name">{{ item.name }}</div>
                            <div class="searchNodeForm-popper-label">{{ item.labels.join('/') }}</div>
                        </el-option>
                    </el-select>
                </div>
                <div class="app-graph-loading" v-if="layoutLoading">
                    <span>{{ layoutTip }}</span>
                    <pulse-loader color="#0D86FF" :size="5"></pulse-loader>
                </div>
            </div>
            <!-- <transition name="right-sidebar-transition"> -->
                <div class="right-sidebar custom-tabs-title" v-dragSidebar="'left'" v-if="transitionFlag">
                    <el-tabs v-model="activeRightMenu">
                        <el-tab-pane
                            v-for="item in rightSidebarMenu"
                            :key="item.value"
                            :label="item.label"
                            :name="item.value"
                        ></el-tab-pane>
                    </el-tabs>
                    <div class="sidebar-panel">
                        <transition name="right-component-transition">
                            <keep-alive>
                                <component
                                    :is="rightSidebarPanel"
                                    :ref="activeRightMenu"
                                    class="sidebar-components"
                                    :item="clickNode"
                                    :itemType="clickType"
                                    :nodeInGraph="nodeInGraph"
                                    :linkInGraph="linkInGraph"
                                    @emitEvent="emitEvent"
                                >
                                </component>
                            </keep-alive>
                        </transition>
                    </div>
                </div>
            <!-- </transition> -->
        </div>
    </div>
</template>

<script>
import toolbox from "@/views/modules/visibleGraph/toolbox/index.vue";
import PixiChart from "@/utils/graphJs/PixiChart/PixiChart";
import service from '@/api/service';
import _ from "lodash";
import { exportJson,exportXlsx } from '@/utils/downloadTools';
import {show_message} from '@/utils/message';
import { deepClone } from '@/utils/graphJs/graphUtils';
import { PulseLoader } from '@saeris/vue-spinners';
import { isEmpty } from "@/utils/graphJs/PixiChart/utils/common.js";

export default {
    components: {
        toolbox,PulseLoader
    },
    data() {
        return {
            projectId: new Number(),
            transitionFlag: true,
            activeLeftMenu: 'searchNode',
            leftSidebarMenu: [
                {
                    value: 'searchNode',
                    name:'查询',
                    icon: 'visibleGraph-search-node',
                    path: 'views/modules/visibleGraph/sidebar/leftSidebar/searchNode.vue'
                },
                {
                    value: 'expandNode',
                    name:'展开',
                    icon: 'visibleGraph-expand-node',
                    path: 'views/modules/visibleGraph/sidebar/leftSidebar/expandPanel.vue'
                },
                {
                    value: 'graphStyle',
                    name:'样式',
                    icon: 'visibleGraph-search-path',
                    path: 'views/modules/visibleGraph/sidebar/leftSidebar/graphStyle.vue'
                },
                {
                    value: 'entityEnhance',
                    name:'算法',
                    icon: 'visibleGraph-entity-enhance',
                    path: 'views/modules/visibleGraph/sidebar/leftSidebar/algorithm.vue'
                },
                {
                    value: 'edit',
                    name: '编辑',
                    icon: 'visibleGraph-edit',
                    path: 'views/modules/visibleGraph/sidebar/leftSidebar/editGraph.vue'
                },
            ],
            activeRightMenu: 'statistics',
            rightSidebarMenu: [
                {
                    value: 'statistics',
                    label: '统计',
                    path: 'views/modules/visibleGraph/sidebar/rightSidebar/statistics/index.vue'
                },
                {
                    value: 'information',
                    label: '信息',
                    path: 'views/modules/visibleGraph/sidebar/rightSidebar/information/index.vue'
                },
                // {
                //     value: 'search',
                //     label: '查询',
                //     path: 'views/modules/visibleGraph/sidebar/rightSidebar/search/index.vue'
                // },
            ],
            selectNodes:[], // 选中的节点
            styleMap: {
                nodeStyle: {},
                linkStyle: {}
            },
            nodeTypes:[],  //图数据库schema中节点类型
            linkTypes:[],  //图数据库schema中关系类型
            styleTypes: {},
            nodeAttributes:[],  //图数据库schema中节点的属性
            pageLoading:false,
            fullscreen:false,
            nodesIdsInGraph:[], //图中的节点的id数据
            clickNode:{},  //当前点击的元素，可能是边或者节点
            clickType:'node',  //当前点击的元素类型
            nodeInGraph:[], //图中的节点数据
            linkInGraph:[], //图中的关系数据
            linkInGraphId:[], //图中的关系数据的id
            dbclickNode:{}, //记录双击事件的节点
            layoutLoading:false,
            layoutTip:'',
            searchString:undefined,
            lastActiveLeftMenu:'searchNode',
            filterIdList: {
                node: [],
                link: []
            }
        }
    },
    watch: {
        // 监听左侧sidebar 不同菜单可能会有不同的事件功能
        leftSidebarPanel: {
            handler: function() {
                console.log("activeLeftMenu:", this.activeLeftMenu);
                if (this.activeLeftMenu == 'edit') {
                    this.appChart?.setMultipleType('double');
                } else {
                    this.appChart?.setMultipleType('multiple');
                }
            }
        }
    },
    computed: {
        leftSidebarPanel() {
            let path = '';
            for (let i = 0; i < this.leftSidebarMenu.length; i++) {
                if (this.leftSidebarMenu[i].value == this.activeLeftMenu) {
                    path = this.leftSidebarMenu[i].path;
                    break;
                }
            }
            return path ? () => import(`@/${path}`) : '';
        },
        rightSidebarPanel() {
            let path = '';
            for (let i = 0; i < this.rightSidebarMenu.length; i++) {
                if (this.rightSidebarMenu[i].value == this.activeRightMenu) {
                    path = this.rightSidebarMenu[i].path;
                    break;
                }
            }
            return path ? () => import(`@/${path}`) : '';
        },
    },
    beforeDestroy() {
        // 销毁图组件
        this.appChart?.destroyPixiChart();
        this.stopGraph();
    },
    mounted() {
        this.projectId = Number(this.$route.query.projectId);
        this.pageLoading = true;
        this.$nextTick(()=>{
            this.getGraphInfo();
            this.debounce_graphDrawUpdated = _.debounce(this.graphDrawUpdated, 300);
        });
        // this.transitionFlag = false;
        // this.initGraph();
    },
    methods: {
        // 切换左侧面部
        changeLeftMenu(item) {
            this.activeLeftMenu = item.value;
            this.lastActiveLeftMenu = item.value;
        },
        // 返回主页
        backToFrontPage() {
            this.$router.push({
                name: '主页'
            })
        },
        initGraph(graphData){
            console.log('开始画图');
            console.log((new Date()).getTime()/1000);
            let vm = this;
            requestAnimationFrame(() => {
                this.appChart = new PixiChart({
                    id: "application-canvas",
                    graphData: graphData,
                    nodeEvents: {
                        // onSelectionChange: this.graph_selectionChange,
                        click: this.node_onClick,
                        // rightclick: this.graph_onRightClick
                    },
                    linkEvents: {
                        click: this.link_onClick,
                    },
                    graphEvents: {
                        onSelectionChange: this.graph_selectionChange,
                        onDataUpdated: this.graph_dataUpdated,
                        layoutEnd:this.layoutEnd,
                        layoutStart:this.layoutStart,
                        startDrawElement:this.startDrawElement,
                        endDrawElement:this.endDrawElement,
                        mousedown:this.canvasMouseDown
                    },
                    linkStyleFunction: function(link) {
                        if(vm.styleMap && vm.styleMap.edgeStyle && vm.styleMap.edgeStyle[link.type]){
                            return vm.styleMap.edgeStyle[link.type];
                        }else{
                            return {} ;
                        }
                    },
                    nodeStyleFunction: function(node) {
                        let icon , label;
                        for(let l of node.labels){
                            if(label){
                                if(vm.styleMap && vm.styleMap.nodeStyle && vm.styleMap.nodeStyle[l]){
                                    if(vm.styleMap.nodeStyle[l].priority < vm.styleMap.nodeStyle[label].priority){
                                        label = l;
                                    }
                                }
                            }else{
                                label = l;
                            }
                        }
                        if(vm.styleMap && vm.styleMap.nodeStyle && vm.styleMap.nodeStyle[label] && vm.styleMap.nodeStyle[label].icon){
                            icon = require(`@/assets/graph/${vm.styleMap.nodeStyle[label].icon.split('-').join('/')}.svg`);
                        }else{
                            icon = require(`@/assets/graph/常见/aempty.svg`)
                        }
                        if(vm.styleMap && vm.styleMap.nodeStyle && vm.styleMap.nodeStyle[label]){
                            return { ...vm.styleMap.nodeStyle[label],icon:icon };
                        }else{
                            return { icon:icon, tag:'name', size: 1 }
                        }
                    },
                    filters: {
                        nodeFilter(node) {
                            return vm.nodeFilterFunc(node);
                        },
                        linkFilter(link) {
                            return vm.linkFilterFunc(link);
                        }
                    },
                    layout:{
                        name:'force'
                    }
                });
            })
            console.log('页面渲染结束');
            console.log((new Date()).getTime()/1000);
        },
        canvasMouseDown(){
            this.activeLeftMenu = this.lastActiveLeftMenu;
        },
        //单击节点
        link_onClick(e){
            console.log('link_onClick', e.target.data);
            this.clickNode = e.target.data? JSON.parse(JSON.stringify(e.target.data)) :{};
            if(!isEmpty(this.clickNode.id)){
                this.clickType = 'link';
                // this.activeRightMenu = 'information';
            }
        },
        //单击节点
        node_onClick(e){
            // if(e.target.isDragEvent){
            //     e.target.isDragEvent = false;
            //     return
            // }
            // console.log('node_onClick');
            //如果在600ms内重复点击判断为双击事件
            let data = e.target.data;
            
            if(this._clicked){
                clearTimeout(this.__double);
                this._clicked = false; 
                //双击事件具体逻辑
                this.doubleClick(data);
            }else{
                this._clicked = true;
                this.__double = setTimeout(() => { 
                    this._clicked = false; 
                    //单击事件具体逻辑
                    this.singleClick(data);
                }, 300);
            }
            
        },
        singleClick(e){
            this.clickNode = e? JSON.parse(JSON.stringify(e)) :{};
            if(this.clickNode.id !== undefined){
                this.clickType = 'node';
                // this.activeRightMenu = 'information';
            }
        },
        //双击节点
        doubleClick(e){
            this.dbclickNode = {
                id:e.id,
                name:e.name
            };
            this.activeLeftMenu = 'expandNode';         
        },
        // 图数据发生变化
        node_dataUpdated(){
            this.debounce_graphDrawUpdated();
        },
        link_dataUpdated(){
            this.debounce_graphDrawUpdated();
        },
        graph_dataUpdated(){
            this.debounce_graphDrawUpdated();
        },
        searchingExpandNode(isSearch) {
            this.layoutLoading = isSearch;
            this.layoutTip = '数据查询中';
        },
        layoutStart(){
            this.layoutLoading = true;
            this.layoutTip = '布局计算中';
        },
        layoutEnd(){
            this.layoutLoading = false;
            this.layoutTip = '';
        },
        startDrawElement(){
            this.layoutLoading = true;
            this.layoutTip = '元素绘画中';
        },
        endDrawElement(){
            this.layoutLoading = false;
            this.layoutTip = '';
        },
        graphDrawUpdated(){
            let { nodes,links } = this.appChart.exportData(false);
            //图中存在的节点
            this.nodesIdsInGraph = nodes.map(e=>e.id);
            //保存图中的节点关系数据
            this.nodeInGraph = nodes;
            this.linkInGraph = links;
            this.linkInGraphId = links.map(e=>e.id);
            console.log('graphDrawUpdated');
            console.log(this.nodeInGraph,this.linkInGraph);

            if(!isEmpty(this.clickNode.id)){
                this.updateClickNode(this.clickNode.id);
            }
        },
        updateClickNode(id, type = this.clickType){
            let node = this.appChart.getObjectById(id, type);
            if(!isEmpty(node?.data?.id)){
                this.$set(this,'clickNode',JSON.parse(JSON.stringify(node.data)));
            }
        },
        // 触发相同名字的事件
        emitEvent() {
            if(arguments.length>1){
                this[arguments[0]].apply(this,Array.prototype.slice.call(arguments,1,arguments.length));
            }else{
                this[arguments[0]]();
            }
        },
        // 节点过滤器
        nodeFilterFunc(node) {
			let visible = true,
				vm = this;
            
            visible = this.filterIdList.node.indexOf(node.id) != -1 ? false : true;

			return visible;
        },
        // 边过滤器
        linkFilterFunc(link) {
            let visible = true,
                vm = this;
            
            visible = this.filterIdList.link.indexOf(link.id) != -1 ? false : true;

            return visible;
        },
        getProjectStyle(callback) {
            let param = {
                urlParam: {
                    projectId: this.projectId
                }
            }
            service.doRequest("getProjectStyle", param).then(result => {
                if (result.status == 200) {
                    let styleObj = {},
                        nodeOrder = {},
                        nodeStyleSet = new Set();
                    this.topPriority = 0;
                    // 点边的样式map
                    for (let i = 0; i < result.data.length; i++) {
                        let style = result.data[i];
                        styleObj[style.labelName] = style;
                        this.topPriority = Math.max(this.topPriority,style.priority || 0);
                        if(style.isVertexType && !nodeStyleSet.has(style.labelName)){
                            nodeOrder[style.labelName] = style.priority;
                            nodeStyleSet.add(style.labelName);
                        }
                    }
                    this.styleTypes = {
                        styleMap: styleObj,
                        nodeTypes: this.nodeTypes.sort((a,b)=>{
                            return nodeOrder[a] - nodeOrder[b]
                        }),
                        linkTypes: this.linkTypes
                    }
                    let nodeStyle = {}, edgeStyle = {};
                    this.nodeTypes.forEach(type => {
                        let style = styleObj[type] || {}
                        nodeStyle[type] = {
                            icon: style.icon || '',
                            color: style.color || '0x778396',
                            size: style.size || 1,
                            tag: style.tag || 'name',
                            priority: style.priority
                        }
                    })
                    this.linkTypes.forEach(type => {
                        let style = styleObj[type] || {}
                        edgeStyle[type] = {
                            color: style.color || '0xc3cbd3',
                            size: style.size || 1,
                            tag: style.tag || 'name',
                        }
                    })
                    this.styleMap = {
                        nodeStyle: nodeStyle,
                        edgeStyle: edgeStyle
                    }
                    
                    let styleLabel = Array.from(nodeStyleSet),
                        label2add = _.difference(this.nodeTypes,styleLabel), 
                        label2remove = _.difference(styleLabel,this.nodeTypes);

                    console.log(label2add,label2remove,styleObj);
                    this.reInitStyle(label2add,label2remove.map(e=>{
                        return styleObj[e].id
                    }));

                    if(callback){
                        callback.apply();
                    }
                }
            })
        },
        async reInitStyle(label2add,label2remove){
            console.log(label2add,label2remove);
            for(let label of label2remove){
                await service.doRequest("deleteProjectStyle", 
                    {
                        urlParam: {
                            projectId: this.projectId,
                            id: label
                        },
                    }).then(result => {
                        console.log(`${label}，删除成功`);
                    })
            }
            if(label2add.length > 0){
                console.log('新增样式。');
                this.setProjectStyleBatch(label2add);
            }
        },
        setProjectStyleBatch(label2add){
            console.log(this.nodeTypes,label2add);
            let styleList = [];
            for(let label of label2add){
                styleList.push({
                    isVertexType:true,
                    priority:++this.topPriority,
                    labelName:label
                });
            }
            service.doRequest("setProjectStyleBatch", 
                {
                    urlParam: {
                        projectId: this.projectId
                    },
                    param : styleList
                }).then(result => {
                    this.getProjectStyle();
                })
        },
        // 初始化图谱样式
        initGraphStyle(styleMap) {
            this.styleMap = styleMap;
        },
        sortElement(nodes){
            let nodeSort = nodes.map(e=>{
                return this.styleTypes.styleMap[e].id
            });
            service.doRequest("updatePriorityList", 
                {
                    urlParam: {
                        projectId: this.projectId
                    },
                    param : nodeSort
                }).then(result => {
                    this.getProjectStyle(()=>{
                        this.appChart && this.appChart.updateNodeStyle();
                    });
                })
        },
        // 改变图谱样式
        changeStyle(param){
            console.log('param:', param);
            let labelStyle = {};
            this.styleMap = param.styleObject;
            // 更新点边样式
            if(param.itemType == 'node'){
                this.appChart && this.appChart.updateNodeStyle((node)=>{
                    return node.labels.indexOf(param.type) != -1;
                });

                for (let key in this.styleMap.nodeStyle) {
                    if (key == param.type) {
                        labelStyle = this.styleMap.nodeStyle[key];
                    }
                }
            } else {
                this.appChart && this.appChart.updateLinkStyle((link)=>{
                    return link.type == param.type;
                });

                for (let key in this.styleMap.edgeStyle) {
                    if (key == param.type) {
                        labelStyle = this.styleMap.edgeStyle[key];
                    }
                }
            }
            let styles = {
                param: {
                    color: labelStyle.color || '',
                    icon: labelStyle.icon || '',
                    labelName: param.type,
                    size: labelStyle.size || 1,
                    tag: labelStyle.tag || 'name'
                },
                urlParam: {
                    projectId: this.projectId
                }
            },
            url = "addProjectStyle";
            if (param.id) {
                styles.param.id = param.id;
                styles.urlParam.id = param.id;
                url = "editProjectStyle";
            }
            service.doRequest(url, styles).then(result => {
                if (result.status == 200 || result.status == 201) {
                    this.getProjectStyle();
                }
            })
        },
        graph_selectionChange(e){
            console.log('graph_selectionChange:', e);
            this.selectNodes = [];
            for (let i = 0; i < e.length; i++) {
                this.selectNodes.push({
                    id: e[i].id,
                    name: e[i].name
                })
            }
            // 去除过滤面板中的brush选中
            if (this.selectNodes.length == 0) {
                
            }
            // 避免单点展开和多点展开面板切换的bug
            if (this.selectNodes.length > 0) {
                this.dbclickNode = {}
            }
        },
        // 选择元素
        selectedElement(element) {
            console.log("element:", element);
            this.appChart?.setSelection(element.idList, element.type, element.options);
        },
        //取消选择某个节点
        cancelSelectionOne(id){
            this.appChart?.cancelSelectionOne(id);
        },
        //取消选择全部节点
        cancelSelection(){
            this.appChart?.cancelSelection();
        },
        // 获取图谱信息（属性和schema）
        getGraphInfo() {
            this.getGraphAttr();
            this.getGraphSchema();
        },
        // 获取图谱中属性
        getGraphAttr() {
            let param = {
                // param: {
                //     isVertexType: true,
                //     isEdgeType: false
                // },
                urlParam: {
                    projectId: this.projectId
                }
            }
            return service.doRequest("getGraphAttr", param).then(result => {
                if (result.status == 200) {
                    this.nodeAttributes = result.data;
                }
                this.pageLoading = false;
            }).catch((error) => {
                error.message != 'canceled' && show_message("获取属性失败", "warning");
                this.pageLoading = false;
            })
        },
        // 获取图谱中schema
        getGraphSchema() {
            let param = {
                param: {
                    isIndex: true,
                    isProperty: true
                },
                urlParam: {
                    projectId: this.projectId
                }
            }
            return service.doRequest("getGraphSchema", param).then(result => {
                this.pageLoading = false;
                if (result.status == 200) {
                    this.nodeTypes = result.data.vertexList;
                    this.linkTypes = result.data.edgeList;
                    this.getProjectStyle();
                }
            }).catch((error) => {
                error.message != 'canceled' && show_message("获取schema失败", "warning");
                this.pageLoading = false;
            })
        },
        addNode(nodes=[],links=[]){
            console.log(nodes,links);
            let copyNodes = JSON.parse(JSON.stringify(nodes)),
                copyLinks = JSON.parse(JSON.stringify(links));
            this.clearFilterStatus(nodes, links);
            if(this.appChart){
                this.appChart.addData({nodes:copyNodes,links:copyLinks});
            }else{
                this.initGraph({nodes:copyNodes,links:copyLinks});
            }
        },
        addNewElements(nodes=[],links=[]) {
            this.addNode(nodes, links);
        },
        // 设置元素属性
        setElementAttr(id, data, type = this.clickType) {
            this.getGraphAttr();
            this.appChart.setElementAttr(id, data.key, data.value, type);
            // 更新查询列表里的数据
            this.$refs.searchNode && this.$refs.searchNode.$refs.basicSearch && this.$refs.searchNode.$refs.basicSearch.editItemAttr(id, data, "edit");
            // 更新展开列表里的数据
            // this.$refs.expandPanel && this.$refs.expandPanel.$refs.expandSingle && this.$refs.expandPanel.$refs.expandSingle.editItemAttr(id, data, "edit");
        },
        // 删除元素属性
        deleteElementAttr(id, key, type = this.clickType) {
            this.getGraphAttr();
            this.appChart.deleteElementAttr(id, key, type)
            // 更新查询列表里的数据
            this.$refs.searchNode && this.$refs.searchNode.$refs.basicSearch && this.$refs.searchNode.$refs.basicSearch.editItemAttr(id, { key }, "delete");
            // 更新展开列表里的数据
            // this.$refs.expandPanel && this.$refs.expandPanel.$refs.expandSingle && this.$refs.expandPanel.$refs.expandSingle.editItemAttr(id, { key }, "delete");
        },
        // 删除元素和取消click选中
        deleteElement() {
            if (!isEmpty(this.clickNode.id)) {
                this.appChart.removeData({
                    nodes: this.clickType == 'node' ? [this.clickNode] : [],
                    links: this.clickType == 'link' ? [this.clickNode] : [],
                }, false);
            }
            // 更新左侧查询面板
            this.$refs.searchNode && this.$refs.searchNode.$refs.basicSearch && this.$refs.searchNode.$refs.basicSearch.deleteItem(this.clickNode.id);
            this.clickNode = {};
        },
        forTool(value){
            let graphData;
            if(!this.appChart){
                show_message('图谱未初始化，请查询节点。');
                return;
            }
            switch(value){
                case 'fullscreen':
                    this.fullscreen = true;
                    break;
                case 'undo':
                    this.appChart.undo();
                    break;
                case 'redo':
                    this.appChart.redo();
                    break;
                case 'refresh':
                    this.appChart.transitionStageToCenter();
                    break;
                case 'select':
                    this.appChart.reverseSelection();
                    break;
                case 'delete':
                    this.appChart.removeData({ nodes: this.selectNodes});
                    break;
                case 'clear':
                    this.$confirm('该操作将删除画布上所有数据', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.appChart.clear();
                        this.debounce_graphDrawUpdated();
                    }).catch(() => {        
                    });
                    break;
                case 'exportPng':
                    this.appChart.exportAsPng();
                    break;
                case 'exportJson':
                    graphData = this.appChart.exportData(true);
                    for(let link of graphData.links){
                        link.source = link.source.id;
                        link.target = link.target.id;
                    }
                    exportJson(graphData,"graphData.json");
                    break;
                case 'exportXlsx':
                    graphData = this.appChart.exportData(true);
                    let xlsxData = {
                            '节点':{
                                header:['id','name','labels'],
                                data:[]
                            },
                            '关系':{
                                header:['id','type','startVertexId','endVertexId'],
                                data:[]
                            },
                        };
                    for(let node of graphData.nodes){
                        let attributes = {};
                            node.attributeList.forEach(a=>{
                                attributes[a.name] = a.value;
                            });
                        xlsxData['节点'].data.push({
                            ...attributes,
                            id:node.id,
                            name:node.name,
                            labels:node.labels.join('/')
                        });
                        
                    }
                    for(let link of graphData.links){
                        let attributes = {};
                            link.attributeList.forEach(a=>{
                                attributes[a.name] = a.value;
                            })
                        xlsxData['关系'].data.push({
                                ...attributes,
                                id:link.id,
                                type:link.type,
                                startVertexId:link.startVertexId,
                                endVertexId:link.endVertexId
                        });
                    }
                    exportXlsx(xlsxData,"graphXlsx.xlsx");
                    break;
                case 'force':
                    this.appChart && this.appChart.changeLayout("force");
                    break;
                case 'dag-vertical':
                    this.appChart && this.appChart.changeLayout("dag-vertical");
                    break;
                case 'grid':
                    this.appChart && this.appChart.changeLayout("grid");
                    break;
            }
        },
        fullscreenChange(isFullscreen){
            console.log(isFullscreen);
            if (this.appChart) {
                this.appChart.resize();
                this.appChart.transitionStageToCenter()
            }
        },
        searchStringChange(e){
            if(e !== '' || e !== undefined){
                this.searchString = undefined;
                this.appChart.scrollIntoView(e,true,true);
            }
        },
        // 停止图谱实例
        stopGraph() {
            let param = {
                urlParam: {
                    projectId: this.projectId
                }
            }
            service.doRequest("stopGraph", param);
        },
        // 切换过滤元素
        filterElement(params) {
            let { filterList, type, isVisible } = params;
            for (let i = 0; i < filterList.length; i++) {
                if (!isVisible) {
                    this.filterIdList[type].indexOf(filterList[i]) == -1 && this.filterIdList[type].push(filterList[i]);
                } else {
                    this.filterIdList[type].indexOf(filterList[i]) != -1 && this.filterIdList[type].splice(this.filterIdList[type].indexOf(filterList[i]), 1);
                }
            }
            this.appChart?.updateFilters();
        },
        // 清除过滤状态
        clearFilterStatus(nodes, links) {
            for (let i = 0; i < nodes.length; i++) {
                let index = this.filterIdList.node.indexOf(nodes[i].id);
                if (index != -1) {
                    this.filterIdList.node.splice(index, 1);
                }
            }
            for (let i = 0; i < links.length; i++) {
                let index = this.filterIdList.link.indexOf(links[i].id);
                if (index != -1) {
                    this.filterIdList.link.splice(index, 1);
                }
            }
        },
        // 最短路径
        shortPath(nodes = [], links = []) {
            for (let i = 0; i < nodes.length; i++) {
                nodes[i].algorithmStyle = {
                    size: 2
                }
            }
            for (let i = 0; i < links.length; i++) {
                links[i].algorithmStyle = {
                    size: 4
                }
            }
            this.addNode(nodes, links);
            this.appChart?.updateAlgorithmStyle(nodes, links);
        },
        // 重置最短路径
        clearShortPath() {
            this.cancelSelection();
            this.appChart?.clearShortPath();
        }
    }
}
</script>

<style lang="less" scoped>
.visible-graph {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .navbar {
        height: 63px;
        box-shadow: 0 3px 6px rgba(0, 118, 255, 0.16);
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 21;
        .graph-title {
            display: flex;
            align-items: center;
            .logo-background {
                background: #0D86FF;
                width: 38px;
                height: 38px;
                border-radius: 12px;
                margin: 0 38px 0 20px;
                .platform-logo {
                    fill: #fff;
                    width: 25px;
                    height: 25px;
                    cursor: pointer;
                }
            }
            .logo-img{
                width: 38px;
                height: 38px;
                margin: 0 38px 0 20px;
                cursor: pointer;
                border-radius: 11px;
                &:hover{
                    box-shadow: 2px 2px 8px rgba(0, 118, 255, 0.16);
                }
            }
            .graph-name {
                font-size: 16px;
                font-weight: bold;
                .dropdown-icon {
                    width: 10px;
                    height: 8px;
                    fill: #778396;
                    cursor: pointer;
                }
            }
        }
    }
    .main {
        flex: 1;
        display: flex;
        background: #F4F8FD;
        overflow: hidden;
        .left-sidebar {
            width: 356px;
            display: flex;
            z-index:20;
            .sidebar-menu {
                width: 52px;
                padding: 5px 0 0;
                background: #0D86FF;
                display: flex;
                flex-direction: column;
                .menu-item {
                    position: relative;
                    text-align: center;
                    padding: 18px 0;
                    cursor: pointer;
                    .menu-icon {
                        position: relative;
                        fill: #fff;
                        width: 20px;
                        height: 20px;
                        transition: all 1s;
                    }
                    .menu-background {
                        fill: #fff;
                        width: 58px;
                        height: 64px;
                        position: absolute;
                        top: 50%;
                        left: 60%;
                        transform: translate(-50%, -50%);
                    }
                    .menu-item-name{
                        font-size: 12px;
                        position: relative;
                        color: #fff;
                        margin-top: -5px;
                    }
                    .background-fade-enter, .background-fade-leave-to {
                        opacity: 0;
                    }
                    .background-fade-enter-to, .background-fade-leave {
                        opacity: 1;
                    }
                    .background-fade-enter-active {
                        transition: all 1s;
                    }
                }
                .active-icon {
                    .menu-icon {
                        fill: #0D86FF;
                    }
                    .menu-item-name{
                        color:#0D86FF;
                    }
                }
            }
            .sidebar-panel {
                flex: 1;
                width: 10px;
                padding: 18px 0px;
                border-radius: 0 24px 24px 0;
                box-shadow: 0 0 20px rgba(0, 118, 255, 0.16);
                background: #fff;
                .sidebar-components {
                    height: 100%;
                }
            }
        }
        .app-graph {
            flex: 1;
            width:100px;
            position:relative;
            .application-canvas{
                height: 100%;
                width: 100%;
            }
        }
        .right-sidebar {
            width: 280px;
            padding: 18px;
            border-radius: 24px 0 0 24px;
            box-shadow: 0 0 20px rgba(0, 118, 255, 0.16);
            background: #fff;
            display: flex;
            flex-direction: column;
            .sidebar-panel {
                flex: 1;
                overflow: hidden;
                margin: 0 -18px;
            }
            /deep/ .el-tabs {
                .el-tabs__nav-scroll {
                    display: flex;
                    justify-content: center;
                }
            }
        }
        // 左侧面板过渡动画
        .left-sidebar-transition-enter, .left-sidebar-transition-leave-to {
            transform: translateX(-356px);
        }
        .left-sidebar-transition-enter-to, .left-sidebar-transition-leave {
            transform: translateX(0);
        }
        .left-sidebar-transition-enter-active {
            transition: all 1s;
        }
        // 右侧面板初始化过渡动画
        .right-sidebar-transition-enter, .right-sidebar-transition-leave-to {
            transform: translateX(280px);
        }
        .right-sidebar-transition-enter-to, .right-sidebar-transition-leave {
            transform: translateX(0);
        }
        .right-sidebar-transition-enter-active {
            transition: all 1s;
        }
        // 右侧面板切换过渡动画
        .right-component-transition-enter, .right-component-transition-leave-to {
            opacity: 0;
        }
        .right-component-transition-enter-to, .right-component-transition-leave {
            opacity: 1;
        }
        .right-component-transition-enter-active {
            transition: all 1s;
        }
    }
    // 顶部栏过渡动画
    .navbar-transition-enter, .navbar-transition-leave-to {
        height: 0;
        opacity: 0;
    }
    .navbar-transition-enter-to, .navbar-transition-leave {
        height: 63px;
        opacity: 1;
    }
    .navbar-transition-enter-active {
        transition: all 1s;
    }
}
.app-graph-loading{
    position: absolute;
    top: 14px;
    left: 212px;
    display: flex;
    align-items: center;
    background: rgba(255,255,255,1);
    z-index: 2;
    padding: 4px 20px;
    font-size: 12px;
    border-radius: 15px;
    box-shadow: 0 0 8px rgba(0, 118, 255, 0.16);
    span{
        margin-right:4px;
        color:#040C15;
    }
}
.searchNodeForm{
    position: absolute;
    top: 10px;
    left: 10px;
    width:200px;
    /deep/ .el-input__inner{
        box-shadow: 0 0 8px rgba(0, 118, 255, 0.16);
        border-radius: 22px;
    }
}
.searchNodeForm-popper{
    .el-select-dropdown__empty{
        padding: 6px 0;
    }
    .el-select-dropdown__item{
        height: unset;
        line-height: unset;
        padding: 4px 20px;
        .searchNodeForm-popper-name{
            color:#464C5D;
        }
        .searchNodeForm-popper-label{
            font-size: 12px;
            color:#778396;
        }
    }
}
</style>