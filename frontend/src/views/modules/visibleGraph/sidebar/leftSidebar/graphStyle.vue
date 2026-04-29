<!--
 * @Author: huangyixin
 * @Date: 2021-12-13 17:22:59
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-04-11 14:16:39
 * @Description: In User Settings Edit
 * @FilePath: /GraphInsight/src/views/modules/visibleGraph/sidebar/leftSidebar/graphStyle.vue
-->
<template>
    <div class="graph-style">
        <el-tabs class="custom-tabs custom-tabs-title" v-model="activeTab" @tab-click="changeTab">
            <el-tab-pane label="节点" name="nodeStyle">
                <div class="flex-column" style="height:100%">
                    <el-input
                        class="flex-shrink"
                        placeholder="请输入类型"
                        suffix-icon="el-icon-search"
                        v-model="nodeContext"
                        size="small">
                    </el-input>
                    <div class="style-tip"><i class="el-icon-warning-outline"></i> 排序靠前的节点类型样式优先级高，多类型节点样式以优先级高的为准。可以通过拖拽改变样式优先级。</div>
                    <draggable class="node-list flex" ghost-class="ghost" :list="nodeList" @change="sortElement">
                        <div 
                            :class="['node-list-item', 'mt16 fs14 flex-left-center', activeItem && activeItem.type == item.type ? 'active-item' : '']" 
                            v-for="item of nodeList.filter(e=>e.type.toLowerCase().includes(nodeContext.trim().toLowerCase()))" 
                            :key="item.type" 
                            @click="clickNode(item)"
                        >
                            <span 
                                class="node-list-img flex-center flex-shrink" 
                                :style="{background:item.color}"
                            >
                                <svg-icon v-if="item.icon" :iconClass="item.icon" className="node-list-svg"></svg-icon>
                            </span>
                            <span class="node-list-type ml12 flex">{{ item.type }}</span>
                            <svg-icon iconClass="graphStyle-move" className="node-list-type-move flex-shrink"></svg-icon>
                        </div>
                    </draggable>
                </div>
            </el-tab-pane>
            <el-tab-pane label="关系" name="edgeStyle">
                <div class="flex-column" style="height:100%">
                    <el-input
                        class="flex-shrink"
                        placeholder="请输入类型"
                        suffix-icon="el-icon-search"
                        v-model="edgeContext"
                        size="small">
                    </el-input>
                    <ul class="node-list flex">
                        <li 
                            :class="['node-list-item', 'mt16 fs14 flex-left-center', activeItem && activeItem.type == item.type ? 'active-item' : '']" 
                            v-for="item of edgeList.filter(e=>e.type.toLowerCase().includes(edgeContext.trim().toLowerCase()))" 
                            :key="item.type" 
                            @click="clickEdge(item)"
                        >
                            <span 
                                class="node-list-img flex-center" 
                                :style="{background:item.color}"
                            >
                            </span>
                            <span class="node-list-type ml12">{{ item.type }}</span>
                        </li>
                    </ul>
                </div>
            </el-tab-pane>
        </el-tabs>
        <div class="style-edit-container" v-if="activeItem" v-clickoutside="clickout">
            <ul class="style-edit-container-title">
                <li class="style-edit-container-title-item" :class="{'active':item.key == activeStyle}" v-for="item of (activeTab == 'nodeStyle' ? styleList : styleListForEdge)" :key="item.key" @click="changeStyle(item)">{{ item.name }}</li>
            </ul>
            <div>
                <!-- 颜色选择  -->
                <div v-if="activeStyle=='color'">
                    <Sketch v-model="pickColor" :disableAlpha="true" @input="changeColor"></Sketch>
                </div>
                <!-- 大小选择  -->
                <div v-else-if="activeStyle=='size'">
                    <div class="style-edit-title">选择大小</div>
                    <ul class="style-size-node">
                        <li  v-for="item of sizeOptions" :key="item.id" :class="{'style-size-node-li-active':sizeChoose == item.id}" @click="changeSize(item)">
                            <div class="style-size-node-dot flex-center" v-if="activeTab=='nodeStyle'"><span :style="{width:`${item.width}px`,height:`${item.width}px`}"></span></div>
                            <div class="style-size-edge-line flex-center" v-else><span :style="{'border-radius':`${item.height}px`,height:`${item.height}px`}"></span></div>
                            <span class="style-size-node-name">{{ item.id }}X</span>
                        </li>
                    </ul>
                </div>
                <!-- icon选择  -->
                <div v-else-if="activeStyle=='icon'" class="icon-picker-container">
                    <div class="flex-left-center mt12 mb12">
                        <el-select class="flex" v-model="icon_category_active" placeholder="请选择" :popper-append-to-body="false" size="small">
                            <svg-icon iconClass="graphSearch-filter" className="select-icon" slot="prefix"></svg-icon>
                            <el-option
                                v-for="item in icon_category_list"
                                :key="item"
                                :label="item"
                                :value="item">
                            </el-option>
                        </el-select>
                        <div class="menu-icon-background flex-center flex-shrink">
                            <svg-icon iconClass="common-search-icon" className="menu-icon"></svg-icon>
                        </div>
                    </div>
                    <ul class="icon-picker-list">
                        <li 
                            v-for="item of icon_category[icon_category_active]" 
                            :key="item" 
                            class="icon-picker-item flex-center" 
                            :class="{'icon-picker-img-active':(icon_selected == (icon_category_active=='全部'?item:`${icon_category_active}-${item}`))}" 
                            @click="changeIcon(icon_category_active,item)"
                        >
                            <svg-icon :iconClass="icon_category_active == '全部' ? item : `${icon_category_active}-${item}`" className="icon-picker-img"></svg-icon>
                        </li>
                    </ul>
                </div>
                <!-- 标签选择  -->
                <div v-else>
                    <div class="style-edit-title">标签字段</div>
                    <el-select class="flex" v-model="attr4Label" placeholder="请选择属性名" :popper-append-to-body="false" size="small" style="width:100%" @change="changeLabel">
                        <el-option
                            v-for="item in attr4Label_list"
                            :key="item"
                            :label="item"
                            :value="item">
                        </el-option>
                    </el-select>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Sketch from '@/components/vueColor/components/Sketch';
import Clickoutside from '@/utils/clickoutside';
import service from '@/api/service';
import draggable from 'vuedraggable'

/** 获取所有的可选icon */
const req = require.context('@/assets/icons/picker', true, /\.svg$/);
let icon_category = {'全部':[]},
    icon_category_list = ['全部'];
req.keys().forEach((modules, index) => {
    let pathList = modules.split('/');
    if(pathList.length>2){
        if(!icon_category[pathList[1]]){
            icon_category[pathList[1]] = [];
        }
        icon_category[pathList[1]].push(pathList[2].split('.')[0]);
        icon_category['全部'].push(`${pathList[1]}-${pathList[2].split('.')[0]}`);

        if(!icon_category_list.includes(pathList[1])){
            icon_category_list.push(pathList[1]);
        }
    }
});

export default {
    components:{ Sketch,draggable },
    directives: { Clickoutside },
    props:{
        styleTypes: Object
    },
    data() {
        return {
            projectId: '',
            activeTab: 'nodeStyle',
            nodeContext:'',
            nodeList:[],
            edgeContext:'',
            edgeList:[],
            styleList:[
                { key:'color', name:'颜色' },
                // { key:'size', name:'大小' },
                { key:'icon', name:'图标' },
                { key:'label', name:'标签' },
            ],
            styleListForEdge:[
                { key:'color', name:'颜色' },
                // { key:'size', name:'大小' },
                // { key:'label', name:'标签' },
            ],
            activeItem:undefined,
            activeStyle:'color',
            //颜色选择参数
            pickColor:{
                hex:'#000000'
            },
            presetColor:["#112D4E","#283C63"],
            //图标选择参数
            icon_category:icon_category,
            icon_category_list:icon_category_list,
            icon_category_active:'',
            icon_selected:undefined,
            //标签参数
            attr4Label:'',
            attr4Label_list:['id','name'],
            //节点大小参数
            sizeOptions:[
                {id:'0.25',width:10,height:1},
                {id:'0.5',width:14,height:2},
                {id:'1',width:18,height:3},
                {id:'2',width:22,height:4},
                {id:'3',width:26,height:5},
                {id:'4',width:30,height:6},
            ],
            sizeChoose:'1'
        }
    },
    watch:{
        styleTypes: {
            deep: true,
            immediate: true,
            handler() {
                if(this.styleTypes.nodeTypes !== undefined){
                    this.setStyleType();
                }
            }
        }
    },
    mounted(){
        console.log('graphStyle-mounted');
        if(this.icon_category_list.length > 0){
            this.icon_category_active = this.icon_category_list[0];
        }
    },
    methods: {
        // 回显样式列表
        setStyleType() {
            this.nodeList = this.styleTypes.nodeTypes.map(type => {
                let style = this.styleTypes.styleMap[type] || {},
                item = {
                    id: style.id || '',
                    type: type,
                    color: style.color ? style.color.replace("0x", "#") : '#778396',
                    icon: style.icon || '',
                    tag: style.tag || 'name',
                    size: style.size || 1,
                    priority: style.priority
                };
                if (this.activeItem && type == this.activeItem.type) {
                    this.activeItem = item;
                }
                return item;
            })
            this.edgeList = this.styleTypes.linkTypes.map(type => {
                let style = this.styleTypes.styleMap[type] || {},
                item = {
                    id: style.id || '',
                    type: type,
                    color: style.color ? style.color.replace("0x", "#") : '#c3cbd3',
                    icon: style.icon || '',
                    tag: style.tag || 'name',
                    size: style.size || 1
                }
                if (this.activeItem && type == this.activeItem.type) {
                    this.activeItem = item;
                }
                return item;
            })
            this.setGraphStyle();
        },
        // 初次设置图谱内样式
        setGraphStyle() {
            this.$emit("emitEvent", "initGraphStyle", this.formatOutput());
        },
        // 输出样式列表
        formatOutput(){
            let nodeStyle = {}, edgeStyle = {};
            for(let item of this.nodeList){
                nodeStyle[item.type] = {
                    icon:item.icon,
                    size:item.size,
                    color:item.color.replace("#", "0x"),
                    tag:item.tag,
                    priority: item.priority
                }
            }

            for(let item of this.edgeList){
                edgeStyle[item.type] = {
                    size:item.size,
                    color:item.color.replace("#", "0x"),
                    tag:item.tag,
                }
            }
            return {
                nodeStyle: nodeStyle,
                edgeStyle: edgeStyle
            };
        },
        clickout(){
            this.activeItem = undefined
        },
        clickNode(d){
            this.activeItem = d;
            this.$nextTick(()=>{
                //设置颜色
                this.pickColor = { hex:d.color};
                //设置icon
                this.icon_selected = d.icon;
                //设置size
                this.sizeChoose = d.size;
                //设置label
                this.attr4Label = d.tag;
            });
        },
        clickEdge(d){
            this.activeItem = d;
            this.$nextTick(()=>{
                //设置颜色
                this.pickColor = { hex:d.color};
                //设置size
                this.sizeChoose = d.size;
                //设置label
                this.attr4Label = d.tag;
            });
        },
        changeTab(tab) {
            switch (tab.name) {
                case "nodeStyle":
                    this.activeStyle = this.styleList[0]?.key;
                    break;
                case "edgeStyle":
                    this.activeStyle = this.styleListForEdge[0]?.key;
                    break;
            }
        },
        // 切换样式菜单
        changeStyle(d){
            this.activeStyle = d.key;
        },
        // 改变颜色
        changeColor(newValue){
            console.log('changeColor');
            console.log(newValue);
            this.activeItem.color = newValue.hex;
            this.$emit('emitEvent','changeStyle',{
                id: this.activeItem.id,
                itemType:this.activeTab == 'nodeStyle'?'node':'edge',
                category:this.activeStyle,
                type:this.activeItem.type,
                value:newValue.hex,
                styleObject:this.formatOutput()
            });
        },
        // 改变节点图标
        changeIcon(icon_category_active,item){
            this.icon_selected = icon_category_active == '全部' ? item : `${icon_category_active}-${item}`;
            this.activeItem.icon = this.icon_selected;
            this.$emit('emitEvent','changeStyle',{
                id: this.activeItem.id,
                itemType:this.activeTab == 'nodeStyle'?'node':'edge',
                category:this.activeStyle,
                type:this.activeItem.type,
                value:this.icon_selected,
                styleObject:this.formatOutput()
            });
        },
        // 改变大小
        changeSize(d){
            this.sizeChoose = d.id;
            this.activeItem.size = d.id;
            this.$emit('emitEvent','changeStyle',{
                id: this.activeItem.id,
                itemType:this.activeTab == 'nodeStyle'?'node':'edge',
                category:this.activeStyle,
                type:this.activeItem.type,
                value:d.id,
                styleObject:this.formatOutput()
            });
        },
        // 改变标签
        changeLabel(){
            this.activeItem.tag = this.attr4Label;
            this.$emit('emitEvent','changeStyle',{
                id: this.activeItem.id,
                itemType:this.activeTab == 'nodeStyle'?'node':'edge',
                category:this.activeStyle,
                type:this.activeItem.type,
                value:this.attr4Label,
                styleObject:this.formatOutput()
            });
        },
        sortElement(){
            console.log(this.nodeList);
            this.$emit('emitEvent','sortElement',this.nodeList.map(e=>e.type));
        }
    }
}
</script>

<style lang="less" scoped>
.graph-style {
    position: relative;
    /deep/ .el-tabs {
        .el-tabs__item {
            padding:0 40px;
        }
    }
}
.node-list{
    overflow: auto;
    margin: 0 -18px;
    padding: 0 18px;
    .node-list-item {
        background: #F6F6F9;
        border-radius: 20px;
        padding:6px 16px;
        color:#464C5D;
        cursor: pointer;
        .node-list-img{
            width:22px;
            height:22px;
            border-radius: 20px;
            display: inline-flex;
            .node-list-svg{
                height: 12px;
                width: 12px;
                fill: #fff;
            }
        }
        .node-list-type-move{
            width:18px;
            height:18px;
            display: none;
            cursor: move;
            &:hover{
                fill:#0D86FF;
            }
        }
        &:hover{
            .node-list-type-move{
                display:block;
            }
        }
    }
    .node-list-item:hover, .active-item{
        background: #E8EFFF;
        .node-list-type{
            color: #0D86FF;
        }
    }
}
.style-edit-container{
    padding:16px 18px;
    min-height:200px;
    width:296px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,118,255,0.15);
    right:-298px;
    top:100px;
    position: absolute;
    .style-edit-container-title{
        background: #F6F7F9;
        border-radius: 12px;
        display: flex;
        justify-content: space-between;
        padding: 2px;
        .style-edit-container-title-item{
            display: inline-block;
            font-size: 12px;
            color: #464C5D;
            height: 28px;
            width: 58px;
            line-height: 28px;
            border-radius: 11px;
            text-align: center;
            cursor: pointer;
            &.active{
                background: white;
                color:#040C15;
            }
        }
    }
}
.vc-sketch{
    width: 260px;
    box-shadow: none;
    padding: 0;
    .vc-sketch-saturation-wrap{
        height: 106px;
        margin-top: 10px;
        border-radius: 2px;
    }
}

.icon-picker-container{
    .icon-picker-list{
        margin-right: -10px;
        margin-bottom: -10px;
        .icon-picker-item{
            height:35px;
            width:35px;
            background: #F6F7F9;
            display: inline-flex;
            border-radius: 6px;
            margin: 0 10px 10px 0;
            cursor: pointer;
            .icon-picker-img{
                width:20px;
                height: 20px;
                fill:#464C5D;
            }
            &:hover,&.icon-picker-img-active{
                background: #E8EFFF;
                .icon-picker-img{ 
                   fill:#0D86FF;
                }
            }
        }
    }
}
.select-icon {
    width: 17px;
    height: 17px;
    fill: #778396;
    margin-top: 8px;
    margin-left: 2px;
}
.menu-icon-background {
    width: 35px;
    height: 32px;
    border: 1px solid #D0D9E2;
    border-radius: 5px;
    margin: 0 0 0 12px;
    cursor: pointer;
    .menu-icon {
        width: 18px;
        height: 14px;
        fill: #778396;
    }
}
.style-edit-title{
    font-size: 12px;
    margin: 10px 0 7px;
}
.style-size-node{
    margin-bottom: -12px;
    li{
        font-size:12px;
        background-color: #F6F6F9;
        border-radius: 20px;
        padding:0px 20px;
        height:36px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        cursor: pointer;
        .style-size-node-dot{
            width:30px;
            flex-shrink:0;
            span{
                display: inline-block;
                background: #C3CDE2;
                border-radius: 50%;
            }
        }
        .style-size-edge-line{
            width:166px;
            span{
                display: inline-block;
                background: #C3CDE2;
                border-radius: 50%;
                width: 100%;
            }
        }
        .style-size-node-name{
            color:#464C5D;
            text-align: right;
            flex:1
        }
        &:hover, &.style-size-node-li-active{
            background-color: #E8EFFF;
            .style-size-node-dot span{
                background: #0D86FF;
            }
        }
    }
}
.style-tip{
    font-size: 11px;
    padding-bottom: 2px;
    margin-top: 6px;
}
</style>