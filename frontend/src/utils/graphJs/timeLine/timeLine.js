//时间轴画图类
import * as d3 from "d3";
import utils from "./utils";
export default function timeLine(id, nodeData, timeUnit) {
  // console.log("nodeData:", nodeData);
  // 构造函数赋初值
  this.closeButton = {
    type: "",
    event: Object
  };
  this.timeLineUtils = new utils();
  this.svgWidth = this.timeLineUtils.svgWidth(id);
  this.svgHeight = this.timeLineUtils.svgHeight(id);
  this.svgPadding = 25;
  this.rectWidth = 6;
  this.xAxisStart = this.svgPadding * 2;
  this.xAxisEnd = this.svgWidth - this.svgPadding * 2;
  // svg坐标原点在左上方，yAxisStart代表右下方
  this.yAxisStart = this.svgHeight - this.svgPadding;
  this.yAxisEnd = this.svgPadding * 2
  this.xAxis = {
    start: "",
    end: ""
  }
  this.yAxis = {
    start: "",
    end: ""
  };
  this.startTime = "";
  this.endTime = "";
  this.timeUnit = timeUnit;
  this.timeLineId = id;
  this.timeArr = [];
  this.sortTimeArr = [];
  this.timeFormat = d3.timeFormat("%Y,%m,%d");
  this.interval = d3.timeDay.every(1);
  this.timeLineObj = {
    //缩略时间轴对象管理
    svg: Object,
    xScale: Object,
    initialXscale: Object,
    yScale: Object,
    initialYscale: Object,
    xAxis: Object,
    yAxis: Object,
    brush: Object,
    zoom: Object,
    allTimeLine: null
  };
  this.typeColor = {};
  d3.select(id).html(" ");
  // 设置viewBox
  this.timeLineObj.svg = d3.select(id).attr("preserveAspectRatio", "xMidYMid meet")
  .attr("viewBox", `0 0 ${this.svgWidth} ${this.svgHeight}`);
  // 处理时间数据
  ({
    timeArr: this.timeArr,
    sortTimeArr: this.sortTimeArr,
    typeColor: this.typeColor
  } = this.timeLineUtils.countDataByTime(nodeData, this.timeUnit));
}
// 初始化时间轴
timeLine.prototype.init = function() {
  this.initRange();
  this.setBrush();
  this.initZoom(this.timeLineObj.xScale, this.timeLineObj.xScale);
  // this.setMousemoveEvent();
  this.renderEntitiesByTime(this.timeLineObj.xScale, this.timeLineObj.yScale);
};
// 初始化坐标范围
timeLine.prototype.initRange = function() {
  const countArr = [];
  this.sortTimeArr.forEach(item => {
    countArr.push(item.count);
  });
  if(this.sortTimeArr.length != 0) {
    this.xAxis = {
      start: this.sortTimeArr[0].time,
      end: this.sortTimeArr[this.sortTimeArr.length - 1].time
    };
    this.yAxis = {
      start: 0,
      end: Math.max(...countArr) + 1
    };
  }
  else {
    this.xAxis = {
      start: new Date(),
      end: new Date()
    };
    this.yAxis = {
      start: 0,
      end: 1
    };
  }
  this.startTime = this.timeLineUtils.transferTime(this.xAxis.start),
  this.endTime = this.timeLineUtils.transferTime(this.xAxis.end);
  this.timeLineObj.xScale = this.timeLineObj.initialXscale = this.initXscale(
    this.startTime,
    this.endTime
  );
  this.timeLineObj.yScale = this.timeLineObj.initialYscale = this.initYscale(
    this.yAxis.start,
    this.yAxis.end
  );
  this.timeLineObj.xAxis = this.initXaxis(this.timeLineObj.xScale);
  this.timeLineObj.yAxis = this.initYaxis(this.timeLineObj.yScale);
}
//初始化x轴刻度尺
timeLine.prototype.initXscale = function(xStart, xEnd) {
  if(this.xAxisStart > 0 && this.xAxisEnd > 0) {
    return d3
      .scaleTime()
      .domain([xStart, xEnd])
      .range([this.xAxisStart, this.xAxisEnd]);
  }
  else {
    return d3
      .scaleTime()
      .domain([xStart, xEnd])
      .range([0, 0]);
  }
};
//初始化y轴刻度尺
timeLine.prototype.initYscale = function(yStart = 0, yEnd) {
  if(this.yAxisStart > 0 && this.yAxisEnd > 0) {
    return d3
      .scaleLinear()
      .domain([yStart, yEnd])
      .range([this.yAxisStart, this.yAxisEnd]);
  }
  else {
    return d3
      .scaleLinear()
      .domain([yStart, yEnd])
      .range([0, 0]);
  }
};
//初始化x坐标轴
timeLine.prototype.initXaxis = function(xScale) {
  
  const translateY = this.yAxisStart,
  //时间轴默认间隔天数
  ticksDay = 1;
  if (!this.timeLineObj.svg.select(".x-axis").node()) {
    return this.timeLineObj.svg
      .append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0,${translateY})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(8)
          .tickFormat(this.timeFormat)
      )
      .call(g => {
        g.select(".domain").remove();
      })
      .call(g => {
        g.selectAll(".tick").select(function(d) {
          if (d.getHours() != 0) {
            this.remove();
          }
        })
      });
  } else {
    return this.timeLineObj.svg
      .select(".x-axis")
      .attr("transform", `translate(0,${translateY})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(8)
          .tickFormat(this.timeFormat)
      )
      .call(g => {
        g.select(".domain").remove();
      })
      .call(g => {
        g.selectAll(".tick").select(function(d) {
          if (d.getHours() != 0) {
            this.remove();
          }
        })
      });;
  }
};
//初始化y坐标轴
timeLine.prototype.initYaxis = function(yScale) {
  let ticks = 1;
  if(this.yAxis.end > 1){
    ticks = Math.min(this.yAxis.end, 5);
  }
  if (!this.timeLineObj.svg.select(".y-axis").node()) { 
    return this.timeLineObj.svg
      .append("g")
      .classed("y-axis", true)
      .attr("transform", `translate(${this.svgPadding},0)`)
      .call(
        d3
          .axisRight(yScale)
          .ticks(ticks)
          .tickSize([this.xAxisEnd])
      )
      .call(g => {
        g.select(".domain").remove();
      })
      .call(g => {
        g.selectAll(".tick text")
          .attr("x", -10)
          .attr("dy", -4);
      })
      .call(g => {
        g.selectAll(".tick:not(:first-of-type) line")
          .attr("stroke-opacity", 0.5)
          .attr("stroke-dasharray", "2,2");
      });
  }
  else {
    return this.timeLineObj.svg
      .select(".y-axis")
      .attr("transform", `translate(${this.svgPadding},0)`)
      .call(
        d3
          .axisRight(yScale)
          .ticks(ticks)
          .tickSize([this.xAxisEnd])
      )
      .call(g => {
        g.select(".domain").remove();
      })
      .call(g => {
        g.selectAll(".tick text")
          .attr("x", -10)
          .attr("dy", -4);
      })
      .call(g => {
        g.selectAll(".tick:not(:first-of-type) line")
          .attr("stroke-opacity", 0.5)
          .attr("stroke-dasharray", "2,2");
      });
  }
};
//渲染缩略时间轴实体并以时间分组
timeLine.prototype.renderEntitiesByTime = function(xScale, yScale) {
  const rectBoxWidth = this.svgWidth - this.svgPadding * 3 + this.rectWidth * 2,
  rectBoxHeight = this.yAxisStart;
  if (!this.timeLineObj.svg.select(".rect-box").node() && rectBoxHeight > 0 && rectBoxWidth > 0) {
    this.timeLineObj.svg
      .append("clipPath")
      .attr("id", "rectClipPath")
      .classed("clip-path", true)
      .append("rect")
      .attr("x", this.svgPadding * 2 - this.rectWidth)
      .attr("y", 0)
      .attr("width", rectBoxWidth)
      .attr("height", rectBoxHeight);
    return this.timeLineObj.svg
      .append("g")
      .attr("clip-path", () => {
        return "url(#rectClipPath)";
      })
      .classed("rect-box", true)
      .selectAll("g")
      .data(this.timeArr)
      .join("g")
      .selectAll("rect")
      .data(d => {
        return Object.entries(d[1])
      })
      .join("rect")
      .attr("width", this.rectWidth)
      .attr("height", d => {
        return yScale(0) - yScale(d[1].count) > 0 ? yScale(0) - yScale(d[1].count) : 0;
      })
      .attr("x", d => {
        if(d[1].time instanceof Date) {
          return xScale(this.timeLineUtils.transferTime(d[1].time)) - this.rectWidth / 2;
        }
      })
      .attr("y", (d, index, node) => {
        if (index != 0) {
          return (
            d3.select(node[index - 1]).attr("y") -
            d3.select(node[index]).attr("height")
          );
        } else {
          return yScale(d[1].count);
        }
      })
      .attr("fill", d => {
        return d[1].data[0].color;
      });
  }
};
//更新实体数据
timeLine.prototype.updateEntities = function(xScale, yScale){
  if(this.timeLineObj.svg.select(".rect-box").node()) {
    this.timeLineObj.svg
      .select(".rect-box")
      .selectAll("g")
      .data(this.timeArr)
      .join(
        enter => enter.append("g"),
        update => update,
        exit => exit.remove()
      )
      .selectAll("rect")
      .data(d => {
        return Object.entries(d[1])
      })
      .join(
        enter => enter.append("rect"),
        update => update,
        exit => exit.remove()
      )
      .attr("width", this.rectWidth)
      .attr("height", d => {
        return yScale(0) - yScale(d[1].count);
      })
      .attr("x", d => {
        return (
          xScale(this.timeLineUtils.transferTime(d[1].time)) -
          this.rectWidth / 2
        );
      })
      .attr("y", (d, index, node) => {
        if (index != 0) {
          return (
            d3.select(node[index - 1]).attr("y") -
            d3.select(node[index]).attr("height")
          );
        } else {
          return yScale(d[1].count);
        }
      })
      .attr("fill", d => {
        return d[1].data[0].color;
      });
  }
  else {
    this.renderEntitiesByTime(xScale, yScale)
  }
}
//移动实体位置
timeLine.prototype.moveEntities = function(xScale, yScale){
  this.timeLineObj.svg
    .select(".rect-box")
    .selectAll("rect")
    .attr("x", d => {
      return (
        xScale(this.timeLineUtils.transferTime(d[1].time)) -
        this.rectWidth / 2
      );
    })
}
//设置鼠标移动事件
timeLine.prototype.setMousemoveEvent = function() {
  this.timeLineObj.svg
    .on("mousemove.dragLine", () => {
      // console.log("event:", event);
      if (!this.timeLineObj.svg.select(".dragLine").node()) {
        const g = this.timeLineObj.svg.append("g").classed("dragLine", true);
        g.append("rect")
          .attr("width", 0)
          .attr("height", this.svgHeight - this.svgPadding * 3)
          .attr("y", this.svgPadding * 2);
        g.append("text");
      }
      this.timeLineObj.svg
        .select(".dragLine")
        .attr(
          "transform",
          `translate(${event.offsetX + 10},0)`
        )
        .select("text")
        .text(
          `${this.timeFormat(
            this.timeLineObj.xScale.invert(
              event.offsetX
            )
          )}`
        )
        .attr("transform", `translate(10,${this.svgPadding + 100})`);
    })
    .on("mouseout.dragLine", () => {
      d3.select(".dragLine").remove();
    });
};
//设置缩略时间轴刷子和默认事件
timeLine.prototype.setBrush = function() {
  const xMin = this.xAxisStart - this.rectWidth,
  yMin = this.yAxisEnd,
  xMax = this.xAxisEnd + this.rectWidth,
  yMax = this.yAxisStart,
  extentPosition = [
    [xMin, yMin],
    [xMax, yMax]
  ];
  if (xMin > 0 && yMin > 0 && xMax > 0 && yMax > 0 && xMax - xMin > 0 && yMax - yMin > 0) {
    this.timeLineObj.brush = d3
      .brushX()
      .extent(extentPosition)
      .on("start", () => {
        // console.log("start:", d3.event);
        if (!this.timeLineObj.svg.select(".close-button").node()) {
          this.timeLineObj.svg
            .insert("circle")
            .classed("close-button", true)
            .attr("r", 5)
            .attr("fill", "#fff")
            .attr("cursor", "pointer")
            .attr("cx", -10)
            .attr("cy", -10)
            .on(`${this.closeButton.type}`, this.closeButton.event);
          this.timeLineObj.svg.insert("line").classed("close-button-left", true)
            .attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 0)
            .attr("cursor", "pointer")
            .attr("stroke", "#75ABF3")
            .attr("stroke-width", "1px")
            .on(`${this.closeButton.type}`, this.closeButton.event);
          this.timeLineObj.svg.insert("line").classed("close-button-right", true)
            .attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 0)
            .attr("cursor", "pointer")
            .attr("stroke", "#75ABF3")
            .attr("stroke-width", "1px")
            .on(`${this.closeButton.type}`, this.closeButton.event);
        }
        if (!this.timeLineObj.svg.select(".time-line-before").node()) {
          this.timeLineObj.svg
            .insert("text", this.timeLineObj.svg.attr("class"))
            .classed("time-line-before", true)
            .attr("fill", "#000")
            .attr("x", d3.select("rect.handle--w").attr("x"));
        }
        if (!this.timeLineObj.svg.select(".time-line-after").node()) {
          this.timeLineObj.svg
            .insert("text", this.timeLineObj.svg.attr("class"))
            .classed("time-line-after", true)
            .attr("fill", "#000")
            .attr("x", d3.select("rect.handle--e").attr("x"));
        }
      })
      .on("brush", () => {
        // console.log("brush", d3.event);
        if(this.timeLineObj.svg.select("rect.selection").attr("width") > 20){
          this.timeLineObj.svg
            .select(".close-button")
            .attr("cx", Number(d3.select("rect.handle--e").attr("x")) - 8)
            .attr("cy", Number(d3.select("rect.handle--e").attr("y")) + 12);
          this.timeLineObj.svg
            .select(".close-button-left")
            .attr("x1", Number(d3.select("rect.handle--e").attr("x")) - 10)
            .attr("y1", Number(d3.select("rect.handle--e").attr("y")) + 14.5)
            .attr("x2", Number(d3.select("rect.handle--e").attr("x")) - 6)
            .attr("y2", Number(d3.select("rect.handle--e").attr("y")) + 9.5)
          this.timeLineObj.svg
            .select(".close-button-right")
            .attr("x1", Number(d3.select("rect.handle--e").attr("x")) - 10)
            .attr("y1", Number(d3.select("rect.handle--e").attr("y")) + 9.5)
            .attr("x2", Number(d3.select("rect.handle--e").attr("x")) - 6)
            .attr("y2", Number(d3.select("rect.handle--e").attr("y")) + 14.5)
        }
        const selection = d3.event.selection;
        if (!d3.event.sourceEvent || !selection) return;
        this.timeLineObj.svg
          .select(".dragLine")
          .attr(
            "transform",
            `translate(${event.clientX - this.svgPadding / 2 + 1},0)`
          )
          .select("text")
          .text(
            `${this.timeFormat(this.timeLineObj.xScale.invert(event.clientX))}`
          )
          .attr("transform", `translate(10,${this.svgPadding})`);
        this.setDateText();
        //高亮被选中的rect
        this.selectRectHighLight();
      })
      .on("end", () => {
        // console.log("end:", d3.event);
        // d3.event为当前刷取事件对象
        const selection = d3.event.selection;
        if (!selection) {
          d3.select(".time-line-before").remove();
          d3.select(".time-line-after").remove();
          d3.select(".close-button").remove();
          d3.select(".close-button-left").remove();
          d3.select(".close-button-right").remove();
          this.timeLineObj.svg.select(".rect-box").selectAll("rect")
          .attr("opacity", "1");
          return;
        }
        if (!d3.event.sourceEvent || !selection) {
          this.setDateText()
          return;
        }
      //   const [x0, x1] = selection.map(d =>
      //     this.interval.round(this.timeLineObj.xScale.invert(d))
      //   );
      //   this.timeLineObj.svg
      //     .select(".brush-box")
      //     .transition()
      //     .call(
      //       this.timeLineObj.brush.move,
      //       x1 > x0 ? [x0, x1].map(this.timeLineObj.xScale) : null
      //     );
      });
      
      this.timeLineObj.svg
        .append("g")
        .classed(`brush-box`, true)
        .call(this.timeLineObj.brush);
  }

  //设置刷子颜色渐变
  const defs = this.timeLineObj.svg.select(".brush-box").append("defs"); //插入defs
  const linearGradient = defs //defs中插入<linearGradient>
      .append("linearGradient")
      .attr("id", "gradient") //设置对应id
      .attr("x1", "0")
      .attr("x2", "0")
      .attr("y1", "100%")
      .attr("y2", "0")
  linearGradient //linearGradient中插入stop元素
      .append("stop")
      .attr("offset", "0%") //设置坡度，下同
      .attr("stop-color", '#F1F7FE');//设置对应颜色，下同
  linearGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", '#0064E9');
  const rect = this.timeLineObj.svg.select("rect.selection")
      .style("fill", "url('#gradient')");//用linearGradient填充矩形
};
//设置刷子日期
timeLine.prototype.setDateText = function() {
  this.timeLineObj.svg
    .select(".time-line-before")
    .transition()
    .duration(120)
    .attr(
      "x",
      d => {
        const x = Number(this.timeLineObj.svg.select("rect.handle--w").attr("x"))
        if(x < this.svgPadding * 3) {
          return x - 30;
        }
        else if(Number(this.timeLineObj.svg.select(".selection").attr("width")) < 100) {
          return x - 40;
        }
        else {
          return x - 50;
        }
      }
    )
    .attr(
      "y",
      Number(this.timeLineObj.svg.select(".selection").attr("y")) +
      Number(this.timeLineObj.svg.select(".selection").attr("height")) / 2 - 10
    )
    .text(
      this.timeFormat(
        this.timeLineObj.xScale.invert(
          Number(this.timeLineObj.svg.select("rect.handle--w").attr("x")) + 
          Number(this.timeLineObj.svg.select("rect.handle--w").attr("width")) / 2
        )
      )
    );
  this.timeLineObj.svg
    .select(".time-line-after")
    .transition()
    .duration(120)
    .attr(
      "x",
      d => {
        const x = Number(this.timeLineObj.svg.select("rect.handle--e").attr("x"))
        if(x > this.svgWidth - this.svgPadding * 2 - this.timeLineObj.svg.select("rect.handle--e").attr("width")) {
          return x - 60;
        }
        else if(Number(this.timeLineObj.svg.select(".selection").attr("width")) < 100) {
          return x - 20;
        }
        else {
          return x - 30;
        }
      }
    )
    .attr(
      "y",
      Number(this.timeLineObj.svg.select(".selection").attr("y")) +
      Number(this.timeLineObj.svg.select(".selection").attr("height")) / 2 + 10
    )
    .text(
      this.timeFormat(
        this.timeLineObj.xScale.invert(
          Number(this.timeLineObj.svg.select("rect.handle--e").attr("x")) + 
          Number(this.timeLineObj.svg.select("rect.handle--e").attr("width")) / 2
        )
      )
    );
}
//设置选中的rect高亮
timeLine.prototype.selectRectHighLight = function() {
  // 没有刷子则返回
  if(d3.select("rect.selection").style("display") == 'none') {
    this.timeLineObj.svg.select(".rect-box").selectAll("rect")
    .attr("opacity", d => {
      return "1";
    })
  }
  else {
    const startTime = this.timeLineObj.xScale.invert(
      Number(this.timeLineObj.svg.select("rect.handle--w").attr("x")) + 
      Number(this.timeLineObj.svg.select("rect.handle--w").attr("width")) / 2
    ),
    endTime = this.timeLineObj.xScale.invert(
      Number(this.timeLineObj.svg.select("rect.handle--e").attr("x")) + 
      Number(this.timeLineObj.svg.select("rect.handle--e").attr("width")) / 2
    );
    this.timeLineObj.svg.select(".rect-box").selectAll("rect")
    .attr("opacity", d => {
      if(d[1].time - this.timeLineUtils.transferTime(startTime) >= 0 && 
         d[1].time - this.timeLineUtils.transferTime(endTime) <= 0){
        return "1";
      }
      else{
        return "0.5";
      }
    })
  }
}
//暴露重写刷子触发事件的方法
timeLine.prototype.setBrushEvent = function(type, fn) {
  this.timeLineObj.brush.on && this.timeLineObj.brush.on(`${type}`, fn);
  return this;
};
//暴露重写刷子上按钮事件的方法
timeLine.prototype.setBrushButtonEvent = function(type, fn) {
  this.closeButton.type = type;
  this.closeButton.event = fn;
};
//初始化缩放行为和默认事件
timeLine.prototype.initZoom = function(xScale, yScale) {
  const xMin = this.svgPadding * 2,
  yMin = this.svgPadding * 3,
  xMax = this.xAxisEnd,
  yMax = this.yAxisStart;
  if(xMin > 0 && yMin > 0 && xMax > 0 && yMax > 0 && xMax - xMin > 0 && yMax - yMin > 0) {
    const zoom = d3.zoom()
      .scaleExtent([1, 50])
      .extent([
        [xMin, yMin],
        [xMax, yMax]
      ])
      .translateExtent([
        [this.svgPadding * 2, -Infinity],
        [this.xAxisEnd, Infinity]
      ])
      .on("zoom", () => {
        // console.log("zoom-event:", d3.event);
        if (
          d3.event.sourceEvent &&
          d3.event.sourceEvent.type != "brush" &&
          d3.event.sourceEvent.type != "end"
        ) {
          //获取x轴缩放后的比例尺
          const xz = d3.event.transform.rescaleX(xScale);
          this.timeLineObj.xScale = xz;
          //根据新的比例尺移动实体位置
          this.moveEntities(xz, yScale);
          //根据新的比例尺初始化x轴
          this.initXaxis(xz);
          //更改刷子的显示和日期值
          if (
            this.timeLineObj.svg.select("rect.handle--w").node() &&
            this.timeLineObj.svg.select("rect.handle--e").node()
          ) {
            // const [x0, x1] = [
            //   Number(this.timeLineObj.svg.select("rect.handle--w").attr("x")),
            //   Number(this.timeLineObj.svg.select("rect.handle--e").attr("x"))
            // ].map(d => this.interval.round(xz.invert(d)));
            // this.timeLineObj.svg
            //   .select(".brush-box")
            //   .transition()
            //   .call(
            //     this.timeLineObj.brush.move,
            //     x1 > x0 ? [x0, x1].map(xz) : null
            //   );
            this.setDateText();
          }
          this.selectRectHighLight();
        }
      })
      .filter(() => {
        //阻止非滚轮事件触发的缩放
        return d3.event.type == 'wheel' ? true : false;
      })
    this.timeLineObj.svg
      .call(zoom)
      .transition()
      .duration(750)
      .call(zoom.scaleTo, 1);
    this.timeLineObj.zoom = zoom;
  }
};
//暴露重写缩放事件的方法
timeLine.prototype.setZoomEvent = function(type, fn) {
  this.timeLineObj.zoom.on && this.timeLineObj.zoom.on(`${type}`, fn);
  return this;
};
//更新数据
timeLine.prototype.updateNode = function(nodeData) {
  ({ 
    timeArr: this.timeArr, 
    sortTimeArr: this.sortTimeArr, 
    typeColor: this.typeColor
  } = this.timeLineUtils.countDataByTime(nodeData, this.timeUnit));
  this.initRange();
  this.initZoom(this.timeLineObj.xScale, this.timeLineObj.xScale);
  this.updateEntities(this.timeLineObj.xScale, this.timeLineObj.yScale);
  this.setDateText();
  this.selectRectHighLight();
  // if(this.timeLineObj.allTimeLine) {
  //   this.timeLineObj.allTimeLine.updateNode(nodeData);
  // }
}