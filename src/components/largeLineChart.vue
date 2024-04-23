<template>
    <div id="container" ref="container"></div>
  </template>
  
  <script>
  import { ref, onMounted, watch } from "vue";
  import Konva from "konva";
  
  export default {
    props: {
      size: {
        type: Object,
        default: () => [
          {
            width: 450,
            height: 350,
          },
        ],
      },
      colors: {
        type: String,
        default: "#3F6EFF",
      },
      data: {
  type: Array,
  default: () => {
    const data = [];
    let currentValue = 500; // 将 currentValue 定义为变量，并初始化为 0
    for (let i = 0; i < 1000; i++) {
      // 生成一个随机增量，介于 -1 和 1 之间
      const increment = Math.ceil((Math.random() - 0.5) * 50);
      // 将当前值与随机增量相加，并将结果限制在 0 到 1000 之间
      currentValue += increment;
      let label = "Date" + i.toLocaleString();
      data.push({ data: currentValue, label: label });
    }
    return data;
  },
},

      dataLabel: {
        type: Array,
        default: () => ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"],
      },
      colorMode: {
        type: String,
        default: "day",
      },
    },
    setup(props) {
      const container = ref(null);
      let stage = null;
      let layer = null;
      let extraLayer = null;
  
      const colors = props.colors;
      const colorMode = props.colorMode;
      const data = props.data;
      const dataLabel = props.dataLabel;
      const ctnHeight = props.size.height;
      const ctnWidth = props.size.width;
  
      watch(
        () => props.colorMode,
        (newValue, oldValue) => {
          console.log("now: ", newValue);
          if (newValue === "day") {
            container.value.style.backgroundColor = "#ffffff";
          } else {
            container.value.style.backgroundColor = "#061936";
          }
          drawChart(
            stage,
            layer,
            extraLayer,
            ctnWidth,
            ctnHeight,
            data,
            dataLabel,
            newValue,
            colors
          );
        }
      );
  
      onMounted(() => {
        if (!container.value) return;
  
        stage = new Konva.Stage({
          container: container.value,
          width: ctnWidth,
          height: ctnHeight,
        });
  
        layer = new Konva.Layer();
        extraLayer = new Konva.Layer();
        stage.add(layer);
        stage.add(extraLayer);
  
        drawChart(
          stage,
          layer,
          extraLayer,
          ctnWidth,
          ctnHeight,
          data,
          dataLabel,
          colorMode,
          colors
        );
      });
  
      return { container };
    },
  };
  
  function drawChart(
    stage,
    layer,
    extraLayer,
    ctnWidth,
    ctnHeight,
    data,
    dataLabel,
    colorMode,
    colors
  ) {
    layer.removeChildren();
    extraLayer.removeChildren();
  
    const groupLine = new Konva.Group();
    const dataValues = data.map(item => item.data);
    const maxData = getMaxData(Math.max(...dataValues));
    const points = dataToPoints(data, maxData, ctnWidth, ctnHeight);
    const fontSize = calculateFontSize(ctnWidth, ctnHeight);
    const stroke = Math.round(Math.min(ctnHeight, ctnWidth) * 0.004);
  
    drawAxis(
      layer,
      maxData,
      dataLabel,
      ctnWidth,
      ctnHeight,
      colorMode,
      fontSize,
      stroke
    );
  
    const polyPoints = [];
    for (let i = 0; i < points.length; i++) {
      const x = points[i].x;
      const y = points[i].y;
      polyPoints.push(x, y);
    }
  
    const linePoints = [];
    points.shift();
    points.pop();
    for (let i = 0; i < points.length; i++) {
      const x = points[i].x;
      const y = points[i].y;
      linePoints.push(x, y);
    }
  
    const line = new Konva.Line({
      points: polyPoints,
      // fill: colors + "80",
      stroke: colors,
      opacity: 1,
      strokeWidth: stroke * 0.75,
      // closed: true,
      // lineCap: 'round',
      lineJoin: "round",
      tension: 0.3,
    });
  
    const poly = new Konva.Line({
      points: polyPoints,
      opacity: 1,
      strokeWidth: 0,
      closed: true,
      tension: 0.3,
      fillLinearGradientStartPoint: { x: 0.5 * ctnWidth, y: ctnHeight * 1 },
      fillLinearGradientEndPoint: { x: 0.5 * ctnWidth, y: 0 },
      fillLinearGradientColorStops: [0, "#ffffff00", 1, colors + "80"],
    });

    const groupHint = new Konva.Group();
  
    const supportLine = new Konva.Line({
      points: [0, 0.1 * ctnHeight, 0, 0.9 * ctnHeight],
      opacity: 0,
      stroke: colorMode === "day" ? "#86909C" : "#D5D5D6CC",
      strokeWidth: stroke * 0.2,
      dash: [5, 5],
      lineJoin: "round",
      lineCap: "round",
    });
    

  
    groupLine.add(poly, line);
    layer.add(groupLine);
    layer.add(supportLine);
  
    const anim = new Konva.Animation((frame) => {
      const elapsed = frame.time;
  
      if (elapsed < 1000) {
        const currentChart = (elapsed / 1000) * 0.8 * ctnWidth;
        groupLine.clipFunc(function (context) {
          context.rect(0.125 * ctnWidth + 5, 0, currentChart - 10,  0.9 * ctnHeight);
        });
      } else {
        groupLine.clipFunc(function (context) {
          context.rect(0.125 * ctnWidth + 5, 0, 0.8 * ctnWidth - 10, 0.9 * ctnHeight);
        });
        anim.stop();
  
        for (let i = 0; i < dataLabel.length - 1; i++) {
          let tooltip = createTooltip(
            i,
            ctnWidth,
            colors,
            points,
            data,
            dataLabel,
            groupHint,
            extraLayer,
            fontSize,
            stroke
          );
  
          stage.on("mousemove", (e) => {
            if (tooltip.getParent() && groupHint.getParent()) {
              const mouseX = stage.getPointerPosition().x;
              const left =
                (i * 0.8 * ctnWidth) / (dataLabel.length - 1) + 0.1 * ctnWidth;
              const width = (0.8 * ctnWidth) / (dataLabel.length - 1);
              if (mouseX > left && mouseX < left + width) {
                tooltip.to({
                  opacity: 0.8,
                  duration: 0.1,
                });
              } else {
                tooltip.to({
                  opacity: 0,
                  duration: 0.1,
                });
              }
            }
          });
  
          stage.on("mouseleave", () => {
            if (tooltip.getParent() && groupHint.getParent()) {
              tooltip.to({
                opacity: 0,
                duration: 0.1,
              });
            }
          });
        }
      }
    });
  
    anim.start();
  
    layer.draw();
  
    stage.on("mousemove", (e) => {
      if (!anim.isRunning()) {
        const mouseX = stage.getPointerPosition().x;
        // const i = findIndexByMouseX(mouseX, ctnWidth, data);
        if (mouseX > 0.1 * ctnWidth && mouseX < 0.95 * ctnWidth) {
          supportLine.points([mouseX, 0.05 * ctnHeight, mouseX, 0.9 * ctnHeight]);
          supportLine.opacity(1);
          layer.batchDraw();
        }
      }
    });
  
    stage.on("mouseleave", (e) => {
      if (!anim.isRunning()) {
        supportLine.opacity(0);
        layer.batchDraw();
      }
    });
  }
  
  function calculateFontSize(ctnWidth, ctnHeight) {
    return Math.ceil(Math.min(ctnWidth, ctnHeight) / 40);
  }

  function calculateStats(data, start, end) {
  if (start < 0 || end >= data.length || start > end) {
    return null; // 如果起始索引或结束索引超出了数据范围，返回 null
  }

  let sum = 0;
  let max = Number.MIN_SAFE_INTEGER;
  let min = Number.MAX_SAFE_INTEGER;
  let maxIndex = start;
  let minIndex = start;

  for (let i = start; i <= end; i++) {
    const value = data[i].data;
    sum += value;

    if (value > max) {
      max = value;
      maxIndex = i;
    }

    if (value < min) {
      min = value;
      minIndex = i;
    }
  }

  const mean = (sum / (end - start + 1)).toFixed(2); // 计算均值

  return {
    mean: mean,
    max: max,
    min: min,
    maxIndex: maxIndex,
    minIndex: minIndex
  };
}
  
  function createTooltip(
    i,
    ctnWidth,
    colors,
    points,
    data,
    dataLabel,
    groupHint,
    extraLayer,
    fontSize,
    stroke
  ) {
    const ratioLeft = Math.floor(i / (dataLabel.length - 1) * points.length);
    const ratioRight = Math.min(Math.floor((i+1) / (dataLabel.length - 1) * points.length), points.length - 1);

    const x = (points[ratioLeft].x  + points[ratioRight].x) / 2;
    const y = (points[ratioLeft].y  + points[ratioRight].y) / 2;
    const tempData = calculateStats(data, ratioLeft, ratioRight);
    // console.log(tempData);

    var tooltip = new Konva.Label({
      x: x > 0.5 * ctnWidth ? x - fontSize : x + fontSize,
      y: y,
      opacity: 0,
    });
  
    tooltip.add(
      new Konva.Tag({
        fill: "#ffffff",
        pointerDirection: x > 0.5 * ctnWidth ? "right" : "left",
        pointerWidth: 0.01 * ctnWidth,
        pointerHeight: 0.01 * ctnWidth,
        cornerRadius: 0.01 * ctnWidth,
        lineJoin: "round",
        stroke: colors,
        strokeWidth: 0.5 * stroke,
        shadowColor: colors,
        shadowBlur: 0.01 * ctnWidth,
        shadowOpacity: 0.1,
      })
    );
  
    tooltip.add(
      new Konva.Text({
        text: dataLabel[i] + " -  " + dataLabel[i + 1] + "  \n\n" 
              + "Mean: " + tempData.mean + " \n"
              + "Max: " + tempData.max + "  " + data[tempData.maxIndex].label + "\n"
              + "Min: " + tempData.min + "  " + data[tempData.minIndex].label ,
        fontSize: fontSize * 1.1,
        lineHeight: 1.2,
        padding: fontSize * 0.5,
        fill: colors,
      })
    );
  
    groupHint.add(tooltip);
    extraLayer.add(groupHint); // 将 groupHint 添加到 extraLayer 中
    return tooltip;
  }
  
  function getDataMagnitude(num) {
    // 使用对数运算获取数据的量级
    let magnitude = Math.floor(Math.log10(Math.abs(num)));
    return magnitude;
  }
  
  function getMaxData(maxData) {
    let magnitude = getDataMagnitude(maxData);
    let multiple = Math.pow(10, magnitude);
    let nearestMultiple = Math.ceil(maxData / multiple) * multiple; // 找到最大数据的最近整数
    //两者的差不能过大
    if (nearestMultiple - maxData > 0.5 * multiple) {
      nearestMultiple -= 0.5 * multiple;
    }
    if (nearestMultiple - maxData === 0.5 * multiple) {
      return maxData;
    }
    return nearestMultiple;
  }
  
  function drawAxis(
    layer,
    maxData,
    dataLabel,
    ctnWidth,
    ctnHeight,
    colorMode,
    fontSize,
    stroke
  ) {
    const line = Math.min(Math.max(Math.floor(ctnHeight * 0.01) + 1, 5), 10);

    let mode = colorMode === "day" ? "#86909C" : "#D5D5D6CC";
  
    for (let i = 0; i < line; i++) {
      let tempvalue = Math.floor(maxData - i * (maxData / line));
      let value = (Math.round(tempvalue / 5) * 5).toLocaleString();
      let tempY =
        0.1 * ctnHeight + i * ((0.9 * ctnHeight - 0.1 * ctnHeight) / line);
  
      const axis = new Konva.Line({
        points: [0.1 * ctnWidth, tempY, 0.95 * ctnWidth, tempY], // x 轴坐标
        stroke: mode,
        strokeWidth: 0.2 * stroke,
        dash: [5, 5],
        lineJoin: "round",
        lineCap: "round",
      });
  
      const text = new Konva.Text({
        x: 5,
        y: tempY - 4,
        fill: mode,
        text: value,
        width: 0.08 * ctnWidth,
        align: "right",
        fontSize: fontSize * 1.1,
      });
  
      layer.add(axis, text);
    }
  
    const axisX = new Konva.Line({
      points: [0.1 * ctnWidth, 0.9 * ctnHeight, 0.95 * ctnWidth, 0.9 * ctnHeight],
      stroke: mode,
      strokeWidth: 0.2 * stroke,
      lineJoin: "round",
      lineCap: "round",
    });
  
    layer.add(axisX);

    for(let i = 0; i < dataLabel.length; i ++){
      let x = (i * 0.8 * ctnWidth) / (dataLabel.length - 1) + 0.1 * ctnWidth;
      let value = dataLabel[i]
      const text = new Konva.Text({
        x: x,
        y: 0.92 * ctnHeight,
        fontSize: fontSize * 1.2,
        fill: mode,
        text: value,
        width: (0.7 * 0.8 * ctnWidth) / (dataLabel.length - 1),
      })
      layer.add(text);
    }
  
  }
  
  function dataToPoints(data, maxData, ctnWidth, ctnHeight) {
    let points = [];
    const width = 0.8 * ctnWidth;
    const height = 0.8 * ctnHeight;
  
    for (let i = 0; i < data.length; i++) {
      let x = (i * width) / (data.length - 1) + 0.125 * ctnWidth;
      let y = 0.9 * ctnHeight - (data[i].data / maxData) * height;
      points.push({ x: x, y: y });
    }
    points.unshift({ x: 0.125 * ctnWidth, y:  ctnHeight });
    points.push({ x: 0.925 * ctnWidth, y:  ctnHeight });
  
    return points;
  }
  </script>
  
  <style>
  #container {
    background-color: #ffffff;
  }
  </style>
  