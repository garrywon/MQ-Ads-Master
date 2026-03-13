<template>
  <div class="chart-display-container">
    <div class="chart-header">
      <div class="chart-controls">
        <el-select
          v-model="localChartType"
          placeholder="选择图表类型"
          class="chart-type-select"
          @change="handleChartTypeChange"
        >
          <el-option label="折线图" value="line">
            <div class="chart-option">
              <el-icon><TrendCharts /></el-icon>
              <span>折线图</span>
            </div>
          </el-option>
          <el-option label="柱状图" value="bar">
            <div class="chart-option">
              <el-icon><Histogram /></el-icon>
              <span>柱状图</span>
            </div>
          </el-option>
          <el-option label="数据列表" value="table">
            <div class="chart-option">
              <el-icon><List /></el-icon>
              <span>数据列表</span>
            </div>
          </el-option>
        </el-select>

        <el-radio-group
          v-if="localChartType !== 'table'"
          v-model="localMetric"
          class="metric-radio"
          @change="handleMetricChange"
        >
          <el-radio-button label="spend">花费</el-radio-button>
          <el-radio-button label="impressions">展示数</el-radio-button>
          <el-radio-button label="clicks">点击数</el-radio-button>
          <el-radio-button label="installs">激活数</el-radio-button>
        </el-radio-group>

        <el-select
          v-if="showGameFilter"
          v-model="localGame"
          placeholder="选择游戏"
          class="game-select"
          filterable
          clearable
          @change="handleGameChange"
        >
          <el-option
            v-for="item in gameOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <el-select
          v-if="showPlatformFilter"
          v-model="localPlatform"
          placeholder="选择广告平台"
          class="platform-select"
          clearable
          @change="handlePlatformChange"
        >
          <el-option
            v-for="item in platformOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <el-date-picker
          v-model="localDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          class="date-picker"
          @change="handleDateChange"
        />

        <el-button type="primary" @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div class="chart-content">
      <div v-if="loading" class="chart-loading">
        <el-icon class="is-loading" :size="40"><Loading /></el-icon>
        <div>加载中...</div>
      </div>

      <div v-else-if="!chartData || chartData.length === 0" class="chart-empty">
        <el-empty description="暂无图表数据" />
      </div>

      <template v-else>
        <!-- 折线图和柱状图 -->
        <div v-if="localChartType !== 'table'" class="chart-visual">
          <div ref="chartRef" class="echarts-container"></div>
        </div>

        <!-- 数据列表 -->
        <div v-else class="chart-table">
          <el-table :data="chartData" border stripe max-height="400">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="date" label="日期" align="center" min-width="120" />
            <el-table-column prop="gameName" label="游戏" align="center" min-width="120" />
            <el-table-column prop="platformName" label="广告平台" align="center" min-width="120">
              <template #default="{ row }">
                <el-tag v-if="row.platformName" :type="getPlatformTag(row.platformName)">
                  {{ row.platformName }}
                </el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="spend" label="花费(¥)" align="center" min-width="120">
              <template #default="{ row }">
                <span class="spend-value">¥{{ formatNumber(row.spend) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="impressions" label="展示数" align="center" min-width="100">
              <template #default="{ row }">
                {{ formatNumber(row.impressions, true) }}
              </template>
            </el-table-column>
            <el-table-column prop="clicks" label="点击数" align="center" min-width="100">
              <template #default="{ row }">
                {{ formatNumber(row.clicks, true) }}
              </template>
            </el-table-column>
            <el-table-column prop="installs" label="激活数" align="center" min-width="100">
              <template #default="{ row }">
                {{ formatNumber(row.installs, true) }}
              </template>
            </el-table-column>
            <el-table-column prop="ctr" label="CTR" align="center" width="100" />
            <el-table-column prop="cvr" label="CVR" align="center" width="100" />
          </el-table>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import * as echarts from "echarts";
import { TrendCharts, Histogram, List, Refresh, Loading } from "@element-plus/icons-vue";

const props = defineProps({
  tableData: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  chartType: {
    type: String,
    default: "line",
  },
  dateRange: {
    type: Array,
    default: () => [],
  },
  cardSelection: {
    type: Object,
    default: () => ({}),
  },
  metric: {
    type: String,
    default: "spend",
  },
  platformOptions: {
    type: Array,
    default: () => [],
  },
  selectedPlatform: {
    type: [Number, String],
    default: null,
  },
  gameOptions: {
    type: Array,
    default: () => [],
  },
  selectedGame: {
    type: [Number, String],
    default: null,
  },
  showPlatformFilter: {
    type: Boolean,
    default: false,
  },
  showGameFilter: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "update:chartType",
  "update:dateRange",
  "refresh",
  "update:metric",
  "update:selectedPlatform",
  "update:selectedGame",
]);

const chartRef = ref(null);
const localChartType = ref(props.chartType);
const localDateRange = ref(props.dateRange);
const localMetric = ref(props.metric);
const localPlatform = ref(props.selectedPlatform);
const localGame = ref(props.selectedGame);
const chartData = ref([]);
const loading = ref(false);

let chartInstance = null;

const formatNumber = (num, isInteger = false) => {
  if (num === undefined || num === null || num === "") return "-";
  const number = Number(num);
  if (isNaN(number)) return "-";
  if (isInteger) {
    return Math.round(number).toLocaleString("en-US");
  }
  return number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const handleMetricChange = (value) => {
  emit("update:metric", value);
  nextTick(() => {
    if (localChartType.value !== "table" && chartData.value.length > 0) {
      renderChart();
    }
  });
};

const handleChartTypeChange = (value) => {
  emit("update:chartType", value);
  nextTick(() => {
    if (value !== "table" && chartData.value.length > 0) {
      renderChart();
    }
  });
};

const handleDateChange = (value) => {
  emit("update:dateRange", value);
  emit("refresh", value);
};

const handleRefresh = () => {
  emit("refresh", localDateRange.value);
};

const handlePlatformChange = (value) => {
  emit("update:selectedPlatform", value);
  nextTick(() => {
    if (chartData.value.length > 0) {
      renderChart();
    }
  });
};

const handleGameChange = (value) => {
  emit("update:selectedGame", value);
  nextTick(() => {
    if (chartData.value.length > 0) {
      renderChart();
    }
  });
};

const calculateCTR = (item) => {
  if (item.impressions > 0) {
    return ((item.clicks / item.impressions) * 100).toFixed(2) + "%";
  }
  return "0.00%";
};

const calculateCVR = (item) => {
  if (item.clicks > 0) {
    return ((item.installs / item.clicks) * 100).toFixed(2) + "%";
  }
  return "0.00%";
};

const getPlatformTag = (platform) => {
  const tags = {
    Facebook: "primary",
    "Google Ads": "success",
    TikTok: "warning",
    Twitter: "danger",
    Snapchat: "info",
  };
  return tags[platform] || "info";
};

const processChartData = () => {
  if (!props.tableData || props.tableData.length === 0) {
    chartData.value = [];
    return;
  }

  const groupedData = {};
  props.tableData.forEach((item) => {
    const date = item.report_date || item.date || item.dateRange?.[0] || "";
    // 如果没有游戏或平台，默认为一个特殊的字符串以防报错
    const gName = item.gameName || "-";
    const pName = item.platformName || item.platform_name || item.platform || item.name || "-";

    // 使用日期、游戏和平台生成唯一的复合 Key
    const uniqueKey = `${date}_${gName}_${pName}`;

    if (!groupedData[uniqueKey]) {
      groupedData[uniqueKey] = {
        date,
        gameName: gName,
        platformName: pName,
        spend: 0,
        impressions: 0,
        clicks: 0,
        installs: 0,
      };
    }
    groupedData[uniqueKey].spend += item.spend || 0;
    groupedData[uniqueKey].impressions += item.impressions || 0;
    groupedData[uniqueKey].clicks += item.clicks || 0;
    groupedData[uniqueKey].installs += item.installs || 0;
  });

  chartData.value = Object.values(groupedData).map((item) => ({
    ...item,
    ctr: calculateCTR(item),
    cvr: calculateCVR(item),
  }));
};

const renderChart = () => {
  if (!chartRef.value || !chartData.value.length) return;

  if (chartInstance) {
    chartInstance.dispose();
  }

  chartInstance = echarts.init(chartRef.value);

  const dates = chartData.value.map((item) => item.date);
  const metricData = chartData.value.map((item) => item[localMetric.value] || 0);

  const metricLabels = {
    spend: "花费",
    impressions: "展示数",
    clicks: "点击数",
    installs: "激活数",
  };

  const metricColors = {
    spend: "#409EFF",
    impressions: "#67C23A",
    clicks: "#E6A23C",
    installs: "#F56C6C",
  };

  const isSpend = localMetric.value === "spend";

  const option = {
    title: {
      text: `数据趋势图 - ${metricLabels[localMetric.value]}`,
      left: "center",
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
    },
    legend: {
      data: [metricLabels[localMetric.value]],
      bottom: 0,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: localChartType.value === "bar",
      data: dates,
      axisLabel: {
        rotate: 30,
      },
    },
    yAxis: [
      {
        type: "value",
        name: isSpend ? "花费(¥)" : "数量",
        position: "left",
        axisLine: {
          show: true,
          lineStyle: {
            color: metricColors[localMetric.value],
          },
        },
        axisLabel: {
          formatter: (value) => formatNumber(value, !isSpend),
        },
      },
    ],
    series: [
      {
        name: metricLabels[localMetric.value],
        type: localChartType.value,
        data: metricData,
        itemStyle: {
          color: metricColors[localMetric.value],
        },
        smooth: localChartType.value !== "bar",
        areaStyle:
          localChartType.value === "line"
            ? {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: metricColors[localMetric.value] },
                  { offset: 1, color: "rgba(255, 255, 255, 0)" },
                ]),
              }
            : undefined,
      },
    ],
  };

  chartInstance.setOption(option);

  window.addEventListener("resize", handleResize);
};

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

watch(
  () => props.chartType,
  (newVal) => {
    localChartType.value = newVal;
  }
);

watch(
  () => props.dateRange,
  (newVal) => {
    localDateRange.value = newVal;
  }
);

watch(
  () => props.tableData,
  () => {
    processChartData();
    nextTick(() => {
      if (localChartType.value !== "table" && chartData.value.length > 0) {
        renderChart();
      }
    });
  },
  { deep: true }
);

watch(
  () => props.isLoading,
  (newVal) => {
    loading.value = newVal;
  }
);

watch(
  () => props.metric,
  (newVal) => {
    localMetric.value = newVal;
  }
);

watch(
  () => props.selectedPlatform,
  (newVal) => {
    localPlatform.value = newVal;
  }
);

watch(
  () => props.selectedGame,
  (newVal) => {
    localGame.value = newVal;
  }
);

onMounted(() => {
  processChartData();
  nextTick(() => {
    if (localChartType.value !== "table" && chartData.value.length > 0) {
      renderChart();
    }
  });
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  if (chartInstance) {
    chartInstance.dispose();
  }
});
</script>

<style lang="scss" scoped>
.chart-display-container {
  padding: 20px;
  background: var(--el-bg-color-overlay);
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.chart-header {
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.chart-controls {
  display: flex;
  gap: 12px;
  align-items: center;

  .chart-type-select {
    width: 140px;
  }

  .metric-radio {
    margin: 0 12px;
  }

  .platform-select {
    width: 160px;
  }

  .game-select {
    width: 160px;
  }

  .date-picker {
    width: 280px;
  }
}

.chart-option {
  display: flex;
  gap: 8px;
  align-items: center;
}

.chart-content {
  min-height: 300px;
}

.chart-loading,
.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--el-text-color-secondary);
}

.chart-visual {
  .echarts-container {
    width: 100%;
    height: 400px;
  }
}

.chart-table {
  .spend-value {
    font-weight: 600;
    color: var(--el-color-danger);
  }
}
</style>
