<!--
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2022-02-17 15:34:05
 * @Feature: 
 * @LastEditors: huangyixin
 * @LastEditTime: 2022-03-15 17:44:51
 * @FilePath: /GraphInsight/src/views/modules/visibleGraph/sidebar/leftSidebar/editTab/addAttr.vue
-->
<template>
    <div class="add-attr">
        <div class="element-attr-box">
            <div class="element-attr-title">
                <svg-icon iconClass="graphLeftSidebar-element-attr" className="element-attr-icon"></svg-icon>
                <span class="fs14">{{elementCnMap[elementType]}}属性</span>
            </div>
            <div class="element-attr-container">
                <!-- <svg-icon v-if="elementAttrList.length == 0" iconClass="graphLeftSidebar-add-attr" className="add-attr-icon"></svg-icon> -->
                <ul v-if="elementAttrList.length != 0">
                    <li
                        v-for="(item, index) in elementAttrList"
                        :key="index"
                        @mouseenter="item.showClose = true"
                        @mouseleave="item.showClose = false"
                    >
                        <i 
                            @click="deleteAttr(item)"
                            class="el-icon-circle-close"
                            :style="{
                                opacity: item.showClose ? 1 : 0
                            }"
                        ></i>
                        <el-input 
                            :ref="'nameInput' + index"
                            v-model="item.name" 
                            size="mini" 
                            class="add-element-common-box"
                        >
                            <template slot="prepend">
                                <div class="type-box">
                                    <span>属性名称</span>
                                </div>
                            </template>
                        </el-input>
                        <!-- <el-input v-model="item.type" size="mini" class="add-element-common-box">
                            <template slot="prepend">
                                <div class="type-box">
                                    <span>属性类型</span>
                                </div>
                            </template>
                        </el-input> -->
                        <el-input v-model="item.value" size="mini" class="add-element-common-box">
                            <template slot="prepend">
                                <div class="type-box">
                                    <span>属性值</span>
                                </div>
                            </template>
                        </el-input>
                    </li>
                </ul>
                <!-- <div class="overflow-container" v-else>
                </div> -->
            </div>
            <el-button size="mini" class="add-attr-button mt18" @click="addAttr">添加属性</el-button>
        </div>
        <div class="bottom-menu">
            <el-button size="mini" plain round @click="resetAttrList" class="reset-button mr12">
                <svg-icon iconClass="graphLeftSidebar-reset-icon" className="reset-icon"></svg-icon>
                <span style="margin-left:6px;">重置</span>
            </el-button>
            <!-- <el-dropdown @command="addElement"> -->
                <el-button size="mini" type="primary" round style="width:100%;" @click="addElement('render')" :loading="loading">
                    <i class="el-icon-plus"></i>
                    <span>新增并渲染</span>
                </el-button>
                <!-- <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="add">新增</el-dropdown-item>
                    <el-dropdown-item command="render">新增并渲染</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown> -->
            <!-- <svg-icon iconClass="graphLeftSidebar-question-icon" className="question-icon"></svg-icon> -->
        </div>
        <div class="bottom-menu-background"></div>
    </div>
</template>

<script>
import { show_message } from '@/utils/message';
import { isEmpty } from "@/utils/graphJs/PixiChart/utils/common.js";
export default {
    props: {
        elementType: {
            type: String,
            default: function () {
                return 'node';
            }
        },
        loading:Boolean
    },
    data() {
        return {
            elementAttrList: [],
            elementCnMap: {
                node: '节点',
                link: '边'
            }
        }
    },
    methods: {
        validForm() {
            let validType = 'valid',
            attrKeyMap = {};
            for (let i = 0; i < this.elementAttrList.length; i++) {
                let attr = this.elementAttrList[i];
                if (isEmpty(attr.name) || isEmpty(attr.value)) {
                    validType = 'miss';
                    break;
                }
                if (!attrKeyMap[attr.name]) {
                    attrKeyMap[attr.name] = true;
                } else {
                    validType = 'repeat';
                    break;
                }
            }
            return validType;
        },
        addAttr() {
            switch (this.validForm()) {
                case 'valid':
                    this.elementAttrList.push({
                        name: '',
                        value: '',
                        type: '',
                        showClose: false
                    })
                    let index = this.elementAttrList.length - 1 ;
                    this.$nextTick(() => {
                        this.$refs[`nameInput${index}`][0].focus();
                    })
                    break;
                case 'miss':
                    show_message("请将属性值补充完整", "warning");
                    break;
                case 'repeat':
                    show_message("属性名不能重复", "warning");
                    break;
            }
        },
        deleteAttr(item) {
            let index = -1;
            for (let i = 0; i < this.elementAttrList.length; i++) {
                if (this.elementAttrList[i].name == item.name) {
                    index = i;
                    break;
                }
            }
            this.elementAttrList.splice(index, 1);
        },
        resetAttrList() {
            this.elementAttrList = [];
        },
        addElement(type) {
            switch (this.validForm()) {
                case 'valid':
                    if (type == 'add') {
                        this.$emit("addElement", this.elementAttrList);
                    } else if (type == 'render') {
                        this.$emit("addElement", this.elementAttrList, true);
                    }
                    break;
                case 'miss':
                    show_message("请将属性值补充完整", "warning");
                    break;
                case 'repeat':
                    show_message("属性名不能重复", "warning");
                    break;
            }
        }
    }
}
</script>

<style lang="less" scoped>
.add-attr {
    display: flex;
    overflow: hidden;
    .element-attr-box {
        overflow: hidden;
        display: flex;
        flex-direction: column;
        flex: 1;
        margin: 0 0 80px;
        .element-attr-title {
            font-size: 12px;
            color: #142D54;
            padding: 0 0 10px 0;
            border-bottom: 1px solid #D0D9E2;
            display: flex;
            align-items: center;
            .element-attr-icon {
                width: 16px;
                height: 16px;
                fill: #142D54;
                stroke: #142D54;
                margin: 0 6px 0 0;
            }
        }
        .add-attr-icon {
            width: 120px;
            height: 128px;
            margin: 75px 0;
        }
        .element-attr-container {
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
            // height: 680px;
            .overflow-container {
                overflow-x: hidden;
            }
            ul {
                padding: 16px 5px 0 0;
                list-style: none;
                overflow-x: hidden;
                list-style: none;
                li {
                    position: relative;
                    border: 1px solid #D0D9E2;
                    border-radius: 22px;
                    padding: 10px 10px 0;
                    margin: 0 0 18px;
                    /deep/ .el-input {
                        margin: 0 0 10px 0;
                    }
                    transition: all 0.4s;
                    &:hover {
                        box-shadow: 0 3px 6px rgba(12, 134, 255, 0.13);
                    }
                    .el-icon-circle-close {
                        position: absolute;
                        top: -12px;
                        right: -8px;
                        z-index: 10;
                        background: #fff;
                        font-size: 24px;
                        color: #C9D6E3;
                        transition: all 0.4s;
                        cursor: pointer;
                    }
                }
                li:last-child{
                    margin: 0;
                }
            }
        }
        .add-attr-button {
            width: 100%;
            color: #0D86FF;
            border: 1px dashed #0D86FF;
            border-radius: 18px;
        }
    }
    .bottom-menu-background {
        position: absolute;
        bottom: 4px;
        left: -18px;
        right: -18px;
        height: 53px;
        background-image: linear-gradient(#fff 0% ,rgba(65, 123, 181, 55%) 70%, #808080 100%);
        z-index: 5;
    }
    .bottom-menu {
        position: absolute;
        height: 64px;
        bottom: -14px;
        left: -18px;
        right: -18px;
        background: #fff;
        padding: 0 18px;
        border-radius: 24px 24px 24px 0;
        display: flex;
        align-items: center;
        z-index: 10;
        .reset-button {
            // background: #E8F4FF;
            // color: #0D86FF;
            // border-radius: 16px;
            .reset-icon {
                width: 14px;
                height: 9px;
                fill: #606266;
            }
            &:hover {
                // background: #0D86FF;
                // color: #fff;
                .reset-icon {
                    fill: #409EFF;
                }
            }
        }
        .el-dropdown {
            display: flex;
            flex: 1;
            .add-element-button {
                width: 100%;
                border-radius: 18px;
                background: #0D86FF;
                color: #fff;
                margin: 0 10px 0 15px;
                &:hover {
                    color: #409EFF;
                    background: #ecf5ff;
                }
            }
        }
        .question-icon {
            width: 16px;
            height: 16px;
            fill: #778396;
        }
    }
}
</style>