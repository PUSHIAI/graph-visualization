/*
 * @Author: huangyixin
 * @Date: 2022-01-12 09:37:00
 * @LastEditors: huangyixin
 * @LastEditTime: 2022-03-07 11:50:36
 * @Description: In User Settings Edit
 * @FilePath: /GraphInsight/src/api/mappers/modules/project.js
 */
/*
	地址映射单元

	对接口访问的每一个地址进行一对一映射，
		以别名的方式对接口地址进行维护
*/
const prefix = '/project'; 

export default {
	// 获取项目列表
	'getProjectList':{
        url:`${prefix}/page`,
        type:'get'
    },
	// 新增项目
	'addProject':{
        url:`${prefix}`,
        type:'postJSON'
    },
	// 获取项目详情
	'getProjectDetail':{
        url:`${prefix}/{id}`,
        type:'get'
    },
	// 编辑项目信息
	'editProject':{
        url:`${prefix}/{id}`,
        type:'putJSON'
    },
    // 删除项目
	'deleteProject':{
        url:`${prefix}/{id}`,
        type:'delete'
    },
    // 获取项目样式
	'getProjectStyle':{
        url:`${prefix}/{projectId}/projectStyle`,
        type:'get'
    },
    // 添加项目样式
	'addProjectStyle':{
        url:`${prefix}/{projectId}/projectStyle`,
        type:'postJSON'
    },
    // 修改项目样式
	'editProjectStyle':{
        url:`${prefix}/{projectId}/projectStyle/{id}`,
        type:'putJSON'
    },
    // 删除项目样式列表
	'deleteProjectStyle':{
        url:`${prefix}/{projectId}/projectStyle/{id}`,
        type:'delete'
    },
    // 批量修改样式
    'setProjectStyleBatch':{
        url:`${prefix}/{projectId}/projectStyle/batch`,
        type:'postJSON'
    },
    // 更新节点排序
    'updatePriorityList':{
        url:`${prefix}/{projectId}/projectStyle/updatePriorityList`,
        type:'postJSON'
    },
    // 更新节点排序
    'deleteProjectStyle':{
        url:`${prefix}/{projectId}/projectStyle/{id}`,
        type:'delete'
    }
};