<template>
  <div class="dashboard-container">
    <VueDraggable
      v-model="modules"
      class="dashboard-modules"
      handle=".drag-handle"
      :animation="200"
      ghost-class="ghost"
      drag-class="dragging"
    >
      <el-card
        v-for="module in modules"
        :key="module.id"
        shadow="never"
        class="mt-2 module-card draggable-item"
        :data-type="module.type"
      >
        <template #header>
          <div class="flex-x-between">
            <div class="drag-handle">
              <div class="i-svg:Drag" alt="拖拽" style="width: 16px; height: 16px" />
            </div>
            <span v-if="module.type === 'rank'" />
            <span v-else-if="module.type === 'spend'" />
            <span v-else-if="module.type === 'greeting'" />
            <span v-else-if="module.type === 'onlineUsers'" class="text-gray">在线用户</span>
            <span v-else-if="module.type === 'uv'" class="text-gray">访客数(UV)</span>
            <span v-else-if="module.type === 'pv'" class="text-gray">浏览量(PV)</span>
            <span v-else-if="module.type === 'trend'">访问趋势</span>
            <span v-else-if="module.type === 'news'" class="header-title">最新动态</span>

            <template v-if="module.type === 'rank'" />
            <template v-else-if="module.type === 'spend'" />
            <template v-else-if="module.type === 'greeting'" />
            <template v-else-if="module.type === 'onlineUsers'">
              <el-tag type="danger" size="small">实时</el-tag>
            </template>
            <template v-else-if="module.type === 'uv'">
              <el-tag type="success" size="small">日</el-tag>
            </template>
            <template v-else-if="module.type === 'pv'">
              <el-tag type="primary" size="small">日</el-tag>
            </template>
            <template v-else-if="module.type === 'trend'">
              <el-radio-group v-model="visitTrendDateRange" size="small">
                <el-radio-button label="近7天" :value="7" />
                <el-radio-button label="近30天" :value="30" />
              </el-radio-group>
            </template>
            <template v-else-if="module.type === 'news'">
              <el-link
                type="primary"
                underline="never"
                href="https://gitee.com/youlaiorg/vue3-element-admin/releases"
                target="_blank"
              >
                完整记录
                <el-icon class="link-icon"><TopRight /></el-icon>
              </el-link>
            </template>
          </div>
        </template>

        <template v-if="module.type === 'rank'">
          <ChannelRanking />
        </template>

        <template v-else-if="module.type === 'spend'">
          <SpendChart />
        </template>

        <template v-else-if="module.type === 'greeting'">
          <div class="flex flex-wrap">
            <div class="flex-1 flex items-start">
              <div class="ml-5">
                <p>{{ greetings }}</p>
                <p class="text-sm text-gray">今日天气晴朗，气温在15℃至25℃之间，东南风。</p>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="module.type === 'onlineUsers'">
          <div class="flex-x-between mt-2 flex-1">
            <div class="flex-y-center">
              <span class="text-lg transition-all duration-300 hover:scale-110">
                {{ onlineUserCount }}
              </span>
              <span v-if="isConnected" class="ml-2 text-xs text-[#67c23a]">
                <el-icon><Connection /></el-icon>
                已连接
              </span>
              <span v-else class="ml-2 text-xs text-[#f56c6c]">
                <el-icon><Failed /></el-icon>
                未连接
              </span>
            </div>
            <div class="i-svg:people w-8 h-8 animate-[pulse_2s_infinite]" />
          </div>
          <div class="flex-x-between mt-2 text-sm text-gray">
            <span>更新时间</span>
            <span>{{ formattedTime }}</span>
          </div>
        </template>

        <template v-else-if="module.type === 'uv'">
          <el-skeleton :loading="visitStatsLoading" :rows="3" animated>
            <div class="flex-x-between">
              <el-skeleton-item variant="text" style="width: 30%" />
              <el-skeleton-item variant="circle" style="width: 2em; height: 2em" />
            </div>
            <div class="mt-5 flex-x-between">
              <el-skeleton-item variant="text" style="width: 50%" />
              <el-skeleton-item variant="text" style="width: 1em" />
            </div>
          </el-skeleton>
          <div v-if="!visitStatsLoading" class="flex-x-between mt-2 flex-1">
            <div class="flex-y-center">
              <span class="text-lg">{{ displayTransitionUvCount }}</span>
              <span
                :class="['text-xs', 'ml-2', computeGrowthRateClass(visitStatsData.uvGrowthRate)]"
              >
                <el-icon>
                  <Top v-if="visitStatsData.uvGrowthRate > 0" />
                  <Bottom v-else-if="visitStatsData.uvGrowthRate < 0" />
                </el-icon>
                {{ formatGrowthRate(visitStatsData.uvGrowthRate) }}
              </span>
            </div>
            <div class="i-svg:visitor w-8 h-8" />
          </div>
          <div v-if="!visitStatsLoading" class="flex-x-between mt-2 text-sm text-gray">
            <span>总访客数</span>
            <span>{{ displayTransitionTotalUvCount }}</span>
          </div>
        </template>

        <template v-else-if="module.type === 'pv'">
          <el-skeleton :loading="visitStatsLoading" :rows="3" animated>
            <div class="flex-x-between">
              <el-skeleton-item variant="text" style="width: 30%" />
              <el-skeleton-item variant="circle" style="width: 2em; height: 2em" />
            </div>
            <div class="mt-5 flex-x-between">
              <el-skeleton-item variant="text" style="width: 50%" />
              <el-skeleton-item variant="text" style="width: 1em" />
            </div>
          </el-skeleton>
          <div v-if="!visitStatsLoading" class="flex-x-between mt-2 flex-1">
            <div class="flex-y-center">
              <span class="text-lg">{{ displayTransitionPvCount }}</span>
              <span
                :class="['text-xs', 'ml-2', computeGrowthRateClass(visitStatsData.pvGrowthRate)]"
              >
                <el-icon>
                  <Top v-if="visitStatsData.pvGrowthRate > 0" />
                  <Bottom v-else-if="visitStatsData.pvGrowthRate < 0" />
                </el-icon>
                {{ formatGrowthRate(visitStatsData.pvGrowthRate) }}
              </span>
            </div>
            <div class="i-svg:browser w-8 h-8" />
          </div>
          <div v-if="!visitStatsLoading" class="flex-x-between mt-2 text-sm text-gray">
            <span>总浏览量</span>
            <span>{{ displayTransitionTotalPvCount }}</span>
          </div>
        </template>

        <template v-else-if="module.type === 'trend'">
          <ECharts :options="visitTrendChartOptions" height="400px" />
        </template>

        <template v-else-if="module.type === 'news'">
          <el-scrollbar height="400px">
            <el-timeline class="p-3">
              <el-timeline-item
                v-for="(item, index) in vesionList"
                :key="index"
                :timestamp="item.date"
                placement="top"
                :color="index === 0 ? '#67C23A' : '#909399'"
                :hollow="index !== 0"
                size="large"
              >
                <div class="version-item" :class="{ 'latest-item': index === 0 }">
                  <div>
                    <el-text tag="strong">{{ item.title }}</el-text>
                    <el-tag v-if="item.tag" :type="index === 0 ? 'success' : 'info'" size="small">
                      {{ item.tag }}
                    </el-tag>
                  </div>
                  <el-text class="version-content">{{ item.content }}</el-text>
                  <div v-if="item.link">
                    <el-link
                      :type="index === 0 ? 'primary' : 'info'"
                      :href="item.link"
                      target="_blank"
                      underline="never"
                    >
                      详情
                      <el-icon class="link-icon"><TopRight /></el-icon>
                    </el-link>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </el-scrollbar>
        </template>
      </el-card>
    </VueDraggable>
  </div>
</template>

<script setup>
defineOptions({
  name: "Dashboard",
  inheritAttrs: false,
});

import { ref, watch, computed, onMounted } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import { Connection, Failed, Top, Bottom, TopRight } from "@element-plus/icons-vue";
import { useUserStore } from "@/store/modules/user";
import { formatGrowthRate } from "@/utils";
import { useTransition, useDateFormat } from "@vueuse/core";
// import { useOnlineCount } from "@/composables"; // 已禁用，后端不支持 /topic/online-count
import ChannelRanking from "@/components/ChannelRanking/index.vue";
import SpendChart from "@/components/SpendChart/index.vue";

const modules = ref([
  { id: 1, type: "greeting" },
  { id: 0, type: "rank" },
  { id: 7, type: "spend" },
  { id: 3, type: "uv" },
  { id: 4, type: "pv" },
  { id: 6, type: "news" },
  { id: 5, type: "trend" },
]);

// 在线用户数量组件相关（已禁用，后端不支持 /topic/online-count）
// const { onlineUserCount, lastUpdateTime, isConnected } = useOnlineCount();

// 记录上一次的用户数量用于计算趋势（已禁用）
// const previousCount = ref(0);

// 监听用户数量变化，计算趋势（已禁用）
// watch(onlineUserCount, (newCount, oldCount) => {
//   if (oldCount > 0) {
//     previousCount.value = oldCount;
//   }
// });

// 格式化时间戳（已禁用，后端不支持 /topic/online-count）
// const formattedTime = computed(() => {
//   if (!lastUpdateTime.value) return "--";
//   return useDateFormat(lastUpdateTime, "HH:mm:ss").value;
// });

const userStore = useUserStore();

// 当前通知公告列表
const vesionList = ref([
  {
    id: "1",
    title: "v2.8.0-SNAPSHOT",
    date: "2025-10-xx 00:00:00",
    content: "1. 整合 vue3-element-admin-ts 和 vue3-element-admin-js；2. 优化文档结构。",
    link: "https://gitee.com/youlaiorg/vue3-element-admin/releases",
    tag: "开发中",
  },
  {
    id: "2",
    title: "v2.7.0",
    date: "2025-05-18 00:00:00",
    content:
      "1. 新增 AI 助手功能，支持多种大语言模型；2. 菜单支持开启和关闭页面缓存；3. 升级 Element Plus 到 2.7.4。",
    link: "https://gitee.com/youlaiorg/vue3-element-admin/releases/v2.7.0",
    tag: "里程碑",
  },
  {
    id: "3",
    title: "v2.6.2",
    date: "2024-08-01 00:00:00",
    content: "1. 优化 UnoCSS 配置；2. 修复字典组件回显问题；3. 升级依赖版本。",
    link: "https://gitee.com/youlaiorg/vue3-element-admin/releases/v2.6.2",
    tag: "优化",
  },
]);

// 当前时间（用于计算问候语）
const currentDate = new Date();

// 问候语：根据当前小时返回不同问候语
const greetings = computed(() => {
  const hours = currentDate.getHours();
  const nickname = userStore.userInfo.nickname;
  if (hours >= 6 && hours < 8) {
    return "早期的鸟儿有虫吃🌅！";
  } else if (hours >= 8 && hours < 12) {
    return `上午好，${nickname}！`;
  } else if (hours >= 12 && hours < 18) {
    return `下午好，${nickname}！`;
  } else if (hours >= 18 && hours < 24) {
    return `晚上好，${nickname}！`;
  } else {
    return "熬夜虽好，可不要贪杯噢🌛！";
  }
});

// 访客统计数据加载状态
const visitStatsLoading = ref(true);
// 访客统计数据
const visitStatsData = ref({
  todayUvCount: 0,
  uvGrowthRate: 0,
  totalUvCount: 0,
  todayPvCount: 0,
  pvGrowthRate: 0,
  totalPvCount: 0,
});

const toNumber = (value) => Number(value ?? 0);

// 数字过渡动画
const transitionUvCount = useTransition(
  computed(() => toNumber(visitStatsData.value.todayUvCount)),
  {
    duration: 1000,
    transition: [0.25, 0.1, 0.25, 1.0], // CSS cubic-bezier
  }
);

const transitionTotalUvCount = useTransition(
  computed(() => toNumber(visitStatsData.value.totalUvCount)),
  {
    duration: 1200,
    transition: [0.25, 0.1, 0.25, 1.0],
  }
);

const transitionPvCount = useTransition(
  computed(() => toNumber(visitStatsData.value.todayPvCount)),
  {
    duration: 1000,
    transition: [0.25, 0.1, 0.25, 1.0],
  }
);

const transitionTotalPvCount = useTransition(
  computed(() => toNumber(visitStatsData.value.totalPvCount)),
  {
    duration: 1200,
    transition: [0.25, 0.1, 0.25, 1.0],
  }
);

// 过渡结果可能是 Ref<number>，为模板中使用做类型和格式处理（避免 TS 报错）
const displayTransitionUvCount = computed(() =>
  Math.round(Number(transitionUvCount?.value ?? transitionUvCount))
);
const displayTransitionTotalUvCount = computed(() =>
  Math.round(Number(transitionTotalUvCount?.value ?? transitionTotalUvCount))
);
const displayTransitionPvCount = computed(() =>
  Math.round(Number(transitionPvCount?.value ?? transitionPvCount))
);
const displayTransitionTotalPvCount = computed(() =>
  Math.round(Number(transitionTotalPvCount?.value ?? transitionTotalPvCount))
);

// 访问趋势日期范围（单位：天）
const visitTrendDateRange = ref(7);
// 访问趋势图表配置
const visitTrendChartOptions = ref({});

/**
 * 获取访客统计数据
 */
const fetchVisitStatsData = () => {
  // StatisticsAPI.getVisitOverview()
  //   .then((data) => {
  //     visitStatsData.value = data;
  //   })
  //   .finally(() => {
  //     visitStatsLoading.value = false;
  //   });
};

/**
 * 获取访问趋势数据，并更新图表配置
 */
const fetchVisitTrendData = () => {
  // const startDate = dayjs()
  //   .subtract(visitTrendDateRange.value - 1, "day")
  //   .toDate();
  // const endDate = new Date();
  // StatisticsAPI.getVisitTrend({
  //   startDate: dayjs(startDate).format("YYYY-MM-DD"),
  //   endDate: dayjs(endDate).format("YYYY-MM-DD"),
  // }).then((data) => {
  //   updateVisitTrendChartOptions(data);
  // });
};

/**
 * 更新访问趋势图表的配置项
 *
 * @param data - 访问趋势数据
 */
const updateVisitTrendChartOptions = (data) => {
  visitTrendChartOptions.value = {
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["浏览量(PV)", "访客量UV)"],
      bottom: 0,
    },
    grid: {
      left: "1%",
      right: "5%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: data.dates,
    },
    yAxis: {
      type: "value",
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",
        },
      },
    },
    series: [
      {
        name: "浏览量(PV)",
        type: "line",
        data: data.pvList,
        areaStyle: {
          color: "rgba(64, 158, 255, 0.1)",
        },
        smooth: true,
        itemStyle: {
          color: "#4080FF",
        },
        lineStyle: {
          color: "#4080FF",
        },
      },
      {
        name: "访客量UV)",
        type: "line",
        data: data.ipList,
        areaStyle: {
          color: "rgba(103, 194, 58, 0.1)",
        },
        smooth: true,
        itemStyle: {
          color: "#67C23A",
        },
        lineStyle: {
          color: "#67C23A",
        },
      },
    ],
  };
};

/**
 * 根据增长率计算对应的 CSS 类名
 *
 * @param growthRate - 增长率数值
 */
const computeGrowthRateClass = (growthRate) => {
  if (!growthRate) {
    return "text-[--el-color-info]";
  }
  if (growthRate > 0) {
    return "text-[--el-color-danger]";
  } else if (growthRate < 0) {
    return "text-[--el-color-success]";
  } else {
    return "text-[--el-color-info]";
  }
};

// 监听访问趋势日期范围的变化，重新获取趋势数据
watch(
  () => visitTrendDateRange.value,
  () => {
    fetchVisitTrendData();
  },
  { immediate: true }
);

// 组件挂载后加载访客统计数据和通知公告数据
onMounted(() => {
  fetchVisitStatsData();
});
</script>

<style lang="scss" scoped>
.dashboard-container {
  position: relative;
  padding: 24px;

  .dashboard-modules {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .module-card {
    position: relative;
    flex: 1 1 calc(33.333% - 10px);
    min-width: 300px;
    border-radius: 8px;

    :deep(.el-card__header) {
      padding: 10px 12px;
      min-height: auto;
    }

    &[data-type="greeting"] {
      flex: 1 1 calc(33.333% - 5px);
    }

    &[data-type="rank"] {
      flex: 1 1 calc(66.666% - 5px);
    }

    &[data-type="spend"] {
      flex: 1 1 100%;
    }
  }

  .draggable-item {
    &.ghost {
      background: var(--el-color-primary-light-9);
      border: 2px dashed var(--el-color-primary);
      opacity: 0.5;
    }

    &.dragging {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      transform: scale(1.02);
    }
  }

  .drag-handle {
    height: 20px;
    width: 100%;
    padding: 0 0 0 4px;
    margin-right: 8px;
    cursor: grab;
    border-radius: 4px;
    opacity: 0.4;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      opacity 0.2s,
      background-color 0.2s;

    &:hover {
      background: var(--el-color-primary-light-9);
      opacity: 1;
    }

    img {
      display: block;
      width: 16px;
      height: 16px;
    }
  }

  html.dark {
    .drag-handle:hover {
      background: $menu-hover;
    }
  }

  .version-item {
    padding: 16px;
    margin-bottom: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
    transition: all 0.2s;

    &.latest-item {
      background: var(--el-color-primary-light-9);
      border: 1px solid var(--el-color-primary-light-5);
    }
    &:hover {
      transform: translateX(5px);
    }
    .version-content {
      margin-bottom: 12px;
      font-size: 13px;
      line-height: 1.5;
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
