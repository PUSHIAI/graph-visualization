<!--
 * @Author: huangyixin
 * @Date: 2022-02-14 10:55:39
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-03-29 14:44:19
 * @Description: In User Settings Edit
 * @FilePath: /GraphInsight/src/views/modules/visibleGraph/sidebar/leftSidebar/algorithm/shortPath.vue
-->
<template>
    <div class="content-panel">
        <div class="flex-shrink">
            <div class="fs14 relative">已选节点<span class="select-number">{{ selectNodes.length }}</span></div>
            <ul class="select-node-list" v-if="selectNodes.length>0">
                <li class="select-node-item" v-for="item of selectNodes" :key="item.id"  :title="item.name">
                    <div class="select-node-name">{{ item.name || item.id }}</div>
                    <span class="select-node-item-close" v-if="selectNodes.length>2" @click="cancelSelection(item.id)"><i class="el-icon-close"></i></span>
                </li>
            </ul>
            <div class="select-tip fs12 font-color-sub" v-else>
                按住ctrl点击需要选中的节点
            </div>
        </div>
        <div class="flex-shrink">
            <div>
                <span class="path-label">路径深度</span>
                <el-input-number v-model="deep" :min="2" :max="10" label="路径深度" size="small" style="width:100%" class=""></el-input-number>
                <div class="style-tip mb14">超过路径深度的路径将会被忽略</div>
            </div>
            <div class="flex-layout">
                <el-button size="small" class="flex-shrink" style="width:64px;" @click="resetPaths">重置</el-button>
                <el-button size="small" class="flex" type="primary" @click="searchPaths" :loading="pathLoading">搜索路径</el-button>
            </div>
        </div>
        <div class="flex">
            
        </div>
    </div>
</template>

<script>
import service from '@/api/service';
import {show_message} from '@/utils/message';

export default {
    props:{
        selectNodes:Array,
        projectId:Number,
    },
    components:{},
    data() {
        return {
            deep:10,
            pathLoading:false
        }
    },
    methods: {
        searchPaths(){
            let params = {
                param: {
                    "idList": this.selectNodes.map(e=>e.id),
                    "deep":this.deep
                },
                urlParam: {
                    projectId: this.projectId
                }
            };
            this.pathLoading = true;
            service.doRequest("pathBetweenNodes", params).then(result => {
                if (result.status == 200) {
                    this.$emit('shortPath',result.data.vertexList,result.data.edgeList.map(e=>{
                        return {
                            ...e,
                            source:e.startVertexId,
                            target:e.endVertexId
                        }
                    }));
                }else{
                    show_message(result.message);
                }
                this.pathLoading = false;
            }).catch((error) => {
                error?.response?.data?.message && show_message(error.response.data.message, "warning");
                this.pathLoading = false;
            });
        },
        resetPaths() {
            this.$emit('resetPaths');
        }
    }
}
</script>

<style lang="less" scoped>
.content-panel {
    padding: 0px 18px;
    overflow: hidden;
    height: 100%;
    margin: 0 -18px;
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
    .select-tip{
        text-align: center;
        height:48px;
        padding-top: 16px;
    }
}
.path-label{
    width: 103px;
    font-size: 14px;
    margin-bottom: 6px;
    display: block;
    margin-top: 10px;
}
</style>