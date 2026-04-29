/*
 * @Descripttion: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2020-08-28 14:18:02
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2021-02-01 15:47:58
 * @FilePath: /KMP4/src/utils/graphJs/timeLine/utils.js
 */
import * as d3 from "d3";

//时间轴工具类

export default function timeLineUtils(id) {
  this.id = id;
}
timeLineUtils.prototype = {
  constructor: timeLineUtils,
  svgWidth: function(svg) {
    return d3.select(svg).node() ? d3.select(svg).node().getBoundingClientRect().width : 0;
  },
  svgHeight: function(svg) {
    return d3.select(svg).node() ? d3.select(svg).node().getBoundingClientRect().height : 0;
  },
  //转化时间 将所有时间转成当天的0点 提高精度
  transferTime: function(date) {
    return new Date(new Date(new Date(date).toLocaleDateString()).getTime());
  },
  getDaysBetween: function(date1, date2){
    let startDate = Date.parse(date1);
    let endDate = Date.parse(date2);
    let days = Math.floor((Math.abs(endDate - startDate))/(1*24*60*60*1000));
    return  days;
  },
  //将数据按时间分类
  countDataByTime: function(nodeData = [], timeUnit) {
    const data = {},
      sortTimeArr = [],
      transferData = nodeData.concat(),
      typeColor = {};
    let timeArr = [];
    transferData.forEach(item => {
      for(let i = 0; i < timeUnit.length; i++) {
        // 根据timeUnit的顺序查找属性
        if(item.attributes[timeUnit[i]]){
          item.attributes[timeUnit[i]] = this.transferTime(item.attributes[timeUnit[i]]);
          //统计相同时间的个数
          if (!data[item.attributes[timeUnit[i]]]) {
            data[item.attributes[timeUnit[i]]] = {};
            data[item.attributes[timeUnit[i]]][item.type] = {
              count: 1,
              type: item.type,
              time: item.attributes[timeUnit[i]],
              data: [item]
            };
          } else {
            if (!data[item.attributes[timeUnit[i]]][item.type]) {
                data[item.attributes[timeUnit[i]]][item.type] = {
                  count: 1,
                  type: item.type,
                  time: item.attributes[timeUnit[i]],
                  data: [item]
                };
            } else {
                data[item.attributes[timeUnit[i]]][item.type].count += 1;
                data[item.attributes[timeUnit[i]]][item.type].data.push(item);
            }
          }
          //统计颜色
          if(!typeColor[item.type]){
            typeColor[item.type] = {
              color: item.color,
              isSelected: true
            };
          }
          break;
        }
      }
    });
    Object.keys(data).forEach(timeKey => {
      let sum = 0;
      Object.keys(data[timeKey]).forEach(typeKey => {
        sum += data[timeKey][typeKey].count;
      });
      sortTimeArr.push({
        count: sum,
        time: timeKey
      });
    });
    //给时间排序 防止画的曲线图错位
    sortTimeArr.sort((a, b) => {
      return Date.parse(a.time) - Date.parse(b.time);
    });
    timeArr = Object.entries(data);
    // console.log("data:", data);
    // console.log("timeArr:", timeArr);
    // console.log("sortTimeArr:", sortTimeArr);
    // console.log("type:", typeColor);
    return { timeArr, sortTimeArr ,typeColor};
  },
  sortLinksData(timeData, timeUnit) {
    // console.log("timeData:", timeData);
    const sortArr = [];
    timeData.forEach(item => {
      for(let i = 0; i < timeUnit.length; i++) {
        if(item.attributes[timeUnit[i]]) {
          sortArr.push(item.attributes[timeUnit[i]]);
          break;
        }
      }
    })
    sortArr.sort((a, b) => {
      return Date.parse(a) - Date.parse(b);
    });
    return sortArr;
  }
};
