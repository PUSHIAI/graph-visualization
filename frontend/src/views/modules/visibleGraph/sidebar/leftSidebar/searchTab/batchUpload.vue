<!--
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2021-12-10 13:50:37
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-03-04 15:02:59
 * @FilePath: /GraphInsight/src/views/modules/visibleGraph/sidebar/leftSidebar/searchTab/batchUpload.vue
-->
<template>
    <div class="batch-upload flex-column">
        <div class="flex-shrink">
            <div class="flex-layout">
                <el-upload
                    class="get-file-btn"
                    action="fakeaction"
                    :file-list="fileList"
                    :show-file-list="false"
                    :auto-upload="true"
                    accept=".xlsx,.xls"
                    :http-request="customRequest"
                    :before-upload="beforeUpload">
                <!-- <el-tooltip class="item" effect="dark" placement="bottom-start" :enterable="false">
                    <div slot="content">支持excel格式上传数据ID进行查询，一次<br/>最多查询100个节点，点击右侧按钮下载文<br/>件模版</div> -->
                    <el-button type="primary" icon="el-icon-upload2" size="small" class="elementui-btn-style1" style="width:100%" :loading="uploadLoading">上传文件</el-button>
                <!-- </el-tooltip> -->
                </el-upload>
                <el-button type="primary" size="small" class="flex-shrink elementui-btn-style1" style="width:32px;padding:0px;" @click="exportTemplate"><svg-icon iconClass="graphSearch-template" className="graphSearch-template"></svg-icon></el-button>
            </div>
            <div class="upload-tip" v-if="!isUpload">
                <p class="flex">支持excel格式上传数据ID进行查询，一次最多查询100个节点，点击右侧按钮下载文件模版</p>
                <img class="flex-shrink" src="@icons/png/search/excelImport.png" />
            </div>
        </div>
        <template v-if="isUpload">
            <div class="flex-layout mt12 flex-shrink">
                <span class="fs14 font-color-base flex">查询结果</span>
                <div class="custom-switch">
                    <span class="fs12">展开二度关系</span>
                    <el-switch v-model="isExpand" size="mini"></el-switch>
                </div>
            </div>
            <div class="flex-left-center font-color-secondary fs14 mt8 flex-shrink mb14">
                <div class="flex">
                    共查询出<span class='font-color-blue fs20 font-bold'>{{ nodes.length }}</span>个结果,
                    已选择<span class='font-color-blue fs20 font-bold'>{{ selectNodes.length }}</span>个
                </div>
                <div class="flex-shrink noMatch-con font-color-red flex-left-center" v-if="notMatch != 0">
                    <img src="@icons/png/search/noMatch.png"/>
                    <span class="ml7 fs20 mr4">{{ notMatch }}</span>
                    个未匹配
                </div>
            </div>
            <div class="flex upload-nodes">
                <ul class="">
                    <li v-for="item of nodes" :key="item.key">
                        <div class="item-info">
                            <div class="item-name">{{item.name}}</div>
                            <div class="item-type">{{item.labels.join(' ')}}</div>
                        </div>
                        <div class="add-button" :class="{'add-button-active':isManage,'add-button-check':isManage&&selectNodes.includes(item.id)}">
                            <div class="add-button-background flex-center" @click="clickNode(item)">
                                <i :class="'el-icon-minus'" v-if="!isManage"></i>
                                <i v-else-if="selectNodes.includes(item.id)" class="el-icon-check"></i>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="flex-shrink upload-btn-con flex-left-center">
                <div class="flex-shrink">
                    <div class="upload-btn-manager" v-if="!isManage" @click="isManage = true"><i class="el-icon-menu mr2"></i>管理</div>
                    <div class="flex-left-center upload-manager-con" v-else>
                        <el-checkbox class="flex-shrink" v-model="selectAll" @change="selectChange" :indeterminate="isIndeterminate">全选</el-checkbox>
                        <span class="upload-manager-con-line flex-shrink"></span>
                        <el-popconfirm
                            title="确定删除已选节点？"
                            @confirm="removeNodes"
                        >
                            <i class="el-icon-delete cursor-pointer" slot="reference"></i>
                        </el-popconfirm>
                        <span class="upload-manager-con-line flex-shrink"></span>
                        <span class="upload-manager-cancel" @click="cancelSelection">取消</span>
                        <div class="flex upload-manager-con-select">
                            已选
                        </div>
                        <span class="upload-manager-con-select-number flex-shrink ml4">{{ selectNodes.length }}</span>
                    </div>
                </div>
                <el-button class="flex" type="primary" size="small" icon="el-icon-plus" round @click="addNodes2Graph" :loading="pathLoading">添加</el-button>
            </div>
        </template>
        <div v-else class="batch-list flex flex-center">
            <div class="text-align-center">
                <img src="@icons/png/search/upload.png" style="width:216px;"/>
                <p class='tip-style1 mt4'>文件为空，请上传文件</p>
            </div>
        </div>
    </div>
</template>

<script>
import { show_message } from '@/utils/message';
import * as XLSX from 'xlsx';
import { exportXlsx } from '@/utils/downloadTools';
import service from '@/api/service';

export default {
    props:{
        projectId:Number,
    },
    data() {
        return {
            isUpload:false,
            notMatch:0,
            isExpand:true,
            nodes:[],
            selectAll:false,
            isManage:false,
            selectNodes:[],
            fileList:[],
            uploadLoading:false,
            pathLoading:false,
            isIndeterminate:false
        }
    },
    methods: {
        clickNode(d){
            console.log(d);
            if(this.isManage){
                let index = this.selectNodes.indexOf(d.id);
                if(index >= 0){
                    this.selectNodes.splice(index,1);
                }else{
                    this.selectNodes.push(d.id);
                }
                this.selectAll = this.selectNodes.length === this.nodes.length;
                this.isIndeterminate = this.selectNodes.length > 0 && this.selectNodes.length < this.nodes.length;
            }else{
                let index = (this.nodes.map(e=>e.id)).indexOf(d.id);
                this.nodes.splice(index,1);
            }
        },
        removeNodes(){
            let nodes = [];
            for(let node of this.nodes){
                if(!this.selectNodes.includes(node.id)){
                    nodes.push(node);
                }
            }
            this.selectNodes = [];
            this.nodes = nodes;
        },
        addNodes2Graph(){
            let nodes = [];
            if(this.isManage){
                if(this.selectNodes.length > 0){
                    nodes = this.nodes.filter(e=>this.selectNodes.includes(e.id));
                }else{
                    show_message('选中节点不能为空','warning');
                    return;
                }
            }else{
                nodes = this.nodes;
            }
            if(this.isExpand){
                this.searchPaths(nodes.map(e=>e.id));
            }else{
                this.$emit('addNode', nodes);
                this.clearStatus();
            }
        },
        searchPaths(ids){
            let params = {
                param: {
                    "idList": ids,
                    "deep":2
                },
                urlParam: {
                    projectId: this.projectId
                }
            };
            this.pathLoading = true;
            service.doRequest("pathBetweenNodes", params).then(result => {
                if (result.status == 200) {
                    this.$emit('addNode',result.data.vertexList,result.data.edgeList.map(e=>{
                        return {
                            ...e,
                            source:e.startVertexId,
                            target:e.endVertexId
                        }
                    }));
                    this.clearStatus();
                }else{
                    show_message(result.message);
                }
                this.pathLoading = false;
            },(error)=>{
                error.response.data.message && show_message(error.response.data.message, "warning")
                this.pathLoading = false;
            });
        },
        beforeUpload(file,list){
			console.log(file)
            if(!/(.+)(\.)(xlsx|xls)$/.test(file.name)){
                show_message.warning("文件格式错误，请选择xlsx文件")
                return false;
            }else{
                return true;
            }
		},
        customRequest(data){
            console.log(data)
            // 通过FileReader对象读取文件
            let fileReader = new FileReader(),
                vm = this;
            // 以二进制方式打开文件
            fileReader.readAsBinaryString(data.file);
            fileReader.onload = event => {
                try {
                    const { result } = event.target;
                    // 以二进制流方式读取得到整份excel表格对象
                    const workbook = XLSX.read(result, { type: 'binary' });
                    let data = []; // 存储获取到的数据
                    console.log(workbook);
                    // 遍历每张工作表进行读取（这里默认只读取第一张表）
                    for (const sheet in workbook.Sheets) {
                        if (workbook.Sheets.hasOwnProperty(sheet)) {
                            // 利用 sheet_to_json 方法将 excel 转成 json 数据
                            data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
                            // break; // 如果只取第一张表，就取消注释这行
                        }
                    }
                    console.log(data);
                    vm.uploadIds(data.map(e=>e['数据id']));
                } catch (e) {
                    // 这里可以抛出文件类型错误不正确的相关提示
                    console.log('文件类型不正确');
                    return;
                }
            };
        },
        exportTemplate(){
            exportXlsx({
                sheet:[{'数据id':1},{'数据id':2},{'数据id':3},{'数据id':4}]
            },'数据模板.xlsx');           
        },
        uploadIds(ids){
            if (ids.length > 100) {
                ids = ids.slice(0, 100);
                show_message("一次最多查询100个节点", "warning");
            }
            let params = {
                param: {
                    "idList": ids
                },
                urlParam: {
                    projectId: this.projectId
                }
            },
            idsLength = ids.length;
            this.uploadLoading = true;
            service.doRequest("existNode", params).then(result => {
                if (result.status == 200) {
                    this.isUpload = true;
                    this.notMatch = idsLength - result.data.length;
                    this.nodes = result.data;
                }else{
                    show_message(result.message);
                }
                this.uploadLoading = false;
            },()=>{
                this.uploadLoading = false;
            });
        },
        selectChange(e){
            this.selectNodes = e ? this.nodes.map(e=>e.id) : [];
            this.isIndeterminate = false;
        },
        clearStatus() {
            this.isUpload = false;
            this.cancelSelection();
        },
        cancelSelection() {
            this.isManage = false;
            this.selectNodes = [];
        }
    }
}
</script>

<style lang="less" scoped>
.batch-upload{
    height: 100%;
    .upload-tip{
        padding: 4px 8px;
        background: #F6F6F9;
        margin-top: 4px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        p{
            color: #778396;
            font-size: 12px;
            padding-right: 7px;
            line-height: 18px;
        }
    }
    .get-file-btn{
        margin-right: 12px;
        flex:1;
        /deep/ .el-upload{
            width: 100%;
        }
    }
    .noMatch-con{
        background: rgba(254,92,92,0.08);
        height: 26px;
        border-radius: 6px;
        padding: 0 6px;
        height:28px;
    }
    .upload-nodes{
        overflow: auto;
        margin: 0 -18px;
        ul{
            margin: 0 18px;
            li {
                display: flex;
                align-items: center;
                border-radius: 12px;
                background: #F6F6F9;
                padding: 6px 16px 6px 24px;
                margin: 0 0 12px 0;
                transition: all 0.6s;
                .item-info {
                    flex:1;
                    .item-name {
                        color: #464C5D;
                        font-size: 14px;
                    }
                    .item-type {
                        color: #778396;
                        font-size: 12px;
                    }
                }
                .add-button {
                    flex-shrink: 0;
                    opacity: 0;
                    cursor: pointer;
                    .add-button-background {
                        width: 23px;
                        height: 23px;
                        border-radius: 50%;
                        background: hsl(210, 100%, 53%);
                        border: 1px solid #0D86FF;
                        i {
                            display: none;
                            color: #fff;
                        }
                    }
                    &.add-button-active{
                        opacity: 1;
                        .add-button-background {
                            background-color: transparent;
                            border: 1px solid #DBDFE4;
                        }
                    }
                    &.add-button-active.add-button-check{
                        .add-button-background {
                            border: 1px solid #0D86FF;
                            background-color: #0D86FF;
                            i{
                                display: block;
                            }
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
                        .add-button-background {
                            border: 1px solid #0D86FF;
                        }
                        i {
                            display: block;
                        }
                    }
                }
            }
        }
    }
    .upload-btn-con{
        margin: 0 -18px;
        padding: 18px 18px 0;
        box-shadow: 0 0 20px rgba(0, 118, 255, 0.16);
        border-radius: 26px 26px 0 0;
        z-index: 2;
        .upload-btn-manager{
            height: 32px;
            padding: 5px 8px;
            border: 1px solid #DBDFE4;
            border-radius: 16px;
            margin-right: 18px;
            font-size: 14px;
            color:#464C5D;
            cursor: pointer;
        }
        .upload-manager-con{
            width:192px;
            display: flex;
            padding-right: 6px;
            /deep/ .upload-manager-con-btn{
                padding: 0px;
                color:#464C5D;
                font-weight: normal;
                &:hover{
                    color:#191c22;
                }
            }
            /deep/ .el-checkbox .el-checkbox__label{
                padding-left: 5px;
            }
            .upload-manager-con-line{
                background: #D0D9E2;
                width:1px;
                height:12px;
                margin: 0 3px 0 4px;
            }
            .upload-manager-cancel{
                font-size: 14px;
                color: #778396;
                cursor: pointer;
            }
            .upload-manager-con-select{
                text-align: right;
                font-size: 12px;
                color: #040C15;
                flex:1;
            }
            .upload-manager-con-select-number{
                font-size: 10px;
                background: #0D86FF;
                color: #fff;
                padding: 2px 8px;
                border-radius: 10px;
            }
        }
    }
    .graphSearch-template{
        height:18px;
        width:18px;
        margin-top: 4px;
        margin-left: 1px;
        fill:#0D86FF;
    }
}
</style>