<template>
  <div class="app-container">
    <!-- 筛选栏 -->
    <div class="search-container mb-10">
      <el-form :model="searchForm" inline label-width="auto">
        <el-text class="mr-10" size="large" style="margin-right: 20px; font-weight: bold">
          筛选条件
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
          />
        </el-form-item>
        <el-form-item label="渠道">
          <el-select
            v-model="searchForm.channel"
            placeholder="请选择渠道"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="item in channelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="包名">
          <el-input
            v-model="searchForm.packageName"
            placeholder="请输入包名"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="游戏名">
          <el-input
            v-model="searchForm.gameName"
            placeholder="请输入游戏名"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="rounded-lg mb-10">
      <el-card shadow="never" class="work">
        <div class="flex items-center justify-between">
          <div class="toolbar-left">
            <el-text class="mr-10" size="large" style="font-weight: bold">数据概览</el-text>
            <!-- 左侧可添加其他工具栏项 -->
            <el-text class="mr-10" size="large">
              <el-tag :type="query ? 'success' : 'danger'">
                状态 : {{ query ? "YES" : "ERROR" }}
              </el-tag>
            </el-text>
          </div>
          <div class="toolbar-right flex items-center gap-3">
            <el-button type="primary" @click="openComparison">
              <el-icon><Histogram /></el-icon>
              对比
            </el-button>
            <el-button type="primary" @click="openSettings">
              <el-icon><Setting /></el-icon>
              设置
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 数据表格 -->
      <div class="table-container">
        <el-table
          :data="paginatedTableData"
          v-loading="loading"
          :border="false"
          class="flex-1"
          :highlight-current-row="false"
          row-key="id"
          :expand-row-keys="expandedKeys"
          @expand-change="handleExpandChange"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          :row-class-name="getRowClassName"
        >
          <el-table-column v-if="detailMode === 'expand'" type="expand" width="40">
            <template #default="props">
              <div class="expand-content">
                <div class="section-title spend-title">
                  <el-divider content-position="left">
                    <el-icon><Coin /></el-icon>
                    投放平台花费详情
                  </el-divider>
                </div>
                <el-table
                  :data="props.row.platformSpendDetails"
                  border
                  size="small"
                  class="expand-inner-table"
                  :fit="true"
                >
                  <el-table-column
                    prop="platform"
                    label="投放平台"
                    align="center"
                    header-align="center"
                    sortable
                  />
                  <el-table-column
                    prop="spend"
                    label="花费"
                    align="center"
                    header-align="center"
                    sortable
                  >
                    <template #default="innerScope">
                      <el-text type="danger">${{ innerScope.row.spend.toFixed(2) }}</el-text>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="impressions"
                    label="展示数"
                    align="center"
                    header-align="center"
                    sortable
                  />
                  <el-table-column
                    prop="clicks"
                    label="点击数"
                    align="center"
                    header-align="center"
                    sortable
                  />
                  <el-table-column
                    prop="activations"
                    label="激活数"
                    align="center"
                    header-align="center"
                    sortable
                  />
                  <el-table-column
                    prop="ctr"
                    label="CTR"
                    align="center"
                    header-align="center"
                    sortable
                  >
                    <template #default="innerScope">
                      {{ calculateCTR(innerScope.row) }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="cvr"
                    label="CVR"
                    align="center"
                    header-align="center"
                    sortable
                  >
                    <template #default="innerScope">
                      {{ calculateCVR(innerScope.row) }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="percentage"
                    label="花费占比"
                    align="center"
                    header-align="center"
                    sortable
                    width="120"
                  >
                    <template #default="innerScope">
                      <div class="percentage-bar">
                        <div
                          class="percentage-fill"
                          :style="{ width: innerScope.row.percentage + '%' }"
                        ></div>
                        <span class="percentage-text">{{ innerScope.row.percentage }}%</span>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
                <div class="section-title revenue-title">
                  <el-divider content-position="left">
                    <el-icon><Wallet /></el-icon>
                    变现平台回收详情
                  </el-divider>
                </div>
                <el-table
                  :data="props.row.platformRevenueDetails"
                  border
                  size="small"
                  class="expand-inner-table"
                  :fit="true"
                >
                  <el-table-column
                    prop="platform"
                    label="变现平台"
                    align="center"
                    header-align="center"
                    sortable
                  />
                  <el-table-column
                    prop="revenue"
                    label="回收金额"
                    align="center"
                    header-align="center"
                    sortable
                  >
                    <template #default="innerScope">
                      <el-text type="success">${{ innerScope.row.revenue.toFixed(2) }}</el-text>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="impressions"
                    label="展示数"
                    align="center"
                    header-align="center"
                    sortable
                  />
                  <el-table-column
                    prop="clicks"
                    label="点击数"
                    align="center"
                    header-align="center"
                    sortable
                  />
                  <el-table-column
                    prop="ctr"
                    label="CTR"
                    align="center"
                    header-align="center"
                    sortable
                  >
                    <template #default="innerScope">
                      {{ calculateCTRRevanue(innerScope.row) }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="percentage"
                    label="回收占比"
                    align="center"
                    header-align="center"
                    sortable
                    width="120"
                  >
                    <template #default="innerScope">
                      <div class="percentage-bar">
                        <div
                          class="percentage-fill"
                          :style="{ width: innerScope.row.percentage + '%' }"
                        ></div>
                        <span class="percentage-text">{{ innerScope.row.percentage }}%</span>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="ID" align="center" prop="id" width="65" sortable />
          <el-table-column label="日期" align="center" prop="date" width="120" sortable />
          <el-table-column label="渠道" align="center" prop="channel" width="100" sortable />
          <el-table-column
            label="包名"
            align="center"
            prop="packageName"
            min-width="150"
            sortable
          />
          <el-table-column
            label="游戏名称"
            align="center"
            prop="gameName"
            min-width="150"
            sortable
          />
          <el-table-column label="花费" align="center" prop="spend" width="120" sortable>
            <template #default="scope">
              <el-text type="danger">${{ scope.row.spend.toFixed(2) }}</el-text>
            </template>
          </el-table-column>
          <el-table-column label="回收" align="center" prop="revenue" width="120" sortable>
            <template #default="scope">
              <el-text type="success">${{ scope.row.revenue.toFixed(2) }}</el-text>
            </template>
          </el-table-column>
          <el-table-column label="盈亏" align="center" prop="profit" width="120" sortable>
            <template #default="scope">
              <el-text :type="scope.row.profit >= 0 ? 'success' : 'danger'">
                ${{ scope.row.profit.toFixed(2) }}
              </el-text>
            </template>
          </el-table-column>
          <el-table-column label="ROI" align="center" prop="roi" width="80" sortable>
            <template #default="scope">{{ scope.row.roi }}%</template>
          </el-table-column>
          <el-table-column v-if="detailMode === 'click'" label="操作" align="center" width="80">
            <template #default="scope">
              <el-button type="primary" size="small" @click="showDetailDialog(scope.row)">
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 分页 -->
      <div
        class="mt-4 flex justify-center work2"
        :style="{ backgroundColor: 'var(--el-bg-color-overlay)', marginTop: '0px' }"
      >
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 对比对话框 -->
    <el-dialog v-model="showComparisonDialog" title="数据对比" width="60%" top="5vh">
      <div class="comparison-content">
        <el-form label-position="top">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="选择要对比的数据">
                <el-checkbox-group v-model="comparisonForm.selectedItems" style="width: 100%">
                  <el-row :gutter="10">
                    <el-col :span="8" v-for="item in tableData" :key="item.id">
                      <el-checkbox :label="item.id">{{ item.packageName }}</el-checkbox>
                    </el-col>
                  </el-row>
                </el-checkbox-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <div class="comparison-actions" style="margin-top: 20px; text-align: right">
          <el-button @click="showComparisonDialog = false">取消</el-button>
          <el-button type="primary" @click="startComparison">开始对比</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 设置侧边栏 -->
    <el-drawer v-model="showSettingsDrawer" title="设置" direction="rtl" size="300px">
      <div class="settings-content">
        <el-form label-position="top">
          <el-form-item label="详情模式">
            <el-radio-group v-model="detailMode" @change="onDetailModeChange">
              <el-radio value="expand" border>展开详情</el-radio>
              <el-radio value="click" border>点击详情</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="showDetailsDialog"
      :title="`详情 - ${currentDetailRow?.packageName || ''}`"
      width="80%"
      top="5vh"
    >
      <div v-if="currentDetailRow" class="expand-content">
        <div class="section-title spend-title">
          <el-divider content-position="left">
            <el-icon><Coin /></el-icon>
            投放平台花费详情
          </el-divider>
        </div>
        <el-table
          :data="currentDetailRow.platformSpendDetails"
          :border="false"
          size="small"
          class="expand-inner-table"
          :fit="true"
        >
          <el-table-column
            prop="platform"
            label="投放平台"
            align="center"
            header-align="center"
            sortable
          />
          <el-table-column prop="spend" label="花费" align="center" header-align="center" sortable>
            <template #default="innerScope">
              <el-text type="danger">${{ innerScope.row.spend.toFixed(2) }}</el-text>
            </template>
          </el-table-column>
          <el-table-column
            prop="impressions"
            label="展示数"
            align="center"
            header-align="center"
            sortable
          />
          <el-table-column
            prop="clicks"
            label="点击数"
            align="center"
            header-align="center"
            sortable
          />
          <el-table-column
            prop="activations"
            label="激活数"
            align="center"
            header-align="center"
            sortable
          />
          <el-table-column prop="ctr" label="CTR" align="center" header-align="center" sortable>
            <template #default="innerScope">
              {{ calculateCTR(innerScope.row) }}
            </template>
          </el-table-column>
          <el-table-column prop="cvr" label="CVR" align="center" header-align="center" sortable>
            <template #default="innerScope">
              {{ calculateCVR(innerScope.row) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="percentage"
            label="花费占比"
            align="center"
            header-align="center"
            sortable
            width="120"
          >
            <template #default="innerScope">
              <div class="percentage-bar">
                <div
                  class="percentage-fill"
                  :style="{ width: innerScope.row.percentage + '%' }"
                ></div>
                <span class="percentage-text">{{ innerScope.row.percentage }}%</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div class="section-title revenue-title">
          <el-divider content-position="left">
            <el-icon><Wallet /></el-icon>
            变现平台回收详情
          </el-divider>
        </div>
        <el-table
          :data="currentDetailRow.platformRevenueDetails"
          :border="false"
          size="small"
          class="expand-inner-table"
          :fit="true"
        >
          <el-table-column
            prop="platform"
            label="变现平台"
            align="center"
            header-align="center"
            sortable
          />
          <el-table-column
            prop="revenue"
            label="回收金额"
            align="center"
            header-align="center"
            sortable
          >
            <template #default="innerScope">
              <el-text type="success">${{ innerScope.row.revenue.toFixed(2) }}</el-text>
            </template>
          </el-table-column>
          <el-table-column
            prop="impressions"
            label="展示数"
            align="center"
            header-align="center"
            sortable
          />
          <el-table-column
            prop="clicks"
            label="点击数"
            align="center"
            header-align="center"
            sortable
          />
          <el-table-column prop="ctr" label="CTR" align="center" header-align="center" sortable>
            <template #default="innerScope">
              {{ calculateCTRRevanue(innerScope.row) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="percentage"
            label="回收占比"
            align="center"
            header-align="center"
            sortable
            width="120"
          >
            <template #default="innerScope">
              <div class="percentage-bar">
                <div
                  class="percentage-fill"
                  :style="{ width: innerScope.row.percentage + '%' }"
                ></div>
                <span class="percentage-text">{{ innerScope.row.percentage }}%</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="closeDetailDialog">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { ElText, ElDivider, ElIcon, ElMessage } from "element-plus";
import { Coin, Wallet, Setting, Histogram } from "@element-plus/icons-vue";
import AnalysisAPI from "@/api/analysis";

defineOptions({
  name: "Channel",
  inheritAttrs: false,
});

// 获取query参数
const route = useRoute();
const query = computed(() => route.query.type || "未知");

// 详情模式相关
const detailMode = ref("click"); // 'expand' 或 'click'
const expandedKeys = ref([]);

const handleExpandChange = (row, expandedRows) => {
  if (detailMode.value === "expand") {
    // 展开详情模式 - 允许展开行
    expandedKeys.value = expandedRows.map((item) => item.id);
  } else {
    // 点击详情模式 - 禁止展开行
    // 不做任何操作，保持展开行为空
    expandedKeys.value = [];
  }
};

// 切换详情模式时清空已展开的行
const onDetailModeChange = () => {
  expandedKeys.value = [];
};

// 表格数据
// 搜索表单
const searchForm = ref({
  date: [],
  packageName: "",
  gameName: "",
  channel: "",
});

// 渠道选项
const channelOptions = [
  { value: "MI", label: "MI" },
  { value: "OPPO", label: "OPPO" },
  { value: "VIVO", label: "VIVO" },
  { value: "Samsung", label: "Samsung" },
  { value: "Amazon", label: "Amazon" },
  { value: "Huawei", label: "Huawei" },
];

const loading = ref(false);
const tableData = ref([
  {
    id: 1,
    date: "2024-01-15",
    channel: "MI",
    packageName: "com.tencent.wzry",
    gameName: "王者荣耀",
    spend: 15000.0,
    revenue: 22500.0,
    profit: 7500.0,
    roi: 50.0,
    showDetails: false,
    showSpendDetails: false,
    showRevenueDetails: false,
    platformSpendDetails: [
      {
        platform: "Facebook",
        spend: 6000.0,
        percentage: 40.0,
        impressions: 120000,
        clicks: 6000,
        activations: 300,
      },
      {
        platform: "Google Ads",
        spend: 4500.0,
        percentage: 30.0,
        impressions: 90000,
        clicks: 4500,
        activations: 225,
      },
      {
        platform: "TikTok",
        spend: 3000.0,
        percentage: 20.0,
        impressions: 60000,
        clicks: 3000,
        activations: 150,
      },
      {
        platform: "Twitter",
        spend: 1500.0,
        percentage: 10.0,
        impressions: 30000,
        clicks: 1500,
        activations: 75,
      },
    ],
    platformRevenueDetails: [
      { platform: "AdMob", revenue: 9000.0, percentage: 40.0, impressions: 180000, clicks: 9000 },
      {
        platform: "Facebook Audience Network",
        revenue: 6750.0,
        percentage: 30.0,
        impressions: 135000,
        clicks: 6750,
      },
      {
        platform: "Unity Ads",
        revenue: 4500.0,
        percentage: 20.0,
        impressions: 90000,
        clicks: 4500,
      },
      { platform: "AppLovin", revenue: 2250.0, percentage: 10.0, impressions: 45000, clicks: 2250 },
    ],
  },
  {
    id: 2,
    date: "2024-01-16",
    channel: "OPPO",
    packageName: "com.tencent.hjzj",
    gameName: "和平精英",
    spend: 12000.5,
    revenue: 16800.7,
    profit: 4800.2,
    roi: 40.0,
    showDetails: false,
    showSpendDetails: false,
    showRevenueDetails: false,
    platformSpendDetails: [
      {
        platform: "Facebook",
        spend: 5000.0,
        percentage: 41.65,
        impressions: 100000,
        clicks: 5000,
        activations: 250,
      },
      {
        platform: "Google Ads",
        spend: 3500.0,
        percentage: 29.15,
        impressions: 70000,
        clicks: 3500,
        activations: 175,
      },
      {
        platform: "TikTok",
        spend: 2500.0,
        percentage: 20.82,
        impressions: 50000,
        clicks: 2500,
        activations: 125,
      },
      {
        platform: "Snapchat",
        spend: 1000.5,
        percentage: 8.38,
        impressions: 20000,
        clicks: 1000,
        activations: 50,
      },
    ],
    platformRevenueDetails: [
      { platform: "AdMob", revenue: 6720.0, percentage: 40.0, impressions: 134400, clicks: 6720 },
      {
        platform: "Facebook Audience Network",
        revenue: 4704.0,
        percentage: 28.0,
        impressions: 94080,
        clicks: 4704,
      },
      {
        platform: "Unity Ads",
        revenue: 5040.0,
        percentage: 30.0,
        impressions: 100800,
        clicks: 5040,
      },
      { platform: "AppLovin", revenue: 336.7, percentage: 2.0, impressions: 6734, clicks: 336 },
    ],
  },
  {
    id: 3,
    date: "2024-01-17",
    channel: "VIVO",
    packageName: "com.miHoYo.GenshinImpact",
    gameName: "原神",
    spend: 18000.0,
    revenue: 28800.0,
    profit: 10800.0,
    roi: 60.0,
    showDetails: false,
    showSpendDetails: false,
    showRevenueDetails: false,
    platformSpendDetails: [
      {
        platform: "Facebook",
        spend: 7000.0,
        percentage: 38.89,
        impressions: 140000,
        clicks: 7000,
        activations: 350,
      },
      {
        platform: "Google Ads",
        spend: 6000.0,
        percentage: 33.33,
        impressions: 120000,
        clicks: 6000,
        activations: 300,
      },
      {
        platform: "TikTok",
        spend: 3500.0,
        percentage: 19.44,
        impressions: 70000,
        clicks: 3500,
        activations: 175,
      },
      {
        platform: "Twitter",
        spend: 1500.0,
        percentage: 8.34,
        impressions: 30000,
        clicks: 1500,
        activations: 75,
      },
    ],
    platformRevenueDetails: [
      { platform: "AdMob", revenue: 11520.0, percentage: 40.0, impressions: 230400, clicks: 11520 },
      {
        platform: "Facebook Audience Network",
        revenue: 8640.0,
        percentage: 30.0,
        impressions: 172800,
        clicks: 8640,
      },
      {
        platform: "Unity Ads",
        revenue: 5760.0,
        percentage: 20.0,
        impressions: 115200,
        clicks: 5760,
      },
      { platform: "AppLovin", revenue: 2880.0, percentage: 10.0, impressions: 57600, clicks: 2880 },
    ],
  },
  {
    id: 4,
    date: "2024-01-18",
    channel: "Samsung",
    packageName: "com.riotgames.league.wildrift",
    gameName: "英雄联盟",
    spend: 9500.75,
    revenue: 13301.05,
    profit: 3800.3,
    roi: 40.0,
    showDetails: false,
    showSpendDetails: false,
    showRevenueDetails: false,
    platformSpendDetails: [
      {
        platform: "Facebook",
        spend: 4000.0,
        percentage: 42.1,
        impressions: 80000,
        clicks: 4000,
        activations: 200,
      },
      {
        platform: "Google Ads",
        spend: 3000.0,
        percentage: 31.58,
        impressions: 60000,
        clicks: 3000,
        activations: 150,
      },
      {
        platform: "TikTok",
        spend: 1800.0,
        percentage: 18.95,
        impressions: 36000,
        clicks: 1800,
        activations: 90,
      },
      {
        platform: "Snapchat",
        spend: 700.75,
        percentage: 7.38,
        impressions: 14000,
        clicks: 700,
        activations: 35,
      },
    ],
    platformRevenueDetails: [
      { platform: "AdMob", revenue: 5320.0, percentage: 40.0, impressions: 106400, clicks: 5320 },
      {
        platform: "Facebook Audience Network",
        revenue: 3990.0,
        percentage: 30.0,
        impressions: 79800,
        clicks: 3990,
      },
      {
        platform: "Unity Ads",
        revenue: 2660.0,
        percentage: 20.0,
        impressions: 53200,
        clicks: 2660,
      },
      {
        platform: "AppLovin",
        revenue: 1330.05,
        percentage: 10.0,
        impressions: 26601,
        clicks: 1330,
      },
    ],
  },
  {
    id: 5,
    date: "2024-01-19",
    channel: "Amazon",
    packageName: "com.miHoYo.bh3oversea",
    gameName: "崩坏3",
    spend: 11200.0,
    revenue: 17920.0,
    profit: 6720.0,
    roi: 60.0,
    showDetails: false,
    showSpendDetails: false,
    showRevenueDetails: false,
    platformSpendDetails: [
      {
        platform: "Facebook",
        spend: 4500.0,
        percentage: 40.18,
        impressions: 90000,
        clicks: 4500,
        activations: 225,
      },
      {
        platform: "Google Ads",
        spend: 3500.0,
        percentage: 31.25,
        impressions: 70000,
        clicks: 3500,
        activations: 175,
      },
      {
        platform: "TikTok",
        spend: 2200.0,
        percentage: 19.64,
        impressions: 44000,
        clicks: 2200,
        activations: 110,
      },
      {
        platform: "Twitter",
        spend: 1000.0,
        percentage: 8.93,
        impressions: 20000,
        clicks: 1000,
        activations: 50,
      },
    ],
    platformRevenueDetails: [
      { platform: "AdMob", revenue: 7168.0, percentage: 40.0, impressions: 143360, clicks: 7168 },
      {
        platform: "Facebook Audience Network",
        revenue: 5376.0,
        percentage: 30.0,
        impressions: 107520,
        clicks: 5376,
      },
      {
        platform: "Unity Ads",
        revenue: 3584.0,
        percentage: 20.0,
        impressions: 71680,
        clicks: 3584,
      },
      { platform: "AppLovin", revenue: 1792.0, percentage: 10.0, impressions: 35840, clicks: 1792 },
    ],
  },
  {
    id: 6,
    date: "2024-01-20",
    channel: "Huawei",
    packageName: "com.netease.onmyoji",
    gameName: "阴阳师",
    spend: 14300.25,
    revenue: 18590.33,
    profit: 4290.08,
    roi: 30.0,
    showDetails: false,
    showSpendDetails: false,
    showRevenueDetails: false,
    platformSpendDetails: [
      {
        platform: "Facebook",
        spend: 6000.0,
        percentage: 41.96,
        impressions: 120000,
        clicks: 6000,
        activations: 300,
      },
      {
        platform: "Google Ads",
        spend: 4500.0,
        percentage: 31.47,
        impressions: 90000,
        clicks: 4500,
        activations: 225,
      },
      {
        platform: "TikTok",
        spend: 2500.0,
        percentage: 17.48,
        impressions: 50000,
        clicks: 2500,
        activations: 125,
      },
      {
        platform: "Snapchat",
        spend: 1300.25,
        percentage: 9.09,
        impressions: 26000,
        clicks: 1300,
        activations: 65,
      },
    ],
    platformRevenueDetails: [
      { platform: "AdMob", revenue: 7436.0, percentage: 40.0, impressions: 148720, clicks: 7436 },
      {
        platform: "Facebook Audience Network",
        revenue: 5577.0,
        percentage: 30.0,
        impressions: 111540,
        clicks: 5577,
      },
      {
        platform: "Unity Ads",
        revenue: 3718.0,
        percentage: 20.0,
        impressions: 74360,
        clicks: 3718,
      },
      {
        platform: "AppLovin",
        revenue: 1859.33,
        percentage: 10.0,
        impressions: 37187,
        clicks: 1859,
      },
    ],
  },
  {
    id: 7,
    date: "2024-01-21",
    channel: "MI",
    packageName: "com.netease.my",
    gameName: "梦幻西游",
    spend: 16500.5,
    revenue: 24750.75,
    profit: 8250.25,
    roi: 50.0,
    showDetails: false,
    showSpendDetails: false,
    showRevenueDetails: false,
    platformSpendDetails: [
      {
        platform: "Facebook",
        spend: 7000.0,
        percentage: 42.42,
        impressions: 140000,
        clicks: 7000,
        activations: 350,
      },
      {
        platform: "Google Ads",
        spend: 5000.0,
        percentage: 30.3,
        impressions: 100000,
        clicks: 5000,
        activations: 250,
      },
      {
        platform: "TikTok",
        spend: 3000.0,
        percentage: 18.18,
        impressions: 60000,
        clicks: 3000,
        activations: 150,
      },
      {
        platform: "Twitter",
        spend: 1500.5,
        percentage: 9.1,
        impressions: 30000,
        clicks: 1500,
        activations: 75,
      },
    ],
    platformRevenueDetails: [
      { platform: "AdMob", revenue: 9900.0, percentage: 40.0, impressions: 198000, clicks: 9900 },
      {
        platform: "Facebook Audience Network",
        revenue: 7425.0,
        percentage: 30.0,
        impressions: 148500,
        clicks: 7425,
      },
      {
        platform: "Unity Ads",
        revenue: 4950.0,
        percentage: 20.0,
        impressions: 99000,
        clicks: 4950,
      },
      {
        platform: "AppLovin",
        revenue: 2475.75,
        percentage: 10.0,
        impressions: 49515,
        clicks: 2475,
      },
    ],
  },
  {
    id: 8,
    date: "2024-01-22",
    channel: "OPPO",
    packageName: "com.xiaochuankeji.tieba",
    gameName: "剑网3",
    spend: 8700.0,
    revenue: 10440.0,
    profit: 1740.0,
    roi: 20.0,
    showDetails: false,
    showSpendDetails: false,
    showRevenueDetails: false,
    platformSpendDetails: [
      {
        platform: "Facebook",
        spend: 3500.0,
        percentage: 40.23,
        impressions: 70000,
        clicks: 3500,
        activations: 175,
      },
      {
        platform: "Google Ads",
        spend: 2500.0,
        percentage: 28.74,
        impressions: 50000,
        clicks: 2500,
        activations: 125,
      },
      {
        platform: "TikTok",
        spend: 1800.0,
        percentage: 20.69,
        impressions: 36000,
        clicks: 1800,
        activations: 90,
      },
      {
        platform: "Snapchat",
        spend: 900.0,
        percentage: 10.34,
        impressions: 18000,
        clicks: 900,
        activations: 45,
      },
    ],
    platformRevenueDetails: [
      { platform: "AdMob", revenue: 4176.0, percentage: 40.0, impressions: 83520, clicks: 4176 },
      {
        platform: "Facebook Audience Network",
        revenue: 3132.0,
        percentage: 30.0,
        impressions: 62640,
        clicks: 3132,
      },
      {
        platform: "Unity Ads",
        revenue: 2088.0,
        percentage: 20.0,
        impressions: 41760,
        clicks: 2088,
      },
      { platform: "AppLovin", revenue: 1044.0, percentage: 10.0, impressions: 20880, clicks: 1044 },
    ],
  },
  {
    id: 9,
    date: "2024-01-23",
    channel: "VIVO",
    packageName: "com.tencent.tmgp.sgame",
    gameName: "王者荣耀国际版",
    spend: 12500.0,
    revenue: 18750.0,
    profit: 6250.0,
    roi: 50.0,
    showDetails: false,
    showSpendDetails: false,
    showRevenueDetails: false,
    platformSpendDetails: [
      {
        platform: "Facebook",
        spend: 5000.0,
        percentage: 40.0,
        impressions: 100000,
        clicks: 5000,
        activations: 250,
      },
      {
        platform: "Google Ads",
        spend: 4000.0,
        percentage: 32.0,
        impressions: 80000,
        clicks: 4000,
        activations: 200,
      },
      {
        platform: "TikTok",
        spend: 2500.0,
        percentage: 20.0,
        impressions: 50000,
        clicks: 2500,
        activations: 125,
      },
      {
        platform: "Twitter",
        spend: 1000.0,
        percentage: 8.0,
        impressions: 20000,
        clicks: 1000,
        activations: 50,
      },
    ],
    platformRevenueDetails: [
      { platform: "AdMob", revenue: 7500.0, percentage: 40.0, impressions: 150000, clicks: 7500 },
      {
        platform: "Facebook Audience Network",
        revenue: 5625.0,
        percentage: 30.0,
        impressions: 112500,
        clicks: 5625,
      },
      {
        platform: "Unity Ads",
        revenue: 3750.0,
        percentage: 20.0,
        impressions: 75000,
        clicks: 3750,
      },
      { platform: "AppLovin", revenue: 1875.0, percentage: 10.0, impressions: 37500, clicks: 1875 },
    ],
  },
  {
    id: 10,
    date: "2024-01-24",
    channel: "Samsung",
    packageName: "com.supercell.clashroyale",
    gameName: "皇室战争",
    spend: 11000.5,
    revenue: 14300.65,
    profit: 3300.15,
    roi: 30.0,
    showDetails: false,
    showSpendDetails: false,
    showRevenueDetails: false,
    platformSpendDetails: [
      {
        platform: "Facebook",
        spend: 4500.0,
        percentage: 40.9,
        impressions: 90000,
        clicks: 4500,
        activations: 225,
      },
      {
        platform: "Google Ads",
        spend: 3500.0,
        percentage: 31.82,
        impressions: 70000,
        clicks: 3500,
        activations: 175,
      },
      {
        platform: "TikTok",
        spend: 2000.0,
        percentage: 18.18,
        impressions: 40000,
        clicks: 2000,
        activations: 100,
      },
      {
        platform: "Snapchat",
        spend: 1000.5,
        percentage: 9.1,
        impressions: 20000,
        clicks: 1000,
        activations: 50,
      },
    ],
    platformRevenueDetails: [
      { platform: "AdMob", revenue: 5720.0, percentage: 40.0, impressions: 114400, clicks: 5720 },
      {
        platform: "Facebook Audience Network",
        revenue: 4290.0,
        percentage: 30.0,
        impressions: 85800,
        clicks: 4290,
      },
      {
        platform: "Unity Ads",
        revenue: 2860.0,
        percentage: 20.0,
        impressions: 57200,
        clicks: 2860,
      },
      {
        platform: "AppLovin",
        revenue: 1430.65,
        percentage: 10.0,
        impressions: 28613,
        clicks: 1430,
      },
    ],
  },
  {
    id: 11,
    date: "2024-01-25",
    channel: "Amazon",
    packageName: "com.garena.game.kg",
    gameName: "传说对决",
    spend: 9800.0,
    revenue: 12740.0,
    profit: 2940.0,
    roi: 30.0,
    showDetails: false,
    showSpendDetails: false,
    showRevenueDetails: false,
    platformSpendDetails: [
      {
        platform: "Facebook",
        spend: 4000.0,
        percentage: 40.82,
        impressions: 80000,
        clicks: 4000,
        activations: 200,
      },
      {
        platform: "Google Ads",
        spend: 3000.0,
        percentage: 30.61,
        impressions: 60000,
        clicks: 3000,
        activations: 150,
      },
      {
        platform: "TikTok",
        spend: 1800.0,
        percentage: 18.37,
        impressions: 36000,
        clicks: 1800,
        activations: 90,
      },
      {
        platform: "Twitter",
        spend: 1000.0,
        percentage: 10.2,
        impressions: 20000,
        clicks: 1000,
        activations: 50,
      },
    ],
    platformRevenueDetails: [
      { platform: "AdMob", revenue: 5096.0, percentage: 40.0, impressions: 101920, clicks: 5096 },
      {
        platform: "Facebook Audience Network",
        revenue: 3822.0,
        percentage: 30.0,
        impressions: 76440,
        clicks: 3822,
      },
      {
        platform: "Unity Ads",
        revenue: 2548.0,
        percentage: 20.0,
        impressions: 50960,
        clicks: 2548,
      },
      { platform: "AppLovin", revenue: 1274.0, percentage: 10.0, impressions: 25480, clicks: 1274 },
    ],
  },
  {
    id: 12,
    date: "2024-01-26",
    channel: "Huawei",
    packageName: "com.netease.lztz",
    gameName: "率土之滨",
    spend: 13200.75,
    revenue: 19801.13,
    profit: 6600.38,
    roi: 50.0,
    showDetails: false,
    showSpendDetails: false,
    showRevenueDetails: false,
    platformSpendDetails: [
      {
        platform: "Facebook",
        spend: 5500.0,
        percentage: 41.66,
        impressions: 110000,
        clicks: 5500,
        activations: 275,
      },
      {
        platform: "Google Ads",
        spend: 4000.0,
        percentage: 30.3,
        impressions: 80000,
        clicks: 4000,
        activations: 200,
      },
      {
        platform: "TikTok",
        spend: 2500.0,
        percentage: 18.94,
        impressions: 50000,
        clicks: 2500,
        activations: 125,
      },
      {
        platform: "Snapchat",
        spend: 1200.75,
        percentage: 9.1,
        impressions: 24000,
        clicks: 1200,
        activations: 60,
      },
    ],
    platformRevenueDetails: [
      { platform: "AdMob", revenue: 7920.0, percentage: 40.0, impressions: 158400, clicks: 7920 },
      {
        platform: "Facebook Audience Network",
        revenue: 5940.0,
        percentage: 30.0,
        impressions: 118800,
        clicks: 5940,
      },
      {
        platform: "Unity Ads",
        revenue: 3960.0,
        percentage: 20.0,
        impressions: 79200,
        clicks: 3960,
      },
      {
        platform: "AppLovin",
        revenue: 1981.13,
        percentage: 10.0,
        impressions: 39623,
        clicks: 1981,
      },
    ],
  },
]);

// 计算盈亏和ROI
const calculateValues = () => {
  tableData.value.forEach((item) => {
    item.profit = item.revenue - item.spend;
    item.roi = item.spend !== 0 ? parseFloat(((item.profit / item.spend) * 100).toFixed(2)) : 0;

    // 确保平台花费详情中的百分比总和等于100%
    const totalSpendPercentage = item.platformSpendDetails.reduce(
      (sum, detail) => sum + detail.percentage,
      0
    );
    if (Math.abs(totalSpendPercentage - 100) > 0.1) {
      // 如果误差大于0.1，则重新计算
      let remainingPercentage = 100;
      item.platformSpendDetails.forEach((detail, index) => {
        if (index < item.platformSpendDetails.length - 1) {
          detail.percentage = parseFloat(((detail.spend / item.spend) * 100).toFixed(2));
          remainingPercentage -= detail.percentage;
        } else {
          detail.percentage = parseFloat(remainingPercentage.toFixed(2)); // 最后一项使用剩余比例
        }
      });
    }

    // 确保平台回收详情中的百分比总和等于100%
    const totalRevenuePercentage = item.platformRevenueDetails.reduce(
      (sum, detail) => sum + detail.percentage,
      0
    );
    if (Math.abs(totalRevenuePercentage - 100) > 0.1) {
      // 如果误差大于0.1，则重新计算
      let remainingPercentage = 100;
      item.platformRevenueDetails.forEach((detail, index) => {
        if (index < item.platformRevenueDetails.length - 1) {
          detail.percentage = parseFloat(((detail.revenue / item.revenue) * 100).toFixed(2));
          remainingPercentage -= detail.percentage;
        } else {
          detail.percentage = parseFloat(remainingPercentage.toFixed(2)); // 最后一项使用剩余比例
        }
      });
    }
  });
};

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = computed(() => filteredTableData.value.length);

// 搜索功能
const handleReset = () => {
  searchForm.value.date = [];
  searchForm.value.packageName = "";
  searchForm.value.gameName = "";
  searchForm.value.channel = "";
  updateFilteredData(); // 重置后也应更新数据
};

// 过滤后的表格数据
const filteredTableData = ref([...tableData.value]);

// 分页后的表格数据
const paginatedTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTableData.value.slice(start, end);
});

// 更新过滤数据的函数
const updateFilteredData = () => {
  let result = tableData.value;

  // 日期筛选
  if (searchForm.value.date && searchForm.value.date.length === 2) {
    const [startDate, endDate] = searchForm.value.date;
    result = result.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
    });
  }

  // 渠道筛选
  if (searchForm.value.channel) {
    result = result.filter((item) => item.channel === searchForm.value.channel);
  }

  // 包名筛选
  if (searchForm.value.packageName) {
    result = result.filter((item) =>
      item.packageName.toLowerCase().includes(searchForm.value.packageName.toLowerCase())
    );
  }

  // 游戏名筛选
  if (searchForm.value.gameName) {
    result = result.filter((item) =>
      item.gameName.toLowerCase().includes(searchForm.value.gameName.toLowerCase())
    );
  }

  // 更新过滤后的数据
  filteredTableData.value = result;
  // 重置到第一页
  currentPage.value = 1;
};

// 页码改变事件
const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// 每页数量改变事件
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1; // 改变每页数量时回到第一页
};

// 计算CTR值的函数
const calculateCTR = (row) => {
  if (row.impressions && row.clicks !== undefined && row.impressions > 0) {
    return ((row.clicks / row.impressions) * 100).toFixed(2) + "%";
  }
  return "0.00%";
};

// 计算CVR值的函数
const calculateCVR = (row) => {
  if (row.clicks && row.activations !== undefined && row.clicks > 0) {
    return ((row.activations / row.clicks) * 100).toFixed(2) + "%";
  }
  return "0.00%";
};

// 计算变现表CTR值的函数
const calculateCTRRevanue = (row) => {
  if (row.impressions && row.clicks !== undefined && row.impressions > 0) {
    return ((row.clicks / row.impressions) * 100).toFixed(2) + "%";
  }
  return "0.00%";
};

// 弹窗相关
const showDetailsDialog = ref(false);
const currentDetailRow = ref(null);

// 显示详情弹窗
const showDetailDialog = (row) => {
  currentDetailRow.value = row;
  showDetailsDialog.value = true;
};

// 关闭详情弹窗
const closeDetailDialog = () => {
  showDetailsDialog.value = false;
  currentDetailRow.value = null;
};

// 根据详情模式设置行类名
const getRowClassName = ({ row }) => {
  if (detailMode.value === "click") {
    return "hide-expand-icon";
  }
  return "";
};

// 对比功能表单
const comparisonForm = reactive({
  selectedItems: [],
});

// 对比功能
const showComparisonDialog = ref(false);

const openComparison = () => {
  showComparisonDialog.value = true;
};

// 开始对比
const startComparison = () => {
  // 简化的对比逻辑
  const selectedData = tableData.value.filter((item) =>
    comparisonForm.selectedItems.includes(item.id)
  );

  console.log("选中的对比数据", selectedData);

  if (selectedData.length < 2) {
    ElMessage.warning("请至少选择2条数据进行对比");
    return;
  }

  // 可以在这里显示对比结果
  ElMessage.success(`已选择 ${selectedData.length} 条数据进行对比`);
  showComparisonDialog.value = false;
};

// 设置功能
const showSettingsDrawer = ref(false);

const openSettings = () => {
  showSettingsDrawer.value = true;
};

// 防抖定时器
let debounceTimer = null;

// 防抖函数
const debounce = (func, delay) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    func();
    debounceTimer = null; // 执行后重置定时器
  }, delay);
};

// 监听包名变化，防抖处理
watch(
  () => searchForm.value.packageName,
  (newVal) => {
    if (newVal !== undefined) {
      debounce(() => {
        updateFilteredData();
      }, 1000);
    }
  }
);

// 监听游戏名变化，防抖处理
watch(
  () => searchForm.value.gameName,
  (newVal) => {
    if (newVal !== undefined) {
      debounce(() => {
        updateFilteredData();
      }, 1000);
    }
  }
);

// 监听日期和渠道变化，立即更新
watch(
  () => searchForm.value.date,
  () => {
    updateFilteredData();
  },
  { deep: true }
);

watch(
  () => searchForm.value.channel,
  () => {
    updateFilteredData();
  }
);

// 初始化过滤数据
updateFilteredData();

// 调用analytics接口并打印返回的数据
const callAnalyticsAPI = async () => {
  try {
    const params = {
      date_range: {
        start: "2026-03-03",
        end: "2026-03-04",
      },
      filters: {},
      group_by: ["report_date", "game_id"],
      metrics: ["spend", "installs", "roas"],
      page: 1,
      size: 50,
    };

    console.log("请求参数:", params);

    const response = await AnalysisAPI.queryAnalytics(params);
    console.log("API返回的数据:", response);

    ElMessage.success("Analytics API 调用成功，数据已打印到控制台");
  } catch (error) {
    console.error("API调用失败:", error);
    ElMessage.error("Analytics API 调用失败");
  }
};

// 页面加载时调用接口
setTimeout(() => {
  callAnalyticsAPI();
}, 1000); // 延迟1秒执行，确保页面加载完成

// 初始化计算
calculateValues();
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.mb-10 {
  margin-right: 10px;
  margin-bottom: 10px;
  margin-left: 10px;
}

.search-container {
  padding: 20px;
  margin-bottom: 10px;
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 20px;

  :deep(.el-form) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
  }

  :deep(.el-form-item) {
    margin-top: 12px;
    margin-right: 15px;
    margin-bottom: 10px;
  }

  :deep(.el-form-item:last-child) {
    margin-right: 0;
  }
}

.rounded-lg {
  margin-bottom: 5px;
}

.work {
  border: 0;
  border-radius: 20px 20px 0 0; /* 上左 上右 下右 下左 */
}

.work2 {
  padding: 20px;
  border: 0;
  border-radius: 0 0 20px 20px; /* 上左 上右 下右 下左 */
}
.mr-10 {
  margin-right: 10px;
}

.table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.expand-content {
  padding-top: 0px;
  padding-right: 20px;
  padding-bottom: 20px;
  padding-left: 20px;
  background-color: var(--el-bg-color); // 使用与外部表格相同的背景色

  .section-title {
    margin: 25px 0 25px 0;
    text-align: center; // 标题居中

    :deep(.el-divider) {
      margin: 10px 0;

      .el-divider__text {
        font-size: 16px;
        font-weight: bold;
      }
    }
  }

  .spend-title {
    :deep(.el-divider) {
      .el-divider__text {
        color: #e6a23c; // 投放平台花费详情使用橙色
      }
    }
  }

  .revenue-title {
    :deep(.el-divider) {
      .el-divider__text {
        color: #67c23a; // 变现平台回收详情使用绿色
      }
    }
  }

  .percentage-bar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 20px;
    overflow: hidden;
    background-color: #f0f0f0;
    border-radius: 10px;

    .percentage-fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: linear-gradient(to right, #409eff, #67c23a);
      transition: width 0.3s ease;
    }

    .percentage-text {
      position: relative;
      z-index: 1;
      font-size: 12px;
      font-weight: bold;
      color: #333;
    }
  }

  .el-table {
    max-width: 100%; // 确保表格不会超出容器
    margin: 0 auto; // 表格居中
  }

  :deep(.el-table) {
    background-color: var(--el-bg-color); // 保持背景色一致

    .el-table__header th {
      background-color: var(--el-bg-color-overlay); // 表头使用稍微深一点的颜色
    }
  }

  .toolbar-left {
    flex: 1; /* 占据剩余空间 */
  }

  .toolbar-right {
    display: flex;
    gap: 12px;
    align-items: center;
  }
}
</style>
