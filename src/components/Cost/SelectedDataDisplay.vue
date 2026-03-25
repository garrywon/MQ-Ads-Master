<template>
  <div v-if="viewMode === 'card' || viewMode === 'list'" class="card-mode-data">
    <div v-if="viewMode === 'list'" class="detail-container">
      <div v-if="loading" class="detail-loading">
        <el-icon class="is-loading" :size="40"><Loading /></el-icon>
        <div>加载中...</div>
      </div>
      <div v-else-if="tableData.length === 0" class="detail-empty">
        <el-empty description="暂无数据" />
      </div>
      <div v-else class="detail-list">
        <div class="detail-card total-card">
          <div class="detail-header">
            <span class="detail-title">{{ displayInfo.title }}</span>
            <el-tag type="primary">{{ displayInfo.tag }}</el-tag>
          </div>

          <div v-if="dateRange" class="detail-meta">
            <div class="meta-item">
              <span class="meta-label">日期范围：</span>
              <span class="meta-value">{{ formatDateRange(dateRange) }}</span>
            </div>

            <!-- 动态展示元信息（基于displayInfo计算属性） -->
            <div v-for="(meta, index) in displayInfo.meta" :key="'meta-' + index" class="meta-item">
              <span class="meta-label">{{ meta.label }}：</span>
              <span class="meta-value">{{ meta.value }}</span>
            </div>
          </div>

          <div class="detail-content">
            <div class="detail-stats">
              <div class="stat-item">
                <div class="stat-value" :class="isRevenue ? 'revenue' : 'spend'">
                  ¥{{ formatNumber(totalData.spend) }}
                </div>
                <div class="stat-label">{{ isRevenue ? "收益" : "花费" }}</div>
                <!-- 进度条：未选择平台时显示占比 -->
                <div
                  v-if="platformStats.length > 0 && !cardSelection.selectedPlatform"
                  class="stat-progress"
                >
                  <div
                    v-for="(platform, index) in platformStats"
                    :key="index"
                    class="progress-item"
                  >
                    <el-progress
                      :percentage="platform.spendPercent"
                      :stroke-width="6"
                      :show-text="false"
                      :color="getPlatformColor(index)"
                    />
                    <span class="progress-text">
                      {{ platform.platformName }} {{ platform.spendPercent.toFixed(1) }}%
                    </span>
                  </div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ formatNumber(totalData.impressions, true) }}</div>
                <div class="stat-label">展示数</div>
                <!-- 进度条：未选择平台时显示占比 -->
                <div
                  v-if="platformStats.length > 0 && !cardSelection.selectedPlatform"
                  class="stat-progress"
                >
                  <div
                    v-for="(platform, index) in platformStats"
                    :key="index"
                    class="progress-item"
                  >
                    <el-progress
                      :percentage="platform.impressionsPercent"
                      :stroke-width="6"
                      :show-text="false"
                      :color="getPlatformColor(index)"
                    />
                    <span class="progress-text">
                      {{ platform.platformName }} {{ platform.impressionsPercent.toFixed(1) }}%
                    </span>
                  </div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ formatNumber(totalData.clicks, true) }}</div>
                <div class="stat-label">点击数</div>
                <!-- 进度条：未选择平台时显示占比 -->
                <div
                  v-if="platformStats.length > 0 && !cardSelection.selectedPlatform"
                  class="stat-progress"
                >
                  <div
                    v-for="(platform, index) in platformStats"
                    :key="index"
                    class="progress-item"
                  >
                    <el-progress
                      :percentage="platform.clicksPercent"
                      :stroke-width="6"
                      :show-text="false"
                      :color="getPlatformColor(index)"
                    />
                    <span class="progress-text">
                      {{ platform.platformName }} {{ platform.clicksPercent.toFixed(1) }}%
                    </span>
                  </div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ formatNumber(totalData.installs, true) }}</div>
                <div class="stat-label">{{ isRevenue ? "响应数" : "激活数" }}</div>
                <!-- 进度条：未选择平台时显示占比 -->
                <div
                  v-if="platformStats.length > 0 && !cardSelection.selectedPlatform"
                  class="stat-progress"
                >
                  <div
                    v-for="(platform, index) in platformStats"
                    :key="index"
                    class="progress-item"
                  >
                    <el-progress
                      :percentage="platform.installsPercent"
                      :stroke-width="6"
                      :show-text="false"
                      :color="getPlatformColor(index)"
                    />
                    <span class="progress-text">
                      {{ platform.platformName }} {{ platform.installsPercent.toFixed(1) }}%
                    </span>
                  </div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ totalData.ctr }}</div>
                <div class="stat-label">CTR</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ totalData.cvr }}</div>
                <div class="stat-label">CVR</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  tableData: {
    type: Array,
    default: () => [],
  },
  platformData: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  viewMode: {
    type: String,
    default: "",
  },
  dateRange: {
    type: Array,
    default: () => [],
  },
  cardSelection: {
    type: Object,
    default: () => ({}),
  },
  pageType: {
    type: String,
    default: "cost",
  },
});

const isRevenue = computed(() => props.pageType === "revenue");

const displayInfo = computed(() => {
  const { selectionMode, selectedGame, selectedGameName, selectedPlatform, selectedPlatformName } =
    props.cardSelection;

  // 同时选中游戏和平台（不论方向）
  if (selectedGame && selectedPlatform) {
    return {
      title: "数据汇总",
      tag: "全部",
      meta: [
        { label: "游戏", value: selectedGameName },
        { label: "平台", value: selectedPlatformName },
        { label: "包名", value: props.tableData[0]?.packageName || "-" },
      ],
    };
  }

  // 游戏-平台方向，选中游戏
  if (selectionMode === "game-platform" && selectedGame) {
    return {
      title: selectedGameName || "数据汇总",
      tag: "游戏",
      meta: [{ label: "游戏", value: selectedGameName }],
    };
  }

  // 平台-游戏方向，选中平台（未选游戏）
  if (selectionMode === "platform-game" && selectedPlatform) {
    return {
      title: selectedPlatformName || "数据汇总",
      tag: "平台",
      meta: [{ label: "平台", value: selectedPlatformName }],
    };
  }

  // 默认情况
  return {
    title: "数据汇总",
    tag: "全部",
    meta: [],
  };
});

const totalData = computed(() => {
  if (!props.tableData || props.tableData.length === 0) {
    return {
      spend: 0,
      impressions: 0,
      clicks: 0,
      installs: 0,
      ctr: "0.00%",
      cvr: "0.00%",
    };
  }

  const isRev = isRevenue.value;
  let totalSpend = 0;
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalInstalls = 0;

  props.tableData.forEach((item) => {
    totalSpend += isRev ? item.revenue || item.estimated_revenue || 0 : item.spend || 0;
    totalImpressions += item.impressions || 0;
    totalClicks += item.clicks || 0;
    totalInstalls += isRev ? item.requests || 0 : item.installs || 0;
  });

  const ctr =
    totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) + "%" : "0.00%";
  const cvr = totalClicks > 0 ? ((totalInstalls / totalClicks) * 100).toFixed(2) + "%" : "0.00%";

  return {
    spend: totalSpend,
    impressions: totalImpressions,
    clicks: totalClicks,
    installs: totalInstalls,
    ctr,
    cvr,
  };
});

// 按平台统计数据（用于进度条）
const platformStats = computed(() => {
  if (!props.platformData || props.platformData.length === 0) {
    return [];
  }

  const isRev = isRevenue.value;
  const statsMap = {};

  // 遍历单独获取的平台分解数据
  props.platformData.forEach((item) => {
    const platformId = item.platform || item.platform_id;
    const name = item.platformName || item.platform_name || platformId || "未知平台";

    if (name && platformId) {
      if (!statsMap[name]) {
        statsMap[name] = {
          platformName: name,
          spend: 0,
          impressions: 0,
          clicks: 0,
          installs: 0,
        };
      }
      statsMap[name].spend += isRev ? item.revenue || item.estimated_revenue || 0 : item.spend || 0;
      statsMap[name].impressions += item.impressions || 0;
      statsMap[name].clicks += item.clicks || 0;
      statsMap[name].installs += isRev ? item.requests || 0 : item.installs || 0;
    }
  });

  // 转换为数组并计算百分比
  const platforms = Object.values(statsMap);
  const totalStats = platforms.reduce(
    (acc, p) => {
      acc.spend += p.spend;
      acc.impressions += p.impressions;
      acc.clicks += p.clicks;
      acc.installs += p.installs;
      return acc;
    },
    { spend: 0, impressions: 0, clicks: 0, installs: 0 }
  );

  // 计算占比
  platforms.forEach((p) => {
    p.spendPercent = totalStats.spend > 0 ? (p.spend / totalStats.spend) * 100 : 0;
    p.impressionsPercent =
      totalStats.impressions > 0 ? (p.impressions / totalStats.impressions) * 100 : 0;
    p.clicksPercent = totalStats.clicks > 0 ? (p.clicks / totalStats.clicks) * 100 : 0;
    p.installsPercent = totalStats.installs > 0 ? (p.installs / totalStats.installs) * 100 : 0;
  });

  // 按花费排序（从高到低）
  platforms.sort((a, b) => b.spend - a.spend);

  return platforms;
});

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

const platformColors = ["#409EFF", "#67C23A", "#E6A23C", "#F56C6C", "#909399"];

const getPlatformColor = (index) => {
  return platformColors[index % platformColors.length];
};

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

const formatDateRange = (dateRange) => {
  if (!dateRange || !Array.isArray(dateRange) || dateRange.length !== 2) return "-";
  return `${dateRange[0]} 至 ${dateRange[1]}`;
};
</script>

<style lang="scss" scoped>
.card-mode-data {
  .metrics-selector {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 16px 20px;
    margin-bottom: 16px;
    background: var(--el-bg-color-overlay);
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

    .metrics-label {
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .el-checkbox-button {
      margin-right: 8px;
    }
  }
}

.detail-container {
  min-height: 100%;
  margin-bottom: 10px;
}

.detail-loading,
.detail-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: var(--el-text-color-secondary);
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-card {
  padding: 20px;
  background: var(--el-bg-color-overlay);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.25s ease;

  &:hover {
    box-shadow: 0 4px 20px rgba(64, 128, 255, 0.12);
    transform: translateY(-2px);
  }

  &.total-card {
    background: linear-gradient(
      135deg,
      var(--el-color-primary-light-9) 0%,
      var(--el-bg-color-overlay) 100%
    );
    border: 2px solid var(--el-color-primary-light-5);

    .detail-header {
      border-bottom-color: var(--el-color-primary-light-3);
    }

    .detail-title {
      color: var(--el-color-primary);
    }
  }
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  .detail-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.detail-meta {
  display: flex;
  gap: 24px;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;

  .meta-item {
    display: flex;
    align-items: center;
    font-size: 14px;

    .meta-label {
      margin-right: 4px;
      color: var(--el-text-color-secondary);
    }

    .meta-value {
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
  }
}

.detail-content {
  .detail-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .detail-label {
      min-width: 60px;
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }

    .detail-value {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: var(--el-text-color-primary);
    }
  }
}

.detail-stats {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);

  .stat-item {
    text-align: center;

    .stat-value {
      margin-bottom: 4px;
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);

      &.spend {
        color: var(--el-color-danger);
      }

      &.revenue {
        color: var(--el-color-success);
      }
    }

    .stat-label {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    .stat-progress {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 8px;

      .progress-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .el-progress {
          flex: 1;
        }
      }

      .progress-text {
        font-size: 10px;
        color: var(--el-text-color-secondary);
        white-space: nowrap;
      }
    }
  }
}
</style>
