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
      default: () => [1000, 3500, 500, 600, 700, 250, 3000],
    },
    dataLabel: {
      type: Array,
      default: () => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
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
  const maxData = getMaxData(Math.max(...data));
  const points = dataToPoints(data, maxData, ctnWidth, ctnHeight);

  drawAxis(layer, maxData, dataLabel, ctnWidth, ctnHeight, colorMode);

  // 补足数组长度为100的连续数组
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
    points: linePoints,
    fill: colors + "80",
    stroke: colors,
    opacity: 1,
    strokeWidth: 2,
    // lineCap: 'round',
    lineJoin: "round",
  });

  const poly = new Konva.Line({
    points: polyPoints,
    opacity: 1,
    strokeWidth: 0,
    closed: true,
    fillLinearGradientStartPoint: { x: 0.5 * ctnWidth, y: ctnHeight * 1 },
    fillLinearGradientEndPoint: { x: 0.5 * ctnWidth, y: 0 },
    fillLinearGradientColorStops: [0, "#ffffff00", 1, colors + "80"],
  });

  const groupDots = new Konva.Group();
  const groupHint = new Konva.Group();

  for (let i = 0; i < points.length; i++) {
    const dot = new Konva.Circle({
      x: points[i].x,
      y: points[i].y,
      radius: 3,
      stroke: colors,
      fill: "white",
    });
    groupDots.add(dot);

  }

  const supportLine = new Konva.Line({
    points: [0, 0.1 * ctnHeight, 0, 0.9 * ctnHeight],
    opacity: 0,
    stroke: colorMode === "day" ? "#86909C" : "#D5D5D6CC",
    strokeWidth: 0.5,
    dash: [5, 5],
    lineJoin: "round",
    lineCap: "round",
  });

  groupLine.add(poly, line, supportLine, groupDots);
  layer.add(groupLine);

  let tooltips = [];

  const anim = new Konva.Animation((frame) => {
  const elapsed = frame.time;
  
  if (elapsed < 1000) {
    const currentChart = (elapsed / 1000) * ctnWidth;
    groupLine.clipFunc(function (context) {
      context.rect(0, 0, currentChart, ctnHeight);
    });
  } else {
    groupLine.clipFunc(function (context) {
      context.rect(0, 0, ctnWidth, ctnHeight);
    });
    anim.stop();

    for (let i = 0; i < points.length; i++) {
      let tooltip = createTooltip(
        stage,
        i,
        ctnWidth,
        colors,
        points,
        data,
        dataLabel,
        groupHint,
        extraLayer
      );

      // groupHint.add(tooltip);

      stage.on("mousemove", (e) => {
        if (tooltip.getParent() && groupHint.getParent()){
          const mouseX = stage.getPointerPosition().x;
          const left = (i * 0.8 * ctnWidth) / (data.length - 1) + 0.1 * ctnWidth;
          const width = (0.8 * ctnWidth) / (data.length - 1);
          if (mouseX > left && mouseX < left + width) {
            tooltip.to({
              opacity: 0.8,
              duration: 0.2,
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
        if (tooltip.getParent() && groupHint.getParent()){
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
        // const left = (i * 0.8 * ctnWidth) / (data.length - 1) + 0.1 * ctnWidth;
        // const width = (0.8 * ctnWidth) / (data.length - 1);
        // if (mouseX > left && mouseX < left + width) {
        //   tooltips[i].to({
        //     opacity: 0.8,
        //     duration: 0.2,
        //   });
        // } else {
        //   tooltips[i].to({
        //     opacity: 0,
        //     duration: 0.1,
        //   });
        // }
        layer.batchDraw();
      }
    }
  });

  stage.on("mouseleave", (e) => {
    if(!anim.isRunning()){
        supportLine.opacity(0);
        // for(let i = 0; i < data.length; i ++){
        //   tooltips[i].to({
        //       opacity: 0,
        //       duration: 0.1,
        //     });
        // }
        layer.batchDraw();
    }

  });
}

function findIndexByMouseX(mouseX, ctnWidth, data) {
  const totalWidth = 0.8 * ctnWidth;
  const stepWidth = totalWidth / (data.length - 1);
  const startIndex = Math.floor(0.1 * ctnWidth / stepWidth);
  const endIndex = Math.floor(0.9 * ctnWidth / stepWidth);

  for (let i = startIndex; i <= endIndex; i++) {
    const left = i * stepWidth + 0.1 * ctnWidth;
    const right = left + stepWidth;
    if (mouseX >= left && mouseX <= right) {
      return i;
    }
  }

  // 如果未找到对应的索引，则返回 -1
  return -1;
}

function createTooltip(
  stage,
  i,
  ctnWidth,
  colors,
  points,
  data,
  dataLabel,
  groupHint,
  extraLayer
) {
  var tooltip = new Konva.Label({
    x: points[i].x > 0.5 * ctnWidth ? points[i].x - 10 : points[i].x + 10,
    y: points[i].y,
    opacity: 0,
  });

  tooltip.add(
    new Konva.Tag({
      fill: "white",
      pointerDirection: points[i].x > 0.5 * ctnWidth ? "right" : "left",
      pointerWidth: 5,
      pointerHeight: 5,
      cornerRadius: 5,
      lineJoin: "round",
      stroke: colors,
      strokeWidth: 1,
      shadowColor: colors,
      shadowBlur: 10,
      shadowOpacity: 0.1,
    })
  );

  tooltip.add(
    new Konva.Text({
      text: dataLabel[i] + "  \n" + data[i],
      fontSize: 12,
      lineHeight: 1.2,
      padding: 5,
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

function drawAxis(layer, maxData, dataLabel, ctnWidth, ctnHeight, colorMode) {
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
      strokeWidth: 0.5,
      dash: [5, 5],
      lineJoin: "round",
      lineCap: "round",
    });

    const text = new Konva.Text({
      x: 5,
      y: tempY - 4,
      fill: mode,
      fontSize: 10,
      text: value,
      width: 0.08 * ctnWidth,
      align: "right",
      fontSize: 10 * 1.1,
    });

    layer.add(axis, text);
  }

  const axisX = new Konva.Line({
    points: [0.1 * ctnWidth, 0.9 * ctnHeight, 0.95 * ctnWidth, 0.9 * ctnHeight],
    stroke: mode,
    strokeWidth: 0.5,
    lineJoin: "round",
    lineCap: "round",
  });

  layer.add(axisX);

  dataLabel.forEach((value, index) => {
    let x = (index * 0.8 * ctnWidth) / (dataLabel.length - 1) + 0.1 * ctnWidth;
    const text = new Konva.Text({
      x: x,
      y: 0.92 * ctnHeight,
      fontSize: 12,
      fill: mode,
      text: value,
      width: (0.7 * 0.8 * ctnWidth) / (dataLabel.length - 1),
    });
    layer.add(text);
  });
}

function dataToPoints(data, maxData, ctnWidth, ctnHeight) {
  let points = [];
  const width = 0.8 * ctnWidth;
  const height = 0.8 * ctnHeight;

  for (let i = 0; i < data.length; i++) {
    let x = (i * width) / (data.length - 1) + 0.125 * ctnWidth;
    let y = 0.9 * ctnHeight - (data[i] / maxData) * height;
    points.push({ x: x, y: y });
  }
  points.unshift({ x: 0.125 * ctnWidth, y: 0.9 * ctnHeight });
  points.push({ x: 0.925 * ctnWidth, y: 0.9 * ctnHeight });

  return points;
}
</script>

<style>
#container {
  background-color: #ffffff;
}
</style>
