<!--
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2022-02-11 15:27:06
 * @Feature: 
 * @LastEditors: huangyixin
 * @LastEditTime: 2022-03-16 09:45:51
 * @FilePath: /GraphInsight/src/views/modules/visibleGraph/sidebar/leftSidebar/editTab/addNode.vue
-->
<template>
    <div class="add-node add-element">
        <div class="select-type-box">
            <div class="type-box">
                <svg-icon iconClass="graphLeftSidebar-type-icon" className="type-icon"></svg-icon>
                <span>类型</span>
            </div>
            <el-select
                class="add-element-common-box search-box"
                size="mini"
                v-model="elementType"
                multiple
                clearable
                filterable
                collapse-tags
                allow-create
                default-first-option
                placeholder="请输入类型"
            >
                <el-option 
                    v-for="item in nodeTypes"
                    :key="item"
                    :label="item"
                    :value="item"
                >
                </el-option>
            </el-select>
        </div>
        <div class="style-tip mb12">输入类型名称，按回车按钮选中类型，如果类型不存在会在数据库中新建该类型。</div>
        <!-- <el-input
            v-model="description"
            size="mini"
            class="add-element-common-box description-box"
            clearable
        >
            <template slot="prepend">
                <div class="type-box">
                    <span>描述字段</span>
                </div>
            </template>
        </el-input> -->
        <add-attr
            ref="addAttr"
            @addElement="addElement"
            :elementType="'node'"
            :loading="addLoading"
        >
        </add-attr>
    </div>
</template>

<script>
import service from "@/api/service";
import { show_message } from '@/utils/message';
import addAttr from "./addAttr.vue"
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
        nodeTypes: {
            type: Array,
            default: function() {
                return []
            }
        },
    },
    data() {
        return {
            elementType: [],
            description: '',
            addLoading: false
        }
    },
    methods: {
        addElement(elementAttrList, isRender = false) {
            if (this.elementType.length == 0) {
                show_message("请将类型补充完整", "warning");
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
                    labels: this.elementType
                },
                urlParam: {
                    projectId: this.$route.query.projectId
                }
            };
            this.addLoading = true;
            service.doRequest("addVertex", param).then(result => {
                if (result.status == 200) {
                    show_message("添加成功", "success");
                    this.$emit("getGraphInfo");
                    this.$refs.addAttr.resetAttrList();
                    if (isRender) {
                        this.$emit("addVertex", [result.data])
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
.add-node {
    .description-box {
        margin: 0 0 22px 0;
    }
}
.add-element-common-box{
    /deep/ .el-tag{
        max-width: 58%;
    }
}
</style>