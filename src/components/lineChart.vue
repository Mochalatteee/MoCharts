<!-- <template>
  <div id="container" ref="container"></div>
</template>

<script>
import { ref, onMounted } from "vue";
import Konva from "konva";

export default {
  setup() {
    const container = ref(null);
    let stage = null;
    let layer = null;
    let shape = null;
    let elapsedTime = 0;
    const animationDuration = 2; // Animation duration in seconds

    onMounted(() => {
      if (!container.value) return;

      stage = new Konva.Stage({
        container: container.value,
        width: 450,
        height: 350,
      });

      layer = new Konva.Layer();
      stage.add(layer);

      // Define shape points to create a custom shape
      const points = [
        { x: 0, y: 350 },
        { x: 100, y: 150 },
        { x: 200, y: 100 },
        { x: 350, y: 200 },
        { x: 400, y: 50 },
        { x: 400, y: 350 },
      ];

      // 补足数组长度为100的连续数组
      const interpolatedPoints = [];
      const step = 100 / (points.length - 1); // 计算步长
      for (let i = 0; i < 100; i++) {
        const index1 = Math.floor(i / step);
        const index2 = Math.min(index1 + 1, points.length - 1);
        const t = (i % step) / step;
        const x = points[index1].x * (1 - t) + points[index2].x * t;
        const y = points[index1].y * (1 - t) + points[index2].y * t;
        interpolatedPoints.push({ x, y });
      }

      // Initialize shape with empty points
      shape = new Konva.Shape({
        sceneFunc: (context, shape) => {
          context.beginPath();
          context.moveTo(interpolatedPoints[0].x, interpolatedPoints[0].y);

          // Only draw points that are within the current animation progress
          // const drawPoints = interpolatedPoints.filter((point, index) => index * (1 / points.length) <= shape.progress);
          const drawPoints = interpolatedPoints.slice(
            0,
            Math.floor(shape.progress * interpolatedPoints.length)
          );

          drawPoints.slice(1).forEach((point) => {
            context.lineTo(point.x, point.y);
          });

          context.closePath();
          context.fillStrokeShape(shape);
        },
        fill: "#3F6EFF" + "80",
        stroke: "#3F6EFF",
        strokeWidth: 2,
        opacity: 1,
        progress: 0, // Add progress attribute
      });

      layer.add(shape);
      layer.draw();

      // Animate the shape
      const animation = new Konva.Animation((frame) => {
        const timeDiff = frame.timeDiff / 1000; // Convert time difference to seconds
        elapsedTime += timeDiff; // Update elapsed time with time difference

        const animationProgress = Math.min(elapsedTime / animationDuration, 1); // Ensure animation progress does not exceed 1
        // Update the progress of the shape based on animation progress
        shape.progress = animationProgress;

        layer.batchDraw();

        // Stop the animation when animation progress reaches 1
        if (animationProgress >= 1) {
          shape.progress = 2;
          animation.stop();
        }
      }, layer);

      // Start the animation
      animation.start();
    });

    return { container };
  },
};
</script>

<style>
#container {
  background-color: #f0f0f0;
}
</style> -->

<template>
    <div id="container" ref="container"></div>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  import Konva from "konva";
  
  export default {
    setup() {
      const container = ref(null);
      let stage = null;
      let layer = null;
      let area = null;
  
      onMounted(() => {
        if (!container.value) return;
  
        stage = new Konva.Stage({
          container: container.value,
          width: 450,
          height: 350,
        });
  
        layer = new Konva.Layer();
        stage.add(layer);
  
        const points = [
        { x: 50, y: 300 },
        { x: 150, y: 150 },
        { x: 250, y: 200 },
        { x: 350, y: 100 },
        { x: 400, y: 250 },
        { x: 450, y: 150 },
        { x: 450, y: 350 },
      ];
  
        const areaPoints = points.map((point) => ( point,  350 ));
  
        area = new Konva.Line({
          points: areaPoints,
          fillLinearGradientStartPoint: { x: 0, y: 0 },
          fillLinearGradientEndPoint: { x: 450, y: 0 },
          fillLinearGradientColorStops: [0, "#00f", 1, "#0ff"],
          closed: true,
        });
  
        layer.add(area);
        layer.draw();
  
        // 使用 Tween 实现从左到右加载动画
        const tween = new Konva.Tween({
          node: area,
          points: points.map((x, y) => ( x,  350 )),
          duration: 2,
          onFinish: () => {
            console.log("Animation finished");
          },
        });
  
        tween.play();
      });
  
      return { container };
    },
  };
  </script>
  
  <style>
  #container {
    background-color: #ffffff;
  }
  </style>
  