import * as d3 from "d3";
//连接时间轴和总时间轴的方法

export default function ConnectTimeLine(timeLine, allTimeLine) {
  this.timeLine = timeLine;
  this.allTimeLine = allTimeLine;
  this.timeLineObj = this.timeLine.timeLineObj;
  this.allTimeLineObj = this.allTimeLine.allTimeLineObj;
  this.svgPadding = this.timeLine.svgPadding;
  this.svgWidth = this.timeLine.svgWidth;
  this.rectWidth = this.timeLine.rectWidth;
  //连接轴之前的实体
  timeLine.timeLineObj.allTimeLine = allTimeLine;
  allTimeLine.allTimeLineObj.allTimeLine = timeLine;
}
// 连接时间轴和总时间轴 同步时间轴缩放和总时间轴的brush
// 主要是重写时间轴的缩放事件和总时间轴的brush事件
ConnectTimeLine.prototype.setConnect = function() {
  const vm = this,
    timeFormat = d3.timeFormat("%Y %b, %d"),
    interval = d3.timeDay.every(1);
  vm.allTimeLineObj.brush
    .on("brush", function() {
      const selection = d3.event.selection;
      if (
        !d3.event.sourceEvent ||
        !selection ||
        d3.event.sourceEvent.type == "zoom"
      )
        return;
      vm.allTimeLine.setDateText();
      //获取刷子的左右区间
      const [minX, maxX] = [
        vm.allTimeLineObj.xScale.invert(
          vm.allTimeLineObj.svg.select("rect.handle--w").attr("x")
        ),
        vm.allTimeLineObj.xScale.invert(
          vm.allTimeLineObj.svg.select("rect.handle--e").attr("x")
        )
      ];
      //生成新的x坐标轴
      vm.timeLineObj.xScale = vm.allTimeLineObj.xScale
        .copy()
        .domain([minX, maxX]);
      //根据新的比例尺移动实体位置
      vm.timeLine.moveEntities(
        vm.timeLineObj.xScale,
        vm.allTimeLineObj.yScale
      );
      //根据新的比例尺初始化x轴
      vm.timeLine.initXaxis(vm.timeLineObj.xScale);
      //去除时间轴刷子
      vm.timeLineObj.svg.select(".brush-box").select(".selection").style("display", "none")
      vm.timeLineObj.svg.select(".time-line-before").remove();
      vm.timeLineObj.svg.select(".time-line-after").remove();
      vm.timeLineObj.svg.select(".filter-button").remove();
      // //更改刷子的显示和日期值
      // if (
      //   vm.timeLineObj.svg.select("rect.handle--w").node() &&
      //   vm.timeLineObj.svg.select("rect.handle--e").node()
      // ) {
      //   const [x0, x1] = [
      //     Number(vm.timeLineObj.svg.select("rect.handle--w").attr("x")),
      //     Number(vm.timeLineObj.svg.select("rect.handle--e").attr("x"))
      //   ].map(d => interval.round(vm.timeLineObj.xScale.invert(d)));
      //   vm.timeLineObj.svg
      //     .select(".brush-box")
      //     .transition()
      //     .call(
      //       vm.timeLineObj.brush.move,
      //       x1 > x0 ? [x0, x1].map(vm.timeLineObj.xScale) : null
      //     );
      // }
    })
    .on("end", function() {
      // console.log("end-brush:", d3.event);
      //重制缩放范围
      vm.timeLineObj.zoom.translateExtent([
        [vm.svgPadding * 3, -Infinity],
        [vm.svgWidth - vm.svgPadding * 2, Infinity]
      ]);
      vm.allTimeLine.setDateText();
      //d3.event为当前刷取事件对象
      const selection = d3.event.selection;
      if (!selection) {
        vm.allTimeLineObj.svg
        .select(".brush-box")
        .call(vm.allTimeLineObj.brush.move, [
          vm.svgPadding * 3,
          vm.svgWidth - vm.svgPadding * 2
        ]);
        // d3.select(".time-line-before").remove();
        // d3.select(".time-line-after").remove();
        return;
      }
      // 根据线性函数计算k和x 并赋给time-line的transform
      // xStart1 = xStart0 * k + x'
      // xEnd1 = xEnd0 * k + x'
      if (d3.event.sourceEvent && d3.event.sourceEvent.type != "zoom") {
        let transformX = 0,
          k = 0;
        k =
          (vm.svgPadding * 3 - (vm.svgWidth - vm.svgPadding * 2)) /
          (Number(vm.allTimeLineObj.svg.select("rect.handle--w").attr("x")) -
            Number(vm.allTimeLineObj.svg.select("rect.handle--e").attr("x")));
        transformX =
          vm.svgPadding * 3 -
          Number(vm.allTimeLineObj.svg.select("rect.handle--w").attr("x")) * k;
        const transform = d3.zoomIdentity.translate(transformX, 0).scale(k);
        vm.timeLineObj.svg.call(vm.timeLineObj.zoom.transform, transform);
      }
    });
  vm.timeLineObj.zoom.on("zoom", () => {
    console.log("zoom-event:", d3.event);
    if (
      d3.event.sourceEvent &&
      d3.event.sourceEvent.type != "brush" &&
      d3.event.sourceEvent.type != "end" &&
      d3.event.sourceEvent.type != "mousemove"
    ) {
      //获取x轴缩放后的比例尺
      const xz = d3.event.transform.rescaleX(vm.timeLineObj.initialXscale);
      vm.timeLineObj.xScale = xz;
      //根据新的比例尺移动实体位置
      vm.timeLine.moveEntities(xz, vm.timeLineObj.initialYscale);
      //根据新的比例尺初始化x轴
      vm.timeLine.initXaxis(xz);
      //同步总时间轴的刷子区间
      const allTimeLine = vm.allTimeLineObj.svg.select(".brush-box");
      if (allTimeLine.node()) {
        allTimeLine.call(vm.allTimeLineObj.brush.move, [
          vm.allTimeLineObj.xScale(xz.domain()[0]),
          vm.allTimeLineObj.xScale(xz.domain()[1])
        ]);
        vm.allTimeLine.setDateText();
      }
      //去除时间轴刷子
      vm.timeLineObj.svg.select(".brush-box").select(".selection").style("display", "none")
      vm.timeLineObj.svg.select(".time-line-before").remove();
      vm.timeLineObj.svg.select(".time-line-after").remove();
      vm.timeLineObj.svg.select(".filter-button").remove();
      //更改刷子的显示和日期值
      // if (
      //   vm.timeLineObj.svg.select("rect.handle--w").node() &&
      //   vm.timeLineObj.svg.select("rect.handle--e").node()
      // ) {
      //   const [x0, x1] = [
      //     Number(vm.timeLineObj.svg.select("rect.handle--w").attr("x")),
      //     Number(vm.timeLineObj.svg.select("rect.handle--e").attr("x"))
      //   ].map(d => interval.round(xz.invert(d)));
      //   vm.timeLineObj.svg
      //     .select(".brush-box")
      //     .transition()
      //     .call(vm.timeLineObj.brush.move, x1 > x0 ? [x0, x1].map(xz) : null);
      // }
    }
  });
};
