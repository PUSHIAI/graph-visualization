/*
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2021-02-25 10:19:36
 * @Feature: 
 * @LastEditors: huangyixin
 * @LastEditTime: 2021-12-16 17:30:14
 * @FilePath: /GraphInsight/src/utils/graphJs/PixiChart/layout/force/forceLayout.worker.js
 */
import forceLayout from "./forceLayout";
self.onmessage = function(event) {
    const nodes = event.data.nodes,
    links = event.data.links,
    width = event.data.width,
    height = event.data.height,
    simulation = forceLayout(nodes, links, width, height).simulation,
    tick = event.data.tick ? event.data.tick : Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));

    console.log('开始simulation');
    console.log(tick);
    console.log((new Date()).getTime()/1000);

    for(let i = 0; i < tick; i++) {
        simulation.tick();
        // console.log((new Date()).getTime()/1000);
        // const message = {
        //     type: "tick",
        //     progress: i / tick,
        //     nodes: nodes,
        //     links: links,
        //     currentTick: i
        // }
        // self.postMessage(message);
    }
    const bounds = {
        xMin: 0,
        yMin: 0,
        xMax: 0,
        yMax: 0
    };
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        // 坐标化为整数 防止浮点型计算
        node.x = Math.floor(node.x);
        node.y = Math.floor(node.y);
        // 计算边界值
        bounds.xMin = Math.min(bounds.xMin, node.x);
        bounds.yMin = Math.min(bounds.yMin, node.y);
        bounds.xMax = Math.max(bounds.xMax, node.x);
        bounds.yMax = Math.max(bounds.yMax, node.y);
    }
    const message = {
        type: "end",
        nodes: nodes,
        links: links,
        bounds: bounds
    };
    console.log('返回主函数');
    console.log((new Date()).getTime()/1000);
    self.postMessage(message);
    self.close();
}