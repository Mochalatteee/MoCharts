<template>
  <div>
      <h1>Mocharts</h1>

      <div class="component-box">
          <div class="component-ctn">
              <div class="chart-ctn">
                  <div><p>Bar Chart</p></div>

                  <div class="modify-ctn">
                      <button @click="toggleBarColorMode">{{ barColorMode === 'day' ? 'Night' : 'Day' }}</button>
                      <button @click="goToBarChart">Details</button>
                  </div>

                  <barChart :data="[210,100,40,50,65,230,10]" :color-mode="barColorMode"></barChart>
              </div>
          </div>

          <div class="component-ctn">
              <div class="chart-ctn">
                  <div><p>Rose Chart</p></div>
                  <div class="modify-ctn">
                      <button @click="togglePieColorMode">{{ pieColorMode === 'day' ? 'Night' : 'Day' }}</button>
                      <button @click="goToPieChart">Details</button>
                  </div>

                  <pieChart :data="[50,100,40,50,65, 5, 120]" :color-mode="pieColorMode"></pieChart>
              </div>
          </div>
      </div>
  </div>
</template>

<script>
import BarChart from './barChart.vue';
import PieChart from './pieChart.vue';

export default {
  components: {
      BarChart,
      PieChart
  },
  data() {
      return {
          barColorMode: 'day',
          pieColorMode: 'day'
      };
  },
  methods: {
      toggleBarColorMode() {
          this.barColorMode = this.barColorMode === 'day' ? 'night' : 'day';
      },
      togglePieColorMode() {
          this.pieColorMode = this.pieColorMode === 'day' ? 'night' : 'day';
      },
      goToBarChart() {
          this.$router.push('/bar-chart');
      },
      goToPieChart() {
          this.$router.push('/pie-chart');
      }
  }
};
</script>

<style scoped>
  .component-box {
      display: flex;
      justify-content: space-around;
  }

  .component-ctn {
      display: flex;
      width: 45%;
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
  }

  .modify-ctn {
      display: flex;
      padding: 10px;
      justify-content: space-between;
  }
</style>
