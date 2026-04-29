/*
 * @Author: huangyixin
 * @Date: 2021-12-08 11:41:17
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-01-07 17:44:34
 * @Description: In User Settings Edit
 * @FilePath: /GraphInsight/src/utils/graphJs/PixiChart/layout/dagre/dagreLayout.worker.js
 */
import dagreLayout from "./dagreLayout";

self.onmessage = function(event) {
    console.log(`worker里面`);
    console.log((new Date()).getTime()/1000);
    let nodes = event.data.nodes,
        links = event.data.links,
        oldNodes = event.data.oldNodes,
        oldLinks = event.data.oldLinks,
        oldNodesMap = {},
        oldNodeCoordinate = new Map(),
        isInitRender = true,
        drawNodes = {};

    //判断是不是初次渲染
    if(oldNodes.length != 0){
        isInitRender = false;
    }

    let calculateData = { nodes:[], edges:[]},
        nodeMap = {};

    // 添加新数据
    for(let i=0; i<nodes.length ;i++){
        let node = nodes[i];
        drawNodes[node.id] = true;
        calculateData.nodes.push({
            id:node.id,
            label:node.name,
            width:80,
            height:80
        });
    }
    for(let i=0; i<links.length ;i++){
        let edge = links[i];
        calculateData.edges.push({
            id:edge.id,
            source:edge.source,
            target:edge.target
        });
    }

    // 添加旧数据
    if(!isInitRender){
        for(let i=0; i<oldNodes.length ;i++){
            if(drawNodes[oldNodes.id]){
                continue;
            }
            let node = oldNodes[i];
            oldNodesMap[node.id] = node;
            calculateData.nodes.push({
                id:node.id,
                label:node.name,
                width:80,
                height:80
            });
        }
        for(let i=0; i<oldLinks.length ;i++){
            let edge = oldLinks[i];
            calculateData.edges.push({
                id:edge.id,
                source:edge.source.id,
                target:edge.target.id
            });
        }
    }

    let coordinate = dagreLayout(calculateData);
    console.log(coordinate);
    
    // 记录新节点的坐标
    // 赋值节点的x和y
    for(let i=0; i<nodes.length ;i++){
        let node = nodes[i];
        node.x = coordinate[node.id].x;
        node.y = coordinate[node.id].y;
        nodeMap[node.id] = node;
    }

    // 把link的source和target转成引用
    console.log('把link的source和target转成引用')
    console.log(oldNodesMap,nodeMap);
    for(let i=0; i<links.length ;i++){
        let link = links[i];
        link.source = nodeMap[link.source];
        link.target = nodeMap[link.target];
    }

    // 记录旧节点的坐标
    for(let i=0; i<oldNodes.length ;i++){
        let node = oldNodes[i];
        if(oldNodesMap[node.id]){
            let nodeCoordinate = coordinate[node.id];
            oldNodeCoordinate.set(node.id, {
                next:{
                    x: nodeCoordinate.x,
                    y: nodeCoordinate.y
                }
            })
        }
    }

    console.log(nodes,links,oldNodeCoordinate);

    const message = {
        type: "end",
        nodes: nodes,
        links: links,
        oldNodeCoordinate:oldNodeCoordinate,
        renderType: isInitRender?1:2
    };
    self.postMessage(message);
    self.close();
}