<!--
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2022-02-14 18:00:23
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-03-08 11:24:17
 * @FilePath: /GraphInsight/src/views/modules/visibleGraph/sidebar/leftSidebar/editTab/batchAdd.vue
-->
<template>
    <div class="batch-add">
        <div class="upload-file-box">
            <div class="flex-layout">
                <el-upload
                    class="upload-file-button flex-center"
                    action="fakeaction"
                    :file-list="fileList"
                    :show-file-list="false"
                    :auto-upload="true"
                    accept=".xlsx,.xls"
                    :http-request="customRequest"
                    :before-upload="beforeUpload"
                >
                    <el-button size="small" type="primary" icon="el-icon-upload2" class="elementui-btn-style1" style="width:100%" :loading="uploading">上传文件</el-button>
                </el-upload>
                <el-button type="primary" size="small" class="flex-shrink elementui-btn-style1" style="width:32px;padding:0px;" @click="downloadExcelTemp"><svg-icon iconClass="graphSearch-template" className="graphSearch-template"></svg-icon></el-button>
                <!-- <div class="download-temp-background flex-center" @click="downloadExcelTemp">
                    <svg-icon iconClass="graphLeftSidebar-download-temp" className="download-temp-icon"></svg-icon>
                </div> -->
            </div>
            <div class="upload-tips flex-center">
                <p class="flex">支持excel格式上传，批量新增节点/关系到数据库，点击右侧按钮下载新增模板</p>
                <img class="flex-shrink" src="@icons/png/search/excelImport.png" />
            </div>
            <div class="batch-list">
                <div v-if="isUpload" class="upload-result">
                    <div class="upload-total">
                        <svg-icon iconClass="graphLeftSidebar-upload-bell" className="upload-bell-icon"></svg-icon>
                        <span>共插入<span class="number">{{uploadTotal.node}}</span>个节点，<span class="number">{{uploadTotal.link}}</span>条关系</span>
                    </div>
                </div>
                <!-- <div v-else class="upload-imgs text-align-center">
                    <img src="@icons/png/search/upload.png" style="width:216px;"/>
                    <p class='tip-style1 mt4'>文件为空，请上传文件</p>
                </div> -->
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

    },
    data() {
        return {
            isUpload: false,
            fileList: [],
            uploadTotal: {
                node: 0,
                link: 0
            },
            uploading:false
        }
    },
    methods: {
        downloadExcelTemp() {
            service.doRequest("downloadExcelTemp").then(result => {
                const blob = new Blob([result],{type: 'application/vnd.ms-excel'}),
                blobUrl = window.URL.createObjectURL(blob),
                a = document.createElement("a");
                a.download = 'excelTemp.xlsx';
                a.href = blobUrl;
                a.click();
            }).catch(() => {
                show_message("下载失败", "error");
            })
        },
        customRequest(data) {
            this.uploadTotal = {
                node: 0,
                link: 0
            }
            this.isUpload = false;
            this.parseExcel(data.file);
            let excelParam = new FormData();
            excelParam.append("excelFile", data.file);
            excelParam.append("projectId", this.$route.query.projectId)
            let param = {
                param: excelParam,
                urlParam: {
                    projectId: this.$route.query.projectId
                }
            }

            this.uploading = true;
            service.doRequest("uploadDataByExcel", param).then(result => {
                console.log("result:", result);
                if (result.status == 200) {
                    show_message("上传成功", "success");
                    this.$emit("getGraphInfo");
                    this.parseExcel(data.file);
                }
                this.uploading = false;
                this.isUpload = true;
            }).catch(() => {
                this.uploading = false;
                show_message("上传失败", "error")
            })
        },
        parseExcel(file) {
            // 通过FileReader对象读取文件
            let fileReader = new FileReader(),
                vm = this;
            // 以二进制方式打开文件
            fileReader.readAsBinaryString(file);
            fileReader.onload = event => {
                try {
                    const { result } = event.target;
                    // 以二进制流方式读取得到整份excel表格对象
                    const workbook = XLSX.read(result, { type: 'binary' });
                    let data = []; // 存储获取到的数据
                    console.log(workbook);
                    // 遍历每张工作表进行读取（这里默认只读取第一张表）
                    for (const sheet in workbook.Sheets) {
                        if (sheet == '实体') {
                            data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
                            vm.uploadTotal.node = data.length;
                        } else if (sheet == '关系') {
                            data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
                            vm.uploadTotal.link = data.length;
                        }
                        console.log(data);
                    }
                } catch (e) {
                    // 这里可以抛出文件类型错误不正确的相关提示
                    console.log('文件类型不正确');
                    return;
                }
            };
        },
        beforeUpload(file) {
            console.log(file)
            if(!/(.+)(\.)(xlsx|xls)$/.test(file.name)){
                show_message.warning("文件格式错误，请选择xlsx文件")
                return false;
            }else{
                return true;
            }
        }
    }
}
</script>

<style lang="less" scoped>
.batch-add{
    height: 100%;
    .upload-file-box {
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100%;
        /deep/ .upload-file-button {
            flex: 1;
            margin: 0 12px 0 0;
            .el-upload {
                flex: 1;
            }
            .upload-add-icon {
                width: 14px;
                height: 14px;
                fill: #0D86FF;
                margin: 0 5px 0 0;
            }
        }
        .download-temp-background {
            width: 34px;
            height: 34px;
            border-radius: 5px;
            background: #E3E7ED;
            cursor: pointer;
            .download-temp-icon {
                width: 20px;
                height: 20px;
                fill: #0D86FF;
            }
        }
        .upload-tips {
            border-radius: 6px;
            background: #F6F6F9;
            color: #778396;
            font-size: 12px;
            margin: 5px 0 0;
            padding: 4px 8px;
        }
        .batch-list {
            display: flex;
            flex-direction: column;
            margin: 14px 0 0;
            flex: 1;
            .upload-imgs {
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1;
                margin: 0 0 80px 0;
                justify-content: center;
            }
            .upload-total {
                display: flex;
                align-items: center;
                font-size: 14px;
                .upload-bell-icon {
                    width: 15px;
                    height: 15px;
                    fill: #326EF1;
                    margin: 0 6px 0 0;
                }
                .number {
                    color: #326EF1;
                }
            }
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
</style>