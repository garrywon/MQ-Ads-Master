<template>
  <div class="card-mode-container">
    <!-- 步骤指示器 -->
    <div class="step-indicator">
      <el-steps :active="cardSelection.currentStep - 1" finish-status="success">
        <el-step title="选择渠道" />
        <el-step title="选择方向" />
        <el-step
          :title="cardSelection.selectionMode === 'game-platform' ? '选择游戏' : '选择广告平台'"
        />
        <el-step
          :title="cardSelection.selectionMode === 'game-platform' ? '选择广告平台' : '选择游戏'"
        />
      </el-steps>
    </div>

    <!-- 步骤操作按钮 -->
    <div class="step-actions-top">
      <el-button @click="emit('exit')">
        <el-icon><ArrowLeft /></el-icon>
        退出
      </el-button>
      <el-button v-if="cardSelection.currentStep > 1" @click="emit('prevStep')">
        <el-icon><ArrowLeft /></el-icon>
        上一步
      </el-button>
      <el-button
        v-if="cardSelection.currentStep < 4"
        type="primary"
        :disabled="!canGoNext"
        @click="emit('nextStep')"
      >
        下一步
        <el-icon><ArrowRight /></el-icon>
      </el-button>
      <el-button
        v-if="cardSelection.currentStep === 4"
        type="primary"
        :loading="loading"
        @click="emit('confirmQuery')"
      >
        <el-icon><Search /></el-icon>
        查询数据
      </el-button>
    </div>

    <!-- 步骤内容 -->
    <div class="step-content">
      <div class="selection-container">
        <!-- 左侧：卡片选择区域 -->
        <div class="selection-left">
          <!-- 步骤1：渠道选择 -->
          <div v-show="cardSelection.currentStep === 1" class="step-panel">
            <div class="step-title">请选择渠道</div>
            <div v-if="stepLoading" class="step-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
              加载中...
            </div>
            <div v-else-if="stepData.channels.length === 0" class="empty-tip">暂无可用渠道</div>
            <div v-else class="card-grid">
              <div
                v-for="channel in stepData.channels"
                :key="channel.value"
                class="selection-card"
                :class="{ active: cardSelection.selectedChannel === channel.value }"
                @click="emit('selectChannel', channel)"
              >
                <div class="card-icon">
                  <el-icon><Connection /></el-icon>
                </div>
                <div class="card-name">{{ channel.label }}</div>
              </div>
            </div>
          </div>

          <!-- 步骤2：选择方向 -->
          <div v-show="cardSelection.currentStep === 2" class="step-panel">
            <div class="step-title">请选择查询方向</div>
            <div class="mode-selection">
              <div
                class="mode-card"
                :class="{ active: cardSelection.selectionMode === 'game-platform' }"
                @click="emit('update:selectionMode', 'game-platform')"
              >
                <div class="mode-icon">
                  <el-icon><Trophy /></el-icon>
                </div>
                <div class="mode-content">
                  <div class="mode-title">游戏 → 广告平台</div>
                  <div class="mode-desc">选择游戏，查看该游戏有数据的所有广告平台</div>
                </div>
              </div>
              <div
                class="mode-card"
                :class="{ active: cardSelection.selectionMode === 'platform-game' }"
                @click="emit('update:selectionMode', 'platform-game')"
              >
                <div class="mode-icon">
                  <el-icon><Monitor /></el-icon>
                </div>
                <div class="mode-content">
                  <div class="mode-title">广告平台 → 游戏</div>
                  <div class="mode-desc">选择广告平台，查看该平台有数据的所有游戏</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 步骤3：第一级选择（游戏或广告平台） -->
          <div v-show="cardSelection.currentStep === 3" class="step-panel">
            <div class="step-title">
              {{
                cardSelection.selectionMode === "game-platform" ? "请选择游戏" : "请选择广告平台"
              }}
            </div>
            <!-- 搜索框 -->
            <div class="search-box" style="margin-bottom: 16px">
              <el-input
                v-model="searchQuery"
                placeholder="搜索..."
                clearable
                :prefix-icon="Search"
              />
            </div>
            <div v-if="stepLoading" class="step-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
              加载中...
            </div>
            <div v-else-if="filteredFirstLevelItems.length === 0" class="empty-tip">
              暂无可用{{ cardSelection.selectionMode === "game-platform" ? "游戏" : "广告平台" }}
            </div>
            <div v-else class="card-grid">
              <div
                v-for="item in filteredFirstLevelItems"
                :key="item.value"
                class="selection-card"
                :class="{
                  active:
                    (cardSelection.selectionMode === 'game-platform'
                      ? cardSelection.selectedGame
                      : cardSelection.selectedPlatform) === item.value,
                }"
                @click="emit('selectFirstLevel', item)"
              >
                <div class="card-icon">
                  <el-icon>
                    <component
                      :is="cardSelection.selectionMode === 'game-platform' ? 'Trophy' : 'Monitor'"
                    />
                  </el-icon>
                </div>
                <el-tooltip
                  :content="item.label"
                  placement="top"
                  :disabled="!shouldShowTooltip(item.label)"
                >
                  <div class="card-name">{{ item.label }}</div>
                </el-tooltip>
              </div>
            </div>
          </div>

          <!-- 步骤4：第二级选择（广告平台或游戏） -->
          <div v-show="cardSelection.currentStep === 4" class="step-panel">
            <div class="step-title">
              {{
                cardSelection.selectionMode === "game-platform" ? "请选择广告平台" : "请选择游戏"
              }}
            </div>
            <!-- 搜索框 -->
            <div class="search-box" style="margin-bottom: 16px">
              <el-input
                v-model="searchQuery"
                placeholder="搜索..."
                clearable
                :prefix-icon="Search"
              />
            </div>
            <div v-if="stepLoading" class="step-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
              加载中...
            </div>
            <div v-else-if="filteredSecondLevelItems.length === 0" class="empty-tip">
              暂无可用{{ cardSelection.selectionMode === "game-platform" ? "广告平台" : "游戏" }}
            </div>
            <div v-else class="card-grid">
              <div
                v-for="item in filteredSecondLevelItems"
                :key="item.value"
                class="selection-card"
                :class="{
                  active:
                    (cardSelection.selectionMode === 'game-platform'
                      ? cardSelection.selectedPlatform
                      : cardSelection.selectedGame) === item.value,
                }"
                @click="emit('selectSecondLevel', item)"
              >
                <div class="card-icon">
                  <el-icon>
                    <component
                      :is="cardSelection.selectionMode === 'game-platform' ? 'Monitor' : 'Trophy'"
                    />
                  </el-icon>
                </div>
                <el-tooltip
                  :content="item.label"
                  placement="top"
                  :disabled="!shouldShowTooltip(item.label)"
                >
                  <div class="card-name">{{ item.label }}</div>
                </el-tooltip>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：已选择信息 -->
        <div class="selection-right">
          <div class="selection-summary">
            <div class="summary-title">已选择信息</div>

            <!-- 日期范围 -->
            <div class="summary-item">
              <span class="label">日期：</span>
              <el-tag>{{ cardSelection.past7Days || "过去7日" }}</el-tag>
            </div>

            <!-- 已选渠道 -->
            <div class="summary-item">
              <span class="label">渠道：</span>
              <el-tag type="primary">{{ cardSelection.selectedChannelName || "待选择" }}</el-tag>
            </div>

            <!-- 已选游戏 -->
            <div class="summary-item">
              <span class="label">游戏：</span>
              <el-tag type="warning">{{ cardSelection.selectedGameName || "全部" }}</el-tag>
            </div>

            <!-- 已选平台 -->
            <div class="summary-item">
              <span class="label">平台：</span>
              <el-tag type="success">{{ cardSelection.selectedPlatformName || "全部" }}</el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  Trophy,
  Monitor,
  Loading,
  ArrowLeft,
  ArrowRight,
  Connection,
  Search,
} from "@element-plus/icons-vue";

const props = defineProps({
  cardSelection: {
    type: Object,
    required: true,
  },
  stepData: {
    type: Object,
    required: true,
  },
  stepLoading: {
    type: Boolean,
    default: false,
  },
  canGoNext: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "exit",
  "prevStep",
  "nextStep",
  "confirmQuery",
  "update:selectionMode",
  "selectChannel",
  "selectFirstLevel",
  "selectSecondLevel",
]);

// 搜索状态（用于步骤3和步骤4）
const searchQuery = ref("");

// 步骤3的过滤列表（第一级选择）
const filteredFirstLevelItems = computed(() => {
  if (!searchQuery.value) {
    return props.cardSelection.selectionMode === "game-platform"
      ? props.stepData.games
      : props.stepData.platforms;
  }
  const query = searchQuery.value.toLowerCase();
  const items =
    props.cardSelection.selectionMode === "game-platform"
      ? props.stepData.games
      : props.stepData.platforms;
  return items.filter((item) => item.label.toLowerCase().includes(query));
});

// 步骤4的过滤列表（第二级选择）
const filteredSecondLevelItems = computed(() => {
  if (!searchQuery.value) {
    return props.cardSelection.selectionMode === "game-platform"
      ? props.stepData.platforms
      : props.stepData.games;
  }
  const query = searchQuery.value.toLowerCase();
  const items =
    props.cardSelection.selectionMode === "game-platform"
      ? props.stepData.platforms
      : props.stepData.games;
  return items.filter((item) => item.label.toLowerCase().includes(query));
});

// 判断是否需要显示tooltip（文本过长时）
const shouldShowTooltip = (text) => {
  if (!text) return false;
  return text.length > 20; // 超过20个字符显示tooltip
};
</script>

<style scoped>
.card-mode-container {
  padding: 20px;
}

.step-indicator {
  margin-bottom: 20px;
}

.step-actions-top {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.step-content {
  min-height: 400px;
}

.selection-container {
  display: flex;
  gap: 20px;
}

.selection-left {
  flex: 1;
}

.selection-right {
  flex-shrink: 0;
  width: 280px;
}

.step-panel {
  padding: 20px;
  background: var(--el-bg-color-overlay);
  border-radius: 8px;
}

.step-title {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.step-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #909399;
}

.empty-tip {
  padding: 40px;
  color: #909399;
  text-align: center;
}

.mode-selection {
  display: flex;
  gap: 20px;
}

.mode-card {
  display: flex;
  flex: 1;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  border: 2px solid #dcdfe6;
  border-radius: 8px;
  transition: all 0.3s;
}

.mode-card:hover {
  border-color: #409eff;
}

.mode-card.active {
  background: #ecf5ff;
  border-color: #409eff;
}

.mode-icon {
  margin-right: 16px;
  font-size: 40px;
  color: #409eff;
}

.mode-content {
  flex: 1;
}

.mode-title {
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.mode-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.selection-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  padding: 24px 16px;
  overflow: hidden;
  cursor: pointer;
  background: var(--el-bg-color-page);
  border: 2px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    position: absolute;
    top: 96%;
    right: 0;
    left: 0;
    height: 6px;
    content: "";
    background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-success));
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
    box-shadow: 0 8px 25px rgba(64, 128, 255, 0.15);
    transform: translateY(-30px) scale(1.02);

    &::before {
      transform: scaleX(1);
    }

    .card-icon {
      color: var(--el-color-primary);
      transform: scale(1.1);
    }
  }

  &.active {
    background: linear-gradient(
      135deg,
      var(--el-color-primary-light-8) 0%,
      var(--el-color-primary-light-10) 100%
    );
    border-color: var(--el-color-primary);
    box-shadow: 0 4px 20px rgba(64, 128, 255, 0.25);

    &::before {
      background: var(--el-color-primary);
      transform: scaleX(1);
    }

    .card-icon {
      color: var(--el-color-primary);
    }

    &:hover {
      transform: translateY(-4px) scale(1.02);
    }
  }
}

.card-icon {
  margin-bottom: 12px;
  font-size: 36px;
  color: var(--el-color-primary);
  transition: all 0.3s ease;
}

.card-name {
  width: 100%;
  font-size: 14px;
  line-height: 1.4;
  color: var(--el-text-color-primary);
  text-align: center;
  overflow-wrap: break-word;
  white-space: normal;
}

.search-box {
  margin-bottom: 16px;

  :deep(.el-input__wrapper) {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(64, 128, 255, 0.08);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(64, 128, 255, 0.15);
    }

    &.is-focus {
      box-shadow: 0 4px 16px rgba(64, 128, 255, 0.25);
    }
  }
}

.confirm-summary {
  padding: 20px;
}

.summary-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.summary-item .label {
  width: 100px;
  color: var(--el-text-color-regular);
}

.selection-summary {
  padding: 20px;
  background: var(--el-bg-color-overlay);
  border-radius: 8px;
}

.summary-title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}
</style>
