<!--
 * @Author: huangyixin
 * @Date: 2021-12-15 11:10:39
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-04-11 10:12:25
 * @Description: In User Settings Edit
 * @FilePath: /GraphInsight/src/views/modules/visibleGraph/sidebar/leftSidebar/expandPanel.vue
-->
<template>
    <div>
        <expand4Multi 
            v-show="selectNodes.length > 1" 
            :selectNodes="selectNodes" 
            :nodeTypes="nodeTypes" 
            :linkTypes="linkTypes" 
            :projectId="projectId"
            @cancelSelectionOne="cancelSelectionOne"
            @addNode="addNode"
            @searchingExpandNode="searchingExpandNode"
        >
        </expand4Multi>
        <expand4Single  
            v-show="selectNodes.length == 1"
            :projectId="projectId"
            :dbclickNode="selectNodes[0] || {}"
            @addNode="addNode"
            :linkInGraphId="linkInGraphId"
        >
        </expand4Single>
        <div class="expand-tip" v-show="selectNodes.length == 0">
            <div class="expand-tip-title flex-left-center">
                <img src="@icons/png/expand/question.png" />
                <span>操作流程说明</span>
            </div>
            <div class="expand-tip-main mt12">
                <div style="margin-bottom:35px;">
                    <div>单点展开：双击需要展开的节点对一度关系进行查询，可在展开面板按照关系类型对节点进行添加。</div>
                    <img src="@icons/png/expand/single.png"/>
                </div>
                <div>
                    <div>多点展开：长按鼠标2秒或者按住“ctrl”键对节点进行多选，然后点击展开面板的“查询”按钮对选中节点进行一度关系查询。</div>
                    <img src="@icons/png/expand/multi.png"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import expand4Multi from './expand/expand4Multi.vue';
import expand4Single from './expand/expand4Single.vue';

export default {
    components:{ expand4Multi,expand4Single },
    data() {
        return {
            
        }
    },
    props:{
        selectNodes:Array,
        nodeTypes:Array,
        linkTypes:Array,
        projectId:Number,
        dbclickNode:Object,
        linkInGraphId:Array
    },
    watch:{
        
    },
    computed:{
    },
    mounted(){
    
    },
    methods: {
        cancelSelectionOne(id){
            this.$emit('emitEvent','cancelSelectionOne',id);
        },
        addNode(nodes,links){
            this.$emit('emitEvent','addNode',nodes,links);
        },
        searchingExpandNode(isSearch) {
            this.$emit("emitEvent", "searchingExpandNode", isSearch);
        }
    }
}
</script>

<style lang="less" scoped>
.expand-tip{
    height: 100%;
    padding: 18px;
    overflow: auto;
    .expand-tip-title{
        img{
            width:18px;
        }
        span{
            font-size: 14px;
            color:#040C15;
            font-weight: bold;
            margin-left:12px;
        }
    }
    .expand-tip-main{
        background: #F0F4F9;
        border-radius: 18px;
        padding:22px 15px;
        font-size: 12px;
        color:#142D54;
        img{
            width:235px;
            margin-top:20px;
        }
    }
}
</style>