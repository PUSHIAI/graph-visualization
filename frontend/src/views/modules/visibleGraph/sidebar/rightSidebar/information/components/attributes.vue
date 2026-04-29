<!--
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2021-12-13 17:58:20
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-03-08 10:40:31
 * @FilePath: /GraphInsight/src/views/modules/visibleGraph/sidebar/rightSidebar/information/components/attributes.vue
-->
<template>
    <div class="attributes flex-column">
        <div class="search-input flex-shrink">
            <el-input size="mini" v-model="searchAttr" placeholder="请输入查询属性">
                <svg-icon slot="suffix" iconClass="common-search-icon" className="search-icon"></svg-icon>
            </el-input>
            <el-button size="mini" class="add-attr-button flex-center" @click="openAttrDialog">添加属性</el-button>
        </div>
        <div class="attr-list flex" v-if="attributes.length > 0">
            <div 
                v-for="attr of attributes"
                :key="attr.name"
                class="attr-item"
            >
                <div class="attr-key">{{attr.name}}</div>
                <div class="attr-value flex-space-between">
                    <el-input :title="attr.value" :ref="attr.name + 'input'" size="mini" v-model="attr.value" :readonly="editAttr.name != attr.name"></el-input>
                    <div class="toolbox flex-center">
                        <div class="normal-tool flex-center" v-if="!isEdit && attr.name != '唯一标识'">
                            <svg-icon iconClass="graphRightSidebar-attr-copy" className="attr-copy" @click="copyAttribute(attr)"></svg-icon>
                            <svg-icon iconClass="graphRightSidebar-attr-edit" className="attr-edit" @click="startAttribute(attr)"></svg-icon>
                            <el-popconfirm
                                confirm-button-text='删除'
                                cancel-button-text='取消'
                                icon="el-icon-info"
                                icon-color="red"
                                :title="`确定删除属性${attr.name}吗？`"
                                @confirm="deleteAttribute(attr)"
                            >
                                <svg-icon slot="reference" iconClass="graphRightSidebar-attr-delete" className="attr-delete"></svg-icon>
                            </el-popconfirm>
                        </div>
                        <div v-if="isEdit && editAttr.name == attr.name" class="edit-tool flex-center">
                            <i class="el-icon-circle-check" @click="editAttribute"></i>
                            <i class="el-icon-circle-close" @click="cancelEdit"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex flex-center" v-else>
            <span class="fs14 font-color-sub">没有符合的属性</span>
        </div>
        <el-dialog
            :visible.sync="attrDialogVisible"
            class="add-attr-dialog"
            top="20%"
            width="430px"
            :close-on-click-modal="false"
            :before-close="closeAttrDialog"
        >
            <div class="add-attr-box" @keyup.enter="addAttribute">
                <el-form class="add-attr-form" :model="addForm" ref="attrForm" :rules="attrRules">
                    <el-form-item label="属性名" prop="key">
                        <el-input size="mini" v-model="addForm.key" ref="attrNameInput"></el-input>
                    </el-form-item>
                    <el-form-item label="属性值" prop="value">
                        <el-input size="mini" v-model="addForm.value"></el-input>
                    </el-form-item>
                </el-form>
                <div class="button-box">
                    <el-button size="mini" class="cancel" @click="closeAttrDialog">取消</el-button>
                    <el-button size="mini" type="primary" class="confirm" @click="addAttribute" :loading="addLoading">确定</el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import service from "@/api/service"
import { show_message } from '@/utils/message';
export default {
    props:{
        attributeList: {
            type: Array,
            default: function() {
                return [];
            }
        },
        item: {
            type: Object,
            default: function() {
                return {};
            }
        },
        itemType: {
            type: String,
            default: function() {
                return "node";
            }
        }
    },
    computed:{
        attributes(){
            return [{
                name: '唯一标识',
                value: this.item.id
            }].concat(this.attributeList.filter(e=>{ return e.name.includes(this.searchAttr.trim()) }).map(item => {
                if (Array.isArray(item.value)) {
                    item.value = item.value.join(',');
                } else if (Object.prototype.toString.call(item.value) === '[object Object]') {
                    item.value = JSON.stringify(item.value);
                }
                return item;
            }));
        }
    },
    data() {
        return {
            searchAttr: '',
            addForm: {
                key: '',
                value: ''
            },
            attrRules: {
                key: [
                    { required: true, message: '请输入属性名', trigger: 'blur' }
                ],
                value: [
                    { required: true, message: '请输入属性值', trigger: 'blur' }
                ],
            },
            attrDialogVisible: false,
            addLoading: false,
            editAttr: {
                name: '',
                value: ''
            },
            isEdit: false
        }
    },
    methods: {
        addAttribute() {
            this.$refs.attrForm.validate((valid) => {
                if (valid) {
                    this.addLoading = true;
                    let newObj = {
                        name: this.addForm.key,
                        value: this.addForm.value
                    },
                    param = {
                        param: {
                            id: this.item.id,
                            vertex: this.itemType == 'node',
                            attributeModelList: [newObj],
                        },
                        urlParam: {
                            projectId: this.$route.query.projectId
                        }
                    };
                    service.doRequest("editAttribute", param).then(result => {
                        this.addLoading = false;
                        if (result.status == 200) {
                            show_message("添加成功", "success");
                            this.$emit("setElementAttr", this.item.id, {
                                key: this.addForm.key,
                                value: this.addForm.value
                            });
                            this.closeAttrDialog();
                        }
                    }).catch(() => {
                        this.addLoading = false;
                    })
                }
            })
        },
        deleteAttribute(attr) {
            let param = {
                param: [attr.name],
                urlParam: {
                    projectId: this.$route.query.projectId,
                    id: this.item.id,
                    vertex: this.itemType == 'node'
                }
            };
            service.doRequest("deleteAttribute", param).then(result => {
                if (result.status == 200) {
                    show_message("删除成功", "success");
                    this.$emit("deleteElementAttr", this.item.id, attr.name);
                }
            });
        },
        copyAttribute(attr) {
            // 创建元素用于复制
            const aux = document.createElement('input')
            // 获取复制内容
            const content = attr.value
            // 设置元素内容
            aux.setAttribute('value', content)
            // 将元素插入页面进行调用
            document.body.appendChild(aux)
            // 复制内容
            aux.select()
            // 将内容复制到剪贴板
            document.execCommand('copy')
            // 删除创建元素
            document.body.removeChild(aux);
            show_message("复制成功", "success");
        },
        startAttribute(attr) {
            this.editAttr = attr;
            let ref = `${attr.name}input`;
            this.$refs[ref][0].focus();
            this.isEdit = true;
        },
        editAttribute() {
            let param = {
                param: {
                    id: this.item.id,
                    vertex: this.itemType == 'node',
                    attributeModelList: [this.editAttr],
                },
                urlParam: {
                    projectId: this.$route.query.projectId
                }
            };
            service.doRequest("editAttribute", param).then(result => {
                if (result.status == 200) {
                    show_message("编辑成功", "success");
                    this.$emit("setElementAttr", this.item.id, {
                        key: this.editAttr.name,
                        value: this.editAttr.value
                    });
                    this.cancelEdit();
                }
            });
        },
        cancelEdit() {
            this.isEdit = false;
            this.editAttr = {
                name: '',
                value: ''
            }
        },
        openAttrDialog() {
            this.attrDialogVisible = true;
            this.$nextTick(() => {
                this.$refs.attrNameInput.focus();
            })
        },
        closeAttrDialog() {
            this.attrDialogVisible = false;
            this.addForm = {
                key: '',
                value: ''
            };
            this.$refs.attrForm.clearValidate();
        }
    }
}
</script>

<style lang="less" scoped>
.attributes {
    height: 100%;
    overflow: hidden;
    .search-input {
        display: flex;
        justify-content: space-between;
        margin: 10px 0;
        padding:0 18px;
        /deep/ .el-input {
            flex: 1;
            .el-input__inner {
                border: 1px solid #D0D9E2;
                border-radius: 6px;
                height: 34px;
            }
            .el-input__suffix {
                top: 7px;
                right: 10px;
            }
        }
        .search-icon {
            width: 18px;
            height: 18px;
            fill: #D0D9E2;
            margin-top: 2px;
        }
        .add-attr-button {
            width: 68px;
            height: 34px;
            margin: 0 0 0 8px;
            border-radius: 7px;
            border: 1px solid #142D54;
            font-size: 12px;
            color: #142D54;
        }
    }
    .attr-list {
        overflow: auto;
        padding: 0 18px;
        .attr-item {
            font-size: 12px;
            display: flex;
            // align-items: center;
            margin: 0 0 6px 0;
            .attr-key {
                color: #778396;
                width: 72px;
                margin-top: 4px;
                word-break: break-all;
            }
            .attr-value {
                position: relative;
                padding: 4px 8px;
                color: #040C15;
                border-radius: 6px;
                background: #F0F3FA;
                flex: 1;
                margin: 0 0 0 6px;
                word-break: break-all;
                /deep/ .el-input {
                    .el-input__inner {
                        text-overflow: ellipsis;
                        overflow: hidden;
                        word-break: break-all;
                        background: transparent;
                        border: none;
                        padding: 0;
                        height: inherit;
                        line-height: inherit;
                    }
                }
                .toolbox {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    right: 0;
                    margin: 0 0 0 5px;
                    padding: 0 8px;
                    border-radius: 6px;
                    background: rgba(240, 243, 250, 0.9);
                    opacity: 0;
                    transition: all 0.3s;
                    .normal-tool {
                        .attr-copy, .attr-edit, .attr-delete {
                            width: 13px;
                            height: 13px;
                            fill: #778396;
                            transition: all 0.3s;
                            cursor: pointer;
                            &:hover {
                                fill: #0D86FF;
                            }
                        }
                        .attr-edit {
                            margin: 0 8px 0 10px;
                        }
                    }
                    .edit-tool {
                        .el-icon-circle-check, .el-icon-circle-close {
                            cursor: pointer;
                        }
                        .el-icon-circle-check {
                            margin: 0 5px 0 0;
                            &:hover {
                                color: #0D86FF;
                            }
                        }
                        .el-icon-circle-close {
                            &:hover {
                                color: #f00;
                            }
                        }
                    }
                    /deep/ .el-popover__reference-wrapper {
                        display: flex;
                        align-items: center;
                    }
                }
                &:hover {
                    .normal-tool::before, .edit-tool::before {
                        content: '';
                        position: absolute;
                        left: 0;
                        width: 1px;
                        height: 12px;
                        background: #D0D9E2;
                    }
                    .toolbox {
                        opacity: 1;
                    }
                }
            }
        }
    }
    .add-attr-dialog {
        /deep/ .el-dialog {
            border-radius: 18px;
            .el-dialog__header {
                padding: 15px 0 0;
                .el-dialog__headerbtn {
                    top: -15px;
                    right: -15px;
                    .el-dialog__close {
                        font-weight: bold;
                        font-size: 20px;
                        width: 36px;
                        height: 36px;
                        text-align: center;
                        line-height: 36px;
                        background: #F0F4F9;
                        border-radius: 50%;
                        color: #7B8FA2;
                        &:hover{
                            background: #E7E7EA;
                        }
                    }
                    .el-icon-close:before {
                        margin: 0 0 0 1px;
                    }
                }
            }
            .el-dialog__body {
                padding: 25px 0;
                margin: 0 32px;
            }
        }
        .add-attr-box {
            .add-attr-form {
                position: relative;
                padding: 18px 15px;
                margin: 0 0 22px;
                border-radius: 6px;
                border: 1px solid #D0D9E2;
                /deep/ .el-form-item {
                    display: flex;
                    align-items: center;
                    margin: 0;
                    margin-bottom:4px;
                    .el-form-item__label {
                        width: 85px;
                        color: #778396;
                    }
                    .el-form-item__content {
                        flex: 1;
                        .el-form-item__error {
                            padding: 0;
                            top: inherit;
                            bottom: -9px;
                        }
                    }
                    .el-input__inner {
                        border-radius: 6px;
                        border: 1px solid #D0D9E2;
                    }
                }
                &::after {
                    content: '添加属性';
                    position: absolute;
                    top: -10px;
                    left: 20px;
                    padding: 0 5px;
                    background: #fff;
                }
            }
            .button-box {
                display: flex;
                justify-content: flex-end;
                margin: 20px 0 0;
                .el-button {
                    width: 118px;
                    height: 32px;
                    font-size: 14px;
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
    }
}
</style>