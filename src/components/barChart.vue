<template>
  <div class="modify-box">
    <!-- <div class="modify-ctn"><button @click="toggleColorMode">{{ colorMode === 'day' ? 'Night' : 'Day' }}</button></div> -->
  </div>
  <div>
   <div id="container" ref="container"></div>
  </div>
 </template>
 
<script>
 import { ref, onMounted, watch } from 'vue';
 import Konva from 'konva';


 export default {
  props: {
    data: {
      type: Array,
      default: () => [13000, 50000, 7000, 12000, 25000, 14000,1000]
    },
    dataLabel: {
      type: Array,
      default: () => ["Item1", "Item2", "Item3", "Item4", "Item5", " Item6"," Item7"]
    },
    colorMode: {
      type: String,
      dafault: 'day'
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

    // console.log(ctnHeight,ctnWidth, props.size.width);
    const barWidth = (ctnWidth / data.length - ctnWidth/50 )/ 2;
    const barSpacing = barWidth - ctnWidth/50;
    const maxHeight = ctnHeight - 100;
    const maxData = getMaxData(Math.max(...data));

    // 监听数据变化，实现响应式
     watch(() => props.data, (newValue, oldValue) => {
      if (!container.value) {
        return;
      }
      if (newValue !== oldValue) {
        redrawChart(colorMode.value, data, dataLabel);
      }
     });

      watch(() => props.colorMode, (newValue, oldValue) => {
        colorMode.value = newValue;
        if (colorMode.value === 'day') {
            container.value.style.backgroundColor = '#ffffff';
        } else {
            container.value.style.backgroundColor = '#061936';
        }
        redrawChart(colorMode.value, data, dataLabel);
      });

      const redrawChart = (currentMode, data, dataLabel) => {
        if(data.length !== dataLabel.length) {
          return console.log("数据数目不匹配")
        }
        drawAxis(xAxisLayer,currentMode,ctnHeight,ctnWidth);
         // 初始化数据
        //   动画
         const anim = new Konva.Animation((frame) => {
           const elapsed = frame.time;
           if (elapsed < 1000) { // 1000ms内执行动画
             drawBars(barLayer, data, elapsed, barWidth, barSpacing, maxHeight, colors, maxData, extraLayer,anim,dataLabel, ctnHeight,ctnWidth);
             drawDynamicLabel(labelLayer, dataLabel, barSpacing, barWidth,currentMode,ctnHeight,ctnWidth);
             drawDynamicAxis(yAxisLayer, maxHeight, data, maxData,currentMode,ctnHeight,ctnWidth);

           } else {
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
           height: ctnHeight
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
 
         redrawChart(colorMode.value, data, dataLabel);
       }
     }); 

     return { container,  colorMode};
   }
 };

 
 
 function drawBars(layer, data, elapsed, barWidth, barSpacing, maxHeight, colors, maxData, extraLayer,anim,dataLabel, ctnHeight) {
   layer.removeChildren();
  //  console.log(ctnHeight);
   data.forEach((value, index) => {
     const x = (index + 1.5) * (barWidth + barSpacing);
     const height = (elapsed / 1000) * maxHeight * (value / maxData);
 
     const rect = new Konva.Rect({
       x: x,
       y: ctnHeight - 0.1 * ctnHeight - height,
       width: barWidth ,
       height: height,
       cornerRadius: [10, 10, 0, 0],
       fill: colors[index % colors.length] + '80',
       stroke: colors[index % colors.length],
       strokeWidth: 2,
       draggable: true
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
         pointerDirection: 'left',
         pointerWidth: 5,
         pointerHeight: 5,
         lineJoin: 'round',
         cornerRadius: 5,
         shadowColor: '#00000010',
          shadowBlur: 10,
       })
     );

     tooltip.add(
       new Konva.Text({
         text: dataLabel[index] + "\n" + value,
         fontSize: 12,
         padding: 10,
         fill: 'white',
         width: 60,
         lineHeight: 1.2,
       })
     );

     extraLayer.add(tooltip);
     tooltip.hide(); // 初始隐藏文本组件

     // 添加鼠标进入事件
     rect.on('mouseenter', function() {
       if(!anim.isRunning()){
         tooltip.position({
             x: rect.x() + rect.width(),
             y: rect.y()* 1.025
         }); // 设置文本位置
         tooltip.show(); // 显示文本组件
         extraLayer.batchDraw(); // 批量绘制图层
       }    
     });

     // 添加鼠标离开事件
     rect.on('mouseleave', function() {
         tooltip.hide(); // 隐藏文本组件
         // extraLayer.removeChildren();
         extraLayer.batchDraw(); // 批量绘制图层
     });
   });

   // 重新绘制图层
   layer.draw(); 
 }

 function getDataMagnitude(num) {
   // 使用对数运算获取数据的量级
   let magnitude = Math.floor(Math.log10(Math.abs(num)));
   return magnitude;
 }

 function getMaxData(maxData){
   let magnitude = getDataMagnitude(maxData);
   let multiple = Math.pow(10, magnitude)
   let nearestMultiple = Math.ceil(maxData / multiple) * multiple; // 找到最大数据的最近整数
   //两者的差不能过大
   if (nearestMultiple - maxData > 0.5 * multiple ) {
       nearestMultiple -= 0.5 * multiple; 
   }
   if (nearestMultiple - maxData === 0.5 * multiple ) {
     return maxData;
   }
   return nearestMultiple;
 }

 function drawDynamicLabel(layer, dataLabel, barSpacing, barWidth, colorMode, ctnHeight, ctnWidth){
   layer.removeChildren();

   dataLabel.forEach((value, index)=>{
     const x = (index + 1.5) * (barWidth + barSpacing);
     const width = barWidth + 0.5 * barSpacing;

     const text  = new Konva.Text({
       x: x,
       y: 0.9 * ctnHeight + 10,
       text: value,
       fontSize: 11,
       align: 'left',
       width: width,
       fill: colorMode === 'day'? '#86909C':'#D5D5D6CC' // 字体颜色
     });
    //  console.log(value,text.x(),text.y());

     layer.add(text)
   })
   
 }

 function drawDynamicAxis(layer, maxHeight, data, maxData,colorMode,ctnHeight,ctnWidth){
   layer.removeChildren();
   let modeColor = colorMode === 'day'? '#86909C':'#D5D5D6CC';

   for(let i = 0; i < 5; i++){
      
     let value = (maxData - i*(maxData/5)).toLocaleString();
     let tempY = 0.9 * ctnHeight - maxHeight + i*(0.15 * ctnHeight);
     console.log(i, tempY, ctnHeight,maxHeight);

     const axis = new Konva.Line({
       points: [0.1*ctnWidth, tempY,
        0.95 * ctnWidth, tempY], // x 轴坐标
       stroke: modeColor,
       strokeWidth: 0.5,
       dash: [5, 5],
       lineJoin: 'round',
       lineCap: 'round',
     });

     const text = new Konva.Text({
       x: 5,
       y: tempY-4,
       fill: modeColor,
       fontSize: 10,
       text: value,
       width: 35,
       align: 'right',
     })

     layer.add(axis,text);
   }
   
 }
 
 function drawAxis(layer,colorMode,ctnHeight,ctnWidth) {

   const xAxis = new Konva.Line({
     points: [0.1*ctnWidth, 0.9 * ctnHeight, 0.95*ctnWidth, 0.9 * ctnHeight], // x 轴坐标
     stroke: colorMode === 'day'? '#86909C':'#D5D5D6CC',
     strokeWidth: 0.5
   });

   // 添加 x 轴上的文字
   const xAxisText = new Konva.Text({
     x: 400, 
     y: 0.9 * ctnHeight + 10, 
     text: '', 
     fontSize: 12, 
     fill: colorMode === 'day'? '#86909C':'#D5D5D6CC', 
   });

 
   // const yAxis = new Konva.Line({
   //   points: [50, 310, 50, 10], // y 轴坐标
   //   stroke: '#D5D5D6CC',
   //   strokeWidth: 1
   // });

 
   // // 添加 y 轴上的文字
   // const yAxisText = new Konva.Text({
   //     x: 45 - 40, // 文字的 x 坐标（略左于 y 轴）
   //     y: 10, // 文字的 y 坐标
   //     text: 'Y Axis', // 文字内容
   //     fontSize: 14, // 字体大小
   //     fill: '#D5D5D6CC' // 字体颜色
   // });

   layer.add(xAxis, xAxisText); 
   layer.draw(); // 绘制坐标轴
 }
</script>

<<style scoped>
 #container{
   background-color: #ffffff;
   /* border-radius: 5px;
   border: solid 1px #00000005; */
   /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.02); */
 }

 .modify-ctn{
  display: flex;
  padding: 10px;
 }

</style>
 