//总时间轴画图类
import * as d3 from "d3";
import utils from "./utils";
export default function allTimeLine(id, nodeData) {
  (this.timeFormat = d3.timeFormat("%Y,%m,%d")),
    (this.timeLineUtils = new utils());
  (this.svgPadding = 20),
    (this.xAxis = {
      start: "",
      end: ""
    }),
    (this.yAxis = {
      start: "",
      end: ""
    });
  this.allTimeLineId = id;
  this.allTimeLineObj = {
    //总时间轴对象管理
    svg: Object,
    xScale: Object,
    yScale: Object,
    xAxis: Object,
    yAxis: Object,
    brush: Object,
    timeLineObj: Object
  };
  this.svgWidth = this.timeLineUtils.svgWidth(id);
  this.svgHeight = this.timeLineUtils.svgHeight(id);
  d3.select(id).html(" ");
  this.allTimeLineObj.svg = d3.select(id).attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", `0 0 ${this.svgWidth} ${this.svgHeight}`);
  ({ sortTimeArr: this.sortTimeArr } = this.timeLineUtils.countDataByTime(nodeData));
}
//初始化时间轴
allTimeLine.prototype.init = function() {
  const countArr = [];
  this.sortTimeArr.forEach(item => {
    countArr.push(item.count);
  });
  this.xAxis = {
    start: this.sortTimeArr[0].time,
    end: this.sortTimeArr[this.sortTimeArr.length - 1].time
  };
  this.yAxis = {
    start: 0,
    end: Math.max(...countArr)
  };
  this.allTimeLineObj.xScale = this.initXscale(
    this.timeLineUtils.transferTime(this.xAxis.start),
    this.timeLineUtils.transferTime(this.xAxis.end)
  );
  this.allTimeLineObj.yScale = this.initYscale(
    this.yAxis.start,
    this.yAxis.end
  );
  this.allTimeLineObj.xAxis = this.initXaxis(this.allTimeLineObj.xScale);
  this.allTimeLineObj.yAxis = this.initYaxis(this.allTimeLineObj.yScale);
  this.allTimeLineObj.yAxis.remove();
  // this.allTimeLineObj.yAxis.selectAll("text").remove();
  this.renderAllEntitiesByTime(
    this.allTimeLineObj.xScale,
    this.allTimeLineObj.yScale
  );
  this.setAllBrush();
  this.allTimeLineObj.svg
    .select(".brush-box")
    .call(this.allTimeLineObj.brush.move, [
      this.svgPadding * 3,
      this.svgWidth - this.svgPadding * 2
    ]);
};
//初始化x轴刻度尺
allTimeLine.prototype.initXscale = function(xStart, xEnd) {
  return d3
    .scaleTime()
    .domain([xStart, xEnd])
    .range([this.svgPadding * 3, this.svgWidth - this.svgPadding * 2]);
};
//初始化y轴刻度尺
allTimeLine.prototype.initYscale = function(yStart = 0, yEnd) {
  const range = [this.svgHeight - this.svgPadding, this.svgPadding];
  return d3
    .scaleLinear()
    .domain([yStart, yEnd])
    .range(range);
};
//初始化x坐标轴
allTimeLine.prototype.initXaxis = function(xScale) {
  const translateY = this.svgHeight - this.svgPadding,
    //时间轴间隔天数
    ticksDay = 1;
  if (!this.allTimeLineObj.svg.select(".x-axis").node()) {
    return this.allTimeLineObj.svg
      .append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0,${translateY})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(5)
          .tickFormat(this.timeFormat)
      )
      .call(g => {
        g.select(".domain").remove();
      });
  } else {
    return this.allTimeLineObj.svg
      .select(".x-axis")
      .attr("transform", `translate(0,${translateY})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(5)
          .tickFormat(this.timeFormat)
      )
      .call(g => {
        g.select(".domain").remove();
      });
  }
};
//初始化y坐标轴
allTimeLine.prototype.initYaxis = function(yScale) {
  return this.allTimeLineObj.svg
    .append("g")
    .classed("y-axis", true)
    .attr("transform", `translate(${this.svgPadding},0)`)
    .call(d3.axisRight(yScale).tickSize([this.svgWidth - this.svgPadding]))
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
};
//渲染总时间轴实体并以时间分组
allTimeLine.prototype.renderAllEntitiesByTime = function(xScale, yScale) {
  const enhanceData = [];
  this.sortTimeArr.forEach((item, index) => {
    let beforeDay = JSON.parse(JSON.stringify(item));
    beforeDay.time = new Date(new Date(item.time).getTime() - 24*60*60*1000) + "";
    if(this.sortTimeArr[index - 1] && beforeDay.time != this.sortTimeArr[index - 1].time && index != 0){
      beforeDay.count = 0;
      enhanceData.push(beforeDay);
    }
    enhanceData.push(item);
    let afterDay = JSON.parse(JSON.stringify(item));
    afterDay.time = new Date(new Date(item.time).getTime() + 24*60*60*1000) + "";
    if(this.sortTimeArr[index + 1] && afterDay.time != this.sortTimeArr[index + 1].time && index != this.sortTimeArr.length - 1){
      afterDay.count = 0;
      enhanceData.push(afterDay);
    }
  })
  const line = d3
    .area()
    .x(d => xScale(this.timeLineUtils.transferTime(d.time)))
    .y0(yScale(0))
    .y1(d => yScale(d.count));
  if(this.allTimeLineObj.svg.select("path").node()){
    this.allTimeLineObj.svg.select("path").remove();
  }
  this.allTimeLineObj.svg
    .append("path")
    .datum(enhanceData)
    .attr("fill", "steelblue")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", line);
};
//设置总时间轴刷子
allTimeLine.prototype.setAllBrush = function() {
  const extentPosition = [
    [
      this.allTimeLineObj.xScale(
        this.timeLineUtils.transferTime(this.sortTimeArr[0].time)
      ),
      this.svgPadding
    ],
    [
      this.allTimeLineObj.xScale(
        this.timeLineUtils.transferTime(
          this.sortTimeArr[this.sortTimeArr.length - 1].time
        )
      ),
      this.svgHeight - this.svgPadding
    ]
  ];
  this.allTimeLineObj.brush = d3
    .brushX()
    .extent(extentPosition)
    .on("start", () => {
      if (!this.allTimeLineObj.svg.select(".time-line-before").node()) {
        this.allTimeLineObj.svg
          .select(".brush-box")
          .insert("text", "rect.handle--w")
          .classed("time-line-before", true)
          .attr("fill", "#000")
          .attr("x", d3.select("rect.handle--w").attr("x"));
      }
      if (!this.allTimeLineObj.svg.select(".time-line-after").node()) {
        this.allTimeLineObj.svg
          .select(".brush-box")
          .insert("text", "rect.handle--w")
          .classed("time-line-after", true)
          .attr("fill", "#000")
          .attr("x", d3.select("rect.handle--e").attr("x"));
      }
    })
    .on("brush", () => {
      const selection = d3.event.selection;
      if (
        !d3.event.sourceEvent ||
        !selection ||
        d3.event.sourceEvent.type == "zoom"
      )
        return;
      this.setDateText();
    })
    .on("end", () => {
      //d3.event为当前刷取事件对象
      const selection = d3.event.selection;
      if (!selection) {
        d3.select(".time-line-before").remove();
        d3.select(".time-line-after").remove();
        return;
      }
      this.setDateText();
    });
  this.allTimeLineObj.svg
    .append("g")
    .classed(`brush-box`, true)
    .call(this.allTimeLineObj.brush);
};
// 设置刷子日期
allTimeLine.prototype.setDateText = function() {
  this.allTimeLineObj.svg
    .select(".time-line-before")
    .transition()
    .duration(120)
    .attr(
      "x",
      d => {
        const x = Number(this.allTimeLineObj.svg.select("rect.handle--w").attr("x"))
        if(x < this.svgPadding * 3) {
          return x - 30;
        }
        else if(Number(this.allTimeLineObj.svg.select(".selection").attr("width")) < 100) {
          return x - 80;
        }
        else {
          return x - 60;
        }
      }
    )
    .attr(
      "y",
      Number(this.allTimeLineObj.svg.select(".selection").attr("y")) +
      Number(this.allTimeLineObj.svg.select(".selection").attr("height")) / 2 - 10
    )
    .text(
      `${this.timeFormat(
        this.allTimeLineObj.xScale.invert(
          Number(
            this.allTimeLineObj.svg.select("rect.handle--w").attr("x")
          ) +
            Number(
              this.allTimeLineObj.svg
                .select("rect.handle--w")
                .attr("width") / 2
            )
        )
      )}`
    );
  this.allTimeLineObj.svg
    .select(".time-line-after")
    .transition()
    .duration(120)
    .attr(
      "x",
      d => {
        const x = Number(this.allTimeLineObj.svg.select("rect.handle--e").attr("x"))
        if(x > this.svgWidth - this.svgPadding * 2 - this.allTimeLineObj.svg.select("rect.handle--e").attr("width")) {
          return x - 40;
        }
        else if(Number(this.allTimeLineObj.svg.select(".selection").attr("width")) < 100) {
          return x + 10;
        }
        else {
          return x - 20;
        }
      }
    )
    .attr(
      "y",
      Number(this.allTimeLineObj.svg.select(".selection").attr("y")) +
      Number(this.allTimeLineObj.svg.select(".selection").attr("height")) / 2 + 10
    )
    .text(
      `${this.timeFormat(
        this.allTimeLineObj.xScale.invert(
          Number(
            this.allTimeLineObj.svg.select("rect.handle--e").attr("x")
          ) +
            Number(
              this.allTimeLineObj.svg
                .select("rect.handle--e")
                .attr("width") / 2
            )
        )
      )}`
    );
}
// 暴露重写刷子触发事件的方法
allTimeLine.prototype.setAllBrushEvent = function(type, fn) {
  this.allTimeLineObj.brush.on(`${type}`, fn);
  return this;
};
// 更新数据
allTimeLine.prototype.updateNode = function(nodeData){
  ({ sortTimeArr: this.sortTimeArr } = this.timeLineUtils.countDataByTime(nodeData));
  this.renderAllEntitiesByTime(this.allTimeLineObj.xScale, this.allTimeLineObj.yScale);
}