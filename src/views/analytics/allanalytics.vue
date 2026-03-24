<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container mb-10">
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
        <el-form-item label="投放平台">
          <el-select
            v-model="searchForm.uaPlatformIds"
            placeholder="请选择投放平台"
            clearable
            multiple
            collapse-tags
            collapse-tags-tooltip
            style="width: 180px"
            @change="handleQueryClick"
          >
            <el-option
              v-for="item in uaPlatformOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="变现平台">
          <el-select
            v-model="searchForm.monPlatformIds"
            placeholder="请选择变现平台"
            clearable
            multiple
            collapse-tags
            collapse-tags-tooltip
            style="width: 180px"
            @change="handleQueryClick"
          >
            <el-option
              v-for="item in monPlatformOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="渠道名称">
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
        <el-form-item label="游戏名称">
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
        <el-form-item label="分组">
          <el-select
            v-model="searchForm.groupBy"
            placeholder="请选择分组"
            clearable
            multiple
            collapse-tags
            collapse-tags-tooltip
            style="width: 180px"
            @change="handleQueryClick"
          >
            <el-option
              v-for="item in groupByOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
          <el-button style="margin-left: 12px" @click="showColumnSetting = true">
            <el-icon class="mr-1"><Setting /></el-icon>
            指标设置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        class="flex-1"
        :border="false"
        :highlight-current-row="false"
        height="calc(100vh - 200px)"
        show-summary
        :summary-method="summaryMethod"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="index" label="序号" width="60" align="center" fixed="left" />
        <el-table-column v-for="col in visibleCols" :key="col.prop" v-bind="col">
          <template #default="scope">
            <span v-if="col.prop === 'roi' || col.prop === 'roas'">
              {{ scope.row[col.prop] }}
            </span>
            <span v-else-if="col.prop === 'ecpm'">
              {{ formatNumber(scope.row[col.prop]) }}
            </span>
            <span v-else-if="col.prop === 'spend'">
              <el-text type="danger">{{ formatNumber(scope.row[col.prop]) }}</el-text>
            </span>
            <span v-else-if="col.prop === 'monEstimatedRevenue'">
              <el-text type="success">{{ formatNumber(scope.row[col.prop]) }}</el-text>
            </span>
            <span v-else-if="isStringColumn(col.prop)">
              {{ scope.row[col.prop] || "-" }}
            </span>
            <span v-else>
              {{ formatNumber(scope.row[col.prop], col.integer) || "-" }}
            </span>
          </template>
        </el-table-column>
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

    <!-- 指标设置对话框 -->
    <el-dialog
      v-model="showColumnSetting"
      title="指标设置（拖拽排序）"
      width="600px"
      class="column-setting-dialog"
      :show-close="false"
    >
      <div class="column-setting-content">
        <VueDraggable v-model="cols" handle=".drag-handle" animation="200">
          <div v-for="col in cols" :key="col.prop" class="draggable-column-item">
            <el-checkbox v-model="col.visible" :label="col.label" class="metric-checkbox" />
            <span
              class="drag-handle"
              style="margin-right: 12px; margin-left: auto; color: #909399; cursor: move"
            >
              <el-icon><Rank /></el-icon>
            </span>
            <span class="column-label">{{ col.label }}</span>
          </div>
        </VueDraggable>
      </div>
      <template #footer>
        <el-button @click="handleResetMetrics">恢复默认</el-button>
        <el-button @click="showColumnSetting = false">取消</el-button>
        <el-button type="primary" @click="saveColumnSetting">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { Rank, Setting } from "@element-plus/icons-vue";
import { VueDraggable } from "vue-draggable-plus";

// 引入CopyButton组件
import CopyButton from "@/components/CopyButton/index.vue";

// 导入AnalysisAPI
import AnalysisAPI from "@/api/analysis";

// 获取路由参数
const route = useRoute();
const query = computed(() => route.query.type || "未知");

// 定义响应式引用
const tableRef = ref();

// 搜索表单 - 只保留5个筛选条件
const searchForm = ref({
  date: [],
  gameIds: [],
  channelIds: [],
  uaPlatformIds: [],
  monPlatformIds: [],
  groupBy: ["report_date", "channel_id", "game_id"],
});

// 投放平台选项
const uaPlatformOptions = ref([]);

// 变现平台选项
const monPlatformOptions = ref([]);

// 渠道选项
const channelOptions = ref([]);

// 游戏选项
const gameOptions = ref([]);

// 分组选项
const groupByOptions = ref([
  { value: "report_date", label: "日期" },
  { value: "channel_id", label: "渠道" },
  { value: "game_id", label: "游戏" },
]);

// 表格数据
const tableData = ref([]);
const loading = ref(false);
const showPagination = ref(true);
const pagination = reactive({
  currentPage: 1,
  pageSize: 50,
  pageSizes: [10, 20, 30, 50, 100, 200, 300],
  total: 0,
  layout: "prev, pager, next, jumper, total, sizes",
});

// 选择项
const selectedRows = ref([]);

// 指标设置相关
const showColumnSetting = ref(false);

// 格式化数字为千分位
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

// 数值列列表（需要统计的列）
const numericColumns = [
  "spend",
  "installs",
  "uaImpressions",
  "uaClicks",
  "monEstimatedRevenue",
  "monImpressions",
  "monRequests",
  "monFills",
  "monClicks",
  "ecpm",
];

// 判断是否为数值列
const isNumericColumn = (prop) => {
  return numericColumns.includes(prop);
};

// 判断是否为字符串列（直接显示，不格式化）
const isStringColumn = (prop) => {
  const stringColumns = ["date", "gameId", "gameName", "channelName", "roi", "roas"];
  return stringColumns.includes(prop);
};

// 表格列配置（所有列都默认显示）
const cols = ref([
  { label: "报告日期", align: "center", prop: "date", width: 120, sortable: true, visible: true },
  { label: "游戏ID", align: "center", prop: "gameId", width: 100, sortable: true, visible: true },
  {
    label: "游戏名称",
    align: "center",
    prop: "gameName",
    minWidth: 150,
    sortable: true,
    visible: true,
  },
  {
    label: "渠道",
    align: "center",
    prop: "channelName",
    width: 120,
    sortable: true,
    visible: true,
  },
  { label: "花费", align: "center", prop: "spend", minWidth: 120, sortable: true, visible: true },
  {
    label: "投放-激活数",
    align: "center",
    prop: "installs",
    minWidth: 120,
    sortable: true,
    integer: true,
    visible: true,
  },
  {
    label: "投放-展示数",
    align: "center",
    prop: "uaImpressions",
    minWidth: 120,
    sortable: true,
    integer: true,
    visible: true,
  },
  {
    label: "投放-点击数",
    align: "center",
    prop: "uaClicks",
    minWidth: 120,
    sortable: true,
    integer: true,
    visible: true,
  },
  {
    label: "变现-预估收入",
    align: "center",
    prop: "monEstimatedRevenue",
    minWidth: 140,
    sortable: true,
    visible: true,
  },
  {
    label: "变现-展示数",
    align: "center",
    prop: "monImpressions",
    minWidth: 120,
    sortable: true,
    integer: true,
    visible: true,
  },
  {
    label: "变现-请求数",
    align: "center",
    prop: "monRequests",
    minWidth: 120,
    sortable: true,
    integer: true,
    visible: true,
  },
  {
    label: "变现-填充数",
    align: "center",
    prop: "monFills",
    minWidth: 120,
    sortable: true,
    integer: true,
    visible: true,
  },
  {
    label: "变现-点击数",
    align: "center",
    prop: "monClicks",
    minWidth: 120,
    sortable: true,
    integer: true,
    visible: true,
  },
  { label: "利润占比", align: "center", prop: "roi", width: 100, sortable: true, visible: true },
  { label: "ROAS", align: "center", prop: "roas", width: 100, sortable: true, visible: true },
  { label: "eCPM", align: "center", prop: "ecpm", minWidth: 120, sortable: true, visible: true },
]);

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
  return formatNumber(sum);
};

// 合计行方法
const summaryMethod = (param) => {
  const { columns, data } = param;
  const sums = [];

  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = "合计";
      return;
    }

    const prop = column.property;
    if (!prop) {
      sums[index] = "";
      return;
    }

    const values = data.map((item) => Number(item[prop]));
    const sum = values.reduce((prev, curr) => {
      const val = Number(curr);
      return prev + (isNaN(val) ? 0 : val);
    }, 0);

    if (prop === "spend") {
      sums[index] = formatNumber(sum);
    } else if (prop === "monEstimatedRevenue") {
      sums[index] = formatNumber(sum);
    } else if (prop === "ecpm") {
      sums[index] = formatNumber(sum);
    } else if (
      prop === "installs" ||
      prop === "uaImpressions" ||
      prop === "uaClicks" ||
      prop === "monImpressions" ||
      prop === "monRequests" ||
      prop === "monFills" ||
      prop === "monClicks"
    ) {
      sums[index] = formatNumber(sum, true);
    } else if (prop === "roi" || prop === "roas") {
      sums[index] = "";
    } else {
      sums[index] = formatNumber(sum);
    }
  });

  return sums;
};

// ====== 总计行相关函数 ======

// 加载数据
const loadData = async () => {
  loading.value = true;

  try {
    // 验证日期范围
    if (!searchForm.value.date || searchForm.value.date.length !== 2) {
      ElMessage.warning("请选择日期范围");
      loading.value = false;
      return;
    }

    const apiParams = {
      date_range: {
        start: searchForm.value.date[0],
        end: searchForm.value.date[1],
      },
      game_ids: searchForm.value.gameIds || [],
      channel_ids: searchForm.value.channelIds || [],
      ua_platform_ids: searchForm.value.uaPlatformIds || [],
      mon_platform_ids: searchForm.value.monPlatformIds || [],
      group_by: searchForm.value.groupBy || [],
      page: pagination.currentPage,
      size: pagination.pageSize,
    };

    console.log("ROI API params:", apiParams);

    const response = await AnalysisAPI.queryROI(apiParams);
    console.log("ROI API response:", response);

    // API返回格式: { total, page, size, summary, details }
    const details = response.details || [];
    pagination.total = response.total || details.length;

    // 映射API字段到表格字段
    tableData.value = details.map((item, index) => ({
      id: index + 1,
      date: item.report_date || "",
      gameId: item.game_id || "",
      gameName: item.game_name || "",
      channelName: item.channel_name || "",
      spend: item.spend || 0,
      installs: item.installs || 0,
      uaImpressions: item.ua_impressions || 0,
      uaClicks: item.ua_clicks || 0,
      monEstimatedRevenue: item.mon_estimated_revenue || 0,
      monImpressions: item.mon_impressions || 0,
      monRequests: item.mon_requests || 0,
      monFills: item.mon_fills || 0,
      monClicks: item.mon_clicks || 0,
      // ROI和ROAS格式化为显示百分号，后端返回的是小数（如0.5表示50%）
      roi: item.roi !== undefined && item.roi !== null ? item.roi.toFixed(2) + "%" : "0.00%",
      roas: item.roas !== undefined && item.roas !== null ? item.roas.toFixed(2) + "%" : "0.00%",
      ecpm: item.ecpm || 0,
    }));

    ElMessage.success("数据加载成功");
  } catch (error) {
    console.error("加载ROI数据失败:", error);
    ElMessage.error("加载数据失败");
    tableData.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 查询按钮点击
const handleQueryClick = async () => {
  pagination.currentPage = 1;
  await loadData();
};

// 重置
const handleReset = async () => {
  searchForm.value = {
    date: searchForm.value.date, // 保持日期不变
    gameIds: [],
    channelIds: [],
    uaPlatformIds: [],
    monPlatformIds: [],
    groupBy: ["report_date", "channel_id", "game_id"],
  };
  await loadData();
};

// 保存指标设置
const saveColumnSetting = () => {
  // 检查是否至少保留一列
  const visibleCount = cols.value.filter((col) => col.visible).length;
  if (visibleCount === 0) {
    ElMessage.warning("至少需要保留一个指标");
    return;
  }
  showColumnSetting.value = false;
  ElMessage.success("指标设置已保存");
};

// 恢复默认指标设置
const handleResetMetrics = () => {
  cols.value.forEach((col) => {
    col.visible = true;
  });
  ElMessage.info("已恢复默认设置");
};

// 计算可见列
const visibleCols = computed(() => {
  const groupBy = searchForm.value.groupBy || [];
  return cols.value.filter((col) => {
    if (!col.visible) return false;
    if (col.prop === "date" && !groupBy.includes("report_date")) return false;
    if (col.prop === "channelName" && !groupBy.includes("channel_id")) return false;
    if ((col.prop === "gameId" || col.prop === "gameName") && !groupBy.includes("game_id"))
      return false;
    return true;
  });
});

// 选择项变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
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

// 加载投放平台选项
const loadUAPlatformOptions = async () => {
  try {
    const response = await AnalysisAPI.getPlatformOptionsUA();
    uaPlatformOptions.value = (response || []).map((item) => ({
      value: item.id,
      label: item.name,
    }));
    return true;
  } catch (error) {
    console.error("获取投放平台列表失败:", error);
    ElMessage.error("获取投放平台列表失败");
    return false;
  }
};

// 加载变现平台选项
const loadMONPlatformOptions = async () => {
  try {
    const response = await AnalysisAPI.getPlatformOptionsMON();
    monPlatformOptions.value = (response || []).map((item) => ({
      value: item.id,
      label: item.name,
    }));
    return true;
  } catch (error) {
    console.error("获取变现平台列表失败:", error);
    ElMessage.error("获取变现平台列表失败");
    return false;
  }
};

// 加载渠道选项
const loadChannelOptions = async () => {
  try {
    const response = await AnalysisAPI.getChannelOptions();
    channelOptions.value = (response || []).map((item) => ({
      value: item.id,
      label: item.name,
    }));
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
    gameOptions.value = (response || []).map((item) => ({
      value: item.id,
      label: item.name,
    }));
    return true;
  } catch (error) {
    console.error("获取游戏列表失败:", error);
    ElMessage.error("获取游戏列表失败");
    return false;
  }
};

// 初始化默认日期（最近7天）
const initDefaultDate = () => {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

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

  // 读取 URL 参数并设置筛选条件
  if (route.query.start && route.query.end) {
    searchForm.value.date = [route.query.start, route.query.end];
  }
  if (route.query.channelIds) {
    searchForm.value.channelIds = [Number(route.query.channelIds)];
  }

  initDefaultDate();
  await loadUAPlatformOptions();
  await loadMONPlatformOptions();
  await loadChannelOptions();
  await loadGameOptions();

  // 加载数据
  await loadData();
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
  height: 90vh;
  padding: 10px 0 20px 0;
  background: var(--el-bg-color-page);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  // 极简高级表格样式（适配暗色/亮色模式）
  :deep(.el-table) {
    // 使用 Element Plus 自适应颜色变量
    --el-table-header-bg-color: var(--el-fill-color-light);
    --el-table-header-text-color: var(--el-text-color-regular);
    --el-table-row-hover-bg-color: var(--el-fill-color-light);
    --el-table-border-color: transparent;
    overflow: auto;

    border-radius: 12px;

    // 隐藏底部粗线
    &::before {
      display: none;
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

  &:hover {
    cursor: pointer;
    background-color: var(--el-color-primary-light-9);
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

// 指标复选框样式
.metric-checkbox {
  flex-shrink: 0;
  margin-right: 12px;

  :deep(.el-checkbox__label) {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
}

// 拖拽项样式
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
    border: 2px dashed var(--el-color-primary);
    opacity: 0.5;
  }

  .column-label {
    flex-shrink: 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
}
</style>
