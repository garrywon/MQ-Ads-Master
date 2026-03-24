<template>
  <div class="channel-ranking">
    <div class="ranking-header">
      <div class="ranking-title">
        <el-icon><DataAnalysis /></el-icon>
        <span>渠道排行</span>
      </div>
      <div class="header-controls">
        <el-radio-group v-model="dataType" size="small" @change="handleDataTypeChange">
          <el-radio-button value="spend">投放花费</el-radio-button>
          <el-radio-button value="revenue">变现收入</el-radio-button>
          <el-radio-button value="profit">利润</el-radio-button>
        </el-radio-group>
        <el-date-picker
          v-model="selectedDate"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :shortcuts="dateShortcuts"
          size="small"
          style="width: 260px"
          @change="handleDateChange"
        />
      </div>
    </div>

    <Transition name="fade" mode="out-in">
      <div v-if="loading" key="loading" class="podium-loading">
        <div class="loading-bar rank-1">
          <div class="loading-medal" />
          <div class="loading-content" />
        </div>
        <div class="loading-bar rank-2">
          <div class="loading-medal" />
          <div class="loading-content" />
        </div>
        <div class="loading-bar rank-3">
          <div class="loading-medal" />
          <div class="loading-content" />
        </div>
      </div>

      <div v-else key="content" class="ranking-content">
        <div class="podium">
          <div
            v-for="item in podiumData"
            :key="item.rank"
            class="podium-col"
            :class="`rank-${item.rank}`"
            @click="goToAnalytics(item)"
          >
            <span class="channel-name-top">{{ item.channelName }}</span>
            <div class="podium-item">
              <span class="podium-value">{{ formatMoney(item[dataType]) }}</span>
              <div class="medal-badge">
                <span class="medal-icon">{{ getMedalEmoji(item.rank) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="restList.length > 0" class="ranking-list">
          <div class="list-header">
            <span class="col-rank">排名</span>
            <span class="col-channel">渠道</span>
            <span class="col-spend">
              {{ dataType === "spend" ? "投放花费" : dataType === "revenue" ? "变现收入" : "利润" }}
            </span>
          </div>
          <el-scrollbar height="300px">
            <div
              v-for="item in restList"
              :key="item.rank"
              class="ranking-item"
              @click="goToAnalytics(item)"
            >
              <span class="item-rank">
                <span class="rank-number">{{ item.rank }}</span>
              </span>
              <span class="item-channel">{{ item.channelName }}</span>
              <span class="item-spend">{{ formatMoney(item[dataType]) }}</span>
            </div>
          </el-scrollbar>
        </div>
        <div v-else class="ranking-list-empty">
          <span class="empty-text">暂无其他排名数据</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { DataAnalysis } from "@element-plus/icons-vue";
import AnalysisAPI from "@/api/analysis";

const router = useRouter();
const selectedDate = ref([]);
const loading = ref(false);
const rankingData = ref([]);
const dataType = ref("spend");

const dateShortcuts = [
  {
    text: "今日",
    value: () => {
      const today = new Date();
      return [today, today];
    },
  },
  {
    text: "昨日",
    value: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return [yesterday, yesterday];
    },
  },
  {
    text: "近7天",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      return [start, end];
    },
  },
];

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const initDefaultDate = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  selectedDate.value = [formatDate(yesterday), formatDate(yesterday)];
};

const getMedalEmoji = (rank) => {
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
  return medals[rank] || rank;
};

const formatMoney = (value) => {
  if (!value && value !== 0) return "--";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const top3 = computed(() => {
  return rankingData.value.filter((item) => item.rank <= 3);
});

const restList = computed(() => {
  return rankingData.value.filter((item) => item.rank > 3);
});

const podiumData = computed(() => {
  const data = [];
  for (let i = 1; i <= 3; i++) {
    const item = rankingData.value.find((r) => r.rank === i);
    if (item) {
      data.push(item);
    } else {
      data.push({ rank: i, channelName: "-", spend: null });
    }
  }
  return data;
});

const fetchRankingData = async () => {
  if (!selectedDate.value || selectedDate.value.length !== 2) {
    return;
  }

  loading.value = true;

  try {
    const apiParams = {
      date_range: {
        start: selectedDate.value[0],
        end: selectedDate.value[1],
      },
      group_by: ["report_date", "channel_id"],
      page: 1,
      size: 100,
    };

    const response = await AnalysisAPI.queryROI(apiParams);
    const rawData = response.details || [];

    const channelDataMap = new Map();

    rawData.forEach((item) => {
      const channelId = item.channel_id;
      const channelName = item.channel_name || "未知渠道";
      const spend = item.spend || 0;
      const revenue = item.mon_estimated_revenue || 0;
      const profit = revenue - spend;

      if (channelDataMap.has(channelName)) {
        channelDataMap.get(channelName).spend += spend;
        channelDataMap.get(channelName).revenue += revenue;
        channelDataMap.get(channelName).profit += profit;
      } else {
        channelDataMap.set(channelName, {
          channelId,
          channelName,
          spend,
          revenue,
          profit,
        });
      }
    });

    const sortedData = Array.from(channelDataMap.values())
      .sort((a, b) => b[dataType.value] - a[dataType.value])
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

    rankingData.value = sortedData;
  } catch (error) {
    console.error("获取排行榜数据失败:", error);
    ElMessage.error("获取排行榜数据失败");
    rankingData.value = [];
  } finally {
    loading.value = false;
  }
};

const handleDateChange = () => {
  fetchRankingData();
};

const handleDataTypeChange = () => {
  fetchRankingData();
};

const goToAnalytics = (item) => {
  router.push({
    path: "/analytics/all-analytics",
    query: {
      start: selectedDate.value[0],
      end: selectedDate.value[1],
      channelIds: item.channelId,
    },
  });
};

onMounted(() => {
  initDefaultDate();
  fetchRankingData();
});
</script>

<style lang="scss" scoped>
.channel-ranking {
  width: 100%;

  .ranking-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    .ranking-title {
      display: flex;
      gap: 8px;
      align-items: center;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);

      .el-icon {
        font-size: 20px;
        color: var(--el-color-primary);
      }
    }

    .header-controls {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }

  .ranking-skeleton {
    padding: 20px 0;
  }

  .ranking-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.25s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .ranking-content {
    display: flex;
    gap: 20px;

    .podium {
      display: flex;
      flex: 1;
      gap: 12px;
      align-items: flex-end;
      justify-content: center;
      padding: 20px;
      min-width: 350px;
      min-height: 320px;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-radius: 12px;

      .podium-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        min-width: 100px;
        max-width: 180px;
        cursor: pointer;

        .channel-name-top {
          margin-bottom: 12px;
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .podium-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          width: 100%;
          padding: 16px 12px;
          background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
          border-radius: 12px 12px 8px 8px;
          transform-style: preserve-3d;
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;

          .podium-value {
            margin-bottom: 12px;
            font-size: 18px;
            font-weight: 700;
            color: var(--el-color-primary);
          }

          .medal-badge {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            min-width: 48px;
            min-height: 48px;
            flex-shrink: 0;
            background: var(--el-color-primary-light-9);
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

            .medal-icon {
              font-size: 28px;
              line-height: 1;
            }
          }
        }

        &:hover .podium-item {
          transform: translateY(-5px) scale(1.02);
        }

        &.rank-1 {
          order: 2;

          .channel-name-top {
            color: #d97706;
          }

          .podium-item {
            height: 280px;
            background: linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%);
            box-shadow:
              0 20px 40px rgba(245, 158, 11, 0.2),
              inset 0 2px 0 rgba(255, 255, 255, 0.8);
            transform: perspective(1000px) rotateX(5deg);

            .podium-value {
              font-size: 20px;
              color: #d97706;
            }

            .medal-badge {
              width: 56px;
              height: 56px;
              min-width: 56px;
              min-height: 56px;
              background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
              box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);

              .medal-icon {
                font-size: 32px;
              }
            }
          }
        }

        &.rank-2 {
          order: 1;

          .channel-name-top {
            color: #64748b;
          }

          .podium-item {
            height: 220px;
            background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
            box-shadow:
              0 15px 30px rgba(0, 0, 0, 0.1),
              inset 0 2px 0 rgba(255, 255, 255, 0.8);
            transform: perspective(1000px) rotateX(5deg);

            .podium-value {
              font-size: 19px;
            }

            .medal-badge {
              width: 52px;
              height: 52px;
              min-width: 52px;
              min-height: 52px;
              background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
              box-shadow: 0 4px 12px rgba(148, 163, 184, 0.4);

              .medal-icon {
                font-size: 28px;
              }
            }
          }
        }

        &.rank-3 {
          order: 3;

          .channel-name-top {
            color: #ea580c;
          }

          .podium-item {
            height: 170px;
            background: linear-gradient(180deg, #fef2f2 0%, #fecaca 100%);
            box-shadow:
              0 10px 25px rgba(220, 38, 38, 0.15),
              inset 0 2px 0 rgba(255, 255, 255, 0.8);
            transform: perspective(1000px) rotateX(5deg);

            .podium-value {
              font-size: 19px;
              color: #dc2626;
            }

            .medal-badge {
              width: 48px;
              height: 48px;
              min-width: 48px;
              min-height: 48px;
              background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
              box-shadow: 0 4px 12px rgba(234, 88, 12, 0.4);

              .medal-icon {
                font-size: 24px;
              }
            }
          }
        }
      }
    }

    .podium-loading {
      flex: 1;
      display: flex;
      gap: 12px;
      align-items: flex-end;
      justify-content: center;
      padding: 20px;
      min-width: 300px;
      min-height: 320px;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-radius: 12px;

      .loading-bar {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        flex: 1;
        max-width: 180px;
        padding: 16px 12px;
        background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
        border-radius: 12px 12px 8px 8px;
        transform-style: preserve-3d;
        transform: perspective(1000px) rotateX(5deg);

        .loading-medal {
          width: 48px;
          height: 48px;
          min-width: 48px;
          min-height: 48px;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
          border-radius: 50%;
          animation: loadingPulse 1.5s ease-in-out infinite;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;

          &::after {
            content: "";
            width: 60px;
            height: 16px;
            background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
            background-size: 200% 100%;
            border-radius: 4px;
            animation: shimmer 1.5s ease-in-out infinite;
          }
        }

        &.rank-1 {
          order: 2;
          height: 220px;
          animation: growUp 1s ease-out forwards;
          animation-delay: 0s;

          .loading-medal {
            animation-delay: 0.1s;
          }
        }

        &.rank-2 {
          order: 1;
          height: 180px;
          animation: growUp 1s ease-out forwards;
          animation-delay: 0.15s;

          .loading-medal {
            animation-delay: 0.25s;
          }
        }

        &.rank-3 {
          order: 3;
          height: 140px;
          animation: growUp 1s ease-out forwards;
          animation-delay: 0.3s;

          .loading-medal {
            animation-delay: 0.4s;
          }
        }
      }
    }

    @keyframes growUp {
      from {
        transform: perspective(1000px) rotateX(5deg) scaleY(0);
        opacity: 0;
      }
      to {
        transform: perspective(1000px) rotateX(5deg) scaleY(1);
        opacity: 1;
      }
    }

    @keyframes loadingPulse {
      0%,
      100% {
        opacity: 0.5;
        transform: scale(0.95);
      }
      50% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    .ranking-list {
      flex: 1;
      min-width: 280px;
      min-height: 320px;
      padding: 16px;
      background: var(--el-fill-color-light);
      border-radius: 12px;

      .list-header {
        display: flex;
        align-items: center;
        padding: 0 12px 12px 12px;
        font-size: 13px;
        font-weight: 600;
        color: var(--el-text-color-secondary);
        border-bottom: 1px solid var(--el-border-color-lighter);

        .col-rank {
          width: 60px;
        }

        .col-channel {
          flex: 1;
        }

        .col-spend {
          width: 120px;
          text-align: right;
        }
      }

      .ranking-item {
        display: flex;
        align-items: center;
        padding: 12px;
        margin-top: 8px;
        background: var(--el-bg-color);
        border-radius: 8px;
        transition: all 0.2s;
        width: 95%;
        cursor: pointer;

        &:hover {
          background: var(--el-color-primary-light-9);
          transform: translateX(4px);
        }

        .item-rank {
          width: 60px;

          .rank-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            font-size: 13px;
            font-weight: 600;
            color: var(--el-text-color-secondary);
            background: var(--el-fill-color-light);
            border-radius: 6px;
          }
        }

        .item-channel {
          flex: 1;
          text-overflow: ellipsis;
          font-size: 14px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          white-space: nowrap;
        }

        .item-spend {
          width: 120px;
          font-size: 14px;
          font-weight: 600;
          color: var(--el-color-primary);
          text-align: right;
        }
      }
    }

    .ranking-list-empty {
      flex: 1;
      min-width: 280px;
      min-height: 320px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: var(--el-fill-color-light);
      border-radius: 12px;

      .empty-text {
        color: var(--el-text-color-secondary);
        font-size: 14px;
      }
    }
  }

  @media (max-width: 768px) {
    .ranking-content {
      flex-direction: column;

      .podium {
        min-width: 320px;
        padding: 16px;
        min-height: 280px;
        gap: 8px;

        .podium-col {
          min-width: 100px;

          .channel-name-top {
            font-size: 12px;
          }

          .podium-item {
            .podium-value {
              font-size: 14px;
            }
          }

          &.rank-1 .podium-item {
            height: 180px;

            .podium-value {
              font-size: 18px;
            }
          }

          &.rank-2 .podium-item {
            height: 140px;

            .podium-value {
              font-size: 16px;
            }
          }

          &.rank-3 .podium-item {
            height: 100px;

            .podium-value {
              font-size: 14px;
            }
          }
        }
      }

      .ranking-list,
      .ranking-list-empty {
        min-width: unset;
        min-height: 250px;
      }

      .podium-loading {
        flex-direction: column;
        min-width: unset;
        padding: 16px;
        min-height: 280px;
        gap: 8px;

        .loading-bar {
          max-width: 100px;

          &.rank-1 {
            height: 180px;
          }

          &.rank-2 {
            height: 140px;
          }

          &.rank-3 {
            height: 100px;
          }
        }
      }
    }
  }
}

html.dark {
  .channel-ranking {
    .podium {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);

      .podium-col {
        .channel-name-top {
          color: #f1f5f9;
        }

        .podium-item {
          background: linear-gradient(180deg, #334155 0%, #1e293b 100%);

          .podium-value {
            color: #60a5fa;
          }

          .medal-badge {
            background: var(--el-color-primary-light-9);
          }
        }

        &.rank-1 {
          .podium-item {
            background: linear-gradient(180deg, #422006 0%, #291a05 100%);

            .podium-value {
              color: #fbbf24;
            }
          }
        }

        &.rank-2 {
          .podium-item {
            background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
          }
        }

        &.rank-3 {
          .podium-item {
            background: linear-gradient(180deg, #450a0a 0%, #2d1010 100%);

            .podium-value {
              color: #fb923c;
            }
          }
        }
      }
    }

    .ranking-list {
      background: #1e293b;

      .list-header {
        color: #94a3b8;
        border-color: #334155;
      }

      .ranking-item {
        background: #334155;

        &:hover {
          background: #3b5998;
        }

        .item-rank .rank-number {
          color: #cbd5e1;
          background: #475569;
        }

        .item-channel {
          color: #f1f5f9;
        }

        .item-spend {
          color: #60a5fa;
        }
      }
    }
  }
}
</style>
