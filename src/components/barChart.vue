<template>
  <div class="modify-box">
    <!-- <div class="modify-ctn"><button @click="toggleColorMode">{{ colorMode === 'day' ? 'Night' : 'Day' }}</button></div> -->
    <div></div>
  </div>
  <div id="box">
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
      default: () => [13000, 50000, 7000, 12000, 25000]
    },
    dataLabel: {
      type: Array,
      default: () => ["Item1", "Item2", "Item3", "Item4", "Item5"]
    },
    colorMode: {
      type: String,
      dafault: 'day'
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
    const colors = ["#1456EB","#30C9C9","#FBC645","#6241E7","#279AE0"];
    const barWidth = 35;
    const barSpacing = 25;
    const maxHeight = 250;
    const maxData = getMaxData(Math.max(...data));

    // 监听数据变化，实现响应式
     watch(() => props.data, (newValue, oldValue) => {
      if (!container.value) {
        return;
      }
      if (newValue !== oldValue) {
        drawBars(barLayer, newValue, 0); // 重置动画
      }
     });

     // 切换颜色模式的方法
     const toggleColorMode = () => {
        // console.log(colorMode.value);

        // emit('update:colorMode', props.colorMode === 'day' ? 'night' : 'day');
        // colorMode.value = colorMode.value === 'day' ? 'night' : 'day';
        // if(colorMode.value == 'day'){
        //   container.value.style.backgroundColor = '#ffffff';
        // }else{
        //   container.value.style.backgroundColor = '#061936';
        // }
        // redrawChart(colorMode.value);
      };

      watch(() => props.colorMode, (newValue, oldValue) => {
        colorMode.value = newValue === 'day' ? 'night' : 'day';
        if (colorMode.value === 'day') {
            container.value.style.backgroundColor = '#ffffff';
        } else {
            container.value.style.backgroundColor = '#061936';
        }
        redrawChart(colorMode.value);
      });

      const redrawChart = (currentMode) => {
        drawAxis(xAxisLayer,currentMode);
         // 初始化数据
        //   动画
         const anim = new Konva.Animation((frame) => {
           const elapsed = frame.time;
           if (elapsed < 1000) { // 1000ms内执行动画
             drawBars(barLayer, data, elapsed, barWidth, barSpacing, maxHeight, colors, maxData, extraLayer,anim,dataLabel);
             drawDynamicLabel(labelLayer, dataLabel, barSpacing, barWidth,currentMode);
             drawDynamicAxis(yAxisLayer, maxHeight, data, maxData,currentMode);

           } else {
             anim.stop(); // 加载完成后停止动画
           }
         }, barLayer);
 
         anim.start();
      };

     onMounted(() => {
       if (!container.value) {
         return;
       }
       if (container.value) {
         stage = new Konva.Stage({
           container: container.value,
           width: 450,
           height: 350
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
 
         redrawChart(colorMode.value);
       }
     }); 

     return { container,  colorMode};
   }
 };

 
 
 function drawBars(layer, data, elapsed, barWidth, barSpacing, maxHeight, colors, maxData, extraLayer,anim,dataLabel) {
   layer.removeChildren();
 
   data.forEach((value, index) => {
     const x = (index + 1.5) * (barWidth + barSpacing);
     const height = (elapsed / 1000) * maxHeight * (value / maxData);
 
     const rect = new Konva.Rect({
       x: x,
       y: 310 - height,
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
             y: rect.y()* 1.1
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

 function drawDynamicLabel(layer, dataLabel, barSpacing, barWidth, colorMode){
   layer.removeChildren();

   dataLabel.forEach((value, index)=>{
     const x = (index + 1.5) * (barWidth + barSpacing);
     const width = barWidth;

     const text  = new Konva.Text({
       x: x,
       y: 310 + 10,
       text: value,
       fontSize: 11,
       align: 'center',
       width: width,
       fill: colorMode === 'day'? '#86909C':'#D5D5D6CC' // 字体颜色
     });

     layer.add(text)
   })
   
 }

 function drawDynamicAxis(layer, maxHeight, data, maxData,colorMode){
   layer.removeChildren();
   let modeColor = colorMode === 'day'? '#86909C':'#D5D5D6CC';

   for(let i = 0; i < data.length; i++){
     let value = (maxData - i*(maxData/data.length)).toLocaleString();

     const axis = new Konva.Line({
       points: [50, 310 - maxHeight + i*(300 - maxHeight), 400, 310 - maxHeight + i*(300 - maxHeight)], // x 轴坐标
       stroke: modeColor,
       strokeWidth: 0.5,
       dash: [5, 5],
       lineJoin: 'round',
       lineCap: 'round',
     });

     const text = new Konva.Text({
       x: 5,
       y: 310-4 - maxHeight + i*(300 - maxHeight),
       fill: modeColor,
       fontSize: 10,
       text: value,
       width: 38,
       align: 'right',
     })

     layer.add(axis,text);
   }
   
 }
 
 function drawAxis(layer,colorMode) {

   const xAxis = new Konva.Line({
     points: [50, 310, 400, 310], // x 轴坐标
     stroke: colorMode === 'day'? '#86909C':'#D5D5D6CC',
     strokeWidth: 0.5
   });

   // 添加 x 轴上的文字
   const xAxisText = new Konva.Text({
     x: 400, 
     y: 310 + 10, 
     text: 'X Axis', 
     fontSize: 14, 
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
   background-color: #061936;
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

 .modify-ctn{
  display: flex;
  padding: 10px;
 }

</style>
 