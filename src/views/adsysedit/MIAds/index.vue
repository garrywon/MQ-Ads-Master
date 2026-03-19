<template>
  <div class="app-container">
    <!-- 筛选栏 -->
    <div class="search-container mb-10">
      <el-form :model="currentSearchForm" inline>
        <!-- 账户选择（三个层级都显示，但只有第一个用于查询） -->
        <el-form-item label="账户">
          <el-select
            v-model="currentSearchForm.accountId"
            placeholder="选择账户"
            @change="handleAccountChange"
            :disabled="accountLoading"
            filterable
            allow-create
            default-first-option
            style="width: 110px"
          >
            <el-option
              v-for="opt in currentAccountOptions"
              :key="opt.value"
              :value="opt.value"
              :label="opt.label"
            />
          </el-select>
        </el-form-item>

        <!-- 计划层级特有筛选 -->
        <template v-if="activeTab === 'campaign'">
          <el-form-item label="计划">
            <el-select
              v-model="sharedCampaignFilter.searchType"
              placeholder="选择类型"
              style="width: 100px; margin-right: 8px"
              @change="handleCampaignSearchTypeChange"
            >
              <el-option label="按ID" value="id" />
              <el-option label="按名称" value="name" />
            </el-select>
            <el-select
              v-if="sharedCampaignFilter.searchType === 'id'"
              v-model="sharedCampaignFilter.campaignIds"
              placeholder="选择计划ID"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              :options="currentCampaignIdOptions"
              style="width: 180px"
              clearable
            />
            <el-select
              v-else
              v-model="sharedCampaignFilter.campaignNames"
              placeholder="选择计划名称"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              :options="currentCampaignNameOptions"
              style="width: 180px"
              clearable
            />
          </el-form-item>
        </template>

        <!-- 组层级特有筛选 -->
        <template v-if="activeTab === 'group'">
          <el-form-item label="计划">
            <el-select
              v-model="sharedCampaignFilter.searchType"
              placeholder="选择类型"
              style="width: 100px; margin-right: 8px"
              @change="handleCampaignSearchTypeChange"
            >
              <el-option label="按ID" value="id" />
              <el-option label="按名称" value="name" />
            </el-select>
            <el-select
              v-if="sharedCampaignFilter.searchType === 'id'"
              v-model="sharedCampaignFilter.campaignIds"
              placeholder="选择计划ID"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              :options="currentGroupCampaignIdOptions"
              style="width: 180px"
              clearable
              @change="handleGroupCampaignChange"
            />
            <el-select
              v-else
              v-model="sharedCampaignFilter.campaignNames"
              placeholder="选择计划名称"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              :options="currentGroupCampaignNameOptions"
              style="width: 180px"
              clearable
              @change="handleGroupCampaignChange"
            />
          </el-form-item>
          <el-form-item label="组">
            <el-select
              v-model="sharedGroupFilter.searchType"
              placeholder="选择类型"
              style="width: 100px; margin-right: 8px"
              @change="handleGroupSearchTypeChange"
            >
              <el-option label="按ID" value="id" />
              <el-option label="按名称" value="name" />
            </el-select>
            <el-select
              v-if="sharedGroupFilter.searchType === 'id'"
              v-model="sharedGroupFilter.groupIds"
              placeholder="选择组ID"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              :options="currentGroupIdOptions"
              style="width: 180px"
              clearable
            />
            <el-select
              v-else
              v-model="sharedGroupFilter.groupNames"
              placeholder="选择组名称"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              :options="currentGroupGroupNameOptions"
              style="width: 180px"
              clearable
            />
          </el-form-item>
        </template>

        <!-- 创意层级特有筛选 -->
        <template v-if="activeTab === 'creative'">
          <el-form-item label="计划">
            <el-select
              v-model="sharedCampaignFilter.searchType"
              placeholder="选择类型"
              style="width: 100px; margin-right: 8px"
              @change="handleCampaignSearchTypeChange"
            >
              <el-option label="按ID" value="id" />
              <el-option label="按名称" value="name" />
            </el-select>
            <el-select
              v-if="sharedCampaignFilter.searchType === 'id'"
              v-model="sharedCampaignFilter.campaignIds"
              placeholder="选择计划ID"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              :options="creativeCampaignIdOptions"
              style="width: 180px"
              clearable
              @change="handleCreativeCampaignChange"
            />
            <el-select
              v-else
              v-model="sharedCampaignFilter.campaignNames"
              placeholder="选择计划名称"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              :options="creativeCampaignNameOptions"
              style="width: 180px"
              clearable
              @change="handleCreativeCampaignChange"
            />
          </el-form-item>
          <el-form-item label="组">
            <el-select
              v-model="sharedGroupFilter.searchType"
              placeholder="选择类型"
              style="width: 100px; margin-right: 8px"
              @change="handleGroupSearchTypeChange"
            >
              <el-option label="按ID" value="id" />
              <el-option label="按名称" value="name" />
            </el-select>
            <el-select
              v-if="sharedGroupFilter.searchType === 'id'"
              v-model="sharedGroupFilter.groupIds"
              placeholder="选择组ID"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              :options="creativeGroupIdOptions"
              style="width: 180px"
              clearable
              @change="handleCreativeGroupChange"
            />
            <el-select
              v-else
              v-model="sharedGroupFilter.groupNames"
              placeholder="选择组名称"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              :options="creativeGroupNameOptions"
              style="width: 180px"
              clearable
              @change="handleCreativeGroupChange"
            />
          </el-form-item>
          <el-form-item label="创意">
            <el-select
              v-model="sharedCreativeFilter.searchType"
              placeholder="选择类型"
              style="width: 100px; margin-right: 8px"
              @change="handleCreativeSearchTypeChange"
            >
              <el-option label="按ID" value="id" />
              <el-option label="按名称" value="name" />
            </el-select>
            <el-select
              v-if="sharedCreativeFilter.searchType === 'id'"
              v-model="sharedCreativeFilter.creativeIds"
              placeholder="选择创意ID"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              :options="currentCreativeIdOptions"
              style="width: 180px"
              clearable
            />
            <el-select
              v-else
              v-model="sharedCreativeFilter.creativeNames"
              placeholder="选择创意名称"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              :options="currentCreativeNameOptions"
              style="width: 180px"
              clearable
            />
          </el-form-item>
        </template>

        <!-- 状态单选（三个层级都显示） -->
        <el-form-item label="状态">
          <el-select
            v-model="currentSearchForm.status"
            placeholder="选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="投放中" :value="0" />
            <el-option label="已暂停" :value="1" />
          </el-select>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleAutoQuery">查询</el-button>
          <el-button @click="handleReset(activeTab)">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格组件 -->
    <MIAdsTable
      v-model:active-tab="activeTab"
      :data="currentTableData"
      :loading="currentLoading"
      :pagination="currentPagination"
      :columns="tableColumns"
      :tabs="tabs"
      :account-options="accountOptionsShared"
      :campaign-options="currentGroupCampaignIdOptions"
      :current-account-id="currentSearchForm.accountId"
      :editing-row-id="currentEditingRowId"
      @tab-change="handleTabChange"
      @add-click="handleAdd"
      @sort-change="handleSortChange"
      @page-change="handleCurrentChange"
      @size-change="handleSizeChange"
      @status-change="handleStatusChange"
      @edit="handleEdit"
      @delete="handleDelete"
      @budget-edit-start="handleBudgetEditStart"
      @budget-edit-cancel="handleBudgetEditCancel"
      @budget-submit="handleBudgetSubmit"
      @campaign-added="handleCampaignAdded"
      @group-added="handleGroupAdded"
      @name-click="(payload) => handleNameClick(payload.col, payload.row)"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from "vue";
import { ElMessage } from "element-plus";
import MiAdsAPI from "@/api/miads";
import MIAdsTable from "@/components/Xiaomiads/MIAdsTable.vue";

// ==================== 状态定义 ====================

// 当前激活的选项卡
const activeTab = ref("campaign"); // 'campaign' | 'group' | 'creative'

// 预算编辑 - 唯一编辑行控制
const currentEditingRowId = ref(null);

// 账户数据加载状态
const accountLoading = ref(false);
const accountDataLoaded = ref(false);

// 新增：当前选中的账户ID（用于所有基础数据加载）
const currentAccountId = ref(null);

// 共享的账户选项（三个选项卡共用）
const accountOptionsShared = ref([]);

// 共享的计划筛选状态（三个维度共用）
const sharedCampaignFilter = reactive({
  searchType: "id",
  campaignIds: [],
  campaignNames: [],
});

// 共享的组筛选状态（group和creative维度共用）
const sharedGroupFilter = reactive({
  searchType: "id",
  groupIds: [],
  groupNames: [],
});

// 共享的创意筛选状态（仅creative维度使用）
const sharedCreativeFilter = reactive({
  searchType: "id",
  creativeIds: [],
  creativeNames: [],
});

// 选项卡配置
const tabs = [
  { label: "广告计划", value: "campaign" },
  { label: "广告组", value: "group" },
  { label: "广告创意", value: "creative" },
];

// 营销方式选项
const marketingTypeOptions = [
  { label: "应用下载", value: "1" },
  { label: "H5", value: "2" },
  { label: "再营销", value: "3" },
];

// 出价类型选项
const billingTypeOptions = [
  { label: "CPA", value: "11" },
  { label: "CPC", value: "2" },
];

const getBillingTypeLabel = (type) => {
  const opt = billingTypeOptions.find((o) => o.value === String(type));
  return opt ? opt.label : "-";
};

// 排序状态（共享）
const sortState = reactive({
  prop: "",
  order: "",
});

// 每个选项卡的独立状态
const tabStates = reactive({
  campaign: {
    allBasicData: ref([]),
    nameToIdMap: ref({}),
    tableData: ref([]),
    loading: ref(false),
    pagination: reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0,
      pageSizes: [10, 20, 50, 100],
    }),
    searchForm: reactive({
      accountId: null,
      status: null,
    }),
    accountOptions: ref([]),
    campaignIdOptions: ref([]),
    campaignOptions: ref([]),
  },
  group: {
    allBasicData: ref([]),
    nameToIdMap: ref({}),
    tableData: ref([]),
    loading: ref(false),
    pagination: reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0,
      pageSizes: [10, 20, 50, 100],
    }),
    searchForm: reactive({
      accountId: null,
      status: null,
    }),
    accountOptions: ref([]),
    campaignIdOptions: ref([]),
    groupIdOptions: ref([]),
    groupOptions: ref([]),
  },
  creative: {
    allBasicData: ref([]),
    nameToIdMap: ref({}),
    tableData: ref([]),
    loading: ref(false),
    pagination: reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0,
      pageSizes: [10, 20, 50, 100],
    }),
    searchForm: reactive({
      accountId: null,
      status: null,
    }),
    accountOptions: ref([]),
    groupOptions: ref([]),
    campaignOptions: ref([]),
    creativeIdOptions: ref([]),
    creativeOptions: ref([]),
  },
});

// ==================== 计算属性 ====================

const currentTabState = computed(() => tabStates[activeTab.value]);
const currentTableData = computed(() => {
  const rawData = currentTabState.value.tableData;
  if (activeTab.value === "group") {
    return rawData.map((record) => ({
      ...record,
      billingTypeLabel: record.billingType === 11 ? "CPA" : record.billingType === 2 ? "CPC" : "-",
      productTypeLabel: record.productType === 1 ? "GA" : record.productType === 2 ? "GP" : "-",
    }));
  }
  return rawData;
});
const currentLoading = computed(() => currentTabState.value.loading);
const currentPagination = computed(() => currentTabState.value.pagination);
const currentSearchForm = computed(() => currentTabState.value.searchForm);

const currentAccountOptions = computed(() => currentTabState.value.accountOptions);
const currentCampaignIdOptions = computed(() => tabStates.campaign.campaignIdOptions);
const currentCampaignNameOptions = computed(() => tabStates.campaign.campaignOptions);
const currentGroupCampaignIdOptions = computed(() => tabStates.group.campaignIdOptions);
const currentGroupCampaignNameOptions = computed(() => tabStates.group.groupOptions);
const currentGroupIdOptions = computed(() => tabStates.group.groupIdOptions);
const currentGroupGroupNameOptions = computed(() => tabStates.group.groupOptions);
const currentCreativeIdOptions = computed(() => tabStates.creative.creativeIdOptions);
const currentCreativeNameOptions = computed(() => tabStates.creative.creativeOptions);
const creativeCampaignIdOptions = computed(() => tabStates.creative.campaignIdOptions);
const creativeCampaignNameOptions = computed(() => tabStates.creative.campaignNameOptions);
const creativeGroupIdOptions = computed(() => tabStates.creative.groupIdOptions);
const creativeGroupNameOptions = computed(() => tabStates.creative.groupNameOptions);

const creativeCampaignOptions = computed(() => tabStates.creative.campaignIdOptions);
const creativeGroupOptions = computed(() => tabStates.creative.groupIdOptions);

// 动态表格列配置
const tableColumns = computed(() => {
  const baseColumns = [
    {
      prop: "accountId",
      label: "账户ID",
      minWidth: 80,
      sortable: true,
      align: "center",
      fixed: "left",
    },
    { prop: "name", label: "名称", minWidth: 150, sortable: true, align: "center" },
    { prop: "campaignId", label: "计划ID", minWidth: 140, sortable: true, align: "center" },
    { prop: "status", label: "状态", minWidth: 100, sortable: true, align: "center" },
  ];

  if (activeTab.value === "campaign") {
    return [
      baseColumns[0], // accountId
      {
        prop: "name",
        label: "计划名称",
        minWidth: 180,
        sortable: true,
        align: "center",
        clickable: true,
        targetTab: "group",
      },
      baseColumns[2], // campaignId
      { prop: "campaignType", label: "营销方式", minWidth: 140, sortable: true, align: "center" },
      { prop: "dayBudget", label: "日预算", minWidth: 140, sortable: true, align: "center" },
      baseColumns[3], // status
      { prop: "operation", label: "操作", minWidth: 140, fixed: "right", align: "center" },
    ];
  }

  if (activeTab.value === "group") {
    return [
      baseColumns[0], // accountId
      {
        prop: "name",
        label: "组名称",
        minWidth: 220,
        sortable: true,
        align: "center",
        clickable: true,
        targetTab: "creative",
      },
      { prop: "groupId", label: "广告组ID", minWidth: 140, sortable: true, align: "center" },
      {
        prop: "campaignName",
        label: "计划名称",
        minWidth: 200,
        sortable: true,
        align: "center",
        clickable: true,
        targetTab: "campaign",
      },
      baseColumns[2], // campaignId
      { prop: "dayBudget", label: "日预算", minWidth: 140, sortable: true, align: "center" },
      { prop: "bid", label: "出价(美元)", minWidth: 140, sortable: true, align: "center" },
      {
        prop: "targetROI",
        label: "目标ROI",
        minWidth: 120,
        sortable: true,
        align: "center",
      },
      {
        prop: "purchaseMethod",
        label: "买量方式",
        minWidth: 100,
        sortable: true,
        align: "center",
      },
      { prop: "packageName", label: "包名", minWidth: 180, sortable: true, align: "center" },
      baseColumns[3], // status
      { prop: "operation", label: "操作", minWidth: 140, fixed: "right", align: "center" },
    ];
  }

  if (activeTab.value === "creative") {
    return [
      baseColumns[0], // accountId
      {
        prop: "name",
        label: "创意名称",
        minWidth: 180,
        sortable: true,
        align: "center",
      },
      { prop: "creativeId", label: "广告创意ID", minWidth: 140, sortable: true, align: "center" },
      {
        prop: "campaignName",
        label: "计划名称",
        minWidth: 180,
        sortable: true,
        align: "center",
        clickable: true,
        targetTab: "campaign",
      },
      baseColumns[2], // campaignId
      {
        prop: "groupName",
        label: "组名称",
        minWidth: 200,
        sortable: true,
        align: "center",
        clickable: true,
        targetTab: "group",
      },
      { prop: "groupId", label: "组ID", minWidth: 140, sortable: true, align: "center" },
      baseColumns[3], // status
      { prop: "operation", label: "操作", minWidth: 140, fixed: "right", align: "center" },
    ];
  }

  return baseColumns;
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

const formatDayBudget = (val) => {
  // 当日预算为0时，显示为"不限"
  if (val === 0) return "不限";
  return formatBudget(val);
};

const getStatusLabel = (status) => {
  if (status === 0) return "投放中";
  if (status === 1) return "未投放";
  return "未知";
};

const getStatusType = (status) => {
  return status === 0 ? "success" : status === 1 ? "info" : "warning";
};

const getTypeLabel = (type) => {
  const opt = marketingTypeOptions.find((o) => o.value === String(type));
  return opt ? opt.label : "-";
};

const getPurchaseMethodLabel = (billingType, optimizeGoal = null) => {
  // 当 optimizeGoal=4 且 billingType=2 时，显示 ROAS
  if (optimizeGoal === 4 && billingType === 2) {
    return "ROAS";
  }
  // 当 optimizeGoal=1 且 billingType=2 时，显示 OCPC
  if (optimizeGoal === 1 && billingType === 2) {
    return "OCPC";
  }
  // 否则显示 billingType 对应的标签
  return getBillingTypeLabel(billingType);
};

const buildNameToIdMap = (dataArray) => {
  const map = {};
  dataArray.forEach((item) => {
    const name = item.label;
    const id = item.value;
    if (!map[name]) map[name] = new Set();
    map[name].add(id);
  });
  return map;
};

const filterByName = (name, allBasicData) => {
  if (!name) return [];
  const lowerName = name.toLowerCase().trim();
  return allBasicData
    .filter((item) => item.label && item.label.toLowerCase().includes(lowerName))
    .map((item) => Number(item.value));
};

// ==================== 数据获取与处理 ====================

const convertResponseData = (records, type) => {
  if (!records) return [];
  return records
    .map((item) => {
      const base = {
        accountId: item.accountId,
        name: item.name,
        status: item.status,
        unDeliveryReason: item.unDeliveryReason || [],
        createTime: item.createTime,
        updateTime: item.updateTime,
      };

      if (type === "campaign") {
        return {
          ...base,
          campaignId: item.campaignId,
          dayBudget: formatDayBudget(item.dayBudget),
          campaignType: item.campaignType,
          statusUpdating: false,
        };
      } else if (type === "group") {
        // 从 campaignBasic 推导 campaignName
        const campaignBasic = tabStates.campaign.allBasicData;
        const campaign = campaignBasic.find((c) => String(c.value) === String(item.campaignId));
        const campaignName = campaign ? campaign.label : "";

        // 提取 adRevenueValue 中的 roasTarget
        const adRevenueValue = item.adRevenueValue || {};
        const roasTarget = adRevenueValue.roasTarget;
        const purchaseMethod = getPurchaseMethodLabel(item.billingType, item.optimizeGoal);

        return {
          ...base,
          groupId: item.groupId,
          campaignId: item.campaignId,
          dayBudget: formatDayBudget(item.dayBudget),
          billingType: item.billingType,
          productType: item.productType,
          packageName: item.packageName,
          bid: formatBudget(item.bid),
          campaignName: campaignName,
          optimizeGoal: item.optimizeGoal,
          purchaseMethod: purchaseMethod,
          targetROI: purchaseMethod === "ROAS" && roasTarget != null ? `${roasTarget}%` : "-", // 格式化显示
          statusUpdating: false,
        };
      } else if (type === "creative") {
        const groupBasic = tabStates.group.allBasicData;
        const group = groupBasic.find((g) => String(g.value) === String(item.groupId));
        // 从 groupBasic 推导 campaignId
        const campaignId = group ? group.campaignId : null;
        // 从 campaignBasic 推导 campaignName
        const campaignBasic = tabStates.campaign.allBasicData;
        const campaign = campaignBasic.find((c) => String(c.value) === String(campaignId));
        const campaignName = campaign ? campaign.label : "";
        return {
          ...base,
          creativeId: item.creativeId,
          groupId: item.groupId,
          campaignId: campaignId,
          groupName: group ? group.label : "",
          campaignName: campaignName,
          statusUpdating: false,
        };
      }
      return item;
    })
    .map((item) => ({
      ...item,
      createTime: formatTime(item.createTime),
      updateTime: formatTime(item.updateTime),
    }));
};

const applyFilterAndSort = async (tabName = activeTab.value) => {
  const state = tabStates[tabName];
  const form = state.searchForm;

  const params = {
    page: state.pagination.currentPage,
    page_size: state.pagination.pageSize,
  };

  if (tabName === "campaign" || tabName === "group") {
    if (currentAccountId.value) {
      params.account_ids = [currentAccountId.value];
    }
  }

  if (tabName === "campaign" || tabName === "group") {
    if (sharedCampaignFilter.searchType === "id" && sharedCampaignFilter.campaignIds?.length > 0) {
      params.campaign_ids = sharedCampaignFilter.campaignIds.map(Number);
    }
  }

  if (tabName === "campaign") {
    if (
      sharedCampaignFilter.searchType === "name" &&
      sharedCampaignFilter.campaignNames?.length > 0
    ) {
      const matchedIds = sharedCampaignFilter.campaignNames
        .map((name) => {
          const item = state.allBasicData.find((opt) => opt.value === name);
          return item ? Number(item.value) : null;
        })
        .filter((id) => id !== null);
      if (matchedIds.length > 0) {
        params.campaign_ids = params.campaign_ids
          ? [...new Set([...params.campaign_ids, ...matchedIds])]
          : matchedIds;
      } else {
        state.tableData = [];
        state.pagination.total = 0;
        return;
      }
    }
  }

  if (tabName === "group" || tabName === "creative") {
    if (sharedGroupFilter.searchType === "id" && sharedGroupFilter.groupIds?.length > 0) {
      params.group_ids = sharedGroupFilter.groupIds.map(Number);
    }
  }

  if (tabName === "group") {
    if (
      sharedCampaignFilter.searchType === "name" &&
      sharedCampaignFilter.campaignNames?.length > 0
    ) {
      const matchedIds = sharedCampaignFilter.campaignNames
        .map((name) => {
          const item = state.allBasicData.find((opt) => opt.value === name);
          return item ? Number(item.value) : null;
        })
        .filter((id) => id !== null);
      if (matchedIds.length > 0) {
        params.campaign_ids = params.campaign_ids
          ? [...new Set([...params.campaign_ids, ...matchedIds])]
          : matchedIds;
      } else {
        state.tableData = [];
        state.pagination.total = 0;
        return;
      }
    }
    // 处理组名称搜索
    if (sharedGroupFilter.searchType === "name" && sharedGroupFilter.groupNames?.length > 0) {
      const groupState = tabStates.group;
      const matchedIds = sharedGroupFilter.groupNames
        .map((name) => {
          const item = groupState.allBasicData.find((opt) => opt.value === name);
          return item ? Number(item.value) : null;
        })
        .filter((id) => id !== null);
      if (matchedIds.length > 0) {
        params.group_ids = params.group_ids
          ? [...new Set([...params.group_ids, ...matchedIds])]
          : matchedIds;
      } else {
        state.tableData = [];
        state.pagination.total = 0;
        return;
      }
    }
  }

  if (tabName === "creative") {
    // 处理组ID搜索（传给API）
    if (sharedGroupFilter.searchType === "id" && sharedGroupFilter.groupIds?.length > 0) {
      params.group_ids = sharedGroupFilter.groupIds.map(Number);
    }
    // 处理组名称搜索（传给API）
    if (sharedGroupFilter.searchType === "name" && sharedGroupFilter.groupNames?.length > 0) {
      const groupState = tabStates.group;
      const matchedIds = sharedGroupFilter.groupNames
        .map((name) => {
          const item = groupState.allBasicData.find((opt) => opt.value === name);
          return item ? Number(item.value) : null;
        })
        .filter((id) => id !== null);
      if (matchedIds.length > 0) {
        params.group_ids = params.group_ids
          ? [...new Set([...params.group_ids, ...matchedIds])]
          : matchedIds;
      } else {
        state.tableData = [];
        state.pagination.total = 0;
        return;
      }
    }
    // 创意层如果没选组，默认传当前计划的组，或当前账户所有组
    if (!params.group_ids || params.group_ids.length === 0) {
      let gIds = [];
      // 根据计划筛选条件获取对应的组
      let selectedCampaignId = null;
      if (
        sharedCampaignFilter.searchType === "id" &&
        sharedCampaignFilter.campaignIds?.length > 0
      ) {
        selectedCampaignId = sharedCampaignFilter.campaignIds[0];
      } else if (
        sharedCampaignFilter.searchType === "name" &&
        sharedCampaignFilter.campaignNames?.length > 0
      ) {
        const selectedName = sharedCampaignFilter.campaignNames[0];
        const campaignItem = tabStates.campaign.allBasicData.find(
          (opt) => opt.value === selectedName
        );
        selectedCampaignId = campaignItem ? campaignItem.value : null;
      }
      if (selectedCampaignId) {
        const groupBasic = tabStates.group.allBasicData;
        const filteredGroups = groupBasic.filter(
          (g) => String(g.campaignId) === String(selectedCampaignId)
        );
        gIds = filteredGroups.map((g) => Number(g.value));
      } else {
        gIds = tabStates.group.allBasicData.map((g) => Number(g.value));
      }
      if (gIds.length > 0) {
        params.group_ids = gIds;
      }
    }
  }

  if (tabName === "creative") {
    // 创意ID和创意名称仅用于本地筛选，不传给API
    // ...（此处省略，因为不需要传给API）
  }

  if (form.status !== null && form.status !== undefined && form.status !== "") {
    params.status = Number(form.status);
  }

  console.log("[MIAdsView] 请求参数:", params);

  state.loading = true;
  try {
    let res;
    if (tabName === "campaign") {
      res = await MiAdsAPI.queryCampaigns(params);
      console.log("[MIAdsView] queryCampaigns 返回:", res);
    } else if (tabName === "group") {
      res = await MiAdsAPI.queryGroups(params);
      console.log("[MIAdsView] queryGroups 返回:", res);
    } else if (tabName === "creative") {
      res = await MiAdsAPI.queryCreatives(params);
      console.log("[MIAdsView] queryCreatives 返回:", res);
    }
    const records = res?.records || [];
    if (records.length > 0) {
      // 提取所有广告ID
      let ids = [];
      let businessType;
      if (tabName === "campaign") {
        ids = records.map((item) => item.campaignId);
        businessType = 1;
      } else if (tabName === "group") {
        ids = records.map((item) => item.groupId);
        businessType = 2;
      } else if (tabName === "creative") {
        ids = records.map((item) => item.creativeId);
        businessType = 3;
      }

      // 批量查询状态
      try {
        const statusRes = await MiAdsAPI.queryAdStatus(businessType, ids);
        const statusMap = {};
        (statusRes?.adInfo || []).forEach((item) => {
          statusMap[item.id] = item;
        });

        // 将状态添加到记录中
        const recordsWithStatus = records.map((item) => {
          let adId;
          if (tabName === "campaign") adId = item.campaignId;
          else if (tabName === "group") adId = item.groupId;
          else if (tabName === "creative") adId = item.creativeId;
          return {
            ...item,
            status: statusMap[adId]?.status ?? -1,
            unDeliveryReason: statusMap[adId]?.unDeliveryReason || [],
          };
        });

        state.tableData = convertResponseData(recordsWithStatus, tabName);
      } catch (statusError) {
        console.error("获取状态失败:", statusError);
        state.tableData = convertResponseData(records, tabName);
      }

      state.pagination.total = res?.total || 0;
    } else {
      state.tableData = [];
      state.pagination.total = 0;
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("加载数据失败");
    state.tableData = [];
  } finally {
    state.loading = false;
  }
};

const loadBasicDataForAccount = async (accountId) => {
  try {
    const [campaignBasic, groupBasic, creativeBasic] = await Promise.all([
      MiAdsAPI.getAllCampaignsBasic(accountId),
      MiAdsAPI.getAllGroupsBasic(accountId),
      (async () => {
        const groups = await MiAdsAPI.getAllGroupsBasic(accountId);
        const groupIds = groups.map((g) => Number(g.value));
        return MiAdsAPI.getAllCreativesBasic(groupIds);
      })(),
    ]);

    // Campaign
    tabStates.campaign.allBasicData = campaignBasic;
    tabStates.campaign.nameToIdMap = buildNameToIdMap(campaignBasic);
    tabStates.campaign.campaignIdOptions = campaignBasic.map((item) => ({
      value: item.value,
      label: item.value,
    }));
    tabStates.campaign.campaignOptions = campaignBasic.map((item) => ({
      value: item.value,
      label: item.label,
    }));

    // 初始化共享的计划筛选状态
    sharedCampaignFilter.searchType = "id";
    sharedCampaignFilter.campaignIds = [];
    sharedCampaignFilter.campaignNames = [];

    // 初始化共享的组筛选状态
    sharedGroupFilter.searchType = "id";
    sharedGroupFilter.groupIds = [];
    sharedGroupFilter.groupNames = [];

    // 初始化共享的创意筛选状态
    sharedCreativeFilter.searchType = "id";
    sharedCreativeFilter.creativeIds = [];
    sharedCreativeFilter.creativeNames = [];

    // Group
    tabStates.group.allBasicData = groupBasic;
    tabStates.group.nameToIdMap = buildNameToIdMap(groupBasic);
    tabStates.group.groupIdOptions = groupBasic.map((item) => ({
      value: item.value,
      label: item.value,
    }));
    tabStates.group.groupOptions = groupBasic.map((item) => ({
      value: item.value,
      label: item.label,
      billingType: item.billingType,
      productType: item.productType,
      packageName: item.packageName,
    }));
    const campaignIdsInGroups = [...new Set(groupBasic.map((item) => item.campaignId))];
    tabStates.group.campaignIdOptions = campaignIdsInGroups.map((id) => ({
      value: String(id),
      label: String(id),
    }));

    // Creative
    tabStates.creative.allBasicData = creativeBasic;
    tabStates.creative.nameToIdMap = buildNameToIdMap(creativeBasic);
    tabStates.creative.creativeIdOptions = creativeBasic.map((item) => ({
      value: item.value,
      label: item.value,
    }));
    tabStates.creative.creativeOptions = creativeBasic.map((item) => ({
      value: item.value,
      label: item.label,
    }));
    const campaignIdsInCreatives = [...new Set(groupBasic.map((item) => item.campaignId))];
    // 从campaignBasic中获取计划名称映射
    const campaignMap = {};
    campaignBasic.forEach((item) => {
      campaignMap[item.value] = item.label;
    });
    // 计划选项 - 按ID显示ID，按名称显示名称
    tabStates.creative.campaignIdOptions = campaignIdsInCreatives.map((id) => ({
      value: String(id),
      label: String(id),
    }));
    tabStates.creative.campaignNameOptions = campaignIdsInCreatives.map((id) => ({
      value: String(id),
      label: campaignMap[String(id)] || String(id),
    }));
    tabStates.creative.campaignOptions = campaignIdsInCreatives.map((id) => ({
      value: String(id),
      label: campaignMap[String(id)] || String(id),
    }));

    // 组选项 - 按ID显示ID，按名称显示名称
    tabStates.creative.groupIdOptions = groupBasic.map((item) => ({
      value: item.value,
      label: item.value,
    }));
    tabStates.creative.groupNameOptions = groupBasic.map((item) => ({
      value: item.value,
      label: item.label,
    }));
    tabStates.creative.groupOptions = groupBasic.map((item) => ({
      value: item.value,
      label: item.value,
    }));

    applyFilterAndSort(activeTab.value);
  } catch (error) {
    console.error("Failed to reload basic data for account:", error);
    ElMessage.error("重新加载数据失败");
  }
};

const handleAccountChange = (newAccountId) => {
  if (!newAccountId) return;

  currentAccountId.value = Number(newAccountId);

  tabStates.campaign.searchForm.accountId = newAccountId;
  tabStates.group.searchForm.accountId = newAccountId;
  tabStates.creative.searchForm.accountId = newAccountId;

  loadBasicDataForAccount(newAccountId);
};

const handleCreativeCampaignChange = () => {
  // 获取选中的计划ID
  let selectedCampaignId = null;
  if (sharedCampaignFilter.searchType === "id" && sharedCampaignFilter.campaignIds?.length > 0) {
    selectedCampaignId = sharedCampaignFilter.campaignIds[0];
  } else if (
    sharedCampaignFilter.searchType === "name" &&
    sharedCampaignFilter.campaignNames?.length > 0
  ) {
    const selectedName = sharedCampaignFilter.campaignNames[0];
    const campaignItem = tabStates.campaign.allBasicData.find((opt) => opt.value === selectedName);
    selectedCampaignId = campaignItem ? campaignItem.value : null;
  }

  const groupBasic = tabStates.group.allBasicData;

  // 如果没有选择计划，显示所有组；否则显示该计划下的组
  let filteredGroups;
  if (selectedCampaignId) {
    filteredGroups = groupBasic.filter((g) => String(g.campaignId) === String(selectedCampaignId));
  } else {
    filteredGroups = groupBasic;
  }
  tabStates.creative.groupOptions = filteredGroups.map((g) => ({ value: g.value, label: g.label }));

  // 清空组的筛选条件
  sharedGroupFilter.groupIds = [];
  sharedGroupFilter.groupNames = [];

  // 清空创意的筛选条件
  sharedCreativeFilter.creativeIds = [];
  sharedCreativeFilter.creativeNames = [];

  handleAutoQuery();
};

const handleGroupCampaignChange = () => {
  // 获取选中的计划ID
  let selectedCampaignId = null;
  if (sharedCampaignFilter.searchType === "id" && sharedCampaignFilter.campaignIds?.length > 0) {
    selectedCampaignId = sharedCampaignFilter.campaignIds[0];
  } else if (
    sharedCampaignFilter.searchType === "name" &&
    sharedCampaignFilter.campaignNames?.length > 0
  ) {
    const selectedName = sharedCampaignFilter.campaignNames[0];
    const campaignItem = tabStates.campaign.allBasicData.find((opt) => opt.value === selectedName);
    selectedCampaignId = campaignItem ? campaignItem.value : null;
  }

  const groupBasic = tabStates.group.allBasicData;

  // 如果没有选择计划，显示所有组；否则显示该计划下的组
  let filteredGroups;
  if (selectedCampaignId) {
    filteredGroups = groupBasic.filter((g) => String(g.campaignId) === String(selectedCampaignId));
  } else {
    filteredGroups = groupBasic;
  }

  // 更新group维度的组选项
  tabStates.group.groupIdOptions = filteredGroups.map((g) => ({ value: g.value, label: g.value }));
  tabStates.group.groupOptions = filteredGroups.map((g) => ({ value: g.value, label: g.label }));

  // 清空组的筛选条件
  sharedGroupFilter.groupIds = [];
  sharedGroupFilter.groupNames = [];

  handleAutoQuery();
};

const handleCreativeGroupChange = () => {
  // 获取选中的组ID
  let selectedGroupId = null;
  if (sharedGroupFilter.searchType === "id" && sharedGroupFilter.groupIds?.length > 0) {
    selectedGroupId = sharedGroupFilter.groupIds[0];
  } else if (sharedGroupFilter.searchType === "name" && sharedGroupFilter.groupNames?.length > 0) {
    const selectedName = sharedGroupFilter.groupNames[0];
    const groupItem = tabStates.group.allBasicData.find((opt) => opt.value === selectedName);
    selectedGroupId = groupItem ? groupItem.value : null;
  }

  const creativeBasic = tabStates.creative.allBasicData;

  // 根据选择的组过滤创意，如果没有选择组则显示所有创意
  let filteredCreatives = creativeBasic;
  if (selectedGroupId) {
    filteredCreatives = creativeBasic.filter((c) => String(c.groupId) === String(selectedGroupId));
  }

  // 更新创意选项
  tabStates.creative.creativeIdOptions = filteredCreatives.map((c) => ({
    value: c.value,
    label: c.value,
  }));
  tabStates.creative.creativeOptions = filteredCreatives.map((c) => ({
    value: c.value,
    label: c.label,
  }));

  // 清空创意的筛选条件
  sharedCreativeFilter.creativeIds = [];
  sharedCreativeFilter.creativeNames = [];

  handleAutoQuery();
};

const loadAllBasicData = async () => {
  accountLoading.value = true;
  try {
    const res = await MiAdsAPI.getAccountList();
    // 兼容处理：支持数组返回，或者带有data.data的嵌套返回
    let accounts = [];
    if (Array.isArray(res)) {
      accounts = res;
    } else if (res && Array.isArray(res.data)) {
      accounts = res.data;
    } else if (res && res.data && Array.isArray(res.data.data)) {
      accounts = res.data.data;
    }

    const accountOptions = accounts.map((acc) => ({
      value: String(acc.accountId),
      label: String(acc.accountId),
    }));
    accountOptionsShared.value = accountOptions;

    tabStates.campaign.accountOptions = accountOptions;
    tabStates.group.accountOptions = accountOptions;
    tabStates.creative.accountOptions = accountOptions;

    if (accounts.length > 0) {
      currentAccountId.value = accounts[0].accountId;
      tabStates.campaign.searchForm.accountId = String(accounts[0].accountId);
      tabStates.group.searchForm.accountId = String(accounts[0].accountId);
      tabStates.creative.searchForm.accountId = String(accounts[0].accountId);
    }

    accountDataLoaded.value = true;

    if (currentAccountId.value) {
      await loadBasicDataForAccount(currentAccountId.value);
    }
  } catch (error) {
    console.error("Failed to load basic data:", error);
    ElMessage.error("加载基础数据失败");
  } finally {
    accountLoading.value = false;
  }
};

// ==================== 交互处理 ====================

const handleCampaignSearchTypeChange = () => {
  if (sharedCampaignFilter.searchType === "id") {
    sharedCampaignFilter.campaignNames = [];
  } else {
    sharedCampaignFilter.campaignIds = [];
  }
};

const handleGroupSearchTypeChange = () => {
  if (sharedGroupFilter.searchType === "id") {
    sharedGroupFilter.groupNames = [];
  } else {
    sharedGroupFilter.groupIds = [];
  }
};

const handleCreativeSearchTypeChange = () => {
  if (sharedCreativeFilter.searchType === "id") {
    sharedCreativeFilter.creativeNames = [];
  } else {
    sharedCreativeFilter.creativeIds = [];
  }
};

const handleAutoQuery = () => {
  applyFilterAndSort(activeTab.value);
};

const handleNameClick = (col, row) => {
  const targetTab = col.targetTab;

  if (targetTab === "group") {
    // 跳转到group，设置计划筛选
    sharedCampaignFilter.searchType = "id";
    sharedCampaignFilter.campaignIds = [row.campaignId];
    sharedCampaignFilter.campaignNames = [];
    // 清空组筛选
    sharedGroupFilter.groupIds = [];
    sharedGroupFilter.groupNames = [];
  } else if (targetTab === "campaign") {
    // 跳转到campaign，设置计划筛选
    sharedCampaignFilter.searchType = "id";
    sharedCampaignFilter.campaignIds = [row.campaignId];
    sharedCampaignFilter.campaignNames = [];
    // 清空组和创意筛选
    sharedGroupFilter.groupIds = [];
    sharedGroupFilter.groupNames = [];
    sharedCreativeFilter.creativeIds = [];
    sharedCreativeFilter.creativeNames = [];
  } else if (targetTab === "creative") {
    // 跳转到creative，设置组筛选
    sharedGroupFilter.searchType = "id";
    sharedGroupFilter.groupIds = [row.groupId];
    sharedGroupFilter.groupNames = [];
    // 清空创意筛选
    sharedCreativeFilter.creativeIds = [];
    sharedCreativeFilter.creativeNames = [];
  }

  // 切换维度
  activeTab.value = targetTab;

  // 执行查询
  applyFilterAndSort(targetTab);
};

const handleReset = (tabName = activeTab.value) => {
  const state = tabStates[tabName];

  // 重置共享的计划筛选状态
  sharedCampaignFilter.searchType = "id";
  sharedCampaignFilter.campaignIds = [];
  sharedCampaignFilter.campaignNames = [];

  // 重置共享的组筛选状态
  sharedGroupFilter.searchType = "id";
  sharedGroupFilter.groupIds = [];
  sharedGroupFilter.groupNames = [];

  // 重置共享的创意筛选状态
  sharedCreativeFilter.searchType = "id";
  sharedCreativeFilter.creativeIds = [];
  sharedCreativeFilter.creativeNames = [];

  if (tabName === "campaign") {
    // campaign不需要额外重置其他字段
  } else if (tabName === "group") {
    // group不需要额外重置其他字段
  } else if (tabName === "creative") {
    tabStates.creative.groupOptions = [];
  }

  state.searchForm.status = null;
  state.pagination.currentPage = 1;
  sortState.prop = "";
  sortState.order = "";

  applyFilterAndSort(tabName);
};

const handleSortChange = ({ prop, order }) => {
  sortState.prop = prop;
  sortState.order = order;
  applyFilterAndSort(activeTab.value);
};

const handleTabChange = (tabName) => {
  activeTab.value = tabName;
  applyFilterAndSort(tabName);
};

// ==================== 表格组件事件处理 ====================

const handleStatusChange = async ({ row, newStatus, tab }) => {
  if (tab === "campaign") {
    await handleCampaignStatusChange(row, newStatus);
  } else if (tab === "group") {
    await handleGroupStatusChange(row, newStatus);
  } else if (tab === "creative") {
    await handleCreativeStatusChange(row, newStatus);
  }
};

const handleBudgetEditStart = (row) => {
  currentEditingRowId.value = row.campaignId;
  row.budgetPopoverVisible = true;

  if (row.dayBudget === "不限" || row.dayBudget === "-") {
    row.editingBudgetType = "unlimited";
    row.editingBudgetValue = 0;
  } else {
    row.editingBudgetType = "limited";
    const formatted = String(row.dayBudget).replace(/,/g, "");
    row.editingBudgetValue = parseFloat(formatted) || 0;
  }
};

const handleBudgetEditCancel = (row) => {
  row.budgetPopoverVisible = false;
  row.editingBudgetType = null;
  row.editingBudgetValue = 0;
  currentEditingRowId.value = null;
};

const handleBudgetSubmit = async (row) => {
  try {
    const budget =
      row.editingBudgetType === "unlimited" ? 0 : Math.round(row.editingBudgetValue * 100000);

    await MiAdsAPI.updateCampaignBudget(String(row.campaignId), budget, Number(row.accountId));

    ElMessage.success("预算更新成功");
    row.budgetPopoverVisible = false;
    currentEditingRowId.value = null;

    await applyFilterAndSort("campaign");
  } catch (error) {
    console.error("更新预算失败:", error);
    ElMessage.error(error?.message || "更新失败");
  }
};

const handleCampaignStatusChange = async (row, newStatus) => {
  const targetStatus = newStatus ? 0 : 1;

  row.statusUpdating = true;

  try {
    // 调用 API
    await MiAdsAPI.updateCampaignStatus(String(row.campaignId), newStatus, Number(row.accountId));

    // 刷新整页数据（当前tab）
    await applyFilterAndSort("campaign");

    ElMessage.success(`计划已${newStatus ? "投放" : "暂停"}`);
  } catch (error) {
    console.error("更新计划状态失败:", error);
    ElMessage.error(error?.message || "更新状态失败");

    // 错误时也刷新数据，确保界面状态与后端一致
    await applyFilterAndSort("campaign");
  } finally {
    row.statusUpdating = false;
  }
};

const handleGroupStatusChange = async (row, newStatus) => {
  row.statusUpdating = true;
  try {
    await MiAdsAPI.updateGroupStatus(String(row.groupId), newStatus, Number(row.accountId));
    await applyFilterAndSort("group");
    ElMessage.success(`广告组已${newStatus ? "投放" : "暂停"}`);
  } catch (error) {
    console.error("更新广告组状态失败:", error);
    ElMessage.error(error?.message || "更新状态失败");
    await applyFilterAndSort("group");
  } finally {
    row.statusUpdating = false;
  }
};

const handleCreativeStatusChange = async (row, newStatus) => {
  row.statusUpdating = true;
  try {
    await MiAdsAPI.updateCreativeStatus(String(row.creativeId), newStatus, Number(row.accountId));
    await applyFilterAndSort("creative");
    ElMessage.success(`创意已${newStatus ? "投放" : "暂停"}`);
  } catch (error) {
    console.error("更新创意状态失败:", error);
    ElMessage.error(error?.message || "更新状态失败");
    await applyFilterAndSort("creative");
  } finally {
    row.statusUpdating = false;
  }
};

const handleSizeChange = (val, tabName = activeTab.value) => {
  tabStates[tabName].pagination.pageSize = val;
  applyFilterAndSort(tabName);
};

const handleCurrentChange = (val, tabName = activeTab.value) => {
  tabStates[tabName].pagination.currentPage = val;
  applyFilterAndSort(tabName);
};

const handleAdd = () => {
  // Add button click is handled by MIAdsTable component
};

const handleEdit = (row) => {
  console.log("Edit", row);
};

const handleDelete = (row) => {
  console.log("Delete", row);
  // 删除成功后刷新当前列表
  applyFilterAndSort(activeTab.value);
};

const handleCampaignAdded = () => {
  applyFilterAndSort(activeTab.value);
};

const handleGroupAdded = () => {
  applyFilterAndSort(activeTab.value);
};

// ==================== 生命周期 ====================

onMounted(() => {
  loadAllBasicData();
});

onUnmounted(() => {});
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
    border-radius: 0 0 12px 12px;

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

  &:hover {
    border-color: var(--el-color-primary-light-3);
    box-shadow: 0 8px 25px rgba(64, 128, 255, 0.15);
  }
}

.text-muted {
  color: var(--el-text-color-placeholder);
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

.mt-4 {
  margin-top: 1rem;
}

.flex {
  display: flex;
}

.justify-center {
  justify-content: center;
}
</style>
