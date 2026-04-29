/*
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2022-02-17 14:09:55
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-02-17 14:44:24
 * @FilePath: /GraphInsight/src/api/mappers/modules/excel.js
 */
const prefix = '/excel'; 

export default {
	// 上传Excel数据
	'uploadDataByExcel':{
        url:`${prefix}/{projectId}`,
        type:'uploadExcel'
    },
	// 下载添加数据Excel模板
	'downloadExcelTemp':{
        url:`${prefix}`,
        type:'download'
    },
};