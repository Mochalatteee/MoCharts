<template>
  <div class="charts">
    <div class="component-box">
      <div class="component-ctn">
        <div class="chart-ctn">
          <div class="title-box">
            <p>Bar Chart</p>
            <div class="modify-ctn">
              <button @click="toggleColorMode('bar')">
                {{ chartColorModes["bar"] === "day" ? "Night" : "Day" }}
              </button>
              <button @click="goToChart('bar')">Details</button>
            </div>
          </div>

          <div ref="chartBox" class="chart-box">
            <barChart
              v-if="isSizeAvailable"
              :data="[215, 105, 40, 50, 65, 40, 10]"
              :color-mode="chartColorModes['bar']"
              :colors="this.$colors"
              :size="divSize"
            ></barChart>
          </div>
        </div>
      </div>

      <div class="component-ctn">
        <div class="chart-ctn">
          <div class="title-box">
            <p>Rose Chart</p>
            <div class="modify-ctn">
              <button @click="toggleColorMode('rose')">
                {{ chartColorModes["rose"] === "day" ? "Night" : "Day" }}
              </button>
              <button @click="goToChart('rose')">Details</button>
            </div>
          </div>

          <div class="chart-box">
            <roseChart
              v-if="isSizeAvailable"
              :data="[50, 100, 40, 50, 65, 5, 120]"
              :color-mode="chartColorModes['rose']"
              :colors="this.$colors"
              :size="divSize"
            ></roseChart>
          </div>
        </div>
      </div>
    </div>

    <div class="component-box">
      <div class="component-ctn">
        <div class="chart-ctn">
          <div class="title-box">
            <p>Ring Chart</p>
            <div class="modify-ctn">
              <button @click="toggleColorMode('ring')">
                {{ chartColorModes["ring"] === "day" ? "Night" : "Day" }}
              </button>
              <button @click="goToChart('ring')">Details</button>
            </div>
          </div>

          <div class="chart-box">
            <ringChart
              v-if="isSizeAvailable"
              :data="[210, 100, 40, 50, 65, 40, 10]"
              :color-mode="chartColorModes['ring']"
              :colors="this.$colors"
              :size="divSize"
            ></ringChart>
          </div>
        </div>
      </div>

      <div class="component-ctn">
        <div class="chart-ctn">
          <div class="title-box">
            <p>Pie Chart</p>
            <div class="modify-ctn">
              <button @click="toggleColorMode('pie')">
                {{ chartColorModes["pie"] === "day" ? "Night" : "Day" }}
              </button>
              <button @click="goToChart('pie')">Details</button>
            </div>
          </div>

          <div class="chart-box">
            <pieChart
              v-if="isSizeAvailable"
              :data="[50, 100, 40, 50, 65, 5, 120]"
              :color-mode="chartColorModes['pie']"
              :colors="this.$colors"
              :size="divSize"
            ></pieChart>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import barChart from "../components/barChart.vue";
import pieChart from "../components/pieChart.vue";
import roseChart from "../components/roseChart.vue";
import ringChart from "../components/ringChart.vue";
import lineChart from "../components/lineChart.vue";
import { ref, onMounted, watch } from "vue";

export default {
  components: {
    barChart,
    pieChart,
    roseChart,
    ringChart,
    lineChart,
  },
  data() {
    return {
      chartColorModes: {
        bar: "day",
        pie: "day",
        rose: "day",
        ring: "day",
      },
    };
  },
  methods: {
    toggleColorMode(chartType) {
      this.chartColorModes[chartType] =
        this.chartColorModes[chartType] === "day" ? "night" : "day";
    },
    goToChart(chartType) {
      this.$router.push(`/${chartType}-chart`);
    },
  },

  setup() {
    const chartBox = ref(null);
    const divSize = ref({ width: 0, height: 0 });
    const isSizeAvailable = ref(false); // 用于控制是否渲染子组件

    // 监听 chartBox 的变化
    watch(chartBox, (newValue, oldValue) => {
      if (newValue != oldValue) {
        const width = newValue.offsetWidth - 20;
        const height = newValue.offsetHeight - 20;
        divSize.value = { width, height };
        isSizeAvailable.value = true;
      }
    });

    onMounted(() => {
      // 获取 div 元素的长宽
      if (chartBox.value) {
        const width = chartBox.value.offsetWidth - 20;
        const height = chartBox.value.offsetHeight - 20;
        divSize.value = { width, height };
        isSizeAvailable.value = true;
      }
    });

    return { chartBox, divSize, isSizeAvailable };
  },
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
  width: 46%;
  justify-content: center;
  border-radius: 20px;
  border: solid 1px #00000010;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.02);
  padding: 10px;
  min-height: 20rem;
  height: 60vh;
  max-height: 40rem;
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
  padding: 10px 0;
  justify-content: space-between;
}

.modify-ctn button {
  margin-left: 10px;
}

.title-box {
  margin: 0px 0px 0 20px;
  font-size: 1.5vw;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-box {
  width: 100%;
  height: 100%;
  display: flex;
  align-content: center;
  justify-content: center;
  border-radius: 20px;
  border: solid 1px #00000005;
}
</style>
