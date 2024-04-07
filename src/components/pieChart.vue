<template>
  <div class="modify-box">
    <!-- <div><p>南丁格尔玫瑰图示例</p></div>
    <button @click="toggleColorMode">切换颜色模式</button> -->

  </div>
  <div id="box">
    <div id="container" ref="container"></div>
  </div>
</template>

<script >
import Konva from 'konva';
import { ref, onMounted, watch} from 'vue';

export default {
  props: {
    data: {
      type: Array,
      default: () => [60, 40, 20, 10, 100, 40, 80, 30]
    },
    dataLabel: {
      type: Array,
      default: () => ['Item1', "Item2", "Item3", "Item4", "Item5", "Item6", "Item7", "Item8"]
    },
    colorMode: {
      type: String,
      dafault: 'day'
    },
    typeMode: {
      type: String,
      dafault: 'rose'
    },
    colors: {
      type: Array,
      default: () => ["#1456EB","#3BE8EB","#FBC645","#6241E7","#279AE0"]
    },
    size: {
      type: Object,
      default: () => [{
        width: 450,
        height: 350
      }]
    }
  },

  setup(props){
    const container = ref(null);
    let colorMode = ref(props.colorMode);
    let stage = null;
    let layer = null;
    let extraLayer = null;

    const height = props.size.height;
    const width = props.size.width;
    const radius = Math.min(height, width) / 2.5;
    const innerRadius = Math.min(height, width) / 10;
    const centerX = width / 2.3;
    const centerY = height / 2;

    const data = props.data; 
    const dataLabel = props.dataLabel;
    const colors = props.colors;
    const dataSum = data.reduce((accumulator, currentValue) => {
                      return accumulator + currentValue;
                    }, 0);

    let cumulativeAngle = -90;

    console.log(colors);

    watch(() => props.data, (newValue, oldValue) => {
      if (!container.value) {
        return;
      }
      if (newValue !== oldValue) {
        drawPieChart(layer, extraLayer, radius, innerRadius, centerX, centerY, colors, newValue, dataLabel,dataSum, cumulativeAngle,colorMode);
      }
     });

     watch(() => props.colorMode, (newValue, oldValue) => {
        colorMode.value = newValue;
        if(colorMode.value === 'day'){
          container.value.style.backgroundColor = '#ffffff';
        }else{
          container.value.style.backgroundColor = '#061936';
        }
        console.log(colorMode.value);
        drawPieChart(layer, extraLayer, radius, innerRadius, centerX, centerY, colors, data, dataLabel,dataSum, cumulativeAngle, colorMode.value);
      });

    onMounted(() => {
      if (!container.value) {
          return;
        }
      
      stage = new Konva.Stage({
        container: container.value,
        width: width,
        height: height
      });

      layer = new Konva.Layer();
      extraLayer = new Konva.Layer();
      stage.add(layer);
      stage.add(extraLayer);
      
      drawPieChart(layer, extraLayer, radius, innerRadius, centerX, centerY, colors, data, dataLabel,dataSum, cumulativeAngle,colorMode)
    
    });

    // 切换颜色模式的方法
    const toggleColorMode = () => {
      //   colorMode.value = colorMode.value === 'day' ? 'night' : 'day';
      //   if(colorMode.value == 'day'){
      //     container.value.style.backgroundColor = '#ffffff';
      //   }else{
      //     container.value.style.backgroundColor = '#061936';
      //   }
      //   redrawChart(colorMode.value);
      // };
    
      // const redrawChart = (currentMode) => {
      //   drawPieChart(layer, extraLayer, radius,innerRadius, centerX, centerY, colors, data, dataLabel,dataSum, cumulativeAngle,currentMode)
      };

    return { container , toggleColorMode}
  }
};

function drawPieChart(layer, extraLayer, radius,innerRadius, centerX, centerY, colors, data, dataLabel,dataSum, cumulativeAngle,colorMode){
  layer.removeChildren();
  extraLayer.removeChildren();

  data.forEach((portion, index) => {
      const gap = 1;
      const angle = Math.round(portion / dataSum * 360) - 1*gap;
      
      const endAngle = cumulativeAngle + angle + gap;
    
      let offset = (endAngle + 90 - 0.5 * angle) * Math.PI / 180;
      let outerRadius = radius * Math.pow(0.9,index);

      // console.log (index , angle, cumulativeAngle, endAngle, offset);

      const wedge = new Konva.Arc({
        x: centerX ,
        y: centerY ,
        innerRadius: innerRadius,
        outerRadius: outerRadius,
        fill: colors[index % colors.length] + "80",
        stroke: colors[index % colors.length],
        strokeWidth: 2,
        angle: 0, 
        rotation: cumulativeAngle,
      });

      layer.add(wedge);

      //hover： additional information
      var group = new Konva.Group();

      let innerX = centerX + outerRadius * Math.sin(offset);
      let innerY = centerY - outerRadius * Math.cos(offset);
      let outerX = centerX + (outerRadius + 25) * Math.sin(offset);
      let outerY = centerY - (outerRadius + 25) * Math.cos(offset);
      
      var tooltip = new Konva.Line({
        // opacity: 0,
        points: [innerX, innerY, outerX, outerY,
        offset >  Math.PI ? outerX - 20: outerX + 20, outerY,],
        stroke: colors[index % colors.length],
        strokeWidth: 1,
        lineCap: 'round',
        lineJoin: 'round'
      });

      var hintData = new Konva.Text({ 
        // opacity: 0,
        text: data[index], 
        x: offset >  Math.PI ? outerX - 20: outerX + 20,
        y: outerY - 15,
        align: offset > Math.PI ? 'right' : 'left',
        padding: 5, 
        fill: colorMode.value === 'day'? '#86909C':'#D5D5D6CC', 
        fontSize: 12,
      });

      var hintMes = new Konva.Text({
        text: dataLabel[index] + "\n" + (data[index]/dataSum * 100).toFixed(2) + "%", 
        x: offset >  Math.PI ? outerX - 20: outerX + 20,
        y: outerY ,
        fontSize: 12,
        align: offset > Math.PI ? 'right' : 'left',
        lineHeight: 1.2,
        padding: 5, 
        fill: colors[index % colors.length],
      })

      if(offset > Math.PI){
        hintData.x( outerX - 20 - hintData.width());
        hintMes.x(outerX - 20 - hintMes.width())
      }

      group.add(tooltip);
      group.add(hintData);
      group.add(hintMes);
      group.opacity(0);
      extraLayer.add(group);

      const anim = new Konva.Animation((frame) => {
        const elapsed = frame.time;
        if (elapsed < 1000) { // 1000ms内执行动画
          const currentAngle = angle * (elapsed / 1000);
          wedge.angle(currentAngle); // 设置角度
          
        } else {
          anim.stop(); // 加载完成后停止动画
        }
      }, layer);

      anim.start();

      cumulativeAngle = endAngle;

      wedge.on('mouseenter',function(){
        if(!anim.isRunning()){
          var tween = new Konva.Tween({
          node: group,
          opacity: 1, // 最终透明度
          duration: 0.3 // 渐入时间
        });
        tween.play(); // 播放动画
          
          wedge.to({
            outerRadius: outerRadius + 10,
            fill: colors[index % colors.length],
            duration: 0.3,
          });
          extraLayer.batchDraw();
        }
      })

      // 鼠标离开事件
      wedge.on('mouseleave', () => {
        if(!anim.isRunning()){
          group.to({
            opacity:0,
            duration:0.1,
          })

          wedge.to({
              outerRadius: outerRadius,
              fill: colors[index % colors.length] + '80',
              duration: 0.3,
          });
          extraLayer.batchDraw();
        }
      
      });
    });

    extraLayer.draw();  
    layer.draw();
}
</script>

<style>
#container{
   background-color: #ffffff;
   border-radius: 5px;
   border: solid 1px #00000005;
   /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.02); */
   padding: 10px;
  }

  #box{
   display: flex;
   align-items: flex-start;
   justify-content: center;
   margin:auto;
   height: 100vh;
 }

</style>
