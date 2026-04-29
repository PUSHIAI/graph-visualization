<!--
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2021-12-07 15:17:12
 * @Feature: 
 * @LastEditors: huangyixin
 * @LastEditTime: 2022-04-02 13:03:09
 * @FilePath: /GraphInsight/src/views/modules/frontPage/index.vue
-->

<template>
    <div class="front-page">
        <img src="@icons/png/search/emptyTip.png" class="img-preload"/>
        <div class="side-bar">
            <div class="platform-title">
                <img src="@icons/png/logo/logo.jpg" class="logo-img"/>
                <span>图洞见平台</span>
            </div>
            <div class="create-project">
                <div class="create-button" @click="openCreateDialog">
                    <span>创建新项目</span>
                    <div class="add-button-background flex-center">
                        <svg-icon iconClass="frontPage-add-button" className="add-button"></svg-icon>
                    </div>
                </div>
            </div>
            <div class="use-guide">
                <svg-icon iconClass="frontPage-guide-pic" className="guide-pic"></svg-icon>
                <div class="guide-tips">
                    <div class="text-1">使用演示</div>
                    <div class="text-2">本平台为普适产品试用版本，如有疑问可在"普适智能"公众号留言。</div>
                </div>
                <div class="guide-operate flex-center">
                    <div class="operate-icon-background flex-center">
                        <svg-icon iconClass="frontPage-operate-icon" className="operate-icon"></svg-icon>
                    </div>
                    <div class="operate-button" v-if="false">
                        操作指引
                    </div>
                </div>
            </div>
            <el-dialog
                :title="dialogUse == 'forAddProject'? dialogTypeText + '项目' : '请配置节点关系默认样式'"
                :width="dialogUse == 'forAddProject'?'500px':'800px'"
                class="create-project-dialog"
                :close-on-click-modal="false"
                :before-close="closeDialog"
                :visible.sync="createVisible"
            >
                <div class="dialog-box" v-if="dialogUse == 'forAddProject'">
                    <el-form class="project-info" :model="newProjectData" ref="projectForm" :rules="projectRules">
                        <div class="project-basic">
                            <el-form-item label="项目名称" prop="name">
                                <el-input size="mini" v-model="newProjectData.name" placeholder="请输入项目名称"></el-input>
                            </el-form-item>
                            <el-form-item label="项目描述" prop="description">
                                <el-input size="mini" v-model="newProjectData.description" placeholder="请输入项目描述"></el-input>
                            </el-form-item>
                        </div>
                        <div class="database-basic">
                            <el-form-item label="Bolt URL" prop="neo4jConnect.bolt" :rules="{
                                required: true, message: '请输入neo4j的Bolt URL', trigger: 'blur'
                            }">
                                <el-input size="mini" v-model="newProjectData.neo4jConnect.bolt" placeholder="请输入neo4j的Bolt URL"></el-input>
                            </el-form-item>
                            <el-form-item label="用户名" prop="neo4jConnect.userName">
                                <el-input size="mini" v-model="newProjectData.neo4jConnect.userName" placeholder="请输入neo4j用户名"></el-input>
                            </el-form-item>
                            <el-form-item label="密码" prop="neo4jConnect.password">
                                <el-input size="mini" v-model="newProjectData.neo4jConnect.password" show-password placeholder="请输入neo4j密码"></el-input>
                            </el-form-item>
                            <!-- <div class="link-tip"><i class="el-icon-warning-outline mr4"></i>请使用Neo4j 3的版本</div> -->
                        </div>
                    </el-form>
                    <div class="button-box">
                        <el-button size="mini" class="test-connect" @click="graphTest" :loading="testLoading">测试链接</el-button>
                        <div>
                            <el-button size="mini" class="cancel" @click="closeDialog">取消</el-button>
                            <el-button size="mini" type="primary" class="confirm" @click="addProject" :loading="addLoading">确定</el-button>
                        </div>
                    </div>
                </div>
                <!-- 偏好设置 -->
                <template v-else>
                    <div v-loading="styleLoading" style="min-height:300px;">
                        <template v-if="!styleLoading">
                            <perference   
                                v-if="!getSchemaFailed"
                                :nodeTypes="nodeTypes" 
                                :linkTypes="linkTypes" 
                                :projectId="projectId"  
                                @styleSuccess="styleSuccess"
                                @styleClose="styleClose"
                                >
                            </perference>
                            <div v-else>
                                <div class="perference-tip flex-column">
                                    <img src="@icons/png/search/emptyTip.png" style="width:240px;"/>
                                    <span class="mt20 fs18">图数据库信息获取失败，请检查链接是否正确！<span class="tip-counter">{{ countDown }}</span>秒后弹框关闭。</span>
                                </div>
                            </div>
                        </template>
                    </div>
                </template>
            </el-dialog>
        </div>
        <div class="front-page-main">
            <div class="front-page-title">
                <div class="search-box">
                    <el-input size="mini" v-model="searchProjectName" placeholder="搜索项目" @keyup.enter.native="searchProject">
                        <svg-icon slot="suffix" iconClass="common-search-icon" className="search-icon" @click="searchProject"></svg-icon>
                    </el-input>
                </div>
                <div class="list-menu" v-if="false">
                    <div 
                        :class="['display-layout-background', 'flex-center', item.value == activeDisplayMenu ? 'active-display-background' : '']" 
                        v-for="item in displayMenu"
                        :key="item.value"
                        @click="changeDisplayLayout(item)"
                    >
                        <svg-icon :iconClass="item.icon" className="display-layout"></svg-icon>
                    </div>
                </div>
            </div>
            <div class="front-page-box">
                <!-- <transition name="list-transition"> -->
                    <div class="project-grid" v-if="activeDisplayMenu == 'grid'"  v-loading="projectLoading">
                        <template v-if="projectList.length > 0">
                            <ul>
                                <li 
                                    v-for="item in projectList"
                                    :key="item.id"
                                    class="project-item"
                                >
                                    <div class="project-name text-ellipsis">{{item.name}}</div>
                                    <div class="basic-info">
                                        <div class="create-time">
                                            <span class="text">创建时间：</span>
                                            <span>{{item.createTime}} </span>
                                        </div>
                                        <div class="project-desc">
                                            <span class="text">描述：</span>
                                            <span class="project-desc-content">{{item.description}}</span>
                                        </div>
                                        <div class="visible-button flex-center" @click="enterVisibleGraph(item)">可视化</div>
                                    </div>
                                    <div class="project-toolbox">
                                        <div class="toolbox-item flex-center" 
                                            v-for="toolItem in toolboxList"
                                            :key="toolItem.label"
                                            @click="toolboxEvent(toolItem, item)"
                                        >
                                            <svg-icon :iconClass="toolItem.icon" className="toolbox-icon"></svg-icon>
                                            <span>{{toolItem.label}}</span>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <el-pagination
                                class="flex-center"
                                layout="pager, jumper"
                                :total="projectListManage.total"
                                @current-change="getProjectListPage"
                            >
                            </el-pagination>
                        </template>
                        <template v-if=" projectList.length ==0 && firstLoading == false "> 
                            <div class="project-grid-tip" v-if="prevSearch.trim() == ''">
                                <img src="@icons/png/search/noproject.jpg" style="width:340px;"/>
                                <span class="mt10 fs18">请新建项目</span>
                            </div>
                            <div class="project-grid-tip" v-else>
                                <img src="@icons/png/search/emptyTip.png" style="width:240px;"/>
                                <span class="mt10 fs18">没有符合项目</span>
                            </div>
                        </template>
                    </div>
                    <div class="project-list" v-if="activeDisplayMenu == 'list'">
                        <ul>
                            <li 
                                v-for="(item, index) in projectList"
                                :key="item.id"
                                class="project-item"
                            >
                                <div class="project-name flex-center">
                                    <div class="project-index">{{index + 1}}</div>
                                    {{item.name}}
                                </div>
                                <div class="basic-info">
                                    <div class="create-time">
                                        <span class="text">创建时间：</span>
                                        {{item.createTime}}</div>
                                    <div class="project-desc">
                                        <span class="text">描述：</span>
                                        {{item.description}}
                                    </div>
                                </div>
                                <div class="project-toolbox">
                                    <div class="toolbox-item flex-center" 
                                        v-for="toolItem in toolboxList"
                                        :key="toolItem.label"
                                        @click="toolboxEvent(toolItem, item)"
                                    >
                                        <svg-icon :iconClass="toolItem.icon" className="toolbox-icon"></svg-icon>
                                        <span>{{toolItem.label}}</span>
                                    </div>
                                </div>
                                <div class="visible-button flex-center" @click="enterVisibleGraph(item)">可视化</div>
                            </li>
                        </ul>
                        <el-pagination
                            class="flex-center"
                            layout="pager, jumper"
                            :total="projectListManage.total"
                            @current-change="getProjectListPage"
                        >
                        </el-pagination>
                    </div>
                <!-- </transition> -->
            </div>
        </div>
        <div class="fullPageLoading" v-if="pageLoading">
            <hash-loader color="#0D86FF" :size="80"></hash-loader>
            <p>可视化组件加载中...</p>
        </div>
    </div>
</template>

<script>
import service from "@/api/service.js";
import { show_message } from "@/utils/message.js";
import { HashLoader } from '@saeris/vue-spinners';
import perference from './perference';

export default {
    data() {
        return {
            searchProjectName: '',
            projectList: [],
            projectRules: {
                name: [
                    { required: true, message: '请输入项目名称', trigger: 'blur' }
                ],
            },
            toolboxList: [
                // {
                //     label: '连接信息',
                //     icon: 'frontPage-connect-info',
                //     event: 'checkDetail'
                // },
                {
                    label: '编辑',
                    icon: 'frontPage-edit',
                    event: 'editProject'
                }, 
                {
                    label: '删除',
                    icon: 'frontPage-delete',
                    event: 'deleteProject'
                }
            ],
            displayMenu: [
                {
                    value: 'grid',
                    icon: 'frontPage-grid-layout'
                },
                {
                    value: 'list',
                    icon: 'frontPage-list-layout'
                }
            ],
            activeDisplayMenu: 'grid',
            createVisible: false,
            newProjectData: {
                name: '',
                description: '',
                graphType: '',
                neo4jConnect: {
                    bolt: '',
                    nameKey: '',
                    password: '',
                    typeKey: '',
                    uniquelyIdKey: '',
                    userName: ''
                }
            },
            projectListManage: {
                currentPage: 1,
                pageSize: 10,
                total: 0
            },
            dialogType: 'add',
            testLoading: false,
            addLoading:false,
            pageLoading:false,
            projectLoading:false,
            prevSearch:'',
            firstLoading:true,
            dialogUse: 'forAddProject',
            // dialogUse:'preference',
            pageLoading:false,
            nodeTypes:[],
            linkTypes:[],
            styleLoading:false,
            projectId:'',
            getSchemaFailed:false,
            countDown:5,
        }
    },
    components:{
        HashLoader,perference
    },
    computed: {
        dialogTypeText() {
            return this.dialogType == 'add' ? '新建' : '编辑';
        }
    },
    mounted() {
        this.getProjectList();
    },
    beforeDestroy(){
        this.pageLoading = false;
    },
    methods: {
        // 获取项目列表
        getProjectList() {
            let param = {
                param: {
                    currentPage: this.projectListManage.currentPage - 1,
                    pageSize: this.projectListManage.pageSize,
                    name: this.searchProjectName.trim()
                }
            }
            this.projectLoading = true;
            service.doRequest("getProjectList", param).then(result => {
                if (result.status == 200) {
                    this.projectList = result.data.content;
                    this.projectListManage.total = result.data.totalElements;
                    if(this.firstLoading){
                        this.firstLoading = false;
                    }
                }
                this.prevSearch = this.searchProjectName;
                this.projectLoading = false;
            },(e)=>{
                this.projectLoading = false;
            })
        },
        // 切换页码
        getProjectListPage(page) {
            this.projectListManage.currentPage = page;
            this.getProjectList();
        },
        // 搜索项目
        searchProject() {
            this.projectListManage.currentPage = 1;
            this.getProjectList();
        },
        // 切换展示形式
        changeDisplayLayout(item) {
            this.activeDisplayMenu = item.value;
            this.projectListManage.currentPage = 1;
            this.getProjectList();
        },
        // 新建项目弹窗
        openCreateDialog() {
            this.createVisible = true;
        },
        // 测试连接
        graphTest() {
            let param = {
                param: {
                    ...this.newProjectData,
                    graphType: 'NEO4J'
                }
            };
            this.testLoading = true;
            service.doRequest("graphTest", param).then(result => {
                if (result.status == 200) {
                    show_message("图谱连接成功", "success")
                }
                this.testLoading = false;
            }).catch(error => {
                show_message(error.response.data.message, "warning");
                this.testLoading = false;
            })
        },
        // 新增项目
        addProject() {
            let param = {
                param: {
                    ...this.newProjectData,
                    graphType: 'NEO4J'
                }
            },
            url = 'addProject';
            if (this.dialogType == 'edit') {
                url = 'editProject';
                param.urlParam = {
                    id: this.newProjectData.id
                }
            }
            this.$refs.projectForm.validate((valid) => {
                if (valid) {
                    this.addLoading = true;
                    service.doRequest(url, param).then(result => {
                        if (result.status == 200 || result.status == 201) {
                            show_message(`${this.dialogTypeText}成功`, 'success');
                            this.projectListManage.currentPage = 1;
                            this.getProjectList();
                            if(this.dialogType == 'add'){
                                this.projectId = result.data.data.split('/')[2];
                                this.getGraphSchema(this.projectId);
                                this.dialogUse = 'preference';
                            }else{
                                this.closeDialog();
                            }
                        }
                        this.addLoading = false;
                    }).catch(error => {
                        error.response.data.message && show_message(error.response.data.message, "warning");
                        this.addLoading = false;
                    })
                }
            })
        },
        // 查看详情
        checkDetail(item) {

        },
        // 编辑项目
        editProject(item) {
            this.dialogType = 'edit'
            this.createVisible = true;
            let param = {
                urlParam: {
                    id: item.id
                }
            }
            service.doRequest("getProjectDetail", param).then(result => {
                if (result.status == 200) {
                    this.newProjectData = result.data;
                }
            })
        },
        // 删除项目
        deleteProject(item) {
            this.$confirm(`确认要删除项目${item.name}吗?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let param = {
                    urlParam: {
                        id: item.id
                    }
                }
                service.doRequest("deleteProject", param).then(result => {
                    if (result.status == 200) {
                        show_message("删除成功!", 'success')
                        this.searchProject();
                    }
                })
            }).catch(() => {
            });
        },
        // 关闭弹框
        closeDialog() {
            this.createVisible = false;
            this.newProjectData = {
                name: '',
                description: '',
                neo4jConnect: {
                    bolt: '',
                    nameKey: '',
                    password: '',
                    typeKey: '',
                    uniquelyIdKey: '',
                    userName: ''
                }
            }
            this.dialogType = 'add';
            this.dialogUse = 'forAddProject';
            this.$nextTick(()=>{
                this.$refs.projectForm.clearValidate();
                this.nodeTypes = [];
                this.linkTypes = [];
                this.projectId = undefined;
            });
            this.counterDown && clearTimeout(this.counterDown);
        },
        toolboxEvent(toolItem, projectItem) {
            switch (toolItem.event) {
                case "checkDetail":
                    this.checkDetail(projectItem);
                    break;
                case "editProject":
                    this.editProject(projectItem);
                    break;
                case "deleteProject":
                    this.deleteProject(projectItem);
                    break;
            }
        },
        // 进入可视化界面
        enterVisibleGraph(item) {
            this.pageLoading = true;
            this.$router.push({
                name: '可视化',
                query: {
                    projectId: item.id,
                    name: item.name
                }
            });
        },
        getGraphSchema(id) {
            let param = {
                param: {
                    isIndex: true,
                    isProperty: true
                },
                urlParam: {
                    projectId: id
                }
            }
            this.styleLoading = true;
            this.getSchemaFailed = false;
            service.doRequest("getGraphSchema", param).then(result => {
                this.styleLoading = false;
                if (result.status == 200) {
                    this.nodeTypes = result.data.vertexList;
                    this.linkTypes = result.data.edgeList;
                }else{
                    this.schemaFailed();
                }
            }).catch(() => {
                this.schemaFailed();
                this.styleLoading = false;
            })
        },
        schemaFailed(){
            let self = this;
            this.getSchemaFailed = true;
            this.countDown = 3;
            let count = function (){
                self.counterDown = setTimeout(()=>{
                    self.countDown--;
                    if(self.countDown === 0){
                        self.closeDialog();
                    }else{
                        count();
                    }
                },1000);
            }

            count();
        },
        styleSuccess(){
            this.closeDialog();
        },
        styleClose(){
            this.closeDialog();
        }
    }
}
</script>

<style lang="less" scoped>
.fullPageLoading{
    position: fixed;
    top:0px;
    bottom:0px;
    left:0px;
    right:0px;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    p{
        margin-top:20px;
        font-size: 20px;
        color:#040C15;
    }
}
.front-page {
    height: 100%;
    display: flex;
    overflow: hidden;
    .side-bar {
        height: 100%;
        width: 215px;
        padding: 28px 20px;
        position: relative;
        min-height: 550px;
        .platform-title {
            color: #0D86FF;
            margin: 0 0 36px 0;
            display: flex;
            align-items: center;
            .icon-background {
                background: #0D86FF;
                width: 38px;
                height: 38px;
                border-radius: 12px;
                margin: 0 14px 0 0;
                .platform-logo {
                    fill: #fff;
                    width: 25px;
                    height: 25px;
                }
            }
            .logo-img{
                width: 38px;
                height: 38px;
                margin: 0 14px 0 0;
            }
        }
        .create-project {
            .create-button {
                font-size: 14px;
                color: #040C15;
                background: #F0F4F9;
                border-radius: 14px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 15px 12px 25px;
                .add-button-background {
                    background: #0D86FF;
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    .add-button {
                        fill: #fff;
                        width: 14px;
                        height: 14px;
                    }
                }
                cursor: pointer;
                &:hover{
                    background: #E8EFFF;
                    .add-button-background{
                        background: #0B70FA;
                    }
                }
            }
        }
        .use-guide {
            width: 175px;
            height: 256px;
            background: #F0F4F9;
            position: absolute;
            bottom: 40px;
            border-radius: 18px;
            .guide-pic {
                position: absolute;
                top: -58px;
                left: -56px;
            }
            .guide-tips {
                position: absolute;
                top: 110px;
                text-align: center;
                width: 100%;
                .text-1 {
                    font-size: 14px;
                    color: #040C15;
                }
                .text-2 {
                    font-size: 12px;
                    color: #657B93;
                    width: 164px;
                    margin: 10px auto;
                }
            }
            .guide-operate {
                position: absolute;
                bottom: 22px;
                width: 100%;
                justify-content: space-around;
                .operate-icon-background {
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    box-shadow: 0 3px 10px rgba(14, 81, 159, 0.16);
                    .operate-icon {
                        width: 20px;
                        height: 17px;
                    }
                }
                .operate-button {
                    color: #fff;
                    font-size: 12px;
                    background: #0D86FF;
                    border-radius: 27px;
                    text-align: center;
                    padding: 10px 30px;
                    cursor: pointer;
                }
            }
        }
        .create-project-dialog {
            /deep/ .el-dialog {
                border-radius: 18px;
                .el-dialog__header {
                    padding: 20px 32px 16px;
                    .el-dialog__headerbtn {
                        top: 12px;
                        right: 30px;
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
                    border-top: 1px solid #D0D9E2;
                }
            }
            .dialog-box {
                .project-info {
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
                            // background: #F5F6F7;
                            border: 1px solid #D0D9E2;
                        }
                    }
                    .project-basic, .database-basic {
                        position: relative;
                        padding: 18px 15px;
                        margin: 0 0 22px;
                        border-radius: 6px;
                        border: 1px solid #D0D9E2;
                    }
                    .project-basic::after {
                        content: '项目信息';
                        position: absolute;
                        top: -10px;
                        left: 20px;
                        padding: 0 5px;
                        background: #fff;
                    }
                    .database-basic::after {
                        content: 'Neo4j信息配置';
                        position: absolute;
                        top: -10px;
                        left: 17px;
                        padding: 0 5px;
                        background: #fff;
                    }
                }
                .button-box {
                    display: flex;
                    justify-content: space-between;
                    margin: 35px 0 0;
                    .el-button {
                        width: 118px;
                        height: 32px;
                        font-size: 14px;
                    }
                    .test-connect {
                        background: #F0F4F9;
                        border-radius: 16px;
                        color: #0D86FF;
                        border: none;
                        font-weight: normal;
                        &:hover{
                            background: #E8EFFF;
                            color:#0B70FA;
                        }
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
            .link-tip{
                margin-top: 10px;
                font-size: 12px;
                color:#fe5c5c;
            }
        }
    }
    .front-page-main {
        flex: 1;
        padding: 44px 0px;
        background: #F4F8FD;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        .front-page-title {
            display: flex;
            justify-content: space-between;
            margin: 0 0 14px 0;
            padding: 0 28px;
            .search-box {
                /deep/ .el-input {
                    width: 274px;
                    .el-input__inner {
                        height: 44px;
                        border-radius: 22px;
                        border: none;
                        background: #E2E9F0;
                        &::placeholder {
                            color: #778396;
                        }
                    }
                    .el-input__suffix {
                        top: 12px;
                        right: 18px;
                    }
                }
                .search-icon {
                    width: 18px;
                    height: 18px;
                    fill: #7B8FA2;
                    cursor: pointer;
                }
            }
            .list-menu {
                background: #E2E9F0;
                padding: 6px 5px;
                display: flex;
                .display-layout-background {
                    padding: 8px;
                    width: 42px;
                    height: 32px;
                    border-radius: 8px;
                    transition: all 0.6s;
                    cursor: pointer;
                    .display-layout {
                        width: 17px;
                        height: 17px;
                        fill: #7B8FA2;
                    }
                }
                .active-display-background {
                    background: #fff;
                    .display-layout {
                        fill: #0D82FF;
                    }
                }
            }
        }
        .front-page-box {
            flex: 1;
            overflow: auto;
            padding: 0 28px;
            .list-transition-enter, .list-transition-leave-to {
                opacity: 0;
            }
            .list-transition-enter-to, .list-transition-leave {
                opacity: 1;
            }
            .list-transition-enter-active {
                transition: all 1s;
            }
            .project-grid {
                display: flex;
                flex-direction: column;
                height: 100%;
                ul {
                    flex: 1;
                    list-style: none;
                    padding: 0;
                    display: flex;
                    flex-wrap: wrap;
                }
                .project-item {
                    position: relative;
                    width: 273px;
                    height: 262px;
                    margin: 0 26px 24px 0;
                    background-image: linear-gradient(rgba(227, 228, 229, 0.6), #F0F4F9);
                    border-radius: 28px 0 28px 0;
                    box-shadow: 0 3px 10px rgba(125, 163, 224, 0.09);
                    border: 1px solid transparent;
                    // transition: all 0.6s;
                    display: flex;
                    flex-direction: column;
                    .project-name {
                        font-size: 20px;
                        font-weight: bold;
                        color: #040C15;
                        text-align: center;
                        border-radius: 28px 0 0 0;
                        height: 62px;
                        line-height: 62px;
                        // transition: all 0.6s;
                        padding:0 20px;
                    }
                    .basic-info {
                        padding: 11px 23px;
                        flex: 1;
                        // transition: all 0.6s;
                        .create-time, .project-desc {
                            font-size: 14px;
                            margin: 0 0 6px 0;
                            display: flex;
                            .text {
                                color: #7D8896;
                                flex-shrink: 0;
                            }
                            .project-desc-content{
                                height: 40px;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                display: -webkit-box;
                                -webkit-line-clamp: 2;
                                -webkit-box-orient: vertical;
                            }
                        }
                        .visible-button {
                            width: 205px;
                            height: 32px;
                            border: 1px solid #0D86FF;
                            border-radius: 30px;
                            font-size: 14px;
                            color: #0D86FF;
                            margin: 16px auto 0;
                            cursor: pointer;
                            // transition: all 0.6s;
                        }
                    }
                    .project-toolbox {
                        width: 100%;
                        height: 36px;
                        background: #fff;
                        border-radius: 0 0 28px 0;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 0 23px;
                        // transition: all 0.6s;
                        .toolbox-item {
                            color: #778396;
                            font-size: 12px;
                            flex: 1;
                            cursor: pointer;
                            .toolbox-icon {
                                width: 14px;
                                height: 14px;
                                fill: #778396;
                                margin: 0 2px 0 0;
                            }
                            &:hover{
                                color:#142D54;
                                .toolbox-icon{
                                    fill:#142D54;
                                }
                            }
                        }
                    }
                    &:hover {
                        border: 1px solid #0D86FF;
                        box-shadow: 0 3px 10px rgba(125, 163, 214, 0.37);
                        .project-name {
                            color: #fff;
                            background: #0D86FF;
                        }
                        .basic-info {
                            background: #fff;
                            .visible-button {
                                background: #0D86FF;
                                color: #fff;
                            }
                        }
                        .project-toolbox {
                            background: #F5F8FA;
                        }
                    }
                }
                .project-grid-tip{
                    height:100%;
                    display:flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
            }
            .project-list {
                display: flex;
                flex-direction: column;
                height: 100%;
                ul {
                    list-style: none;
                    padding: 0;
                    flex: 1;
                }
                .project-item {
                    width: 100%;
                    height: 80px;
                    border-radius: 28px 0 28px 0;
                    border: 1.5px solid transparent;
                    padding: 20px 32px;
                    box-shadow: 0 3px 10px rgba(125, 163, 214, 0.06);
                    background: #fff;
                    margin: 0 0 15px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    transition: all 0.6s;
                    .project-name {
                        color: #040C15;
                        font-size: 20px;
                        font-weight: bold;
                        .project-index {
                            color: #fff;
                            width: 42px;
                            height: 42px;
                            text-align: center;
                            line-height: 42px;
                            background: #0D86FF;
                            border-radius: 8px;
                            margin: 0 18px 0 0;
                        }
                    }
                    .basic-info {
                        .create-time, .project-desc {
                            font-size: 14px;
                            margin: 0 0 6px 0;
                            .text {
                                color: #7D8896;
                            }
                        }
                    }
                    .project-toolbox {
                        border-radius: 0 0 28px 0;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        width: 250px;
                        .toolbox-item {
                            position: relative;
                            color: #778396;
                            font-size: 12px;
                            flex: 1;
                            cursor: pointer;
                            .toolbox-icon {
                                width: 14px;
                                height: 14px;
                                fill: #778396;
                                margin: 0 2px 0 0;
                            }
                            &:not(:last-child)::after {
                                content: '';
                                width: 1px;
                                height: 24px;
                                background: #D0D9E2;
                                position: absolute;
                                right: 0;
                            }
                        }
                    }
                    .visible-button {
                        width: 205px;
                        height: 32px;
                        border: 1px solid #0D86FF;
                        border-radius: 30px;
                        font-size: 14px;
                        color: #0D86FF;
                        background: rgba(13, 134, 255, 0.06);
                        cursor: pointer;
                        transition: all 0.6s;
                    }
                    &:hover {
                        border: 1.5px solid #0D86FF;
                        box-shadow: 0 3px 10px rgba(125, 163, 214, 0.37);
                        .visible-button {
                            color: #fff;
                            background: #0D86FF;
                        }
                    }
                }
            }
            /deep/ .el-pagination {
                text-align: center;
                .el-pager {
                    display: flex;
                    align-items: center;
                    li {
                        width: 38px;
                        height: 38px;
                        line-height: 38px;
                        text-align: center;
                        font-size: 14px;
                        background: transparent;
                        transition: all 0.3s;
                    }
                    .active {
                        background: #fff;
                        border-radius: 50%;
                        box-shadow: 0 3px 10px rgba(125, 163, 214, 0.16);
                    }
                }
                .el-pagination__jump {
                    .el-pagination__editor {
                        .el-input__inner {
                            border: 1px solid #D0D9E2;
                            border-radius: 6px;
                            background: #E2E9F0;
                        }
                    }
                }
            }
        }
    }
}
.perference-tip{
    align-items: center;
    margin: 50px 0;
    .tip-counter{
        color: #0D86FF;
        width: 18px;
        display: inline-block;
        font-size: 20px;
    }
}
.img-preload{
    opacity: 0;
    visibility: hidden;
    position: absolute;
    z-index: -10;
}
</style>