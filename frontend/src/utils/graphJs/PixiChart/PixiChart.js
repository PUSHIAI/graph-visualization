/*
 * @Descripttion:
 * @version:
 * @Author: shifangwang
 * @Date: 2020-09-17 15:57:32
 * @Feature:
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-04-14 15:01:41
 * @FilePath: /GraphInsight/src/utils/graphJs/PixiChart/PixiChart.js
 */
import * as PIXI from "pixi.js";
import * as d3 from "d3";
import addWheelListener from "./addWheelListener";
import layoutWorker from "./layout/layout.worker.js";
import "./addInteractionEvent";
import {
    zoomParam,
    nodeParam,
    linkParam,
    textParam,
    triangleParam,
    HIDESCALE,
    defaultParam,
    layoutParam,
    WORLDALPHA,
    selectRectParam
} from "./defaultParam";
import { isEmpty, arrayDeduplication } from "./utils/common";
import { show_message } from '@/utils/message';
export default class PixiChart {
    constructor(options) {
        this.init(options);
    }
    init(options){
        console.log("options:", options);
        this.loadTexture().then(() => {
            // 加载纹理回调
            // PIXI.Mesh.BATCHABLE_SIZE = 200;
            PIXI.GRAPHICS_CURVES.adaptive = false;
            this.graphOptions = options;
            const pixiBox = document.getElementById(options.id),
                app = new PIXI.Application({
                    backgroundColor: 0xf6f9fa,
                    antialias: true, //抗锯齿
                    width: options.width || defaultParam.DEFAULTSCREENWIDTH,
                    height: options.height || defaultParam.DEFAULTSCREENHEIGHT,
                    resolution: window.devicePixelRatio,
                    autoDensity: true,
                    resizeTo: pixiBox,
                    preserveDrawingBuffer: true
                }),
                vm = this;
    
            if (!pixiBox) return;
    
            app.render(); // 解决黑屏闪烁问题
            app.renderer.plugins.interaction.interactionFrequency = 100;
            pixiBox.appendChild(app.view);
    
            this.graphId = options.id;
            this.nodeEvents = options.nodeEvents;
            this.linkEvents = options.linkEvents;
            this.graphEvents = options.graphEvents;
    
            this.nodesId = new Set();
            this.selectedNode = [];
            this.lastNodes = [];
            this.viewAttr = {
                width: app.view.width / window.devicePixelRatio,
                height: app.view.height / window.devicePixelRatio
            };
            this.zoomTimeInfo = {
                timeId: 0,
                intervalTime: 500,
                textId: 0,
            };
            this.stageDirty = false;
            this.isPermitText = false;
            this.countText = 0;
            this.cullList = [];
            this.cullOptions = {
                cullIgnoreChildren: false,
                hideLink: false
            }
    
            this.controlKey = undefined;
            this.nodeOpLock = false;
            this.nodeDragging = '';
    
            this.pointerCoordinate = {
                x: this.viewAttr.width / 2,
                y: this.viewAttr.height / 2
            };
    
            // 缓存数据 用于撤销/重做
            this.cacheStack = {
                content: [],
                index: -1
            }
    
            this.nodeAddKey = {
                dataLinks: [],
                linkCount: {},
                community: ''
            }
            this.leaderArr = [];
    
            //node内置属性
            this.nodeDefaultAttributes = ['community', 'dataLinks', 'index', 'linkCount', 'needUpdate', 'vx', 'vy', 'x', 'y'];
            //link内置属性
            this.linkDefaultAttributes = ['index'];
    
            // 赋值布局，默认力导向
            this.layoutParam = this.graphOptions.layout || layoutParam;
            this.firstRender = true;
            this.maxNodeSize = 1;

            this.repeatNumber = {
                node: 0,
                link: 0
            }

            this.nodeMultipleType = "multiple";
    
            app.renderer.on("resize", function (screenWidth, screenHeight) {
                console.log("resize");
                vm.pixiChart.render(); // 解决黑屏闪烁问题
                vm.setCull();
                vm.viewAttr = {
                    width: app.view.width / window.devicePixelRatio,
                    height: app.view.height / window.devicePixelRatio
                };
            });
    
            // 启动布局线程
            this.startLayoutWorker();
    
            // 避免js线程阻塞GUI线程 造成页面卡顿
            requestAnimationFrame(() => {
                this.pixiChart = app;
                this.initGraph(options.graphData);
            });
        });
    }
    startLayoutWorker() {
        let vm = this;
        this.layoutWorker = new layoutWorker();
        this.layoutWorker.onmessage = function (event) {
            if (event.data.type == "end") {
                console.log("event:", event);
                vm.updateFilters();
                vm.transformLayoutAnimation(event.data);
                vm.pixiChart.stage.emit('layoutEnd');
            }
        };
    }
    // 初始化图谱
    initGraph(graphData) {
        this.initContainer();
        this.initKeyBoradEvent();
        // this.loadTextFont();
        this.initStage();
        if(graphData.nodes.length > 0){
            this.drawData(graphData);
            // this.applyLayout(this.layoutParam.name);
        }
    }
    drawData(graphData, isCacheStack = true) {
        let vm = this,
            stage = vm.pixiChart.stage,
            nodeContainer = stage.getChildByName("nodeContainer"),
            nodesLength = graphData.nodes.length,
            originNodesLength = nodeContainer.children.length,
            linkContainer = this.pixiChart.stage.getChildByName("linkContainer"),
            linksLength = graphData.links.length,
            originLinksLength = linkContainer.children.length,
            oldData = this.exportData(), //图中可视数据
            oldNodeIds = oldData.nodes.map(e => e.id) || [],  //旧点的id
            oldLinkIds = oldData.links.map(e => e.id) || [],  //旧线的id
            nodeMap = {};

        //如果画布中没有节点，当做第一次画图。
        if(oldNodeIds.length == 0){
            this.firstRender = true;
        }

        // 后续考虑统一调整暴露的事件。
        stage.emit('startDrawElement');

        this.repeatNumber = {
            node: 0,
            link: 0
        };

        // 已有节点
        let oldNodeMap = {};
        for(let oldNode of nodeContainer.children){
            oldNodeMap[oldNode.data.id] = oldNode.data;
        }
        // 新增的节点
        const newNodes = graphData.nodes.filter(item => {
            item.x = item.x || this.pointerCoordinate.x;
            item.y = item.y || this.pointerCoordinate.y;
            nodeMap[item.id] = item;
            if (oldNodeIds.indexOf(item.id) != -1) {
                this.repeatNumber.node++;
            }
            return oldNodeIds.indexOf(item.id) == -1;
        });

        // 新增的关系
        const newLinks = graphData.links.filter(item => {
            // 判断是id还是对象
            let source = !isEmpty(item.source.id) ? item.source.id : item.source,
            target = !isEmpty(item.target.id) ? item.target.id : item.target;
            item.source = oldNodeMap[source] || nodeMap[source];
            item.target = oldNodeMap[target] || nodeMap[target];

            item.source.needUpdate = true;
            item.target.needUpdate = true;

            if (oldLinkIds.indexOf(item.id) != -1) {
                this.repeatNumber.link++;
            }

            return oldLinkIds.indexOf(item.id) == -1;
        });
        // 1. drawNodes->callback->drawLinks->callback->layout
        //                    2. |->layout
        if (newNodes.length != 0) {
            // 绘制node回调
            nodeContainer.on("nodeDrawing", function(currentNodeIndex) {
                // 绘制node结束
                if(nodesLength - vm.repeatNumber.node == currentNodeIndex - originNodesLength + 1) {
                    console.log("finishNodeDrawing");
                    this.off("nodeDrawing");
                    // 绘制link
                    if (newLinks.length != 0) {
                        linkContainer.on("linkDrawing", function(currentLinkIndex) {
                            if(linksLength - vm.repeatNumber.link == currentLinkIndex - originLinksLength + 1) {
                                console.log("finishLinkDrawing");
                                
                                if (isCacheStack) {
                                    vm.inStack({ nodes: newNodes, links: newLinks, type: 'add' });
                                }
            
                                stage.emit('endDrawElement');
            
                                vm.applyLayout();
            
                                this.off("linkDrawing");
                            }
                        })
                        vm.initLink(newLinks, true);
                    } else {
                        if (isCacheStack) {
                            vm.inStack({ nodes: newNodes, links: newLinks, type: 'add' });
                        }

                        stage.emit('endDrawElement');
                        
                        vm.applyLayout();
                    }
                }
            });
            // 绘制新节点
            vm.initNodes(newNodes);
        } else if (newLinks.length != 0) {
            // 3. drawLink->callback->layout
            // 绘制link回调
            linkContainer.on("linkDrawing", function(currentLinkIndex) {
                if(linksLength - vm.repeatNumber.link == currentLinkIndex - originLinksLength + 1) {
                    console.log("finishLinkDrawing");
                    
                    if (isCacheStack) {
                        vm.inStack({ nodes: newNodes, links: newLinks, type: 'add' });
                    }

                    stage.emit('endDrawElement');

                    vm.applyLayout();

                    this.off("linkDrawing");
                }
            })
            // 绘制新link
            vm.initLink(newLinks, true);
        } else {
            this.applyLayout();
            stage.emit('endDrawElement');
        }
    }
    // 加载基础纹理
    async loadTexture() {
        !PIXI.utils.TextureCache.cacheCircleBox && PIXI.Texture.fromLoader(require('@/assets/graph/graphics/circle.svg'), 'cacheCircleBox');
        !PIXI.utils.TextureCache.nodeBorder && PIXI.Texture.fromLoader(require('@/assets/graph/graphics/border.svg'), 'nodeBorder');
        !PIXI.utils.TextureCache.triangle && PIXI.Texture.fromLoader(require('@/assets/graph/graphics/triangle.svg'), 'triangle')
        const loader = PIXI.Loader.shared;
        return new Promise((resolve) => {
            loader
                .load((loader, resources) => {
                    console.log("loader:", loader);
                    console.log("resources:", resources);
                    resolve();
                })
        })
        // console.log("TextureCache", PIXI.utils.TextureCache);

        // 缓存圆形
        // let circleBox = new PIXI.Graphics();
        // circleBox.beginFill(0xffffff);
        // circleBox.drawCircle(0, 0, nodeParam.NODE_RADIUS);
        // circleBox.endFill();
        // circleBox = vm.pixiChart.renderer.generateTexture(circleBox, PIXI.settings.SCALE_MODES, window.devicePixelRatio);
        // PIXI.Texture.addToCache(circleBox, "cacheCircleBox");

        // 缓存边框
        // let border = new PIXI.Graphics();
        // border.lineStyle(nodeParam.NODE_BORDER_WIDTH, nodeParam.NODE_BORDER_COLOR);
        // border.drawCircle(0, 0, (nodeParam.NODE_RADIUS/2 + nodeParam.NODE_BORDER_WIDTH)*1);
        // border = this.pixiChart.renderer.generateTexture(border, PIXI.settings.SCALE_MODES, window.devicePixelRatio);
        // PIXI.Texture.addToCache(border, "nodeBorder");

        // 绘制三角箭头 Graphics -> texture
        // let triangle = new PIXI.Graphics();
        // triangle.beginFill(0xffffff);
        // triangle.moveTo(-triangleParam.TRIANGLEWIDTH, triangleParam.TRIANGLEWIDTH);
        // triangle.lineTo(-triangleParam.TRIANGLEWIDTH, -triangleParam.TRIANGLEWIDTH);
        // triangle.lineTo(triangleParam.TRIANGLEWIDTH, 0);
        // triangle.lineTo(-triangleParam.TRIANGLEWIDTH, triangleParam.TRIANGLEWIDTH);
        // triangle.endFill();
        // triangle = this.pixiChart.renderer.generateTexture(triangle, PIXI.settings.SCALE_MODES, window.devicePixelRatio);
        // PIXI.Texture.addToCache(triangle, "triangle");
    }
    // 载入字体文件 中文字符\u4e00-\ufa29 由于中文字符过多 第一次载入会卡顿
    loadTextFont() {
        PIXI.BitmapFont.from("nodeLabelFont", {}, {
            chars: [['A', 'Z'], ['0', '9'], ['\u4e00', '\ufa29']],
            resolution: window.devicePixelRatio
        });
        PIXI.BitmapFont.from("linkLabelFont", {}, {
            chars: [['A', 'Z'], ['0', '9'], ['\u4e00', '\ufa29']],
            resolution: window.devicePixelRatio
        });
    }
    initContainer() {
        const stage = this.pixiChart.stage;
        stage.children = [];
        /** node相关容器 */
        // 节点容器
        const nodeContainer = new PIXI.Container();
        nodeContainer.name = "nodeContainer";
        nodeContainer.zIndex = 20;
        nodeContainer.on("childAdded", function (event, container, index) {
            this.emit("nodeDrawing", index);
        });
        nodeContainer.sortableChildren = true;
        // 社区切分容器
        const communityContainer = new PIXI.Container();
        communityContainer.name = "communityContainer";
        communityContainer.interactiveChildren = false;
        communityContainer.zIndex = -10;

        stage.addChild(nodeContainer);
        stage.addChild(communityContainer);

        /** link相关容器 */
        // link容器
        const linkContainer = new PIXI.Container();
        linkContainer.name = "linkContainer";
        linkContainer.on("childAdded", function (event, container, index) {
            this.emit("linkDrawing", index);
        });
        linkContainer.sortableChildren = true;

        stage.addChild(linkContainer);

        this.addCullList();
    }
    // 初始化node加入画布
    initNodes(nodes) {
        const startTime = performance.now(), nodesLength = nodes.length;
        console.log(">-------startDrawNode--------<");
        for (let i = 0; i < nodesLength; i++) {
            this.drawNodeContainer(nodes[i]);
        }
        console.log(">-------endDrawNode--------<", performance.now() - startTime);
    }
    // 初始化link加入画布
    initLink(links, noLength = false) {
        const startTime = performance.now(), linksLength = links.length;
        console.log(">--------startDrawLink--------<");
        for (let i = 0; i < linksLength; i++) {
            this.drawLinkContainer(links[i], noLength);
        }
        console.log(">-------endDrawLink--------<", performance.now() - startTime);
    }
    // 初始化stage
    initStage() {
        const stage = this.pixiChart.stage,
            vm = this;
        let pressId = null,
            prevX,
            prevY;
        // 更新stage活动区域
        stage.hitArea = this.getVisibleBounds();
        // 层级生效
        stage.sortableChildren = true;
        stage.interactive = true;
        // 长按后的cursor
        this.pixiChart.renderer.plugins.interaction.cursorStyles.press = "crosshair";
        stage
            .on("mousedown", function (event) {
                // console.log("globalPosition:", this.getGlobalPosition());
                console.log("app:", vm.pixiChart);
                console.log("texture:", PIXI.utils.TextureCache);
                stage.interactiveChildren = false;
                const pos = event.data.global;
                prevX = pos.x;
                prevY = pos.y;
                vm.setCull();
                // 判断是否为长按
                pressId = setTimeout(() => {
                    this.isPress = true;
                    this.cursor = "press";
                    const selectRect = new PIXI.Graphics();
                    selectRect.name = "selectRect";
                    this.addChild(selectRect);
                }, 300);

                vm.pointerCoordinate = {
                    x: this.x,
                    y: this.y
                };

                this.isClear = true;

                this.on("mousemove", function (event) {
                    pressId && clearTimeout(pressId);
                    pressId = null;
                    this.isClear = false;
                    if (this.isPress) {
                        // 绘制选择框
                        const selectRect = this.getChildByName("selectRect"),
                            pos = event.data.global,
                            originX = (prevX - stage.x) / stage.scale.x,
                            originY = (prevY - stage.y) / stage.scale.y,
                            rectWidth = (pos.x - prevX) / stage.scale.x,
                            rectHeight = (pos.y - prevY) / stage.scale.y;
    
                        selectRect.clear();
                        selectRect.lineStyle(1 / this.scale.x, selectRectParam.BORDERCOLOR);
                        selectRect.beginFill(selectRectParam.BACKGROUNDCOLOR, selectRectParam.BACKGROUNDALPHA);
                        selectRect.drawRect(originX, originY, rectWidth, rectHeight);
    
                        return;
                    }
    
                    const pos = event.data.global;
                    const dx = pos.x - prevX;
                    const dy = pos.y - prevY;
    
                    this.position.x += dx;
                    this.position.y += dy;
    
                    prevX = pos.x;
                    prevY = pos.y;
    
                    vm.setCull();
                })
            })          
            .on("mouseup", function (event) {
                stage.interactiveChildren = true;
                if (this.isClear && !this.isPress) {
                    vm.clearStageStyle();
                    this.isClear = false;
                }
                // 框选结束后才获取框选元素
                if (this.isPress) {
                    // 绘制选择框
                    const selectRect = this.getChildByName("selectRect"),
                    pos = event.data.global,
                    nodeContainer = this.getChildByName("nodeContainer").children,
                    originX = (prevX - stage.x) / stage.scale.x,
                    originY = (prevY - stage.y) / stage.scale.y,
                    rectWidth = Math.abs((pos.x - prevX) / stage.scale.x),
                    rectHeight = Math.abs((pos.y - prevY) / stage.scale.y),
                    rectX = pos.x - prevX > 0 ? originX : originX + rectWidth,
                    rectY = pos.y - prevY > 0 ? originY : originY + rectHeight,
                    selectNode = [];
    
                    selectRect.clear();
                    selectRect.lineStyle(1 / this.scale.x, selectRectParam.BORDERCOLOR);
                    selectRect.beginFill(selectRectParam.BACKGROUNDCOLOR, selectRectParam.BACKGROUNDALPHA);
                    selectRect.drawRect(originX, originY, rectWidth, rectHeight);
    
                    for (let i = nodeContainer.length - 1; i > -1; i--) {
                        let item = nodeContainer[i];
                        if (item.visible) {
                            const isSelect =
                                item.cullObj.x + item.cullObj.width > rectX &&
                                item.cullObj.x < rectX + rectWidth &&
                                item.cullObj.y + item.cullObj.height > rectY &&
                                item.cullObj.y < rectY + rectHeight,
                                selectedBorder = item.getChildByName("border");
                            if (isSelect) {
                                if (!selectedBorder) vm.setSelection(item.data.id, "node", { instance: item, stopEmitSelection: true });
                            } else {
                                if (selectedBorder) {
                                    vm.selectedNode.splice(vm.selectedNode.indexOf(item.data.id), 1);
                                    item.removeChild(selectedBorder);
                                }
                            }
                            if (vm.selectedNode.indexOf(item.data.id) != -1) {
                                selectNode.push(item);
                            }
                        }
                    }

                    vm.emitOnSelectionChange();
    
                }
                // 取消框选
                pressId && clearTimeout(pressId);
                pressId = null;
                this.isPress = false;
                this.cursor = "default";
                this.removeChild(this.getChildByName("selectRect"));

                vm.isPermitText = true;
                vm.setCull();

                this.off("mousemove");
            })
            .on("mouseupoutside", function () {
                this.dragging = false;
                stage.interactiveChildren = true;
            });

        for (const i in vm.graphEvents) {
            stage.on(i, vm.graphEvents[i]);
        }
        stage.emit("onDataUpdated");
        // stage鼠标滚轮事件
        addWheelListener(this.pixiChart.renderer.view, function (e) {
            // 阻止默认行为
            e.preventDefault && e.preventDefault();
            // deltaY向下滚动为正 向上为负 否则为0
            const isZoomIn = e.deltaY < 0;
            if (!(stage.scale.x > zoomParam.ZOOM_MAX && isZoomIn) && !(stage.scale.x < zoomParam.ZOOM_MIN && !isZoomIn)) {
                vm.stageZoom(e.offsetX, e.offsetY, isZoomIn);
            }
        });
    }
    // 初始化画布scale
    initScale() {
        const stage = this.pixiChart.stage,
            nodeBounds = this.getNodeLocalBounds(),
            scaleX = isFinite(this.viewAttr.width / nodeBounds.width) ? this.viewAttr.width / nodeBounds.width : this.viewAttr.width / (stage.width / stage.scale.x),
            scaleY = isFinite(this.viewAttr.height / nodeBounds.height) ? this.viewAttr.height / nodeBounds.height : this.viewAttr.height / (stage.height / stage.scale.y),
            thresholdScale = 1.5,
            // scaleX = this.viewAttr.width / (stage.width / stage.scale.x),
            // scaleY = this.viewAttr.height / (stage.height / stage.scale.y),
            targetScale = Math.min(scaleX, scaleY),
            vm = this;
        let i = Math.min(stage.scale.x, stage.scale.y);
        // 根据画布中的实际元素数量调整scale 使得画布能显示出所有元素
        const zoomOut = function () {
            i = Math.min(stage.scale.x, stage.scale.y);
            if (i > targetScale / thresholdScale) {
                //画布放不下元素
                vm.stageZoom(vm.viewAttr.width / 2, vm.viewAttr.height / 2, false);
            } else {
                vm.pixiChart.stage.emit("onDataUpdated");
                vm.pixiChart.ticker.remove(zoomOut);
                // zoomParam.ZOOM_MIN = i;
            }
        };
        const zoomIn = function () {
            i = Math.min(stage.scale.x, stage.scale.y);
            if (i < targetScale / thresholdScale) {
                vm.stageZoom(vm.viewAttr.width / 2, vm.viewAttr.height / 2, true);
            } else {
                vm.pixiChart.stage.emit("onDataUpdated");
                vm.pixiChart.ticker.remove(zoomIn);
            }
        };
        this.setCull();
        if (i > targetScale / thresholdScale) {
            this.pixiChart.ticker.add(zoomOut);
        } else if (i < targetScale / thresholdScale) {
            this.pixiChart.ticker.add(zoomIn);
        }
    }
    /**
     * @method: 缩放事件
     * @for: 
     * @param {*} x 当前鼠标的横坐标
     * @param {*} y 当前鼠标的纵坐标
     * @param {*} isZoomIn 放大或缩小的flag false为缩小 true为放大
     * @param {*} stepScale 每次缩放的倍数
     * @return {*}
     */
    stageZoom(x, y, isZoomIn, stepScale = 0.05) {
        let zoomRafId = null;
        if (zoomRafId) return;
        zoomRafId = requestAnimationFrame(() => {

            const direction = isZoomIn ? 1 : -1,
                newScale = 1 + direction * stepScale,
                stage = this.pixiChart.stage,
                worldPos = {
                    x: (x - stage.x) / stage.scale.x,
                    y: (y - stage.y) / stage.scale.y
                },
                newScreenPos = {
                    x: (worldPos.x) * stage.scale.x * newScale + stage.x,
                    y: (worldPos.y) * stage.scale.y * newScale + stage.y
                };
            stage.x += (x - newScreenPos.x);
            stage.y += (y - newScreenPos.y);

            // 设置缩放倍数
            stage.scale.set(stage.scale.x * newScale, stage.scale.y * newScale);

            // 如果放大的话 进行防抖动
            if (this.zoomTimeInfo.timeId) clearTimeout(this.zoomTimeInfo.timeId);
            if (isZoomIn) {
                this.zoomTimeInfo.timeId = setTimeout(() => {
                    this.setCull();
                }, this.zoomTimeInfo.intervalTime);
            } else {
                this.setCull();
            }

            // 渲染文字防抖动
            if (this.zoomTimeInfo.textId) clearTimeout(this.zoomTimeInfo.textId);
            this.zoomTimeInfo.textId = setTimeout(() => {
                this.isPermitText = true;
                this.setCull();
            }, this.zoomTimeInfo.intervalTime);
            
            zoomRafId = null;

            // 处理文字和图片隐藏
            // this.hideElement(stage.scale.x);
        });
    }
    hideElement(scale){
        if(20 > nodeParam.NODE_RADIUS*scale){
            const nodeContainer = this.pixiChart.stage.getChildByName("nodeContainer");
            for (let i = nodeContainer.children.length - 1; i > -1; i--) {
                const item = nodeContainer.children[i];
                item.getChildByName("textu").visible = false;
            }
        }else{
            const nodeContainer = this.pixiChart.stage.getChildByName("nodeContainer");
            for (let i = nodeContainer.children.length - 1; i > -1; i--) {
                const item = nodeContainer.children[i];
                item.getChildByName("textu").visible = true;
            }
        }
    }
    // 初始化dagre布局
    applyDagreLayout() {
        let { nodes, links } = this.exportData(),
            message = {
                nodes: nodes || [],
                links: links || [],
                layoutType: 'dagre',
                nodeSize: this.maxNodeSize * nodeParam.NODE_RADIUS,
            };
        this.layoutWorker.postMessage(message);
        this.pixiChart.stage.emit('layoutStart');
    }
    // 使用webworker计算布局 防止大计算量阻塞主线程
    applyForceLayout() {
        let { nodes, links } = this.exportData(false, ['x', 'y', 'vx', 'vy', 'dataLinks']),
            message = {
                nodes: nodes || [],
                links: links || [],
                width: this.viewAttr.width,
                height: this.viewAttr.height,
                tick: 30,
                nodeSize: this.maxNodeSize,
                layoutType: 'force'
            };
        this.layoutWorker.postMessage(message);
        this.pixiChart.stage.emit('layoutStart');
    }
     // 应用矩阵布局
    applyGridLayout() {
        let nodes = this.exportData().nodes,
            message = {
                nodes: nodes || [],
                width: this.viewAttr.width,
                height: this.viewAttr.height,
                nodeSize: this.maxNodeSize * nodeParam.NODE_RADIUS,
                layoutType: 'grid'
            };
        this.layoutWorker.postMessage(message);
        this.pixiChart.stage.emit('layoutStart');
    }
    // 根据id获取node 为了兼容zoomchart版本
    getNode(id) {
        return this.getObjectById(id, "node");
    }
    // 根据id获取对象
    getObjectById(id, type) {
        if (Array.isArray(id) && id.length == 1) id = id[0];
        if (this.pixiChart.stage && this.pixiChart.stage.getChildByName(`${type}Container`)) {
            return this.pixiChart.stage.getChildByName(`${type}Container`).getChildByName(id) || {};
        } else {
            return {};
        }
    }
    /**
     * @method: 设置元素属性
     * @for: 
     * @param {*} id 元素id
     * @param {*} key 属性key或者key-value对象
     * @param {*} value 属性value
     * @param {*} type 元素类型
     * @return {*}
     */    
    setElementAttr(id, key, value, type = 'node') {
        let data = this.getObjectById(id, type).data.attributeList;
        if (arguments[1] instanceof Object) {
            for (let k in key) {
                let isNew = true;
                for (let i = 0; i < data.length; i++) {
                    if (data[i].name == k) {
                        isNew = false;
                        data[i].value = key[k];
                    }
                }
                isNew && data.push({
                    name: k,
                    value: key[k]
                });
            }
        } else {
            let isNew = true;
            for (let i = 0; i < data.length; i++) {
                if (data[i].name == key) {
                    isNew = false;
                    data[i].value = value;
                }
            }
            isNew && data.push({
                name: key,
                value
            });
        }
        this.pixiChart.stage.emit("onDataUpdated");
    }
    deleteElementAttr(id, key, type = 'node') {
        let data = this.getObjectById(id, type).data.attributeList;
        if (arguments[1] instanceof Object) {
            for (let k in key) {
                let index = -1;
                for (let i = 0; i < data.length; i++) {
                    if (data[i].name == k) {
                        index = i;
                        break;
                    }
                }
                data.splice(index, 1);
            }
        } else {
            let index = -1;
            for (let i = 0; i < data.length; i++) {
                if (data[i].name == key) {
                    index = i;
                    break;
                }
            }
            data.splice(index, 1);
        }
        this.pixiChart.stage.emit("onDataUpdated");
    }
    /**
     * @method: 绘制node的边框 hover时展示
     * @for: 
     * @param {*} node 需要绘制的节点
     * @return {*}
     */
    drawNodeBorder(node) {
        if (Object.keys(node).length == 0) return;
        if (!node.getChildByName("border")) {
            let borderTexture = PIXI.utils.TextureCache.nodeBorder,
            border = new PIXI.Sprite(borderTexture);
            border.name = "border";
            border.visible = false;
            border.anchor.set(0.5, 0.5);
            node.addChild(border);
            return border;
        } else {
            return node.getChildByName("border");
        }
    }
    /**
     * @method: 绘制node实例
     * @for: 
     * @param {*} data node的data数据
     * @return {*}
     */
    drawNodeContainer(data) {
        const vm = this,
            nodeContainer = this.pixiChart.stage.getChildByName("nodeContainer"),
            linkContainer = this.pixiChart.stage.getChildByName("linkContainer");

        if (nodeContainer.getChildByName(data.id)) return;

        this.nodesId.add(data.id);
        // 获取节点样式
        let nodeStyle = this.getNodeStyle(this.graphOptions.nodeStyleFunction, data, true);
        // 绘制图标
        let nodeTexture;
        if (nodeStyle.icon) {
            let iconUrl = nodeStyle.icon;
            if (!PIXI.utils.TextureCache[iconUrl]) {
                if (iconUrl) {
                    nodeTexture = PIXI.Texture.fromLoader(iconUrl, iconUrl);
                } else {
                    if (!PIXI.utils.TextureCache.default) {
                        nodeTexture = PIXI.Texture.fromLoader(iconUrl, 'default');
                    } else {
                        nodeTexture = PIXI.utils.TextureCache.default;
                    }
                }
            } else {
                nodeTexture = PIXI.utils.TextureCache[iconUrl];
            }
        }

        const drawIcon = function () {
            let circleTexture = PIXI.utils.TextureCache.cacheCircleBox,
            circleBox = new PIXI.Sprite(circleTexture);
            circleBox.x = data.x;
            circleBox.y = data.y;
            circleBox.tint = nodeStyle.color || nodeParam.NODE_COLOR;
            circleBox.width = nodeParam.NODE_RADIUS;
            circleBox.height = nodeParam.NODE_RADIUS;
            circleBox.originScale = Math.min(circleBox.width / circleTexture.width, circleBox.height / circleTexture.height);

            circleBox.anchor.set(0.5, 0.5);
            circleBox.scale.set(circleBox.originScale * nodeStyle.size, circleBox.originScale * nodeStyle.size)
            circleBox.name = data.id;
            circleBox.data = data;
            circleBox.data.dataLinks = circleBox.data.dataLinks || [];
            circleBox.data.size = nodeStyle.size;
            circleBox.cacheData = {};
            circleBox.isNode = true;
            circleBox.interactive = true;
            circleBox.buttonMode = true;
            circleBox.interactiveChildren = false;
            circleBox.sortableChildren = true;

            // 绑定节点默认事件
            circleBox
                .on("pointerdown", function (event) {
                    event.stopPropagationHint = true;
                    vm.nodeDragging = this.data.name;
                    this.dragPoint = event.data.getLocalPosition(this.parent);
                    this.dragPoint.x -= this.x;
                    this.dragPoint.y -= this.y;

                    vm.pointerCoordinate = {
                        x: this.x,
                        y: this.y
                    };
                    vm.nodeOpLock = true;


                    vm.cacheNodeData(this);

                    this.isDragEvent = false;

                    this.on("pointermove", function (event) {
                        if (vm.nodeDragging == this.data.name) {
                            this.isDragEvent = true;
                            
                            const newPosition = event.data.getLocalPosition(this.parent),
                                lastX = this.x,
                                lastY = this.y;
                            // 改变node坐标
                            this.x = newPosition.x - this.dragPoint.x;
                            this.y = newPosition.y - this.dragPoint.y;
    
                            // 偏移量
                            const offsetX = this.x - lastX,
                                offsetY = this.y - lastY;
    
                            let selectedNodeCurrent = [...vm.selectedNode,this.data.id];
                            for (let i = selectedNodeCurrent.length - 1; i > -1; i--) {
                                let id = selectedNodeCurrent[i],
                                    item = vm.pixiChart.stage.getChildByName("nodeContainer").getChildByName(id);
                                if (item.data.id != this.data.id) {
                                    item.x += offsetX;
                                    item.y += offsetY;
                                }
                                // 重绘社区切分
                                const community = vm.getObjectById(item.data.community, "community");
                                if (community.data) {
                                    community.data.isChange = true;
                                }
                                vm.moveNodeEvent(item);
                            }
    
                            vm.redrawCommunity();
                        }
                    })
                    console.log("this:", this);
                    console.log("selectedNode:", vm.selectedNode);
                    // console.log("nodeBounds:", this.getLocalBounds());
                })
                .on("pointerup", function (event) {
                    event.stopPropagationHint = true;
                    if(this.isDragEvent == false){
                        vm.multipleSelectNodeEvent(event, this);
                    }

                    vm.nodeDragging = '';

                    vm.nodeOpLock = false;

                    this.off("pointermove");
                })
                .on("pointerupoutside", function () {
                    vm.nodeDragging = '';
                })
                .on("mouseover", function () {
                    this.zIndex = 10;
                    this.nodeMouseOver = true;
                    // 防止在拖拽node时 由于拖拽过快而导致鼠标hover到其他节点造成bug
                    if (!vm.nodeOpLock) {
                        // hover透明化
                        for (let i = 0; i < nodeContainer.children.length; i++) {
                            nodeContainer.children[i].alpha = WORLDALPHA;
                        }
                        for (let i = 0; i < linkContainer.children.length; i++) {
                            linkContainer.children[i].alpha = WORLDALPHA;
                        }
                        this.alpha = 1;

                        if (this.data.dataLinks) {
                            for (let i = this.data.dataLinks.length - 1; i > -1; i--) {
                                const item = this.data.dataLinks[i],
                                    link = (this.cacheData.linksGroup && this.cacheData.linksGroup[item.id]) ? this.cacheData.linksGroup[item.id].link : vm.pixiChart.stage.getChildByName("linkContainer").getChildByName(item.id),
                                    triangle = link.getChildByName("triangle"),
                                    source = vm.getLinkNodeInstance(item, this, "source"),
                                    target = vm.getLinkNodeInstance(item, this, "target");

                                link.alpha = 1;
                                link.zIndex = 10;
                                source.alpha = 1;
                                target.alpha = 1;

                                if (!link.isHighlight) {
                                    triangle.tint = linkParam.LINKHIGHLIGHT;
                                    link.tint = linkParam.LINKHIGHLIGHT;
                                }
                            }
                        }

                        let border = this.getChildByName("border");
                        if (!border) {
                            border = vm.drawNodeBorder(this);
                            border.isLock = false;
                        }
                        border.visible = true;

                        vm.drawText(this, true, true);

                        // 显示text
                        const nodeText = this.getChildByName("text"),
                            nodeTextBackground = this.getChildByName("textBackground"),
                            node = this;

                        this.scaleFunction && vm.pixiChart.ticker.remove(this.scaleFunction);
                        nodeText.isLock = true;
                        this.scaleFunction = function() {
                            const originFontsize = 1 / node.originScale * textParam.FONTSIZE,
                            scaleFontsize = 1 / node.originScale * textParam.SCALEFONTSIZE;
                            nodeText.visible = true;
                            nodeText.scale.set(Math.max(Math.max(1 / vm.pixiChart.stage.scale.x, 1 / vm.pixiChart.stage.scale.y) * scaleFontsize, originFontsize));

                            nodeTextBackground.visible = true;
                            nodeTextBackground.alpha = textParam.HIGHLIGHTTEXTBACKGROUNDALPHA;
                            nodeTextBackground.tint = textParam.HIGHLIGHTTEXTBACKGROUNDTINT;
                            nodeTextBackground.width = nodeText.width * textParam.LEVELPADDING;
                            nodeTextBackground.height = nodeText.height * textParam.VERTICALPADDING;
                        }
                        vm.pixiChart.ticker.add(this.scaleFunction);
                    }
                })
                .on("mouseout", function () {
                    this.zIndex = 0;
                    this.nodeMouseOver = false;
                    if (!vm.nodeOpLock) {
                        if (this.data.dataLinks) {
                            for (let i = this.data.dataLinks.length - 1; i > -1; i--) {
                                const item = this.data.dataLinks[i],
                                    link = (this.cacheData.linksGroup && this.cacheData.linksGroup[item.id]) ? this.cacheData.linksGroup[item.id].link : vm.pixiChart.stage.getChildByName("linkContainer").getChildByName(item.id),
                                    triangle = link.getChildByName("triangle");

                                link.zIndex = 0;

                                if (!link.isHighlight) {
                                    triangle.tint = link.linkStyle.color;
                                    link.tint = link.linkStyle.color;
                                }
                            }
                        }

                        let border = this.getChildByName("border");
                        (border && !border.isLock) ? border.visible = false : '';

                        // 恢复text
                        vm.pixiChart.ticker.remove(this.scaleFunction);
                        this.scaleFunction = null;

                        const nodeText = this.getChildByName("text"),
                            nodeTextBackground = this.getChildByName("textBackground");
                        nodeText.visible = this.getChildByName("icon").visible;
                        nodeText.scale.set(1 / this.originScale * textParam.FONTSIZE)
                        nodeText.isLock = false;

                        nodeTextBackground.visible = nodeText.visible;
                        nodeTextBackground.alpha = textParam.TEXTBACKGROUNDALPHA;
                        nodeTextBackground.tint = textParam.TEXTBACKGROUNDTINT;
                        nodeTextBackground.width = nodeText.width * textParam.LEVELPADDING;
                        nodeTextBackground.height = nodeText.height * textParam.VERTICALPADDING;

                        // 恢复hover透明化
                        for (let i = 0; i < nodeContainer.children.length; i++) {
                            nodeContainer.children[i].alpha = 1;
                        }
                        for (let i = 0; i < linkContainer.children.length; i++) {
                            linkContainer.children[i].alpha = 1;
                        }
                    }
                });
            for (const i in vm.nodeEvents) {
                circleBox.on(i, vm.nodeEvents[i]);
            }

            const sprite = new PIXI.Sprite(nodeTexture);
            sprite.height = nodeParam.NODE_RADIUS * nodeTexture.height / nodeTexture.width * nodeParam.ICONSCALE / circleBox.originScale;
            sprite.width = nodeParam.NODE_RADIUS * nodeParam.ICONSCALE / circleBox.originScale;
            sprite.x = -sprite.width / 2;
            sprite.y = -sprite.height / 2;
            sprite.name = "icon";
            sprite.visible = false;

            // const textBox = new PIXI.Text(data[nodeStyle.tag], {
            //     fill: '#41464a',
            //     fontSize: 40,
            // });
            // textBox.anchor.set(0.5, 0);
            // textBox.y = (nodeParam.NODE_RADIUS / 2) / circleBox.originScale - textBox.height * 0.5;
            // textBox.name = "text";
            // textBox.scale.set(textParam.FONTSIZE * (1 / circleBox.originScale));
            // textBox.visible = false;
            // textBox.zIndex = 20;

            // 绘制文本 耗时久 因为不同文本占用了不同的缓存
            // const textBox = new PIXI.BitmapText(data.name + "", {
            //   fontName: "nodeLabelFont"
            // });

            // const textBackground = new PIXI.Sprite(PIXI.Texture.WHITE);
            // textBackground.tint = textParam.TEXTBACKGROUNDTINT;
            // textBackground.anchor.set(0.5, (textParam.VERTICALPADDING - 1) / (textParam.VERTICALPADDING * 2));
            // textBackground.name = "textBackground";
            // textBackground.x = textBox.x;
            // textBackground.y = textBox.y;
            // textBackground.alpha = textParam.TEXTBACKGROUNDALPHA;
            // textBackground.width = textBox.width * textParam.LEVELPADDING;
            // textBackground.height = textBox.height * textParam.VERTICALPADDING;
            // textBackground.visible = false;
            // textBackground.zIndex = 10;

            circleBox.addChild(sprite);
            // circleBox.addChild(textBackground);
            // circleBox.addChild(textBox);
            nodeContainer.addChild(circleBox);
        };
        // 需要等纹理加载完毕 否则width和height会为1
        if (nodeTexture && nodeTexture.baseTexture.valid) {
            drawIcon();
        } else {
            nodeTexture && nodeTexture.baseTexture.on("update", () => {
                drawIcon();
            });
        }

        // 监听节点的坐标，节点移动时改变相关元素位置 可能有性能问题
        // Object.defineProperties(sprite.data, {
        //   x: {
        //     get: function() {
        //       return sprite.x;
        //     },
        //     set: function(val) {
        //       sprite.x = val;
        //     }
        //   },
        //   y: {
        //     get: function() {
        //       return sprite.y;
        //     },
        //     set: function(val) {
        //       sprite.y = val;
        //     }
        //   }
        // });
    }
    // 绘制/销毁nodeText
    drawNodeText(node, isLock) {
        if (node.getChildByName("text") && node.getChildByName("textBackground")) {
            return;
        }
        const nodeData = node.data,
        // 获取节点样式
        nodeStyle = this.getNodeStyle(this.graphOptions.nodeStyleFunction, nodeData, true);

        const textBox = new PIXI.Text(nodeData[nodeStyle.tag], {
            fill: '#41464a',
            fontSize: 40,
        });
        textBox.anchor.set(0.5, 0);
        textBox.y = (nodeParam.NODE_RADIUS / 2) / node.originScale - textBox.height * 0.5;
        textBox.name = "text";
        textBox.scale.set(textParam.FONTSIZE * (1 / node.originScale));
        textBox.zIndex = 20;
        textBox.isLock = isLock;

        const textBackground = new PIXI.Sprite(PIXI.Texture.WHITE);
        textBackground.tint = textParam.TEXTBACKGROUNDTINT;
        textBackground.anchor.set(0.5, (textParam.VERTICALPADDING - 1) / (textParam.VERTICALPADDING * 2));
        textBackground.name = "textBackground";
        textBackground.x = textBox.x;
        textBackground.y = textBox.y;
        textBackground.alpha = textParam.TEXTBACKGROUNDALPHA;
        textBackground.width = textBox.width * textParam.LEVELPADDING;
        textBackground.height = textBox.height * textParam.VERTICALPADDING;
        textBackground.zIndex = 10;

        node.addChild(textBackground);
        node.addChild(textBox);
        this.countText++;
    }
    getLinkNodeInstance(dataLink, node, type) {
        if (node && dataLink[type] == node.data.id) {
            return node;
        }
        if (node && node.cacheData.linksGroup && node.cacheData.linksGroup[dataLink.id]) {
            return node.cacheData.linksGroup[dataLink.id].node;
        } else {
            let item = this.getObjectById(dataLink[type], "node");
            return Object.keys(item).length == 0 ? undefined : item;
        }
    }
    // 移动node事件
    moveNodeEvent(node) {
        node.isChange = true;
        // 改变所连link坐标
        const linksLength = node.data.dataLinks.length;
        for (let i = 0; i < linksLength; i++) {
            const dataLink = node.data.dataLinks[i],
                source = this.getLinkNodeInstance(dataLink, node, 'source'),
                target = this.getLinkNodeInstance(dataLink, node, 'target');

            if (target == undefined || source == undefined) {
                continue;
            }

            const link = (node.cacheData.linksGroup && node.cacheData.linksGroup[dataLink.id]) ? node.cacheData.linksGroup[dataLink.id].link : this.getObjectById(dataLink.id, "link");
            if (link == undefined || Object.keys(link).length == 0) {
                continue;
            }
            let textBox = link.getChildByName("text"),
                triangle = link.getChildByName("triangle"),
                linkSize = link.linkStyle.size;
            if (source.data.id != target.data.id) {
                if (!link.bezierData) {
                    link.rotation = Math.atan2(target.y - source.y, target.x - source.x);
                    link.x = source.x + (source.width / 2 + nodeParam.PADDING) * Math.cos(link.rotation);
                    link.y = source.y + (source.height / 2 + nodeParam.PADDING) * Math.sin(link.rotation);
                    link.width = Math.max(Math.sqrt((source.x - target.x) ** 2 + (source.y - target.y) ** 2) - (source.width + target.width) / 2 - triangle.width * link.scale.x - nodeParam.PADDING * 2, 0);
                    link.hitArea = new PIXI.Rectangle(0, -link.height * 1 / link.scale.y * linkParam.HITAREASCALE, link.width * 1 / link.scale.x, link.height * 1 / link.scale.y * linkParam.HITAREASCALE * 2);

                    triangle.x = link.width / link.scale.x;

                    if (textBox) {
                        if (link.rotation - Math.PI < - Math.PI / 2 && link.rotation - Math.PI > -Math.PI * 1.5) {
                            textBox.rotation = -Math.PI * 2;
                        } else {
                            textBox.rotation = -Math.PI;
                        }
                        textBox.x = (link.width + triangleParam.TRIANGLEWIDTH) / 2 * 1 / link.scale.x;
                        textBox.y = -Math.cos(textBox.rotation) * textBox.height;
                    }

                } else {
                    this.redrawBezierCurve(link, source, target, {
                        width: linkParam.LINKWIDTH * linkSize,
                        color: 0xffffff
                    })
                }
            } else {
                link.x = source.x;
                link.y = source.y;

                if (textBox) {
                    textBox.x = -source.width / 2 - link.bezierData.number * source.width / 2;
                    textBox.y = -source.height / 2 - link.bezierData.number * source.height / 2;
                }

                triangle.x = -source.width / 2;
            }

            let linkScaleX = link.scale.x || 1,
            linkScaleY = link.scale.y || 1,
            textScaleX = 1 / linkScaleX * textParam.FONTSIZE * linkSize,
            textScaleY = 1 / linkScaleY * textParam.FONTSIZE * linkSize,
            triangleScaleX = 1 / linkScaleX * triangle.originScale.x * linkSize,
            triangleScaleY = 1 / linkScaleY * triangle.originScale.y * linkSize;
            textBox && textBox.scale.set(textScaleX, textScaleY);
            triangle.scale.set(triangleScaleX, triangleScaleY);

            link.isChange = true;
        }
    }
    /**
     * @method: 设置多选类型
     * @param {*} type 目前分为double和multiple
                       double为只能选取最后两个被选中的节点 用于消除只需要两个节点时的歧义
                       multiple为默认方式
     * @param {*} elementType
     */    
    setMultipleType(type, elementType = 'node') {
        this[`${elementType}MultipleType`] = type;
    }
    // 多选node事件
    multipleSelectNodeEvent(event, node) {
        let selectedBorder = node.getChildByName("border");
        if(!selectedBorder){
            selectedBorder = this.drawNodeBorder(node);
            selectedBorder.visible = true;
        }
        // 多选操作默认为ctrl + click
        if (event.data.originalEvent.ctrlKey) {
            if (selectedBorder.isLock) {
                this.selectedNode = this.selectedNode.filter(id => {
                    return id != node.data.id;
                });
                node.removeChild(selectedBorder);
            } else {
                if (this.nodeMultipleType == 'multiple') {
                    this.setSelection(node.data.id, "node", { instance: node });
                } else if (this.nodeMultipleType == 'double') {
                    const lastSelectedNode = this.selectedNode[0];
                    this.setSelection([lastSelectedNode, node.data.id], "node", { clearOthers: true });
                }
            }
        } else {
            if (!selectedBorder.isLock) {
                this.clearStageStyle();
                this.setSelection(node.data.id, "node", { instance: node });
                for (let linkId in node.cacheData.linksGroup) {
                    let link = node.cacheData.linksGroup[linkId].link,
                    triangle = link.getChildByName("triangle");
                    link.tint = linkParam.LINKHIGHLIGHT;
                    triangle.tint = linkParam.LINKHIGHLIGHT;
                }
            }
        }
    }
    // 多选link事件
    multipleSelectLinkEvent(event, link) {
        const nodeContainer = this.pixiChart.stage.getChildByName("nodeContainer"),
        linkTriangle = link.getChildByName("triangle"),
            source = nodeContainer.getChildByName(link.data.source.id),
            target = nodeContainer.getChildByName(link.data.target.id);
        // 多选操作默认为ctrl + click
        if (!event.data.originalEvent.ctrlKey) {
            this.clearStageStyle();
        }
        link.isHighlight = true;
        link.tint = linkParam.LINKHIGHLIGHT;
        linkTriangle.tint = linkParam.LINKHIGHLIGHT;
        this.setSelection(source.data.id, "node", { instance: source });
        this.setSelection(target.data.id, "node", { instance: target });
    }
    // 绘制link实例
    drawLinkContainer(data, noLength) {
        const source = data.source,
            target = data.target,
            nodeContainer = this.pixiChart.stage.getChildByName("nodeContainer"),
            linkContainer = this.pixiChart.stage.getChildByName("linkContainer");

        if (linkContainer.getChildByName(data.id)) return;

        // 判断该link的source和target是有效的
        if (!(source && target && this.nodesId.has(source.id) && this.nodesId.has(target.id))) {
            return;
        }
        // 节点需要更新data 这步操作是为了将节点中的data和link中的source和target产生对象引用关系
        // if (source.needUpdate) {
        //     const sourceNode = this.getObjectById(source.id, "node");
        //     source.needUpdate = false;
        //     for (let key in this.nodeAddKey) {
        //         source[key] = sourceNode.data[key];
        //     }
        //     sourceNode.data = source;
        // }
        // if (target.needUpdate) {
        //     const targetNode = this.getObjectById(target.id, "node");
        //     target.needUpdate = false;
        //     for (let key in this.nodeAddKey) {
        //         target[key] = targetNode.data[key];
        //     }
        //     targetNode.data = target;
        // }

        // 将link存入node所连接的边数组中
        const linkObj = {
            id: data.id,
            source: source.id,
            target: target.id,
            name: data.name,
            type: data.type
        };
        if (source.id != target.id) {
            source.dataLinks ? source.dataLinks.push(linkObj) : source.dataLinks = [linkObj];
            target.dataLinks ? target.dataLinks.push(linkObj) : target.dataLinks = [linkObj];
            !source.linkCount ? source.linkCount = {} : '';
            !target.linkCount ? target.linkCount = {} : '';
        } else {
            source.dataLinks ? source.dataLinks.push(linkObj) : source.dataLinks = [linkObj];
            !source.linkCount ? source.linkCount = {} : '';
        }

        const vm = this;

        // 获取线的样式
        let linkStyle = vm.getLinkStyle(vm.graphOptions.linkStyleFunction, data, true);
        linkStyle.size = Number(linkStyle.size);

        let triangleTexture = PIXI.utils.TextureCache.triangle,
        triangle = new PIXI.Sprite(triangleTexture);
        triangle.name = "triangle";
        triangle.tint = linkStyle.color;
        triangle.width = triangleParam.TRIANGLEWIDTH;
        triangle.height = triangleParam.TRIANGLEWIDTH;
        triangle.originScale = {
            x: triangle.width / triangleTexture.width, 
            y: triangle.width / triangleTexture.width
        };
        triangle.scale.set(triangle.scale.x * linkStyle.size, triangle.scale.y * linkStyle.size);
        triangle.anchor.set(0, 0.5);

        // 设置link上的文字
        // const textBox = new PIXI.Text(data.type, {
        //     fill: "#363b40",
        //     stroke: "#3a3a3a",
        // });
        // textBox.name = "text";
        // textBox.anchor.set(0.5);
        // textBox.scale.set(textParam.FONTSIZE, textParam.FONTSIZE);

        // const textBox = new PIXI.BitmapText(data.name + "", {
        //   fontName: "linkLabelFont"
        // });

        let link = null;

        // link有三种情况 1.直线、2.贝塞尔曲线、3.指向自身的曲线
        if (source.id != target.id) {
            // 这里需要判断是否有多条线在两点之间
            let isOnly = true;
            for (let i = 0; i < source.dataLinks.length; i++) {
                const link = source.dataLinks[i];
                if (link.id != data.id) {
                    if (link.source == source.id && link.target == target.id || link.source == target.id && link.target == source.id) {
                        isOnly = false;
                    }
                }
            }
            if (isOnly) {
                // 1.直线
                link = new PIXI.Sprite(PIXI.Texture.WHITE);
                link.width = noLength ? 0 : Math.sqrt((source.x - target.x) ** 2 + (source.y - target.y) ** 2) - nodeParam.NODE_RADIUS * 2 - triangleParam.TRIANGLEWIDTH - nodeParam.PADDING * 2;
                link.height = linkParam.LINKWIDTH * linkStyle.size;
                link.hitArea = new PIXI.Rectangle(0, -link.height * 1 / link.scale.y * linkParam.HITAREASCALE, link.width * 1 / link.scale.x, link.height * 1 / link.scale.y * linkParam.HITAREASCALE * 2);
                link.anchor.set(0, 0.5);
                link.rotation = Math.atan2(target.y - source.y, target.x - source.x);
                link.x = source.x + (nodeParam.NODE_RADIUS + nodeParam.PADDING) * Math.cos(link.rotation);
                link.y = source.y +(nodeParam.NODE_RADIUS + nodeParam.PADDING) * Math.sin(link.rotation);

                // 设置三角形箭头
                triangle.x = link.width / link.scale.x;

                // 设置文本
                // if (link.rotation - Math.PI < - Math.PI / 2 && link.rotation - Math.PI > -Math.PI * 1.5) {
                //     textBox.rotation = -Math.PI * 2;
                // } else {
                //     textBox.rotation = -Math.PI;
                // }
                // textBox.scale.set(1 / link.scale.x * textBox.scale.x, 1 / link.scale.y * textBox.scale.y);
                // textBox.x = (link.width + triangleParam.TRIANGLEWIDTH) / 2 * (1 / link.scale.x);

            } else {
                // 2.贝塞尔曲线
                // 记录特殊曲线
                source.linkCount[target.id] ? source.linkCount[target.id].multipleLink += 1 : source.linkCount[target.id] = {
                    multipleLink: 1,
                    selfLink: 0
                }
                target.linkCount[source.id] ? target.linkCount[source.id].multipleLink += 1 : target.linkCount[source.id] = {
                    multipleLink: 1,
                    selfLink: 0
                }

                const bezierCurve = new PIXI.Graphics(),
                    rotation = Math.atan2(target.y - source.y, target.x - source.x),
                    direction = (-1) ** source.linkCount[target.id].multipleLink * Math.ceil(source.linkCount[target.id].multipleLink * 0.5),
                    distance = Number(Math.sqrt(Math.pow(target.y - source.y, 2) + Math.pow(target.x - source.x, 2))),
                    hypotenuse = Number(distance / 8),
                    offsetX = -direction * hypotenuse * Math.sin(rotation),
                    offsetY = direction * hypotenuse * Math.cos(rotation),
                    cpX2 = (source.x + target.x) / 2 + offsetX,
                    cpY2 = (source.y + target.y) / 2 + offsetY,
                    sourceTobezierRotation = Math.atan2(cpY2 - source.y, cpX2 - source.x),
                    bezierToTargetRotation = Math.atan2(target.y - cpY2, target.x - cpX2),
                    cpX = source.x + nodeParam.NODE_RADIUS * Math.cos(sourceTobezierRotation),
                    cpY = source.y + nodeParam.NODE_RADIUS * Math.sin(sourceTobezierRotation),
                    toX = target.x - (nodeParam.NODE_RADIUS + triangle.width) * Math.cos(bezierToTargetRotation),
                    toY = target.y - (nodeParam.NODE_RADIUS + triangle.width) * Math.sin(bezierToTargetRotation);

                bezierCurve.lineStyle({
                    width: noLength ? 0 : linkParam.LINKWIDTH,
                    color: 0xffffff
                });
                bezierCurve.moveTo(cpX, cpY);
                bezierCurve.bezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY)
                link = bezierCurve;

                // 计算hitArea
                requestAnimationFrame(() => {
                    let path = link.geometry.points,
                        arr1 = [],
                        arr2 = [],
                        toggleFlag = true;
                    for (let i = 0; i < path.length; i = i + 2) {
                        if (toggleFlag) {
                            arr1.push(path[i], path[i + 1]);
                        } else {
                            arr2.push(path[i], path[i + 1]);
                        }
                        toggleFlag = !toggleFlag;
                    }
                    link.hitArea = new PIXI.Polygon(arr1.concat(arr2));
                })

                link.bezierData = {
                    linkType: "bezierCurve",
                    number: source.linkCount[target.id].multipleLink
                }

                // 设置三角形坐标
                triangle.rotation = Math.atan2(cpY2 - toY, cpX2 - toX) - Math.PI;
                triangle.x = noLength ? this.viewAttr.width / 2 : toX;
                triangle.y = noLength ? this.viewAttr.height / 2 : toY;

                // 设置文本坐标
                // if (rotation - Math.PI < - Math.PI / 2 && rotation - Math.PI > -Math.PI * 1.5) {
                //     textBox.rotation = rotation - Math.PI * 2;
                // } else {
                //     textBox.rotation = rotation - Math.PI;
                // }
                // textBox.x = noLength ? this.viewAttr.width / 2 : (cpX2 + (source.x + target.x) / 2) / 2 + Math.sin(textBox.rotation) * textBox.height;
                // textBox.y = noLength ? this.viewAttr.height / 2 : (cpY2 + (source.y + target.y) / 2) / 2 - Math.cos(textBox.rotation) * textBox.height;
            }
        } else {
            // 3.指向自身的曲线
            // 记录特殊曲线
            source.linkCount[source.id] ? source.linkCount[source.id].selfLink += 1 : source.linkCount[source.id] = {
                multipleLink: 0,
                selfLink: 1
            }

            let bezierCurve = new PIXI.Graphics();
            bezierCurve.lineStyle({
                width: noLength ? 0 : linkParam.LINKWIDTH, 
                color: 0xffffff
            });
            bezierCurve.moveTo(source.x, source.y - nodeParam.NODE_RADIUS / 2);
            bezierCurve.bezierCurveTo(
                source.x,
                source.y - nodeParam.NODE_RADIUS / 2,
                source.x - nodeParam.NODE_RADIUS * 0.1 * source.linkCount[source.id].selfLink,
                source.y - nodeParam.NODE_RADIUS * 1.2 * source.linkCount[source.id].selfLink,
                source.x - nodeParam.NODE_RADIUS - (source.linkCount[source.id].selfLink - 1) * 3,
                source.y - nodeParam.NODE_RADIUS - (source.linkCount[source.id].selfLink - 1) * 3
            );
            bezierCurve.bezierCurveTo(
                source.x - nodeParam.NODE_RADIUS - (source.linkCount[source.id].selfLink - 1) * 3,
                source.y - nodeParam.NODE_RADIUS - (source.linkCount[source.id].selfLink - 1) * 3,
                source.x - nodeParam.NODE_RADIUS * 1.2 * source.linkCount[source.id].selfLink,
                source.y - nodeParam.NODE_RADIUS * 0.1 * source.linkCount[source.id].selfLink,
                source.x - nodeParam.NODE_RADIUS / 2,
                source.y,
            );
            bezierCurve = this.pixiChart.renderer.generateTexture(bezierCurve, PIXI.settings.SCALE_MODES, window.devicePixelRatio * 10);
            link = new PIXI.Sprite(bezierCurve);
            link.anchor.set(1);
            link.x = source.x;
            link.y = source.y;
            link.zIndex = -source.linkCount[source.id].selfLink;
            link.bezierData = {
                linkType: "bezierCurveForSelf",
                number: source.linkCount[source.id].selfLink
            }

            // 设置三角形坐标
            triangle.x = noLength ? this.viewAttr.width / 2 : -nodeParam.NODE_RADIUS;

            // // 设置文本坐标
            // textBox.rotation = -0.785; // -45度
            // textBox.x = noLength ? this.viewAttr.width / 2 : (-1 - source.linkCount[source.id].selfLink) * nodeParam.NODE_RADIUS;
            // textBox.y = noLength ? this.viewAttr.height / 2 : (-1 - source.linkCount[source.id].selfLink) * nodeParam.NODE_RADIUS;
        }

        link.linkStyle = linkStyle;
        link.interactive = true;
        link.interactiveChildren = false;
        link.buttonMode = true;
        link.data = data;
        link.name = data.id;
        link.tint = linkStyle.color;
        link.isLink = true;
        link.addChild(triangle);
        // link.addChild(textBox);

        link
            .on("pointerdown", function (event) {
                event.stopPropagationHint = true;
                console.log("this:", this);
                vm.multipleSelectLinkEvent(event, this);
            })
            .on("pointerup", function(event) {
                event.stopPropagationHint = true;
            })
            .on("mouseover", function () {
                if (!vm.nodeOpLock) {
                    const linkTriangle = this.getChildByName("triangle");
                    if (!this.isHighlight) {
                        this.tint = linkParam.LINKHIGHLIGHT;
                        linkTriangle.tint = linkParam.LINKHIGHLIGHT;
                    }

                    const source = nodeContainer.getChildByName(this.data.source.id),
                        target = nodeContainer.getChildByName(this.data.target.id);

                    if (!(source && target)) return;

                    const sourceBorder = source.getChildByName("border") || vm.drawNodeBorder(source),
                        targetBorder = target.getChildByName("border") || vm.drawNodeBorder(target);

                    sourceBorder.visible = true;
                    targetBorder.visible = true;

                    // 透明化
                    for (let i = 0; i < nodeContainer.children.length; i++) {
                        nodeContainer.children[i].alpha = WORLDALPHA;
                    }
                    for (let i = 0; i < linkContainer.children.length; i++) {
                        linkContainer.children[i].alpha = WORLDALPHA;
                    }

                    this.alpha = 1;
                    source.alpha = 1;
                    target.alpha = 1;

                    vm.drawText(this, true, true);
                    vm.drawText(source, true, true);
                    vm.drawText(target, true, true);

                    // 显示text
                    const linkSize = this.linkStyle.size,
                        linkText = this.getChildByName("text"),
                        link = this,
                        sourceText = source.getChildByName("text"),
                        sourceTextBackground = source.getChildByName("textBackground"),
                        targetText = target.getChildByName("text"),
                        targetTextBackground = target.getChildByName("textBackground");

                    this.scaleFunction && vm.pixiChart.ticker.remove(this.scaleFunction);
                    linkText.isLock = true;
                    sourceText.isLock = true;
                    targetText.isLock = true;
                    this.scaleFunction = function() {
                        const originFontsizeX = 1 / link.scale.x * textParam.FONTSIZE * linkSize,
                            originFontsizeY = 1 / link.scale.y * textParam.FONTSIZE * linkSize,
                            scaleFontsizeX = 1 / link.scale.x * textParam.SCALEFONTSIZE * linkSize,
                            scaleFontsizeY = 1 / link.scale.y * textParam.SCALEFONTSIZE * linkSize;
                        linkText.visible = true;
                        linkText.scale.set(Math.max(Math.max(1 / vm.pixiChart.stage.scale.x, 1 / vm.pixiChart.stage.scale.y) * scaleFontsizeX, originFontsizeX), Math.max(Math.max(1 / vm.pixiChart.stage.scale.x, 1 / vm.pixiChart.stage.scale.y) * scaleFontsizeY, originFontsizeY));

                        const sourceOriginFontsize = 1 / source.originScale * textParam.FONTSIZE,
                        sourceScaleFontsize = 1 / source.originScale * textParam.SCALEFONTSIZE;
                        sourceText.visible = true;
                        sourceText.scale.set(Math.max(Math.max(1 / vm.pixiChart.stage.scale.x, 1 / vm.pixiChart.stage.scale.y) * sourceScaleFontsize, sourceOriginFontsize));

                        sourceTextBackground.visible = true;
                        sourceTextBackground.alpha = textParam.HIGHLIGHTTEXTBACKGROUNDALPHA;
                        sourceTextBackground.tint = textParam.HIGHLIGHTTEXTBACKGROUNDTINT;
                        sourceTextBackground.width = sourceText.width * textParam.LEVELPADDING;
                        sourceTextBackground.height = sourceText.height * textParam.VERTICALPADDING;

                        const targetOriginFontsize = 1 / target.originScale * textParam.FONTSIZE,
                        targetScaleFontsize = 1 / target.originScale * textParam.SCALEFONTSIZE;
                        targetText.visible = true;
                        targetText.scale.set(Math.max(Math.max(1 / vm.pixiChart.stage.scale.x, 1 / vm.pixiChart.stage.scale.y) * targetScaleFontsize, targetOriginFontsize));

                        targetTextBackground.visible = true;
                        targetTextBackground.alpha = textParam.HIGHLIGHTTEXTBACKGROUNDALPHA;
                        targetTextBackground.tint = textParam.HIGHLIGHTTEXTBACKGROUNDTINT;
                        targetTextBackground.width = targetText.width * textParam.LEVELPADDING;
                        targetTextBackground.height = targetText.height * textParam.VERTICALPADDING;
                        
                    }
                    vm.pixiChart.ticker.add(this.scaleFunction);
                }
            })
            .on("mouseout", function () {
                if (!vm.nodeOpLock) {
                    const linkTriangle = this.getChildByName("triangle"),
                        source = nodeContainer.getChildByName(this.data.source.id),
                        target = nodeContainer.getChildByName(this.data.target.id);

                    if (!(source && target)) return;

                    const sourceBorder = source.getChildByName("border") || vm.drawNodeBorder(source),
                        targetBorder = target.getChildByName("border") || vm.drawNodeBorder(target);

                    if (!this.isHighlight) {
                        this.tint = this.linkStyle.color;
                        linkTriangle.tint = this.linkStyle.color;
                        !sourceBorder.isLock && source.removeChild(sourceBorder);
                        !targetBorder.isLock && target.removeChild(targetBorder);
                    }

                    // 恢复透明化
                    for (let i = 0; i < nodeContainer.children.length; i++) {
                        nodeContainer.children[i].alpha = 1;
                    }
                    for (let i = 0; i < linkContainer.children.length; i++) {
                        linkContainer.children[i].alpha = 1;
                    }

                    // 恢复text
                    vm.pixiChart.ticker.remove(this.scaleFunction);
                    this.scaleFunction = null;

                    const linkSize = this.linkStyle.size,
                        linkText = this.getChildByName("text");
                    linkText.visible = this.getChildByName("triangle").visible;
                    linkText.scale.set(1 / this.scale.x * textParam.FONTSIZE * linkSize, 1 / this.scale.y * textParam.FONTSIZE * linkSize)
                    linkText.isLock = false;

                    const sourceText = source.getChildByName("text"),
                        sourceTextBackground = source.getChildByName("textBackground");
                    sourceText.visible = source.getChildByName("icon").visible;
                    sourceText.scale.set(1 / source.originScale * textParam.FONTSIZE)
                    sourceText.isLock = false;

                    sourceTextBackground.visible = sourceText.visible;
                    sourceTextBackground.alpha = textParam.TEXTBACKGROUNDALPHA;
                    sourceTextBackground.tint = textParam.TEXTBACKGROUNDTINT;
                    sourceTextBackground.width = sourceText.width * textParam.LEVELPADDING;
                    sourceTextBackground.height = sourceText.height * textParam.VERTICALPADDING;

                    const targetText = target.getChildByName("text"),
                        targetTextBackground = target.getChildByName("textBackground");
                    targetText.visible = target.getChildByName("icon").visible;
                    targetText.scale.set(1 / target.originScale * textParam.FONTSIZE)
                    targetText.isLock = false;

                    targetTextBackground.visible = targetText.visible;
                    targetTextBackground.alpha = textParam.TEXTBACKGROUNDALPHA;
                    targetTextBackground.tint = textParam.TEXTBACKGROUNDTINT;
                    targetTextBackground.width = targetText.width * textParam.LEVELPADDING;
                    targetTextBackground.height = targetText.height * textParam.VERTICALPADDING;
                }
            });
        for (const i in vm.linkEvents) {
            link.on(i, vm.linkEvents[i]);
        }
        linkContainer.addChild(link);
    }
    // 绘制/销毁linkText
    drawLinkText(link, isLock) {
        if (link.getChildByName("text")) {
            return;
        }
        const source = this.getObjectById(link.data.source.id, "node"),
            target = this.getObjectById(link.data.target.id, "node");
        if (!isLock && (!source.getChildByName("icon").visible || !target.getChildByName("icon").visible)) return;

        const linkSize = link.linkStyle.size,
            linkData = link.data,
            textBox = new PIXI.Text(linkData.type, {
                fill: "#363b40",
                stroke: "#3a3a3a",
            });
        textBox.name = "text";
        textBox.anchor.set(0.5);
        textBox.scale.set(textParam.FONTSIZE, textParam.FONTSIZE);
        textBox.isLock = isLock;

        if (link.bezierData) {
            if (source && target) {
                link.addChild(textBox);
                this.redrawBezierCurve(link, source, target, {
                    width: linkParam.LINKWIDTH * linkSize,
                    color: 0xffffff
                });
            }
        } else {
            if (link.rotation - Math.PI < - Math.PI / 2 && link.rotation - Math.PI > -Math.PI * 1.5) {
                textBox.rotation = -Math.PI * 2;
            } else {
                textBox.rotation = -Math.PI;
            }
            textBox.scale.set(1 / link.scale.x * textBox.scale.x * linkSize, 1 / link.scale.y * textBox.scale.y * linkSize);
            textBox.x = (link.width + triangleParam.TRIANGLEWIDTH) / 2 * (1 / link.scale.x);
            textBox.y = -Math.cos(textBox.rotation) * textBox.height;
            link.addChild(textBox);
        }
        this.countText++;
    }
    // 清除link相关样式
    clearLinkStyle() {
        const links = this.pixiChart.stage.getChildByName("linkContainer");
        for (let i = links.children.length - 1; i > -1; i--) {
            const link = links.children[i],
                text = link.getChildByName("text"),
                triangle = link.getChildByName("triangle"),
                linkSize = link.linkStyle.size;

            link.tint = link.linkStyle.color;
            triangle.tint = link.linkStyle.color;
            link.isHighlight = false;

            text && text.scale.set(1 / link.scale.x * textParam.FONTSIZE * linkSize, 1 / link.scale.y * textParam.FONTSIZE * linkSize);
            triangle.scale.set(1 / link.scale.x * triangle.originScale.x * linkSize, 1 / link.scale.y * triangle.originScale.y * linkSize);
        }
    }
    // 重绘贝塞尔曲线
    redrawBezierCurve(link, source, target, style) {
        link.clear();
        link.lineStyle(style);

        const triangle = link.getChildByName("triangle"),
            textBox = link.getChildByName("text"),
            rotation = Math.atan2(target.y - source.y, target.x - source.x),
            direction = (-1) ** link.bezierData.number * Math.ceil(link.bezierData.number * 0.5),
            distance = Number(Math.sqrt(Math.pow(target.y - source.y, 2) + Math.pow(target.x - source.x, 2))),
            hypotenuse = Number(distance / 8),
            offsetX = -direction * hypotenuse * Math.sin(rotation),
            offsetY = direction * hypotenuse * Math.cos(rotation),
            cpX2 = (source.x + target.x) / 2 + offsetX,
            cpY2 = (source.y + target.y) / 2 + offsetY,
            sourceTobezierRotation = Math.atan2(cpY2 - source.y, cpX2 - source.x),
            bezierToTargetRotation = Math.atan2(target.y - cpY2, target.x - cpX2),
            cpX = source.x + (source.width / 2 + nodeParam.PADDING) * Math.cos(sourceTobezierRotation),
            cpY = source.y + (source.height / 2 + nodeParam.PADDING) * Math.sin(sourceTobezierRotation),
            toX = target.x - (target.width / 2 + triangle.width + nodeParam.PADDING) * Math.cos(bezierToTargetRotation),
            toY = target.y - (target.height / 2 + triangle.width + nodeParam.PADDING) * Math.sin(bezierToTargetRotation);
        link.moveTo(cpX, cpY);
        link.bezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY);

        // 设置三角形坐标
        triangle.rotation = Math.atan2(cpY2 - toY, cpX2 - toX) - Math.PI;
        triangle.x = toX;
        triangle.y = toY;

        // 设置文本坐标
        if (textBox) {
            if (rotation - Math.PI < - Math.PI / 2 && rotation - Math.PI > -Math.PI * 1.5) {
                textBox.rotation = rotation - Math.PI * 2;
            } else {
                textBox.rotation = rotation - Math.PI;
            }
            textBox.x = (cpX2 + (source.x + target.x) / 2) / 2 + Math.sin(textBox.rotation) * textBox.height;
            textBox.y = (cpY2 + (source.y + target.y) / 2) / 2 - Math.cos(textBox.rotation) * textBox.height;
        }

        requestAnimationFrame(() => {
            let path = link.geometry.points,
                arr1 = [],
                arr2 = [],
                toggleFlag = true;
            for (let i = 0; i < path.length; i = i + 2) {
                if (toggleFlag) {
                    arr1.push(path[i], path[i + 1]);
                } else {
                    arr2.push(path[i], path[i + 1]);
                }
                toggleFlag = !toggleFlag;
            }
            link.hitArea = new PIXI.Polygon(arr1.concat(arr2));
        })
    }
    drawText(item, visible, isLock) {
        if (item.isNode) {
            if (visible) {
                this.drawNodeText(item, isLock);
            } else {
                const textBox = item.getChildByName("text"),
                    textBackground = item.getChildByName("textBackground");
                if (textBox && !textBox.isLock) {
                    textBox && PIXI.Texture.removeFromCache(textBox.texture);
                    textBox && item.removeChild(textBox);
                    textBackground && item.removeChild(textBackground);
                }
            }
        } else if (item.isLink) {
            if (visible) {
                this.drawLinkText(item, isLock);
            } else {
                const textBox = item.getChildByName("text");
                if (textBox && !textBox.isLock) {
                    textBox && PIXI.Texture.removeFromCache(textBox.texture);
                    textBox && item.removeChild(textBox);
                }
            }
        }
    }
    /**
     * @method: 获取图内的node和link数据
     * @for: 
     * @param {*} visibleOnly 是否不获取被隐藏的节点
     * @return {*}
     */
    exportData(visibleOnly, nodeExtraAttributes = []) {
        if (this.pixiChart && this.pixiChart.stage) {
            const nodeContainer = this.pixiChart.stage.getChildByName("nodeContainer"),
                linkContainer = this.pixiChart.stage.getChildByName("linkContainer");
            return {
                nodes: nodeContainer ? nodeContainer.children.filter(item => !visibleOnly || !item.isFilter).map(item => {
                    // let itemData = item.data,
                    //     tmpNode = {};
                    // for (let key in itemData) {
                    //     if (!this.nodeDefaultAttributes.includes(key)) {
                    //         tmpNode[key] = itemData[key];
                    //     }
                    //     if (nodeExtraAttributes.includes(key)) {
                    //         tmpNode[key] = itemData[key];
                    //     }
                    // }
                    // return tmpNode;
                    return item.data;
                }) : [],
                links: linkContainer ? linkContainer.children.filter(item => !visibleOnly || !item.isFilter).map(item => {
                    // let itemData = item.data,
                    //     tmpLink = {};
                    // for (let key in itemData) {
                    //     if (!this.linkDefaultAttributes.includes(key)) {
                    //         if (key == 'source' || key == 'target') {
                    //             let tmpNode = {}
                    //             for (let nodeKey in itemData[key]) {
                    //                 if (!this.nodeDefaultAttributes.includes(nodeKey)) {
                    //                     tmpNode[nodeKey] = itemData[key][nodeKey];
                    //                 }
                    //             }
                    //             tmpLink[key] = tmpNode;
                    //         } else {
                    //             tmpLink[key] = itemData[key];
                    //         }
                    //     }
                    // }
                    // return tmpLink;
                    return item.data;
                }) : []
            };
        } else {
            return {
                nodes: [],
                links: []
            }
        }
    }
    // 添加新元素
    addData({ nodes = [], links = [] }, isCacheStack = true) {
        // 去除重复id的元素
        nodes = arrayDeduplication(nodes, 'id');
        links = arrayDeduplication(links, 'id');

        // 添加节点
        this.drawData({ nodes, links }, isCacheStack);
    }
    // 应用布局
    applyLayout(layoutName = this.layoutParam.name) {
        console.log('布局更新');
        requestAnimationFrame(() => {
            switch (layoutName) {
                case 'dag-vertical':
                    this.applyDagreLayout();
                    break;
                case 'grid':
                    this.applyGridLayout();
                    break;
                case 'force': default:
                    this.applyForceLayout();
                    break;
            }
        })
    }
    // 切换布局
    changeLayout(targetLayout) {
        this.layoutParam.name = targetLayout;
        this.applyLayout();
    }
    /**
     * @method: 布局过渡动画
     * @for: 
     * @param {*} newNodes 新节点数据
     * @param {*} isComputedOffset 是否在该函数里计算偏移量
     * @param {*} isTotal 是否全量更新
     * @return {*}
     */
    transformLayoutAnimation(layoutInfo, isComputedOffset = true, isTotal = true) {
        let stage = this.pixiChart.stage,
            ticker = this.pixiChart.ticker,
            tick = 30,
            count = 0,
            nodes = [],
            vm = this,
            bounds = {
                minX:0,
                minY:0,
                maxX:0,
                maxY:0
            };

        if (isTotal) {
            nodes = stage.getChildByName("nodeContainer").children
        }

        if (isComputedOffset) {
            for (let i = 0; i < nodes.length; i++) {
                let node = nodes[i], newNode = layoutInfo.nodesMap[node.data.id] || {};
                node.offsetX = (newNode.x - node.x) / tick;
                node.offsetY = (newNode.y - node.y) / tick;
                node.data.x = newNode.x;
                node.data.y = newNode.y;
                
                if(i == 0){
                    bounds.minX = newNode.x;
                    bounds.minY = newNode.y;
                    bounds.maxX = newNode.x;
                    bounds.maxY = newNode.y;
                }else{
                    bounds.minX = Math.min(bounds.minX,newNode.x);
                    bounds.minY = Math.min(bounds.minY,newNode.y);
                    bounds.maxX = Math.max(bounds.maxX,newNode.x);
                    bounds.maxY = Math.max(bounds.maxY,newNode.y);
                }
            }
        }

        //移动节点
        if(this.firstRender){
            //第一次渲染
            const transitionAnimation = function () {
                count += 1;
                for (let i = 0; i < nodes.length; i++) {
                    let node = nodes[i];
                    node.x += (node.offsetX || 0);
                    node.y += (node.offsetY || 0);
                    vm.moveNodeEvent(node);
                }
                vm.redrawCommunity(true);
                if (count >= tick) {
                    count = 0;
                    vm.pixiChart.ticker.remove(transitionAnimation);
                    
                    //第一次渲染的缩放
                    let zoom;
                    if(vm.nodesInView(bounds)){//如果节点在可视范围内，放大
                        zoom = function () {
                            let originNodeSize = stage.scale.x * nodeParam.NODE_RADIUS;
                            if( originNodeSize < (HIDESCALE*1.2) && vm.nodesInView(bounds)){
                                vm.stageZoom(vm.viewAttr.width / 2, vm.viewAttr.height / 2, true);
                            }else{
                                vm.pixiChart.stage.emit("onDataUpdated");
                                vm.pixiChart.ticker.remove(zoom);
                            }
                        };
                    }else{//如果节点超出可视范围，缩小
                        zoom = function () {
                            if(!vm.nodesInView(bounds)){
                                vm.stageZoom(vm.viewAttr.width / 2, vm.viewAttr.height / 2, false);
                            }else{
                                vm.pixiChart.stage.emit("onDataUpdated");
                                vm.pixiChart.ticker.remove(zoom);
                            }
                        };
                        
                    }
                    vm.isPermitText = true;
                    vm.setCull();
                    vm.pixiChart.ticker.add(zoom);
                    vm.firstRender = false;
                };
            }
            ticker.add(transitionAnimation); 
        }else{
            const transitionAnimation = function () {
                let startTime = performance.now(),
                isHideLink = nodes.length > nodeParam.ANIMATIONNUMBER ? true : false;
                count += 1;
                for (let i = 0; i < nodes.length; i++) {
                    let node = nodes[i];
                    node.x += node.offsetX;
                    node.y += node.offsetY;
                    vm.setCull({cullIgnoreChildren: true, hideLink: isHideLink});
                    !isHideLink ? vm.moveNodeEvent(node) : '';
                }
                vm.redrawCommunity(true);
                if (count >= tick) {
                    count = 0;
                    vm.pixiChart.ticker.remove(transitionAnimation);
                    if (isHideLink) {
                        vm.updateLinkPosition(nodes);
                        vm.setCull();
                    }
                    vm.transitionStageToCenter();
                };
                console.log("transitionTime:", performance.now() - startTime);
            }
            for (let i = 0; i < nodes.length; i++) {
                let node = nodes[i];
                // 过渡动画时隐藏节点的child
                node.children.forEach(child => {
                    if(child.name != 'border'){
                        child.visible = false;
                    }
                })
            }
            ticker.add(transitionAnimation);   
        }
    }
    nodesInView(bounds){
        let visibleView = this.getVisibleBounds(),
            visibleViewX1 = visibleView.x + nodeParam.NODE_RADIUS*4,
            visibleViewY1 = visibleView.y + nodeParam.NODE_RADIUS*4,
            visibleViewX2 = visibleView.x + visibleView.width - nodeParam.NODE_RADIUS*4,
            visibleViewY2 = visibleView.y + visibleView.height - nodeParam.NODE_RADIUS*4,
            x1 = bounds.minX,
            y1 = bounds.minY,
            x2 = bounds.maxX,
            y2 = bounds.maxY;
        // console.log('可视范围:',visibleViewX1,visibleViewY1,visibleViewX2,visibleViewY2);
        // console.log('节点范围:',x1,y1,x2,y2);
        if( (x1-visibleViewX1)<0 || (y1-visibleViewY1)<0 || (x2-visibleViewX2)>0 || (y2-visibleViewY2)>0){
            return false;
        }else{
            return true;
        }
    }
    // 移动stage中心至node
    scrollIntoView(nodeId, clearOthers = null) {
        const nodeContainer = this.pixiChart.stage.getChildByName("nodeContainer"),
            node = nodeContainer.getChildByName(nodeId),
            stage = this.pixiChart.stage,
            vm = this,
            visibleView = this.getVisibleBounds(),
            centerX = visibleView.x + visibleView.width / 2,
            centerY = visibleView.y + visibleView.height / 2,
            offsetX = (centerX - node.x) * stage.scale.x,
            offsetY = (centerY - node.y) * stage.scale.y;

        node.visible = true;
        vm.setSelection(node.data.id, "node", { instance: node, clearOthers: clearOthers });

        let count = 0, tick = 40, targetScale = 1.2, sourceScale = Math.min(stage.scale.x, stage.scale.y),
            isZoomIn = sourceScale > targetScale ? false : true,
            scaleStep = Math.pow(Math.E, Math.log(targetScale / sourceScale) / tick);
        console.log("scaleStep:", scaleStep);

        const animate = function () {
            count += 1;
            console.log("offsetX:", offsetX);

            stage.x += offsetX / tick;
            stage.y += offsetY / tick;

            if (count > tick) {
                vm.setCull();
                vm.pixiChart.ticker.remove(animate);
                // count = 0;
                // vm.pixiChart.ticker.add(animateScale, { newVisibleView: vm.getVisibleBounds()});
            };
        }

        const animateScale = function () {
            count += 1;
            const { newVisibleView } = this;
            vm.stageZoom(newVisibleView.x + newVisibleView.width / 2, newVisibleView.y + newVisibleView.height / 2, isZoomIn, isZoomIn ? scaleStep - 1 : 1 - scaleStep);
            if (count > tick) {
                vm.setCull();
                vm.pixiChart.ticker.remove(animateScale, this);
            }
        }

        this.pixiChart.ticker.add(animate);

    }
    // 将舞台拉回中心
    transitionStageToCenter(tick = 30, positionInfo) {
        const visibleView = this.getVisibleBounds(),
            stage = this.pixiChart.stage,
            nodeBounds = positionInfo || this.getNodeLocalBounds(),
            vm = this;

        let count = 1;

        const animate = function () {
            count += 1;
            const { visibleView, nodeBounds } = this;
            stage.x += ((visibleView.x + visibleView.width / 2) - (nodeBounds.x + nodeBounds.width / 2)) * stage.scale.x / tick;
            stage.y += ((visibleView.y + visibleView.height / 2) - (nodeBounds.y + nodeBounds.height / 2)) * stage.scale.y / tick;

            if (count > tick) {
                vm.pixiChart.ticker.remove(animate, this);
                vm.initScale();
            };
        }

        this.pixiChart.ticker.add(animate, { visibleView, nodeBounds });
    }
    // 管理需要进行隐藏的元素
    addCullList() {
        this.cullList = [];
        this.cullList.push("linkContainer");
        this.cullList.push("nodeContainer");

        this.pixiChart.ticker.add(() => {
            if (this.stageDirty) {
                this.cullElement();
                this.stageDirty = false;
            }
        });
    }
    // 执行cull
    setCull(options = {}) {
        let { cullIgnoreChildren, hideLink } = options;
        this.cullOptions = {
            cullIgnoreChildren: cullIgnoreChildren,
            hideLink: hideLink
        };
        this.stageDirty = true;
    }
    // 隐藏可视范围外的元素
    cullElement() {
        let startTime = performance.now();
        const bounds = this.getVisibleBounds(),
            stage = this.pixiChart.stage,
            scaleVisible = stage.scale.x * nodeParam.NODE_RADIUS >= HIDESCALE;
        this.countText = 0;
        // 改变scale和position的同时需要修改stage活动区域
        stage.hitArea = bounds;
        for (let idIndex = this.cullList.length - 1; idIndex > -1; idIndex--) {
            const id = this.cullList[idIndex],
                container = stage.getChildByName(id) || {},
                list = container.children || [],
                length = list.length;
            for (let i = 0; i < length; i++) {
                const element = list[i];
                // 被过滤的元素不做处理
                if (element.isFilter) continue;
                let elementBounds = null;
                // link需特殊判断
                if (id == "linkContainer") {
                    // 边界判断法 即把link作为对角线画矩形来判断位置 但是getBounds会占用一部分计算性能
                    // elementBounds = element.getBounds();
                    // element.visible =
                    //   elementBounds.x + elementBounds.width > 0 &&
                    //   elementBounds.x < this.viewAttr.width &&
                    //   elementBounds.y + elementBounds.height > 0 &&
                    //   elementBounds.y < this.viewAttr.height;
                    // 手动计算边界并做缓存
                    if ((!element.cullObj || element.isChange)) {
                        if (!element.bezierData) {
                            const sourceX = element.x,
                                sourceY = element.y,
                                targetX = sourceX + element.width * Math.cos(element.rotation),
                                targetY = sourceY + element.width * Math.sin(element.rotation),
                                rectX = sourceX < targetX ? sourceX : targetX,
                                rectY = sourceY < targetY ? sourceY : targetY;
                            element.cullObj = {
                                x: rectX,
                                y: rectY,
                                width: Math.abs(sourceX - targetX),
                                height: Math.abs(sourceY - targetY)
                            };
                        } else {
                            elementBounds = element.getLocalBounds();
                            if (element.bezierData.linkType == 'bezierCurveForSelf') {
                                element.cullObj = {
                                    x: element.x,
                                    y: element.y,
                                    width: elementBounds.width * element.scale.x,
                                    height: elementBounds.height * element.scale.y
                                };
                            } else {
                                element.cullObj = elementBounds;
                            }
                        }
                    }
                } else {
                    if (!element.cullObj || element.isChange) {
                        elementBounds = element.getLocalBounds();
                        element.cullObj = {
                            x: element.x + (elementBounds.x - element.pivot.x) * element.scale.x,
                            y: element.y + (elementBounds.y - element.pivot.y) * element.scale.y,
                            width: elementBounds.width * element.scale.x,
                            height: elementBounds.height * element.scale.y
                        };
                    }
                }
                const isVisible = element.cullObj.x + element.cullObj.width > bounds.x &&
                    element.cullObj.x < bounds.x + bounds.width &&
                    element.cullObj.y + element.cullObj.height > bounds.y &&
                    element.cullObj.y < bounds.y + bounds.height;

                if (isVisible && scaleVisible) {
                    if (this.countText <= textParam.MAXNUMBER) {
                        this.isPermitText && this.drawText(element, isVisible && scaleVisible);
                    }
                } else {
                    this.countText--;
                    this.isPermitText && this.drawText(element, isVisible && scaleVisible);
                }

                element.visible = isVisible;

                if (this.cullOptions.hideLink && id == 'linkContainer') {
                    element.visible = false;
                }

                if (!this.cullOptions.cullIgnoreChildren) {
                    element.children.forEach(item => {
                        // border和由于scale而隐藏的元素不做处理
                        if (item.name != 'border') item.visible = isVisible && scaleVisible;
                    });
                }

                element.isChange = false;
            }
        }
        this.isPermitText = false;
        console.log("cullTime:", performance.now() - startTime);
    }
    // 将不在可视范围内的元素显示 为了重新计算scale
    toggleNodeVisible(visible) {
        const nodeContainer = this.pixiChart.stage.getChildByName("nodeContainer"),
            nodeLength = nodeContainer.children.length;
        if (visible) {
            for (let i = 0; i < nodeLength; i++) {
                nodeContainer.children[i].visible = !nodeContainer.children[i].isFilter;
            }
        } else {
            this.setCull();
        }
    }
    // 更新link的位置
    updateLinkPosition(nodes = this.pixiChart.stage.getChildByName("nodeContainer").children) {
        let updateEndId = [],
        nodesLength = nodes.length;
        for (let i = 0; i < nodesLength; i++) {
            let node = nodes[i];
            node.isChange = true;
            for (let l = 0; l < node.data.dataLinks.length; l++) {
                let linkInfo = node.data.dataLinks[l];
                if (updateEndId.indexOf(linkInfo.id) == -1) {
                    const source = this.getLinkNodeInstance(linkInfo, node, 'source'),
                        target = this.getLinkNodeInstance(linkInfo, node, 'target');

                    if (target == undefined || source == undefined) {
                        continue;
                    }

                    const link = (node.cacheData.linksGroup && node.cacheData.linksGroup[linkInfo.id]) ? node.cacheData.linksGroup[linkInfo.id].link : this.getObjectById(linkInfo.id, "link");

                    if (link == undefined || Object.keys(link).length == 0) {
                        continue;
                    }
                    let textBox = link.getChildByName("text"),
                        triangle = link.getChildByName("triangle"),
                        linkSize = link.linkStyle.size;
                    if (source.data.id != target.data.id) {
                        if (!link.bezierData) {
                            link.rotation = Math.atan2(target.y - source.y, target.x - source.x);
                            link.x = source.x + (source.width / 2 + nodeParam.PADDING) * Math.cos(link.rotation);
                            link.y = source.y + (source.height / 2 + nodeParam.PADDING) * Math.sin(link.rotation);
                            link.width = Math.max(Math.sqrt((source.x - target.x) ** 2 + (source.y - target.y) ** 2) - (source.width + target.width) / 2 - triangle.width * link.scale.x - nodeParam.PADDING * 2, 0);
                            link.hitArea = new PIXI.Rectangle(0, -link.height * 1 / link.scale.y * linkParam.HITAREASCALE, link.width * 1 / link.scale.x, link.height * 1 / link.scale.y * linkParam.HITAREASCALE * 2);

                            triangle.x = link.width / link.scale.x;

                            if (textBox) {
                                if (link.rotation - Math.PI < - Math.PI / 2 && link.rotation - Math.PI > -Math.PI * 1.5) {
                                    textBox.rotation = -Math.PI * 2;
                                } else {
                                    textBox.rotation = -Math.PI;
                                }
                                textBox.x = (link.width + triangleParam.TRIANGLEWIDTH) / 2 * 1 / link.scale.x;
                                textBox.y = -Math.cos(textBox.rotation) * textBox.height;
                            }

                        } else {
                            this.redrawBezierCurve(link, source, target, {
                                width: linkParam.LINKWIDTH * linkSize,
                                color: 0xffffff
                            })
                        }
                    } else {
                        link.x = source.x;
                        link.y = source.y;

                        if (textBox) {
                            textBox.x = -source.width / 2 - link.bezierData.number * source.width / 2;
                            textBox.y = -source.height / 2 - link.bezierData.number * source.height / 2;
                        }

                        triangle.x = -source.width / 2;
                    }

                    let linkScaleX = link.scale.x || 1,
                    linkScaleY = link.scale.y || 1,
                    textScaleX = 1 / linkScaleX * textParam.FONTSIZE * linkSize,
                    textScaleY = 1 / linkScaleY * textParam.FONTSIZE * linkSize,
                    triangleScaleX = 1 / linkScaleX * triangle.originScale.x * linkSize,
                    triangleScaleY = 1 / linkScaleY * triangle.originScale.y * linkSize;
                    textBox && textBox.scale.set(textScaleX, textScaleY);
                    triangle.scale.set(triangleScaleX, triangleScaleY);

                    link.isChange = true;

                    updateEndId.push(linkInfo.id);
                }
            }

        }
    }
    // 设置画布的缩放倍数
    setZoom({ max, min }) {
        zoomParam.ZOOM_MAX = max;
        zoomParam.ZOOM_MIN = min;
    }
    // 获取画布的可视范围
    getVisibleBounds() {
        const stage = this.pixiChart.stage;
        return new PIXI.Rectangle(
            -stage.x / stage.scale.x,
            -stage.y / stage.scale.y,
            this.viewAttr.width / stage.scale.x,
            this.viewAttr.height / stage.scale.y
        );
    }
    // 获取node容器的边界
    getNodeLocalBounds() {
        this.toggleNodeVisible(true);
        const bounds = this.pixiChart.stage.getChildByName("nodeContainer").getLocalBounds();
        this.setCull();
        return bounds;
    }
    // 初始化键盘事件
    initKeyBoradEvent() {
        this.pixiChart.view.addEventListener("selectstart", event => {
            event.preventDefault();
        },
            false
        );
        this.pixiChart.view.addEventListener("contextmenu", event => {
            console.log("contextmenu:", event);
            event.preventDefault();
        },
            false
        );
        // this.controlKey = this.keyboradEvent(17);
    }
    // 绑定键盘事件
    keyboradEvent(keyCode) {
        const key = {
            code: keyCode,
            isDown: false,
            isUp: true,
            downHandler: event => {
                if (event.keyCode == key.code) {
                    // console.log("event:", event);
                    key.isDown = true;
                    key.isUp = false;
                }
                event.preventDefault();
            },
            upHandler: event => {
                if (event.keyCode == key.code) {
                    // console.log("event:", event);
                    key.isDown = false;
                    key.isUp = true;
                }
                event.preventDefault();
            }
        };
        this.pixiChart.view.addEventListener("keydown", key.downHandler.bind(key), false);
        this.pixiChart.view.addEventListener("keyup", key.upHandler.bind(key), false);
        return key;
    }
    /**
     * @method: 缓存node相关信息 目的是在对node进行交互时 提高性能
     * @for: 
     * @param {*} item node实例
     * @return {*}
     */
    cacheNodeData(item) {
        // 缓存link相关信息 需要不断更新缓存
        if (item && item.data && item.data.dataLinks) {
            const linksLength = item.data.dataLinks.length;
            if (linksLength > 0) {
                item.cacheData.linksGroup = {};
                for (let i = 0; i < linksLength; i++) {
                    if (item.data.dataLinks[i].source != item.data.id) {
                        item.cacheData.linksGroup[item.data.dataLinks[i].id] = {
                            node: this.getObjectById(item.data.dataLinks[i].source, "node")
                        };
                    } else {
                        item.cacheData.linksGroup[item.data.dataLinks[i].id] = {
                            node: this.getObjectById(item.data.dataLinks[i].target, "node")
                        };
                    }
                    item.cacheData.linksGroup[item.data.dataLinks[i].id].link = this.getObjectById(item.data.dataLinks[i].id, "link");
                }
            }
        }
    }
    // 设置元素相关事件
    setElementEvent(element, type, fn) {
        element.on(type, fn);
        return element;
    }
    // 绘制边界方框
    drawRectBounds(id, rect, color) {
        let boundsRect = this.pixiChart.stage.getChildByName(id);
        if (!boundsRect) {
            boundsRect = new PIXI.Graphics();
            boundsRect.lineStyle(5, color);
            boundsRect.drawRect(rect.x, rect.y, rect.width, rect.height);
            boundsRect.endFill();
            boundsRect.name = id;
            this.pixiChart.stage.addChild(boundsRect);
        } else {
            boundsRect.clear();
            boundsRect.lineStyle(5, color);
            boundsRect.drawRect(rect.x, rect.y, rect.width, rect.height);
            boundsRect.endFill();
        }
    }
    // 设置插值颜色 
    setInterpolateColor(value, range) {
        const color = d3.scaleLinear()
            .domain([0, range])
            .range(["#040af5", "#f50404"]);

        const rgb = d3.color(color(value));
        return '0x' + this.rgbToHex(rgb.r, rgb.g, rgb.b);
    }
    rgbToHex(r, g, b) {
        return ((r << 16) | (g << 8) | b).toString(16);
    }
    // 社区切分 d3基于Marching squares轮廓算法封装的等值线方法
    communityGraph(communityList) {
        const communityContainer = this.pixiChart.stage.getChildByName("communityContainer");

        communityContainer.removeChildren();

        let xMin, yMin, xMax, yMax;

        for (let i = communityList.length - 1; i > -1; i--) {
            const community = communityList[i],
                coordinatesList = [],
                graphics = new PIXI.Graphics();
            graphics.data = {
                spriteList: [],
                isChange: false,
                color: ''
            };
            graphics.name = communityContainer.children.length;

            for (let index = community.length - 1; index > -1; index--) {
                const id = community[index],
                    node = this.getObjectById(id, "node");
                node.data.community = graphics.name;

                if (index == community.length - 1) {
                    xMin = node.x;
                    xMax = node.x;
                    yMin = node.y;
                    yMax = node.y;
                } else {
                    xMin = Math.min(xMin, node.x);
                    xMax = Math.max(xMax, node.x);
                    yMin = Math.min(yMin, node.y);
                    yMax = Math.max(yMax, node.y);
                }

                graphics.data.spriteList.push(node);
                coordinatesList.push({
                    x: node.x,
                    y: node.y
                });
            }

            // 该轮廓算法坐标不能为负数 需要进行补正
            const offsetX = xMin < 0 ? Math.abs(xMin) : 0, offsetY = yMin < 0 ? Math.abs(yMin) : 0;
            coordinatesList.forEach(item => {
                item.x += offsetX;
                item.y += offsetY;
            });

            const color = this.setInterpolateColor(graphics.name, communityList.length);
            graphics.lineStyle(1, 0xffffff, 0);
            graphics.beginFill(color, 0.2);
            graphics.data.color = color;

            const contour = d3
                .contourDensity()
                .x(function (d) {
                    return d.x;
                })
                .y(function (d) {
                    return d.y;
                })
                .size([xMax + offsetX, yMax + offsetY])
                .thresholds(3)
                .cellSize(16)
                .bandwidth(100)(coordinatesList);

            // 数组第一项为最大的轮廓
            const coordinates = contour.length != 0 ? contour[0].coordinates : [];
            for (let i = 0; i < coordinates.length; i++) {
                const path = coordinates[i][0];
                for (let m = 0; m < path.length; m++) {
                    if (m == 0) {
                        graphics.moveTo(path[m][0] - offsetX, path[m][1] - offsetY);
                    } else {
                        graphics.lineTo(path[m][0] - offsetX, path[m][1] - offsetY);
                    }
                }
            }
            graphics.endFill();
            communityContainer.addChild(graphics);
        }
    }
    // 重绘社区切分
    redrawCommunity(isAll) {
        const communityContainer = this.pixiChart.stage.getChildByName("communityContainer");
        for (let i = communityContainer.children.length - 1; i > -1; i--) {
            const item = communityContainer.children[i];
            if (item.data.isChange || isAll) {
                item.data.isChange = false;
                const coordinatesList = [];

                let xMin, yMin, xMax, yMax;

                for (let index = item.data.spriteList.length - 1; index > -1; index--) {
                    const node = item.data.spriteList[index];
                    if (index == item.data.spriteList.length - 1) {
                        xMin = node.x;
                        xMax = node.x;
                        yMin = node.y;
                        yMax = node.y;
                    } else {
                        xMin = Math.min(xMin, node.x);
                        xMax = Math.max(xMax, node.x);
                        yMin = Math.min(yMin, node.y);
                        yMax = Math.max(yMax, node.y);
                    }
                    coordinatesList.push({
                        x: node.x,
                        y: node.y
                    });
                }

                const offsetX = xMin < 0 ? Math.abs(xMin) : 0, offsetY = yMin < 0 ? Math.abs(yMin) : 0;
                coordinatesList.forEach(item => {
                    item.x += offsetX;
                    item.y += offsetY;
                });
                item.clear();
                item.lineStyle(1, 0xffffff, 0);
                item.beginFill(item.data.color, 0.2);

                const contour = d3
                    .contourDensity()
                    .x(function (d) {
                        return d.x;
                    })
                    .y(function (d) {
                        return d.y;
                    })
                    .size([xMax + offsetX, yMax + offsetY])
                    .thresholds(3)
                    .cellSize(16)
                    .bandwidth(100)(coordinatesList);

                const coordinates = contour.length != 0 ? contour[0].coordinates : [];
                for (let i = 0; i < coordinates.length; i++) {
                    const path = coordinates[i][0];
                    for (let m = 0; m < path.length; m++) {
                        if (m == 0) {
                            item.moveTo(path[m][0] - offsetX, path[m][1] - offsetY);
                        } else {
                            item.lineTo(path[m][0] - offsetX, path[m][1] - offsetY);
                        }
                    }
                }
                item.endFill();
            }
        }
    }
    // 社交领袖
    socialLeader(leaderArr) {
        this.leaderArr = [];

        const nodeContainer = this.pixiChart.stage.getChildByName("nodeContainer"),
            sourceScale = 1,
            targetScale = 5;

        for (let i = leaderArr.length - 1; i > -1; i--) {
            const leaderId = leaderArr[i],
                node = nodeContainer.getChildByName(leaderId);
            if (!node.isEnhance) {
                this.nodeScaleTo(node, sourceScale, targetScale);
            }
            this.leaderArr.push(node.name);
        }
    }
    // 清除算法
    clearAlgorithm() {
        if (this.pixiChart && this.pixiChart.stage) {
            // 社区发现
            this.pixiChart.stage.getChildByName("communityContainer").removeChildren();

            // 社交领袖
            const nodeContainer = this.pixiChart.stage.getChildByName("nodeContainer"),
                sourceScale = 5,
                targetScale = 1;

            for (let i = leaderArr.length - 1; i > -1; i--) {
                const leaderId = leaderArr[i],
                    node = nodeContainer.getChildByName(leaderId);
                if (node && node.isEnhance) {
                    this.nodeScaleTo(node, sourceScale, targetScale);
                }
            }

            this.leaderArr = [];
        }

    }
    // 实体强化
    nodeEnhance(enhanceArr) {
        if (!this.pixiChart || !this.pixiChart.stage) return;
        const { enhanceNodes, enhanceLinks } = enhanceArr,
            nodeContainer = this.pixiChart.stage.getChildByName("nodeContainer"),
            sourceScale = 1;

        for (let i = enhanceNodes.length - 1; i > -1; i--) {
            const nodeId = enhanceNodes[i],
                node = nodeContainer.getChildByName(nodeId);
            if (node && !node.isEnhance) {
                const targetScale = Math.ceil(enhanceLinks[node.data.id] * 0.5) + sourceScale;
                this.nodeScaleTo(node, sourceScale, targetScale < nodeParam.MAXSCALE ? targetScale : nodeParam.MAXSCALE)
            }
        }

        if (enhanceNodes.length == 0) {
            for (let i = nodeContainer.length - 1; i > -1; i--) {
                const node = nodeContainer[i];
                if (node.isEnhance) {
                    this.nodeScaleTo(node, node.scale.x, 1);
                }
            }
        }
    }
    // node缩放动画
    nodeScaleTo(node, sourceScale, targetScale, tick = 30) {
        sourceScale = Number(sourceScale);
        targetScale = Number(targetScale);
        if (sourceScale == targetScale) return;
        let count = 0;
        const vm = this,
            nodeContainer = this.pixiChart.stage.getChildByName("nodeContainer"),
            scaleAnimation = function () {
                const tickScale = (targetScale - sourceScale) / tick;
                node.scale.set(Number(node.scale.x) + tickScale);

                vm.moveNodeEvent(node);

                if (nodeContainer.children.length < 1000) {
                    for (let i = nodeContainer.length - 1; i > -1; i--) {
                        const item = nodeContainer[i];
                        if (item.name != node.name) {
                            const rotation = Math.atan2(item.y - node.y, item.x - node.x);
                            item.x += tickScale * nodeParam.NODE_RADIUS * Math.cos(rotation);
                            item.y += tickScale * nodeParam.NODE_RADIUS * Math.sin(rotation);
                            vm.moveNodeEvent(item);
                        }
                    }
                    vm.redrawCommunity(true);
                }

                if (count >= tick - 1) {
                    node.isEnhance = targetScale - sourceScale > 0 ? true : false;
                    node.scale.set(targetScale);
                    vm.setCull();
                    vm.pixiChart.ticker.remove(scaleAnimation);
                }
                count++;
            };

        this.pixiChart.ticker.add(scaleAnimation);
    }
    // 适应dom容器大小
    resize() {
        this.pixiChart.resize();
    }
    // 获取选中
    getSelection(factor) {
        let selectedElement = [];
        for (let i = this.selectedNode.length - 1; i > -1; i--) {
            const id = this.selectedNode[i],
                node = this.getObjectById(id, "node");
            if (factor) {
                selectedElement.push(node.data[factor]);
            } else {
                selectedElement.push(node);
            }
        }
        return selectedElement;
    }
    /**
     * @method: 设置选中
     * @for: 
     * @param {*} selection 选中的元素id
     * @param {*} node 选中的元素实例
     * @param {*} clearOthers 是否清除其他被选中元素
     * @return {*}
     */
    setSelection(selection, type = 'node', options = {}) {
        let { instance, clearOthers, stopEmitSelection } = options;
        if (clearOthers) this.cancelSelection();
        if (!Array.isArray(selection)) selection = [selection];

        if (type == 'node') {
            for (let i = selection.length - 1; i > -1; i--) {
                const id = selection[i],
                    element = instance ? instance : this.getObjectById(id, type),
                    selectedBorder = this.drawNodeBorder(element);
    
                selectedBorder.visible = true;
                // 表示不会被link事件影响
                selectedBorder.isLock = true;
    
                this.selectedNode.push(element.name);
                this.cacheNodeData(element)
            }
        } else if (type == 'link') {
            for (let i = selection.length - 1; i > -1; i--) {
                const id = selection[i],
                    element = instance ? instance : this.getObjectById(id, type);
                element.isHighlight = true;
                element.tint = linkParam.LINKHIGHLIGHT;
                element.getChildByName("triangle").tint = element.tint;
            }
        }
        if (!stopEmitSelection) {
            this.emitOnSelectionChange();
        }
    }
    emitOnSelectionChange() {
        const nodeContainer = this.pixiChart.stage.getChildByName("nodeContainer"),
        nodeLength = nodeContainer.children.length,
        selectedNodeData = [];
        for (let i = nodeLength - 1; i > -1; i--) {
            const node = nodeContainer.children[i];
            if (this.selectedNode.indexOf(node.name) != -1) {
                selectedNodeData.push({
                    id: node.name,
                    name: node.data.name
                })
            }
        }
        this.pixiChart.stage.emit("onSelectionChange", selectedNodeData);
    }
    //对某个节点取消选中
    cancelSelectionOne(id) {
        const nodeContainer = this.pixiChart.stage.getChildByName("nodeContainer"),
            nodeItem = nodeContainer.getChildByName(id),
            index = this.selectedNode.indexOf(nodeItem.name),
            vm = this;

        this.selectedNode.splice(index, 1);
        nodeItem.getChildByName("border") && nodeItem.removeChild(nodeItem.getChildByName("border"));

        this.emitOnSelectionChange();
    }
    // 取消对节点的选中
    cancelSelection() {
        this.selectedNode = [];
        const nodeContainer = this.pixiChart.stage.getChildByName("nodeContainer");
        for (let i = nodeContainer.children.length - 1; i > -1; i--) {
            const item = nodeContainer.children[i];
            item.getChildByName("border") && item.removeChild(item.getChildByName("border"));
        }
        this.pixiChart.stage.emit("onSelectionChange", []);
    }
    //反选
    reverseSelection() {
        let selectedNode = [];
        //获取所有节点作对比，算出反选节点
        const nodeContainer = this.pixiChart.stage.getChildByName("nodeContainer");
        for (let i = nodeContainer.children.length - 1; i > -1; i--) {
            const item = nodeContainer.children[i],
            border = item.getChildByName("border");
            if (!border || !border.visible) {
                selectedNode.push({
                    id: item.data.id,
                    name: item.data.name
                })
            }
        }
        //设置选中
        this.setSelection(selectedNode.map(item => item.id), "node", { clearOthers: true });

        this.pixiChart.stage.emit("onSelectionChange", selectedNode);
    }
    /**
     * @method: 删除图内元素
     * @for: 
     * @param {*} data
     * @return {*}
     */
    removeData(data, isCacheStack = true) {
        const { nodes = [], links = [] } = data,
            nodesData = [],
            linksData = [],
            hasDeleteLinks = [],
            stage = this.pixiChart.stage,
            nodeContainer = stage.getChildByName("nodeContainer"),
            linkContainer = stage.getChildByName("linkContainer"),
            communityContainer = stage.getChildByName("communityContainer"),
            nodesLength = nodes.length,
            linksLength = links.length,
            bezierMap = {
                bezierCurveForSelf: 'selfLink',
                bezierCurve: 'multipleLink'
            };

        // 删除node相关信息
        for (let i = 0; i < nodesLength; i++) {
            const node = nodeContainer.getChildByName(nodes[i].id);
            // 获取node相关信息
            this.cacheNodeData(node);

            // 删除选中信息
            let index = this.selectedNode.indexOf(node.data.id);
            index != -1 && this.selectedNode.splice(index, 1);

            // 删除邻边信息
            for (let key in node.cacheData.linksGroup) {
                const linkCache = node.cacheData.linksGroup[key],
                    neighborNode = linkCache.node;
                if (!hasDeleteLinks.includes(linkCache.link.data.id)) {
                    linksData.push(linkCache.link.data)
                    // 删除node所连的link时 需要把相连点的link数据清除
                    for (let m = 0; m < neighborNode.data.dataLinks.length; m++) {
                        if (neighborNode.data.dataLinks[m].id == key) {
                            neighborNode.data.dataLinks.splice(m, 1);
                            // delete效率低 可能有性能问题
                            neighborNode.cacheData.linksGroup && delete neighborNode.cacheData.linksGroup[key];
                            break;
                        }
                    }
                    if (linkCache.link.bezierData) {
                        if (node.data.id != neighborNode.data.id) {
                            neighborNode.data.linkCount && neighborNode.data.linkCount[node.data.id] && neighborNode.data.linkCount[node.data.id][bezierMap[linkCache.link.bezierData.linkType]]--;
                            node.data.linkCount && node.data.linkCount[neighborNode.data.id] && node.data.linkCount[neighborNode.data.id][bezierMap[linkCache.link.bezierData.linkType]]--;
                        } else {
                            node.data.linkCount && node.data.linkCount[neighborNode.data.id] && node.data.linkCount[neighborNode.data.id][bezierMap[linkCache.link.bezierData.linkType]]--;
                        }
                    }

                    linkContainer.removeChild(linkCache.link);
                    // 先记录由于node被删除的link
                    hasDeleteLinks.push(linkCache.link.data.id);
                }
            }

            // 删除社区切分信息
            const community = communityContainer.getChildByName(node.data.community);
            if (community) {
                let index = -1;
                for (let i = 0; i < community.data.spriteList.length; i++) {
                    if (community.data.spriteList[i].name == node.name) {
                        index = i;
                        break;
                    }
                }
                index != -1 ? community.data.spriteList.splice(index, 1) : '';

                community.data.isChange = true;
            }

            node.data.dataLinks = [];
            node.data.linkCount = null;
            nodesData.push(JSON.parse(JSON.stringify(node.data)));
            this.nodesId.delete(node.data.id);
            nodeContainer.removeChild(node);
        }

        // 删除link相关信息
        for (let i = 0; i < linksLength; i++) {
            if (hasDeleteLinks.includes(links[i].id)) continue;

            const link = linkContainer.getChildByName(links[i].id);
            linksData.push(link.data);

            if (link) {
                // 删除所连node中记录的此link信息
                // 这里没有删掉node.cacheData中的link缓存信息
                const source = link.data.source, target = link.data.target;
                for (let s = 0; s < source.dataLinks.length; s++) {
                    if (source.dataLinks[s].target == target.id) {
                        source.dataLinks.splice(s, 1);
                        break;
                    }
                }
                for (let t = 0; t < target.dataLinks.length; t++) {
                    if (target.dataLinks[t].source == source.id) {
                        target.dataLinks.splice(t, 1);
                        break;
                    }
                }

                if (source.id != target.id) {
                    link.bezierData && target.linkCount[source.id] && target.linkCount[source.id][bezierMap[link.bezierData.linkType]]--;
                    link.bezierData && source.linkCount[target.id] && source.linkCount[target.id][bezierMap[link.bezierData.linkType]]--;
                } else {
                    link.bezierData && target.linkCount[target.id] && target.linkCount[target.id][bezierMap[link.bezierData.linkType]]--;
                }

                linkContainer.removeChild(linkContainer.getChildByName(link.data.id));
            }
        }

        if (isCacheStack) {
            this.inStack({ nodes: nodesData, links: linksData, type: 'remove' });
        }
        this.redrawCommunity();
        // 更新图谱数据
        stage.emit("onDataUpdated");
        this.emitOnSelectionChange();
    }
    // 刷新整体布局
    resetLayout() {
        this.addData(this.exportData(true), false);
    }
    // 更新元素样式
    // 样式以数据内的algorithmStyle为准
    updateAlgorithmStyle(nodes = [], links = []) {
        if (!this.pixiChart || !this.pixiChart.stage) return;
        const nodeContainer = this.pixiChart.stage.getChildByName("nodeContainer"),
            linkContainer = this.pixiChart.stage.getChildByName("linkContainer");
        for (let i = 0; i < nodes.length; i++) {
            let nodeData = nodes[i],
                node = nodeContainer.getChildByName(nodeData.id),
                algorithmStyle = nodeData.algorithmStyle;
            if (algorithmStyle) {
                node.data.algorithmStyle = algorithmStyle;
                //修改颜色
                node.tint = algorithmStyle.color || node.tint;
                //修改比例
                if (!isEmpty(algorithmStyle.size)) {
                    this.maxNodeSize = Math.max(this.maxNodeSize, algorithmStyle.size);
                    this.nodeScaleTo(node, node.scale.x, algorithmStyle.size * node.originScale);
                }
                //修改图标
                if (algorithmStyle.icon) {
                    let nodeTexture, iconContainer = node.getChildByName("icon");
                    if (!PIXI.utils.TextureCache[algorithmStyle.icon]) {
                        nodeTexture = PIXI.Texture.fromLoader(algorithmStyle.icon, algorithmStyle.icon);
                    } else {
                        nodeTexture = PIXI.utils.TextureCache[algorithmStyle.icon];
                    }
                    iconContainer.texture = nodeTexture;
                }
                //修改label
                if (algorithmStyle.tag) {
                    node.getChildByName("text").text = node.data[algorithmStyle.tag];
                }
            }
        }
        for (let i = 0; i < links.length; i++) {
            let linkData = links[i],
                link = linkContainer.getChildByName(linkData.id),
                algorithmStyle = linkData.algorithmStyle,
                linkTriangle = link.getChildByName("triangle");
            if (algorithmStyle) {
                link.data.algorithmStyle = algorithmStyle;
                link.linkStyle = { ...this.getLinkStyle(this.graphOptions.linkStyleFunction, link.data), ...algorithmStyle };
                link.linkStyle.size = Number(link.linkStyle.size);
                //修改颜色
                link.tint = algorithmStyle.color || link.tint;
                linkTriangle.tint = link.tint;

                //粗细
                if (algorithmStyle.size) {
                    const source = this.pixiChart.stage.getChildByName("nodeContainer").getChildByName(link.data.source.id),
                        target = this.pixiChart.stage.getChildByName("nodeContainer").getChildByName(link.data.target.id);
    
                    if (!link.bezierData) {
                        link.height = linkParam.LINKWIDTH * algorithmStyle.size;
                        this.moveNodeEvent(source);
                    } else {
                        if (link.bezierData.linkType == 'bezierCurve') {
                            this.moveNodeEvent(source);
                            this.moveNodeEvent(target);
                        }
                    }
                }
            }
        }
    }
    // 进行过滤
    updateFilters() {
        if (!this.pixiChart || !this.pixiChart.stage) return;
        const stage = this.pixiChart.stage,
            nodeContainer = stage.getChildByName("nodeContainer"),
            linkContainer = stage.getChildByName("linkContainer"),
            hasFilterLinks = [];
        if (nodeContainer && this.graphOptions.filters.nodeFilter) {
            for (let i = nodeContainer.children.length - 1; i > -1; i--) {
                const item = nodeContainer.children[i];
                item.visible = this.graphOptions.filters.nodeFilter(item.data);
                item.isFilter = !item.visible;

                // 过滤node所连link
                for (let j = item.data.dataLinks.length - 1; j > -1; j--) {
                    const linkData = item.data.dataLinks[j];
                    if (!hasFilterLinks.includes(linkData.id)) {
                        const link = item.cacheData.linksGroup && item.cacheData.linksGroup[linkData.id] ? item.cacheData.linksGroup[linkData.id].link : this.getObjectById(linkData.id, "link");
                        link.visible = item.visible;
                        link.isFilter = !item.visible;
                        link.isFilter ? hasFilterLinks.push(linkData.id) : '';
                    }
                }
            }
        }
        if (linkContainer && this.graphOptions.filters.linkFilter) {
            for (let i = linkContainer.children.length - 1; i > -1; i--) {
                const item = linkContainer.children[i];
                if (!hasFilterLinks.includes(item.data.id)) {
                    item.visible = this.graphOptions.filters.linkFilter(item.data);
                    item.isFilter = !item.visible;
                }
            }
        }
    }
    // 销毁图组件
    destroyPixiChart() {
        this.pixiChart && this.pixiChart.destroy(true, {
            children: true,
            texture: true,
            baseTexture: true
        });
        this.pixiChart = null;
        this.layoutWorker.terminate();
        this.firstRender = true;
    }
    // 清空画布
    clear() {
        this.destroyPixiChart();
        this.graphOptions.graphData = {
            nodes: [],
            links: []
        };
        this.init(this.graphOptions);
    }
    paintNow() {

    }
    zoom() {

    }
    // 缓存图数据
    inStack(data) {
        const stack = this.cacheStack.content;
        if (stack.length > this.cacheStack.index) {
            stack.splice(this.cacheStack.index + 1);
        }
        this.cacheStack.content.push(data);
        this.cacheStack.index++;
        console.log('cacheStack', this.cacheStack);
    }
    // 清空缓存
    clearStack() {
        this.cacheStack.content = [];
        this.cacheStack.index = -1;
    }
    // 获取上一栈
    getPrevStack() {
        return this.cacheStack.content[this.cacheStack.index--];
    }
    // 获取下一栈
    getNextStack() {
        return this.cacheStack.content[++this.cacheStack.index];
    }
    // 增加元素 不记录缓存
    stackAdd(data) {
        this.addData(data, false);
    }
    // 删除元素 不记录缓存
    stackRemove(data) {
        this.removeData(data, false);
    }
    // 重做
    redo() {
        if (this.cacheStack.index < (this.cacheStack.content.length - 1)) {
            let cacheData = this.getNextStack(),
                data = { nodes: cacheData.nodes, links: cacheData.links };
            switch (cacheData.type) {
                case 'add':
                    this.stackAdd(data);
                    break;
                case 'remove':
                    this.stackRemove(data);
                    break;
            }
        } else {
            show_message('没有更多操作！', 'warning');
        }
        console.log('redo', this.cacheStack);
    }
    // 撤销
    undo() {
        if (this.cacheStack.index >= 0) {
            let cacheData = this.getPrevStack(),
                data = { nodes: cacheData.nodes, links: cacheData.links };
            switch (cacheData.type) {
                case 'add':
                    this.stackRemove(data);
                    break;
                case 'remove':
                    this.stackAdd(data);
                    break;
            }
        } else {
            show_message('没有更多操作！', 'warning');
        }
        console.log('undo', this.cacheStack);
    }
    // 获取node样式缓存
    getNodeStyle(nodeStyleFunction, data, hasAlgorithmStyle) {
        if (typeof nodeStyleFunction === 'function') {
            let nodeStyle = nodeStyleFunction.apply(this, [data]);
            this.maxNodeSize = Math.max(this.maxNodeSize, nodeStyle.size) || 1;
            if (hasAlgorithmStyle && data.algorithmStyle) {
                let algorithmStyle = data.algorithmStyle;
                this.maxNodeSize = Math.max(this.maxNodeSize, algorithmStyle.size);
                return {
                    ...nodeParam.ORIGINSTYLE,
                    ...nodeStyle,
                    ...algorithmStyle
                }
            } else {
                return {
                    ...nodeParam.ORIGINSTYLE,
                    ...nodeStyle,
                }
            }
        } else {
            return {
                ...nodeParam.ORIGINSTYLE
            }
        }
    }

    // 更新node样式
    updateNodeStyle() {
        let nodeStyleFunction = this.graphOptions.nodeStyleFunction,
            nodes = this.pixiChart.stage.getChildByName("nodeContainer").children,
            isFilter = arguments.length > 0;
        if (nodeStyleFunction) {
            for (let i = 0; i < nodes.length; i++) {
                let node = nodes[i];
                //如果有过滤条件先过滤节点
                if (isFilter) {
                    if (!arguments[0].apply(this, [node.data])) {
                        continue;
                    }
                }
                let styleMap = this.getNodeStyle(nodeStyleFunction, node.data, true);
                //修改颜色
                node.tint = styleMap.color;
                node.data.size = styleMap.size;
                //修改比例
                this.nodeScaleTo(node, node.scale.x, styleMap.size * node.originScale);

                //修改图标
                if (styleMap.icon) {
                    let nodeTexture, iconContainer = node.getChildByName("icon");
                    if (!PIXI.utils.TextureCache[styleMap.icon]) {
                        nodeTexture = PIXI.Texture.fromLoader(styleMap.icon, styleMap.icon);
                    } else {
                        nodeTexture = PIXI.utils.TextureCache[styleMap.icon];
                    }
                    iconContainer.texture = nodeTexture;
                }
                //修改label
                node.getChildByName("text") ? node.getChildByName("text").text = node.data[styleMap.tag] : '';
            }
        }
    }

    // 获取link样式缓存
    getLinkStyle(linkStyleFunction, data, hasAlgorithmStyle) {
        if (typeof linkStyleFunction === 'function') {
            let linkStyle = linkStyleFunction.apply(this, [data]);
            if (hasAlgorithmStyle) {
                let algorithmStyle = data.algorithmStyle || {};
                return {
                    ...linkParam.ORIGINSTYLE,
                    ...linkStyle,
                    ...algorithmStyle
                };
            } else {
                return {
                    ...linkParam.ORIGINSTYLE,
                    ...linkStyle,
                };
            }
        } else {
            return {
                ...linkParam.ORIGINSTYLE
            }
        }
    }

    // 更新link样式
    updateLinkStyle() {
        console.log('updateLinkStyle');
        let linkStyleFunction = this.graphOptions.linkStyleFunction,
            links = this.pixiChart.stage.getChildByName("linkContainer").children,
            isFilter = arguments.length > 0;
        if (linkStyleFunction) {
            for (let i = 0; i < links.length; i++) {
                let link = links[i], linkText = link.getChildByName("text"), linkTriangle = link.getChildByName("triangle");
                //如果有过滤条件先过滤节点
                if (isFilter) {
                    if (!arguments[0].apply(this, [link.data])) {
                        continue;
                    }
                }
                let styleMap = this.getLinkStyle(linkStyleFunction, link.data, true);
                styleMap.size = Number(styleMap.size);
                //修改颜色
                link.tint = styleMap.color;
                linkTriangle.tint = styleMap.color;

                //修改label
                linkText ? linkText.text = link.data.type : '';

                link.linkStyle = styleMap;

                //粗细
                const source = this.pixiChart.stage.getChildByName("nodeContainer").getChildByName(link.data.source.id),
                    target = this.pixiChart.stage.getChildByName("nodeContainer").getChildByName(link.data.target.id);

                if (!link.bezierData) {
                    link.height = linkParam.LINKWIDTH * styleMap.size;
                    this.moveNodeEvent(source);
                } else {
                    if (link.bezierData.linkType == 'bezierCurve') {
                        this.moveNodeEvent(source);
                        this.moveNodeEvent(target);
                    }
                }
            }
        }
    }
    // 导出png
    exportAsPng() {
        // let base64 = this.pixiChart.renderer.plugins.extract.base64(this.pixiChart.stage);

        // let aLink = document.createElement('a');
        // let blob = this.base64ToBlob(base64); //new Blob([content]);

        // let evt = document.createEvent("HTMLEvents");
        // evt.initEvent("click", true, true);//initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
        // aLink.download = 'graph.png';
        // aLink.href = URL.createObjectURL(blob);
        // aLink.click();

        let a = document.createElement("a"),
        imgData = this.pixiChart.view.toDataURL({
            format: 'png',
            quality: 1,
        }),
        blob = this.dataURLtoBlob(imgData),
        objUrl = URL.createObjectURL(blob);
        a.download = "graph.png";
        a.href = objUrl;
        a.click();
    }
    dataURLtoBlob(dataUrl) {
        let arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8Arr = new Uint8Array(n);
        while(n--) {
            u8Arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8Arr], { type: mime });
    }
    //base64转blob
    base64ToBlob(code) {
        let parts = code.split(';base64,');
        let contentType = parts[0].split(':')[1];
        let raw = window.atob(parts[1]);
        let rawLength = raw.length;

        let uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        return new Blob([uInt8Array], { type: contentType });
    }
    // 清除stage里的特效
    clearStageStyle() {
        this.cancelSelection();
        this.clearLinkStyle();
    }
    // 清除最短路径特效
    clearShortPath() {
        const nodeContainer = this.pixiChart.stage.getChildByName("nodeContainer"),
            linkContainer = this.pixiChart.stage.getChildByName("linkContainer");
        for (let i = 0; i < nodeContainer.children.length; i++) {
            let node = nodeContainer.children[i];
            if (node.data.algorithmStyle) {
                delete node.data.algorithmStyle;
            }
        }
        for (let i = 0; i < linkContainer.children.length; i++) {
            let link = linkContainer.children[i];
            if (link.data.algorithmStyle) {
                delete link.data.algorithmStyle;
            }
        }
        this.updateNodeStyle();
        this.updateLinkStyle();
    }
}
