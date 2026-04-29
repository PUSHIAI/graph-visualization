import * as d3 from "d3";
export default class TimeWheel {
  
  constructor(id, nodeData, timeUnit, legendNum = 4) {
    this.defaultRadius = 24;
    this.id = id;
    this.timeUnit = timeUnit;
    this.timeWheelObj = {
      svg: d3.select(id)
    };
    this.rangeManage = [];
    this.colorGenerator = {};
    this.weekMap = {
      0: "Mon",
      1: "Tue",
      2: "Wed",
      3: "Thu",
      4: "Fri",
      5: "Sat",
      6: "Sun"
    };
    this.timeData = [
      { name: "00:00", key: 0, number: 0 },
      { name: "01:00", key: 1, number: 0 },
      { name: "02:00", key: 2, number: 0 },
      { name: "03:00", key: 3, number: 0 },
      { name: "04:00", key: 4, number: 0 },
      { name: "05:00", key: 5, number: 0 },
      { name: "06:00", key: 6, number: 0 },
      { name: "07:00", key: 7, number: 0 },
      { name: "08:00", key: 8, number: 0 },
      { name: "09:00", key: 9, number: 0 },
      { name: "10:00", key: 10, number: 0 },
      { name: "11:00", key: 11, number: 0 },
      { name: "12:00", key: 12, number: 0 },
      { name: "13:00", key: 13, number: 0 },
      { name: "14:00", key: 14, number: 0 },
      { name: "15:00", key: 15, number: 0 },
      { name: "16:00", key: 16, number: 0 },
      { name: "17:00", key: 17, number: 0 },
      { name: "18:00", key: 18, number: 0 },
      { name: "19:00", key: 19, number: 0 },
      { name: "20:00", key: 20, number: 0 },
      { name: "21:00", key: 21, number: 0 },
      { name: "22:00", key: 22, number: 0 },
      { name: "23:00", key: 23, number: 0 }
    ];
    this.nodeData = [];
    this.legendNum = legendNum;
    this.colorArr = []
    this.setData(nodeData);
    this.groupData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    this.svgWidth = this.getSvgWidth(id);
    this.svgHeight = this.getSvgHeight(id);
    //改变svg的可视范围 否则圆心将在(0，0)处
    this.timeWheelObj.svg
    .attr("preserveAspectRatio", "xMidYMin meet")
    .attr("viewBox", [
      -(this.groupData.length + 3) * this.defaultRadius,
      -(this.groupData.length + 3) * this.defaultRadius,
      (this.groupData.length + 3) * this.defaultRadius * 2,
      (this.groupData.length + 3) * this.defaultRadius * 2
    ]);
  }
  init() {
    const tooltipDiv = d3
      .select("body")
      .append("div")
      .classed("wheel-tooltip", true)
      .style("opacity", 0);
    let pie = [];
    for (let i = 0; i < this.groupData.length; i++) {
      //根据value计算角度
      pie = d3
        .pie()
        .sort(null)
        .value(function(d) {
          // value值决定了弧度的大小 设为1是为了均分各个扇形
          return 1;
        })(this.nodeData[this.weekMap[i]]);
      //按星期进行分组
      //生成扇形构造器
      const arc = d3
        .arc()
        .innerRadius((i + 1) * this.defaultRadius)
        .outerRadius((i + 2) * this.defaultRadius);
      this.timeWheelObj.svg
        .append("g")
        .classed(`time-wheel-${i}`, true)
        .selectAll("path")
        .data(pie)
        .join("path")
        .attr("fill", d => this.setColor(d.data.number))
        .attr("stroke", "gray")
        .attr("d", arc)
        .on("click.arcAntity", function(d) {
          console.log("click:", d);
        })
        .on("mouseover", function(d) {
          tooltipDiv
            .transition()
            .duration(300)
            .style("opacity", 0.9);
          tooltipDiv
            .html(`数量: ${d.data.number} <br/>`)
            .style("left", d3.event.pageX + 10 + "px")
            .style("top", function(d) {
              return d3.event.pageY - 10 + "px";
            })
            .style("z-index", 101);
        })
        .on("mousemove", function(d) {
          tooltipDiv
            .style("left", d3.event.pageX + 10 + "px")
            .style("top", function(d) {
              return d3.event.pageY - 10 + "px";
            });
        })
        .on("mouseout", function(d) {
          tooltipDiv
            .transition()
            .duration(300)
            .style("opacity", 0)
            .style("z-index", -1);
        });
    }
    const textArc = d3
      .arc()
      .innerRadius((this.groupData.length + 1) * this.defaultRadius)
      .outerRadius((this.groupData.length + 2) * this.defaultRadius);
    this.timeWheelObj.svg
      .append("g")
      .classed("time-text", true)
      .selectAll("text")
      .data(pie)
      .join("text")
      .attr("transform", d => `translate(${textArc.centroid(d)})`)
      .call(text =>
        text
          .append("tspan")
          .attr("x", "-1.5em")
          .attr("font-weight", "bold")
          .text(d => d.data.name)
      );
    this.timeWheelObj.svg
      .append("g")
      .classed("week-text", true)
      .selectAll("text")
      .data(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
      .join("text")
      .attr("transform", (d, i) => {
        return `translate(10,-${(i + 1) * this.defaultRadius + 10})`;
      })
      .call(text =>
        text
          .append("tspan")
          .attr("x", "-1.5em")
          .attr("font-weight", "bold")
          .text(d => d)
      );
  }
  // 更新数据
  updateData(wheelData, isNew = true) {
    if(isNew) {
      this.setData(wheelData);
    }
    let pie = [];
    for (let i = 0; i < this.groupData.length; i++) {
      //根据value计算角度
      pie = d3.pie().sort(null).value(function(d) {
          // value值决定了弧度的大小 设为1是为了均分各个扇形
          return 1;
        })(this.nodeData[this.weekMap[i]]);
      //按星期进行分组
      //生成扇形构造器
      const arc = d3
        .arc()
        .innerRadius((i + 1) * this.defaultRadius)
        .outerRadius((i + 2) * this.defaultRadius);
      this.timeWheelObj.svg
        .select(`.time-wheel-${i}`)
        .selectAll("path")
        .data(pie)
        .join(
          enter => enter.append("path"),
          update => update,
          exit => exit.remove()
        )
        .attr("fill", d => this.setColor(d.data.number, d.data.hide))
    }
  }
  setColor(value, hide = false) {
    const color = this.colorGenerator = d3.scaleQuantize()
    .domain([this.rangeManage[0], this.rangeManage[this.rangeManage.length - 1]])
    .range(this.colorArr);
    if (value != 0 && !hide) {
      return color(value);
    } else {
      return "transparent";
    }
  }
  getSvgWidth(svg) {
    return d3
      .select(svg)
      .node()
      .getBoundingClientRect().width;
  }
  getSvgHeight(svg) {
    return d3
      .select(svg)
      .node()
      .getBoundingClientRect().height;
  }
  //处理数据 按星期和小时分类
  setData(nodeData) {
    let rangeArr = [];
    this.nodeData = [];
    for (let i = 0; i < 7; i++) {
      let timeData = [];
      timeData = this.timeData.map(item => {
        const data = JSON.parse(JSON.stringify(item));
        data.week = this.weekMap[i];
        data.key += '-' + (i + 1);
        return data;
      });
      this.nodeData[this.weekMap[i]] = timeData.concat();
    }
    nodeData.forEach((item, index) => {
      for(let i = 0; i < this.timeUnit.length; i++) {
        if (item.attributes && item.attributes[this.timeUnit[i]]) {
          const date = new Date(item.attributes[this.timeUnit[i]]),
                week = this.weekMap[date.getDay()],
                time = date.getHours();
          this.nodeData[week][time].number += 1;
          // this.nodeData[week][time].number = index;
          if(!this.nodeData[week][time].data) {
            this.nodeData[week][time].data = [];
          }
          this.nodeData[week][time].data.push(JSON.parse(JSON.stringify(item)));
          rangeArr.push(this.nodeData[week][time].number);
          break;
        }
      }
    });
    this.rangeManage = [...new Set(rangeArr)];
    // 统计数量较少时，图例数据直接枚举出来
    if(this.rangeManage.length <= 4) {
      this.averageNum = this.rangeManage.concat();
    }
    // 统计数量较多时，图例数据使用范围数据
    else { 
      this.averageNum = d3.quantize(d3.interpolate(this.rangeManage[0], this.rangeManage[this.rangeManage.length - 1]), this.legendNum + 1);
    }
    this.setLegend();
  }
  // 计算图例颜色
  setLegend() {
    this.colorArr = [];
    const color = d3.scaleLinear()
    .domain([1, this.legendNum])
    .range(["#CBE5FE", "#1F81E4"]);
    for(let i = 1;i <= this.legendNum;i++) {
      this.colorArr.push(color(i));
    }
  }
  // 暴露时间罗盘绑定事件
  setWheelEvent(type, fn) {
    this.timeWheelObj.svg.on(type, fn);
    return this;
  }
}
