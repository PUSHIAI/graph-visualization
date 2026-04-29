/*
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2022-01-05 11:01:11
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-01-05 11:50:59
 * @FilePath: /GraphInsight/src/utils/graphJs/PixiChart/layout/grid/gridLayout.worker.js
 */
import gridLayout from "./gridLayout";
self.onmessage = function(event) {
    const nodes = event.data.nodes,
    containerSize = {
        width: event.data.width,
        height: event.data.height
    };

    gridLayout(nodes, containerSize);

    const message = {
        type: "end",
        nodes: nodes
    };
    self.postMessage(message);
    self.close();
}