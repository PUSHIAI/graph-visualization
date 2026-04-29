<!--
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2021-12-14 11:53:31
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-02-25 16:12:50
 * @FilePath: /GraphInsight/src/views/modules/visibleGraph/toolbox/index.vue
-->
<template>
    <div class="toolbox">
        <div 
            v-for="(groupList, groupName) in toolboxList"
            :key="groupName"
            class="toolbox-group"
        >
            <div class="group-name">{{groupName}}</div>
            <div class="group-box">
                <el-tooltip effect="dark" :content="icon.cnName" placement="bottom" v-for="icon in groupList" :key="icon.value">
                    <svg-icon 
                        :iconClass="`graphToolbox-${icon.value}`" 
                        className="group-icon"
                        @click="clickIcon(icon)"
                    ></svg-icon>
                </el-tooltip>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            toolboxList: {
                操作: [
                    {
                        value: 'fullscreen',
                        cnName:'全屏'
                    },
                    // {
                    //     value: 'fixed',
                    //     cnName:'固定节点'
                    // },
                    {
                        value: 'undo',
                        cnName:'撤销'
                    },
                    {
                        value: 'redo',
                        cnName:'重做'
                    },
                    {
                        value: 'refresh',
                        cnName:'画布复位'
                    },
                    {
                        value: 'select',
                        cnName:'反选'
                    },
                    {
                        value: 'delete',
                        cnName:'删除节点(从画布)'
                    },
                    {
                        value: 'clear',
                        cnName:'清空画布'
                    },
                    // {
                    //     value: 'deleteAll',
                    //     cnName:'删除节点(从数据库)'
                    // },
                ],
                导出: [
                    {
                        value: 'exportXlsx',
                        cnName:'导出xlsx'
                    },
                    {
                        value: 'exportJson',
                        cnName:'导出json'
                    },
                    {
                        value: 'exportPng',
                        cnName:'导出图片'
                    }
                ],
                布局: [
                    {
                        value: 'force',
                        cnName:'力导向布局'
                    },
                    {
                        value: 'grid',
                        cnName:'矩阵布局'
                    },
                    {
                        value: 'dag-vertical',
                        cnName:'DAG布局'
                    },
                    // {
                    //     value: 'dag-level',
                    //     cnName:'水平DAG布局'
                    // },
                ]
            }
        }
    },
    methods:{
        clickIcon(icon){
            this.$emit("emitEvent","forTool",icon.value)
        }
    }
}
</script>

<style lang="less" scoped>
.toolbox {
    display: flex;
    align-items: center;
    margin: 0 106px 0 0;
    .toolbox-group {
        display: flex;
        align-items: center;
        margin: 0 20px 0 0;
        .group-name {
            font-size: 14px;
            color: #464C5D;
            margin: 0 18px 0 0;
        }
        .group-box {
            display: flex;
            padding: 10px 9px;
            border-radius: 6px;
            background: #F6F6F9;
            .group-icon {
                width: 17px;
                height: 17px;
                fill: #778396;
                margin: 0 9px;
                cursor: pointer;
                &:hover{
                    fill:#0D86FF;
                }
            }
        }
    }
}
</style>