<!--
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2021-12-10 13:50:37
 * @Feature: 
 * @LastEditors: huangyixin
 * @LastEditTime: 2022-03-15 17:56:28
 * @FilePath: /GraphInsight/src/views/modules/visibleGraph/sidebar/leftSidebar/searchTab/basicSearch.vue
-->
<template>
    <div class="basic-search">
        <div class="search-box flex-center flex-shrink">
            <el-input ref="searchInput" size="small" v-model="searchName" @keydown.native.enter="querySearchAsync" prefix-icon="el-icon-search" :placeholder="`输入${factorType || 'name'}，按回车查询`"></el-input>
            <el-popover
                placement="right-start"
                trigger="click"
            >
                <div class="menu-icon-background flex-center" slot="reference">
                    <svg-icon iconClass="graphSearch-filter" className="menu-icon"></svg-icon>
                </div>
                <div class="search-filter">
                    <div class="search-filter-title">类型</div>
                    <div class="search-filter-value">
                        <el-select v-model="searchType" multiple placeholder="选择查询类型" size="small" style="width:265px" clearable filterable @change="querySearchAsync">
                            <el-option
                                v-for="item in nodeTypes"
                                :key="item"
                                :label="item"
                                :value="item">
                            </el-option>
                        </el-select>
                    </div>
                    <div class="search-filter-title">字段</div>
                    <div class="search-filter-value">
                        <el-select v-model="factorType" placeholder="选择查询字段" size="small" style="width:265px" clearable filterable @change="querySearchAsync">
                            <el-option
                                v-for="item in nodeAttributes"
                                :key="item"
                                :label="item"
                                :value="item">
                            </el-option>
                        </el-select>
                    </div>
                </div>
            </el-popover>
        </div>
        <ul class="search-filter-list flex-shrink" v-if="searchType.length > 0 || factorType != ''">
            <li v-if="searchType.length">
                {{ `类型-${searchType.join('/')}` }}
                <span @click="removeSearchType"><i class="el-icon-close"></i></span>
            </li>
            <li v-if="factorType!=''">
                {{ `字段-${factorType}` }}
                <span @click="removeFactorType"><i class="el-icon-close"></i></span>
            </li>
        </ul>
        <div class="search-operate flex-shrink">
            <div class="accurate-match custom-switch flex-center">
                <span>精准匹配</span>
                <el-switch v-model="accurateMatch" @change="querySearchAsync"></el-switch>
            </div>
        </div>
        <!-- 第一次查询提示 -->
        <template v-if="firstLoading">
            <div class="flex first-search-tip flex-center flex-column font-color-sub">
                <span class="node-loading flex-column flex-center" v-if="nodeSearchLoading" style="display:inline-flex;">
                    <ring-loader color="#0D86FF" :size="90"></ring-loader>
                    <span class="mt10">加载中...</span>
                </span>
                <template v-else>
                    <img src="@icons/png/search/searchTip.png" style="width:140px;"/>
                    <span class="mt10">请查询节点</span>
                </template>
            </div>
        </template>
        <template v-else>
            <!-- 查询不为空 -->
            <ul class="search-list flex" 
                v-if="searchList.length != 0" 
                v-infinite-scroll="nextPage" 
                :infinite-scroll-disabled="scrollDisable"
                infinite-scroll-distance="1"
            >
                <li 
                    class="search-item"
                    :class="{'search-item-disable':nodesIdsInGraph.includes(item.id)}"
                    v-for="(item, index) in searchList"
                    :key="index"
                    @click="debounce_addNode2Graph(item)"
                >
                    <div class="item-info">
                        <div class="item-name">{{item.name || item.id}}</div>
                        <div class="item-type">
                            <span v-for="(label,index) of item.labels">
                                {{label}}
                            </span>
                        </div>
                    </div>
                    <div class="add-button">
                        <div class="add-button-background flex-center">
                            <svg-icon iconClass="graphLeftSidebar-add-button" className="add-button-icon"></svg-icon>
                        </div>
                    </div>
                </li>
                <span class="node-loading font-color-sub" v-if="nodeSearchLoading"><i class="el-icon-loading"></i><span>查询中，请等待结果返回...</span></span>
                <span class="node-loading font-color-sub" v-if="!nodeSearchLoading && noMore">没有更多数据</span>
            </ul>
            <!-- 查询为空 -->
            <div class="flex first-search-tip flex-center flex-column font-color-sub" v-else>
                <span class="node-loading flex-column flex-center" v-if="nodeSearchLoading" style="display:inline-flex;">
                    <ring-loader color="#0D86FF" :size="90"></ring-loader>
                    <span class="mt10">查询中，请等待结果返回...</span>
                </span>
                <template v-else>
                    <img src="@icons/png/search/emptyTip.png" style="width:140px;"/>
                    <span class="mt10">没有符合的数据</span>
                </template>
            </div>
        </template>
        <div class="flex-shrink bottom-btn-con" v-if="false">
            <el-button type="primary" size="small" style="width:100%" icon="el-icon-plus" round  @click="addAll2Graph">添加全部</el-button>
        </div>
    </div>
</template>

<script>
import service from '@/api/service';
import _ from "lodash";
import {show_message} from '@/utils/message';
import { RingLoader } from '@saeris/vue-spinners';

export default {
    props:{
        nodeTypes:Array,
        nodeAttributes:Array,
        projectId:Number,
        nodesIdsInGraph:Array
    },
    components:{
        RingLoader
    },
    data() {
        return {
            searchName: '',
            accurateMatch: false,
            searchList: [],
            searchType:[],
            factorType:'',
            currentPage:1,
            nodeSearchLoading:false,
            scrollDisable:true,
            firstLoading:true,
            noMore:false,
            defaultAttribute:'name',
            searchIng: false
        }
    },
    watch:{
        searchFilter(n,o){
            console.log(n,o)
        }
    },
    mounted() {
        this.debounce_addNode2Graph = _.debounce(this.addNode2Graph, 300);
    },
    methods: {
        nextPage(){
            console.log('nextPage');
            this.currentPage++;
            this.scrollDisable = true;
            this.$nextTick(()=>{
                this.searchNode();
            });
        },
        querySearchAsync() {
            console.log('querySearchAsync');
            this.currentPage = 0;
            this.scrollDisable = true;
            this.$nextTick(()=>{
                this.searchList = [];
                // service.cancelRequest();
                setTimeout(()=>{
                    this.searchNode();
                });
            });
        },
        searchNode(){
            if (this.searchIng) return;
            this.searchIng = true;
            console.log('searchNode');
            let params = {
                param: {
                    "attributesKey": this.factorType|| this.defaultAttribute,
                    "currentPage": this.currentPage,
                    "fuzzy": !this.accurateMatch,
                    "pageSize": 10,
                    "queryValue": this.searchName.trim(),
                    "vertexLabelList": this.searchType
                },
                urlParam: {
                    projectId: this.projectId
                }
            };
            if (this.factorType == 'id') {
                params.param.idList = [this.searchName.trim()];
                params.param.attributesKey = '';
            }
            this.nodeSearchLoading = true;
            service.doRequest("searchNode", params).then(result => {
                this.searchIng = false;
                if (result.status == 200) {
                    this.searchList = [...this.searchList,...result.data.content];
                }else{
                    show_message(result.message);
                }
                this.nodeSearchLoading = false;
                this.firstLoading =false;
                this.noMore = result.data.last;
                if(this.noMore){
                    this.scrollDisable = true;
                }else{
                    this.$nextTick(()=>{
                        this.scrollDisable = false;
                    });
                }
            },()=>{
                console.log('cancelRequest');
                this.nodeSearchLoading = false;
                this.firstLoading =false;
                this.noMore = false;
                this.searchIng = false;
            });
        },
        removeSearchType(){
            this.searchType = [];
            this.querySearchAsync();
        },
        removeFactorType(){
            this.factorType = '';
            this.querySearchAsync();
        },
        addNode2Graph(node){
            if(!this.nodesIdsInGraph.includes(node.id)){
                this.$emit('addNode',[node]);
            }else{
                show_message('画布中已经存在该节点');
            }
        },
        addAll2Graph(node){
            this.$emit('addNode',this.searchList);
        },
        editItemAttr(id, newAttr, type) {
            for (let i = 0; i < this.searchList.length; i++) {
                let element = this.searchList[i];
                if (element.id == id) {
                    if (type == 'edit') {
                        let isNew = true;
                        for (let j = 0; j < element.attributeList.length; j++) {
                            let attr = element.attributeList[j];
                            // 编辑属性
                            if (attr.name == newAttr.key) {
                                isNew = false;
                                attr.value = newAttr.value;
                                break;
                            }
                        }
                        // 新增属性
                        isNew && element.attributeList.push({
                            name: newAttr.key,
                            value: newAttr.value
                        })
                    } else if (type == 'delete') {
                        let index = -1;
                        for (let j = 0; j < element.attributeList.length; j++) {
                            let attr = element.attributeList[j];
                            // 编辑属性
                            if (attr.name == newAttr.key) {
                                index = j;
                                break;
                            }
                        }
                        index != -1 && element.attributeList.splice(index, 1);
                    }
                    break;
                }
            }
        },
        deleteItem(id) {
            let index = -1;
            for (let i = 0; i < this.searchList.length; i++) {
                if (this.searchList[i].id == id) {
                    index = i;
                    break;
                }
            }
            index != -1 && this.searchList.splice(index, 1);
        }
    }
}
</script>

<style lang="less" scoped>
.basic-search {
    height: 100%;
    display: flex;
    flex-direction: column;
    .search-box {
        .menu-icon-background {
            width: 32px;
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
        /deep/ .el-autocomplete {
            flex: 1;
            .el-input__inner {
                height: 34px;
            }
        }
    }
    .search-operate {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        margin: 14px 0;
        .batch-add {
            cursor: pointer;
        }
    }
    .first-search-tip{
        font-size: 12px;
    }
    .search-list {
        overflow: auto;
        flex: 1;
        margin: 0 -18px;
        padding: 0 18px;
        li{
            display: flex;
            align-items: center;
            border-radius: 12px;
            background: #F6F6F9;
            padding: 6px 16px 6px 24px;
            margin: 0 0 12px 0;
            transition: all 0.6s;
            cursor: pointer;
            .item-info {
                flex:1;
                .item-name {
                    color: #464C5D;
                    font-size: 14px;
                }
                .item-type {
                    color: #778396;
                    font-size: 12px;
                    span{
                        margin-right:3px;
                    }
                }
            }
            
            .add-button {
                flex-shrink: 0;
                opacity: 0;
                transition: all 0.6s;
                cursor: pointer;
                .add-button-background {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: #0D86FF;
                    .add-button-icon {
                        width: 10px;
                        height: 10px;
                        fill: #fff;
                    }
                }
            }
            &:hover {
                background: #E8EFFF;
                .item-info {
                    .item-name {
                        color: #0D86FF;
                    }
                    .item-type {
                        color: #0D86FF;
                    }
                }
                .add-button {
                    opacity: 1;
                }
            }
        }
        li.search-item-disable{
            background: #F6F6F9;
            cursor: default;
            .item-info{
                opacity: 0.4;
                .item-name {
                    color: #464C5D;
                }
                .item-type {
                    color: #778396;
                }
            }
            .add-button {
                opacity: 0;
                cursor: default;
            }
        }
    }
    /deep/ .el-pagination {
        text-align: center;
        .el-pager {
            display: flex;
            align-items: center;
            li {
                width: 38px;
                height: 38px;
                line-height: 38px;
                text-align: center;
                font-size: 14px;
                background: transparent;
                transition: all 0.3s;
            }
            .active {
                background: #fff;
                border-radius: 50%;
                box-shadow: 0 3px 10px rgba(125, 163, 214, 0.16);
            }
        }
        .el-pagination__jump {
            .el-pagination__editor {
                .el-input__inner {
                    border: 1px solid #D0D9E2;
                    border-radius: 6px;
                    background: #E2E9F0;
                }
            }
        }
    }
}
.search-filter{
    padding: 14px 6px 0;
    .search-filter-title{
        font-size: 12px;
        margin-bottom: 8px;
    }
    .search-filter-value{
        margin-bottom: 14px;
    }
}
.search-filter-list{
    margin: 10px -12px -6px 0px;
    li{
        display: inline-block;
        margin-right: 12px;
        padding:4px 22px 4px 8px;
        border-radius: 4px;
        background-color: #F0F3FA;
        font-size: 12px;
        margin-bottom: 6px;
        position: relative;
        span{
            position: absolute;
            right: 4px;
            height: 14px;
            width: 14px;
            display: inline-block;
            background: #C3CDE2;
            line-height: 14px;
            text-align: center;
            border-radius: 8px;
            color: #fff;
            top: 50%;
            cursor: pointer;
            font-size: 10px;
            margin-top: -7px;
        }
    }
}
/deep/ .el-select{
    // .el-tag.el-tag--info{
    //     background-color: #F0F3FA;
    //     border-color: #F0F3FA;
    //     color: #040C15;
    // }
    // .el-tag.el-tag--info .el-tag__close{
    //     background: #ffffff;
    // }
    // .el-select .el-tag__close.el-icon-close{
    //     background-color: #C3CDE2;
    // }
}
.node-loading{
    width: 100%;
    display: inline-block;
    text-align: center;
    font-size: 12px;
    margin: 0 0 18px 0;
    i{
        font-size: 14px;
        display: inline-block;
    }
    span{
        margin-left:3px;
    }
}
</style>