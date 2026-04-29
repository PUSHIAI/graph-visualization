/*
 * @Author: huangyixin
 * @Date: 2021-12-16 10:41:31
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-03-07 21:35:47
 * @Description: In User Settings Edit
 * @FilePath: /GraphInsight/src/utils/graphJs/PixiChart/utils/common.js
 */
export function isFunction(o) {
    return typeof o === 'function';
};

export function getVal(val,ele ){
    return typeof val === 'function' ? val.apply(ele, [ele]) : val;
}

export function isEmpty(value) {
    return typeof(value) === "undefined" || value === null || value === '';
}

// 数组去重
export function arrayDeduplication(array, key) {
    let keyMap = {},
        newArr = []
    for (let i = array.length - 1; i > -1; i--) {
        let item = array[i]
        if (!keyMap[item[key]]) {
            newArr.push(item);
            keyMap[item[key]] = true;
        }
    }
    return newArr;
}

// 返回以 x 为底 y 的对数
export function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}