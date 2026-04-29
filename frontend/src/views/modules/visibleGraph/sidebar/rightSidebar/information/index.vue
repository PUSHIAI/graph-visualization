<!--
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2021-12-13 17:21:15
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-03-01 17:17:47
 * @FilePath: /GraphInsight/src/views/modules/visibleGraph/sidebar/rightSidebar/information/index.vue
-->
<template>
    <div class="information">
        <template v-if="item.id !== undefined">
            <template v-if="itemType == 'node'">
                <div class="entity-info flex-shrink">
                    <div class="entity-icon flex-shrink"></div>
                    <div class="text-info">
                        <div class="text-info-name" :title="item.name || item.id">{{ item.name || item.id }}</div>
                        <div class="text-info-type"><span v-for="label of item.labels" :key="label">{{ label }}</span></div>
                    </div>
                    <el-popconfirm
                        confirm-button-text='确认'
                        cancel-button-text='取消'
                        icon="el-icon-info"
                        icon-color="red"
                        :title="`确定要从数据库中删除${item.name || item.id}吗？`"
                        @confirm="deleteElement"
                    >
                        <i slot="reference" class="el-icon-delete"></i>
                    </el-popconfirm>
                    <svg-icon iconClass="graphRightSidebar-entity-background" className="entity-background"></svg-icon>
                </div>
                <div class="entity-tabs flex-shrink">
                    <div 
                        :class="['tab', item.value == activeTab ? 'active-tab' : '']" 
                        v-for="item in entityTabs"
                        :key="item.value"
                        @click="changeTab(item)"
                    >{{item.label}}</div>
                </div>
                <div class="entity-box flex" key="node-attribute">
                    <keep-alive>
                        <component
                            :is="activeComponent"
                            :attributeList="item.attributeList"
                            :nodeInGraph="nodeInGraph"
                            :item="item"
                            :itemType="itemType"
                            @setElementAttr="setElementAttr"
                            @deleteElementAttr="deleteElementAttr"
                        >
                        </component>
                    </keep-alive>
                </div>
            </template>
            <template v-if="itemType == 'link'">
                <div class="flex-shrink link-info">
                    <div class="entity-icon flex-shrink"></div>
                    <div class="text-info">
                        <div class="text-info-name" :title="item.type">{{ item.type }}</div>
                        <div class="text-info-type">
                            <span>{{ item.source.name }}</span>
                            <span>-></span>
                            <span>{{ item.target.name }}</span>
                        </div>
                    </div>
                    <el-popconfirm
                        confirm-button-text='确认'
                        cancel-button-text='取消'
                        icon="el-icon-info"
                        icon-color="red"
                        :title="`确定要从数据库中删除${item.type}吗？`"
                        @confirm="deleteElement"
                    >
                        <i slot="reference" class="el-icon-delete"></i>
                    </el-popconfirm>
                    <svg-icon iconClass="graphRightSidebar-entity-background" className="entity-background"></svg-icon>
                </div>
                <div class="entity-box flex" key="link-attribute">
                    <attributes
                        :attributeList="item.attributeList"
                        :item="item"
                        :itemType="itemType"
                        @setElementAttr="setElementAttr"
                        @deleteElementAttr="deleteElementAttr"
                    >
                    </attributes>
                </div>
            </template>        
        </template>
        <div class="information-tip flex-center fs12 font-color-sub" v-else>
            <span>选中节点查看节点信息</span>
        </div>
    </div>
</template>

<script>
import attributes from './components/attributes';
import service from "@/api/service";
import { show_message } from '@/utils/message';
export default {
    components:{attributes},
    props:{
        item:Object,
        itemType:String,
        nodeInGraph:Array
    },
    data() {
        return {
            entityTabs: [
                {
                    value: 'attributes',
                    label: '属性',
                    path: 'views/modules/visibleGraph/sidebar/rightSidebar/information/components/attributes.vue'
                },
                {
                    value: 'neighborNode',
                    label: '邻节点',
                    path: 'views/modules/visibleGraph/sidebar/rightSidebar/information/components/neighborNode.vue'
                },
                {
                    value: 'relations',
                    label: '关联关系',
                    path: 'views/modules/visibleGraph/sidebar/rightSidebar/information/components/neighborLink.vue'
                }
            ],
            activeTab: 'attributes',
        }
    },
    computed: {
        activeComponent() {
            let path = '';
            for (let i = 0; i < this.entityTabs.length; i++) {
                if (this.entityTabs[i].value == this.activeTab) {
                    path = this.entityTabs[i].path;
                    break;
                }
            }
            return path ? () => import(`@/${path}`) : '';
        },
        // attributeList(){
        //     return this.item.attributeList || [];
        // }
    },
    methods: {
        changeTab(item) {
            this.activeTab = item.value;
        },
        setElementAttr(id, data) {
            this.$emit("emitEvent", "setElementAttr", id, data);
        },
        deleteElementAttr(id, key) {
            this.$emit("emitEvent", "deleteElementAttr", id, key);
        },
        deleteElement() {
            let param = {
                param: {
                    vertex: this.itemType == 'node'
                },
                urlParam: {
                    id: this.item.id,
                    projectId: this.$route.query.projectId
                }
            };
            service.doRequest("deleteElement", param).then(result => {
                if (result.status == 200) {
                    show_message("删除成功", "success");
                    this.$emit("emitEvent", "deleteElement");
                }
            })
        }
    }
}
</script>

<style lang="less" scoped>
.information {
    display: flex;
    flex-direction: column;
    height: 100%;
    .information-tip{
        height:100%;

    }
    .entity-info, .link-info {
        position: relative;
        padding: 14px 18px;
        display: flex;
        align-items: center;
        background-image: linear-gradient(to left, rgba(240, 243, 250, 0.24), rgba(240, 243, 250, 1));
        .entity-icon {
            width: 38px;
            height: 38px;
            border-radius: 6px;
            background: #00379A;
            margin: 0 10px 0 0;
            z-index: 1;
        }
        .el-icon-delete {
            position: absolute;
            top: 50%;
            right: 25px;
            transform: translateY(-50%);
            color: #f00;
            background: #fff;
            padding: 3px;
            border-radius: 50%;
            transition: all 0.3s;
            z-index: 10;
            cursor: pointer;
            &:hover {
                background: #f00;
                color: #fff;
            }
        }
        .text-info {
            overflow: hidden;
            flex: 1;
            z-index: 1;
            .text-info-name {
                padding: 0 25px 0 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-size: 14px;
                font-weight: bold;
                color: #040C15;
            }
            .text-info-type {
                font-size: 12px;
                color: rgba(70, 76, 93, 0.64);
                span{
                    display: inline-block;
                    margin-right:3px;
                }
            }
        }
        .entity-background {
            position: absolute;
            height: 62px;
            left: -65px;
            transform: rotate(180deg);
        }
    }
    .entity-tabs {
        margin: 14px 18px 0;
        border-radius: 12px;
        background: #F6F7F9;
        padding: 2px;
        display: flex;
        justify-content: space-between;
        .tab {
            font-size: 12px;
            color: #464C5D;
            padding: 6px 15px;
            border-radius: 11px;
            cursor: pointer;
            text-align: center;
            flex: 1;
            transition: all 0.6s;
        }
        .active-tab {
            background: #fff;
            color: #040C15;
            box-shadow: 0 0 2px rgba(0, 118, 255, 0.19);
        }
    }
    .entity-box {
        height: 10px;
    }
}
</style>