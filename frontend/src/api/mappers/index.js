/*
 * @Author: your name
 * @Date: 2020-08-11 11:27:59
 * @LastEditTime: 2021-05-12 16:44:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /KMP4/src/api/mappers/index.js
 */
/** 
 * 自动读取modules里面的地址映射文件 
 * 
 *  模板如下：
 *  const prefix = '';  请求前缀，可以用来做代理标识

    export default {
        'test':{                    请求别名，这个跨文件不能重名，命名时可以加上文件前缀。
            url:`${prefix}/users`,  请求真实地址
            type:'get'              请求类型，有下面几种：（具体可以参考serviceConfig）
                                        'get':'get',
                                        'getRepeat':'get',

                                        'post':'post',
                                        'postWithoutToken':'post',
                                        'upload':'post',
                                        'postJSON':'post',
                                        'register' : 'post',

                                        'delete':'delete',
                                        'deleteRepeat':'delete',
                                        'deleteJSON': 'delete',

                                        'put':'put',
                                        'putRepeat':'put',
                                        'putJSON' : 'put',
        },
    };
 * 
 * 
 * */
const modulesFiles = require.context('./modules', false, /\.js$/)
const mappingObj = modulesFiles.keys().reduce((modules, modulePath) => {
    const value = modulesFiles(modulePath)
    modules = {...modules, ...value.default}
    return modules
}, {});

export const apiMapper = {
    ...mappingObj
};