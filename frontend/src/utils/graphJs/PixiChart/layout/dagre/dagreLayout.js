/*
 * @Author: huangyixin
 * @Date: 2021-12-08 10:16:09
 * @LastEditors: huangyixin
 * @LastEditTime: 2021-12-08 21:35:45
 * @Description: In User Settings Edit
 * @FilePath: /KMP4/src/utils/graphJs/PixiChart/layout/dagre/dagreLayout.js
 */
import dagre from 'dagre';

var defaults = {
	// the separation between adjacent nodes in the same rank
  	rankDir: undefined,
  	// Alignment for rank nodes. Can be UL, UR, DL, or DR, where U = up, D = down, L = left, and R = right.
	align:undefined,
  	// dagre algo options, uses default value on undefined
  	nodeSep: undefined,
  	// the separation between adjacent nodes in the same rank
  	edgeSep: undefined,
  	// the separation between adjacent edges in the same rank
  	rankSep: undefined,
  	// If set to greedy, uses a greedy heuristic for finding a feedback arc set for a graph. A feedback arc set is a set of edges that can be removed to make a graph acyclic.
  	acyclicer: undefined,
	// 'TB' for top to bottom flow, 'LR' for left to right,
	ranker: undefined,
  	// Type of algorithm to assigns a rank to each node in the input graph.
  	// Possible values: network-simplex, tight-tree or longest-path
  	minLen: function minLen(edge) {
    	return 1;
  	},
  	// number of ranks to keep between the source and target of the edge
  	edgeWeight: function edgeWeight(edge) {
    	return 1;
  	},
};

/**
 * 
 * @param {*} graphData  结构
 *                 { 
 *                      nodes:[ { id,label,width,height } ],
 *                      edges:[ { source,target } ] 
 *                 }
 * @param {*} opt 
 * @returns 
 */
export default function dagreLayout(graphData,opt){
	
	const options = Object.assign({}, defaults, opt);

    let nodes = graphData.nodes,
        edges = graphData.edges;

	// Create a new directed graph 
	var g = new dagre.graphlib.Graph({
	    // multigraph: true
	});

	// Set an object for the graph label
	var gObj = {};

	setGObj('nodesep', options.nodeSep);
	setGObj('edgesep', options.edgeSep);
	setGObj('ranksep', options.rankSep);
	setGObj('rankdir', options.rankDir);
	setGObj('ranker', options.ranker);
	setGObj('align', options.align);
	setGObj('acyclicer', options.acyclicer);
	g.setGraph(gObj);

	// Default to assigning a new object as a label for each new edge.
	g.setDefaultEdgeLabel(function() { return {}; });

	g.setDefaultNodeLabel(function () {
	    return {};
	}); 

	// add node to graphlib
	for(let i = 0; i<nodes.length; i++){
		let node = nodes[i];
		g.setNode(node.id, { label: node.label || node.id,  width: node.width, height: node.height });
	}

	// add edge to graphlib
	for(let i = 0; i<edges.length; i++){
		let edge = edges[i];
		g.setEdge(edge.source,edge.target,{
		    minlen: getVal(edge, options.minLen),
		    weight: getVal(edge, options.edgeWeight),
		    name: edge.id || `${edge.source},${edge.target}`
	    });
	}

	dagre.layout(g,options);

	let coordinate = {},
		controlPoint = {};
	g.nodes().forEach(function(v) {
	    let {x,y} = g.node(v);
	    coordinate[v] = {x,y};
	});
	// g.edges().forEach(function(e) {
	// 	console.log(e);
	//     console.log("Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(g.edge(e)));
	// });
	function getVal(ele, val) {
	    return typeof val === 'function' ? val.apply(ele, [ele]) : val;
	};

	function setGObj(name, val) {
	    if (val != null) {
	      	gObj[name] = val;
	    }
	};

	return coordinate;
}