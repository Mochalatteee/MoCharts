<template>
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
      default: () => [
        [12000, 3400, 3000, 2000],
        [12000, 3700, 3000, 2000],
        [9000, 3400, 3000, 2000],
        [1200, 3400, 3000, 2000],
        [1200, 3400, 300, 2000],
      ],
    },
    dataLabel: {
      type: Object,
      default: () => ({
        item: ["Item1", "Item2", "Item3", "Item4", "Item5"],
        label: ["level1", "level2", "level3", "level4"],
      }),
    },

    colorMode: {
      type: String,
      dafault: "day",
    },
    colors: {
      type: Array,
      default: () => ["#1456EB", "#30C9C9", "#FBC645", "#DE558A"],
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

    const spaceWidth = (0.8 * ctnWidth) / data.length;
    const barWidth = 0.6 * spaceWidth;
    const barSpacing = 0.4 * spaceWidth;

    const maxHeight = ctnHeight - 0.1 * ctnHeight;
    const maxData = getMaxData(Math.max(...data));

    watch(
      () => props.data,
      (newData, oldData) => {
        if (!container.value) {
          return;
        }
        if (newData !== oldData) {
          redrawChart(
            colorMode.value,
            newData,
            props.dataLabel,
            props.size.height,
            props.size.width
          );
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
          redrawChart(
            colorMode.value,
            props.data,
            newData,
            props.size.height,
            props.size.width
          );
        }
      }
    );

    watch(
      () => props.size,
      (newData, oldData) => {
        console.log("watch", newData);
        if (!container.value) {
          return;
        }
        if (newData !== oldData) {
          redrawChart(
            colorMode.value,
            props.data,
            props.dataLabel,
            newData.height,
            newData.width
          );
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
        redrawChart(
          colorMode.value,
          data,
          dataLabel,
          props.size.height,
          props.size.width
        );
      }
    );

    const redrawChart = (currentMode, data, dataLabel, ctnHeight, ctnWidth) => {
      if (data.length !== dataLabel.item.length) {
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
  extraLayer.removeChildren();

  const fontSize = calculateFontSize(ctnWidth, ctnHeight);
  const stroke = Math.round(ctnHeight * 0.004);

  data.forEach((array, index) => {
    const total = array.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0
    );
    const group = new Konva.Group();
    const x = 0.15 * ctnWidth + index * (barWidth + barSpacing);
    let currentHeight = 0;
      // 创建文本组件
    var tooltip = new Konva.Label({
        x: 0,
        y: 0,
        opacity: 1,
      });

    const length = Math.max(...array).toLocaleString().length + dataLabel.label[0].length + 3;
    let rectHeihgt = 0.9 * ctnHeight;

    tooltip.add(
        new Konva.Rect({
          x:tooltip.x(),
          y:tooltip.y(),
          fill: "#ffffff",
          pointerDirection: x > 0.5 * ctnWidth? "right" : "left",
          pointerWidth: 0.01 * ctnHeight,
          pointerHeight: 0.01 * ctnHeight,
          lineJoin: "round",
          width: fontSize * length,
          height: (array.length + 1) * fontSize * 2.25,
          cornerRadius: 0.01 * ctnWidth,
          shadowColor: "#00000030",
          shadowBlur: 0.05 * ctnHeight,
        })
    );

    const groupText = new Konva.Group();
    const text = new Konva.Text({
          text: dataLabel.item[index],
          fontSize: fontSize * 1.2,
          padding: fontSize,
          fill: "#454545",
          lineHeight: 1.2,
      })
    groupText.add(text);

    array.forEach((value, flag) => {

      // const height = (elapsed / 1000) * 0.8 * ctnHeight * (value / total);
      const height =  0.8 * ctnHeight * (value / total);
      currentHeight += 0.8 * ctnHeight * (value / total);

      const rect = new Konva.Rect({
        x: x,
        y: 0.9 * ctnHeight - currentHeight,
        width: barWidth,
        height: height - stroke,
        cornerRadius: flag === array.length - 1 ? [10,10,0,0]: 0,
        fill: colors[flag % colors.length] + "80",
        stroke: colors[flag % colors.length],
        strokeWidth: stroke,
        draggable: true,
      });

      group.add(rect);

      const text = new Konva.Text({
          // x: x + 0.5 * barWidth,
          y: (flag+1) * fontSize * 1.5,
          text: "● " + dataLabel.label[flag] + "  " + value + "  "+ (value / total * 100).toFixed(0).toLocaleString() + "%"+ "\n",
          fontSize: fontSize * 1.2,
          padding: 10,
          fill: colors[flag],
          lineHeight: 1.2,
      })

      groupText.add(text);  

    });

    group.clipFunc(function(context){
      context.rect(0, rectHeihgt - (elapsed / 1000) * rectHeihgt ,ctnWidth,rectHeihgt);
    });

    tooltip.add(groupText);

    layer.add(group);
    extraLayer.add(tooltip);
    tooltip.hide(); // 初始隐藏文本组件
   
    // 添加鼠标进入事件
    group.on("mouseenter", function () {
      if (!anim.isRunning()) {
        tooltip.position({
          x: x > ctnWidth * 0.5 ? x + 0.5 * barWidth - length * fontSize: x + 0.5 * barWidth,
          y: 0.2 * ctnHeight,
        });
        tooltip.show(); // 显示文本组件

        extraLayer.batchDraw(); // 批量绘制图层
      }
    });

    // 添加鼠标离开事件
    group.on("mouseleave", function () {
      tooltip.hide();
      // extraLayer.removeChildren();
      extraLayer.batchDraw(); // 批量绘制图层
    });

  });

  // 重新绘制图层
  layer.batchDraw();
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

  dataLabel.item.forEach((value, index) => {
    const x = 0.15 * ctnWidth + index * (barWidth + barSpacing);
    const width = barWidth;

    const text = new Konva.Text({
      x: x,
      y: 0.9 * ctnHeight + fontSize * 1.1,
      text: value,
      fontSize: fontSize * 1.1,
      align: "center",
      width: width,
      wrap: "word",
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

    let value = Math.round(100 - (i * 100) / line)
      .toFixed(0)
      .toLocaleString();
    let tempY =
      0.1 * ctnHeight + i * ((0.9 * ctnHeight - 0.1 * ctnHeight) / line);

    const axis = new Konva.Line({
      points: [0.1 * ctnWidth, tempY, 0.95 * ctnWidth, tempY], // x 轴坐标
      stroke: modeColor,
      strokeWidth: 0.5,
      dash: [5, 5],
      lineJoin: "round",
      lineCap: "round",
    });

    const text = new Konva.Text({
      x: 2,
      y: tempY - 4,
      fill: modeColor,
      fontSize: 10,
      text: value + "%",
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
