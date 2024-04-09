<template>
     <div class="charts">

        <div class="component-box">
            <div class="component-ctn">
                <div class="chart-ctn">
                    <div class="title-box"><p >Bar Chart</p></div>

                    <div class="modify-ctn">
                        <button @click="toggleBarColorMode">{{ barColorMode === 'day' ? 'Night' : 'Day' }}</button>
                        <button @click="goToBarChart">Details</button>
                    </div>
                    <div ref="chartBox" class="chart-box">
                        <barChart 
                            v-if="isSizeAvailable"
                            :data="[215,105,40,50,65,40,10]" 
                            :color-mode="barColorMode"
                            :colors=this.$colors
                            :size="divSize"
                            ></barChart>
                    </div>
                    
                </div>
            </div>

            <div class="component-ctn">
                <div class="chart-ctn">
                    <div class="title-box"><p>Rose Chart</p></div>
                    <div class="modify-ctn">
                        <button @click="toggleRoseColorMode">{{ roseColorMode === 'day' ? 'Night' : 'Day' }}</button>
                        <button @click="goToPieChart">Details</button>
                    </div>
                    <div class="chart-box">
                        <roseChart 
                            v-if="isSizeAvailable"
                            :data="[50,100,40,50,65, 5, 120]" 
                            :color-mode="roseColorMode"
                            :colors=this.$colors
                            :size="divSize"
                            ></roseChart>
                    </div>
                </div>
            </div>

        </div>

        <div class="component-box">
            <div class="component-ctn">
                <div class="chart-ctn">
                    <div class="title-box"><p >Ring Chart</p></div>
                    <div class="modify-ctn">
                        <button @click="toggleRingColorMode">{{ ringColorMode === 'day' ? 'Night' : 'Day' }}</button>
                        <button @click="goToRingChart">Details</button>
                    </div>
                    <div  class="chart-box">
                        <ringChart 
                            v-if="isSizeAvailable"
                            :data="[210,100,40,50,65,40,10]" 
                            :color-mode="ringColorMode"
                            :colors=this.$colors
                            :size="divSize"
                            ></ringChart>
                    </div>
                    
                </div>
            </div>

            <div class="component-ctn">
                <div class="chart-ctn">
                    <div class="title-box"><p>Pie Chart</p></div>
                    <div class="modify-ctn">
                        <button @click="togglePieColorMode">{{ pieColorMode === 'day' ? 'Night' : 'Day' }}</button>
                        <button @click="goToPieChart">Details</button>
                    </div>
                    <div class="chart-box">
                        <pieChart 
                            v-if="isSizeAvailable"
                            :data="[50,100,40,50,65, 5, 120]" 
                            :color-mode="pieColorMode"
                            :colors=this.$colors
                            :size="divSize"
                            ></pieChart>
                    </div>
                </div>
            </div>
            
        </div>

        <div class="component-box">
            <div class="component-ctn">
                <div class="chart-ctn">
                    <div class="title-box"><p >Line Chart</p></div>
                    <div class="modify-ctn">
                        <button @click="toggleRingColorMode">{{ ringColorMode === 'day' ? 'Night' : 'Day' }}</button>
                        <button @click="goToRingChart">Details</button>
                    </div>
                    <div  class="chart-box">
                        <!-- <lineChart 
                          

                            ></lineChart> -->
                    </div>
                    
                </div>
            </div>

            <div class="component-ctn">
                <div class="chart-ctn">
                    <div class="title-box"><p>tbc Chart</p></div>
                    <div class="modify-ctn">
                        <button @click="togglePieColorMode">{{ pieColorMode === 'day' ? 'Night' : 'Day' }}</button>
                        <button @click="goToPieChart">Details</button>
                    </div>
                    <div class="chart-box">
                        <!-- <pieChart 
                            v-if="isSizeAvailable"
                            :data="[50,100,40,50,65, 5, 120]" 
                            :color-mode="pieColorMode"
                            :colors=this.$colors
                            :size="divSize"
                            ></pieChart> -->
                    </div>
                </div>
            </div>
            
        </div>

    </div>
</template>

<script>
import barChart from '../components/barChart.vue';
import pieChart from '../components/pieChart.vue';
import roseChart from '../components/roseChart.vue';
import ringChart from '../components/ringChart.vue';
import lineChart from '../components/lineChart.vue';
import { ref, onMounted } from 'vue';

export default {
  components: {
      barChart,
      pieChart,
      roseChart,
      ringChart,
      lineChart
  },
  data() {
      return {
          barColorMode: 'day',
          pieColorMode: 'day',
          roseColorMode: 'day',
          ringColorMode: 'day'
      };
  },
  methods: {
      toggleBarColorMode() {
          this.barColorMode = this.barColorMode === 'day' ? 'night' : 'day';
      },
      togglePieColorMode() {
          this.pieColorMode = this.pieColorMode === 'day' ? 'night' : 'day';
      },
      toggleRoseColorMode() {
          this.roseColorMode = this.roseColorMode === 'day' ? 'night' : 'day';
      },
      toggleRingColorMode() {
          this.ringColorMode = this.ringColorMode === 'day' ? 'night' : 'day';
      },
      goToBarChart() {
          this.$router.push('/bar-chart');
      },
      goToPieChart() {
          this.$router.push('/pie-chart');
      },
      goToRingChart() {
          this.$router.push('/ring-chart');
      }
  },
  setup() {
    const chartBox = ref(null);
    const divSize = ref({ width: 0, height: 0 });
    const isSizeAvailable = ref(false); // 用于控制是否渲染子组件

    onMounted(() => {
      // 获取 div 元素的长宽
      if(chartBox.value){
        const width = chartBox.value.offsetWidth - 20;
        const height = chartBox.value.offsetHeight - 20;
        divSize.value = { width, height };
        isSizeAvailable.value = true;
      }
    })

    return { chartBox, divSize, isSizeAvailable };
  }
};

</script>

<style scoped>
  .component-box {
      display: flex;
      justify-content: space-around;
      margin: 16px 0;
  }

  .component-ctn {
      display: flex;
      width: 48%;
      justify-content: center;
      border-radius: 20px;
      border: solid 1px #00000010;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.02);
      padding: 10px;
      height: 70vh;
  }

  .chart-ctn {
      display: flex;
      flex-direction: column;
      width: max-content;
      width: 100%;
      height: 100%;
  }

  .modify-ctn {
      display: flex;
      padding: 10px;
      justify-content: space-between;
      
  }

  .title-box{
    margin: 8px 0;
    font-size: 1.5vw;
  }

  .chart-box{
    width: 100%;
    height: 100%;
    display: flex;
    align-content: center;
    justify-content: center;
    border-radius: 20px;
    border: solid 1px #00000005;
  }

 
</style>
