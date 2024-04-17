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
  },
  setup(props) {
    const container = ref(null);
    let stage = null;
    let layer = null;

    const ctnHeight = props.size.height;
    const ctnWidth = props.size.width;
    const colors = props.colors;

    onMounted(() => {
      if (!container.value) return;

      stage = new Konva.Stage({
        container: container.value,
        width: ctnWidth,
        height: ctnHeight,
      });

      layer = new Konva.Layer();
      stage.add(layer);

      // 假设这是你的自定义数据，包含各个属性的值
      const data = [
        { label: "A", value: 0.8 },
        { label: "B", value: 0.6 },
        { label: "C", value: 0.9 },
        { label: "D", value: 0.7 },
        { label: "E", value: 0.5 },
        { label: "F", value: 0.2 },
      ];

      const radius = Math.min(ctnWidth * 0.4, ctnHeight * 0.4); // 雷达图的半径
      const center = { x: ctnWidth / 2, y: ctnHeight / 2 }; // 雷达图的中心点坐标

      // 绘制雷达图的背景网格线
      const numSides = data.length;
      const angle = (2 * Math.PI) / numSides;
      const loop = 5;
      const groupRadar = new Konva.Group();

      for (let j = 0; j < loop; j++) {
        for (let i = 0; i < numSides; i++) {
          const line = new Konva.Line({
            points: [
              center.x +
                radius * (1 - j / loop) * Math.cos(i * angle - Math.PI / 2),
              center.y +
                radius * (1 - j / loop) * Math.sin(i * angle - Math.PI / 2),
              center.x +
                radius *
                  (1 - j / loop) *
                  Math.cos((i + 1) * angle - Math.PI / 2),
              center.y +
                radius *
                  (1 - j / loop) *
                  Math.sin((i + 1) * angle - Math.PI / 2),
            ],
            stroke: "#86909C" + "60",
            strokeWidth: 0.5,
            // dash: [5,5]
          });
          layer.add(line);
        }
        const num = data.length - 1;
        const x1 =
          center.x +
          radius * (1 - j / loop) * Math.cos(num * angle - Math.PI / 2);
        const y1 =
          center.y +
          radius * (1 - j / loop) * Math.sin(num * angle - Math.PI / 2);
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
          x: centerX - 10,
          y: centerY - 6,
          text: value + "%",
          fontSize: 10,
          fill: "#86909C" + "60",
        });

        // 计算线段的角度并设置文本的旋转角度
        const dx = x2 - x1;
        const dy = y2 - y1;
        const rotate = Math.atan2(dy, dx) * (180 / Math.PI);
        text.rotation(rotate);

        layer.add(text);
      }

      for (let i = 0; i < numSides; i++) {
        const line = new Konva.Line({
          points: [
            center.x,
            center.y,
            center.x + radius * Math.cos((i + 1) * angle - Math.PI / 2),
            center.y + radius * Math.sin((i + 1) * angle - Math.PI / 2),
          ],
          stroke: "#86909C" + "60",
          strokeWidth: 0.5,
          // dash: [5,5]
        });

        layer.add(line);
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
        strokeWidth: 2,
        closed: true,
        fill: colors + "30",
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
          radius: 3,
          fill: "white",
          stroke: colors,
          strokeWidth: 2,
          name: point.label, // 设置名称
        });
        groupRadar.add(circle);
      });

      layer.add(groupRadar);
      
      //   const anim = new Konva.Animation((frame) => {
      //     const elapsed = frame.time;

      //     if (elapsed < 1000) {
      //       const currentChart = (elapsed / 1000) * radius;
      //       const innerRadius = 0; // 内圆半径
      //       const outerRadius = currentChart; // 外圆半径

      //       groupRadar.clipFunc(function (context) {
      //         // 使用两个圆形裁剪区域
      //         context.beginPath();
      //         context.arc(center.x, center.y, outerRadius, 0, Math.PI * 2, true);
      //         context.arc(center.x, center.y, innerRadius, 0, Math.PI * 2, true);
      //         context.closePath();
      //         context.clip();
      //       });
      //     } else {
      //       const outerRadius = ctnWidth; // 完整的裁剪区域的外圆半径

      //       groupRadar.clipFunc(function (context) {
      //         // 恢复到完整的裁剪区域
      //         context.beginPath();
      //         context.arc(center.x, center.y, outerRadius, 0, Math.PI * 2, true);
      //         context.closePath();
      //         context.clip();
      //       });
      //       anim.stop();
      //     }
      //   });

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
                const x =
                  center.x + value * Math.cos(index * angle - Math.PI / 2);
                const y =
                  center.y + value * Math.sin(index * angle - Math.PI / 2);
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
    });

    return { container };
  },
};
</script>
