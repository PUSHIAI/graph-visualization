<!--
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2022-02-14 16:19:41
 * @Feature: 
 * @LastEditors: huangyixin
 * @LastEditTime: 2022-03-16 09:46:59
 * @FilePath: /GraphInsight/src/views/modules/visibleGraph/sidebar/leftSidebar/editTab/addLink.vue
-->
<template>
    <div class="add-link add-element">
        <div class="step-item" v-if="selectNodes.length == 0">
            <svg-icon iconClass="graphLeftSidebar-select-source" className="select-icon"></svg-icon>
            <div class="text-tips">请单击节点选择<span class="mark-text">起始点</span></div>
        </div>
        <div class="step-item" v-if="selectNodes.length == 1">
            <svg-icon iconClass="graphLeftSidebar-select-target" className="select-icon"></svg-icon>
            <div class="text-tips">请crtl+单击节点选择<span class="mark-text">终点</span></div>
            <div class="select-source-box">
                <div class="source-item">
                    <svg-icon iconClass="graphLeftSidebar-source-icon" className="source-icon"></svg-icon>
                    <span class="source-text">起始点：</span>
                    <span>{{selectNodes[selectNodes.length - 1].name}}</span>
                </div>
                <el-button size="mini" class="reselect-source-button" @click="cancelSelection">重新选择起点</el-button>
            </div>
        </div>
        <div class="step-item" v-if="selectNodes.length >= 2">
            <div class="source-target-box">
                <el-input v-model="selectNodes[selectNodes.length - 2].name" size="mini" class="add-element-common-box" readonly>
                    <template slot="prepend">
                        <div class="type-box">
                            <svg-icon iconClass="graphLeftSidebar-source-icon" className="source-icon"></svg-icon>
                            <span>起点</span>
                        </div>
                    </template>
                </el-input>
                <el-input v-model="selectNodes[selectNodes.length - 1].name" size="mini" class="add-element-common-box" readonly>
                    <template slot="prepend">
                        <div class="type-box">
                            <svg-icon iconClass="graphLeftSidebar-target-icon" className="target-icon"></svg-icon>
                            <span>终点</span>
                        </div>
                    </template>
                </el-input>
            </div>
            <div class="select-type-box">
                <div class="type-box">
                    <svg-icon iconClass="graphLeftSidebar-type-icon" className="type-icon"></svg-icon>
                    <span>类型</span>
                </div>
                <el-select
                    class="add-element-common-box search-box"
                    size="mini"
                    v-model="elementType"
                    clearable
                    filterable
                    allow-create
                    default-first-option
                >
                    <el-option 
                        v-for="item in linkTypes"
                        :key="item"
                        :label="item"
                        :value="item"
                    >
                    </el-option>
                </el-select>
            </div>
            <div class="style-tip mb12">输入类型名称，按回车按钮选中类型，如果类型不存在会在数据库中新建该类型。</div>
            <add-attr 
                ref="addAttr"
                @addElement="addElement"
                :elementType="'link'"
                :loading="addLoading"
            ></add-attr>
        </div>
    </div>
</template>

<script>
import service from "@/api/service";
import addAttr from "./addAttr.vue";
import { show_message } from '@/utils/message';
export default {
    components: {
        addAttr
    },
    props: {
        selectNodes: {
            type: Array,
            default: function() {
                return []
            }
        },
        linkTypes: {
            type: Array,
            default: function() {
                return []
            }
        }
    },
    data() {
        return {
            elementType: '',
            addLoading:false
        }
    },
    methods: {
        cancelSelection() {
            this.$emit("cancelSelection");
        },
        addElement(elementAttrList, isRender = false) {
            if (!this.elementType) {
                show_message("请将类型补充完整", "warning");
                return;
            } else if (this.selectNodes.length < 2) {
                show_message("请选择起点和终点", "warning");
                return;
            }
            let param = {
                param: {
                    attributeList: elementAttrList.map(item => {
                        return {
                            name: item.name,
                            value: item.value
                        }
                    }),
                    startVertexId: this.selectNodes[this.selectNodes.length - 2].id,
                    endVertexId: this.selectNodes[this.selectNodes.length - 1].id,
                    type: this.elementType
                },
                urlParam: {
                    projectId: this.$route.query.projectId
                }
            };
            this.addLoading = true;
            service.doRequest("addEdge", param).then(result => {
                if (result.status == 200) {
                    show_message("添加成功", "success");
                    this.$emit("getGraphInfo");
                    this.$refs.addAttr.resetAttrList();
                    if (isRender) {
                        this.$emit("addEdge", result.data.map(item => {
                            return {
                                ...item,
                                source: item.startVertexId,
                                target: item.endVertexId
                            }
                        }))
                    }
                }
                this.addLoading = false;
            },()=>{
                this.addLoading = false;
            })
        }
    }
}
</script>

<style lang="less" scoped>
.add-link {
    .text-tips {
        font-size: 14px;
        text-align: center;
        color: #778396;
        .mark-text {
            color: #00379A;
        }   
    }
    .step-item {
        display: flex;
        flex-direction: column;
        height: 100%;
        .select-icon {
            width: 100%;
            margin: 6px 0 16px;
        }
        .select-source-box {
            margin: 18px 0 0;
            padding: 18px 0 0;
            border-top: 1px solid #D0D9E2;
            .source-item {
                display: flex;
                align-items: center;
                font-size: 14px;
                padding: 0 2px;
                .source-text {
                    color: rgba(70, 76, 93, 0.65);
                    margin: 0 10px;
                }
                .source-icon {
                    width: 16px;
                    height: 21px;
                    fill: #0D86FF;
                }
            }
        }
        .reselect-source-button {
            margin: 54px 0 0;
            width: 100%;
            color: #0D86FF;
            border-radius: 18px;
            border: 1px dashed #0D86FF;
        }
        .source-target-box {
            .source-icon, .target-icon {
                width: 16px;
                height: 21px;
                margin: 0 7px 0 0;
            }
            .source-icon {
                fill: #0D86FF;
            }
            .target-icon {
                fill: #FF990D;
            }
            .type-box {
                color: #464C5D;
            }
            /deep/ .add-element-common-box {
                margin: 0 0 12px 0;
                .el-input-group__prepend, .el-input__inner {
                    background: rgba(231, 238, 245, 0.8);
                    color: #040C15;
                }
            }
        }
    }
}
</style>