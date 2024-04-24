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
      type: Array,
      default: ["#3F6EFF", "#DE558A"],
    },
    data: {
      type: Array,
      default: () => {
        const dataSet = [];
        for (let j = 0; j < 2; j++) {
          const data = [];
          let currentValue = (j + 2) * 100;
          for (let i = 0; i < 250; i++) {
            // 生成一个随机增量，介于 -1 和 1 之间
            const increment = Math.ceil((Math.random() - 0.5) * 50);
            // 将当前值与随机增量相加，并将结果限制在 0 到 1000 之间
            currentValue += increment;
            let label = "Date" + i.toLocaleString();
            data.push(currentValue);
          }
          dataSet.push(data);
        }
        // console.log(dataSet);
        return dataSet;
      },
    },
    dataLabel: {
      type: Object,
      default: () => ({
        item: ["item1", "item2"],
        label: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
      }),
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
    const dataLabel = props.dataLabel.label;
    const dataItem = props.dataLabel.item;
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
          dataItem,
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
        dataItem,
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
  dataItem,
  colorMode,
  colors
) {
  layer.removeChildren();
  extraLayer.removeChildren();

  const groupLine = new Konva.Group();
  const groupHint = new Konva.Group();
  const fontSize = calculateFontSize(ctnWidth, ctnHeight);
  const stroke = Math.round(Math.min(ctnHeight, ctnWidth) * 0.004);
  const maxData = getMaxData(Math.max(...data.flat()));

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

  const supportLine = new Konva.Line({
    points: [0, 0.1 * ctnHeight, 0, 0.9 * ctnHeight],
    opacity: 0,
    stroke: colorMode === "day" ? "#86909C" : "#D5D5D6CC",
    strokeWidth: stroke * 0.2,
    dash: [5, 5],
    lineJoin: "round",
    lineCap: "round",
  });

  groupLine.add(supportLine);

  data.forEach((data, index) => {
    const points = dataToPoints(data, maxData, ctnWidth, ctnHeight);

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
      points: polyPoints,
      // fill: colors[index % colors.length] + "80",
      stroke: colors[index % colors.length],
      opacity: 1,
      strokeWidth: stroke * 0.7,
      tension: 0.3,
      closed: true,
      lineCap: "round",
      lineJoin: "round",
    });

    const poly = new Konva.Line({
      points: polyPoints,
      opacity: 1,
      strokeWidth: 0,
      closed: true,
      tension: 0.3,
      fillLinearGradientStartPoint: { x: 0.5 * ctnWidth, y: ctnHeight * 1 },
      fillLinearGradientEndPoint: { x: 0.5 * ctnWidth, y: 0 },
      fillLinearGradientColorStops: [
        0,
        "#ffffff00",
        1,
        colors[index % colors.length] + "80",
      ],
    });

    groupLine.add(poly, line);
  });

  layer.add(groupLine);

  const anim = new Konva.Animation((frame) => {
    const elapsed = frame.time;

    if (elapsed < 1000) {
      const currentChart = (elapsed / 1000) * 0.8 * ctnWidth;
      groupLine.clipFunc(function (context) {
        context.rect(
          0.125 * ctnWidth + 5,
          0,
          currentChart - 10,
          0.9 * ctnHeight
        );
      });
    } else {
      groupLine.clipFunc(function (context) {
        context.rect(
          0.125 * ctnWidth + 5,
          0,
          0.8 * ctnWidth - 10,
          0.9 * ctnHeight
        );
      });
      anim.stop();

      for (let i = 0; i < dataLabel.length - 1; i++) {
        const itemLength = dataItem.reduce((max, str) => {
          return Math.max(max, str.length);
        }, 0);

        const length =
          Math.max(...data.flat()).toLocaleString().length + itemLength;
        let tooltip = createTooltip(
          i,
          ctnWidth,
          ctnHeight,
          colors,
          // points,
          data,
          dataLabel,
          dataItem,
          groupHint,
          extraLayer,
          fontSize,
          stroke
        );

        stage.on("mousemove", (e) => {
          if (tooltip.getParent() && groupHint.getParent()) {
            const mouseX = stage.getPointerPosition().x;
            const mouseY = stage.getPointerPosition().y;
            const left =
              (i * 0.8 * ctnWidth) / (dataLabel.length - 1) + 0.1 * ctnWidth;
            const width = (0.8 * ctnWidth) / (dataLabel.length - 1);
            if (mouseX > left && mouseX < left + width) {
              tooltip.to({
                opacity: 0.8,
                duration: 0,
                x:
                  mouseX > 0.7 * ctnWidth
                    ? mouseX - length * fontSize - 10
                    : mouseX + 10,
                y: mouseY,
              });
            } else {
              tooltip.to({
                opacity: 0,
                duration: 0,
              });
            }
          }
        });

        stage.on("mouseleave", () => {
          if (tooltip.getParent() && groupHint.getParent()) {
            tooltip.to({
              opacity: 0,
              duration: 0,
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
    const value = data[i];
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
  ctnHeight,
  colors,
  data,
  dataLabel,
  dataItem,
  groupHint,
  extraLayer,
  fontSize,
  stroke
) {
  const ratioLeft = Math.floor(i / (dataLabel.length - 1) * data[0].length);
  const ratioRight = Math.min(Math.floor((i+1) / (dataLabel.length - 1) * data[0].length), data[0].length - 1);
  const tempData = [];
  for (let i = 0; i < data.length; i++){
    const temp = calculateStats(data[i],ratioLeft,ratioRight);
    tempData.push(temp);
  }

  const itemLength = dataItem.reduce((max, str) => {
    return Math.max(max, str.length);
  }, 0);
  

  const length = Math.max(...data.flat()).toLocaleString().length + 4 + tempData[0].mean.length / 2;
  const groupText = new Konva.Group();
  const x = (i * 0.8 * ctnWidth) / (dataLabel.length - 1) + 0.1 * ctnWidth;

  var tooltip = new Konva.Label({
    x: x,
    y: 0.9 * ctnHeight,
    opacity: 0,
  });

  tooltip.add(
    new Konva.Rect({
      fill: "#ffffff",
      x: 0,
      y: 0,
      cornerRadius: 0.01 * ctnWidth,
      lineJoin: "round",
      width: fontSize * length,
      height: (data.length * 2 + 2) * fontSize * 2,
      stroke: colors[0],
      strokeWidth: 0.5 * stroke,
      shadowColor: colors[0],
      shadowBlur: 0.01 * ctnWidth,
      shadowOpacity: 0.1,
    })
  );

  const item = new Konva.Text({
    text: dataLabel[i] + " - " + dataLabel[i+1] + "\n",
    fontSize: fontSize * 1.2,
    padding: fontSize,
    fill: "#454545",
    lineHeight: 1.2,
  });
  groupText.add(item);

  tempData.forEach((value, index) => {
    const text = new Konva.Text({
      y: (index * 2 + 1.5) * fontSize * 2,
      text: "● " + dataItem[index] + "\n" + "Mean: " + value.mean + "\n",
      fontSize: fontSize * 1.2,
      lineHeight: 1.3,
      padding: fontSize,
      fill: colors[index % colors.length],
    });
    groupText.add(text);
  });

  tooltip.add(groupText);
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
