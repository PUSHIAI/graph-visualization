<!--
 * @Author: huangyixin
 * @Date: 2022-03-31 13:53:59
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-04-11 13:42:19
 * @Description: In User Settings Edit
 * @FilePath: /GraphInsight/src/views/modules/frontPage/perference.vue
-->
<template>
    <div class="dialog-box" style="margin-top:-24px;">
        <el-tabs class="" v-model="activeTab">
            <el-tab-pane label="节点" name="node">
                <div class="perference-form mb10 mt4" v-if="false">
                    <label>唯一标识</label>
                    <el-input v-model="nodeId" placeholder="默认使用id字段" style="width:315px;" class="flex-shrink mr14" size="small"></el-input>
                    <span class="perferen-form-tip">默认使用节点的id属性作为唯一标识</span>
                </div>
                <div class="perference-form" v-if="false">
                    <label>描述字段</label>
                    <el-input v-model="nodeName" placeholder="默认使用name字段" style="width:315px;" class="flex-shrink mr14" size="small"></el-input>
                    <span class="perferen-form-tip">默认使用节点的name属性作为唯描述字段，如果没有name字段使用第一个属性</span>
                </div>
                <div class="perference-style" key="node-style" @keyup.enter="switchNode">
                    <div class="perferen-form-tip">配置节点的样式，包括：颜色、大小、图标、标签。排序靠前的节点类型样式优先级高，多类型节点样式以优先级高的为准。可以通过拖拽改变样式优先级。<span>按下回车（enter）键快速切换到下一个类型！</span></div>
                    <div class="flex perference-style-main">
                        <template v-if="nodeList.length > 0">
                            <div class="perference-style-left">
                                <draggable class="node-list flex" ghost-class="ghost" :list="nodeList" @change="sortElement">
                                    <div 
                                        :class="['node-list-item', 'mt16 fs14 flex-left-center', activeItem && activeItem.type == item.type ? 'active-item' : '']" 
                                        v-for="(item,index) of nodeList" 
                                        :key="item.type" 
                                        @click="clickNode(item,index)"
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
                            <div class="perference-style-right">
                                <div class="style-edit-container" v-if="activeItem">
                                    <ul class="style-edit-container-title">
                                        <li class="style-edit-container-title-item" :class="{'active':item.key == activeStyle}" v-for="item of styleList" :key="item.key" @click="changeStyle(item)">{{ item.name }}</li>
                                    </ul>
                                    <div>
                                        <!-- 颜色选择  -->
                                        <div v-if="activeStyle=='color'">
                                            <Sketch class="outter-sketch" v-model="pickColor" :disableAlpha="true" @input="changeColor"></Sketch>
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
                                                <!-- <div class="menu-icon-background flex-center flex-shrink">
                                                    <svg-icon iconClass="common-search-icon" className="menu-icon"></svg-icon>
                                                </div> -->
                                            </div>
                                            <ul class="icon-picker-list" style="height: 242px;overflow: auto;">
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
                        <div v-else style="margin: 0 auto;">
                            <el-empty :image-size="140" description="没有节点类型数据"></el-empty>
                        </div>
                    </div>  
                </div>
            </el-tab-pane>
            <el-tab-pane label="关系" name="relation">
                <div class="perference-style" key="relation-style">
                    <div class="perferen-form-tip">配置关系的颜色。<span>按下回车（enter）键快速切换到下一个类型！</span></div>
                    <div class="flex perference-style-main">
                        <template v-if="edgeList.length > 0">
                            <div class="perference-style-left">
                                <ul class="node-list flex">
                                    <li 
                                        class="node-list-item mt16 fs14 flex-left-center" 
                                        :class="[activeItem_edge && activeItem_edge.type == item.type ? 'active-item' : '']" 
                                        v-for="(item,index) of edgeList" 
                                        :key="item.type" 
                                        @click="clickEdge(item,index)"
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
                            <div class="perference-style-right">
                                <div class="style-edit-container" v-if="activeItem_edge">
                                    <ul class="style-edit-container-title">
                                        <li class="style-edit-container-title-item" :class="{'active':item.key == activeStyle_edge}" v-for="item of styleListForEdge" :key="item.key" @click="changeStyle_edge(item)">{{ item.name }}</li>
                                    </ul>
                                    <div>
                                        <!-- 颜色选择  -->
                                        <div v-if="activeStyle_edge=='color'">
                                            <Sketch class="outter-sketch" v-model="pickColor_edge" :disableAlpha="true" @input="changeColor_edge"></Sketch>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <div v-else style="margin: 0 auto;">
                            <el-empty :image-size="140" description="没有关系类型数据"></el-empty>
                        </div>
                    </div>  
                </div>
            </el-tab-pane>
        </el-tabs>
        <div class="button-box">
            <div>
                <el-button size="mini" class="cancel" @click="closeDialog">取消</el-button>
                <el-button size="mini" type="primary" class="confirm" @click="submit" :loading="loading">确定</el-button>
            </div>
        </div>
    </div>
</template>

<script>
import Sketch from '@/components/vueColor/components/Sketch';
import draggable from 'vuedraggable'
import service from '@/api/service';
import { show_message } from "@/utils/message.js";

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
    components:{Sketch,draggable},
    data() {
        return {
            activeTab:'node',
            loading:false,
            /*节点配置*/
            nodeId:'',
            nodeName:'',
            nodeList:[],
            activeItem:undefined,
            activeStyle:'color',
            styleList:[
                { key:'color', name:'颜色' },
                // { key:'size', name:'大小' },
                { key:'icon', name:'图标' },
                { key:'label', name:'标签' },
            ],
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
            sizeChoose:'1',
            /*关系配置*/
            edgeList:[],
            activeItem_edge:undefined,
            activeStyle_edge:'color',
            styleListForEdge:[
                { key:'color', name:'颜色' },
                // { key:'size', name:'大小' },
                // { key:'label', name:'标签' },
            ],
            //颜色选择参数
            pickColor_edge:{
                hex:'#000000'
            },
        }
    },
    props:{
        nodeTypes:Array,
        linkTypes:Array,
        projectId:String
    },
    watch:{
        nodeTypes:{
            deep: true,
            immediate: true,
            handler() {
                this.setNodeType();
                this.initNode();
            }
        },
        linkTypes:{
            deep: true,
            immediate: true,
            handler() {
                this.setLinkType();
                this.initEdge();
            }
        },
        activeTab(n,o){
            if(n == 'node'){
                this.initNode();
            }else{
                this.initEdge();
            }
        }
    },
    mounted(){
        if(this.icon_category_list.length > 0){
            this.icon_category_active = this.icon_category_list[0];
        }
        this.nodeIndex = 0;
        this.edgeIndex = 0;
        document.addEventListener('keyup',this.enterEvent);
    },
    beforeDestroy(){
        document.removeEventListener('keyup',this.enterEvent);
    },
    methods:{
        enterEvent(event){
            var e = event || window.event;
            if(e && e.keyCode == 13){  
                if(this.activeTab == 'node'){
                    if(this.nodeIndex < this.nodeList.length -1){
                        this.nodeIndex++;
                    }else{
                        this.nodeIndex = 0;
                    }
                    this.clickNode(this.nodeList[this.nodeIndex],this.nodeIndex);
                }else{
                    if(this.edgeIndex < this.edgeList.length -1){
                        this.edgeIndex++;
                    }else{
                        this.edgeIndex = 0;
                    }
                    this.clickEdge(this.edgeList[this.edgeIndex],this.edgeIndex);
                }
            }
        },
        closeDialog(){
            this.$emit('styleClose');
        },
        submit(){
            console.log(this.nodeList,this.edgeList);
            let styleList = [];
            for(let node of this.nodeList){
                styleList.push({
                    isVertexType:true,
                    priority:node.priority,
                    labelName:node.type,
                    color: node.color && node.color.indexOf('#') != -1 ? node.color.replace("0x", "#") : node.color,
                    icon:node.icon,
                    tag:node.tag,
                    size:node.size
                });
            }
            for(let edge of this.edgeList){
                styleList.push({
                    isVertexType:false,
                    labelName:edge.type,
                    color: edge.color && edge.color.indexOf('#') != -1 ? edge.color.replace("0x", "#") : edge.color,
                    tag:edge.tag,
                    size:edge.size
                });
            }
            let param = {
                urlParam: {
                    projectId: this.projectId
                },
                param:styleList
            }

            this.loading = true;
            service.doRequest("setProjectStyleBatch", param).then(result => {
                if (result.status == 200) {
                    show_message("样式配置成功", "success");
                    this.$emit('styleSuccess');
                }
                this.loading = false;
            },()=>{
                this.loading = false;
            });
        },
        initNode(){
            if(this.activeItem === undefined && this.nodeList.length > 0){
                this.clickNode(this.nodeList[0]);
            }
        },
        initEdge(){
            if(this.activeItem_edge === undefined && this.edgeList.length > 0){
                this.clickEdge(this.edgeList[0]);
            }
        },
        sortElement(){
            this.nodeList.forEach((e,index)=>{
                e.priority = index+1;
            });
        },
        // 切换样式菜单
        changeStyle(d){
            this.activeStyle = d.key;
        },
        clickNode(d,index = 0){
            console.log(d,index);
            this.activeItem = d;
            this.nodeIndex = index;
            this.activeStyle = 'color';
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
        setNodeType(){
            let index = 0;
            this.nodeList = this.nodeTypes.map(type => {
                let item = {
                    id: '',
                    type: type,
                    color: '#778396',
                    icon: '',
                    tag: 'name',
                    size: 1,
                    priority: ++index
                };
                return item;
            })
        },
        setLinkType(){
            this.edgeList = this.linkTypes.map(type => {
                let item = {
                    id: '',
                    type: type,
                    color: '#c3cbd3',
                    tag: 'name',
                    size: 1
                }
                return item;
            })
        },
        // 改变颜色
        changeColor(newValue){
            this.activeItem.color = newValue.hex;
        },
        // 改变节点图标
        changeIcon(icon_category_active,item){
            this.icon_selected = icon_category_active == '全部' ? item : `${icon_category_active}-${item}`;
            this.activeItem.icon = this.icon_selected;
        },
        // 改变大小
        changeSize(d){
            this.sizeChoose = d.id;
            this.activeItem.size = d.id;
        },
        // 改变标签
        changeLabel(){
            this.activeItem.tag = this.attr4Label;
        },
        clickEdge(d,index = 0){
            this.activeItem_edge = d;
            this.edgeIndex = index;
            this.activeStyle_edge = 'color';
            this.$nextTick(()=>{
                //设置颜色
                this.pickColor_edge = { hex:d.color};
            });
        },
        changeStyle_edge(d){
            this.activeStyle_edge = d.key;
        },
        changeColor_edge(newValue){
            this.activeItem_edge.color = newValue.hex;
        },
        switchNode(){
            console.log('switchNode');
        }
    }
}
</script>


<style lang="less" scoped>
.dialog-box {
    .button-box {
        margin: 23px 0 0;
        text-align: right;
        .el-button {
            width: 118px;
            height: 32px;
            font-size: 14px;
        }
        .test-connect {
            background: #F0F4F9;
            border-radius: 16px;
            color: #0D86FF;
            border: none;
            font-weight: normal;
            &:hover{
                background: #E8EFFF;
                color:#0B70FA;
            }
        }
        .cancel {
            border: 1px solid #D0D9E2;
            border-radius: 27px;
            color: #040C15;
            font-weight: normal;
            &:hover{
                background: #E7E7EA;
            }
        }
        .confirm {
            background: #0D86FF;
            border-radius: 27px;
            color: #fff;
            &:hover{
                background: #0B70FA;
            }
        }
    }
}
/deep/ .dialog-box .el-tabs__nav-scroll{
    padding: 0px 16px;
}
.perference-form{
    display: flex;
    align-items: center;
    label{
        width:56px;
        margin-right:14px;
        flex-shrink: 0;
        color:#040C15;
        font-size: 14px;
    }
}
.perferen-form-tip{
    color:#778396;
    font-size:12px;
    span{
        color:red;
    }
}
.perference-style{
    border: 1px solid #D0D9E2;
    border-radius: 8px;
    padding:18px 14px 10px;
    margin-top: 26px;
    position: relative;
    &::before{
        content: '样式';
        position: absolute;
        top: -18px;
        left: 16px;
        padding: 4px 20px;
        background: white;
        font-size: 18px;
        color: #000000;
    }
    .perference-style-main{
        display: flex;
        margin-top:10px;
        .perference-style-left{
            width:250px;
            padding-right:14px;
            border-right: 1px solid #D0D9E2;
            max-height: 352px;
            overflow: auto;
        }
        .perference-style-right{
            flex:1;
            padding: 8px 20px;
            margin: 0 0 0 14px;
            border: 1px solid #D0D9E2;
            border-radius: 8px;
            background: #F6F6F9;
            height: 352px;
        }
    }
}
.node-list{
    overflow: auto;
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
/deep/ .outter-sketch{
    width: 100%;
    box-shadow: none;
    padding: 0;
    background: none;
    .vc-sketch-saturation-wrap{
        height: 106px;
        margin-top: 10px;
        border-radius: 2px;
        width: 376px;
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
</style>
