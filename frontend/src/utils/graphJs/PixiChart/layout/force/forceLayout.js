/*
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2021-02-26 10:58:31
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2021-07-22 16:28:06
 * @FilePath: /KMP4/src/utils/graphJs/PixiChart/layout/force/forceLayout.js
 */

import * as d3 from "d3";

export default function forceLayout(nodes, links, width, height) {
    const simulation = d3
      .forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(function(node){
          console.log('node');
          console.log(node);
          return -30;  
      }).distanceMin(10))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("link", d3.forceLink(links).id(function(d) {
          return d.id;
      }).distance(30))
      .force("x", d3.forceX(width / 2))
      .force("y", d3.forceY(height / 2))
      .force("collide", d3.forceCollide(8).iterations(1))
      .stop()
    return {
        simulation,
        nodes: nodes,
        links: links
    };
}