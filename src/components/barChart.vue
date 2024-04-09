<template>
  <div class="modify-box">
    <!-- <div class="modify-ctn"><button @click="toggleColorMode">{{ colorMode === 'day' ? 'Night' : 'Day' }}</button></div> -->
  </div>
  <div>
    <div id="container" ref="container"></div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import Konva from "konva";

export default {
  props: {
    data: {
      type: Array,
      default: () => [13000, 50000, 7000, 12000, 25000, 14000, 1000],
    },
    dataLabel: {
      type: Array,
      default: () => [
        "Item1",
        "Item2",
        "Item3",
        "Item4",
        "Item5",
        " Item6",
        " Item7",
      ],
    },
    colorMode: {
      type: String,
      dafault: "day",
    },
    colors: {
      type: Array,
      default: () => ["#1456EB", "#3BE8EB", "#FBC645", "#6241E7", "#279AE0"],
    },
    size: {
      type: Object,
      default: () => [
        {
          width: 450,
          height: 350,
        },
      ],
    },
  },

  setup(props) {
    const container = ref(null);
    let colorMode = ref(props.colorMode); // 使用 ref 创建响应式对象
    let stage = null;
    let barLayer = null;
    let xAxisLayer = null;
    let yAxisLayer = null;
    let labelLayer = null;
    let extraLayer = null;

    const data = props.data;
    const dataLabel = props.dataLabel;
    const colors = props.colors;
    const ctnHeight = props.size.height;
    const ctnWidth = props.size.width;

    const barWidth = (ctnWidth / data.length - ctnWidth / 50) / 2;
    const barSpacing = barWidth - ctnWidth / 50;
    const maxHeight = ctnHeight - 0.1*ctnHeight;
    const maxData = getMaxData(Math.max(...data));

    watch(
      () => props.data,
      (newData, oldData) => {
        if (!container.value) {
          return;
        }
        if (newData !== oldData) {
          redrawChart(colorMode.value, newData, props.dataLabel, props.size.height, props.size.width);
        }
      }
    );

    watch(
      () => props.dataLabel,
      (newData, oldData) => {
        if (!container.value) {
          return;
        }
        if (newData !== oldData) {
          redrawChart(colorMode.value, props.data, newData, props.size.height, props.size.width);
        }
      }
    );

    watch(
      () => props.size,
      (newData, oldData) => {
        console.log("watch",newData)
        if (!container.value) {
          return;
        }
        if (newData !== oldData) {
          redrawChart(colorMode.value, props.data, props.dataLabel, newData.height, newData.width);
        }
      }
    );

    watch(
      () => props.colorMode,
      (newValue, oldValue) => {
        colorMode.value = newValue;
        if (colorMode.value === "day") {
          container.value.style.backgroundColor = "#ffffff";
        } else {
          container.value.style.backgroundColor = "#061936";
        }
        redrawChart(colorMode.value, data, dataLabel, props.size.height, props.size.width);
      }
    );

    

    const redrawChart = (currentMode, data, dataLabel, ctnHeight, ctnWidth) => {
      if (data.length !== dataLabel.length) {
        return console.log("数据数目不匹配");
      }
      drawAxis(xAxisLayer, currentMode, ctnHeight, ctnWidth);
      // 初始化数据
      //   动画
      const anim = new Konva.Animation((frame) => {
        const elapsed = frame.time;
        if (elapsed < 1000) {
          // 1000ms内执行动画
          drawBars(
            barLayer,
            data,
            elapsed,
            barWidth,
            barSpacing,
            maxHeight,
            colors,
            maxData,
            extraLayer,
            anim,
            dataLabel,
            ctnHeight,
            ctnWidth
          );
          drawDynamicLabel(
            labelLayer,
            dataLabel,
            barSpacing,
            barWidth,
            currentMode,
            ctnHeight,
            ctnWidth
          );
          drawDynamicAxis(
            yAxisLayer,
            maxHeight,
            data,
            maxData,
            currentMode,
            ctnHeight,
            ctnWidth
          );
        } else {
          drawBars(
            barLayer,
            data,
            1000,
            barWidth,
            barSpacing,
            maxHeight,
            colors,
            maxData,
            extraLayer,
            anim,
            dataLabel,
            ctnHeight,
            ctnWidth
          );
          anim.stop(); // 加载完成后停止动画
        }
      }, barLayer);

      anim.start();
    };

    onMounted(() => {
      if (!container.value && !ctnHeight && !ctnWidth) {
        return;
      }
      if (container.value) {
        stage = new Konva.Stage({
          container: container.value,
          width: ctnWidth,
          height: ctnHeight,
        });

        barLayer = new Konva.Layer();
        xAxisLayer = new Konva.Layer();
        yAxisLayer = new Konva.Layer();
        labelLayer = new Konva.Layer();
        extraLayer = new Konva.Layer();

        stage.add(labelLayer);
        stage.add(xAxisLayer);
        stage.add(yAxisLayer);
        stage.add(barLayer);
        stage.add(extraLayer);

        redrawChart(colorMode.value, data, dataLabel, ctnHeight, ctnWidth);
      }
    });

    return { container, colorMode };
  },
};

function drawBars(
  layer,
  data,
  elapsed,
  barWidth,
  barSpacing,
  maxHeight,
  colors,
  maxData,
  extraLayer,
  anim,
  dataLabel,
  ctnHeight,
  ctnWidth
) {
  layer.removeChildren();

  const fontSize = calculateFontSize(ctnWidth, ctnHeight);
  const stroke = Math.round(ctnHeight * 0.004);

  data.forEach((value, index) => {
    const x = (index + 1.5) * (barWidth + barSpacing);
    const height =
      (elapsed / 1000) * (0.9 * ctnHeight - 0.1*ctnHeight) * (value / maxData);

    const rect = new Konva.Rect({
      x: x,
      y: ctnHeight - 0.1 * ctnHeight - height,
      width: barWidth,
      height: height,
      cornerRadius: [10, 10, 0, 0],
      fill: colors[index % colors.length] + "80",
      stroke: colors[index % colors.length],
      strokeWidth: stroke,
      draggable: true,
    });

    layer.add(rect);
    // 创建文本组件
    var tooltip = new Konva.Label({
      x: 0,
      y: 0,
      opacity: 1,
    });

    tooltip.add(
      new Konva.Tag({
        fill: colors[index % colors.length],
        pointerDirection: "left",
        pointerWidth: 5,
        pointerHeight: 5,
        lineJoin: "round",
        cornerRadius: 5,
        shadowColor: "#00000010",
        shadowBlur: 10,
      })
    );

    tooltip.add(
      new Konva.Text({
        text: dataLabel[index] + "\n" + value,
        fontSize: fontSize,
        padding: 10,
        fill: "white",
        width: 60,
        lineHeight: 1.2,
      })
    );

    extraLayer.add(tooltip);
    tooltip.hide(); // 初始隐藏文本组件

    // 添加鼠标进入事件
    rect.on("mouseenter", function () {
      if (!anim.isRunning()) {
        tooltip.position({
          x: rect.x() + rect.width(),
          y: rect.y() * 1.025,
        });
        tooltip.show(); // 显示文本组件

        extraLayer.batchDraw(); // 批量绘制图层
      }
    });

    // 添加鼠标离开事件
    rect.on("mouseleave", function () {
      tooltip.hide();
      // extraLayer.removeChildren();
      extraLayer.batchDraw(); // 批量绘制图层
    });
  });

  // 重新绘制图层
  layer.draw();
}

function calculateFontSize(ctnWidth, ctnHeight) {
  return Math.ceil(Math.min(ctnWidth, ctnHeight) / 40);
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

function drawDynamicLabel(
  layer,
  dataLabel,
  barSpacing,
  barWidth,
  colorMode,
  ctnHeight,
  ctnWidth
) {
  layer.removeChildren();
  const fontSize = calculateFontSize(ctnWidth, ctnHeight);

  dataLabel.forEach((value, index) => {
    const x = (index + 1.5) * (barWidth + barSpacing);
    const width = barWidth + 1 * barSpacing;

    const text = new Konva.Text({
      x: x,
      y: 0.9 * ctnHeight + fontSize * 1.1,
      text: value,
      fontSize: fontSize * 1.1,
      align: "left",
      width: width,
      wrap: 'word',
      fill: colorMode === "day" ? "#86909C" : "#D5D5D6CC", // 字体颜色
    });

    layer.add(text);
  });
}

function drawDynamicAxis(
  layer,
  maxHeight,
  data,
  maxData,
  colorMode,
  ctnHeight,
  ctnWidth
) {
  layer.removeChildren();
  let modeColor = colorMode === "day" ? "#86909C" : "#D5D5D6CC";
  const fontSize = calculateFontSize(ctnWidth, ctnHeight);

  const line = Math.min(Math.max(Math.floor(ctnHeight * 0.01) + 1, 5), 10);

  for (let i = 0; i < line; i++) {
    let tempvalue = Math.floor(maxData - i * (maxData / line));

    let value = (Math.round(tempvalue / 5) * 5).toLocaleString();
    let tempY = 0.1*ctnHeight + i * ((0.9 * ctnHeight - 0.1*ctnHeight) / line);

    const axis = new Konva.Line({
      points: [0.1 * ctnWidth, tempY, 0.95 * ctnWidth, tempY], // x 轴坐标
      stroke: modeColor,
      strokeWidth: 0.5,
      dash: [5, 5],
      lineJoin: "round",
      lineCap: "round",
    });

    const text = new Konva.Text({
      x: 5,
      y: tempY - 4,
      fill: modeColor,
      fontSize: 10,
      text: value,
      width: 0.08 * ctnWidth,
      align: "right",
      fontSize: fontSize * 1.1,
    });

    layer.add(axis, text);
  }
}

function drawAxis(layer, colorMode, ctnHeight, ctnWidth) {
  const fontSize = calculateFontSize(ctnWidth, ctnHeight);

  const xAxis = new Konva.Line({
    points: [0.1 * ctnWidth, 0.9 * ctnHeight, 0.95 * ctnWidth, 0.9 * ctnHeight], // x 轴坐标
    stroke: colorMode === "day" ? "#86909C" : "#D5D5D6CC",
    strokeWidth: 0.5,
  });

  // 添加 x 轴上的文字
  const xAxisText = new Konva.Text({
    x: 400,
    y: 0.9 * ctnHeight + 10,
    text: "",
    fontSize: fontSize * 1.2,
    fill: colorMode === "day" ? "#86909C" : "#D5D5D6CC",
  });

  layer.add(xAxis, xAxisText);
  layer.draw(); // 绘制坐标轴
}
</script>

<
<style scoped>
#container {
  background-color: #ffffff;
}

.modify-ctn {
  display: flex;
  padding: 10px;
}
</style>
