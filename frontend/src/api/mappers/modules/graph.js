/*
 * @Author: huangyixin
 * @Date: 2021-12-24 09:42:54
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-03-08 15:01:36
 * @Description: In User Settings Edit
 * @FilePath: /GraphInsight/src/api/mappers/modules/graph.js
 */
/*
	地址映射单元

	对接口访问的每一个地址进行一对一映射，
		以别名的方式对接口地址进行维护
*/
const prefix = '/graph'; 

export default {
	// 获取图谱中属性
	'getGraphAttr':{
        url:`${prefix}/attributes/{projectId}`,
        type:'get'
    },
	// 获取图谱中schema
	'getGraphSchema':{
        url:`${prefix}/schema/{projectId}`,
        type:'get'
    },
    // 测试图谱连接
    'graphTest':{
        url:`${prefix}/test`,
        type:'postJSON'
    },
    // 查询节点分页接口
	'searchNode':{
        url:`${prefix}/vertex/{projectId}/page`,
        type:'postJSON'
    },
    // 节点展开接口
	'expandNode':{
        url:`${prefix}/expand/{projectId}`,
        type:'postJSON'
    },
    // 两两节点之间的最短路径
	'pathBetweenNodes':{
        url:`${prefix}/shortPath/{projectId}`,
        type:'postJSON'
    },
    // 是否存在节点
    'existNode':{
        url:`${prefix}/vertex/{projectId}/list`,
        type:'postJSON'
    },
    // 添加实体
    'addVertex':{
        url:`${prefix}/vertex/{projectId}`,
        type:'postJSON'
    },
    // 添加边
    'addEdge':{
        url:`${prefix}/edge/{projectId}`,
        type:'postJSON'
    },
    // 修改实体或关系属性
    'editAttribute':{
        url:`${prefix}/attribute/{projectId}`,
        type:'putJSON'
    },
    // 删除实体或关系属性
    'deleteAttribute':{
        url:`${prefix}/delete/attribute/{projectId}/{id}?vertex={vertex}`,
        type:'deleteParamBody'
    },
    // 删除实体或关系
    'deleteElement':{
        url:`${prefix}/delete/{projectId}/{id}`,
        type:'deleteJSON'
    },
    // 停止图谱实例
    'stopGraph':{
        url:`${prefix}/stop/{projectId}`,
        type:'deleteJSON'
    },
    
};