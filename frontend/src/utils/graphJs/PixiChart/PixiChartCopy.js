/*
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2021-09-06 11:23:20
 * @Feature: 
 * @LastEditors: huangyixin
 * @LastEditTime: 2021-12-16 11:27:10
 * @FilePath: /GraphInsight/src/utils/graphJs/PixiChart/PixiChartCopy.js
 */
import * as PIXI from "pixi.js";
import * as d3 from "d3";
import addWheelListener from "./addWheelListener";
import forceLayoutWorker from "./layout/force/forceLayout.worker.js";
import forceLayout from "./layout/force/forceLayout.js";
import "./addInteractionEvent";
import {
  zoomParam,
  nodeParam,
  lineParam,
  textParam,
  triangleParam,
  HIDESCALE,
  defaultParam,
  layoutOrder
} from "./defaultParam";
import { show_message } from '@/utils/message';

export default class PixiChart {
  constructor(options) {
    console.log("options:", options);
    this.graphOptions = options;
    const pixiBox = document.getElementById(options.id),
    app = new PIXI.Application({
      backgroundColor: 0xf6f9fa,
      antialias: true, //抗锯齿
      width: options.width || defaultParam.DEFAULTSCREENWIDTH,
      height: options.height || defaultParam.DEFAULTSCREENHEIGHT,
      resolution: window.devicePixelRatio,
      autoDensity: true,
      resizeTo: pixiBox
    }),
    vm = this;

    app.render(); // 解决黑屏闪烁问题
    pixiBox.appendChild(app.view);

    this.graphId = options.id;
    this.nodeEvents = options.nodeEvents;
    this.linkEvents = options.linkEvents;
    this.graphEvents = options.graphEvents

    this.nodes = [];
    this.links = [];
    this.selectedNode = [];
    this.lastNodes = [];
    this.viewAttr = {
      width: app.view.width / window.devicePixelRatio,
      height: app.view.height / window.devicePixelRatio
    };
    this.simulation = null;
    this.timeInfo = {
      lastTickTime: 0,
      intervalTime: 0
    };
    this.rafId = null;
    this.stageDirty = {
      move: false,
      scale: false
    };
    this.cullList = [];
    this.cullScaleList = [];
    this.cullAlphaList = [];

    this.controlKey = undefined;
    this.nodeOpLock = false;

    this.pointerCoordinate = {
      x: this.viewAttr.width / 2,
      y: this.viewAttr.height / 2
    };

    this.layoutCount = 0;

    // 缓存数据 用于撤销/重做
    this.cacheStack = {
      content: [],
      index: -1
    }

    app.renderer.on("resize", function(screenWidth, screenHeight) {
      console.log("resize");
      vm.pixiChart.render(); // 解决黑屏闪烁问题
      vm.stageDirty.move = true;
      vm.viewAttr = {
        width: app.view.width / window.devicePixelRatio,
        height: app.view.height / window.devicePixelRatio
      };
    });
    // 避免js线程阻塞GUI线程 造成页面卡顿
    requestAnimationFrame(() => {
      this.pixiChart = app;
      this.initGraph(options.graphData);
    });
  }
  // 初始化图谱
  initGraph(graphData) {
    this.initContainer();
    this.initKeyBoradEvent();
    // this.loadTextFont();
    this.initStage();
    this.initElement();
    this.initLayoutByForce(graphData);
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
    // 圆形背景容器 使用particleContaniner 提升渲染速度
    const circleContainer = new PIXI.ParticleContainer(0, {
      tint: true
    });
    circleContainer.autoResize = true;
    circleContainer.name = "circleContainer";
    circleContainer.zIndex = 15;
    // 节点容器
    const nodeContainer = new PIXI.Container();
    nodeContainer.name = "nodeContainer";
    nodeContainer.zIndex = 20;
    nodeContainer.on("childAdded", function(event, container, index) {
      this.emit("finishNodeDraw", index);
    })
    // 节点文本容器
    const nodeTextContainer = new PIXI.Container();
    nodeTextContainer.name = "nodeTextContainer";
    nodeTextContainer.interactiveChildren = false;
    nodeTextContainer.zIndex = 25;
    // 节点边框容器
    const borderContainer = new PIXI.Container();
    borderContainer.name = "borderContainer";
    borderContainer.interactiveChildren = false;
    borderContainer.zIndex = 100;
    // 社区切分容器
    const communityContainer = new PIXI.Container();
    communityContainer.name = "communityContainer";
    communityContainer.interactiveChildren = false;
    communityContainer.zIndex = -10;
    // 层级容器
    // const bottomLayer = new PIXI.display.Layer(new PIXI.display.Group(1, true));
    // bottomLayer.name = "bottomLayer";
    // const topLayer = new PIXI.display.Layer(new PIXI.display.Group(10, true));
    // topLayer.name = "topLayer";
    // this.pixiChart.stage.addChild(bottomLayer);
    // this.pixiChart.stage.addChild(topLayer);

    stage.addChild(circleContainer);
    stage.addChild(nodeContainer);
    stage.addChild(nodeTextContainer);
    stage.addChild(borderContainer);
    stage.addChild(communityContainer);

    /** link相关容器 */
    // link容器
    const linkContainer = new PIXI.Container();
    linkContainer.name = "linkContainer";
    linkContainer.zIndex = -2;
    linkContainer.sortableChildren = true;
    // line文本容器
    const lineTextContainer = new PIXI.Container();
    lineTextContainer.name = "lineTextContainer";
    lineTextContainer.interactiveChildren = false;
    lineTextContainer.zIndex = -1;
    // line箭头容器
    const triangleContainer = new PIXI.Container();
    triangleContainer.name = "triangleContainer";
    triangleContainer.zIndex = -2;
    triangleContainer.interactiveChildren = false;

    stage.addChild(linkContainer);
    stage.addChild(lineTextContainer);
    stage.addChild(triangleContainer);

    /** 层级容器 */
    const layerContainer = new PIXI.Container();
    layerContainer.name = "layerContainer";
    layerContainer.zIndex = 50;
    stage.addChild(layerContainer);

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
  initLink(links) {
    const startTime = performance.now();
    console.log(">--------startDrawLink--------<");
    const linksLength = links.length;
    for (let i = 0; i < linksLength; i++) {
      this.drawLinkContainer(links[i]);
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
      .on("mousedown", function(event) {
        // console.log("globalPosition:", this.getGlobalPosition());
        console.log("app:", vm.pixiChart);
        stage.interactiveChildren = false;
        const pos = event.data.global;
        prevX = pos.x;
        prevY = pos.y;
        this.dragging = true;
        vm.stageDirty.move = true;
        vm.cancelSelection();
        // 判断是否为长按
        pressId = setTimeout(() => {
          this.isPress = true;
          this.cursor = "press";
          const selectRect = new PIXI.Graphics();
          selectRect.name = "selectRect";
          this.addChild(selectRect);
        }, 600);

        vm.pointerCoordinate = {
          x: this.x,
          y: this.y
        };
        
        this.emit("onSelectionChange", []);

      })
      .on("mousemove", function(event) {
        pressId && clearTimeout(pressId);
        pressId = null;
        if (this.isPress) {
          // 绘制选择框
          const selectRect = this.getChildByName("selectRect"),
          pos = event.data.global,
          nodeContainer = this.getChildByName("nodeContainer"),
          borderContainer = vm.pixiChart.stage.getChildByName("borderContainer"),
          originX = (prevX - stage.x) / stage.scale.x,
          originY = (prevY - stage.y) / stage.scale.y,
          rectWidth = (pos.x - prevX) / stage.scale.x,
          rectHeight = (pos.y - prevY) / stage.scale.y,
          rectX = pos.x - prevX > 0 ? originX : originX + rectWidth,
          rectY = pos.y - prevY > 0 ? originY : originY + rectHeight,
          selectNode = [];

          selectRect.clear();
          selectRect.lineStyle(1, 0xff0000);
          selectRect.beginFill(0x237cf6, 0.5);
          selectRect.drawRect(originX, originY, rectWidth, rectHeight);

          nodeContainer.children.forEach(item => {
            if (item.visible) {
              const isSelect =
                item.cullObj.x + item.cullObj.width > rectX &&
                item.cullObj.x < rectX + Math.abs(rectWidth) &&
                item.cullObj.y + item.cullObj.height > rectY &&
                item.cullObj.y < rectY + Math.abs(rectHeight);
              let selectedBorder = borderContainer.getChildByName(item.data.id);
              if (isSelect) {
                if (!selectedBorder) vm.setSelection(item.data.id, item);
              } else {
                if (selectedBorder) {
                  vm.selectedNode.splice(vm.selectedNode.indexOf(item.data.id), 1);
                  borderContainer.removeChild(selectedBorder);
                }
              }
              if (vm.selectedNode.indexOf(item.data.id) != -1) {
                selectNode.push(item);
              }
            }
          });

          this.emit("onSelectionChange", selectNode.map(node => {
            return {
              id: node.data.id,
              name: node.data.name
            }
          }));

          return;
        }
        if (!this.dragging) {
          return;
        }

        const pos = event.data.global;
        const dx = pos.x - prevX;
        const dy = pos.y - prevY;

        this.position.x += dx;
        this.position.y += dy;

        prevX = pos.x;
        prevY = pos.y;

        vm.stageDirty.move = true;
      })
      .on("mouseup", function(event) {
        this.dragging = false;
        stage.interactiveChildren = true;
        // 取消长按效果
        pressId && clearTimeout(pressId);
        pressId = null;
        this.isPress = false;
        this.cursor = "default";
        this.removeChild(this.getChildByName("selectRect"));

      })
      .on("mouseupoutside", function() {
        this.dragging = false;
        stage.interactiveChildren = true;

      });

    for (const i in vm.graphEvents) {
      stage.on(i, vm.graphEvents[i]);
    }
    // stage鼠标滚轮事件
    addWheelListener(this.pixiChart.renderer.view, function(e) {
      // 阻止默认行为
      e.preventDefault && e.preventDefault();
      // deltaY向下滚动为正 向上为负 否则为0
      const isZoomIn = e.deltaY < 0;
      if(!(stage.scale.x > zoomParam.ZOOM_MAX && isZoomIn) && !(stage.scale.x < zoomParam.ZOOM_MIN && !isZoomIn)) {
        vm.stageZoom(e.offsetX, e.offsetY, isZoomIn);
      }
    });
  }
  // 初始化画布scale
  initScale() {
    const stage = this.pixiChart.stage,
    nodeContainer = stage.getChildByName("nodeContainer"),
    nodeBounds = this.getNodeLocalBounds(),
    scaleX = isFinite(this.viewAttr.width / nodeBounds.width) ? this.viewAttr.width / nodeBounds.width : this.viewAttr.width / (stage.width / stage.scale.x),
    scaleY = isFinite(this.viewAttr.height / nodeBounds.height) ? this.viewAttr.height / nodeBounds.height : this.viewAttr.height / (stage.height / stage.scale.y),
    thresholdScale = 1.2,
    // scaleX = this.viewAttr.width / (stage.width / stage.scale.x),
    // scaleY = this.viewAttr.height / (stage.height / stage.scale.y),
    scale = Math.min(scaleX, scaleY),
    vm = this;
    // 根据画布中的实际元素数量调整scale 使得画布能显示出所有元素
    const zoom = function() {
      const i = Math.min(stage.scale.x, stage.scale.y);
      if (i > scale / thresholdScale) {
        vm.stageZoom(vm.viewAttr.width / 2, vm.viewAttr.height / 2, !(i > scale / thresholdScale));
      } else {
        vm.pixiChart.ticker.remove(zoom);
        zoomParam.ZOOM_MIN = i;
      }
    };
    this.setCull("scale");
    this.pixiChart.ticker.add(zoom);
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
  stageZoom(x, y, isZoomIn, stepScale = 0.08) {
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

      this.setCull("scale");
      zoomRafId = null;
    });
  }
  // 初始化额外需要的元素
  initElement() {
    this.drawNodeBorder(defaultParam.DEFAULTNODEBORDER);
  }
  initLayout(graphData) {
    if (!graphData || !graphData.nodes || (graphData.nodes && graphData.nodes.length == 0)) return;
    const nodeContainer = this.pixiChart.stage.getChildByName("nodeContainer"), originLength = nodeContainer.children.length, vm = this;
    nodeContainer.on("finishNodeDraw", function(index) {
      if (graphData.nodes.length - 1 == index - originLength) {
        vm.initScale();
        // 更新图谱数据
        vm.pixiChart.stage.emit("onDataUpdated");
        this.off("finishNodeDraw");
      }
    });
    const nodesMap = {}, axisMap = this.graphOptions.graphData.axisMap;

    graphData.nodes.forEach(item => {
      item.x = axisMap[item.id].x;
      item.y = axisMap[item.id].y;
      nodesMap[item.id] = item;
    });
    this.graphOptions.graphData.axisMap = '';
    
    graphData.links.forEach(item => {
      item.from = item.source;
      item.to = item.target;
      item.source = nodesMap[item.from];
      item.target = nodesMap[item.to];
    });
    
    this.initNodes(graphData.nodes);
    this.initLink(graphData.links);
  }
  // 使用webworker计算布局 防止大计算量阻塞主线程
  initLayoutByForce(graphData) {
    if (!graphData || !graphData.nodes || (graphData.nodes && graphData.nodes.length == 0)) return;
    const worker = new forceLayoutWorker(), vm = this,
    message = {
      nodes: graphData.nodes || [],
      links: graphData.links || [],
      width: this.viewAttr.width,
      height: this.viewAttr.height,
      tick: 30
    };
    worker.postMessage(message);
    worker.onmessage = function(event) {
      if (event.data.type == "end") {
        console.log("event:", event);
        const nodeContainer = vm.pixiChart.stage.getChildByName("nodeContainer"), originLength = nodeContainer.children.length;
        nodeContainer.on("finishNodeDraw", function(index) {
          if (event.data.nodes.length - 1 == index - originLength) {
            vm.initScale();
            // 更新图谱数据
            vm.pixiChart.stage.emit("onDataUpdated");
            this.off("finishNodeDraw");
            // 关闭worker线程
            worker.terminate();
          }
        });
        this.simulation = event.data.simulation;
        vm.initNodes(event.data.nodes);
        vm.initLink(event.data.links);
      }
    };
  }
  // 刷新力导向布局 计算动画补间
  refreshForceLayout() {
    const worker = new forceLayoutWorker(), vm = this,
    { nodes, links } = this.exportData();
    vm.stopRender();
    worker.postMessage({
      nodes: nodes,
      links: links,
      width: this.viewAttr.width,
      height: this.viewAttr.height,
      tick: 30
    });
    worker.onmessage = function(event) {
      if (event.data.type == "tick") {
        const nowTime = performance.now();
        // 每个tick之间的间隔时间
        vm.timeInfo.intervalTime = nowTime - (vm.timeInfo.lastTickTime || nowTime);
        console.log("intervalTime", vm.timeInfo.intervalTime);
        // 当前tick的时间
        vm.timeInfo.lastTickTime = nowTime;
        if (event.data.currentTick == 0) {
          vm.lastNodes = event.data.nodes;
        } else {
          if (event.data.currentTick == 1) {
            vm.nodes = vm.lastNodes;
            vm.startRender();
          }
          vm.lastNodes = vm.nodes;
          vm.nodes = event.data.nodes;
        }
      } else {
        console.log("endForceLayout:", event);
        // 关闭worker线程
        vm.stopRender();
        worker.terminate();
      }
    };
  }
  // 停止布局
  stopRender() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
      this.nodes = null;
      this.lastNodes = null;
    }
  }
  // 开始布局
  startRender() {
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(this.renderAnimation.bind(this));
    }
  }
  renderAnimation() {
    this.rafId = null;
    const nodeContainer = this.pixiChart.stage.getChildByName("nodeContainer"),
    circleContainer = this.pixiChart.stage.getChildByName("circleContainer"),
    nodeTextContainer = this.pixiChart.stage.getChildByName("nodeTextContainer"),
    nodes = this.nodes,
    length = nodes.length,
    lastNodes = this.lastNodes,
    nowTime = performance.now(),
    stepTime = nowTime - this.timeInfo.lastTickTime;
    console.log("stepTime:", stepTime);
    if (stepTime <= this.timeInfo.intervalTime) {
      for (let i = 0; i < length; i++) {
        if (!this.rafId) break;
        nodeContainer.children[i].x = Math.floor((nodes[i].x - lastNodes[i].x) / this.timeInfo.intervalTime * stepTime + lastNodes[i].x);
        nodeContainer.children[i].y = Math.floor((nodes[i].y - lastNodes[i].y) / this.timeInfo.intervalTime * stepTime + lastNodes[i].y);
        circleContainer.children[i].x = nodeContainer.children[i].x - circleContainer.children[i].width / 2;
        circleContainer.children[i].y = nodeContainer.children[i].y - circleContainer.children[i].width / 2;
        nodeTextContainer.children[i].x = nodeContainer.children[i].x - nodeTextContainer.children[i].width / 2;
        nodeTextContainer.children[i].y = nodeContainer.children[i].y + nodeParam.NODE_RADIUS;
      }
    }
    console.log("setTime:", performance.now() - nowTime);
    this.startRender();
  }
  // 设置力导向布局 这里暂时借用d3中的force布局
  setForceLayout() {
    const { nodes, links } = this.exportData();
    this.simulation = forceLayout(nodes, links, this.viewAttr.width, this.viewAttr.height).simulation;
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
  // 层级判断
  isLayer(node) {
    // pixi-layer插件 大数据下有性能问题
    // if (this.topLayer) {
    //   this.topLayer.parentGroup = this.pixiChart.stage.getChildByName("bottomLayer").group;
    //   this.getObjectById(this.topLayer.data.id, "circle").parentGroup = this.topLayer.parentGroup;
    //   this.getObjectById(this.topLayer.data.id, "text").parentGroup = this.topLayer.parentGroup;
    //   this.pixiChart.stage.getChildByName("borderContainer").getChildByName("HOVERBORDER").parentGroup = this.topLayer.parentGroup;
    // }
    // this.topLayer = node;
    // node.parentGroup = this.pixiChart.stage.getChildByName("topLayer").group;
    // this.getObjectById(node.data.id, "circle").parentGroup = node.parentGroup;
    // this.getObjectById(node.data.id, "text").parentGroup = node.parentGroup;
    // this.pixiChart.stage.getChildByName("borderContainer").getChildByName("HOVERBORDER").parentGroup = node.parentGroup;

    // node.zIndex = 20;
    // if (node.getChildByName("layer")) node.removeChild(node.getChildByName("layer"));
    // node.children[0].zIndex = 10;

    // 临时创建背景进行层级遮挡
    const layerContainer = this.pixiChart.stage.getChildByName("layerContainer"),
    layerNode = layerContainer.getChildByName(node.data.id);
    if (!layerNode) {
      const circleBox = new PIXI.Sprite(PIXI.utils.TextureCache.cacheCircleBox);
      circleBox.x = node.x;
      circleBox.y = node.y;
      circleBox.tint = node.data.color ? node.data.color.replace("#", "0x") : nodeParam.NODE_COLOR;
      circleBox.name = node.data.id;
      circleBox.anchor.set(0.5, 0.5);
      const sprite = new PIXI.Sprite(node.texture);
      sprite.width = node.width;
      sprite.height = node.height;
      sprite.x = -sprite.width / 2;
      sprite.y = -sprite.height / 2;
      circleBox.addChild(sprite);
      layerContainer.addChild(circleBox);
    } else {
      layerContainer.removeChild(layerNode);
      layerContainer.addChild(layerNode);
    }
  }
  /**
   * @method: 绘制node的边框 hover时展示
   * @for: 
   * @param {*} borderArr 需要绘制的id或id数组
   * @return {*}
   */  
  drawNodeBorder(borderArr) {
    const arr = [];
    if (!Array.isArray(borderArr)) borderArr = [borderArr];
    borderArr.forEach(id => {
      const borderContainer = this.pixiChart.stage.getChildByName("borderContainer"),
      border = new PIXI.Graphics();
      if (!borderContainer.getChildByName(id)) {
        this.selectedNode.push(id);
        border.lineStyle(nodeParam.NODE_BORDER_WIDTH - 2, nodeParam.NODE_BORDER_COLOR);
        border.drawCircle(0, 0, nodeParam.NODE_RADIUS + 5);
        border.name = id;
        border.visible = false;
        this.pixiChart.stage.getChildByName("borderContainer").addChild(border);
        arr.push(border);
      }
    });
    return arr.length == 1 ? arr[0] : arr;
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
    circleContainer = this.pixiChart.stage.getChildByName("circleContainer"),
    nodeTextContainer = this.pixiChart.stage.getChildByName("nodeTextContainer");
    // 绘制图标
    let nodeTexture;
    if (!PIXI.utils.TextureCache[data.iconName]) {
      if (data.iconName) {
        // nodeTexture = PIXI.Texture.fromLoader(require(`@/assets/nodePng/${data.iconName}-01.png`), data.iconName);
      } else {
        // nodeTexture = PIXI.Texture.fromLoader(require(`@/assets/nodePng/默认-01.png`), 'default');
      }
    } else {
      nodeTexture = PIXI.utils.TextureCache[data.iconName];
    }
    const drawIcon = function() {
      const sprite = new PIXI.Sprite(nodeTexture);
      sprite.height = nodeParam.NODE_RADIUS * nodeTexture.height / nodeTexture.width * nodeParam.ICONSCALE;
      sprite.width = nodeParam.NODE_RADIUS * nodeParam.ICONSCALE;
      sprite.x = data.x;
      sprite.y = data.y;
      sprite.anchor.set(0.5, 0.5);
      sprite.name = data.id;
      sprite.data = data;
      sprite.data.dataLinks = sprite.data.dataLinks || [];
      sprite.cacheData = {};
      sprite.isNode = true;
      sprite.interactive = true;
      sprite.buttonMode = true;
      sprite.hitArea = new PIXI.Circle(0, 0, nodeParam.NODE_RADIUS / Math.min(sprite.scale.x,sprite.scale.y));
      // 绑定节点默认事件
      sprite
        .on("pointerdown", function(event) {
          event.stopPropagationHint = true;
          this.dragging = true;
          this.dragPoint = event.data.getLocalPosition(this.parent);
          this.dragPoint.x -= this.x;
          this.dragPoint.y -= this.y;

          vm.pointerCoordinate = {
            x: this.x,
            y: this.y
          };

          vm.nodeOpLock = true;
          // 左键单击选中
          const borderContainer = vm.pixiChart.stage.getChildByName("borderContainer"),
          nodeContainer = vm.pixiChart.stage.getChildByName("nodeContainer");
          let selectedBorder = borderContainer.getChildByName(this.data.id);
          // 多选操作默认为ctrl + click
          if (event.data.originalEvent.ctrlKey) {
            if (selectedBorder) {
              vm.selectedNode = vm.selectedNode.filter(id => {
                return id != this.data.id;
              });
              borderContainer.removeChild(selectedBorder);
            }
          }
          if (!selectedBorder) {
            if (!event.data.originalEvent.ctrlKey) {
              vm.selectedNode = [];
              if (borderContainer.children.length > defaultParam.DEFAULTNODEBORDER.length) {
                borderContainer.removeChildren(defaultParam.DEFAULTNODEBORDER.length, borderContainer.children.length);
              }
            }
            vm.setSelection(this.data.id, this);
          }
          vm.cacheNodeData(this);

          this.emit("onSelectionChange", nodeContainer.children.filter(item => {
              return vm.selectedNode.indexOf(item.data.id) != -1;
            }).map(node => {
              return {
                id: node.data.id,
                name: node.data.name
              }
          }));
          console.log("this:", this);
        })
        .on("pointermove", function(event) {
          if (this.dragging) {
            const newPosition = event.data.getLocalPosition(this.parent),
            lastX = this.x,
            lastY = this.y;
            // 改变node坐标
            this.x = newPosition.x - this.dragPoint.x;
            this.y = newPosition.y - this.dragPoint.y;

            // 偏移量
            const offsetX = this.x - lastX,
            offsetY = this.y - lastY;

            vm.selectedNode.forEach(id => {
              const item = vm.pixiChart.stage.getChildByName("nodeContainer").getChildByName(id);
              if (item.data.id != this.data.id) {
                item.x += offsetX;
                item.y += offsetY;
              }
              vm.moveNodeEvent(item, { x: offsetX, y: offsetY });
              // 重绘社区切分
              const community = item.cacheData.nodeGroup.communityObj;
              if (community.data) {
                community.data.isChange = true;
              }
            });
            const communityContainer = vm.pixiChart.stage.getChildByName("communityContainer");
            communityContainer.children.forEach(item => {
              if (item.data.isChange) {
                item.data.isChange = false;
                const coordinatesList = [];
                let xMin, yMin, xMax, yMax;
                item.data.spriteList.forEach((node, index) => {
                  if (index == 0) {
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
                });
                const offsetX = xMin < 0 ? Math.abs(xMin) : 0, offsetY = yMin < 0 ? Math.abs(yMin) : 0;
                coordinatesList.forEach(item => {
                  item.x += offsetX;
                  item.y += offsetY;
                });
                item.clear();
                item.lineStyle(1);
                item.beginFill(0x3eaf7c, 1);

                const contour = d3
                  .contourDensity()
                  .x(function(d) {
                    return d.x;
                  })
                  .y(function(d) {
                    return d.y;
                  })
                  .size([xMax + offsetX, yMax + offsetY])
                  .thresholds(6)(coordinatesList);

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
            });
          }
        })
        .on("pointerup", function(event) {
          event.stopPropagationHint = true;
          this.dragging = false;

          vm.nodeOpLock = false;
        })
        .on("pointerupoutside", function() {
          this.dragging = false;
        })
        .on("mouseover", function() {
          // 防止在拖拽node时 由于拖拽过快而导致鼠标hover到其他节点造成bug
          if (!vm.nodeOpLock) {
            this.data.dataLinks && this.data.dataLinks.forEach(item => {
              const link = (this.cacheData.linksGroup && this.cacheData.linksGroup[item.id]) ? this.cacheData.linksGroup[item.id].link : vm.pixiChart.stage.getChildByName("linkContainer").getChildByName(item.id),
              triangle = (this.cacheData.linksGroup && this.cacheData.linksGroup[item.id]) ? this.cacheData.linksGroup[item.id].triangle : vm.pixiChart.stage.getChildByName("triangleContainer").getChildByName(item.id);

              if (!link.selfData) {
                if (!link.isHighlight) {
                  link.height = lineParam.LINEWIDTH * 2;
                }
              } else {
                if (link.selfData.linkType == 'bezierCurve') {
                  const source = item.source == this.data.id ? this : (this.cacheData.linksGroup && this.cacheData.linksGroup[item.id]) ? this.cacheData.linksGroup[item.id].node : vm.pixiChart.stage.getChildByName("nodeContainer").getChildByName(item.source),
                  target = item.target == this.data.id ? this : (this.cacheData.linksGroup && this.cacheData.linksGroup[item.id]) ? this.cacheData.linksGroup[item.id].node : vm.pixiChart.stage.getChildByName("nodeContainer").getChildByName(item.target)
                  vm.redrawBezierCurve(link, source, target, {
                    width: lineParam.LINEWIDTH * 2,
                    color: 0xffffff
                  });
                }
              }

              if (!link.isHighlight) {
                triangle.tint = lineParam.LINEHIGHLIGHT;
                link.tint = lineParam.LINEHIGHLIGHT;
              }
            });


            const nodeText = (this.cacheData.nodeGroup && this.cacheData.nodeGroup.textObj) ? this.cacheData.nodeGroup.textObj : vm.pixiChart.stage.getChildByName("nodeTextContainer").getChildByName(this.data.id);
            nodeText && nodeText.scale.set(textParam.SCALEFONTSIZE, textParam.SCALEFONTSIZE);

            // vm.isLayer(this);
          }
        })
        .on("mouseout", function() {
          if (!vm.nodeOpLock) {
            this.data.dataLinks && this.data.dataLinks.forEach(item => {
              const link = (this.cacheData.linksGroup && this.cacheData.linksGroup[item.id]) ? this.cacheData.linksGroup[item.id].link : vm.pixiChart.stage.getChildByName("linkContainer").getChildByName(item.id),
              triangle = (this.cacheData.linksGroup && this.cacheData.linksGroup[item.id]) ? this.cacheData.linksGroup[item.id].triangle : vm.pixiChart.stage.getChildByName("triangleContainer").getChildByName(item.id);
              
              if (!link.selfData) {
                if (!link.isHighlight) {
                  // link.height = lineParam.LINEWIDTH / vm.pixiChart.stage.scale.y;
                link.height = lineParam.LINEWIDTH;
                }
              } else {
                if (link.selfData.linkType == 'bezierCurve') {
                  const source = item.source == this.data.id ? this : (this.cacheData.linksGroup && this.cacheData.linksGroup[item.id]) ? this.cacheData.linksGroup[item.id].node : vm.pixiChart.stage.getChildByName("nodeContainer").getChildByName(item.source),
                  target = item.target == this.data.id ? this : (this.cacheData.linksGroup && this.cacheData.linksGroup[item.id]) ? this.cacheData.linksGroup[item.id].node : vm.pixiChart.stage.getChildByName("nodeContainer").getChildByName(item.target)
                  vm.redrawBezierCurve(link, source, target, {
                    width: lineParam.LINEWIDTH,
                    color: 0xffffff
                  });
                }
              }

              if (!link.isHighlight) {
                triangle.tint = lineParam.LINECOLOR;
                link.tint = lineParam.LINECOLOR;
              }

            });

            const nodeText = (this.cacheData.nodeGroup && this.cacheData.nodeGroup.textObj) ? this.cacheData.nodeGroup.textObj : vm.pixiChart.stage.getChildByName("nodeTextContainer").getChildByName(this.data.id);
            nodeText && nodeText.scale.set(textParam.FONTSIZE, textParam.FONTSIZE);

          }
        })
      for (const i in vm.nodeEvents) {
        sprite.on(i, vm.nodeEvents[i]);
      }
      nodeContainer.addChild(sprite);
    };
    // 需要等纹理加载完毕 否则width和height会为1
    if (nodeTexture && nodeTexture.baseTexture.valid) {
      drawIcon();
    } else {
      nodeTexture && nodeTexture.baseTexture.on("update", () => {
        drawIcon();
      });
    }

    // 绘制圆形
    let circleBox;
    if (!PIXI.utils.TextureCache.cacheCircleBox) {
      circleBox = new PIXI.Graphics();
      circleBox.beginFill(0xffffff);
      circleBox.drawCircle(0, 0, nodeParam.NODE_RADIUS);
      circleBox.endFill();
      circleBox = vm.pixiChart.renderer.generateTexture(circleBox, PIXI.settings.SCALE_MODES, window.devicePixelRatio);
      PIXI.Texture.addToCache(circleBox, "cacheCircleBox");
    } else {
      circleBox = PIXI.utils.TextureCache.cacheCircleBox;
    }
    circleBox = new PIXI.Sprite(circleBox);
    circleBox.x = -circleBox.width / 2 + data.x;
    circleBox.y = -circleBox.height / 2 + data.y;
    circleBox.name = data.id;
    circleBox.tint = data.color ? data.color.replace("#", "0x") : nodeParam.NODE_COLOR;
    circleContainer.addChild(circleBox);

    // 绘制文本 耗时久 因为不同文本占用了不同的缓存
    // const textBox = new PIXI.BitmapText(data.name + "", {
    //   fontName: "nodeLabelFont"
    // });
    const textBox = new PIXI.Text(data.name, {
      fill: "#fff",
      stroke: "#5a5a5a",
      strokeThickness: 20,
      lineJoin: "round"
    });
    textBox.anchor.set(0.5, 0);
    textBox.x = data.x;
    textBox.y = data.y + nodeParam.NODE_RADIUS + nodeParam.NODE_BORDER_WIDTH;
    textBox.name = data.id;
    textBox.visible = false;
    textBox.scale.set(textParam.FONTSIZE, textParam.FONTSIZE);
    
    // const textBackground = new PIXI.Sprite(PIXI.Texture.WHITE);
    // textBackground.tint = 0x636363;
    // textBackground.anchor.set(0.5, 0);
    // textBackground.alpha = 0.3;
    // textBackground.width = (textBox.width + textParam.PADDING) / textParam.FONTSIZE;
    // textBackground.height = textBox.height / textParam.FONTSIZE;
    // textBox.addChild(textBackground);

    nodeTextContainer.addChild(textBox);

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
  moveNodeEvent(node, offset) {
    node.isChange = true;
    // 改变节点text坐标
    const text = node.cacheData.nodeGroup.textObj;
    text.x += offset.x;
    text.y += offset.y;
    // text.x = node.x;
    // text.y = node.y + nodeParam.NODE_RADIUS + nodeParam.NODE_BORDER_WIDTH;
    text.isChange = true;
    // 改变circle坐标
    const circle = node.cacheData.nodeGroup.circleObj;
    circle.x += offset.x;
    circle.y += offset.y;
    // circle.x = node.x - circle.width / 2;
    // circle.y = node.y - circle.height / 2;
    // 改变border坐标
    const border = node.cacheData.nodeGroup.borderObj;
    border.x += offset.x;
    border.y += offset.y;
    // border.x = node.x;
    // border.y = node.y;
    // 改变layer遮挡层
    // const layerNode = this.pixiChart.stage.getChildByName("layerContainer").getChildByName(node.data.id) || {};
    // layerNode.x = node.x;
    // layerNode.y = node.y;
    // 改变所连link坐标
    const linksLength = node.data.dataLinks.length;
    for (let i = 0; i < linksLength; i++) {
      const source = node.data.dataLinks[i].source == node.data.id ? node : node.cacheData.linksGroup[node.data.dataLinks[i].id].node,
      target = node.data.dataLinks[i].target == node.data.id ? node : node.cacheData.linksGroup[node.data.dataLinks[i].id].node,
      link = node.cacheData.linksGroup[node.data.dataLinks[i].id].link,
      textBox = node.cacheData.linksGroup[node.data.dataLinks[i].id].text,
      triangle = node.cacheData.linksGroup[node.data.dataLinks[i].id].triangle;
      if (source.data.id != target.data.id) {
        if (!link.selfData) {
          link.rotation = Math.atan2(target.y - source.y, target.x - source.x);
          link.x = source.x + nodeParam.NODE_RADIUS * Math.cos(link.rotation);
          link.y = source.y + nodeParam.NODE_RADIUS * Math.sin(link.rotation);
          link.width = Math.max(Math.sqrt((source.x - target.x) ** 2 + (source.y - target.y) ** 2) - nodeParam.NODE_RADIUS * 2, 0);
  
          if ((link.rotation < -Math.PI / 2 && link.rotation > -Math.PI) || (link.rotation < Math.PI && link.rotation > Math.PI / 2)) {
            textBox.rotation = link.rotation - Math.PI;
          }else {
            textBox.rotation = link.rotation;
          }
          textBox.x = (source.x + target.x) / 2;
          textBox.y = (source.y + target.y) / 2 - textBox.height / 2;
  
          triangle.rotation = link.rotation;
          triangle.x = source.x + (link.width + nodeParam.NODE_RADIUS) * Math.cos(link.rotation);
          triangle.y = source.y + (link.width + nodeParam.NODE_RADIUS) * Math.sin(link.rotation);
        } else {
          this.redrawBezierCurve(link, source, target, {
            width: link.line.width,
            color: 0xffffff
          })
          
          const rotation = Math.atan2(target.y - source.y, target.x - source.x),
          cpX2 = (source.x + target.x) / 2,
          cpY2 = (source.y + target.y) / 2 + ((-1) ** link.selfData.number) * Math.ceil(link.selfData.number * 0.5) * nodeParam.NODE_RADIUS * 2,
          toX = target.x - nodeParam.NODE_RADIUS * Math.cos(rotation),
          toY = target.y - nodeParam.NODE_RADIUS * Math.sin(rotation);

          // 设置三角形坐标
          triangle.rotation = Math.atan2(cpY2 - toY, cpX2 - toX) - Math.PI;
          triangle.x = toX;
          triangle.y = toY;

          // 设置文本坐标
          if (rotation - Math.PI < - Math.PI / 2 && rotation - Math.PI > -Math.PI * 1.5) {
            textBox.rotation = rotation - Math.PI * 2;
          } else {
            textBox.rotation = rotation - Math.PI;
          }
          textBox.x = cpX2;
          textBox.y = (cpY2 + (source.y + target.y) / 2) / 2 - textBox.height / 2;
        }
      } else {
        link.x = source.x;
        link.y = source.y;

        textBox.x += offset.x;
        textBox.y += offset.y;

        triangle.x = source.x - nodeParam.NODE_RADIUS;
        triangle.y = source.y - lineParam.LINEWIDTH;
      }
      link.isChange = true;
      textBox.isChange = true;
      triangle.isChange = true;
    }
  }
  // 绘制link实例
  drawLinkContainer(data, noLength) {
    const source = data.source,
    target = data.target;
    // 判断该link的source和target是有效的
    if (!(source.id && target.id)) {
      return;
    }
    // 节点需要更新data 这步操作是为了将节点中的data和link中的source和target产生对象引用关系
    if (source.needUpdate) {
      const sourceNode = this.getObjectById(source.id, "node");
      source.needUpdate = false;
      source.dataLinks = sourceNode.data.dataLinks;
      source.linkCount = sourceNode.data.linkCount;
      sourceNode.data = source;
    }
    if (target.needUpdate) {
      const targetNode = this.getObjectById(target.id, "node");
      target.needUpdate = false;
      target.dataLinks = targetNode.data.dataLinks;
      target.linkCount = targetNode.data.linkCount;
      targetNode.data = target;
    }

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
      !source.linkCount ? source.linkCount = {
        selfLink: 0,
        multipleLink: 0
      } : '';
      !target.linkCount ? target.linkCount = {
        selfLink: 0,
        multipleLink: 0
      } : '';
    } else {
      source.dataLinks ? source.dataLinks.push(linkObj) : source.dataLinks = [linkObj];
      !source.linkCount ? source.linkCount = {
        selfLink: 0,
        multipleLink: 0
      } : '';
    }

    const vm = this;

    // 绘制三角箭头 Graphics -> texture
    let triangle;
    if (!PIXI.utils.TextureCache.triangle) {
      triangle = new PIXI.Graphics();
      triangle.beginFill(0xffffff);
      triangle.moveTo(-triangleParam.TRIANGLEWIDTH, triangleParam.TRIANGLEWIDTH);
      triangle.lineTo(-triangleParam.TRIANGLEWIDTH, -triangleParam.TRIANGLEWIDTH);
      triangle.lineTo(triangleParam.TRIANGLEWIDTH, 0);
      triangle.lineTo(-triangleParam.TRIANGLEWIDTH, triangleParam.TRIANGLEWIDTH);
      triangle.endFill();
      triangle = this.pixiChart.renderer.generateTexture(triangle, PIXI.settings.SCALE_MODES, window.devicePixelRatio);
      PIXI.Texture.addToCache(triangle, "triangle");
    } else {
      triangle = PIXI.utils.TextureCache.triangle;
    }
    triangle = new PIXI.Sprite(triangle);
    triangle.name = data.id;
    triangle.tint = triangleParam.TRIANGLECOLOR;
    triangle.visible = false;
    triangle.pivot.set(triangleParam.TRIANGLEWIDTH * 2, triangleParam.TRIANGLEWIDTH);

    // 设置link上的文字
    // const textBox = new PIXI.BitmapText(data.name + "", {
    //   fontName: "linkLabelFont"
    // });
    const textBox = new PIXI.Text(data.name, {
      fill: "#fff",
      stroke: "#3a3a3a",
      strokeThickness: 20,
      lineJoin: "round"
    });
    textBox.name = data.id;
    textBox.anchor.set(0.5, 0);
    textBox.scale.set(textParam.FONTSIZE, textParam.FONTSIZE);
    textBox.visible = false;

    let line = null;

    // link有三种情况 1.直线、2.贝塞尔曲线、3.指向自身的曲线
    if (source.id != target.id) {
      // 这里需要判断是否有多条线在两点之间
      let isOnly = true;
      for (let i = 0; i < source.dataLinks.length; i++) {
        let link = source.dataLinks[i];
        if (link.id != data.id) {
          if (link.source == source.id && link.target == target.id || link.source == target.id && link.target == source.id) {
            isOnly = false;
          }
        }
      }
      if (isOnly) {
        // 1.直线
        line = new PIXI.Sprite(PIXI.Texture.WHITE);
        line.width = noLength ? 0 : Math.sqrt((source.x - target.x) ** 2 + (source.y - target.y) ** 2) - nodeParam.NODE_RADIUS * 2;
        line.height = lineParam.LINEWIDTH;
        line.anchor.set(0, 0.5);
        line.rotation = Math.atan2(target.y - source.y, target.x - source.x);
        line.x = source.x + nodeParam.NODE_RADIUS * Math.cos(line.rotation);
        line.y = source.y + nodeParam.NODE_RADIUS * Math.sin(line.rotation);
        line.tint = lineParam.LINECOLOR;
        
        // 设置三角形坐标
        triangle.rotation = line.rotation;
        triangle.x = noLength ? this.viewAttr.width / 2 : source.x + (line.width + nodeParam.NODE_RADIUS) * Math.cos(line.rotation);
        triangle.y = noLength ? this.viewAttr.height / 2 : source.y + (line.width + nodeParam.NODE_RADIUS) * Math.sin(line.rotation);

        // 设置文本坐标
        if (line.rotation - Math.PI < - Math.PI / 2 && line.rotation - Math.PI > -Math.PI * 1.5) {
          textBox.rotation = line.rotation - Math.PI * 2;
        } else {
          textBox.rotation = line.rotation - Math.PI;
        }
        textBox.x = noLength ? this.viewAttr.width / 2 : (target.x + source.x) / 2;
        textBox.y = noLength ? this.viewAttr.height / 2 : (target.y + source.y) / 2 - textBox.height / 2;
      } else {
        // 2.贝塞尔曲线
        // 记录特殊曲线
        source.linkCount.multipleLink += 1;
        target.linkCount.multipleLink += 1;

        const rotation = Math.atan2(target.y - source.y, target.x - source.x),
        bezierCurve = new PIXI.Graphics(),
        cpX = source.x + nodeParam.NODE_RADIUS * Math.cos(rotation),
        cpY = source.y + nodeParam.NODE_RADIUS * Math.sin(rotation),
        cpX2 = (source.x + target.x) / 2,
        cpY2 = (source.y + target.y) / 2 + ((-1) ** source.linkCount.multipleLink) * Math.ceil(source.linkCount.multipleLink * 0.5) * nodeParam.NODE_RADIUS * 2,
        toX = target.x - nodeParam.NODE_RADIUS * Math.cos(rotation),
        toY = target.y - nodeParam.NODE_RADIUS * Math.sin(rotation);

        bezierCurve.lineStyle({
          width: lineParam.LINEWIDTH,
          color: 0xffffff
        });
        bezierCurve.moveTo(cpX, cpY);
        bezierCurve.bezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY)
        line = bezierCurve;
        line.tint = lineParam.LINECOLOR;
        line.zIndex = -1;

        line.hitArea = new PIXI.Polygon([
          new PIXI.Point(cpX, cpY),
          new PIXI.Point(cpX2, cpY2),
          new PIXI.Point(toX, toY)
        ]);

        line.selfData = {
          linkType: "bezierCurve",
          number: source.linkCount.multipleLink
        }

        // 设置三角形坐标
        triangle.rotation = Math.atan2(cpY2 - toY, cpX2 - toX) - Math.PI;
        triangle.x = noLength ? this.viewAttr.width / 2 : toX;
        triangle.y = noLength ? this.viewAttr.height / 2 : toY;

        // 设置文本坐标
        if (rotation - Math.PI < - Math.PI / 2 && rotation - Math.PI > -Math.PI * 1.5) {
          textBox.rotation = rotation - Math.PI * 2;
        } else {
          textBox.rotation = rotation - Math.PI;
        }
        textBox.x = noLength ? this.viewAttr.width / 2 : cpX2;
        textBox.y = noLength ? this.viewAttr.height / 2 : (cpY2 + (source.y + target.y) / 2) / 2 - textBox.height / 2;
      }
    } else {
      // 3.指向自身的曲线
      // 记录特殊曲线
      source.linkCount.selfLink += 1;

      let bezierCurve = new PIXI.Graphics();
      bezierCurve.lineStyle(lineParam.LINEWIDTH, 0xffffff);
      bezierCurve.moveTo(source.x, source.y - nodeParam.NODE_RADIUS);
      bezierCurve.bezierCurveTo(
        source.x, 
        source.y - nodeParam.NODE_RADIUS, 
        source.x - nodeParam.NODE_RADIUS * 0.2 * source.linkCount.selfLink, 
        source.y - nodeParam.NODE_RADIUS * 1.8 * source.linkCount.selfLink, 
        source.x - nodeParam.NODE_RADIUS - (source.linkCount.selfLink - 1) * 30,
        source.y - nodeParam.NODE_RADIUS - (source.linkCount.selfLink - 1) * 30
      );
      bezierCurve.bezierCurveTo(
        source.x - nodeParam.NODE_RADIUS - (source.linkCount.selfLink - 1) * 30, 
        source.y - nodeParam.NODE_RADIUS - (source.linkCount.selfLink - 1) * 30, 
        source.x - nodeParam.NODE_RADIUS * 1.8 * source.linkCount.selfLink, 
        source.y - nodeParam.NODE_RADIUS * 0.2 * source.linkCount.selfLink, 
        source.x - nodeParam.NODE_RADIUS,
        source.y
      );
      bezierCurve = this.pixiChart.renderer.generateTexture(bezierCurve, PIXI.settings.SCALE_MODES, window.devicePixelRatio);
      line = new PIXI.Sprite(bezierCurve);
      line.anchor.set(1);
      line.tint = lineParam.LINECOLOR;
      line.x = source.x;
      line.y = source.y;
      line.selfData = {
        linkType: "bezierCurveForSelf",
        number: source.linkCount.selfLink
      }

      // 设置三角形坐标
      triangle.x = noLength ? this.viewAttr.width / 2 : source.x - nodeParam.NODE_RADIUS;
      triangle.y = noLength ? this.viewAttr.height / 2 : source.y - lineParam.LINEWIDTH;

      // 设置文本坐标
      textBox.rotation = -0.785; // -45度
      textBox.x = noLength ? this.viewAttr.width / 2 : source.x - nodeParam.NODE_RADIUS * 1.5 - (source.linkCount.selfLink - 1) * nodeParam.NODE_RADIUS * 0.7;
      textBox.y = noLength ? this.viewAttr.height / 2 : source.y - nodeParam.NODE_RADIUS * 1.5 - (source.linkCount.selfLink - 1) * nodeParam.NODE_RADIUS * 0.7;
    }

    line.interactive = true;
    line.data = data;
    line.name = data.id;
    line.isLink = true;

    line
      .on("pointerdown", function(event) {
        event.stopPropagationHint = true;
        console.log("line:", this);
      })
      .on("mouseover", function() {
        if (!vm.nodeOpLock) {
          const source = vm.pixiChart.stage.getChildByName("nodeContainer").getChildByName(this.data.source.id),
          target = vm.pixiChart.stage.getChildByName("nodeContainer").getChildByName(this.data.target.id),
          sourceBorder = vm.pixiChart.stage.getChildByName("borderContainer").getChildByName("HOVERBORDER"),
          targetBorder = vm.pixiChart.stage.getChildByName("borderContainer").getChildByName("HOVERSECONDBORDER"),
          sourceText = vm.pixiChart.stage.getChildByName("nodeTextContainer").getChildByName(this.data.source.id),
          targetText = vm.pixiChart.stage.getChildByName("nodeTextContainer").getChildByName(this.data.target.id),
          lineText = vm.pixiChart.stage.getChildByName("lineTextContainer").getChildByName(this.data.id);

          if (!this.selfData) {
            if (!this.isHighlight) {
              this.height = lineParam.LINEWIDTH * 2;
            }
          } else {
            if (this.selfData.linkType == 'bezierCurve') {
              vm.redrawBezierCurve(this, source, target, {
                width: lineParam.LINEWIDTH * 2,
                color: 0xffffff
              })
            }
          }

          if (!this.isHighlight) {
            this.tint = lineParam.LINEHIGHLIGHT;
          }

          sourceBorder.visible = true;
          sourceBorder.x = source.x;
          sourceBorder.y = source.y;

          targetBorder.visible = true;
          targetBorder.x = target.x;
          targetBorder.y = target.y;

          lineText && lineText.scale.set(textParam.SCALEFONTSIZE, textParam.SCALEFONTSIZE);
          sourceText && sourceText.scale.set(textParam.SCALEFONTSIZE, textParam.SCALEFONTSIZE);
          targetText && targetText.scale.set(textParam.SCALEFONTSIZE, textParam.SCALEFONTSIZE);
        }
      })
      .on("mouseout", function() {
        if (!vm.nodeOpLock) {
          const source = vm.pixiChart.stage.getChildByName("nodeContainer").getChildByName(this.data.source.id),
          target = vm.pixiChart.stage.getChildByName("nodeContainer").getChildByName(this.data.target.id),
          sourceBorder = vm.pixiChart.stage.getChildByName("borderContainer").getChildByName("HOVERBORDER"),
          targetBorder = vm.pixiChart.stage.getChildByName("borderContainer").getChildByName("HOVERSECONDBORDER"),
          sourceText = vm.pixiChart.stage.getChildByName("nodeTextContainer").getChildByName(this.data.source.id),
          targetText = vm.pixiChart.stage.getChildByName("nodeTextContainer").getChildByName(this.data.target.id),
          lineText = vm.pixiChart.stage.getChildByName("lineTextContainer").getChildByName(this.data.id);
          sourceBorder.visible = false;
          targetBorder.visible = false;

          if (!this.selfData) {
            if (!this.isHighlight)
            // this.height = lineParam.LINEWIDTH / vm.pixiChart.stage.scale.y;
            this.height = lineParam.LINEWIDTH;
          }
          else {
            if (this.selfData.linkType == 'bezierCurve') {
              vm.redrawBezierCurve(this, source, target, {
                width: lineParam.LINEWIDTH,
                color: 0xffffff
              })
            }
          }

          if (!this.isHighlight) {
            this.tint = lineParam.LINECOLOR;
          }

          lineText && lineText.scale.set(textParam.FONTSIZE, textParam.FONTSIZE);
          sourceText && sourceText.scale.set(textParam.FONTSIZE, textParam.FONTSIZE);
          targetText && targetText.scale.set(textParam.FONTSIZE, textParam.FONTSIZE);
        }
      });
    for (const i in vm.linkEvents) {
      line.on(i, vm.linkEvents[i]);
    }
    this.pixiChart.stage.getChildByName("linkContainer").addChild(line);
    
    this.pixiChart.stage.getChildByName("triangleContainer").addChild(triangle);

    this.pixiChart.stage.getChildByName("lineTextContainer").addChild(textBox);
  }
  redrawBezierCurve(link, source, target, style) {
    let rotation = Math.atan2(target.y - source.y, target.x - source.x);
    link.clear();
    link.lineStyle(style);

    const cpX = source.x + nodeParam.NODE_RADIUS * Math.cos(rotation),
    cpY = source.y + nodeParam.NODE_RADIUS * Math.sin(rotation),
    cpX2 = (source.x + target.x) / 2,
    cpY2 = (source.y + target.y) / 2 + ((-1) ** link.selfData.number) * Math.ceil(link.selfData.number * 0.5) * nodeParam.NODE_RADIUS * 2,
    toX = target.x - nodeParam.NODE_RADIUS * Math.cos(rotation),
    toY = target.y - nodeParam.NODE_RADIUS * Math.sin(rotation);

    link.moveTo(cpX, cpY);
    link.bezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY);

    link.hitArea = new PIXI.Polygon([
      new PIXI.Point(cpX, cpY),
      new PIXI.Point(cpX2, cpY2),
      new PIXI.Point(toX, toY)
    ]);
  }
  // 获取图内的node和link
  exportData(isVisible) {
    if (this.pixiChart && this.pixiChart.stage) {
      const nodeContainer = this.pixiChart.stage.getChildByName("nodeContainer"),
      linkContainer = this.pixiChart.stage.getChildByName("linkContainer");
      return {
        nodes: nodeContainer ? JSON.parse(JSON.stringify(nodeContainer.children.map(item => item.data))) : [],
        links: linkContainer ? JSON.parse(JSON.stringify(linkContainer.children.map(item => item.data))) : []
      };
    } else {
      return {
        nodes: [],
        links: []
      }
    }
  }
  // 重新计算力导向布局 大数据量下会有性能问题
  restartForceLayout(start, end) {
    if (start != end) {
      this.simulation.tick();
      window.requestAnimationFrame(() => {
        this.restartForceLayout(start + 1, end);
      });
    }
  }
  // 添加新元素
  addData({nodes=[],links=[]}, isCacheStack = true) {
    //图中已经有的数据
    let oldData = this.exportData(),
        oldNodeIds = [],
        oldLinkIds = [];
    //已经存在的点、线id
    for(let [index,item] of oldData.nodes.entries()){
        oldNodeIds.push(item.id);
    }
    for(let [index,item] of oldData.links.entries()){
        oldLinkIds.push(item.id);
    }

    if (nodes.length != 0) {
      // 新增node才更新布局
      this.refreshPartLayoutByForce({oldNodeIds, oldLinkIds, nodes, links}, isCacheStack);
    } else {
      if (links.length != 0) {
        for (let i = 0; i < links.length; i++) {
          if (oldLinkIds.indexOf(links[i].id) == -1) { 
            const source = this.getObjectById(links[i].from, "node"),
            target = this.getObjectById(links[i].to, "node");
            source.data.x = source.x;
            source.data.y = source.y;
            target.data.x = target.x;
            target.data.y = target.y;
            source.data.needUpdate = true;
            target.data.needUpdate = true;
            links[i].source = source.data;
            links[i].target = target.data;
            this.drawLinkContainer(links[i]);
            this.setCull("move");
            this.pixiChart.stage.emit("onDataUpdated");
          }
        }
        if (isCacheStack) {
          this.inStack({
            nodes: [],
            links: links,
            type:'add'
          });
        }
      }
    }
  }
  // 更新局部力导向布局
  refreshPartLayoutByForce(graphData, isCacheStack) {
    const worker = new forceLayoutWorker(), vm = this,
    stage = vm.pixiChart.stage,
    nodeContainer = stage.getChildByName("nodeContainer"),
    originLength = nodeContainer.children.length,
    message = {
      nodes: graphData.nodes || [],
      links: graphData.links || [],
      width: this.viewAttr.width,
      height: this.viewAttr.height,
      tick: 80
    };

    if (graphData.nodes.length == 0 && graphData.links.length == 0 && graphData.oldNodeIds.length == 0 && graphData.oldLinkIds.length == 0) return;

    worker.postMessage(message);
    this.cancelSelection();
    // 绘制新增的节点
    const newNodes = graphData.nodes.filter(item => {
      item.x = this.pointerCoordinate.x;
      item.y = this.pointerCoordinate.y;
      return graphData.oldNodeIds.indexOf(item.id) == -1;
    });
    
    nodeContainer.on("finishNodeDraw", function(index) {
      if (newNodes.length - 1 == index - originLength) {
        this.off("finishNodeDraw");
      }
    });
    vm.initNodes(newNodes);
    
    const nodeBounds = this.getNodeLocalBounds();

    worker.onmessage = function(event) {
      // 新布局位置计算结束
      if (event.data.type == "end") {
        console.log("workerEvent:", event);

        const newLinks = event.data.links.filter(item => {
          item.source.needUpdate = true;
          item.target.needUpdate = true;
          return graphData.oldLinkIds.indexOf(item.id) == -1;
        });

        for (let i = 0; i < event.data.nodes.length; i++) {
          // 节点需要更新data 这步操作是为了将节点中的data和link中的source和target产生对象引用关系
          const node = nodeContainer.getChildByName(event.data.nodes[i].id);
          event.data.nodes[i].dataLinks = node.data.dataLinks;
          event.data.nodes[i].linkCount = node.data.linkCount;
          node.data = event.data.nodes[i];
          node.data.needUpdate = false;
        }

        for (let i = 0; i < newLinks.length; i++) {
          vm.drawLinkContainer(newLinks[i], true);
        }

        if (isCacheStack) {
          // 记录新节点和线
          vm.inStack({
            nodes: event.data.nodes.filter(item => graphData.oldNodeIds.indexOf(item.id) == -1),
            links: newLinks,
            type:'add'
          });
        }

        // 更新图谱数据
        stage.emit("onDataUpdated");

        const selectNode = [];

        for (let i = 0; i < event.data.nodes.length; i++) {
          const node = nodeContainer.getChildByName(event.data.nodes[i].id);
          // 自动选中节点
          vm.setSelection(node.data.id, node);
          selectNode.push(node);
        }

        stage.emit("onSelectionChange", selectNode.map(node => {
          return {
            id: node.data.id,
            name: node.data.name
          }
        }));

        // 将新增的点边远离图内已存在的点边 方法有待改进
        let count = 0, tick = 30, order = vm.layoutCount % 4, fixOffset = 5;
        for (let j = 0; j < event.data.nodes.length; j++) {
          let node = nodeContainer.getChildByName(event.data.nodes[j].id), offsetX, offsetY;
          switch(layoutOrder[order]) {
            case "bottom":
              offsetX = (node.data.x - node.x) / tick;
              offsetY = ((nodeBounds.y + nodeBounds.height) + (node.data.y - event.data.bounds.yMin) - node.y) / tick;
              break;
            case "left": 
              offsetX = (nodeBounds.x - (event.data.bounds.xMax - node.data.x) - node.x) / tick;
              offsetY = (node.data.y - node.y) / tick;
              break;
            case "top": 
              offsetX = (node.data.x - node.x) / tick;
              offsetY = (nodeBounds.y - (event.data.bounds.yMax - node.data.y) - node.y) / tick;
              break;
            case "right":
              offsetX = ((nodeBounds.x + nodeBounds.width) + (node.data.x - event.data.bounds.xMin) - node.x) / tick;
              offsetY = (node.data.y - node.y) / tick;
              break;
          }
          node.offsetX = offsetX + fixOffset * (offsetX > 0 ? 1 : -1);
          node.offsetY = offsetY + fixOffset * (offsetY > 0 ? 1 : -1);
        }
        const transitionAnimation = function() {
          count += 1;
          for (let j = 0; j < event.data.nodes.length; j++) {
            let node = nodeContainer.getChildByName(event.data.nodes[j].id);
            node.x += node.offsetX;
            node.y += node.offsetY;
            // node.x += offsetX / stage.scale.x;
            // node.y += offsetY / stage.scale.y;
            vm.moveNodeEvent(node, { 
              x: node.offsetX,
              y: node.offsetY
            });
          }
          if (count > tick) {
            count = 0;
            vm.layoutCount++;
            vm.pixiChart.ticker.remove(transitionAnimation);
            vm.transitionStageToCenter();
          };
        }
        console.log("pixiChart:", vm.pixiChart);
        vm.pixiChart.ticker.add(transitionAnimation);
        worker.terminate();
      }
    };
  }
  // 移动stage中心至node
  scrollIntoView(node) {
    
  }
  // 将舞台拉回中心
  transitionStageToCenter(tick = 30) {
    const visibleView = this.getVisibleBounds(),
    stage = this.pixiChart.stage,
    nodeBounds = this.getNodeLocalBounds(),
    vm = this;

    let count = 0;
    
    const animate = function() {
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
    this.cullList.push("nodeContainer");
    this.cullList.push("nodeTextContainer");
    this.cullList.push("linkContainer");
    this.cullList.push("lineTextContainer");
    this.cullList.push("triangleContainer");
    
    this.cullScaleList = [];
    this.cullScaleList.push("layerContainer");
    this.cullScaleList.push("nodeTextContainer");
    this.cullScaleList.push("triangleContainer");
    this.cullScaleList.push("lineTextContainer");
    
    this.cullAlphaList = [];
    this.cullAlphaList.push("nodeContainer");

    this.pixiChart.ticker.add(() => {
      if (this.stageDirty.scale || this.stageDirty.move) {
        this.cullElement();
        this.stageDirty.scale = false;
        this.stageDirty.move = false;
      }
    });
  }
  // 执行cull
  setCull(type) {
    this.stageDirty[type] = true;
  }
  // 隐藏可视范围外的元素
  cullElement() {
    const startTime = performance.now(),
      bounds = this.getVisibleBounds(),
      stage = this.pixiChart.stage,
      visible = stage.scale.x >= HIDESCALE;
    // 改变scale和position的同时需要修改stage活动区域
    stage.hitArea = bounds;
    if (this.stageDirty.scale) {
      for (const id of this.cullScaleList) {
        const container = stage.getChildByName(id) || {};
        container.visible = visible;
      }
      for (const id of this.cullAlphaList) {
        const container = stage.getChildByName(id) || {};
        container.alpha = visible ? 1 : 0;
      }
    }
    for (const id of this.cullList) {
      // 如果container已经被隐藏 则不做处理
      if (!visible && this.cullScaleList.indexOf(id) != -1) continue;
      const container = stage.getChildByName(id) || {},
      list = container.children || [],
      length = list.length;
      for (let i = 0; i < length; i++) {
        const element = list[i];
        let box = null;
        // link需特殊判断
        if (id == "linkContainer") {
          // 边界判断法 即把link作为对角线画矩形来判断位置 但是getBounds会占用一部分计算性能
          // box = element.getBounds();
          // element.visible =
          //   box.x + box.width > 0 &&
          //   box.x < this.viewAttr.width &&
          //   box.y + box.height > 0 &&
          //   box.y < this.viewAttr.height;
          if (this.stageDirty.scale) {
            // 改变缩放时的link宽度
            // element.height = lineParam.LINEWIDTH / stage.scale.y;
            container.interactiveChildren = visible;
          }
          // 手动计算边界并做缓存
          if ((!element.cullObj || element.isChange)) {
            if (!element.selfData) {
              const sourceX = element.x,
              sourceY = element.y,
              targetX = sourceX + element.width * Math.cos(element.rotation),
              targetY = sourceY + element.width * Math.sin(element.rotation),
              rectX = sourceX < targetX ? sourceX : targetX,
              rectY = sourceY < targetY ? sourceY: targetY;
              element.cullObj = {
                x: rectX,
                y: rectY,
                width: Math.abs(sourceX - targetX),
                height: Math.abs(sourceY - targetY)
              };
            } else {
              element.cullObj = element.getLocalBounds();
            }
          }
        } else {
          if (!element.cullObj || element.isChange) {
            box = element.getLocalBounds();
            element.cullObj = {
              x: element.x + (box.x - element.pivot.x) * element.scale.x,
              y: element.y + (box.y - element.pivot.y) * element.scale.y,
              width: box.width * element.scale.x,
              height: box.height * element.scale.y
            };
          }
        }
        element.visible =
          element.cullObj.x + element.cullObj.width > bounds.x &&
          element.cullObj.x < bounds.x + bounds.width &&
          element.cullObj.y + element.cullObj.height > bounds.y &&
          element.cullObj.y < bounds.y + bounds.height;
        element.isChange = false;
      }
    }
    // console.log("cullTime:", performance.now() - startTime);
  }
  // 将不在可视范围内的元素显示 为了重新计算scale
  toggleNodeVisible(visible) {
    const nodeContainer = this.pixiChart.stage.getChildByName("nodeContainer"),
    nodeLength = nodeContainer.children.length;
    if (visible) {
      for (let i = 0; i < nodeLength; i++) {
        nodeContainer.children[i].visible = true;
      }
    } else {
      this.setCull("move");
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
    this.setCull("move");
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
    // 缓存节点信息 避免在move时重复计算
    if (!item.cacheData.nodeGroup) {
      item.cacheData.nodeGroup = {
        textObj: {},
        circleObj: {},
        borderObj: {},
        communityObj: {}
      };
      item.cacheData.nodeGroup.textObj = this.getObjectById(item.data.id, "nodeText") || {};
      item.cacheData.nodeGroup.circleObj = this.getObjectById(item.data.id, "circle") || {};
    }
    // 选中的边框会根据操作新建和删除 需要不断更新缓存
    item.cacheData.nodeGroup.borderObj = this.getObjectById(item.data.id, "border") || {};
    // 缓存社区切分相关信息
    item.cacheData.nodeGroup.communityObj = {};
    const communityList = this.pixiChart.stage.getChildByName("communityContainer");
    if (item.data.community !== null && item.data.community !== undefined && communityList) {
      item.cacheData.nodeGroup.communityObj = communityList.getChildByName(item.data.community) || {};
    }
    // 缓存link相关信息 需要不断更新缓存
    if (item.data.dataLinks) {
      item.cacheData.linksGroup = {};
      const linksLength = item.data.dataLinks.length;
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
        item.cacheData.linksGroup[item.data.dataLinks[i].id].text = this.getObjectById(item.data.dataLinks[i].id, "lineText");
        item.cacheData.linksGroup[item.data.dataLinks[i].id].triangle = this.getObjectById(item.data.dataLinks[i].id, "triangle");
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
  // 社区切分 d3基于Marching squares轮廓算法封装的等值线方法
  communityGraph(communityList) {
    const communityContainer = this.pixiChart.stage.getChildByName("communityContainer"),
    coordinatesList = [],
    graphics = new PIXI.Graphics();
    graphics.data = {
      spriteList: [],
      idList: [],
      isChange: false
    };
    graphics.name = communityContainer.children.length;
    let xMin, yMin, xMax, yMax;
    this.selectedNode.forEach((id, index) => {
      const node = this.getObjectById(id, "node");
      node.data.community = graphics.name;

      if (index == 0) {
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
      graphics.data.idList.push(id);
      coordinatesList.push({
        x: node.x,
        y: node.y
      });
    });
    const offsetX = xMin < 0 ? Math.abs(xMin) : 0, offsetY = yMin < 0 ? Math.abs(yMin) : 0;
    coordinatesList.forEach(item => {
      item.x += offsetX;
      item.y += offsetY;
    });
    graphics.lineStyle(1);
    graphics.beginFill(0x3eaf7c, 1);

    const contour = d3
      .contourDensity()
      .x(function(d) {
        return d.x;
      })
      .y(function(d) {
        return d.y;
      })
      .size([xMax + offsetX, yMax + offsetY])
      .thresholds(6)(coordinatesList);
    console.log("contour:", contour);

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
  // 清除算法
  clearAlgorithm() {
    this.pixiChart.stage.getChildByName("communityContainer").removeChildren();
  }
  // 适应dom容器大小
  resize() {
    setTimeout(() => {
      this.pixiChart.resize();
    }, 300);
  }
  /**
   * @method: 设置选中
   * @for: 
   * @param {*} selection 选中的元素id
   * @param {*} node 选中的元素实例
   * @param {*} clearOthers 是否清除其他被选中元素
   * @return {*}
   */  
  setSelection(selection, node, clearOthers) {
    if (clearOthers) this.cancelSelection();
    if (!Array.isArray(selection)) selection = [selection];
    selection.forEach(id => {
      const element = node ? node : this.getObjectById(id, "node"),
      selectedBorder = this.drawNodeBorder(id);
      selectedBorder.x = element.x;
      selectedBorder.y = element.y;
      selectedBorder.visible = true;

      this.cacheNodeData(element)
    })
  }
  // 取消对节点的选中
  cancelSelection() {
    const borderContainer = this.pixiChart.stage.getChildByName("borderContainer");
    this.selectedNode = [];
    if (borderContainer.children.length > defaultParam.DEFAULTNODEBORDER.length) borderContainer.removeChildren(defaultParam.DEFAULTNODEBORDER.length, borderContainer.children.length);
  }
  /**
   * @method: 删除图内元素
   * @for: 
   * @param {*} data
   * @return {*}
   */  
  removeData(data, isCacheStack = true) {
    const { nodes = [], links = [] } = data,
    stage = this.pixiChart.stage,
    nodeContainer = stage.getChildByName("nodeContainer"),
    circleContainer = stage.getChildByName("circleContainer"),
    nodeTextContainer = stage.getChildByName("nodeTextContainer"),
    borderContainer = stage.getChildByName("borderContainer"),
    linkContainer = stage.getChildByName("linkContainer"),
    lineTextContainer = stage.getChildByName("lineTextContainer"),
    triangleContainer = stage.getChildByName("triangleContainer"),
    nodesLength = nodes.length,
    linksLength = links.length,
    bezierMap = {
      bezierCurveForSelf: 'selfLink',
      bezierCurve: 'multipleLink'
    };

    // 删除node相关信息
    for (let i = 0; i < nodesLength; i++) {
      const node = nodeContainer.getChildByName(nodes[i].id);
      // 为了获取node相关信息
      this.cacheNodeData(node);
      circleContainer.removeChild(node.cacheData.nodeGroup.circleObj);
      nodeTextContainer.removeChild(node.cacheData.nodeGroup.textObj);
      borderContainer.removeChild(node.cacheData.nodeGroup.borderObj);

      for (let key in node.cacheData.linksGroup) {
        const linkCache = node.cacheData.linksGroup[key],
        neighborNode = linkCache.node;

        // 删除node所连的link时 需要把相连点的link数据清除
        for (let m = 0; m < neighborNode.data.dataLinks.length; m++) {
          if (neighborNode.data.dataLinks[m].id == key) {
            neighborNode.data.dataLinks.splice(m, 1);
            // delete效率低 可能有性能问题
            delete neighborNode.cacheData.linksGroup[key];
            break;
          }
        }
        if (linkCache.link.selfData) {
          neighborNode.data.linkCount && neighborNode.data.linkCount[bezierMap[linkCache.link.selfData.linkType]]--;
          node.data.linkCount && node.data.linkCount[bezierMap[linkCache.link.selfData.linkType]]--;
        }

        lineTextContainer.removeChild(linkCache.text);
        triangleContainer.removeChild(linkCache.triangle);
        linkContainer.removeChild(linkCache.link);
      }

      nodeContainer.removeChild(node);
    }

    // 删除link相关信息
    for (let i = 0; i < linksLength; i++) {
      const link = linkContainer.getChildByName(links[i].id);
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

        link.selfData && target.linkCount && target.linkCount[bezierMap[link.selfData.linkType]]--;
        link.selfData && source.linkCount && source.linkCount[bezierMap[link.selfData.linkType]]--;

        lineTextContainer.removeChild(lineTextContainer.getChildByName(link.data.id));
        triangleContainer.removeChild(triangleContainer.getChildByName(link.data.id));
        linkContainer.removeChild(linkContainer.getChildByName(link.data.id));
      }
    }

    if (isCacheStack) {
      this.inStack({ ...data, type: 'remove' });
    }
    // 更新图谱数据
    stage.emit("onDataUpdated");
  }
  updateSettings() {

  }
  // 刷新整体布局
  resetLayout() {
    this.addData(this.exportData());
  }
  // 更新元素样式
  updateStyle() {
    setTimeout(() => {
      if (!this.pixiChart || !this.pixiChart.stage) return;
      const nodeContainer = this.pixiChart.stage.getChildByName("nodeContainer"),
      linkContainer = this.pixiChart.stage.getChildByName("linkContainer");
      if (this.graphOptions.style.nodeStyleFunction && nodeContainer) {
        this.graphOptions.style.nodeStyleFunction.call(this, nodeContainer.children);
      }
      if (this.graphOptions.style.linkStyleFunction && linkContainer) {
        this.graphOptions.style.linkStyleFunction.call(this, linkContainer.children);
      }
      this.nodeOpLock = false;
    }, 300)
  }
  // 进行过滤
  updateFilters() {
    setTimeout(() => {
      if (!this.pixiChart || !this.pixiChart.stage) return;
      const stage = this.pixiChart.stage,
      nodeContainer = stage.getChildByName("nodeContainer"),
      circleContainer = stage.getChildByName("circleContainer"),
      nodeTextContainer = stage.getChildByName("nodeTextContainer"),
      borderContainer = stage.getChildByName("borderContainer"),
      linkContainer = stage.getChildByName("linkContainer"),
      lineTextContainer = stage.getChildByName("lineTextContainer"),
      triangleContainer = stage.getChildByName("triangleContainer");
      if (nodeContainer && this.graphOptions.filters.nodeFilter) {
        nodeContainer.children.forEach(item => {
          item.visible = this.graphOptions.filters.nodeFilter(item.data);
          item.isFilter = !item.visible;
        });
      }
      if (linkContainer && this.graphOptions.filters.linkFilter) {
      }
    }, 300)
  }
  // 销毁图组件
  destroyPixiChart() {
    this.pixiChart && this.pixiChart.destroy(true, {
      children: true,
      texture: true,
      baseTexture: true
    });
    this.pixiChart = null;
  }
  // 清空画布
  clear() {
    this.destroyPixiChart();
    this.graphOptions.graphData = {
      nodes: [],
      links: []
    };
    this.constructor(this.graphOptions);
  }
  paintNow() {
    
  }
  zoom() {
    
  }
  // 缓存图数据
  inStack(data){
    const stack = this.cacheStack.content;
    if(stack.length > this.cacheStack.index){
      stack.splice(this.cacheStack.index + 1);
    }
    this.cacheStack.content.push(data);
    this.cacheStack.index++;
    console.log('inStack', this.cacheStack);
  }
  // 清空缓存
  clearStack(){
    this.cacheStack.content = [];
    this.cacheStack.index = -1;
  }
  // 获取上一栈
  getPrevStack(){
    return this.cacheStack.content[this.cacheStack.index--];
  }
  // 获取下一栈
  getNextStack(){
    return this.cacheStack.content[++this.cacheStack.index];
  }
  // 增加元素 不记录缓存
  stackAdd(data){
    this.addData(data, false);
  }
  // 删除元素 不记录缓存
  stackRemove(data){
    this.removeData(data, false);
  }
  // 重做
  redo() {
    if (this.cacheStack.index < (this.cacheStack.content.length - 1)){
        let cacheData = this.getNextStack(),
        data = { nodes: cacheData.nodes, links: cacheData.links };
        switch (cacheData.type){
          case 'add':
            this.stackAdd(data);
            break;
          case 'remove':
            this.stackRemove(data);
            break;
        }
    } else{
      show_message('没有更多操作！', 'warning');
    }
    console.log('inStack', this.cacheStack);
  }
  // 撤销
  undo() {
    if (this.cacheStack.index >= 0){
      let cacheData = this.getPrevStack(),
      data = { nodes: cacheData.nodes, links: cacheData.links };
      switch (cacheData.type){
        case 'add':
            this.stackRemove(data);
            break;
        case 'remove':
            this.stackAdd(data);
            break;
      }
    } else{
      show_message('没有更多操作！', 'warning');
    }
    console.log('inStack', this.cacheStack);
  }
}
