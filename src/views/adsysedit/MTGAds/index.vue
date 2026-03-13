<template>
  <div class="app-container">
    <!-- 筛选栏（空容器） -->
    <div class="search-container mb-10">
      <el-form :model="searchForm" inline>
        <!-- 筛选条件暂时为空 -->
      </el-form>
    </div>

    <!-- 选项卡导航 -->
    <div class="tab-navigation mb-10">
      <el-tabs v-model="activeTab" type="card" @tab-change="handleTabChange">
        <el-tab-pane label="广告" name="campaign" />
        <el-tab-pane label="广告单元" name="group" />
        <el-tab-pane label="创意组" name="creative" />
      </el-tabs>
    </div>

    <!-- 表格区 -->
    <div class="table-container">
      <el-table
        v-loading="currentLoading"
        :data="currentTableData"
        :border="false"
        :highlight-current-row="false"
        height="calc(100vh - 300px)"
        show-summary
        :summary-method="getSummaries"
        @sort-change="handleSortChange"
      >
        <!-- 动态列 -->
        <el-table-column
          v-for="col in tableColumns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
          :sortable="col.sortable"
          :align="col.align"
          :fixed="col.fixed"
        >
          <template #default="{ row }">
            <!-- 状态列 -->
            <el-tag v-if="col.prop === 'status'" :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>

            <!-- 投放地区列 -->
            <span v-else-if="col.prop === 'regions'">{{ formatRegions(row.regions) }}</span>

            <!-- 创意组装方式列 -->
            <span v-else-if="col.prop === 'assemblyType'">
              {{ formatAssemblyType(row.assemblyType) }}
            </span>

            <!-- 操作列 -->
            <div v-else-if="col.prop === 'operation'" class="action-buttons">
              <el-button class="action-btn action-btn-edit" size="small" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                <span>编辑</span>
              </el-button>
              <el-button
                class="action-btn action-btn-delete"
                size="small"
                @click="handleDelete(row)"
              >
                <el-icon><Delete /></el-icon>
                <span>删除</span>
              </el-button>
            </div>

            <!-- 其他列 -->
            <span v-else>{{ row[col.prop] }}</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态提示 -->
      <el-empty v-if="!currentLoading && currentTableData.length === 0" description="暂无数据" />

      <!-- 分页 -->
      <div v-if="currentTableData.length > 0" class="mt-4 flex justify-center">
        <el-pagination
          v-model:current-page="currentPagination.currentPage"
          v-model:page-size="currentPagination.pageSize"
          :page-sizes="currentPagination.pageSizes"
          :total="currentPagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="(val) => handleSizeChange(val, activeTab)"
          @current-change="(val) => handleCurrentChange(val, activeTab)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, h } from "vue";
import { Edit, Delete } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

// 当前激活的选项卡
const activeTab = ref("campaign"); // 'campaign' | 'group' | 'creative'

// 每个选项卡的独立状态
const tabStates = reactive({
  campaign: {
    tableData: ref([]),
    loading: ref(false),
    pagination: reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0,
      pageSizes: [10, 20, 50, 100],
    }),
    searchForm: reactive({
      name: "",
      status: null,
    }),
  },
  group: {
    tableData: ref([]),
    loading: ref(false),
    pagination: reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0,
      pageSizes: [10, 20, 50, 100],
    }),
    searchForm: reactive({
      groupId: "",
      status: null,
      campaignId: "",
    }),
  },
  creative: {
    tableData: ref([]),
    loading: ref(false),
    pagination: reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0,
      pageSizes: [10, 20, 50, 100],
    }),
    searchForm: reactive({
      groupId: "",
      status: null,
      campaignId: "",
    }),
  },
});

// 排序状态（共享）
const sortState = reactive({
  prop: "",
  order: "",
});

// 计算属性
const currentTabState = computed(() => tabStates[activeTab.value]);
const currentTableData = computed(() => currentTabState.value.tableData);
const currentLoading = computed(() => currentTabState.value.loading);
const currentPagination = computed(() => currentTabState.value.pagination);
const searchForm = computed(() => currentTabState.value.searchForm);

// 动态表格列配置
const tableColumns = computed(() => {
  if (activeTab.value === "campaign") {
    return [
      { prop: "name", label: "广告名称", minWidth: 200, sortable: true, align: "center" },
      { prop: "status", label: "状态", minWidth: 100, sortable: true, align: "center" },
      { prop: "budget", label: "预算", minWidth: 100, sortable: true, align: "right" },
      { prop: "spend", label: "花费", minWidth: 100, sortable: true, align: "right" },
      { prop: "createTime", label: "创建时间", minWidth: 180, sortable: true, align: "center" },
      { prop: "operation", label: "操作", minWidth: 120, fixed: "right", align: "center" },
    ];
  }

  if (activeTab.value === "group") {
    return [
      { prop: "name", label: "广告单元名称", minWidth: 200, sortable: true, align: "center" },
      { prop: "status", label: "状态", minWidth: 100, sortable: true, align: "center" },
      { prop: "createTime", label: "创建时间", minWidth: 180, sortable: true, align: "center" },
      { prop: "updateTime", label: "更新时间", minWidth: 180, sortable: true, align: "center" },
      { prop: "campaignName", label: "广告名称", minWidth: 200, sortable: true, align: "center" },
      { prop: "operation", label: "操作", minWidth: 120, fixed: "right", align: "center" },
    ];
  }

  if (activeTab.value === "creative") {
    return [
      { prop: "groupId", label: "广告单元ID", minWidth: 120, sortable: true, align: "center" },
      { prop: "creativeId", label: "创意组ID", minWidth: 120, sortable: true, align: "center" },
      { prop: "name", label: "创意组名称", minWidth: 200, sortable: true, align: "center" },
      { prop: "regions", label: "投放地区", minWidth: 150, sortable: false, align: "center" },
      {
        prop: "assemblyType",
        label: "创意组装方式",
        minWidth: 120,
        sortable: true,
        align: "center",
      },
      { prop: "operation", label: "操作", minWidth: 120, fixed: "right", align: "center" },
    ];
  }

  return [];
});

// ==================== 辅助函数 ====================

const formatTime = (timestamp) => {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  const pad = (n) => (n < 10 ? `0${n}` : n);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const formatBudget = (val) => {
  if (val === undefined || val === null) return "-";
  return (Number(val) / 100000).toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const formatRegions = (regions) => {
  if (!regions || !Array.isArray(regions)) return "-";
  return regions.join(", ");
};

const formatAssemblyType = (type) => {
  if (type === undefined || type === null) return "-";
  const types = {
    1: "单图",
    2: "多图",
    3: "视频",
  };
  return types[type] || type;
};

const getStatusLabel = (status) => {
  return status === "0" ? "投放中" : status === "1" ? "已暂停" : "未知";
};

const getStatusType = (status) => {
  return status === "0" ? "success" : status === "1" ? "info" : "warning";
};

// ==================== 交互处理 ====================

const handleTabChange = (tabName) => {
  activeTab.value = tabName;
};

const handleSortChange = ({ prop, order }) => {
  sortState.prop = prop;
  sortState.order = order;
  // 暂不实现实际排序请求
};

const handleSizeChange = (val, tabName = activeTab.value) => {
  tabStates[tabName].pagination.pageSize = val;
  // 暂不实现实际请求
};

const handleCurrentChange = (val, tabName = activeTab.value) => {
  tabStates[tabName].pagination.currentPage = val;
  // 暂不实现实际请求
};

const getSummaries = (param) => {
  const { columns, data } = param;
  const sums = [];
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = h("div", { style: { fontWeight: "bold", textAlign: "center" } }, "总计");
      return;
    }
    if (column.property === "budget" || column.property === "spend") {
      const total = data.reduce((sum, item) => {
        return sum + Number(item[column.property] || 0);
      }, 0);
      sums[index] = total.toFixed(3);
      return;
    }
    sums[index] = "";
  });
  return sums;
};

const handleEdit = (row) => {
  console.log("Edit", activeTab.value, row);
  ElMessage.info("编辑功能暂未实现");
};

const handleDelete = (row) => {
  console.log("Delete", activeTab.value, row);
  ElMessage.info("删除功能暂未实现");
};
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.mb-10 {
  margin-bottom: 10px;
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

  :deep(.el-table) {
    --el-table-header-bg-color: var(--el-fill-color-light);
    --el-table-header-text-color: var(--el-text-color-regular);
    --el-table-row-hover-bg-color: var(--el-fill-color-light);
    --el-table-border-color: transparent;
    overflow: auto;
    border-radius: 12px;

    &::before {
      display: none;
    }

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

    .el-table__body-wrapper {
      .el-table__row {
        td.el-table__cell {
          padding: 12px 0;
          font-size: 14px;
          border-bottom: 1px solid var(--el-border-color-extra-light);
          overflow: visible !important;

          .cell {
            font-variant-numeric: tabular-nums;
            line-height: 1.4;
            overflow: visible !important;
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

  &:hover {
    border-color: var(--el-color-primary-light-3);
    box-shadow: 0 8px 25px rgba(64, 128, 255, 0.15);
  }
}

.function-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 12px 20px;
  background: var(--el-bg-color-overlay);
  border-radius: 12px 12px 0 0;
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

.tab-navigation {
  padding: 12px 20px;
  background: var(--el-bg-color-overlay);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  :deep(.el-tabs) {
    --el-tabs-header-height: 40px;

    .el-tabs__header {
      margin-bottom: 0;
    }

    .el-tabs__item {
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s linear;
    }

    .el-tabs__item.is-active {
      font-weight: 600;
      background-color: var(--el-color-primary-light-9);
      border-radius: 8px 8px 0 0;
    }

    .el-tabs__active-bar {
      height: 3px;
      border-radius: 2px;
    }
  }
}

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

:deep(.el-table__row) {
  transition: all 0.2s linear;

  &:hover {
    cursor: pointer;
    background-color: var(--el-color-primary-light-9);
  }
}

:deep(.el-table__empty-block) {
  min-height: 200px;

  .el-table__empty-text {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}

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

.mt-4 {
  margin-top: 1rem;
}

.flex {
  display: flex;
}

.justify-center {
  justify-content: center;
}

.action-buttons {
  display: inline-flex;
  gap: 8px;
  align-items: center;

  .action-btn {
    padding: 4px 16px !important;
    font-size: 13px !important;
    border-radius: 4px !important;
    min-height: auto !important;
    height: auto !important;
    line-height: 1.4;

    background: transparent !important;
    border: none !important;
    box-shadow: none !important;

    color: var(--el-text-color-regular) !important;
    transition: all 250ms ease !important;
    cursor: pointer;

    .el-icon {
      margin-right: 4px;
      font-size: 12px !important;
      vertical-align: middle;
    }

    span {
      vertical-align: middle;
    }

    &:hover {
      transform: translateY(-1px);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .action-btn-edit {
    color: var(--el-color-primary) !important;

    &:hover {
      color: var(--el-text-color-regular) !important;
      background: var(--el-color-primary-light-9) !important;
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.25) !important;
    }

    &:active {
      background: var(--el-color-primary-light-8) !important;
    }
  }

  .action-btn-delete {
    color: var(--el-color-danger) !important;

    &:hover {
      color: var(--el-text-color-regular) !important;
      background: var(--el-color-danger-light-9) !important;
      box-shadow: 0 2px 8px rgba(245, 108, 108, 0.25) !important;
    }

    &:active {
      background: var(--el-color-danger-light-8) !important;
    }
  }
}
</style>
