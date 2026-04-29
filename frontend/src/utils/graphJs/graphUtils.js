/*
 * @Descripttion: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2020-08-26 17:43:27
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2021-10-21 14:38:52
 */
import _ from "lodash";


export function graph_formatedData(items,entityMap,type){
    items.axisMap = {};
    for(let [i,d] of items.nodes.entries()){
        // 记录节点坐标
        items.axisMap[d.id] = {
            x: d.attributes && d.attributes.x ? d.attributes.x : 0,
            y: d.attributes && d.attributes.y ? d.attributes.y : 0
        }

        d.color = (entityMap[d.type]&&entityMap[d.type].color) || '#13bea2';
        d.iconName = entityMap[d.type] ? entityMap[d.type].icon : '';
        d.icon = (entityMap[d.type]&&entityMap[d.type].icon!=undefined&&entityMap[d.type].icon!='default') ? require('@/assets/nodePng/'+entityMap[d.type].icon+'-01.png') : '';
        if(type=='analysis'){
            d.attributes =  _.omit(d.attributes, ['oid','x','y']) 
        }else{
            d.attributes =  _.omit(d.attributes, ['oid']) 
        }
    }
    for(let [i,d] of items.links.entries()){
        d.from = d.source;
        d.to = d.target;
        d.name = d.name || d.type;
    }
    return items;
}

// 格式化图数据成node和link
export function getGraphForFunc(data){
    let params = {nodes:[],links:[]};
    for(let [index, elem] of data.nodes.entries()){
        params.nodes.push({
            id:elem.id,
            name:elem.name||'无',
            type:elem.type
        });
    }
    for(let [index, elem] of data.links.entries()){
        params.links.push({
            source:elem.from,
            target:elem.to,
            id:elem.id 
        });
    }
    return params;
}
export function isInclude(obj,map) {
    let flag = true;
    if(map != undefined){
        // 有过滤条件并且开关为开
        if(map.rules.length != 0 && map.checked) {
            flag = rulesMatch(obj,map.rules);
        }
        else {
            flag = map.checked;
        }
    }
    return flag;
}

export function rulesMatch(item,rules){
    let flag = true,
        tmpFlag = [],
        logic = 'AND';
    for(let [index,factor] of rules.entries()){
        let { field,expression,value,valueType,logicOp} = factor;
        let itemAttrValue = item.attributes[field];
        if(itemAttrValue){
            if(valueType=='STRING'){
                tmpFlag.push(StringMatch(expression,itemAttrValue,value));
            }else{
                tmpFlag.push(NumberMatch(expression,Number(itemAttrValue),Number(value)));
            }//end of 类型判断
        }else{
            tmpFlag.push(false);
        }
        if(index == 1){
            logic = logicOp; 
        }
    }
    if(logic == 'AND'){
        for(let oneFlag of tmpFlag.values()){
            if(oneFlag == false){
                flag = false;
            }
        }
    }else{
        let ORFLAG = true;
        for(let oneFlag of tmpFlag.values()){
            ORFLAG = ORFLAG && !oneFlag; 
        }
        if(ORFLAG){
            flag = false;
        }
    }
    return flag;
}

export function NumberMatch(exprType,nodeAttrValue,value){
    let flag = false;
    switch(exprType){
        case 'EQUALS':
            if(nodeAttrValue==value){
                flag = true;
            }
            break;
        case 'LARGER_THAN':
            if(nodeAttrValue>=value){
                flag = true;
            }
            break;
        case 'LESS_THAN':
            if(nodeAttrValue<=value){
                flag = true;
            }
            break;
        case 'LARGER':
            if(nodeAttrValue>value){
                flag = true;
            }
            break;
        case 'LESS':
            if(nodeAttrValue<value){
                flag = true;
            }
            break;
        case 'Not_Equal':
            if(nodeAttrValue!=value){
                flag = true;
            }
            break;
    }
    return flag;
}
export function StringMatch(exprType,nodeAttrValue,value){
    let flag = false;
    /* 判断是不是正则 */
    let isreg;
    try{
        isreg = eval(value) instanceof RegExp
    }catch(e){
        isreg = false;
    }
    switch(exprType){
        case 'EQUALS':
            if(isreg){
                if(nodeAttrValue.search(eval(value))>=0){
                    flag = true;
                }
            }else{
                if(nodeAttrValue.indexOf(value)>=0){
                    flag = true;
                }
            }
            break;
        case 'Not_Equal':
                if(isreg){
                    if(nodeAttrValue.search(eval(value))<0){
                        flag = true;
                    }
                }else{
                    if(nodeAttrValue.indexOf(value)<0){
                        flag = true;
                    }
                }
            break;
    }
    return flag;
}

export function deepClone(source) {
    if (!source && typeof source !== 'object') {
        throw new Error('error arguments', 'shallowClone')
    }
    const targetObj = source.constructor === Array ? [] : {}
    for (const keys in source) {
        if (source.hasOwnProperty(keys)) {
        if (source[keys] && typeof source[keys] === 'object') {
            targetObj[keys] = source[keys].constructor === Array ? [] : {}
            targetObj[keys] = deepClone(source[keys])
        } else {
            targetObj[keys] = source[keys]
        }
        }
    }
    return targetObj
}

export function genNonDuplicateID(randomLength){
    return Number(Math.random().toString().substr(3,randomLength) + Date.now()).toString(36)
}