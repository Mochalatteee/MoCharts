<template>
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
      default: () => [60, 40, 25, 10, 100, 40, 80, 30]
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
    const radius = Math.min(height, width) / 3;
    const innerRadius = radius - 0.15 * radius;
    const centerX = width / 2;
    const centerY = height / 2;

    const data = props.data; 
    const dataLabel = props.dataLabel;
    const colors = props.colors;
    const dataSum = data.reduce((accumulator, currentValue) => {
                      return accumulator + currentValue;
                    }, 0);
    const fontSize =  calculateFontSize(width,height);

    let cumulativeAngle = -90;

    watch(() => props.data, (newValue, oldValue) => {
      if (!container.value) {
        return;
      }
      if (newValue !== oldValue) {
        drawPieChart(layer, extraLayer, radius, innerRadius, centerX, centerY, colors, newValue, dataLabel,dataSum, cumulativeAngle,colorMode, fontSize);
      }
     });

     watch(() => props.colorMode, (newValue) => {
        colorMode.value = newValue;
        if(colorMode.value === 'day'){
          container.value.style.backgroundColor = '#ffffff';
        }else{
          container.value.style.backgroundColor = '#061936';
        }
        drawPieChart(layer, extraLayer, radius, innerRadius, centerX, centerY, colors, data, dataLabel,dataSum, cumulativeAngle, colorMode.value, fontSize);
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
      
      drawPieChart(layer, extraLayer, radius, innerRadius, centerX, centerY, colors, data, dataLabel,dataSum, cumulativeAngle,colorMode, fontSize)
    
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

    return { container , toggleColorMode }
  }
};

function drawPieChart(layer, extraLayer, radius,innerRadius, centerX, centerY, colors, data, dataLabel,dataSum, cumulativeAngle,colorMode,fontSize){
  layer.removeChildren();
  extraLayer.removeChildren();

  data.forEach((portion, index) => {
      const gap = 1;
      const angle = Math.round(portion / dataSum * 360) - 2*gap;
      let endAngle = 0;
      
      if (index === data.length - 1) {
        endAngle = 270;
      } else{
        endAngle = cumulativeAngle + angle + 2*gap;
      } 
    
      let outerRadius = radius ;
      const stroke = Math.round(centerY * 2 * 0.004);

      // console.log (index , angle, cumulativeAngle, endAngle+90);

      const wedge = new Konva.Arc({
        x: centerX ,
        y: centerY ,
        innerRadius: innerRadius,
        outerRadius: outerRadius,
        fill: colors[index % colors.length] + "80",
        stroke: colors[index % colors.length],
        strokeWidth: stroke,
        angle: 0, 
        lineJoin: 'round',
        lineCap: 'round',
        rotation: cumulativeAngle,
        closed: true,
      });

      layer.add(wedge);

      //hover： additional information
      var group = new Konva.Group();

      var hintData = new Konva.Text({ 
        // opacity: 0,
        text: data[index], 
        x: centerX - innerRadius,
        y: centerY + fontSize * 3,
        width: innerRadius * 2,
        align: 'center',
        padding: 5, 
        fill: colorMode.value === 'day'? '#86909C':'#D5D5D6CC', 
        fontSize: fontSize* 1.2,
      });

      var hintMes = new Konva.Text({
        text: dataLabel[index] + "\n", 
        x: centerX - innerRadius,
        y: centerY + fontSize * 1,
        width: innerRadius * 2,
        fontSize: fontSize* 1.2,
        align: 'center',
        lineHeight: 1.2,
        padding: 5, 
        fill: colors[index % colors.length],
      })

      var num = (data[index]/dataSum * 100).toFixed(2);

      var hintNum = new Konva.Text({
        text: num + "",
        x: centerX - innerRadius,
        y: centerY - fontSize * 2.5 ,
        width: innerRadius * 2,
        fontSize: fontSize * 3.5,
        align: 'center',
        fontWeight: 'bold',
        fill: colors[index % colors.length],
      })

      var length = num.toString().length;

      var hintPer = new Konva.Text({
        text:"%",
        x: hintNum.x() + hintNum.width() / 2  + length / 2 * 0.55* hintNum.fontSize(),
        y: hintNum.y(),
        fill: colors[index % colors.length],
        fontSize: fontSize * 1.2,
      })

      group.add(hintData);
      group.add(hintMes);
      group.add(hintNum);
      group.add(hintPer);
      group.opacity(0);
      extraLayer.add(group);

      const anim = new Konva.Animation((frame) => {
        const elapsed = frame.time;
        if (elapsed < 1000) { // 1000ms内执行动画
          const currentAngle = angle * (elapsed / 1000);
          wedge.angle(currentAngle); // 设置角度
          
        } else {
          const finalAngle = angle; // 设置最终的角度
          wedge.angle(finalAngle); // 在动画结束时手动设置角度
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

function calculateFontSize(ctnWidth,ctnHeight){
    return Math.ceil(Math.min(ctnWidth, ctnHeight) / 40);
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
