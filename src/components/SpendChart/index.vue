<template>
  <div class="spend-chart">
    <div class="chart-header">
      <div class="chart-title">
        <el-icon><Money /></el-icon>
        <span>花费趋势</span>
      </div>
      <el-segmented v-model="chartType" :options="chartTypeOptions" />
    </div>

    <el-skeleton v-if="loading" :rows="6" animated class="chart-skeleton" />

    <template v-else>
      <div v-if="chartData.length === 0" class="chart-empty">
        <el-empty description="暂无数据" :image-size="80" />
      </div>

      <div v-else class="chart-body">
        <div class="chart-container">
          <ECharts :options="chartConfig" height="350px" />
        </div>
        <div class="summary-panel">
          <div class="summary-item">
            <div class="item-label">总花费</div>
            <div class="item-value">{{ formatMoney(totalSpend) }}</div>
          </div>
          <el-divider style="margin: 12px 0" />
          <div class="summary-item">
            <div class="item-label">日均花费</div>
            <div class="item-value">{{ formatMoney(avgSpend) }}</div>
          </div>
          <el-divider style="margin: 12px 0" />
          <div class="summary-item">
            <div class="item-label">最高花费</div>
            <div class="item-value highlight">{{ formatMoney(maxSpend) }}</div>
          </div>
          <el-divider style="margin: 12px 0" />
          <div class="summary-item">
            <div class="item-label">最低花费</div>
            <div class="item-value">{{ formatMoney(minSpend) }}</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { Money } from "@element-plus/icons-vue";
import * as echarts from "echarts/core";
import { LineChart, BarChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useResizeObserver } from "@vueuse/core";
import AnalysisAPI from "@/api/analysis";

echarts.use([CanvasRenderer, LineChart, BarChart, GridComponent, TooltipComponent]);

const chartType = ref("line");
const chartTypeOptions = [
  { label: "折线图", value: "line" },
  { label: "柱状图", value: "bar" },
];

const loading = ref(false);
const chartData = ref([]);

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const initDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 13);
  return {
    start: formatDate(start),
    end: formatDate(end),
  };
};

const dates = computed(() => chartData.value.map((item) => item.date));
const spendData = computed(() => chartData.value.map((item) => item.spend));

const totalSpend = computed(() => {
  return spendData.value.reduce((sum, val) => sum + val, 0);
});

const avgSpend = computed(() => {
  if (spendData.value.length === 0) return 0;
  return totalSpend.value / spendData.value.length;
});

const maxSpend = computed(() => {
  if (spendData.value.length === 0) return 0;
  return Math.max(...spendData.value);
});

const minSpend = computed(() => {
  if (spendData.value.length === 0) return 0;
  return Math.min(...spendData.value);
});

const formatMoney = (value) => {
  if (!value && value !== 0) return "--";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const getBaseChartOptions = () => ({
  tooltip: {
    trigger: "axis",
    formatter: (params) => {
      const item = params[0];
      return `<div style="font-weight: 600">${item.name}</div>
              <div style="color: #4080FF">花费: ${formatMoney(item.value)}</div>`;
    },
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderColor: "#e4e7ed",
    borderWidth: 1,
    padding: [8, 12],
    textStyle: {
      color: "#303133",
      fontSize: 13,
    },
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    top: "3%",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    data: dates.value,
    axisLine: {
      lineStyle: {
        color: "#e4e7ed",
      },
    },
    axisLabel: {
      color: "#606266",
      fontSize: 12,
    },
    axisTick: {
      show: false,
    },
  },
  yAxis: {
    type: "value",
    splitLine: {
      lineStyle: {
        type: "dashed",
        color: "#e4e7ed",
      },
    },
    axisLine: {
      show: false,
    },
    axisLabel: {
      color: "#606266",
      fontSize: 12,
      formatter: (value) => {
        if (value >= 1000) {
          return `$${(value / 1000).toFixed(0)}k`;
        }
        return `$${value}`;
      },
    },
  },
});

const lineChartOptions = computed(() => ({
  ...getBaseChartOptions(),
  series: [
    {
      type: "line",
      data: spendData.value,
      smooth: true,
      symbol: "circle",
      symbolSize: 6,
      showSymbol: false,
      hoverAnimation: true,
      lineStyle: {
        width: 3,
        color: "#4080FF",
      },
      itemStyle: {
        color: "#4080FF",
        borderWidth: 2,
        borderColor: "#fff",
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "rgba(64, 158, 255, 0.25)" },
          { offset: 1, color: "rgba(64, 158, 255, 0.02)" },
        ]),
      },
      emphasis: {
        focus: "series",
        itemStyle: {
          color: "#4080FF",
          borderColor: "#fff",
          borderWidth: 2,
          shadowBlur: 10,
          shadowColor: "rgba(64, 158, 255, 0.5)",
        },
      },
    },
  ],
}));

const barChartOptions = computed(() => ({
  ...getBaseChartOptions(),
  series: [
    {
      type: "bar",
      data: spendData.value,
      barWidth: "50%",
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "#4080FF" },
          { offset: 1, color: "#79b8ff" },
        ]),
        borderRadius: [4, 4, 0, 0],
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#3b82f6" },
            { offset: 1, color: "#60a5fa" },
          ]),
        },
      },
    },
  ],
}));

const chartConfig = computed(() => {
  return chartType.value === "line" ? lineChartOptions.value : barChartOptions.value;
});

const fetchData = async () => {
  loading.value = true;

  try {
    const dateRange = initDateRange();
    const apiParams = {
      date_range: {
        start: dateRange.start,
        end: dateRange.end,
      },
      filters: {
        business_type: "UA",
      },
      group_by: ["report_date"],
      page: 1,
      size: 100,
    };

    const response = await AnalysisAPI.queryAnalytics(apiParams);
    const rawData = response.items || [];

    const sortedData = rawData
      .sort((a, b) => new Date(a.report_date) - new Date(b.report_date))
      .map((item) => ({
        date: item.report_date,
        spend: item.spend || 0,
      }));

    chartData.value = sortedData;
  } catch (error) {
    console.error("获取花费趋势数据失败:", error);
    ElMessage.error("获取花费趋势数据失败");
    chartData.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
.spend-chart {
  width: 100%;

  .chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .chart-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);

      .el-icon {
        font-size: 20px;
        color: var(--el-color-primary);
      }
    }
  }

  .chart-skeleton {
    padding: 20px 0;
  }

  .chart-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 350px;
  }

  .chart-body {
    display: flex;
    gap: 20px;

    .chart-container {
      flex: 1;
      min-width: 0;
    }

    .summary-panel {
      width: 180px;
      flex-shrink: 0;
      padding: 20px 16px;
      background: var(--el-fill-color-light);
      border-radius: 12px;
      display: flex;
      flex-direction: column;

      .summary-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .item-label {
          font-size: 13px;
          color: var(--el-text-color-secondary);
        }

        .item-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--el-text-color-primary);

          &.highlight {
            color: var(--el-color-primary);
          }
        }
      }
    }
  }
}

html.dark {
  .spend-chart {
    .chart-body {
      .summary-panel {
        background: #1e293b;

        .summary-item {
          .item-label {
            color: #94a3b8;
          }

          .item-value {
            color: #f1f5f9;

            &.highlight {
              color: #60a5fa;
            }
          }
        }
      }
    }
  }
}
</style>
