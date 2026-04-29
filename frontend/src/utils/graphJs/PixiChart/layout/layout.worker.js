import gridLayout from "./grid/gridLayout";
import dagreLayout from "./dagre/dagreLayout";
import { nodeParam } from "../defaultParam";
import * as d3 from "d3";

let simulation;

self.onmessage = function(event) {
    console.log('接收到数据',event.data);
    switch(event.data.layoutType){
        case 'dagre':
            self.postMessage(doDagreLayout(event.data));
            break;
        case 'force':
            self.postMessage(doForceLayout(event.data));
            break;
        case 'grid':
            self.postMessage(doGridLayout(event.data));
            break;
    }
}

//矩阵布局处理逻辑
function doGridLayout(data){
    const nodes = data.nodes,
    containerSize = {
        width: data.width,
        height: data.height
    };

    gridLayout(nodes, containerSize, data.nodeSize*2);
    console.log(nodes);
    let nodesMap = {};
    for(let node of nodes){
        nodesMap[node.id] = {x:node.x,y:node.y};
    }
    return {
        type: "end",
        nodesMap: nodesMap
    };
}

//dagre布局处理逻辑
function doDagreLayout(data){
    let nodes = data.nodes,
        links = data.links;

    let calculateData = { nodes:[], edges:[]},
        nodeMap = {};

    // 添加新数据
    for(let i=0; i<nodes.length ;i++){
        let node = nodes[i];
        calculateData.nodes.push({
            id:node.id,
            label:node.name,
            width:data.nodeSize,
            height:data.nodeSize
        });
    }
    for(let i=0; i<links.length ;i++){
        let edge = links[i];
        calculateData.edges.push({
            id:edge.id,
            source:edge.source.id,
            target:edge.target.id
        });
    }

    let coordinate = dagreLayout(calculateData);

    return {
        type: "end",
        nodesMap:coordinate,
        layoutType: data.layoutType
    };
}

//力导向布局处理逻辑
function doForceLayout(data){
    const nodes = data.nodes,
        links = data.links.map(e=>{
            return {
                ...e,
                source:e.source.id,
                target:e.target.id,
            }
        }),
        width = data.width,
        height = data.height,
        maxNodeSize = Math.pow(data.nodeSize, 2) || 1;
    if(!simulation){
        simulation = d3
            .forceSimulation(nodes)
            .force("charge", d3.forceManyBody().strength(-50 * maxNodeSize))
            .force("link", d3.forceLink(links).id(function(d){ return d.id }).distance(50).strength(1))
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            // .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            // .force("link", 
            //     d3.forceLink(links).id(function(d) {
            //         return d.id;
            //     })
            //     .distance(60)
            //     .strength(function(d){
            //         return Math.sqrt(Math.min(d.source.dataLinks.length,d.target.dataLinks.length));
            //     })
            // )
            .force("x", d3.forceX(width / 2))
            .force("y", d3.forceY(height / 2))
            .force("collide", d3.forceCollide(function(d) {
                return d.size * nodeParam.NODE_RADIUS;
            }))
            .stop();
    }else{
        simulation.nodes(nodes)
            .force("charge", d3.forceManyBody().strength(-50 * maxNodeSize))
            .force("link", d3.forceLink(links).id(function(d){ return d.id }).distance(50).strength(1))
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            // .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            // .force("link", 
            //     d3.forceLink(links).id(function(d) {
            //         return d.id;
            //     })
            //     .distance(60)
            //     .strength(function(d){
            //         return Math.sqrt(Math.min(d.source.dataLinks.length,d.target.dataLinks.length));
            //     })
            // )
            .force("x", d3.forceX(width / 2))
            .force("y", d3.forceY(height / 2))
            .force("collide", d3.forceCollide(function(d) {
                return d.size * nodeParam.NODE_RADIUS;
            }))
            .alpha(1)
            .alphaTarget(0)
            .restart()
            .stop();
    }
    let tick = data.tick ? data.tick : Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));

    for(let i = 0; i < tick; i++) {
        simulation.tick();
    }
    const bounds = {
        xMin: 0,
        yMin: 0,
        xMax: 0,
        yMax: 0
    };
    let nodesMap = {};
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
        nodesMap[node.id] = node;
    }
    return {
        type: "end",
        nodes: nodes,
        links: links,
        bounds: bounds,
        nodesMap:nodesMap,
        layoutType: data.layoutType
    };
}