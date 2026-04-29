<!--
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2021-12-13 11:11:44
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-04-13 17:50:24
 * @FilePath: /GraphInsight/src/views/modules/visibleGraph/sidebar/rightSidebar/statistics/components/filter.vue
-->
<template>
    <div class="filter-panel" id="filterPanel">
        <div class="filter-element-type">
            <div 
                :class="['type', activeType == item.key ? 'active-type' : '']"
                v-for="item in elementTypeList"
                :key="item.key"
                @click="changeElementType(item)"
            >
                {{item.name}}
            </div>
        </div>
        <div class="filter-box">
            <div class="type-list">
                <div
                    v-for="(typeValue, type) in this.activeType == 'node' ? nodeTypeTree : linkTypeTree"
                    :key="type"
                    class="type-item"
                >
                    <div class="type-info"
                        @mouseenter="typeValue.isShow = true"
                        @mouseleave="typeValue.isShow = false"
                    >
                        <div :class="['triangle-background', typeValue.isExpand ? 'expand-triangle-background' : '']" @click="expandType(typeValue)">
                            <svg-icon iconClass="graphRightSidebar-triangle" className="triangle-icon"></svg-icon>
                        </div>
                        <div class="type-text">{{type}}</div>
                        <div class="total">{{typeValue.idList.length}}</div>
                        <div class="tool-box flex-center">
                            <!-- <svg-icon
                                :iconClass="`${typeValue.isHighlight ? 'graphRightSidebar-open-highlight' : 'graphRightSidebar-close-highlight'}`" 
                                :className="[typeValue.isHighlight ? 'open-highlight' : 'close-highlight', (typeValue.isHighlight || typeValue.isShow) ? 'show-tool-item' : '']"
                                @click="switchHighlight(typeValue)"
                            ></svg-icon> -->
                            <i :class="['el-icon-thumb', typeValue.isShow ? 'show-tool-item' : '']" @click="selectedElement(typeValue)"></i>
                            <el-switch 
                                :class="[(!typeValue.isVisible || typeValue.isShow) ? 'show-tool-item' : '']"
                                v-model="typeValue.isVisible" 
                                @change="(isVisible) => filterElement({type: typeValue, typeKey: type}, 'type')"
                            ></el-switch>
                        </div>
                    </div>
                    <div 
                        v-show="typeValue.isExpand"
                        class="attr-box"
                    >
                        <div 
                            class="attr-item"
                            v-for="(attrValue, attr) in typeValue.attributeMap"
                            :key="attr"
                        >
                            <div class="attr-info"
                                @mouseenter="attrValue.isShow = true"
                                @mouseleave="attrValue.isShow = false"
                            >
                                <div :class="['triangle-background', attrValue.isExpand ? 'expand-triangle-background' : '']" @click="expandAttr(attrValue, attr, typeValue, type)">
                                    <svg-icon iconClass="graphRightSidebar-triangle" className="triangle-icon"></svg-icon>
                                </div>
                                <div class="info-box">
                                    <div class="type-text text-ellipsis" :title="attr.split('-')[0]">{{attr.split('-')[0]}}</div>
                                    <div class="attr-total">{{attrValue.idList.length}}</div>
                                    <div class="field-type text-ellipsis" :title="attrValue.type">{{attrValue.type}}</div>
                                </div>
                                <div class="tool-box flex-center">
                                    <!-- <svg-icon
                                        :iconClass="`${attrValue.isHighlight ? 'graphRightSidebar-open-highlight' : 'graphRightSidebar-close-highlight'}`" 
                                        :className="[attrValue.isHighlight ? 'open-highlight' : 'close-highlight', (attrValue.isHighlight || attrValue.isShow) ? 'show-tool-item' : '']"
                                        @click="switchHighlight(attrValue)"
                                    ></svg-icon> -->
                                    <i :class="['el-icon-thumb', attrValue.isShow ? 'show-tool-item' : '']" @click="selectedElement(attrValue)"></i>
                                    <el-switch 
                                        :class="[(!attrValue.isVisible || attrValue.isShow) ? 'show-tool-item' : '']"
                                        v-model="attrValue.isVisible" 
                                        @change="(isVisible) => filterElement({type: typeValue, attr: attrValue, attrKey: attr, typeKey: type}, 'attr')"
                                    ></el-switch>
                                </div>
                            </div>
                            <div
                                v-show="attrValue.isExpand"
                                class="value-box"
                            >
                                <div class="value-normal-container" v-if="rangeTypeArr.indexOf(attrValue.type) == -1">
                                    <div
                                        class="value-item"
                                        v-for="(value, key) in attrValue.valueMap"
                                        :key="key"
                                        @mouseenter="value.isShow = true"
                                        @mouseleave="value.isShow = false"
                                    >
                                        <div class="value">{{key}}</div>
                                        <div class="flex-center">
                                            <div class="total">{{value.idList.length}}</div>
                                            <div class="tool-box flex-center">
                                                <!-- <svg-icon
                                                    :iconClass="`${value.isHighlight ? 'graphRightSidebar-open-highlight' : 'graphRightSidebar-close-highlight'}`" 
                                                    :className="[value.isHighlight ? 'open-highlight' : 'close-highlight', (value.isHighlight || value.isShow) ? 'show-tool-item' : '']"
                                                    @click="switchHighlight(value)"
                                                ></svg-icon> -->
                                                <i :class="['el-icon-thumb', value.isShow ? 'show-tool-item' : '']" @click="selectedElement(value)"></i>
                                                <el-switch 
                                                    :class="[(!value.isVisible || value.isShow) ? 'show-tool-item' : '']"
                                                    v-model="value.isVisible" 
                                                    @change="(isVisible) => filterElement({type: typeValue, attr: attrValue, value: value}, 'value')"
                                                ></el-switch>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        v-for="(value, key) in valueTypeMap"
                                        :key="key"
                                        class="value-item"
                                        :style="{ color: value.color }"
                                        @mouseenter="attrValue[key].isShow = true"
                                        @mouseleave="attrValue[key].isShow = false"
                                    >
                                        <div class="value">{{value.name}}</div>
                                        <div class="flex-center">
                                            <div class="total">{{attrValue[key].total}}</div>
                                            <div class="tool-box flex-center" v-if="attrValue[key].total">
                                                <!-- <svg-icon 
                                                    :iconClass="`${attrValue[key].isHighlight ? 'graphRightSidebar-open-highlight' : 'graphRightSidebar-close-highlight'}`" 
                                                    :className="[attrValue[key].isHighlight ? 'open-highlight' : 'close-highlight', (attrValue[key].isHighlight || attrValue[key].isShow) ? 'show-tool-item' : '']"
                                                    @click="switchHighlight(attrValue[key])"
                                                ></svg-icon> -->
                                                <i :class="['el-icon-thumb', attrValue[key].isShow ? 'show-tool-item' : '']" @click="selectedElement(attrValue[key])"></i>
                                                <el-switch 
                                                    :class="[(!attrValue[key].isVisible || attrValue[key].isShow) ? 'show-tool-item' : '']"
                                                    v-model="attrValue[key].isVisible" 
                                                    @change="(isVisible) => filterElement({type: typeValue, attr: attrValue, valueType: attrValue[key]}, 'valueType')"
                                                ></el-switch>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="value-numerical-container" v-else>
                                    <div class="value-range">
                                        <el-select
                                            v-model="attrValue.activeBrushType"
                                            size="mini"
                                            @change="val => changeBrushType(val, typeValue, attrValue, `#rangeGraph-${type}-${attr}`)"
                                        >
                                            <el-option
                                                v-for="item in brushTypeList"
                                                :key="item.value"
                                                :value="item.value"
                                                :label="item.label"
                                            >
                                            </el-option>
                                        </el-select>
                                        <div class="range-graph" :id="`rangeGraph-${type}-${attr}`"></div>
                                        <div class="min-max-value">
                                            <div class="text">大小值</div>
                                            <div class="range-input flex-center">
                                                <el-input size="mini" v-model="attrValue.minValue" placeholder="最小值" @input="(val) => changeNumber(attrValue, `#rangeGraph-${type}-${attr}`)"></el-input>
                                                <div class="line">-</div>
                                                <el-input size="mini" v-model="attrValue.maxValue" placeholder="最大值" @input="(val) => changeNumber(attrValue, `#rangeGraph-${type}-${attr}`)"></el-input>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="value-type">
                                        <div
                                            v-for="(value, key) in valueTypeMap"
                                            :key="key"
                                            class="value-item"
                                            :style="{ color: value.color }"
                                        >
                                            <div class="value-info">
                                                <p class="value-total text-ellipsis" :title="attrValue[key].total">
                                                    {{attrValue[key].total}}
                                                </p>
                                                <p class="value-name">{{value.name}}</p>
                                            </div>
                                            <div class="tool-box flex-center">
                                                <!-- <svg-icon 
                                                    :iconClass="`${attrValue[key].isHighlight ? 'graphRightSidebar-open-highlight' : 'graphRightSidebar-close-highlight'}`" 
                                                    :className="[attrValue[key].isHighlight ? 'open-highlight' : 'close-highlight']"
                                                    @click="switchHighlight(attrValue[key])"
                                                ></svg-icon> -->
                                                <i class="el-icon-thumb" @click="selectedElement(attrValue[key])"></i>
                                                <el-switch 
                                                    v-model="attrValue[key].isVisible" 
                                                    @change="(isVisible) => filterElement({type: typeValue, attr: attrValue, valueType: attrValue[key], attrKey: attr, typeKey: type}, 'valueType')"
                                                ></el-switch>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import * as echarts from "echarts";
import { isEmpty } from "@/utils/graphJs/PixiChart/utils/common.js";
export default {
    props:{
        nodeInGraph: {
            type: Array,
            default: function() {
                return [];
            }
        },
        linkInGraph: {
            type: Array,
            default: function() {
                return [];
            }
        }
    },
    data() {
        return {
            elementTypeList: [
                { name: '节点', key: 'node' },
                { name: '关系', key: 'link' }
            ],
            activeType: 'node',
            nodeTypeTree: {},
            oldNodeTypeTree: {},
            linkTypeTree: {},
            oldLinkTypeTree: {},
            valueTypeMap: {
                valid: {
                    name: '有效值',
                    color: '#0D86FF',
                    isShow: false,
                    isVisible: true,
                },
                miss: {
                    name: '数值缺失',
                    color: '#FFC548',
                    isShow: false,
                    isVisible: true,
                },
                invalid: {
                    name: '无效值',
                    color: '#FE5C5C',
                    isShow: false,
                    isVisible: true,
                },
            },
            invalidTypeMap: {
                String: 'string',
                Number: 'number',
                Boolean: 'boolean'
            },
            observerObj: null,
            graphIdArr: [],
            brushTypeList: [
                {
                    value: 'select',
                    label: '多选'
                },
                {
                    value: 'filter',
                    label: '过滤'
                }
            ],
            rangeTypeArr: ['Long', 'Double']
        }
    },
    watch: {
        nodeInGraph: {
            immediate: true,
            handler: function() {
                // 为了保持视图不变 需要对nodeTypeTree进行增量操作
                let newNodeTypeTree = {}
                for (let i = 0; i < this.nodeInGraph.length; i++) {
                    let node = this.nodeInGraph[i];
                    if (!Array.isArray(node.labels)) continue;
                    for (let l = 0; l < node.labels.length; l++) {
                        let label = node.labels[l],
                            isNewAppearLabel = false,
                            newAppearNumber = 0,
                            isClearOldLabelId = false;

                        // 新node数组中第一次出现的label
                        if (!newNodeTypeTree[label]) {
                            newNodeTypeTree[label] = {
                                attributeMap: {},
                                isDelete: true,
                                isHighlight: false,
                                isVisible: true,
                            };
                            isClearOldLabelId = true;
                            isNewAppearLabel = true;
                        }

                        if (!this.nodeTypeTree[label]) {
                            // 新label加入
                            this.$set(this.nodeTypeTree, label, {
                                idList: [],
                                attributeMap: {},
                                isExpand: false,
                                isShow: false,
                                isHighlight: false,
                                isVisible: true,
                            })
                        } else {
                            // 仍存在于图内的label
                            if (this.oldNodeTypeTree[label]) {
                                this.oldNodeTypeTree[label].isDelete = false;
                            }
                            // 第一次遍历到该label时 清除该label下的id 重新统计
                            if (isClearOldLabelId) {
                                this.nodeTypeTree[label].idList = [];
                            }
                        }
                        for (let aIndex = 0; aIndex < node.attributeList.length; aIndex++) {
                            let attr = node.attributeList[aIndex],
                                isNewAppearAttr = false,
                                currentAttr = this.nodeTypeTree[label].attributeMap[attr.name + '-' + attr.fieldType];

                            // 新node数组中第一次出现的attr
                            if (!newNodeTypeTree[label].attributeMap[attr.name + '-' + attr.fieldType]) {
                                newNodeTypeTree[label].attributeMap[attr.name + '-' + attr.fieldType] = {
                                    isDelete: true,
                                    attributeMap: {}
                                };
                                isNewAppearAttr = true;
                            }

                            if (!currentAttr) {
                                this.$set(this.nodeTypeTree[label].attributeMap, attr.name + '-' + attr.fieldType, {
                                    type: attr.fieldType,
                                    idList: [],
                                    valueMap: {},
                                    valid: {
                                        total: 0,
                                        idList: [],
                                        isHighlight: false,
                                        isVisible: true,
                                        isShow: false
                                    },
                                    invalid: {
                                        total: 0,
                                        idList: [],
                                        isHighlight: false,
                                        isVisible: true,
                                        isShow: false
                                    },
                                    miss: {
                                        total: 0,
                                        idList: [],
                                        isHighlight: false,
                                        isVisible: true,
                                        isShow: false
                                    },
                                    isExpand: false,
                                    isShow: false,
                                    isVisible: true
                                });
                                currentAttr = this.nodeTypeTree[label].attributeMap[attr.name + '-' + attr.fieldType];
                            } else {
                                // 仍存在于图内的attr
                                if (this.oldNodeTypeTree[label]?.attributeMap[attr.name + '-' + attr.fieldType]) {
                                    this.oldNodeTypeTree[label].attributeMap[attr.name + '-' + attr.fieldType].isDelete = false;
                                }
                                // 旧属性第一次出现时 清空属性下的值
                                if (isNewAppearAttr) {
                                    currentAttr.idList = [];
                                    currentAttr.valueMap = {};
                                    currentAttr.valid = {
                                        total: 0,
                                        idList: [],
                                        isHighlight: false,
                                        isVisible: true,
                                        isShow: false
                                    };
                                    currentAttr.invalid = {
                                        total: 0,
                                        idList: [],
                                        isHighlight: false,
                                        isVisible: true,
                                        isShow: false
                                    };
                                    currentAttr.miss = {
                                        total: 0,
                                        idList: [],
                                        isHighlight: false,
                                        isVisible: true,
                                        isShow: false
                                    }
                                    newNodeTypeTree[label].attributeMap[attr.name + '-' + attr.fieldType].isClear = false;
                                }
                            }
                            if (isNewAppearAttr && !isNewAppearLabel) {
                                // 非首标签包含的新属性 说明之前相同标签的点都缺失该属性
                                currentAttr.miss.idList = currentAttr.miss.idList.concat(this.nodeTypeTree[label].idList);
                                currentAttr.miss.total += this.nodeTypeTree[label].idList.length;
                                newAppearNumber++;
                            }
                            !currentAttr.valueMap[attr.value] && this.$set(currentAttr.valueMap, attr.value, {
                                idList: [],
                                isHighlight: false,
                                isVisible: true,
                                isShow: false
                            })
                            // 记录无效值
                            if (this.invalidTypeMap[attr.fieldType] && typeof(attr.value) != this.invalidTypeMap[attr.fieldType]) {
                                currentAttr.invalid.total++;
                                currentAttr.invalid.idList.push(node.id);
                            } else {
                                // 记录有效值
                                currentAttr.valid.total++;
                                currentAttr.valid.idList.push(node.id);
                            }
                            currentAttr.valueMap[attr.value].idList.push(node.id);
                            currentAttr.idList.push(node.id);
                        }
                        // 记录缺失值
                        let attrArr = Object.keys(this.nodeTypeTree[label].attributeMap),
                        nodeAttributes = node.attributeList.map(item => item.name + '-' + item.fieldType);
                        if (attrArr.length > node.attributeList.length - newAppearNumber) {
                            attrArr.forEach(item => {
                                if (nodeAttributes.indexOf(item) == -1) {
                                    this.nodeTypeTree[label].attributeMap[item].miss.total++;
                                    this.nodeTypeTree[label].attributeMap[item].miss.idList.push(node.id);
                                }
                            })
                        }
                        this.nodeTypeTree[label].idList.push(node.id);
                    }
                }
                // 删除不存在于图内的label
                for (let label in this.oldNodeTypeTree) {
                    if (this.oldNodeTypeTree[label].isDelete) {
                        this.nodeTypeTree[label] = null;
                        delete this.nodeTypeTree[label];

                        let deleteArr = [];
                        for (let i = 0; i < this.graphIdArr.length; i++) {
                            let graphId = this.graphIdArr[i];
                            if (graphId.split('-')[1] == label) {
                                deleteArr.push(graphId);
                            }
                        }
                        for (let i = 0; i < deleteArr.length; i++) {
                            let deleteId = deleteArr.length;
                            this.graphIdArr.splice(this.graphIdArr.indexOf(deleteId), 1);
                        }
                    } else {
                        // 删除不存在于图内的attr
                        for (let attr in this.oldNodeTypeTree[label].attributeMap) {
                            if (this.oldNodeTypeTree[label].attributeMap[attr].isDelete) {
                                this.nodeTypeTree[label].attributeMap[attr] = null;
                                delete this.nodeTypeTree[label].attributeMap[attr];

                                let deleteArr = [];
                                for (let i = 0; i < this.graphIdArr.length; i++) {
                                    let graphId = this.graphIdArr[i],
                                    gId = `#rangeGraph-${label}-${attr}`;
                                    if (graphId == gId) {
                                        deleteArr.push(graphId);
                                    }
                                }
                                for (let i = 0; i < deleteArr.length; i++) {
                                    let deleteId = deleteArr.length;
                                    this.graphIdArr.splice(this.graphIdArr.indexOf(deleteId), 1);
                                }
                            }
                        }
                    }
                }
                this.oldNodeTypeTree = newNodeTypeTree;
                this.updateRangeGraph();
                console.log("nodeTypeTree:", this.nodeTypeTree);
            }
        },
        linkInGraph: {
            immediate: true,
            handler: function() {
                let newLinkTypeTree = {};
                for (let i = 0; i < this.linkInGraph.length; i++) {
                    let link = this.linkInGraph[i],
                        isNewAppearType = false,
                        newAppearNumber = 0,
                        isClearOldTypeId = false;

                    // 新link数组中第一次出现的type
                    if (!newLinkTypeTree[link.type]) {
                        newLinkTypeTree[link.type] = {
                            attributeMap: {},
                            isDelete: true,
                            isHighlight: false,
                            isVisible: true,
                        };
                        isClearOldTypeId = true;
                        isNewAppearType = true;
                    }
                    
                    if (!this.linkTypeTree[link.type]) {
                        // 新type加入
                        this.$set(this.linkTypeTree, link.type, {
                            idList: [],
                            attributeMap: {},
                            isExpand: false,
                            isShow: false,
                            isHighlight: false,
                            isVisible: true,
                        })
                    } else {
                        // 仍存在于图内的type
                        if (this.oldLinkTypeTree[link.type]) {
                            this.oldLinkTypeTree[link.type].isDelete = false;
                        }
                        // 第一次遍历到该type时 清除该type下的id 重新统计
                        if (isClearOldTypeId) {
                            this.linkTypeTree[link.type].idList = [];
                        }
                    }
                    for (let aIndex = 0; aIndex < link.attributeList.length; aIndex++) {
                        let attr = link.attributeList[aIndex],
                        isNewAppearAttr = false,
                        currentAttr = this.linkTypeTree[link.type].attributeMap[attr.name + '-' + attr.fieldType];

                        // 新link数组中第一次出现的attr
                        if (!newLinkTypeTree[link.type].attributeMap[attr.name + '-' + attr.fieldType]) {
                            newLinkTypeTree[link.type].attributeMap[attr.name + '-' + attr.fieldType] = {
                                isDelete: true,
                                attributeMap: {}
                            };
                            isNewAppearAttr = true;
                        }

                        if (!currentAttr) {
                            this.$set(this.linkTypeTree[link.type].attributeMap, attr.name + '-' + attr.fieldType, {
                                type: attr.fieldType,
                                valueMap: {},
                                idList: [],
                                valid: {
                                    total: 0,
                                    idList: [],
                                    isHighlight: false,
                                    isVisible: true,
                                    isShow: false
                                },
                                invalid: {
                                    total: 0,
                                    idList: [],
                                    isHighlight: false,
                                    isVisible: true,
                                    isShow: false
                                },
                                miss: {
                                    total: 0,
                                    idList: [],
                                    isHighlight: false,
                                    isVisible: true,
                                    isShow: false
                                },
                                isExpand: false,
                                isShow: false,
                                isVisible: true
                            });
                            currentAttr = this.linkTypeTree[link.type].attributeMap[attr.name + '-' + attr.fieldType];
                        } else {
                            // 仍存在于图内的attr
                            if (this.oldLinkTypeTree[link.type]?.attributeMap[attr.name + '-' + attr.fieldType]) {
                                this.oldLinkTypeTree[link.type].attributeMap[attr.name + '-' + attr.fieldType].isDelete = false;
                            }
                            // 旧属性第一次出现时 清空attr下的值
                            if (isNewAppearAttr) {
                                currentAttr.idList = [];
                                currentAttr.valueMap = {};
                                currentAttr.valid = {
                                    total: 0,
                                    idList: [],
                                    isHighlight: false,
                                    isVisible: true,
                                    isShow: false
                                };
                                currentAttr.invalid = {
                                    total: 0,
                                    idList: [],
                                    isHighlight: false,
                                    isVisible: true,
                                    isShow: false
                                };
                                currentAttr.miss = {
                                    total: 0,
                                    idList: [],
                                    isHighlight: false,
                                    isVisible: true,
                                    isShow: false
                                }
                                newLinkTypeTree[link.type].attributeMap[attr.name + '-' + attr.fieldType].isClear = false;
                            }
                        }
                        if (isNewAppearAttr && !isNewAppearType) {
                            // 非初始化状态时新出现的属性 则之前相同类型的边都缺失
                            currentAttr.miss.idList = currentAttr.miss.idList.concat(this.linkTypeTree[link.type].idList);
                            currentAttr.miss.total += this.linkTypeTree[link.type].idList.length;
                            newAppearNumber++;
                        }
                        !currentAttr.valueMap[attr.value] && this.$set(currentAttr.valueMap, attr.value, {
                            idList: [],
                            isHighlight: false,
                            isVisible: true,
                            isShow: false
                        })
                        // 记录无效值
                        if (this.invalidTypeMap[attr.fieldType] && typeof(attr.value) != this.invalidTypeMap[attr.fieldType]) {
                            currentAttr.invalid.total++;
                            currentAttr.invalid.idList.push(link.id);
                        } else {
                            // 记录有效值
                            currentAttr.valid.total++;
                            currentAttr.valid.idList.push(link.id);
                        }
                        currentAttr.valueMap[attr.value].idList.push(link.id);
                        currentAttr.idList.push(link.id);
                    }
                    // 记录缺失值
                    let attrArr = Object.keys(this.linkTypeTree[link.type].attributeMap),
                    linkAttributes = link.attributeList.map(item => item.name + '-' + item.fieldType);
                    if (attrArr.length > link.attributeList.length - newAppearNumber) {
                        attrArr.forEach(item => {
                            if (linkAttributes.indexOf(item) == -1) {
                                this.linkTypeTree[link.type].attributeMap[item].miss.total++;
                                this.linkTypeTree[link.type].attributeMap[item].miss.idList.push(link.id);
                            }
                        })
                    }
                    this.linkTypeTree[link.type].idList.push(link.id);
                }
                // 删除不存在于图内的type
                for (let type in this.oldLinkTypeTree) {
                    if (this.oldLinkTypeTree[type].isDelete) {
                        this.linkTypeTree[type] = null;
                        delete this.linkTypeTree[type];
                    } else {
                        for (let attr in this.oldLinkTypeTree[type].attributeMap) {
                            if (this.oldLinkTypeTree[type].attributeMap[attr].isDelete) {
                                this.linkTypeTree[type].attributeMap[attr] = null;
                                delete this.linkTypeTree[type].attributeMap[attr];
                            }
                        }
                    }
                }
                this.oldLinkTypeTree = newLinkTypeTree;
                console.log("linkTypeTree:", this.linkTypeTree);
            }
        },
    },
    computed:{
    },
    mounted() {
        this.observerSidebar();
    },
    destroyed() {
        // 取消监听
        this.observerObj && this.observerObj.disconnect();
    },
    methods: {
        observerSidebar() {
            let element = document.querySelector("#filterPanel"), vm = this;
            this.observerObj = new ResizeObserver((mutation) => {
                // console.log("mutation:", mutation);
                vm.resizeGraph();
            })
            // 开始监听元素，第二个参数为监听配置项
            this.observerObj.observe(element, {
                attributes: true,
            });
        },
        resizeGraph() {
            let deleteArr = [];
            for (let i = 0; i < this.graphIdArr.length; i++) {
                let graphId = this.graphIdArr[i],
                graphDom = document.querySelector(graphId),
                graph = graphDom ? echarts.getInstanceByDom(graphDom) : null;
                if (graphDom && graph) {
                    graph.resize();
                    // 在过滤界面才清除
                    this.graphIdArr = this.graphIdArr.filter(id => deleteArr.indexOf(id) == -1);
                } else {
                    deleteArr.push(graphId);
                }
            }
        },
        changeElementType(item) {
            this.activeType = item.key;
            this.updateRangeGraph();
        },
        expandType(typeValue) {
            this.$set(typeValue, "isExpand", !typeValue.isExpand);
            console.log("typeValue:", typeValue);
        },
        expandAttr(attrValue, attr, typeValue, type) {
            let graphId = `#rangeGraph-${type}-${attr}`,
                dom = document.querySelector(graphId),
                graph = dom ? echarts.getInstanceByDom(dom) : null;
                graph && graph.dispose();

            this.$set(attrValue, "isExpand", !attrValue.isExpand);
            if (this.rangeTypeArr.indexOf(attrValue.type) != -1) {
                this.$nextTick(() => {
                    if (attrValue.isExpand) {
                        this.$set(attrValue, "activeBrushType", "select");
                        this.graphIdArr.indexOf(graphId) == -1 && this.graphIdArr.push(graphId);
                        this.initRangeGraph(graphId, typeValue, attrValue);
                    } else {
                        this.graphIdArr.indexOf(graphId) != -1 && this.graphIdArr.splice(this.graphIdArr.indexOf(graphId), 1);
                    }
                })
            }
            console.log("attrValue:", attrValue);
        },
        // 初始化数值图表
        initRangeGraph(graphId, typeValue, attrValue) {
            let xData = Object.keys(attrValue.valueMap).map(item => Number(item)).sort((a, b) => a - b),
                graphData = Object.values(attrValue.valueMap).map(item => item.idList.length),
                graphDom = document.querySelector(graphId),
                graph = echarts.init(graphDom),
                options = {
                    xAxis: {
                        data: xData,
                        axisTick: {
                            show: false
                        }
                    },
                    yAxis: {
                        minInterval: 1
                    },
                    brush: {
                        toolbox: [null],
                        throttleType: 'debounce',
                        throttleDelay: 100
                    },
                    grid: {
                        top: '10%',
                        bottom: '20%'
                    },
                    series: [
                        {
                            name: 'bar',
                            type: 'bar',
                            data: graphData,
                            itemStyle: {
                                borderRadius: [15, 15, 0, 0],
                            },
                            barMaxWidth: 10
                        }
                    ]
                },
                vm = this;
            graph.setOption(options);
            graph.dispatchAction({
                type: 'takeGlobalCursor',
                key: 'brush',
                brushOption: {
                    brushType: 'lineX',
                }
            });
            graph.on('brushSelected', function(params) {
                console.log("params:", params);
                let dataIndex = params.batch[0].selected[0].dataIndex,
                    xData = Object.keys(attrValue.valueMap).map(item => Number(item)).sort((a, b) => a - b),
                    minValue = xData[dataIndex[0]],
                    maxValue = xData[dataIndex[dataIndex.length - 1]];
                vm.$set(attrValue, "minValue", minValue);
                vm.$set(attrValue, "maxValue", maxValue);

                let selection = [];
                for (let i = 0; i < dataIndex.length; i++) {
                    let key = xData[dataIndex[i]];
                    selection = selection.concat(attrValue.valueMap[key].idList);
                };
                switch (attrValue.activeBrushType) {
                    case 'select':
                        vm.selectedElement({
                            idList: selection
                        });
                        break;
                    case 'filter':
                        console.log("typeValue:", typeValue);
                        console.log("attrValue:", attrValue);
                        let filter = {
                            brush: {
                                idList: attrValue.idList,
                                isVisible: true
                            },
                            attr: attrValue,
                            type: typeValue
                        }
                        vm.filterElement(filter, 'brush');
                        if (selection.length != 0) {
                            filter = {
                                brush: {
                                    idList: attrValue.idList.filter(id => selection.indexOf(id) == -1),
                                    isVisible: false
                                },
                                attr: attrValue,
                                type: typeValue
                            }
                            vm.filterElement(filter, 'brush');
                        }
                        break;
                }
                console.log("selection:", selection);
            })
        },
        // 更新数值图表
        updateRangeGraph() {
            this.$nextTick(() => {
                let typeTree = this.activeType == 'node' ? this.nodeTypeTree : this.linkTypeTree;
                for (let i = 0; i < this.graphIdArr.length; i++) {
                    let graphId = this.graphIdArr[i],
                        graphDom = document.querySelector(graphId),
                        typeKey = graphId.split('-')[1],
                        attrKey = graphId.split('-')[2] + '-' + graphId.split('-')[3],
                        typeMap = typeTree[typeKey];
                    if (typeMap && graphDom) {
                        let typeValue = typeMap,
                            attrValue = typeMap.attributeMap[attrKey],
                            graph = echarts.getInstanceByDom(graphDom);
                        if (graph) {
                            let xData = Object.keys(attrValue.valueMap).map(item => Number(item)).sort((a, b) => a - b),
                                graphData = Object.values(attrValue.valueMap).map(item => item.idList.length),
                                options = {
                                    xAxis: {
                                        data: xData,
                                        axisTick: {
                                            show: false
                                        }
                                    },
                                    series: [
                                        {
                                            name: 'bar',
                                            type: 'bar',
                                            data: graphData,
                                            itemStyle: {
                                                borderRadius: [15, 15, 0, 0],
                                            },
                                            barMaxWidth: 10
                                        }
                                    ]
                                };
                            graph.setOption(options);
                        } else {
                            this.initRangeGraph(graphId, typeValue, attrValue);
                        }
                    }
                }
            })
        },
        // 切换brush类型
        changeBrushType(val, typeValue, attrValue, id) {
            let range = attrValue.valueMap,
                graphDom = document.querySelector(id),
                graph = graphDom ? echarts.getInstanceByDom(graphDom) : null,
                idList = [],
                allIdList = [],
                option = graph.getOption(),
                xAxis = option.xAxis,
                xData = xAxis[0].data,
                minValue = Number(attrValue.minValue),
                maxValue = Number(attrValue.maxValue),
                minIndex = xData.length,
                maxIndex = 0;
            // 含有有效的最大最小值
            if (!isEmpty(minValue) && !isEmpty(maxValue)) {
                for (let num in range) {
                    num = Number(num);
                    allIdList = allIdList.concat(range[num].idList);
                    if (num >= minValue && num <= maxValue) {
                        idList = idList.concat(range[num].idList);
                        for (let i = 0; i < xData.length; i++) {
                            if (minValue <= xData[i]) {
                                minIndex = Math.min(i, minIndex);
                            }
                            if (maxValue >= xData[i]) {
                                maxIndex = Math.max(i, maxIndex);
                            }
                        }
                    }
                }
                graph && graph.dispatchAction({
                    type: 'brush',
                    areas: []
                });
            }
            switch (val) {
                case 'select':
                    let filter = {
                        brush: {
                            idList: attrValue.idList,
                            isVisible: true
                        },
                        attr: attrValue,
                        type: typeValue
                    }
                    this.filterElement(filter, 'brush');
                    break;
                case 'filter':
                    for (let i = 0; i < idList.length; i++) {
                        this.$emit("emitEvent", "cancelSelectionOne", idList[i]);
                    }
                    break;
            }
        },
        // 切换高亮
        switchHighlight(value) {
            value.isHighlight = !value.isHighlight;
        },
        // 手动输入数值区间
        changeNumber(attrValue, id) {
            console.log("attrValue:", attrValue);
            let range = attrValue.valueMap,
                graphDom = document.querySelector(id),
                graph = graphDom ? echarts.getInstanceByDom(graphDom) : null,
                idList = [],
                width = graph.getWidth(),
                option = graph.getOption(),
                xAxis = option.xAxis,
                xData = xAxis[0].data,
                // 默认left边距为'10%'
                left = 0.1,
                xInterval = width * (1 - left * 2) / xData.length,
                minValue = Number(attrValue.minValue),
                maxValue = Number(attrValue.maxValue),
                minIndex = xData.length,
                maxIndex = 0;
            console.log("width:", width);
            console.log("option:", option);
            // 含有有效的最大最小值
            if (!isEmpty(minValue) && !isEmpty(maxValue)) {
                for (let num in range) {
                    num = Number(num);
                    if (num >= minValue && num <= maxValue) {
                        idList = idList.concat(range[num].idList);
                        for (let i = 0; i < xData.length; i++) {
                            if (minValue <= xData[i]) {
                                minIndex = Math.min(i, minIndex);
                            }
                            if (maxValue >= xData[i]) {
                                maxIndex = Math.max(i, maxIndex);
                            }
                        }
                        if (maxIndex >= minIndex) {
                            graph && graph.dispatchAction({
                                type: 'brush',
                                areas: [
                                    {
                                        xAxisIndex: 0,
                                        brushType: 'lineX',
                                        range: [width * left + xInterval * minIndex, width * left + xInterval * (maxIndex + 1)]
                                    },
                                ]
                            });
                        }
                    }
                }
            } else if (!isEmpty(minValue)) {
                for (let num in range) {
                    num = Number(num);
                    if (num >= minValue) {
                        idList = idList.concat(range[num].idList);
                    }
                }
            } else if (!isEmpty(maxValue)) {
                for (let num in range) {
                    num = Number(num);
                    if (num <= maxValue) {
                        idList = idList.concat(range[num].idList);
                    }
                }
            }
            this.selectedElement({
                idList: idList
            });
        },
        // 选中元素
        selectedElement(element) {
            console.log("selectedElement:", element);
            this.$emit("emitEvent", "selectedElement", { idList: element.idList, type: this.activeType, options: element.options });
        },
        // 切换过滤
        filterElement(value, levelType) {
            console.log("value:", value);
            let filterTree = value[levelType], isVisible = filterTree.isVisible,
            filterList = [];
            switch(levelType) {
                case 'type':
                    filterList = filterTree.idList;
                    // 下级联动
                    for (let attr in filterTree.attributeMap) {
                        // 属性
                        filterTree.attributeMap[attr].isVisible = isVisible;
                        // 属性值
                        for (let value in filterTree.attributeMap[attr].valueMap) {
                            filterTree.attributeMap[attr].valueMap[value].isVisible = isVisible;
                        }
                        // 有效值
                        filterTree.attributeMap[attr].valid.isVisible = isVisible;
                        // 无效值
                        filterTree.attributeMap[attr].invalid.isVisible = isVisible;
                        // 缺失值
                        filterTree.attributeMap[attr].miss.isVisible = isVisible;
                        // 数值图表
                        if (isVisible) {
                            let id = `#rangeGraph-${value.typeKey}-${attr}`,
                                graphDom = document.querySelector(id),
                                graph = graphDom ? echarts.getInstanceByDom(graphDom) : null;
                            graph && graph.dispatchAction({
                                type: 'brush',
                                areas: []
                            });
                        }
                    }
                    break;
                case 'attr':
                    filterList = filterTree.idList;
                    // 上级联动-类型
                    if (!isVisible) {
                        value.type.isVisible = isVisible;
                    } else {
                        let typeVisible = true;
                        for (let key in value.type.attributeMap) {
                            let attr = value.type.attributeMap[key];
                            if (!attr.isVisible) {
                                typeVisible = false;
                                break;
                            }
                        }
                        value.type.isVisible = typeVisible;
                    }
                    // 下级联动
                    // 属性值
                    for (let key in filterTree.valueMap) {
                        filterTree.valueMap[key].isVisible = isVisible;
                    }
                    // 有效值
                    filterTree.valid.isVisible = isVisible;
                    // 无效值
                    filterTree.invalid.isVisible = isVisible;
                    // 数值图表
                    if (isVisible) {
                        let id = `#rangeGraph-${value.typeKey}-${value.attrKey}`,
                            graphDom = document.querySelector(id),
                            graph = graphDom ? echarts.getInstanceByDom(graphDom) : null;
                        graph && graph.dispatchAction({
                            type: 'brush',
                            areas: []
                        });
                    }
                    break;
                case 'value': case 'brush':
                    filterList = filterTree.idList;
                    // 上级联动
                    if (!isVisible) {
                        // 类型
                        value.type.isVisible = isVisible;
                        // 属性
                        value.attr.isVisible = isVisible;
                    } else {
                        let checkValueLength = 0;
                        for (let key in value.attr.valueMap) {
                            let attrValue = value.attr.valueMap[key];
                            if (attrValue.isVisible) {
                                checkValueLength += attrValue.idList.length;
                            }
                        }
                        if (checkValueLength == value.attr.idList.length) {
                            value.attr.isVisible = isVisible;
                        }
                        // 类型
                        let typeVisible = true;
                        for (let key in value.type.attributeMap) {
                            let attr = value.type.attributeMap[key];
                            if (!attr.isVisible) {
                                typeVisible = false;
                                break;
                            }
                        }
                        value.type.isVisible = typeVisible;
                    }
                    // 同级联动-属性值
                    let invisibleId = [];
                    for (let key in value.attr.valueMap) {
                        let attrValue = value.attr.valueMap[key];
                        if (!attrValue.isVisible) {
                            invisibleId = invisibleId.concat(attrValue.idList);
                        }
                    }
                    // 有效值
                    for (let i = 0; i < value.attr.valid.idList.length; i++) {
                        let validId = value.attr.valid.idList[i];
                        if (!isVisible && filterTree.idList.indexOf(validId) != -1) {
                            value.attr.valid.isVisible = isVisible;
                        } else if (isVisible) {
                            value.attr.valid.isVisible = true;
                            if (invisibleId.indexOf(validId) != -1) {
                                value.attr.valid.isVisible = false;
                                break;
                            }
                        }
                    }
                    // 无效值
                    for (let i = 0; i < value.attr.invalid.idList.length; i++) {
                        let invalidId = value.attr.invalid.idList[i];
                        if (!isVisible && filterTree.idList.indexOf(invalidId) != -1) {
                            value.attr.invalid.isVisible = isVisible;
                        } else if (isVisible) {
                            value.attr.invalid.isVisible = true;
                            if (invisibleId.indexOf(invalidId) != -1) {
                                value.attr.invalid.isVisible = false;
                                break;
                            }
                        }
                    }
                    break;
                case 'valueType': 
                    filterList = filterTree.idList;
                    // 上级联动 缺失值不影响上级
                    for (let i = 0; i < filterTree.idList.length; i++) {
                        let id = filterTree.idList[i];
                        // 类型
                        if (value.type.idList.indexOf(id) != -1) {
                            value.type.isVisible = isVisible;
                        }
                        // 属性
                        if (value.attr.idList.indexOf(id) != -1) {
                            value.attr.isVisible = isVisible;
                        }
                    }
                    // 同级联动 属性值
                    for (let key in value.attr.valueMap) {
                        let attrValue = value.attr.valueMap[key];
                        for (let i = 0; i < attrValue.idList.length; i++) {
                            let id = attrValue.idList[i];
                            if (filterTree.idList.indexOf(id) != -1) {
                                attrValue.isVisible = isVisible;
                                break;
                            }
                        }
                    }
                    // 数值图表
                    if (isVisible) {
                        let id = `#rangeGraph-${value.typeKey}-${value.attrKey}`,
                            graphDom = document.querySelector(id),
                            graph = graphDom ? echarts.getInstanceByDom(graphDom) : null;
                        graph && graph.dispatchAction({
                            type: 'brush',
                            areas: []
                        });
                    }
                    break;
            }
            this.$emit("emitEvent", "filterElement", {
                filterList: filterList, 
                type: this.activeType,
                isVisible: isVisible
            });
        }
    }
}
</script>

<style lang="less" scoped>
.filter-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    .filter-element-type {
        width: 162px;
        padding: 3px;
        margin: 0 18px 12px 18px;
        display: inline-flex;
        justify-content: space-between;
        align-items: center;
        background: #F6F7F9;
        border-radius: 12px;
        color: #464C5D;
        font-size: 12px;
        .type {
            width: 76px;
            transition: all 0.6s;
            padding: 6px 26px;
            cursor: pointer;
        }
        .active-type {
            color: #040C15;
            border-radius: 11px;
            background: #fff;
            box-shadow: 0 0 2px rgba(0, 118, 255, 0.19);
        }
    }
    .filter-box {
        flex: 1;
        font-size: 12px;
        display: flex;
        flex-direction: column;
        overflow: overlay;
        .type-list {
            padding: 0 18px;
            flex: 1;
            // overflow: hidden;
            .triangle-background {
                width: 16px;
                height: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                background: #E3E7ED;
                cursor: pointer;
                .triangle-icon {
                    fill: rgba(119, 131, 150, 0.58);
                    width: 8px;
                    height: 6px;
                    transform: rotate(-90deg);
                    transition: all 0.3s;
                }
            }
            .expand-triangle-background {
                background: #E3E7ED;
                .triangle-icon {
                    fill: #142D54;
                    transform: rotate(0);
                }
            }
            .type-text {
                max-width: 50%;
                color: #464C5D;
                margin: 0 6px 0 8px;
            }
            .total {
                color : rgba(119, 131, 150, 0.70);
                width: 40px;
                margin: 0 80px 0 0;
            }
            .type-item {
                position: relative;
                margin: 0 0 15px 0;
                display: flex;
                flex-direction: column;
                .type-info {
                    display: flex;
                    align-items: center;
                }
                .attr-box {
                    padding: 0 0 0 24px;
                    .attr-item {
                        padding: 15px 0 0 0;
                        .attr-info {
                            display: flex;
                            align-items: center;
                            .info-box {
                                width: 0;
                                flex: 1;
                                display: flex;
                                align-items: center;
                                .field-type {
                                    margin: 0 6px;
                                    color : rgba(119, 131, 150, 0.64);
                                }
                                .attr-total {
                                    color: #464C5D;
                                    padding: 0 6px;
                                    &:before {
                                        content: '|';
                                        position: relative;
                                        right: 6px;
                                        color: #707070;
                                    }
                                    &:after {
                                        content: '|';
                                        position: relative;
                                        left: 6px;
                                        color: #707070;
                                    }
                                }
                            }
                        }
                        .value-box {
                            padding: 0 0 0 24px;
                            .value-normal-container {
                                .value-item {
                                    position: relative;
                                    display: flex;
                                    padding: 14px 0 0 0;
                                    align-items: center;
                                    justify-content: space-between;
                                    transition: all 0.3s;
                                    &:hover {
                                        color: #0D86FF;
                                    }
                                    .value {
                                        margin: 0 10px 0 0;
                                        width: 50%;
                                    }
                                }
                            }
                            .value-numerical-container {
                                margin: 0 0 0 -48px;
                                .value-range {
                                    margin: 10px 0;
                                    padding: 10px 0;
                                    border-bottom: 1px solid #E4E7EC;
                                    text-align: right;
                                    /deep/ .el-select {
                                        width: 70px;
                                        margin: 0 10px 10px 0;
                                        .el-input__inner {
                                            padding-right: 25px;
                                        }
                                    }
                                    .range-graph {
                                        height: 120px;
                                        margin: 0 0 12px 0;
                                    }
                                    .min-max-value {
                                        display: flex;
                                        align-items: center;
                                        justify-content: space-between;
                                        font-size: 12px;
                                        .text {
                                            position: relative;
                                            color: #778396;
                                            margin: 0 30px 0 0;
                                            &::after {
                                                content: '';
                                                position: absolute;
                                                right: -10px;
                                                width: 1px;
                                                height: 100%;
                                                background: #E4E7EC;
                                            }
                                        }
                                        .range-input {
                                            flex: 1;
                                            .line {
                                                padding: 0 5px;
                                            }
                                        }
                                    }
                                }
                                .value-type {
                                    display: flex;
                                    justify-content: space-between;
                                    margin: 0 0 10px 0;
                                    .value-item {
                                        width: 31%;
                                        padding: 8px;
                                        border: 1px solid #E4E7EC;
                                        border-radius: 8px;
                                        flex-direction: column;
                                        align-items: flex-start;
                                        .value-info {
                                            .value-total {
                                                font-size: 24px;
                                                font-weight: bold;
                                            }
                                            .value-name {
                                                padding: 6px 0;
                                                font-size: 12px;
                                                border-bottom: 1px solid #E4E7EC;
                                            }
                                        }
                                        .tool-box {
                                            position: relative;
                                            margin: 6px 0 0;
                                            .close-highlight, .open-highlight {
                                                opacity: 1;
                                            }
                                            .el-icon-thumb {
                                                opacity: 1;
                                            }
                                            .el-switch {
                                                opacity: 1;
                                            }
                                        }
                                    }
                                }
                            }
                            .value-normal-container, .value-numerical-container {
                                overflow: hidden;
                            }
                        }
                    }
                }
                /deep/ .tool-box {
                    position: absolute;
                    right: 0;
                    .close-highlight, .open-highlight {
                        width: 13px;
                        height: 13px;
                        fill: #778396;
                        opacity: 0;
                        transition: all 0.3s;
                        &:hover {
                            fill: #0D86FF;
                        }
                        cursor: pointer;
                    }
                    .open-highlight {
                        fill: #0D86FF;
                    }
                    .el-icon-thumb {
                        margin: 0 8px;
                        font-size: 15px;
                        color: #778396;
                        opacity: 0;
                        transition: all 0.3s;
                        &:hover {
                            color: #0D86FF;
                        }
                        cursor: pointer;
                    }
                    .el-switch {
                        margin: 0 8px;
                        width: 16px;
                        opacity: 0;
                        transition: all 0.3s;
                        .el-switch__core {
                            height: 10px;
                            &::after {
                                width: 6px;
                                height: 6px;
                            }
                        }
                    }
                    .is-checked {
                        .el-switch__core::after {
                            margin-left: -7px;
                        }
                    }
                    .show-tool-item {
                        opacity: 1;
                    }
                }
            }
            .expand-type-item {
                font-weight: bold;
                .expand-triangle-icon {
                    fill: #778396;
                    transform: rotate(90deg);
                }
            }
        }
    }
}
</style>
