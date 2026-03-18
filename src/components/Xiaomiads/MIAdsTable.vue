<template>
  <!-- 表格区 -->
  <div class="table-container">
    <!-- 选项卡导航 -->
    <div class="tab-navigation">
      <el-tabs v-model="localActiveTab" type="card" @tab-change="handleTabChange">
        <el-tab-pane v-for="tab in tabs" :key="tab.value" :label="tab.label" :name="tab.value" />
      </el-tabs>
    </div>
    <!-- 添加按钮 -->
    <div class="function-bar">
      <div class="function-bar-content">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加{{
            localActiveTab === "campaign" ? "计划" : localActiveTab === "group" ? "广告组" : "创意"
          }}
        </el-button>
      </div>
    </div>
    <!-- 添加计划侧边栏 -->
    <CampaignAddDrawer
      :visible="showCampaignAdd"
      @update:visible="showCampaignAdd = $event"
      :account-options="accountOptions"
      :default-account-id="currentAccountId"
      @submit-success="handleCampaignAdded"
    />
    <!-- 添加广告组侧边栏 -->
    <GroupAddDrawer
      :visible="showGroupAdd"
      @update:visible="showGroupAdd = $event"
      :account-options="accountOptions"
      :campaign-options="campaignOptions"
      :default-account-id="currentAccountId"
      @submit-success="handleGroupAdded"
    />
    <el-table
      v-loading="loading"
      :data="data"
      :border="false"
      :highlight-current-row="false"
      height="calc(90vh - 300px)"
      show-summary
      :summary-method="getSummaries"
      @sort-change="handleSortChange"
    >
      <!-- 动态列 -->
      <el-table-column
        v-for="col in columns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :min-width="col.minWidth"
        :sortable="col.sortable"
        :align="col.align"
        :fixed="col.fixed"
      >
        <!-- 营销方式列 -->
        <template v-if="col.prop === 'campaignType'" #default="{ row }">
          {{ getTypeLabel(row.campaignType) }}
        </template>

        <!-- 状态列（开关） -->
        <template v-else-if="col.prop === 'status'" #default="{ row }">
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px">
            <el-switch
              :model-value="row.status === 0"
              :disabled="row.statusUpdating"
              :loading="row.statusUpdating"
              @update:model-value="
                (val) => {
                  if (localActiveTab === 'campaign') handleCampaignStatusChange(row, val);
                  else if (localActiveTab === 'group') handleGroupStatusChange(row, val);
                  else if (localActiveTab === 'creative') handleCreativeStatusChange(row, val);
                }
              "
            />
            <!-- 警示图标：仅当状态为关闭且有未投放原因时显示 -->
            <el-tooltip
              v-if="row.status === 1 && row.unDeliveryReason && row.unDeliveryReason.length > 0"
              :content="row.unDeliveryReason.join(', ')"
              placement="right"
            >
              <el-icon color="#E6A23C" style="cursor: help">
                <Warning />
              </el-icon>
            </el-tooltip>
          </div>
        </template>

        <!-- 日预算列（带气泡编辑） -->
        <template v-else-if="col.prop === 'dayBudget'" #default="{ row }">
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
              position: relative;
              width: 100%;
            "
          >
            <span>{{ row.dayBudget }}</span>
            <el-icon
              v-if="localActiveTab === 'campaign'"
              class="edit-icon"
              :class="{
                'is-editing-other': editingRowId !== null && editingRowId !== row.campaignId,
              }"
              style="cursor: pointer; color: #409eff"
              @click="startBudgetEdit(row)"
            >
              <Edit />
            </el-icon>

            <!-- 自定义气泡 -->
            <div v-if="row.budgetPopoverVisible" class="custom-budget-popover">
              <div class="budget-popover-content">
                <div class="budget-popover-row">
                  <el-select v-model="row.editingBudgetType" style="width: 100px">
                    <el-option label="限定" value="limited" />
                    <el-option label="不限" value="unlimited" />
                  </el-select>
                </div>
                <div v-if="row.editingBudgetType === 'limited'" class="budget-popover-row">
                  <el-input-number
                    v-model="row.editingBudgetValue"
                    :min="0"
                    :precision="2"
                    :step="10"
                    size="small"
                    style="width: 120px"
                  />
                </div>
                <div class="budget-popover-buttons">
                  <el-button size="small" @click="cancelBudgetEdit(row)">×</el-button>
                  <el-button size="small" type="primary" @click="submitBudget(row)">√</el-button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 操作列 -->
        <template v-else-if="col.prop === 'operation'" #default="{ row }">
          <div class="action-buttons">
            <el-button class="action-btn action-btn-edit" size="medium" @click="emit('edit', row)">
              <el-icon><Edit /></el-icon>
              <span>编辑</span>
            </el-button>
            <el-button
              class="action-btn action-btn-delete"
              size="small"
              @click="emit('delete', row)"
            >
              <el-icon><Delete /></el-icon>
              <span>删除</span>
            </el-button>
          </div>
        </template>

        <!-- 可点击的名称列 -->
        <template v-else #default="{ row }">
          <el-link
            v-if="col.clickable"
            type="primary"
            @click="handleNameClick(col, row)"
            :underline="false"
          >
            {{
              col.prop === "name"
                ? row.name
                : col.prop === "groupName"
                  ? row.groupName
                  : col.prop === "campaignName"
                    ? row.campaignName
                    : row[col.prop]
            }}
          </el-link>
          <span v-else>{{ row[col.prop] }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex justify-center">
      <el-pagination
        v-model:current-page="localPagination.currentPage"
        v-model:page-size="localPagination.pageSize"
        :page-sizes="localPagination.pageSizes"
        :total="localPagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="(val) => emit('size-change', val)"
        @current-change="(val) => emit('page-change', val)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, h } from "vue";
import { Plus, Edit, Delete, Warning } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import MiAdsAPI from "@/api/miads";
import CampaignAddDrawer from "@/components/Xiaomiads/CampaignAddDrawer.vue";
import GroupAddDrawer from "@/components/Xiaomiads/GroupAddDrawer.vue";

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  pagination: {
    type: Object,
    default: () => ({
      currentPage: 1,
      pageSize: 10,
      total: 0,
      pageSizes: [10, 20, 50, 100],
    }),
  },
  activeTab: { type: String, default: "campaign" },
  columns: { type: Array, default: () => [] },
  tabs: {
    type: Array,
    default: () => [
      { label: "广告计划", value: "campaign" },
      { label: "广告组", value: "group" },
      { label: "广告创意", value: "creative" },
    ],
  },
  accountOptions: { type: Array, default: () => [] },
  campaignOptions: { type: Array, default: () => [] },
  currentAccountId: [Number, String],
  editingRowId: [String, Number, null],
});

const emit = defineEmits([
  "update:activeTab",
  "tab-change",
  "add-click",
  "sort-change",
  "page-change",
  "size-change",
  "status-change",
  "edit",
  "delete",
  "budget-edit-start",
  "budget-edit-cancel",
  "budget-submit",
  "campaign-added",
  "group-added",
  "name-click",
]);

const localActiveTab = computed({
  get: () => props.activeTab,
  set: (val) => emit("update:activeTab", val),
});

const localPagination = reactive({
  currentPage: props.pagination.currentPage,
  pageSize: props.pagination.pageSize,
  total: props.pagination.total,
  pageSizes: props.pagination.pageSizes || [10, 20, 50, 100],
});

const syncPagination = () => {
  localPagination.currentPage = props.pagination.currentPage;
  localPagination.pageSize = props.pagination.pageSize;
  localPagination.total = props.pagination.total;
};

import { watch } from "vue";
watch(() => props.pagination, syncPagination, { deep: true });

const showCampaignAdd = ref(false);
const showGroupAdd = ref(false);

const marketingTypeOptions = [
  { label: "应用下载", value: "1" },
  { label: "H5", value: "2" },
  { label: "再营销", value: "3" },
];

const getTypeLabel = (type) => {
  const opt = marketingTypeOptions.find((o) => o.value === String(type));
  return opt ? opt.label : "-";
};

const getSummaries = (param) => {
  const { columns, data } = param;
  const sums = [];
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = h("div", { style: { fontWeight: "bold", textAlign: "center" } }, "总计");
      return;
    }
    if (column.property === "dayBudget") {
      let hasUnlimited = false;
      const total = data.reduce((sum, item) => {
        if (item.dayBudget === "不限") {
          hasUnlimited = true;
          return sum;
        }
        const val = item.dayBudget ? Number(String(item.dayBudget).replace(/,/g, "")) : 0;
        return sum + val;
      }, 0);
      sums[index] = hasUnlimited ? "不限" : total.toFixed(3);
      return;
    }
    sums[index] = "";
  });
  return sums;
};

const handleTabChange = (tabName) => {
  emit("update:activeTab", tabName);
  emit("tab-change", tabName);
};

const handleAdd = () => {
  if (localActiveTab.value === "campaign") {
    showCampaignAdd.value = true;
    emit("add-click");
  } else if (localActiveTab.value === "group") {
    showGroupAdd.value = true;
    emit("add-click");
  } else {
    ElMessage.warning("功能开发中");
  }
};

const handleSortChange = ({ prop, order }) => {
  emit("sort-change", { prop, order });
};

const handleCampaignAdded = () => {
  showCampaignAdd.value = false;
  emit("campaign-added");
};

const handleGroupAdded = () => {
  showGroupAdd.value = false;
  emit("group-added");
};

const handleNameClick = (col, row) => {
  emit("name-click", { col, row });
};

const startBudgetEdit = (row) => {
  emit("budget-edit-start", row);
};

const cancelBudgetEdit = (row) => {
  emit("budget-edit-cancel", row);
};

const submitBudget = async (row) => {
  emit("budget-submit", row);
};

const handleCampaignStatusChange = async (row, newStatus) => {
  emit("status-change", { row, newStatus, tab: "campaign" });
};

const handleGroupStatusChange = async (row, newStatus) => {
  emit("status-change", { row, newStatus, tab: "group" });
};

const handleCreativeStatusChange = async (row, newStatus) => {
  emit("status-change", { row, newStatus, tab: "creative" });
};
</script>

<style lang="scss" scoped>
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
    overflow: visible;
    border-radius: 0 0 12px 12px;
    z-index: 1;

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
        z-index: auto !important;
      }
    }

    .el-table__body-wrapper {
      .el-table__row {
        td.el-table__cell {
          padding: 12px 0;
          font-size: 14px;
          border-bottom: 1px solid var(--el-border-color-extra-light);
          overflow: visible !important;
          z-index: auto !important;

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

.function-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 12px 20px;
  background: var(--el-bg-color-overlay);
  border-radius: 0px 12px 0 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  .function-bar-content {
    display: flex;
    gap: 12px;
  }
}

.tab-navigation {
  padding: 0;
  border: 0;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.04);

  :deep(.el-tabs) {
    --el-tabs-header-height: 40px;

    .el-tabs__nav {
      border: 0;
      border-radius: 12px;
    }
    .el-tabs__header {
      margin-bottom: 0;
      border: 0;
    }

    .el-tabs__item {
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s linear;
      background: var(--el-bg-color-overlay);
    }
    #tab-campaign {
      border-radius: 12px 0 0 0;
    }
    #tab-creative {
      border-radius: 0 12px 0 0;
    }
    .el-tabs__item.is-active {
      font-weight: 600;
      background-color: var(--el-color-primary-light-9);
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

  .btn-prev, .btn-next, .el-pager li {
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

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;

  .action-btn {
    padding: 2px 6px !important;
    font-size: 15px !important;
    border-radius: 4px !important;
    min-height: auto !important;
    height: auto !important;
    line-height: 1.4;
    white-space: nowrap;
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
      box-shadow: 0 2px 8px rgba(89, 89, 89, 0.285) !important;
    }
    &:active {
      background: var(--el-color-primary-light-8) !important;
    }
  }

  .action-btn-delete {
    color: var(--el-color-danger) !important;
    margin: 0;
    &:hover {
      color: var(--el-text-color-regular) !important;
      background: var(--el-color-danger-light-9) !important;
      box-shadow: 0 2px 8px rgba(89, 89, 89, 0.285) !important;
    }
    &:active {
      background: var(--el-color-danger-light-8) !important;
    }
  }
}

.custom-budget-popover {
  position: absolute;
  z-index: 100000;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: var(--el-bg-color-overlay, #fff);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 12px;
  width: auto;
  min-width: 200px;
}

.budget-popover-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.budget-popover-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.budget-popover-buttons {
  display: flex;
  gap: 8px;
}

.edit-icon.is-editing-other {
  cursor: not-allowed !important;
  opacity: 0.5;
}

.flex { display: flex; }
.justify-center { justify-content: center; }
</style>

