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
    colorMode: {
      type: String,
      default: "day",
    },
    data: {
      type: Array,
      default: () => [0.8, 0.1, 0.3, 0.9, 0.2, 0.4, 0.6],
    },
    dataLabel: {
      type: Array,
      default: () => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },

  },

  setup(props) {
    const container = ref(null);
    let stage = null;
    let layer = null;
    let extraLayer = null;

    const ctnHeight = props.size.height;
    const ctnWidth = props.size.width;
    const colors = props.colors;
    const colorMode = props.colorMode;

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
          props.data,
          props.dataLabel,
          ctnWidth,
          ctnHeight,
          colors,
          newValue
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
      stage.add(layer, extraLayer);

      drawChart(
        stage,
        layer,
        extraLayer,
        props.data,
        props.dataLabel,
        ctnWidth,
        ctnHeight,
        colors,
        colorMode
      );
    });

    return { container };
  },
};

function drawChart(
  stage,
  layer,
  extraLayer,
  dataNum,
  dataLabel,
  ctnWidth,
  ctnHeight,
  colors,
  colorMode
) {
  layer.removeChildren();
  let data = [];
  if (dataNum.length === dataLabel.length) {
    for (let i = 0; i < dataNum.length; i++) {
      data.push({ value: dataNum[i], label: dataLabel[i] });
    }
  }

  const radius = Math.min(ctnWidth * 0.4, ctnHeight * 0.4); // 雷达图的半径
  const center = { x: ctnWidth / 2, y: ctnHeight / 2 }; // 雷达图的中心点坐标

  // 绘制雷达图的背景网格线
  const numSides = data.length;
  const angle = (2 * Math.PI) / numSides;
  const loop = Math.min(Math.max(Math.floor(ctnHeight * 0.01) + 1, 5), 10);
  const fontSize = calculateFontSize(ctnWidth, ctnHeight);
  const stroke = Math.round(Math.min(ctnHeight, ctnWidth) * 0.004);
  const groupRadar = new Konva.Group();
  const groupHint = new Konva.Group();

  for (let j = 0; j < loop; j++) {
    for (let i = 0; i < numSides; i++) {
      const line = new Konva.Line({
        points: [
          center.x +
            radius * (1 - j / loop) * Math.cos(i * angle - Math.PI / 2),
          center.y +
            radius * (1 - j / loop) * Math.sin(i * angle - Math.PI / 2),
          center.x +
            radius * (1 - j / loop) * Math.cos((i + 1) * angle - Math.PI / 2),
          center.y +
            radius * (1 - j / loop) * Math.sin((i + 1) * angle - Math.PI / 2),
        ],
        stroke: colorMode === "day" ? "#86909C" + "60" : "#D5D5D680",
        strokeWidth: stroke * 0.5,
        // dash: [5,5]
      });
      layer.add(line);
    }

    const num = data.length - 1;
    const x1 =
      center.x + radius * (1 - j / loop) * Math.cos(num * angle - Math.PI / 2);
    const y1 =
      center.y + radius * (1 - j / loop) * Math.sin(num * angle - Math.PI / 2);
    const x2 =
      center.x +
      radius * (1 - j / loop) * Math.cos((num + 1) * angle - Math.PI / 2);
    const y2 =
      center.y +
      radius * (1 - j / loop) * Math.sin((num + 1) * angle - Math.PI / 2);
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;

    let value = Math.round(100 - (j * 100) / loop)
      .toFixed(0)
      .toLocaleString();

    const text = new Konva.Text({
      x: centerX - fontSize,
      y: centerY,
      text: value,
      fontSize: fontSize * 0.9,
      fill: colorMode === "day" ? "#86909C" + "80" : "#D5D5D680",
    });

    // 计算线段的角度并设置文本的旋转角度
    const dx = x2 - x1;
    const dy = y2 - y1;
    const rotate = Math.atan2(dy, dx) * (180 / Math.PI);
    text.rotation(rotate);

    layer.add(text);
  }

  for (let i = 0; i < numSides; i++) {
    let x = center.x + radius * Math.cos((i ) * angle - Math.PI / 2);
    let y = center.y + radius * Math.sin((i ) * angle - Math.PI / 2);
    const line = new Konva.Line({
      points: [center.x, center.y, x, y],
      stroke: colorMode === "day" ? "#86909C" + "60" : "#D5D5D6CC",
      strokeWidth: 0.5 * stroke,
      // dash: [5,5]
    });

    const text = new Konva.Text({
      x:
        x > 0.5 * ctnWidth
          ? x + 0.5 * fontSize
          : x - data[i].label.length * 0.7 * fontSize,
      y: y > 0.5 * ctnHeight ? y : y - fontSize,
      text: data[i].label,
      align: x > 0.5 * ctnWidth ? "left" : "right",
      fontSize: fontSize,
      fill: colorMode === "day" ? "#86909C" : "#D5D5D6CC",
    });

    layer.add(line, text);
  }

  // 绘制雷达图的数据线
  const dataLine = new Konva.Line({
    points: data
      .map((point, index) => {
        const value = point.value * radius;
        const x = center.x + value * Math.cos(index * angle - Math.PI / 2);
        const y = center.y + value * Math.sin(index * angle - Math.PI / 2);
        return [x, y];
      })
      .flat(),
    stroke: colors,
    strokeWidth: stroke,
    closed: true,
    fill: colorMode === "day" ? colors + "30" : colors + "60",
  });

  groupRadar.add(dataLine);

  // 绘制雷达图的数据点
  data.forEach((point, index) => {
    const value = point.value * radius;
    const x = center.x + value * Math.cos(index * angle - Math.PI / 2);
    const y = center.y + value * Math.sin(index * angle - Math.PI / 2);
    const circle = new Konva.Circle({
      x: x,
      y: y,
      radius: 1.5 * stroke,
      fill: "white",
      stroke: colors,
      strokeWidth: stroke,
      name: point.label, // 设置名称
    });
    groupRadar.add(circle);

    const tooltip = new Konva.Label({
      x: x > 0.5 * ctnWidth ? x + fontSize : x - fontSize,
      y: y,
      opacity: 0,
    });

    tooltip.add(
      new Konva.Tag({
        fill: "#ffffff",
        pointerDirection: x > 0.5 * ctnWidth ? "left" : "right",
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
        text: point.label + "  \n" + (point.value * 100).toFixed(1) + "%",
        fontSize: fontSize * 1.2,
        lineHeight: 1.2,
        padding: fontSize * 0.5,
        fill: colors,
      })
    );

    // 监听舞台的鼠标移动事件
    stage.on('mousemove', () => {
    const mouseX = stage.getPointerPosition().x;
    const mouseY = stage.getPointerPosition().y;

    // 计算鼠标位置相对于雷达图中心的偏移量
    const offsetX = mouseX - center.x;
    const offsetY = -(mouseY - center.y);

    // 计算鼠标位置相对于雷达图中心的极坐标
    const r = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
    let a = Math.atan2(offsetX, offsetY);
    if (a < - 0.5 * angle) {
        a += 2 * Math.PI; // 转换为 0 到 2π 的角度
    }

    let startAngle =  ( index ) * angle - 0.5 * angle;
    let endAngle = startAngle + angle;
    // console.log(point.label,index);
    // console.log((a * (180 / Math.PI)).toFixed(1), (startAngle * 180 / Math.PI).toFixed(1), (endAngle * 180 / Math.PI).toFixed(1));

    // 判断鼠标位置是否在扇形范围内
    const isInSector = a >= startAngle && a <= endAngle && r <= radius;
    if(isInSector){
        tooltip.to({
            opacity: 0.8,
            duration: 0.1,
        })
    } else {
        tooltip.to({
            opacity: 0,
            duration: 0.1,
        })
    }

    });

    stage.on('mouseleave', ()=>{
        tooltip.to({
            opacity: 0,
            duration: 0.1,
        })
    })

    groupHint.add(tooltip);

  });

  layer.add(groupRadar);
  extraLayer.add(groupHint);

  const anim = new Konva.Animation((frame) => {
    const elapsed = frame.time;
    const duration = 700;

    if (elapsed < duration) {
      // 计算当前时间对应的半径
      const currentRadius = (elapsed / duration) * radius;

      // 更新数据线的位置
      dataLine.points(
        data
          .map((point, index) => {
            const value = point.value * currentRadius;
            const x = center.x + value * Math.cos(index * angle - Math.PI / 2);
            const y = center.y + value * Math.sin(index * angle - Math.PI / 2);
            return [x, y];
          })
          .flat()
      );

      // 更新数据点的位置
      data.forEach((point, index) => {
        const value = point.value * currentRadius;
        const x = center.x + value * Math.cos(index * angle - Math.PI / 2);
        const y = center.y + value * Math.sin(index * angle - Math.PI / 2);
        const circle = groupRadar.findOne(`.${point.label}`);
        if (circle) {
          circle.position({ x: x, y: y }); // 更新位置
        }
      });

      layer.batchDraw(); // 手动进行图层的重新绘制
    } else {
      const outerRadius = ctnWidth; // 完整的裁剪区域的外圆半径

      groupRadar.clipFunc(function (context) {
        // 恢复到完整的裁剪区域
        context.beginPath();
        context.arc(center.x, center.y, outerRadius, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();
      });
      anim.stop();
    }
  });

  anim.start();

  layer.draw();
}

function calculateFontSize(ctnWidth, ctnHeight) {
  return Math.ceil(Math.min(ctnWidth, ctnHeight) / 40);
}
</script>
