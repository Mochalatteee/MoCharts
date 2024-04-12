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
      default: '#3F6EFF'
    }
  },
  setup(props) {
    const container = ref(null);
    let stage = null;
    let layer = null;

    const colors = props.colors;
    const ctnHeight = props.size.height;
    const ctnWidth = props.size.width;

    console.log(ctnHeight,ctnWidth);


    onMounted(() => {
      if (!container.value) return;

      stage = new Konva.Stage({
        container: container.value,
        width: ctnWidth,
        height: ctnHeight,
      });

      layer = new Konva.Layer();
      stage.add(layer);

      // Define shape points to create a custom shape
      const points = [
        { x: 50, y: 350 },
        { x: 50, y: 100 },
        { x: 100, y: 150 },
        { x: 200, y: 50 },
        { x: 350, y: 200 },
        { x: 400, y: 50 },
        { x: 400, y: 350 },
      ];

      const groupLine = new Konva.Group();

      // 补足数组长度为100的连续数组
      const drawPoints = [];
      for (let i = 0; i < points.length; i++) {
        const x = points[i].x ;
        const y = points[i].y ;
        drawPoints.push( x, y );
      }

      const line = new Konva.Line({
        points: drawPoints,
        fill: '#3F6EFF' + "80",
        stroke: '#3F6EFF',
        opacity: 1,
        strokeWidth: 2,
        lineCap: 'round',
        lineJoin: 'round',
      })

      const poly = new Konva.Line({
        points: drawPoints,
        opacity: 1,
        strokeWidth: 0,
        closed: true,
        fillLinearGradientStartPoint: { x: 225, y: 400 },
        fillLinearGradientEndPoint: { x: 225, y: 0 },
        fillLinearGradientColorStops: [0, '#ffffff', 1, '#3F6EFF' + "80"],
      })

      groupLine.add(line,poly);
      layer.add(groupLine);

      const anim = new Konva.Animation((frame) => {
        const elapsed = frame.time;
        if(elapsed < 1000) {
          const currentChart = (elapsed / 1000) * 400;
          groupLine.clipFunc(function(context){
            context.rect(0, 0, currentChart, 350);
          })
          
        } else {
          groupLine.clipFunc(function(context){
            context.rect(0, 0, 400, 350);
          })
          anim.stop();
        }
      })

      anim.start();
      
      layer.draw();

    });

    return { container };
  },
};

function drawLine(){

}
</script>

<style>
#container {
  background-color: #ffffff;
}
</style>
