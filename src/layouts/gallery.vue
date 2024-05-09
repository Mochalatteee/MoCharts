<template>
  <div class="gallery">
    <div class="gallery-component-ctn" v-if="type === 'all' || type === 'bar'">
      <div class="gallery-chart-ctn">
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
            :data="[215, 105, 40, 50, 75, 300, 235]"
            :dataLabel="[
              'item1',
              'item2',
              'item3',
              'item4',
              'item5',
              'item6',
              'item7',
            ]"
            :color-mode="chartColorModes['bar']"
            :colors="this.$colors"
            :size="divSize"
          ></barChart>
        </div>
      </div>
    </div>

    <div class="gallery-component-ctn" v-if="type === 'all' || type === 'pie'">
      <div class="gallery-chart-ctn">
        <div class="title-box">
          <p>Rose Chart</p>
          <div class="modify-ctn">
            <button @click="toggleColorMode('rose')">
              {{ chartColorModes["rose"] === "day" ? "Night" : "Day" }}
            </button>
            <button @click="goToChart('rose')">Details</button>
          </div>
        </div>

        <div ref="chartBox" class="chart-box">
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
    <div class="gallery-component-ctn" v-if="type === 'all' || type === 'pie'">
      <div class="gallery-chart-ctn">
        <div class="title-box">
          <p>Ring Chart</p>
          <div class="modify-ctn">
            <button @click="toggleColorMode('ring')">
              {{ chartColorModes["ring"] === "day" ? "Night" : "Day" }}
            </button>
            <button @click="goToChart('ring')">Details</button>
          </div>
        </div>

        <div ref="chartBox" class="chart-box">
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

    <div class="gallery-component-ctn" v-if="type === 'all' || type === 'pie'">
      <div class="gallery-chart-ctn">
        <div class="title-box">
          <p>Pie Chart</p>
          <div class="modify-ctn">
            <button @click="toggleColorMode('pie')">
              {{ chartColorModes["pie"] === "day" ? "Night" : "Day" }}
            </button>
            <button @click="goToChart('pie')">Details</button>
          </div>
        </div>

        <div ref="chartBox" class="chart-box">
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

    <div class="gallery-component-ctn" v-if="type === 'all' || type === 'line'">
      <div class="gallery-chart-ctn">
        <div class="title-box">
          <p>Line Chart</p>
          <div class="modify-ctn">
            <button @click="toggleColorMode('line')">
              {{ chartColorModes["line"] === "day" ? "Night" : "Day" }}
            </button>
            <button @click="goToChart('line')">Details</button>
          </div>
        </div>

        <div ref="chartBox" class="chart-box">
          <lineChart
            v-if="isSizeAvailable"
            :color-mode="chartColorModes['line']"
            :size="divSize"
          ></lineChart>
        </div>
      </div>
    </div>

    <div class="gallery-component-ctn" v-if="type === 'all' || type === 'bar'">
      <div class="gallery-chart-ctn">
        <div class="title-box">
          <p>Stacked Bar Chart</p>
          <div class="modify-ctn">
            <button @click="toggleColorMode('stackedBar')">
              {{ chartColorModes["stackedBar"] === "day" ? "Night" : "Day" }}
            </button>
            <button @click="goToChart('stacked-bar')">Details</button>
          </div>
        </div>
        <div ref="chartBox" class="chart-box">
          <stackedBarChart
            v-if="isSizeAvailable"
            :color-mode="chartColorModes['stackedBar']"
            :size="divSize"
          ></stackedBarChart>
        </div>
      </div>
    </div>

    <div
      class="gallery-component-ctn"
      v-if="type === 'all' || type === 'radar'"
    >
      <div class="gallery-chart-ctn">
        <div class="title-box">
          <p>Radar Chart</p>
          <div class="modify-ctn">
            <button @click="toggleColorMode('radar')">
              {{ chartColorModes["radar"] === "day" ? "Night" : "Day" }}
            </button>
            <button @click="goToChart('radar')">Details</button>
          </div>
        </div>
        <div ref="chartBox" class="chart-box">
          <radarChart
            v-if="isSizeAvailable"
            :color-mode="chartColorModes['radar']"
            :size="divSize"
          ></radarChart>
        </div>
      </div>
    </div>

    <div class="gallery-component-ctn" v-if="type === 'all' || type === 'line'">
      <div class="gallery-chart-ctn">
        <div class="title-box">
          <p>Multi-Data Line Chart</p>
          <div class="modify-ctn">
            <button @click="toggleColorMode('multLine')">
              {{ chartColorModes["multLine"] === "day" ? "Night" : "Day" }}
            </button>
            <button @click="goToChart('multLine')">Details</button>
          </div>
        </div>

        <div ref="chartBox" class="chart-box">
          <multiLineChart
            v-if="isSizeAvailable"
            :color-mode="chartColorModes['multLine']"
            :size="divSize"
          ></multiLineChart>
        </div>
      </div>
    </div>

    <div
      class="gallery-component-ctn"
      v-if="type === 'all' || type === 'radar'"
    >
      <div class="gallery-chart-ctn">
        <div class="title-box">
          <p>Multi-Data Radar Chart</p>
          <div class="modify-ctn">
            <button @click="toggleColorMode('multRadar')">
              {{ chartColorModes["multRadar"] === "day" ? "Night" : "Day" }}
            </button>
            <button @click="goToChart('multRadar')">Details</button>
          </div>
        </div>
        <div ref="chartBox" class="chart-box">
          <multiRadarChart
            v-if="isSizeAvailable"
            :color-mode="chartColorModes['multRadar']"
            :size="divSize"
          ></multiRadarChart>
        </div>
      </div>
    </div>


    <div class="gallery-component-ctn" v-if="type === 'all' || type === 'line'">
      <div class="gallery-chart-ctn">
        <div class="title-box">
          <p>Multi-Large-Data Line Chart</p>
          <div class="modify-ctn">
            <button @click="toggleColorMode('largeLine')">
              {{ chartColorModes["largeLine"] === "day" ? "Night" : "Day" }}
            </button>
            <button @click="goToChart('largeLine')">Details</button>
          </div>
        </div>

        <div ref="chartBox" class="chart-box">
          <largeLineChart
            v-if="isSizeAvailable"
            :color-mode="chartColorModes['largeLine']"
            :size="divSize"
          >
          </largeLineChart>
        </div>
      </div>
    </div>

    <div class="gallery-component-ctn" v-if="type === 'all' || type === 'line'">
      <div class="gallery-chart-ctn">
        <div class="title-box">
          <p>Large Line Chart</p>
          <div class="modify-ctn">
            <button @click="toggleColorMode('largeLine')">
              {{ chartColorModes["largeLine"] === "day" ? "Night" : "Day" }}
            </button>
            <button @click="goToChart('largeLine')">Details</button>
          </div>
        </div>

        <div ref="chartBox" class="chart-box">
          <multiLargeLineChart
            v-if="isSizeAvailable"
            :color-mode="chartColorModes['largeLine']"
            :size="divSize"
          >
          </multiLargeLineChart>
        </div>
      </div>
    </div>

    <div class="gallery-component-ctn" v-if="type === 'all' || type === 'line'">
      <div class="gallery-chart-ctn">
        <div class="title-box">
          <p>Mixed Line Chart</p>
          <div class="modify-ctn">
            <button @click="toggleColorMode('largeLine')">
              {{ chartColorModes["largeLine"] === "day" ? "Night" : "Day" }}
            </button>
            <button @click="goToChart('largeLine')">Details</button>
          </div>
        </div>

        <div ref="chartBox" class="chart-box">
          <mixedLineChart
            v-if="isSizeAvailable"
            :color-mode="chartColorModes['largeLine']"
            :size="divSize"
          >
          </mixedLineChart>
        </div>
      </div>
    </div>

    <div class="gallery-component-ctn" v-if="type === 'all' || type === 'line'">
      <div class="gallery-chart-ctn">
        <div class="title-box">
          <p>Dynamic Large Line Chart</p>
          <div class="modify-ctn">
            <button @click="toggleColorMode('largeLine')">
              {{ chartColorModes["largeLine"] === "day" ? "Night" : "Day" }}
            </button>
            <button @click="goToChart('largeLine')">Details</button>
          </div>
        </div>

        <div ref="chartBox" class="chart-box">
          <dynamicLargeLineChart
            v-if="isSizeAvailable"
            :color-mode="chartColorModes['largeLine']"
            :size="divSize"
          >
          </dynamicLargeLineChart>
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
import stackedBarChart from "../components/stackedBarChart.vue";
import radarChart from "../components/radarChart.vue";
import multiLineChart from "../components/multiLineChart.vue";
import multiRadarChart from "../components/multiRadarChart.vue";
import largeLineChart from "../components/largeLineChart.vue";
import multiLargeLineChart from "../components/multiLargeLineChart.vue";
import mixedLineChart from "../components/mixedLineChart.vue";
import dynamicLargeLineChart from "../components/dynamicLargeLineChart.vue";
import { ref, onMounted, watch } from "vue";

export default {
  props: {
    type: {
      type: String,
      default: "all",
    },
  },
  components: {
    barChart,
    pieChart,
    roseChart,
    ringChart,
    lineChart,
    stackedBarChart,
    radarChart,
    multiLineChart,
    multiRadarChart,
    largeLineChart,
    multiLargeLineChart,
    mixedLineChart,
    dynamicLargeLineChart
  },
  data() {
    return {
      chartColorModes: {
        bar: "day",
        pie: "day",
        rose: "day",
        ring: "day",
        line: "day",
        stackedBar: "day",
        radar: "day",
        multLine: "day",
        multRadar: "day",
        largeLine: "day"
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

  setup(props) {
    const chartBox = ref(null);
    const divSize = ref({ width: 0, height: 0 });
    const isSizeAvailable = ref(false); // 用于控制是否渲染子组件

    // 监听 chartBox 的变化
    watch(chartBox, (newValue, oldValue) => {
      console.log(chartBox)
      if (chartBox.value && newValue != oldValue) {
        const width = newValue.offsetWidth - 20;
        const height = newValue.offsetHeight - 20;
        divSize.value = { width, height };
        isSizeAvailable.value = true;
        console.log("watch",divSize.value);
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
      // window.addEventListener('resize', updateDimensions(chartBox,divSize,isSizeAvailable));
    });

    return { chartBox, divSize, isSizeAvailable };
  },
};
function updateDimensions(chartBox,divSize,isSizeAvailable){
  const width = chartBox.value.offsetWidth - 20;
  const height = chartBox.value.offsetHeight - 20;
  divSize.value = { width, height };
  console.log("change",divSize.value);
  isSizeAvailable.value = true;
}
</script>

<style scoped>
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

.gallery {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between; /* 在容器中的项目之间平均分配空白空间 */
}

.gallery-component-ctn {
  width: 49%; /* 每列的宽度为容器宽度的一半减去间隔的一半 */
  margin-bottom: 20px; /* 设置下方间隔 */
  border-radius: 20px;
  border: solid 1px #00000010;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.02);
  padding: 10px;
  min-height: 20rem;
  height: 60vh;
  max-height: 70vh;
}

.gallery-chart-ctn {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%; /* 设置内容高度 */
}
</style>
