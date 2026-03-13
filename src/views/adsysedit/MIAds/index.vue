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
            style="width: 180px"
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
          <el-form-item label="计划ID">
            <el-select
              v-model="currentSearchForm.campaignIds"
              placeholder="计划ID"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              :options="currentCampaignIdOptions"
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="计划名称">
            <el-input
              v-model="currentSearchForm.campaignName"
              placeholder="输入名称"
              clearable
              style="width: 200px"
              @keyup.enter="handleAutoQuery"
            />
          </el-form-item>
        </template>

        <!-- 组层级特有筛选 -->
        <template v-if="activeTab === 'group'">
          <el-form-item label="计划ID">
            <el-select
              v-model="currentSearchForm.campaignIds"
              placeholder="计划ID"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              :options="currentGroupCampaignIdOptions"
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="组ID">
            <el-select
              v-model="currentSearchForm.groupIds"
              placeholder="组ID"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              :options="currentGroupIdOptions"
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="组名称">
            <el-input
              v-model="currentSearchForm.groupName"
              placeholder="输入组名"
              clearable
              style="width: 200px"
              @keyup.enter="handleAutoQuery"
            />
          </el-form-item>
        </template>

        <!-- 创意层级特有筛选 -->
        <template v-if="activeTab === 'creative'">
          <el-form-item label="计划">
            <el-select
              v-model="currentSearchForm.campaignId"
              placeholder="选择计划"
              filterable
              @change="handleCreativeCampaignChange"
              style="width: 180px"
            >
              <el-option
                v-for="opt in creativeCampaignOptions"
                :key="opt.value"
                :value="opt.value"
                :label="opt.label"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="组">
            <el-select
              v-model="currentSearchForm.groupIds"
              placeholder="选择组"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              :options="creativeGroupOptions"
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="创意ID">
            <el-select
              v-model="currentSearchForm.creativeIds"
              placeholder="创意ID"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              :options="currentCreativeIdOptions"
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="创意名称">
            <el-input
              v-model="currentSearchForm.creativeName"
              placeholder="输入创意名"
              clearable
              style="width: 200px"
              @keyup.enter="handleAutoQuery"
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

    

    <!-- 表格区 -->
    <div class="table-container">
      <!-- 选项卡导航 -->
    <div class="tab-navigation">
      <el-tabs v-model="activeTab" type="card" @tab-change="handleTabChange">
        <el-tab-pane v-for="tab in tabs" :key="tab.value" :label="tab.label" :name="tab.value" />
      </el-tabs>
    </div>
      <!-- 添加按钮 -->
      <div class="function-bar">
        <div class="function-bar-content">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加{{ activeTab === "campaign" ? "计划" : activeTab === "group" ? "广告组" : "创意" }}
          </el-button>
        </div>
      </div>
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
          <!-- 营销方式列 -->
          <template v-if="col.prop === 'campaignType'" #default="{ row }">
            {{ getTypeLabel(row.campaignType) }}
          </template>

          <!-- 状态列 -->
          <template v-else-if="col.prop === 'status'" #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>

          <!-- 操作列 -->
          <template v-else-if="col.prop === 'operation'" #default="{ row }">
            <div class="action-buttons">
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
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="mt-4 flex justify-center">
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
import { ref, reactive, onMounted, onUnmounted, h, computed } from "vue";
import { Plus, Edit, Delete } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import MiAdsAPI from "@/api/miads";

// ==================== 状态定义 ====================

// 当前激活的选项卡
const activeTab = ref("campaign"); // 'campaign' | 'group' | 'creative'

// 账户数据加载状态
const accountLoading = ref(false);
const accountDataLoaded = ref(false);

// 新增：当前选中的账户ID（用于所有基础数据加载）
const currentAccountId = ref(null);

// 共享的账户选项（三个选项卡共用）
const accountOptionsShared = ref([]);

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
      campaignIds: [],
      campaignName: "",
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
      campaignIds: [],
      groupIds: [],
      groupName: "",
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
      campaignId: null,
      groupIds: [],
      creativeIds: [],
      creativeName: "",
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
const currentTableData = computed(() => currentTabState.value.tableData);
const currentLoading = computed(() => currentTabState.value.loading);
const currentPagination = computed(() => currentTabState.value.pagination);
const currentSearchForm = computed(() => currentTabState.value.searchForm);

const currentAccountOptions = computed(() => currentTabState.value.accountOptions);
const currentCampaignIdOptions = computed(() => tabStates.campaign.campaignIdOptions);
const currentGroupCampaignIdOptions = computed(() => tabStates.group.campaignIdOptions);
const currentGroupIdOptions = computed(() => tabStates.group.groupIdOptions);
const currentCreativeIdOptions = computed(() => tabStates.creative.creativeIdOptions);

const creativeCampaignOptions = computed(() => tabStates.creative.campaignOptions);
const creativeGroupOptions = computed(() => tabStates.creative.groupOptions);

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
    { prop: "campaignId", label: "计划ID", minWidth: 100, sortable: true, align: "center" },
    { prop: "status", label: "状态", minWidth: 80, sortable: true, align: "center" },
  ];

  if (activeTab.value === "campaign") {
    return [
      baseColumns[0], // accountId
      { prop: "name", label: "计划名称", minWidth: 180, sortable: true, align: "center" },
      baseColumns[2], // campaignId
      { prop: "campaignType", label: "营销方式", minWidth: 100, sortable: true, align: "center" },
      { prop: "dayBudget", label: "日预算", minWidth: 100, sortable: true, align: "right" },
      baseColumns[3], // status
      { prop: "operation", label: "操作", minWidth: 100, fixed: "right", align: "center" },
    ];
  }

  if (activeTab.value === "group") {
    return [
      baseColumns[0], // accountId
      { prop: "groupId", label: "广告组ID", minWidth: 100, sortable: true, align: "center" },
      { prop: "name", label: "组名称", minWidth: 180, sortable: true, align: "center" },
      baseColumns[2], // campaignId
      { prop: "campaignType", label: "营销方式", minWidth: 100, sortable: true, align: "center" },
      { prop: "dayBudget", label: "日预算", minWidth: 100, sortable: true, align: "right" },
      baseColumns[3], // status
      { prop: "operation", label: "操作", minWidth: 100, fixed: "right", align: "center" },
    ];
  }

  if (activeTab.value === "creative") {
    return [
      baseColumns[0], // accountId
      { prop: "creativeId", label: "广告创意ID", minWidth: 100, sortable: true, align: "center" },
      { prop: "name", label: "创意名称", minWidth: 180, sortable: true, align: "center" },
      baseColumns[2], // campaignId
      { prop: "groupName", label: "组名称", minWidth: 150, sortable: true, align: "center" },
      { prop: "groupId", label: "组ID", minWidth: 100, sortable: true, align: "center" },
      baseColumns[3], // status
      { prop: "operation", label: "操作", minWidth: 100, fixed: "right", align: "center" },
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

const getStatusLabel = (status) => {
  return status === 0 ? "投放中" : status === 1 ? "已暂停" : "未知";
};

const getStatusType = (status) => {
  return status === 0 ? "success" : status === 1 ? "info" : "warning";
};

const getTypeLabel = (type) => {
  const opt = marketingTypeOptions.find((o) => o.value === String(type));
  return opt ? opt.label : "-";
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
        createTime: item.createTime,
        updateTime: item.updateTime,
      };

      if (type === "campaign") {
        return {
          ...base,
          campaignId: item.campaignId,
          dayBudget: formatBudget(item.dayBudget),
          campaignType: item.campaignType,
        };
      } else if (type === "group") {
        return {
          ...base,
          groupId: item.groupId,
          campaignId: item.campaignId,
          dayBudget: formatBudget(item.dayBudget),
          billingType: item.billingType,
          productType: item.productType,
          bid: formatBudget(item.bid),
        };
      } else if (type === "creative") {
        const groupBasic = tabStates.group.allBasicData;
        const group = groupBasic.find((g) => String(g.value) === String(item.groupId));
        return {
          ...base,
          creativeId: item.creativeId,
          groupId: item.groupId,
          campaignId: item.campaignId,
          groupName: group ? group.label : "",
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
    if (form.campaignIds?.length > 0) {
      params.campaign_ids = form.campaignIds.map(Number);
    }
  }

  if (tabName === "campaign") {
    if (form.campaignName) {
      const matchedIds = filterByName(form.campaignName, state.allBasicData);
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
    if (form.groupIds?.length > 0) {
      params.group_ids = form.groupIds.map(Number);
    }
  }

  if (tabName === "group") {
    if (form.groupName) {
      const matchedIds = filterByName(form.groupName, state.allBasicData);
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
    if (form.campaignId) {
      params.campaign_id = Number(form.campaignId);
    }
    if (form.creativeIds?.length > 0) {
      params.creative_ids = form.creativeIds.map(Number);
    }
    if (form.creativeName) {
      const matchedIds = filterByName(form.creativeName, state.allBasicData);
      if (matchedIds.length > 0) {
        params.creative_ids = params.creative_ids
          ? [...new Set([...params.creative_ids, ...matchedIds])]
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
      if (form.campaignId) {
        gIds = tabStates.creative.groupOptions.map((g) => Number(g.value));
      } else {
        gIds = tabStates.group.allBasicData.map((g) => Number(g.value));
      }
      if (gIds.length > 0) {
        params.group_ids = gIds;
      }
    }
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
      state.tableData = convertResponseData(records, tabName);
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

    tabStates.campaign.searchForm.campaignIds = [];
    tabStates.campaign.searchForm.campaignName = "";

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
    }));
    const campaignIdsInGroups = [...new Set(groupBasic.map((item) => item.campaignId))];
    tabStates.group.campaignIdOptions = campaignIdsInGroups.map((id) => ({
      value: String(id),
      label: String(id),
    }));

    tabStates.group.searchForm.campaignIds = [];
    tabStates.group.searchForm.groupIds = [];
    tabStates.group.searchForm.groupName = "";

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
    const campaignIdsInCreatives = [...new Set(creativeBasic.map((item) => item.campaignId))];
    tabStates.creative.campaignOptions = campaignIdsInCreatives.map((id) => ({
      value: String(id),
      label: String(id),
    }));

    tabStates.creative.searchForm.campaignId = null;
    tabStates.creative.groupOptions = [];
    tabStates.creative.searchForm.groupIds = [];
    tabStates.creative.searchForm.creativeIds = [];
    tabStates.creative.searchForm.creativeName = "";

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
  const selectedCampaignId = currentSearchForm.value.campaignId;
  const groupBasic = tabStates.group.allBasicData;

  const filteredGroups = groupBasic.filter(
    (g) => String(g.campaignId) === String(selectedCampaignId)
  );
  tabStates.creative.groupOptions = filteredGroups.map((g) => ({ value: g.value, label: g.label }));

  currentSearchForm.value.groupIds = filteredGroups.length > 0 ? [filteredGroups[0].value] : [];

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

const handleAutoQuery = () => {
  applyFilterAndSort(activeTab.value);
};

const handleReset = (tabName = activeTab.value) => {
  const state = tabStates[tabName];

  if (tabName === "campaign") {
    state.searchForm.campaignIds = [];
    state.searchForm.campaignName = "";
  } else if (tabName === "group") {
    state.searchForm.campaignIds = [];
    state.searchForm.groupIds = [];
    state.searchForm.groupName = "";
  } else if (tabName === "creative") {
    state.searchForm.campaignId = null;
    tabStates.creative.groupOptions = [];
    state.searchForm.groupIds = [];
    state.searchForm.creativeIds = [];
    state.searchForm.creativeName = "";
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
  const state = tabStates[tabName];
  if (state.tableData.length === 0 && accountDataLoaded.value) {
    applyFilterAndSort(tabName);
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

const getSummaries = (param) => {
  const { columns, data } = param;
  const sums = [];
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = h("div", { style: { fontWeight: "bold", textAlign: "center" } }, "总计");
      return;
    }
    if (column.property === "dayBudget") {
      const total = data.reduce((sum, item) => {
        return sum + Number(item.dayBudget ? String(item.dayBudget).replace(/,/g, "") : 0);
      }, 0);
      sums[index] = total.toFixed(3);
      return;
    }
    sums[index] = "";
  });
  return sums;
};

const handleAdd = () => {
  console.log("Add new", activeTab.value);
};

const handleEdit = (row) => {
  console.log("Edit", row);
};

const handleDelete = (row) => {
  console.log("Delete", row);
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

.function-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 12px 20px;
  background: var(--el-bg-color-overlay);
  border-radius: 0px 12px 0 0;
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
  padding: 0;
  border:0;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.04);

  :deep(.el-tabs) {
    --el-tabs-header-height: 40px;
    

    .el-tabs__nav{
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
    #tab-campaign{
        border-radius: 12px 0 0 0;
      }

    #tab-creative{
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
