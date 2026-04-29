/*
 * @Author: your name
 * @Date: 2020-08-11 11:32:52
 * @LastEditTime: 2022-02-17 15:04:12
 * @LastEditors: shifangwang
 * @Description: In User Settings Edit
 * @FilePath: /GraphInsight/src/settings.js
 */

let exprTypeOptions = [
    {name:'=',id:'EQUALS'},
    {name:'>',id:'LARGER'},
    {name:'>=',id:'LARGER_THAN'},
    {name:'<',id:'LESS'},
    {name:'<=',id:'LESS_THAN'},
    {name:'!=',id:'Not_Equal'},


    {name:'等于',id:'EQUALS'},{name:'大于',id:'LARGER'},{name:'大于等于',id:'LARGER_THAN'},
    {name:'小于',id:'LESS'},{name:'小于等于',id:'LESS_THAN'},{name:'包含',id:'CONTAIN'},
    {name:'属于',id:'IN'},{name:'正则',id:'REGEX'},{name:'相似',id:'SIMILAR'},
    {name:'不等于',id:'NOT_EQUALS'},{name:'起止时间',id:'START_END_TIME'},{name:'相对时间',id:'RELATIVE_TIME'},
    {name:'介于',id:'BETWEEN'},{name:'不包含',id:'NOT_CONTAIN'},
    {name:'始于',id:'START_WITH'},{name:'止于',id:'END_WITH'},
    {name:'相对时间T',id:'TRADE_RELATIVE_TIME'},
];

let defaultProps  = {
    node:[
        { name:'置信度',id:'_confidence_level' },
        { name:'来源表',id:'_source_table' },
        { name:'来源系统',id:'_source_system' },
        { name:'源系统记录时间',id:'_sys_record_time' },
        { name:'创建时间',id:'_create_time' },
        { name:'更新时间',id:'_update_time' }
    ],
    path:[
        { name:'置信度',id:'_confidence_level' },
        { name:'来源表',id:'_source_table' },
        { name:'来源系统',id:'_source_system' },
        { name:'关系代码',id:'_relation_code' },
        { name:'发生时间',id:'_start_time' },
        { name:'结束时间',id:'_end_time' },
        { name:'创建时间',id:'_create_time' },
        { name:'更新时间',id:'_update_time' }
    ]
}

let exprMap = {}

for(let item of exprTypeOptions){
    exprMap[item.id] = item.name;
}

module.exports = {
    appName: '信用卡可疑排查平台',
  
    /**
     * @type {String}
     * @description vuex的前缀
     */
    vuexPrefix: 'FE',

    /** 请求异常提示文字 */
    unknownErrorTip: '请求异常，请联系管理员',

    /** 开发环境代理 */
    devProxy:{
        dev:{
            target:'',
            pattern:[
            ]
        },
        test:{
            target:'',
            pattern:[
            ]
        },
        prod:{
            target: '',
            pattern:[
            ]
        }
    },
    exprTypeOptions,
    exprMap,
    defaultProps,
    ignorePages:[], //注释的页面
    ignoreModel:[], //注释的模型类型
    ignoreAnaylize:[],  //注释的分析流程类型
}