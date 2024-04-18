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
    strokeWidth: stroke,
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
      radius: stroke * 1.5,
      stroke: colors,
      strokeWidth: stroke,
      fill: "white",
    });
    groupDots.add(dot);
  }

  const supportLine = new Konva.Line({
    points: [0, 0.1 * ctnHeight, 0, 0.9 * ctnHeight],
    opacity: 0,
    stroke: colorMode === "day" ? "#86909C" : "#D5D5D6CC",
    strokeWidth: stroke * 0.2,
    dash: [5, 5],
    lineJoin: "round",
    lineCap: "round",
  });

  groupLine.add(poly, line, supportLine, groupDots);
  layer.add(groupLine);

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
              (i * 0.8 * ctnWidth) / (data.length - 1) + 0.1 * ctnWidth;
            const width = (0.8 * ctnWidth) / (data.length - 1);
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
  var tooltip = new Konva.Label({
    x: points[i].x > 0.5 * ctnWidth ? points[i].x - fontSize : points[i].x + fontSize,
    y: points[i].y,
    opacity: 0,
  });

  tooltip.add(
    new Konva.Tag({
      fill: "#ffffff",
      pointerDirection: points[i].x > 0.5 * ctnWidth ? "right" : "left",
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
      text: dataLabel[i] + "  \n" + data[i],
      fontSize: fontSize * 1.2,
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

  dataLabel.forEach((value, index) => {
    let x = (index * 0.8 * ctnWidth) / (dataLabel.length - 1) + 0.1 * ctnWidth;
    const text = new Konva.Text({
      x: x,
      y: 0.92 * ctnHeight,
      fontSize: fontSize * 1.2,
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
