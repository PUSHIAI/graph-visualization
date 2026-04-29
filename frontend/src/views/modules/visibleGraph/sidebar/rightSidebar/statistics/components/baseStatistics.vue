<!--
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2021-12-13 11:11:44
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-03-25 17:35:33
 * @FilePath: /GraphInsight/src/views/modules/visibleGraph/sidebar/rightSidebar/statistics/components/baseStatistics.vue
-->
<template>
    <div class="base-statistics">
        <div v-if="nodeInGraph.length == 0 && linkInGraph.length == 0">
            <el-empty description="画布暂无数据"></el-empty>
        </div>
        <div 
            v-for="(value, key) in countTypeObj"
            :key="key"
            class="type-box"
        >
            <template v-if="key=='节点类型' ? (nodeInGraph.length == 0 ? false:true) : (linkInGraph.length == 0 ? false:true)">
                <div class="title">{{key}}</div>
                <div class="type-content">
                    <div 
                        v-for="(number, type) in value"
                        :key="type"
                        class="type-item"
                    >
                        <div class="type">{{type}}</div>
                        <div class="number-box">
                            <div class="number-bar">
                                <div 
                                    class="number-line" 
                                    :style="{
                                        width: setWidth(number, value),
                                        'background-image': typeColor[key]
                                    }"
                                >
                                </div>
                            </div>
                            <div class="number">{{number}}</div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
export default {
    props:{
        nodeInGraph:Array,
        linkInGraph:Array
    },
    data() {
        return {
            // countTypeObj: {
            //     节点类型: {
            //         A股股票: 100,
            //         港股股票: 70,
            //         标的公司: 50,
            //         基金: 30
            //     },
            //     关系类型: {
            //         A股股票: 100,
            //         港股股票: 70,
            //         标的公司: 50,
            //         基金: 30
            //     },
            // },
            typeColor: {
                节点类型: 'linear-gradient(to right, #fff , #FFC957)',
                关系类型: 'linear-gradient(to right, #fff , #EB8133)'
            }
        }
    },
    computed:{
        countTypeObj(){
            let obj = {
                '节点类型':{},
                '关系类型':{}
            };
            for(let node of this.nodeInGraph){
                let nodeLabel = node.labels;
                for(let label of nodeLabel){
                    if(obj['节点类型'][label]==undefined){
                        obj['节点类型'][label] = 0;
                    }
                    obj['节点类型'][label]++;
                }
            }
            for(let link of this.linkInGraph){
                let linkType = link.type;
                if(obj['关系类型'][linkType]==undefined){
                    obj['关系类型'][linkType] = 0;
                }
                obj['关系类型'][linkType]++;
            }
            return obj;
        }
    },
    methods: {
        setWidth(number, value) {
            let sum = 0;
            for (let key in value) {
                sum += value[key];
            }
            return (number / sum + 0.1) * 100 + '%';
        }
    }
}
</script>

<style lang="less" scoped>
.base-statistics {
    padding: 0 18px;
    /deep/ .el-empty{
        padding:0px;
    }
    .type-box {
        .title {
            font-size: 12px;
            font-weight: bold;
            color: #040C15;
        }
        .type-content {
            padding: 8px 10px;
            margin: 12px 0 18px;
            background: #FBFBFD;
            border-radius: 10px;
            .type-item {
                display: flex;
                align-items: center;
                padding: 3px 0;
                .type {
                    color: #778396;
                    font-size: 12px;
                    width: 60px;
                    text-align: right;
                    // overflow: hidden;
                    // text-overflow: ellipsis;
                    // white-space: nowrap;
                    word-break: break-all;
                }
                .number-box {
                    width: 0;
                    flex: 1;
                    display: flex;
                    align-items: center;
                    margin: 0 0 0 15px;
                    .number-bar {
                        flex: 1;
                        .number-line {
                            height: 10px;
                            border-radius: 5px;
                        }
                    }
                    .number {
                        width: 45px;
                        text-align: right;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        font-size: 16px;
                        color: #040C15;
                    }
                }
            }
        }
    }
}
</style>
