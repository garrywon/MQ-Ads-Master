<template>
  <div class="app-container">
    <!-- 功能区 - 筛选模式和列表模式显示 -->
    <Transition name="view-transition">
      <div v-if="viewMode === 'filter' || viewMode === 'list'" class="function-bar">
        <div class="function-bar-title">功能区</div>
        <div class="function-bar-content">
          <!-- 筛选模式显示卡片模式按钮 -->
          <el-button v-if="viewMode === 'filter'" type="primary" @click="switchToCardMode">
            <el-icon><Grid /></el-icon>
            卡片模式
          </el-button>
          <!-- 列表模式显示返回按钮 -->
          <el-button v-if="viewMode === 'list'" type="primary" @click="switchToCardMode">
            <el-icon><Grid /></el-icon>
            重新选择
          </el-button>
          <el-button v-if="viewMode === 'list'" @click="exitToFilterMode">
            <el-icon><ArrowLeft /></el-icon>
            返回筛选模式
          </el-button>
        </div>
      </div>
    </Transition>

    <!-- 搜索区域 - 仅筛选模式显示 -->
    <Transition name="view-transition">
      <div v-if="viewMode === 'filter'" class="search-container mb-10">
        <el-form :model="searchForm" inline label-width="auto">
          <el-text
            class="function-bar-title"
            style="
              padding-right: 20px;
              margin: 0px;
              border-right: 1px solid var(--el-border-color-lighter);
            "
          >
            筛选区
          </el-text>
          <el-form-item>
            <el-date-picker
              v-model="searchForm.date"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 255px"
              :shortcuts="dateShortcuts"
              @change="handleQueryClick"
            />
          </el-form-item>
          <el-form-item label="平台">
            <el-select
              v-model="searchForm.platforms"
              placeholder="请选择平台"
              clearable
              multiple
              collapse-tags
              collapse-tags-tooltip
              style="width: 180px"
              @change="handleQueryClick"
            >
              <el-option
                v-for="item in platformOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="渠道">
            <el-select
              v-model="searchForm.channelIds"
              placeholder="请选择渠道"
              clearable
              multiple
              collapse-tags
              collapse-tags-tooltip
              style="width: 180px"
              @change="handleQueryClick"
            >
              <el-option
                v-for="item in channelOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="游戏">
            <el-select
              v-model="searchForm.gameIds"
              placeholder="请选择游戏"
              clearable
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              style="width: 180px"
              @change="handleQueryClick"
            >
              <el-option
                v-for="item in gameOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="计划名称">
            <el-select
              v-model="searchForm.campaignNames"
              placeholder="请选择计划名称"
              clearable
              multiple
              collapse-tags
              collapse-tags-tooltip
              style="width: 180px"
              @change="handleQueryClick"
            >
              <el-option
                v-for="item in campaignOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="分组">
            <el-select
              v-model="searchForm.groupBy"
              placeholder="请选择分组"
              clearable
              multiple
              collapse-tags
              collapse-tags-tooltip
              style="width: 200px"
              @change="handleGroupByChange"
            >
              <el-option
                v-for="item in groupByOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
                :disabled="isLastGroupOptionDisabled(item.value)"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="指标">
            <el-checkbox-group v-model="searchForm.metrics">
              <el-checkbox-button
                v-for="item in metricsOptions"
                :key="item.value"
                :value="item.value"
                :disabled="isLastMetricDisabled(item.value)"
              >
                {{ item.label }}
              </el-checkbox-button>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item>
            <el-button @click="handleReset">重置</el-button>
            <el-button style="margin-left: 12px" @click="showColumnSetting = true">
              <el-icon class="mr-1"><Setting /></el-icon>
              列设置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </Transition>

    <!-- 筛选模式数据表格 -->
    <Transition name="view-transition">
      <div v-if="viewMode === 'filter'" class="table-container">
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="tableData"
          v-bind="contentConfig.table"
          :row-key="contentConfig.pk"
          class="flex-1"
          :border="false"
          :highlight-current-row="false"
          height="calc(100vh - 350px)"
          show-summary
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="index" label="序号" width="60" align="center" fixed="left" />
          <template v-for="col in finalColumns" :key="col.prop">
            <el-table-column v-bind="col">
              <!-- 自定义表头：为CTR和CVR添加提示图标 -->
              <template #header>
                {{ col.label }}
              </template>

              <template #default="scope">
                <template v-if="col.prop === 'packageName'">
                  <span
                    class="copyable-text"
                    :class="{ 'text-muted': !scope.row.packageName }"
                    @click="copyText(scope.row.packageName)"
                    :style="{
                      cursor: scope.row.packageName ? 'pointer' : 'default',
                      color: scope.row.packageName ? 'var(--el-color-primary)' : '',
                    }"
                  >
                    {{ scope.row.packageName || "-" }}
                  </span>
                </template>
                <template v-else-if="col.prop === 'gameName'">
                  <span
                    class="copyable-text"
                    :class="{ 'text-muted': !scope.row.gameName }"
                    @click="copyText(scope.row.gameName)"
                    :style="{
                      cursor: scope.row.gameName ? 'pointer' : 'default',
                      color: scope.row.gameName ? 'var(--el-color-primary)' : '',
                    }"
                  >
                    {{ scope.row.gameName || "-" }}
                  </span>
                </template>
                <template v-else-if="col.slotName === 'spend'">
                  <el-text type="danger">{{ formatNumber(scope.row[col.prop]) }}</el-text>
                </template>
                <template v-else-if="col.slotName === 'platform'">
                  <el-tag :type="getPlatformTag(scope.row[col.prop])">
                    {{ scope.row[col.prop] }}
                  </el-tag>
                </template>
                <template v-else-if="col.slotName === 'channel'">
                  <el-tag :type="getChannelTag(scope.row[col.prop])">
                    {{ scope.row[col.prop] }}
                  </el-tag>
                </template>
                <template v-else>
                  <span :class="{ 'text-muted': !scope.row[col.prop] }">
                    {{ scope.row[col.prop] || "-" }}
                  </span>
                </template>
              </template>
            </el-table-column>
          </template>
          <!-- 总计行 -->
          <template #summary>
            <tr>
              <!-- 序号列：显示"总计" -->
              <td class="el-table__cell" align="center" style="width: 120px">总计</td>
              <!-- 图标列：显示"-" -->
              <td class="el-table__cell" align="center" style="width: 80px">-</td>
              <!-- 动态列：根据 finalColumns 生成 -->
              <template v-for="col in finalColumns" :key="col.prop">
                <td
                  class="el-table__cell"
                  :align="col.align || 'center'"
                  :style="{
                    width: col.width ? `${col.width}px` : undefined,
                    minWidth: col.minWidth ? `${col.minWidth}px` : undefined,
                  }"
                >
                  <span v-if="isNumericColumn(col.prop)">
                    {{ formatSummaryValue(col.prop) }}
                  </span>
                  <span v-else>-</span>
                </td>
              </template>
            </tr>
          </template>
        </el-table>

        <!-- 分页 -->
        <div v-if="showPagination" class="mt-4 flex justify-center">
          <el-pagination
            v-bind="pagination"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </Transition>

    <!-- 列设置对话框 -->
    <el-dialog
      v-model="showColumnSetting"
      title="列设置（拖拽排序）"
      width="500px"
      class="column-setting-dialog"
      :show-close="false"
    >
      <div class="column-setting-content">
        <VueDraggable v-model="cols" handle=".drag-handle" animation="200">
          <div v-for="(col, index) in cols" :key="col.prop" class="draggable-column-item">
            <span class="drag-handle" style="margin-right: 12px; color: #909399; cursor: move">
              <el-icon><Rank /></el-icon>
            </span>
            <span class="column-label">{{ col.label }}</span>
            <span class="column-index">排序: {{ index + 1 }}</span>
          </div>
        </VueDraggable>
      </div>
      <template #footer>
        <el-button @click="showColumnSetting = false">取消</el-button>
        <el-button type="primary" @click="saveColumnSetting">保存</el-button>
      </template>
    </el-dialog>

    <!-- 卡片模式/列表模式数据展示 -->
    <SelectedDataDisplay
      :table-data="tableData"
      :platform-data="platformBreakdownData"
      :loading="loading"
      :view-mode="viewMode"
      :date-range="chartDateRange"
      :card-selection="cardSelection"
    />

    <!-- 图表展示模块 -->
    <Transition name="view-transition">
      <ChartDisplay
        v-if="viewMode === 'list'"
        :table-data="tableData"
        :is-loading="loading"
        :chart-type="chartType"
        :date-range="chartDateRange"
        :card-selection="cardSelection"
        :metric="chartMetric"
        :platform-options="stepData.platforms"
        :selected-platform="cardSelection.selectedPlatform"
        :game-options="stepData.games"
        :selected-game="cardSelection.selectedGame"
        :show-platform-filter="cardSelection.showPlatformFilter"
        :show-game-filter="cardSelection.showGameFilter"
        @update:chart-type="handleChartTypeChange"
        @update:date-range="handleChartDateRangeChange"
        @update:metric="handleChartMetricChange"
        @update:selected-platform="handlePlatformChange"
        @update:selected-game="handleGameChange"
        @refresh="handleChartRefresh"
      />
    </Transition>

    <!-- 卡片选择模式 -->
    <CardSelection
      v-if="viewMode === 'card'"
      :card-selection="cardSelection"
      :step-data="stepData"
      :step-loading="stepLoading"
      :can-go-next="canGoNext"
      :loading="loading"
      @exit="exitCardMode"
      @prev-step="prevStep"
      @next-step="nextStep"
      @confirm-query="confirmCardQuery"
      @update:selection-mode="selectMode"
      @select-channel="selectChannel"
      @select-first-level="handleSelectFirstLevel"
      @select-second-level="handleSelectSecondLevel"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import Sortable from "sortablejs";
import { Rank, DocumentCopy, Setting, InfoFilled } from "@element-plus/icons-vue";
import { VueDraggable } from "vue-draggable-plus";

// 引入CopyButton组件
import CopyButton from "@/components/CopyButton/index.vue";

// 引入卡片选择组件
import CardSelection from "@/components/CardSelection/index.vue";

// 引入数据展示组件
import SelectedDataDisplay from "@/components/Cost/SelectedDataDisplay.vue";

// 引入图表展示组件
import ChartDisplay from "@/components/Cost/ChartDisplay.vue";

// 导入AnalysisAPI
import AnalysisAPI from "@/api/analysis";

// 获取路由参数
const route = useRoute();
const query = computed(() => route.query.type || "未知");

// 定义响应式引用
const tableRef = ref();

// 视图模式：'filter' 筛选模式 | 'card' 卡片选择模式
const viewMode = ref("filter");

// 卡片选择流程状态
const cardSelection = reactive({
  currentStep: 1,
  selectionMode: null,
  selectedChannel: null,
  selectedChannelName: "",
  selectedPlatform: null,
  selectedPlatformName: "",
  selectedGame: null,
  selectedGameName: "",
  past7Days: "",
  showPlatformFilter: false, // 控制平台筛选框显示
  showGameFilter: false, // 控制游戏筛选框显示
});

// 各步骤数据
const stepData = reactive({
  channels: [],
  platforms: [],
  games: [],
});

// 加载状态
const stepLoading = ref(false);

// 搜索表单
const searchForm = ref({
  date: [],
  platforms: [],
  campaignNames: [],
  channelIds: [],
  gameIds: [],
  groupBy: ["report_date", "game_id", "channel_id"],
  metrics: ["spend", "impressions", "clicks", "installs", "ctr"],
});

// 平台选项（从API动态获取）
const platformOptions = ref([]);

// 渠道选项（从API动态获取）
const channelOptions = ref([]);

// 游戏选项（从API动态获取）
const gameOptions = ref([]);

// 计划选项（从API动态获取）
const campaignOptions = ref([]);

// 图表相关状态
const chartType = ref("line");
const chartDateRange = ref([]);
const chartMetric = ref("spend");

// 分组选项
const groupByOptions = [
  { value: "report_date", label: "日期" },
  { value: "platform_id", label: "广告平台" },
  { value: "campaign_name", label: "计划名称" },
  { value: "game_id", label: "游戏" },
  { value: "channel_id", label: "渠道" },
];

// 指标选项
const metricsOptions = [
  { value: "spend", label: "花费" },
  { value: "impressions", label: "展示数" },
  { value: "clicks", label: "点击数" },
  { value: "installs", label: "激活数" },
  { value: "ctr", label: "CTR" },
  { value: "cvr", label: "CVR" },
];

// 列拖拽相关
const showColumnSetting = ref(false);
const cols = ref([
  { label: "日期", align: "center", prop: "date", width: 120, sortable: true },
  { label: "图标", align: "center", prop: "icon", width: 80, templet: "image" }, // 图标列不启用排序
  {
    label: "渠道",
    align: "center",
    prop: "channel",
    width: 120,
    slotName: "channel",
    sortable: true,
  },
  {
    label: "包名",
    align: "center",
    prop: "packageName",
    minWidth: 210,
    sortable: true,
  },
  {
    label: "游戏名称",
    align: "center",
    prop: "gameName",
    minWidth: 150,
    sortable: true,
  },
  {
    label: "广告平台",
    align: "center",
    prop: "platform",
    width: 120,
    slotName: "platform",
    sortable: true,
  },
  {
    label: "计划名称",
    align: "center",
    prop: "campaign_name",
    minWidth: 150,
    sortable: true,
  },
  {
    label: "花费",
    align: "center",
    prop: "spend",
    minWidth: 120,
    slotName: "spend",
    sortable: true,
  },
  { label: "展示数", align: "center", prop: "impressions", minWidth: 128, sortable: true },
  { label: "点击数", align: "center", prop: "clicks", minWidth: 128, sortable: true },
  { label: "激活数", align: "center", prop: "installs", minWidth: 128, sortable: true },
  { label: "CVR", align: "center", prop: "cvr", minWidth: 128, sortable: true },
  { label: "CTR", align: "center", prop: "ctr", minWidth: 128, sortable: true },
]);

// 动态计算要显示的列（基于分组选择和指标选择，保持 cols 拖拽后的顺序）
const finalColumns = computed(() => {
  const groupBy = searchForm.value.groupBy || [];
  const metrics = searchForm.value.metrics || [];
  const allCols = cols.value;

  // 构建需要显示的列的 prop 集合
  const activeProps = new Set();

  // 添加维度列（根据分组）
  groupBy.forEach((key) => {
    switch (key) {
      case "report_date":
        activeProps.add("date");
        break;
      case "platform_id":
        activeProps.add("platform");
        break;
      case "campaign_name":
        activeProps.add("campaign_name");
        break;
      case "game_id":
        activeProps.add("packageName");
        activeProps.add("gameName");
        activeProps.add("icon");
        break;
      case "channel_id":
        activeProps.add("channel");
        break;
    }
  });

  // 添加指标列（根据选择的指标）
  const metricProps = ["spend", "impressions", "clicks", "installs", "cvr", "ctr"];
  metrics.forEach((prop) => {
    if (metricProps.includes(prop)) {
      activeProps.add(prop);
    }
  });

  // 从 cols.value 中按顺序筛选出激活的列（保持用户拖拽后的顺序）
  return allCols.filter((col) => activeProps.has(col.prop));
});

// 表格数据相关
const tableData = ref([]);
const platformBreakdownData = ref([]); // 用于存储独立进度条数据的变量
const loading = ref(false);
const showPagination = ref(true);
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  pageSizes: [10, 20, 30, 50],
  total: 0,
  layout: "prev, pager, next, jumper, total, sizes",
});

// 选择项
const selectedRows = ref([]);

// 内容配置
const contentConfig = {
  table: {
    border: true,
    // 移除 highlightCurrentRow 以避免点击后持续高亮
  },
  pk: "id",
  // 删除其他配置，因为我们将使用自定义表格
};

// 平台名称相关的计算函数
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

// 渠道名称相关的计算函数（带颜色）
const getChannelTag = (channel) => {
  const tags = {
    OPPO: "success", // 绿色
    MI: "warning", // 橙色
    VIVO: "primary", // 蓝色
    Global: "danger", // 红色
  };
  return tags[channel] || "info"; // 默认灰色
};

// 动态计算CVR值的函数
const calculateCVR = (item) => {
  if (item.clicks && item.installs !== undefined && item.clicks > 0) {
    return ((item.installs / item.clicks) * 100).toFixed(2) + "%";
  }
  return "0.00%";
};

// 将API返回的CTR转换为百分数格式
const formatCTR = (item) => {
  // 如果API已经返回了CTR值，直接使用并格式化为百分数
  if (item.ctr !== undefined && item.ctr !== null) {
    // 如果已经是百分数格式，直接返回
    if (typeof item.ctr === "string" && item.ctr.includes("%")) {
      return item.ctr;
    }
    // 如果是小数，转换为百分数
    if (typeof item.ctr === "number") {
      return item.ctr.toFixed(2) + "%";
    }
    // 如果是字符串形式的数字，转换为百分数
    if (typeof item.ctr === "string" && !isNaN(parseFloat(item.ctr))) {
      return parseFloat(item.ctr).toFixed(2) + "%";
    }
  }
  // 如果没有CTR值，返回默认值
  return "0.00%";
};

// 格式化数字为千分位
const formatNumber = (num) => {
  if (num === undefined || num === null || num === "") return "-";
  const number = Number(num);
  if (isNaN(number)) return "-";
  return number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// ====== 总计行相关函数 ======

// 数值列列表（需要统计的列）
const numericColumns = ["spend", "impressions", "clicks", "installs", "ctr", "cvr"];

// 判断是否为数值列
const isNumericColumn = (prop) => {
  return numericColumns.includes(prop);
};

// 计算列的总和
const calculateColumnSum = (prop) => {
  if (!tableData.value || tableData.value.length === 0) return 0;

  return tableData.value.reduce((sum, row) => {
    const val = row[prop];
    if (val === undefined || val === null || val === "") return sum;
    // 处理字符串和数字
    let num = typeof val === "number" ? val : parseFloat(val);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);
};

// 格式化总计值显示
const formatSummaryValue = (prop) => {
  const sum = calculateColumnSum(prop);

  switch (prop) {
    case "spend":
      return formatNumber(sum);
    case "impressions":
    case "clicks":
    case "installs":
      return formatNumber(sum);
    default:
      return "-"; // 包括 ctr、cvr 在内的非数值列都返回 "-"
  }
};

// 使用真实API方法
const indexAction = async (params) => {
  try {
    console.log("Index action called with params:", params);

    // 构建API查询参数
    // 设置默认日期
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 30);
    const todayStr = today.toISOString().split("T")[0];
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const apiParams = {
      // 日期范围 (必填)
      date_range: {
        start:
          params && params.date && Array.isArray(params.date) && params.date.length >= 2
            ? params.date[0]
            : yesterdayStr,
        end:
          params && params.date && Array.isArray(params.date) && params.date.length >= 2
            ? params.date[1]
            : todayStr,
      },
      // 过滤条件 (可选)
      filters: {
        business_type: "UA",
        ...(params &&
          params.platforms &&
          params.platforms.length > 0 && { platform_ids: params.platforms }),
        ...(params &&
          params.campaignNames &&
          params.campaignNames.length > 0 && { campaign_names: params.campaignNames }),
        ...(params &&
          params.channelIds &&
          params.channelIds.length > 0 && { channel_ids: params.channelIds }),
        ...(params && params.gameIds && params.gameIds.length > 0 && { game_ids: params.gameIds }),
      },
      // 分组字段 (可选)
      group_by:
        params && params.groupBy && params.groupBy.length > 0 ? params.groupBy : ["report_date"],
      // 分页参数 (可选)
      page: params && typeof params.pageNum === "number" ? params.pageNum : 1,
      size: params && typeof params.pageSize === "number" ? params.pageSize : 10,
    };

    console.log("Calling API with params:", apiParams);

    // 调用真实API
    const response = await AnalysisAPI.queryAnalytics(apiParams);
    console.log("API response:", response);

    // 处理API响应
    let resultData = [];
    let totalCount = 0;

    if (response) {
      // API返回格式为 {total, page, size, items}
      const rawData = response.items || [];
      totalCount = response.total || rawData.length;

      // 映射API返回的字段到表格所需字段
      resultData = rawData.map((item, index) => {
        // 计算CVR值（保留自动计算）
        const calculatedCVR = calculateCVR(item);
        // 格式化API返回的CTR值为百分数
        const formattedCTR = formatCTR(item);

        return {
          // 使用自增的数字ID，而不是API返回的ID
          id: index + 1,
          // 映射API字段到表格字段
          date: item.report_date || "",
          channel: item.channel_name || "",
          packageName: item.package_name || "",
          gameName: item.game_name || "",
          // 新增字段
          platform: item.platform_id || item.platform || "",
          platformName: item.platform_name || item.platformName || item.platform || item.name || "",
          campaign_name: item.campaign_name || item.campaignName || item.campaign || "",
          spend: item.spend || 0,
          impressions: item.impressions || 0,
          clicks: item.clicks || 0,
          installs: item.installs || 0,
          // 保留计算的值
          cvr: calculatedCVR,
          // 使用格式化后的CTR值
          ctr: formattedCTR,
          // 保留原始数据以备后续使用，但不覆盖计算的字段
          ...Object.fromEntries(
            Object.entries(item).filter(
              ([key]) =>
                ![
                  "ctr",
                  "cvr",
                  "platform_id",
                  "platform_name",
                  "campaign_name",
                  "campaignName",
                  "platform",
                  "platformName",
                  "campaign",
                ].includes(key)
            )
          ),
        };
      });
    }

    console.log("Processed data count:", resultData.length);

    return {
      list: resultData,
      total: totalCount,
    };
  } catch (error) {
    console.error("Error in indexAction:", error);
    ElMessage.error("获取数据失败");
    return {
      list: [],
      total: 0,
    };
  }
};

// 方法定义
const copyText = (text) => {
  if (!text) {
    ElMessage.warning("无内容可复制");
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        ElMessage.success("复制成功");
      })
      .catch((error) => {
        ElMessage.warning("复制失败");
        console.error("[CopyText] Copy failed", error);
      });
  } else {
    // 兼容性处理
    const input = document.createElement("input");
    input.style.position = "absolute";
    input.style.left = "-9999px";
    input.setAttribute("value", text);
    document.body.appendChild(input);
    input.select();
    try {
      const successful = document.execCommand("copy");
      if (successful) {
        ElMessage.success("复制成功");
      } else {
        ElMessage.warning("复制失败");
      }
    } catch (err) {
      ElMessage.error("复制失败");
      console.error("[CopyText] Copy failed.", err);
    } finally {
      document.body.removeChild(input);
    }
  }
};

const handleQueryClick = async () => {
  // 验证：必须至少选择一个分组（兜底保护）
  if (searchForm.value.groupBy.length === 0) {
    ElMessage.warning("至少需要保留一个分组");
    searchForm.value.groupBy = ["report_date"]; // 自动恢复
    return;
  }

  console.log("handleQueryClick called");
  // 使用新的搜索表单数据
  const searchData = {
    date: searchForm.value.date,
    platforms: searchForm.value.platforms,
    channelIds: searchForm.value.channelIds,
    gameIds: searchForm.value.gameIds,
    groupBy: searchForm.value.groupBy,
  };
  console.log("Search data:", searchData);
  await loadData(searchData);
};

// 分组选择变化时的处理（防止取消最后一个分组）
const handleGroupByChange = (val) => {
  // 兜底：防止出现空数组（UI禁用应该已经阻止，但代码直接修改时仍需保护）
  if (val.length === 0) {
    ElMessage.warning("至少需要保留一个分组");
    // 恢复为默认分组
    searchForm.value.groupBy = ["report_date"];
    return;
  }
  // 正常情况，触发查询
  handleQueryClick();
};

// 判断分组选项是否应该被禁用（确保至少保留一个分组）
const isLastGroupOptionDisabled = (optionValue) => {
  const selectedCount = searchForm.value.groupBy.length;
  // 当只有一个分组被选中时，禁用该选项（防止取消最后一个）
  if (selectedCount === 1) {
    return searchForm.value.groupBy.includes(optionValue);
  }
  // 当有多个分组时，所有选项可用（可以自由取消）
  return false;
};

// 判断指标选项是否应该被禁用（确保至少保留一个指标）
const isLastMetricDisabled = (metricValue) => {
  const selectedCount = searchForm.value.metrics.length;
  // 当只有一个指标被选中时，禁用该选项（防止取消最后一个）
  if (selectedCount === 1) {
    return searchForm.value.metrics.includes(metricValue);
  }
  // 当有多个指标时，所有选项可用（可以自由取消）
  return false;
};

// 切换视图模式
const handleModeChange = (mode) => {
  if (mode === "card") {
    // 重置卡片选择数据
    cardSelection.currentStep = 1;
    cardSelection.selectionMode = null;
    cardSelection.selectedChannel = null;
    cardSelection.selectedChannelName = "";
    cardSelection.selectedPlatform = null;
    cardSelection.selectedPlatformName = "";
    cardSelection.selectedGame = null;
    cardSelection.selectedGameName = "";
    cardSelection.past7Days = "";
    // 重置图表状态
    chartType.value = "line";
    chartDateRange.value = [];
    stepData.channels = channelOptions.value;
    stepData.platforms = [];
    stepData.games = [];
  } else if (mode === "filter") {
    // 重置筛选数据
    tableData.value = [];
    pagination.total = 0;
    // 重置图表状态
    chartType.value = "line";
    chartDateRange.value = [];
  } else if (mode === "list") {
    // 保持在列表模式，不需要额外操作
  }
};

// 切换到卡片模式
const switchToCardMode = async () => {
  // 重置卡片选择数据
  cardSelection.currentStep = 1;
  cardSelection.selectionMode = null;
  cardSelection.selectedChannel = null;
  cardSelection.selectedChannelName = "";
  cardSelection.selectedPlatform = null;
  cardSelection.selectedPlatformName = "";
  cardSelection.selectedGame = null;
  cardSelection.selectedGameName = "";
  cardSelection.past7Days = "";

  // 重置图表状态
  chartType.value = "line";
  chartDateRange.value = [];

  // 初始化渠道数据（使用已加载的渠道选项）
  stepData.channels = channelOptions.value;
  stepData.platforms = [];
  stepData.games = [];

  // 切换到卡片模式
  viewMode.value = "card";
};

// 退出卡片模式
const exitCardMode = async () => {
  // 重新加载平台选项以恢复默认筛选
  await loadPlatformOptions();
  // 重新加载渠道和游戏选项
  await loadChannelOptions();
  await loadGameOptions();
  // 清空数据
  tableData.value = [];
  pagination.total = 0;
  // 重置图表状态
  chartType.value = "line";
  chartDateRange.value = [];
  // 恢复默认筛选条件
  searchForm.value.channelIds = [];
  searchForm.value.gameIds = [];
  searchForm.value.groupBy = ["report_date", "game_id", "channel_id"];
  searchForm.value.metrics = ["spend", "impressions", "clicks", "installs", "ctr"];
  searchForm.value.date = [];
  // 切换到筛选模式
  viewMode.value = "filter";
  // 手动触发查询
  handleQueryClick();
};

// 退出到筛选模式
const exitToFilterMode = async () => {
  // 重新加载平台选项以恢复默认筛选
  await loadPlatformOptions();
  // 重新加载渠道和游戏选项
  await loadChannelOptions();
  await loadGameOptions();
  // 清空数据
  tableData.value = [];
  pagination.total = 0;
  // 重置图表状态
  chartType.value = "line";
  chartDateRange.value = [];
  // 恢复默认筛选条件
  searchForm.value.channelIds = [];
  searchForm.value.gameIds = [];
  searchForm.value.groupBy = ["report_date", "game_id", "channel_id"];
  searchForm.value.metrics = ["spend", "impressions", "clicks", "installs", "ctr"];
  searchForm.value.date = [];
  // 切换到筛选模式
  viewMode.value = "filter";
  // 手动触发查询
  handleQueryClick();
};

// 选择渠道
const selectChannel = async (channel) => {
  cardSelection.selectedChannel = channel.value;
  cardSelection.selectedChannelName = channel.label;
  cardSelection.currentStep = 2;
  cardSelection.selectionMode = null;
  cardSelection.selectedGame = null;
  cardSelection.selectedGameName = "";
  cardSelection.selectedPlatform = null;
  cardSelection.selectedPlatformName = "";
  stepData.platforms = [];
  stepData.games = [];

  // 加载平台数据
  stepLoading.value = true;
  try {
    const response = await AnalysisAPI.getPlatformsByChannel("UA", channel.value);
    stepData.platforms = (response || []).map((item) => ({
      value: item.id,
      label: item.name,
      code: item.code,
    }));
  } catch (error) {
    console.error("获取平台列表失败:", error);
    ElMessage.error("获取平台列表失败");
  } finally {
    stepLoading.value = false;
  }
};

// 选择方向
const selectMode = async (mode) => {
  cardSelection.selectionMode = mode;
  // 重置选择
  cardSelection.selectedGame = null;
  cardSelection.selectedGameName = "";
  cardSelection.selectedPlatform = null;
  cardSelection.selectedPlatformName = "";
  stepData.games = [];
  stepData.platforms = [];

  // 自动跳转到下一步
  await nextStep();
};

// 处理第一级选择（根据模式调用对应函数）
const handleSelectFirstLevel = (item) => {
  if (cardSelection.selectionMode === "game-platform") {
    selectFirstLevelGame(item);
  } else {
    selectFirstLevelPlatform(item);
  }
};

// 处理第二级选择（根据模式调用对应函数）
const handleSelectSecondLevel = (item) => {
  if (cardSelection.selectionMode === "game-platform") {
    selectSecondLevelPlatform(item);
  } else {
    selectSecondLevelGame(item);
  }
};

// 第一级选择：游戏
const selectFirstLevelGame = async (game) => {
  cardSelection.selectedGame = game.value;
  cardSelection.selectedGameName = game.label;
  cardSelection.currentStep = 4;

  // 加载广告平台数据（该游戏有数据的平台）
  stepLoading.value = true;
  try {
    const response = await AnalysisAPI.getPlatformsByChannel(
      "UA",
      cardSelection.selectedChannel,
      game.value
    );
    stepData.platforms = (response || []).map((item) => ({
      value: item.id,
      label: item.name,
      code: item.code,
    }));
  } catch (error) {
    console.error("获取平台列表失败:", error);
    ElMessage.error("获取平台列表失败");
  } finally {
    stepLoading.value = false;
  }
};

// 第一级选择：广告平台
const selectFirstLevelPlatform = async (platform) => {
  cardSelection.selectedPlatform = platform.value;
  cardSelection.selectedPlatformName = platform.label;
  cardSelection.currentStep = 4;

  // 加载游戏数据（该平台有数据的游戏）
  stepLoading.value = true;
  try {
    const response = await AnalysisAPI.getGamesByChannel(cardSelection.selectedChannel);
    stepData.games = (response || []).map((item) => ({
      value: item.id,
      label: item.name,
    }));
  } catch (error) {
    console.error("获取游戏列表失败:", error);
    ElMessage.error("获取游戏列表失败");
  } finally {
    stepLoading.value = false;
  }
};

// 第二级选择：广告平台
const selectSecondLevelPlatform = (platform) => {
  if (cardSelection.selectedPlatform === platform.value) {
    // 如果已选中，则取消选择
    cardSelection.selectedPlatform = null;
    cardSelection.selectedPlatformName = "";
  } else {
    // 如果未选中，则选择
    cardSelection.selectedPlatform = platform.value;
    cardSelection.selectedPlatformName = platform.label;
  }
};

// 第二级选择：游戏
const selectSecondLevelGame = (game) => {
  if (cardSelection.selectedGame === game.value) {
    // 如果已选中，则取消选择
    cardSelection.selectedGame = null;
    cardSelection.selectedGameName = "";
  } else {
    // 如果未选中，则选择
    cardSelection.selectedGame = game.value;
    cardSelection.selectedGameName = game.label;
  }
};

// 上一步
const prevStep = async () => {
  if (cardSelection.currentStep > 1) {
    cardSelection.currentStep--;
    if (cardSelection.currentStep === 2) {
      // 回退到步骤2（选择方向），清除所有选择
      cardSelection.selectionMode = null;
      cardSelection.selectedGame = null;
      cardSelection.selectedGameName = "";
      cardSelection.selectedPlatform = null;
      cardSelection.selectedPlatformName = "";
      stepData.platforms = [];
      stepData.games = [];
    } else if (cardSelection.currentStep === 3) {
      // 回退到步骤3（第一级选择），清除所有选择
      cardSelection.selectedGame = null;
      cardSelection.selectedGameName = "";
      cardSelection.selectedPlatform = null;
      cardSelection.selectedPlatformName = "";
      stepData.platforms = [];
      stepData.games = [];

      // 重新加载第一级数据（游戏或平台）
      stepLoading.value = true;
      try {
        if (cardSelection.selectionMode === "game-platform") {
          // 加载游戏数据
          const response = await AnalysisAPI.getGamesByChannel(cardSelection.selectedChannel);
          stepData.games = (response || []).map((item) => ({
            value: item.id,
            label: item.name,
          }));
        } else if (cardSelection.selectionMode === "platform-game") {
          // 加载平台数据
          const response = await AnalysisAPI.getPlatformsByChannel(
            "UA",
            cardSelection.selectedChannel
          );
          stepData.platforms = (response || []).map((item) => ({
            value: item.id,
            label: item.name,
            code: item.code,
          }));
        }
      } catch (error) {
        console.error("获取数据列表失败:", error);
        ElMessage.error("获取数据列表失败");
      } finally {
        stepLoading.value = false;
      }
    }
  }
};

// 下一步
const nextStep = async () => {
  if (cardSelection.currentStep === 2) {
    // 从步骤2（选择方向）进入步骤3，加载第一级数据
    cardSelection.currentStep = 3;

    if (cardSelection.selectionMode === "game-platform") {
      // 加载游戏数据
      stepLoading.value = true;
      try {
        const response = await AnalysisAPI.getGamesByChannel(cardSelection.selectedChannel);
        stepData.games = (response || []).map((item) => ({
          value: item.id,
          label: item.name,
        }));
      } catch (error) {
        console.error("获取游戏列表失败:", error);
        ElMessage.error("获取游戏列表失败");
      } finally {
        stepLoading.value = false;
      }
    } else if (cardSelection.selectionMode === "platform-game") {
      // 加载广告平台数据
      stepLoading.value = true;
      try {
        const response = await AnalysisAPI.getPlatformsByChannel(
          "UA",
          cardSelection.selectedChannel
        );
        stepData.platforms = (response || []).map((item) => ({
          value: item.id,
          label: item.name,
          code: item.code,
        }));
      } catch (error) {
        console.error("获取平台列表失败:", error);
        ElMessage.error("获取平台列表失败");
      } finally {
        stepLoading.value = false;
      }
    }
  } else if (cardSelection.currentStep < 4) {
    cardSelection.currentStep++;
  }
};

// 确认查询
const confirmCardQuery = async () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const dateStart = formatDate(start);
  const dateEnd = formatDate(end);
  cardSelection.past7Days = `${dateStart} 至 ${dateEnd}`;

  // 记录筛选框显示状态
  cardSelection.showPlatformFilter =
    cardSelection.selectionMode === "game-platform" && !cardSelection.selectedPlatform;
  cardSelection.showGameFilter =
    cardSelection.selectionMode === "platform-game" && !cardSelection.selectedGame;

  // 切换到列表模式显示数据
  viewMode.value = "list";
  chartDateRange.value = [dateStart, dateEnd];
  chartType.value = "line";

  // 直接调用 loadChartData 统一处理
  await loadChartData(chartDateRange.value);

  await nextTick();
  ElMessage.success("查询成功");
};

// 处理图表类型变化
const handleChartTypeChange = (type) => {
  chartType.value = type;
};

// 处理图表指标变化
const handleChartMetricChange = (metric) => {
  chartMetric.value = metric;
};

// 处理图表平台选择变化
const handlePlatformChange = async (platformId) => {
  cardSelection.selectedPlatform = platformId;
  const platform = stepData.platforms.find((p) => p.value === platformId);
  cardSelection.selectedPlatformName = platform ? platform.label : "";
  await loadChartData(chartDateRange.value);
};

// 处理图表游戏选择变化
const handleGameChange = async (gameId) => {
  cardSelection.selectedGame = gameId;
  const game = stepData.games.find((g) => g.value === gameId);
  cardSelection.selectedGameName = game ? game.label : "";

  // 如果是"游戏-平台"方向，选择游戏后需要加载对应的平台列表
  if (cardSelection.selectionMode === "game-platform") {
    stepLoading.value = true;
    try {
      const platformResponse = await AnalysisAPI.getPlatformsByChannel(
        "UA",
        cardSelection.selectedChannel,
        gameId
      );
      stepData.platforms = (platformResponse || []).map((item) => ({
        value: item.id,
        label: item.name,
        code: item.code,
      }));

      // 如果有平台数据，不再默认选择第一个，保持空状态
      // if (stepData.platforms.length > 0) {
      //   cardSelection.selectedPlatform = stepData.platforms[0].value;
      //   cardSelection.selectedPlatformName = stepData.platforms[0].label;
      // }
    } catch (error) {
      console.error("获取平台列表失败:", error);
      ElMessage.error("获取平台列表失败");
    } finally {
      stepLoading.value = false;
    }
  }

  await loadChartData(chartDateRange.value);
};

// 处理图表日期范围变化
const handleChartDateRangeChange = async (dateRange) => {
  if (dateRange && dateRange.length === 2) {
    chartDateRange.value = dateRange;
    await loadChartData(dateRange);
  }
};

// 处理图表刷新
const handleChartRefresh = async (dateRange) => {
  const range = dateRange || chartDateRange.value;
  if (range && range.length === 2) {
    chartDateRange.value = range;
    await loadChartData(range);
  }
};

// 加载图表数据
// 加载图表数据
const loadChartData = async (dateRange) => {
  if (!dateRange || dateRange.length !== 2) return;

  loading.value = true;
  try {
    const [dateStart, dateEnd] = dateRange;

    // 动态决定分组维度
    const groupBy = ["report_date", "channel_id"];
    if (cardSelection.selectionMode === "game-platform") {
      groupBy.push("game_id");
      if (cardSelection.selectedPlatform) groupBy.push("platform_id");
    } else if (cardSelection.selectionMode === "platform-game") {
      groupBy.push("platform_id");
      if (cardSelection.selectedGame) groupBy.push("game_id");
    }

    const apiParams = {
      date_range: { start: dateStart, end: dateEnd },
      filters: {
        business_type: "UA",
        channel_ids: [cardSelection.selectedChannel],
        platform_ids: cardSelection.selectedPlatform ? [cardSelection.selectedPlatform] : [],
        game_ids: cardSelection.selectedGame ? [cardSelection.selectedGame] : [],
      },
      group_by: groupBy,
      page: 1,
      size: 100,
    };

    // 获取主体数据
    const response = await AnalysisAPI.queryAnalytics(apiParams);
    const rawData = response.items || [];
    pagination.total = response.total || rawData.length;

    tableData.value = rawData.map((item, index) => ({
      id: index + 1,
      date: item.report_date || "",
      channel: item.channel_name || "",
      packageName: item.package_name || "",
      gameName: item.game_name || "",
      platform: item.platform_id || item.platform || "",
      platformName: item.platform_name || item.platformName || item.name || "",
      spend: item.spend || 0,
      impressions: item.impressions || 0,
      clicks: item.clicks || 0,
      installs: item.installs || 0,
      cvr: calculateCVR(item),
      ctr: formatCTR(item),
      dateRange: [dateStart, dateEnd],
      ...Object.fromEntries(Object.entries(item).filter(([key]) => !["ctr", "cvr"].includes(key))),
    }));

    // 如果是游戏-平台方向且未选择平台，单独获取平台占比数据用于进度条
    if (cardSelection.selectionMode === "game-platform" && !cardSelection.selectedPlatform) {
      const breakdownParams = {
        ...apiParams,
        group_by: ["platform_id"],
      };
      const breakdownResp = await AnalysisAPI.queryAnalytics(breakdownParams);
      platformBreakdownData.value = breakdownResp.items || [];
    } else {
      platformBreakdownData.value = [];
    }

    ElMessage.success("数据已更新");
  } catch (error) {
    console.error("加载图表数据失败:", error);
    ElMessage.error("加载数据失败");
  } finally {
    loading.value = false;
  }
};

// 计算属性：是否能进入下一步
const canGoNext = computed(() => {
  switch (cardSelection.currentStep) {
    case 1:
      return !!cardSelection.selectedChannel;
    case 2:
      return !!cardSelection.selectionMode;
    case 3:
      // 步骤3必须选择
      return cardSelection.selectionMode === "game-platform"
        ? !!cardSelection.selectedGame
        : !!cardSelection.selectedPlatform;
    case 4:
      // 步骤4的选择是可选的
      return true;
    default:
      return false;
  }
});

const handleReset = async () => {
  // 重新加载平台选项并设置默认值
  await loadPlatformOptions();
  await loadChannelOptions(); // 重新加载渠道选项
  await loadGameOptions(); // 重新加载游戏选项

  searchForm.value = {
    date: [],
    platforms: searchForm.value.platforms, // 保持默认筛选（type=UA）
    channelIds: [], // 重置为空（无默认筛选）
    gameIds: [], // 重置为空（无默认筛选）
    groupBy: ["report_date", "game_id", "channel_id"],
    metrics: ["spend", "impressions", "clicks", "installs", "ctr"],
  };
  handleQueryClick();
};

const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

// 保存列设置
const saveColumnSetting = () => {
  showColumnSetting.value = false;
  ElMessage.success("列设置已保存");
};

// 分页处理
const handleSizeChange = (val) => {
  pagination.pageSize = val;
  loadData();
};

const handleCurrentChange = (val) => {
  pagination.currentPage = val;
  loadData();
};

// 日期变化处理函数
const handleDateChange = (dateRange) => {
  console.log("Date changed:", dateRange);
  // 当日期变化时，立即请求API
  handleQueryClick();
};

// 加载数据
const loadData = async (params = {}) => {
  loading.value = true;

  try {
    // 模拟API调用
    const { metrics, ...restForm } = searchForm.value;
    const result = await indexAction({
      ...restForm,
      ...params,
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize,
    });

    tableData.value = result.list;
    pagination.total = result.total;
  } catch (error) {
    console.error("加载数据失败:", error);
    tableData.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 加载平台选项
const loadPlatformOptions = async () => {
  try {
    const response = await AnalysisAPI.getPlatformOptionsUA();
    // 转换数据格式：{id, name, code} -> {value, label, type}
    platformOptions.value = (response || []).map((item) => ({
      value: item.id, // 使用id作为value
      label: item.name, // 使用name作为label
      type: item.code, // 保留type用于默认筛选
    }));

    // 默认不选择任何平台
    searchForm.value.platforms = [];

    return true;
  } catch (error) {
    console.error("获取平台列表失败:", error);
    ElMessage.error("获取平台列表失败");
    return false;
  }
};

// 加载渠道选项
const loadChannelOptions = async () => {
  try {
    const response = await AnalysisAPI.getChannelOptions();
    // 转换数据格式：{id, name, code} -> {value, label}
    channelOptions.value = (response || []).map((item) => ({
      value: item.id, // 使用id作为value
      label: item.name, // 使用name作为label
    }));

    // 默认不筛选，保持为空
    // searchForm.value.channelIds 已经是空数组

    return true;
  } catch (error) {
    console.error("获取渠道列表失败:", error);
    ElMessage.error("获取渠道列表失败");
    return false;
  }
};

// 加载游戏选项
const loadGameOptions = async () => {
  try {
    const response = await AnalysisAPI.getGameOptions();
    // 转换数据格式：{id, name, code} -> {value, label}
    gameOptions.value = (response || []).map((item) => ({
      value: item.id, // 使用id作为value
      label: item.name, // 使用name作为label
    }));

    // 默认不筛选，保持为空
    // searchForm.value.gameIds 已经是空数组

    return true;
  } catch (error) {
    console.error("获取游戏列表失败:", error);
    ElMessage.error("获取游戏列表失败");
    return false;
  }
};

// 加载计划选项
const loadCampaignOptions = async () => {
  try {
    // TODO: 调用后端接口获取计划列表
    // const response = await AnalysisAPI.getCampaignOptions();
    // 临时使用静态数据或从现有数据提取
    const response = []; // 暂时为空数组，待后端提供接口

    campaignOptions.value = (response || []).map((item) => ({
      value: item.campaign_name || item.name || String(item.id),
      label: item.campaign_name || item.name || String(item.id),
    }));

    return true;
  } catch (error) {
    console.error("获取计划列表失败:", error);
    ElMessage.error("获取计划列表失败");
    return false;
  }
};

// 初始化默认日期（最近7天）
const initDefaultDate = () => {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // 包含今天共7天

  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  searchForm.value.date = [formatDate(sevenDaysAgo), formatDate(today)];
};

// 日期选择器快捷选项
const dateShortcuts = [
  {
    text: "昨天",
    value: () => {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      return [date, date];
    },
  },
  {
    text: "前天",
    value: () => {
      const date = new Date();
      date.setDate(date.getDate() - 2);
      return [date, date];
    },
  },
  {
    text: "上周",
    value: () => {
      const end = new Date();
      const start = new Date();
      // 获取上周的周一
      const day = start.getDay() || 7;
      start.setDate(start.getDate() - day - 6);
      end.setDate(start.getDate() + 6);
      return [start, end];
    },
  },
  {
    text: "过去7天",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      return [start, end];
    },
  },
];

// 页面挂载时初始化
onMounted(async () => {
  console.log("Component mounted");
  initDefaultDate(); // 设置默认日期范围（最近7天）
  await loadPlatformOptions(); // 加载平台选项
  await loadCampaignOptions(); // 加载计划选项
  await loadChannelOptions(); // 加载渠道选项
  await loadGameOptions(); // 加载游戏选项
  await loadData(); // 再加载数据
});

// 为组件提供方法
defineExpose({});
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.mb-10 {
  margin-bottom: 10px;
}

.mr-10 {
  margin-right: 10px;
}

.table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px 0 20px 0;
  background: var(--el-bg-color-page);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
  position: relative;
  z-index: 1;
}
// 表头样式
.el-table__header-wrapper {
  th.el-table__cell {
    padding: 12px 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-table-header-text-color);
    background-color: var(--el-table-header-bg-color) !important;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
}

// 单元格样式 - 保持居中
.el-table__body-wrapper {
  overflow: visible;

  .el-table__row {
    td.el-table__cell {
      padding: 12px 0;
      font-size: 14px;
      border-bottom: 1px solid var(--el-border-color-extra-light);

      .cell {
        font-variant-numeric: tabular-nums; /* 数字等宽对齐 */
        line-height: 1.4;
      }
    }
  }
}

.search-container {
  padding: 20px 20px;
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  :deep(.el-form) {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    justify-content: flex-start;
  }

  :deep(.el-form-item) {
    margin-right: 6px;
    margin-bottom: 0;
  }

  :deep(.el-form-item:last-child) {
    margin-right: 0;
  }

  :deep(.el-text) {
    display: block;
    margin-bottom: 12px;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &:hover {
    border-color: var(--el-color-primary-light-3);
    box-shadow: 0 8px 25px rgba(64, 128, 255, 0.15);
  }
}

.sortable-ghost {
  background-color: var(--el-color-primary-light-9);
  border: 2px dashed var(--el-color-primary);
  border-radius: 8px;
  opacity: 0.5;
}

// 放大右上角的默认工具栏按钮
.toolbar-right {
  .el-button {
    --el-button-size: 36px;
    padding: 10px 12px;
    font-size: 16px;
    border-radius: 8px;
    transition: all 0.2s linear;

    &:hover {
      box-shadow: 0 6px 20px rgba(64, 128, 255, 0.35);
      transform: translateY(-3px) scale(1.02);
    }

    &:active {
      box-shadow: 0 2px 4px rgba(64, 128, 255, 0.2);
      transform: translateY(-1px) scale(0.98);
    }

    &.el-button--small {
      --el-button-size: 32px;
      padding: 8px 10px;
      font-size: 14px;
    }
  }
}

// 分页样式优化
:deep(.el-pagination) {
  padding: 16px;
  margin-top: 20px;
  background: var(--el-bg-color-overlay);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  .btn-prev,
  .btn-next,
  .el-pager li {
    transition: all 0.2s linear;

    &:hover {
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }
  }

  .el-pager li.is-active {
    color: #ffffff;
    background-color: var(--el-color-primary);
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(64, 128, 255, 0.3);
  }

  .el-pagination__total {
    color: var(--el-text-color-regular);
  }
}

// 表格空数据样式
:deep(.el-table__empty-block) {
  min-height: 200px;

  .el-table__empty-text {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}

// 空数据占位符样式
.text-muted {
  color: var(--el-text-color-placeholder);
}

// 表格行悬停效果
:deep(.el-table__row) {
  transition: all 0.2s linear;
  position: relative;
  z-index: 1;

  &:hover {
    cursor: pointer;
    background-color: var(--el-color-primary-light-9);
    transform: scale(1.01);
    transform-origin: top center;
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

// 筛选器样式优化
:deep(.el-form-item__content) {
  line-height: 32px;
}

:deep(.el-select),
:deep(.el-date-editor),
:deep(.el-input) {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 0 0 1px var(--el-color-primary) inset;
  }
}

:deep(.el-button--primary) {
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 6px rgba(64, 128, 255, 0.2);
  transition: all 0.2s linear;

  &:hover {
    box-shadow: 0 6px 20px rgba(64, 128, 255, 0.35);
    transform: translateY(-2px);
  }
}

:deep(.el-checkbox-button.is-checked) {
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(64, 128, 255, 0.3);
}

// 自定义加载样式
:deep(.custom-loading) {
  .el-loading-spinner {
    .circular {
      width: 48px;
      height: 48px;
    }
  }

  .el-loading-text {
    margin-top: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--el-color-primary);
  }
}

// 列设置内容
.column-setting-content {
  max-height: 400px;
  overflow-y: auto;

  .draggable-column-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 8px;
    background: var(--el-bg-color-overlay);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
      background: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary-light-3);
      box-shadow: 0 2px 8px rgba(64, 128, 255, 0.1);
    }

    &.sortable-ghost {
      background: var(--el-color-primary-light-8);
      border: 1px dashed var(--el-color-primary);
      opacity: 0.5;
    }

    .column-label {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .column-index {
      padding: 2px 8px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      background: var(--el-fill-color-light);
      border-radius: 10px;
    }
  }
}

// 弹窗优化
:deep(.column-setting-dialog) {
  .el-dialog__header {
    padding: 20px 24px;
    background-color: var(--el-color-primary);
    border-radius: 12px 12px 0 0;

    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
    }

    .el-dialog__close {
      color: rgba(255, 255, 255, 0.8);

      &:hover {
        color: #ffffff;
      }
    }
  }

  .el-dialog__body {
    padding: 24px;
  }

  .el-dialog__footer {
    padding: 16px 24px;
  }
}

// 全局滚动条美化
:deep(.el-table__body-wrapper)::-webkit-scrollbar,
:deep(.el-select-dropdown__wrap)::-webkit-scrollbar,
:deep(.el-dialog__body)::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

:deep(.el-table__body-wrapper)::-webkit-scrollbar-track,
:deep(.el-select-dropdown__wrap)::-webkit-scrollbar-track,
:deep(.el-dialog__body)::-webkit-scrollbar-track {
  background: var(--el-fill-color-light);
  border-radius: 4px;
}

:deep(.el-table__body-wrapper)::-webkit-scrollbar-thumb,
:deep(.el-select-dropdown__wrap)::-webkit-scrollbar-thumb,
:deep(.el-dialog__body)::-webkit-scrollbar-thumb {
  background: var(--el-color-primary-light-5);
  border-radius: 4px;

  &:hover {
    background: var(--el-color-primary-light-3);
  }
}

// 卡片选择模式容器
.card-mode-container {
  min-height: 600px;
  padding: 24px;
  background: var(--el-bg-color-page);
  border-radius: 12px;
}

// 步骤指示器
.step-indicator {
  margin-bottom: 32px;

  :deep(.el-step__title) {
    font-size: 14px;
  }
}

// 步骤内容区
.step-content {
  min-height: 100px;
  max-height: 400px;
  padding-right: 8px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--el-color-primary-light-5);
    border-radius: 3px;
  }
}

// 选择容器布局
.selection-container {
  display: flex;
  gap: 24px;
  min-height: 300px;
}

// 左侧选择区域
.selection-left {
  flex: 1;
  max-width: 600px;
}

// 右侧已选择信息
.selection-right {
  flex-shrink: 0;
  width: 280px;
}

// 已选择信息摘要
.selection-summary {
  padding: 20px;
  background: var(--el-bg-color-overlay);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  .summary-title {
    padding-bottom: 16px;
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .summary-item {
    display: flex;
    align-items: center;
    padding: 8px 0;

    .label {
      min-width: 80px;
      font-size: 14px;
      color: var(--el-text-color-regular);
    }
  }
}

.step-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-title {
  padding-left: 12px;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  border-left: 4px solid var(--el-color-primary);
}

.step-loading {
  padding: 60px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  text-align: center;

  .el-icon {
    margin-bottom: 12px;
    font-size: 32px;
  }
}

.empty-tip {
  padding: 60px;
  color: var(--el-text-color-placeholder);
  text-align: center;
}

// 卡片网格
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

// 选择卡片
.selection-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  padding: 24px 16px;
  cursor: pointer;
  background: var(--el-bg-color-overlay);
  border: 2px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  .card-icon {
    margin-bottom: 12px;
    font-size: 32px;
    color: var(--el-text-color-secondary);
    transition: all 0.25s ease;
  }

  .card-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    text-align: center;
    word-break: break-all;
    transition: all 0.25s ease;
  }

  &:hover {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-3);
    box-shadow: 0 8px 20px rgba(64, 128, 255, 0.15);
    transform: translateY(-4px);

    .card-icon {
      color: var(--el-color-primary);
      transform: scale(1.1);
    }
  }

  &.active {
    background: linear-gradient(
      135deg,
      var(--el-color-primary) 0%,
      var(--el-color-primary-light-3) 100%
    );
    border-color: var(--el-color-primary);
    box-shadow: 0 8px 20px rgba(64, 128, 255, 0.35);

    .card-icon,
    .card-name {
      color: white;
    }

    &:hover {
      transform: translateY(-4px);
    }
  }
}

// 日期和游戏区域
.date-section {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;

  .section-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
}

.game-section {
  .section-label {
    display: block;
    margin-bottom: 16px;
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
}

// 日期和游戏区域
.date-section {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;

  .section-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
}

// 确认摘要
.confirm-summary {
  max-width: 600px;
  padding: 24px;
  margin: 0 auto;
  background: var(--el-bg-color-overlay);
  border-radius: 12px;

  .summary-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: none;
    }

    .label {
      min-width: 100px;
      font-weight: 500;
      color: var(--el-text-color-regular);
    }
  }
}

// 步骤操作按钮（上方）
.step-actions-top {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding-bottom: 20px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  .el-button {
    min-width: 120px;
    height: 40px;
    font-size: 14px;
  }
}

// 底部操作按钮
.step-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding-top: 24px;
  margin-top: 32px;
  border-top: 1px solid var(--el-border-color-lighter);

  .el-button {
    min-width: 120px;
    height: 40px;
    font-size: 14px;
  }
}

// 功能区样式
.function-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 12px 20px;
  margin-bottom: 16px;
  background: var(--el-bg-color-overlay);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  .function-bar-title {
    padding-right: 20px;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    border-right: 1px solid var(--el-border-color-lighter);
  }

  .function-bar-content {
    display: flex;
    gap: 12px;
  }
}

// 可选提示
.optional-hint {
  padding: 10px 16px;
  margin-top: 20px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  text-align: center;
  background: var(--el-color-info-light-9);
  border-radius: 8px;
}

// 模式选择区域
.mode-selection {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;

  .mode-card {
    display: flex;
    gap: 20px;
    align-items: center;
    padding: 24px;
    cursor: pointer;
    background: var(--el-bg-color-page);
    border: 2px solid var(--el-border-color-light);
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(64, 128, 255, 0.05);
      border-color: #4080ff;
      box-shadow: 0 4px 12px rgba(64, 128, 255, 0.2);
      transform: translateY(-2px);
    }

    &.active {
      background: rgba(64, 128, 255, 0.08);
      border-color: #4080ff;
      box-shadow: 0 4px 16px rgba(64, 128, 255, 0.3);
    }

    .mode-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      font-size: 24px;
      color: white;
      background: linear-gradient(135deg, #4080ff, #0070e0);
      border-radius: 12px;

      .el-icon {
        font-size: 28px;
      }
    }

    .mode-content {
      .mode-title {
        margin-bottom: 4px;
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .mode-desc {
        font-size: 13px;
        color: var(--el-text-color-regular);
      }
    }
  }

  // 总计行样式
  :deep(.el-table__footer-wrapper) {
    .el-table__footer td {
      font-weight: 600;
      background-color: var(--el-fill-color-light) !important;
    }
  }
}

// 指标复选框禁用状态样式（灰色半透明，明显区分）
:deep(.el-checkbox-button.is-disabled) {
  color: var(--el-text-color-disabled) !important;
  background-color: var(--el-fill-color-extra-light) !important;
  border-color: var(--el-border-color-lighter) !important;
  opacity: 0.6;

  &:hover {
    color: var(--el-text-color-disabled) !important;
    background-color: var(--el-fill-color-extra-light) !important;
    border-color: var(--el-border-color-lighter) !important;
  }
}

// 视图切换过渡动画
.view-transition-enter-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.view-transition-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.view-transition-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.view-transition-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
