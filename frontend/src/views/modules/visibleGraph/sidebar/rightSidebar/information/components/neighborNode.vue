<!--
 * @Author: huangyixin
 * @Date: 2021-12-31 09:43:37
 * @LastEditors: huangyixin
 * @LastEditTime: 2022-01-10 14:12:59
 * @Description: In User Settings Edit
 * @FilePath: /GraphInsight/src/views/modules/visibleGraph/sidebar/rightSidebar/information/components/neighborNode.vue
-->
<template>
    <div class="neighborNode-container">
        <div class="neighbor-list">
            <ul>
                <li v-for="(value, key) in neighborNodes" :key="key" class="neighbor-item border-color font-color-sub">
                    <div class="title-info-box">
                        <span @click="clickIcon(value)" class="cursor-pointer">
                            <i :class="[value.expand ? 'el-icon-caret-top' : 'el-icon-caret-right']"></i>
                            <span class="ml4">{{value.type}}</span>
                        </span>
                        <span class="number font-color-blue">{{value.number}}/{{ neighborNumber }}</span>
                    </div>
                    <transition name="dropdown-fade">
                        <div class="detail-info-box" v-if="value.expand">
                            <div class="detail-info-item" v-for="(childItem,childKey) in value.data" :key="`${key}-${childKey}`">
                                <span class="overflow-ellipsis" :title="childItem.node.name || childItem.node.id">{{childItem.node.name || childItem.node.id}}</span>
                                <span class="overflow-ellipsis" :title="childItem.link.map(e=>e.type).join(',')">{{childItem.link.map(e=>e.type).join(',')}}</span>
                                <!-- <el-dropdown>
                                    <i class="el-icon-more"></i>
                                    <el-dropdown-menu slot="dropdown" class="ps-dropdown-menu">
                                        <el-dropdown-item>
                                            <p @click="chooseNode(childItem)">选中</p>
                                        </el-dropdown-item>
                                        <el-dropdown-item>
                                            <p @click="chooseOtherRelation(childItem)">选中相同关系</p>
                                        </el-dropdown-item>
                                        <el-dropdown-item>
                                            <p @click="deleteNode(childItem)">删除</p>
                                        </el-dropdown-item>
                                        <el-dropdown-item>
                                            <p @click="deleteOther(childItem)">删除其他</p>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown> -->
                            </div>
                        </div>
                    </transition>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    props:{
        nodeInGraph:Array,
        item:Object
    },
    watch:{
        item:{
            handler(){
                this.calculateNeighbor();
            },
            deep:true   
        }
    },
    data() {
        return {
            neighborNodes:{},
            neighborNumber:0
        }
    },
    mounted(){
        this.calculateNeighbor();
    },
    methods:{
        calculateNeighbor(){
            let neighborInfo = {};
            if(this.item && this.item.dataLinks){
                let nodeMap = {}, totalNeighbor = [];
                for(let node of this.nodeInGraph){
                    nodeMap[node.id] = {
                        labels:node.labels,
                        name:node.name,
                        id:node.id
                    }
                }
                console.log(nodeMap);
                for(let link of this.item.dataLinks){
                    let neighbor = link.source == this.item.id ? link.target : link.source,
                        neighborData = nodeMap[neighbor];
                    if(!totalNeighbor.includes(neighbor)){
                        totalNeighbor.push(neighbor);
                    }
                    for(let label of neighborData.labels){
                        if(neighborInfo[label] == undefined){
                            neighborInfo[label] = {
                                type:label,
                                number:0,
                                expand:false,
                                data:{}
                            }
                        }
                        if(neighborInfo[label].data[neighbor] == undefined){
                            neighborInfo[label].number++;
                            neighborInfo[label].data[neighbor] = {
                                node:neighborData,
                                link:[]
                            }
                        }
                        neighborInfo[label].data[neighbor].link.push({
                            name:link.name,
                            type:link.type
                        });
                    }

                }
                console.log(neighborInfo);
                this.neighborNumber = totalNeighbor.length;
            }
            this.neighborNodes = neighborInfo;
        },
        // 展开详情
        clickIcon(value) {
            value.expand = !value.expand;
        },
        chooseNode(){

        },
        chooseOtherRelation(){

        },
        deleteNode(){

        },
        deleteOther(){
            
        }
    }
}
</script>

<style lang="less" scoped>
.neighborNode-container {
    height: 100%; 
    position: relative;
    .neighbor-list {
        overflow: auto;
        padding: 0 18px;
        font-size: 12px;
        position: absolute;
        top: 4px;
        bottom: 0px;
        left: 0px;
        right: 0px;
        .neighbor-name{
            margin-bottom:10px;
            padding-left:6px;
            position: relative;
            line-height: 12px;
            &::before{
                content: '';
                width: 2px;
                top: 0px;
                bottom: 0px;
                left: 0px;
                background: #1F81E4;
                position: absolute;
            }
        }
        ul {
            list-style: none;
            li.neighbor-item {
                margin: 12px 0;
                border: 1px  solid #EAEBF2;
                border-radius: 16px;
                padding: 5px 0;
                .title-info-box {
                    padding: 2px 12px;
                    display: flex;
                    justify-content: space-between;
                    .number {
                    }
                    span {
                        display: flex;
                        align-items: center;
                    }
                }
                .detail-info-box {
                    margin: 5px 0 0 0;
                    padding: 5px 0 0 0;
                    border-top: 1px solid #EAEBF2;
                    max-height: 200px;
                    overflow: auto;
                    .detail-info-item {
                        padding: 4px 14px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        span{
                            width:50%;
                            display: inline-block;
                        }
                        span:first-child{
                            padding-right: 2px;
                        }
                        span:last-child{
                            text-align: right;
                            padding-left: 2px;
                        }
                        // &:hover {
                        //     background: #E3E7ED;
                        // }
                    }
                }
            }
        }
    }
}
</style>