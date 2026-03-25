<template>
  <div class="data-sync-container">
    <!-- 页面标题 -->
    <div class="page-header">数据同步管理</div>

    <!-- 顶部区域：测试连接和执行同步并排 -->
    <div class="top-row">
      <!-- 测试连接模块 -->
      <div class="section section-inline section-test">
        <div class="section-title">测试连接</div>
        <div class="form-row">
          <el-date-picker
            v-model="testDate"
            type="date"
            placeholder="选择测试日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
          <el-select
            v-model="testPlatform"
            placeholder="选择平台"
            :loading="platformLoading"
            style="width: 150px"
          >
            <el-option
              v-for="platform in platformOptions"
              :key="platform.value"
              :label="platform.label"
              :value="platform.value"
            />
          </el-select>
          <el-button type="primary" :loading="testLoading" @click="handleTest">测试连接</el-button>
        </div>
      </div>

      <!-- 执行同步模块 -->
      <div class="section section-inline section-sync">
        <div class="section-title">执行同步</div>
        <div class="form-row">
          <el-radio-group v-model="syncMode">
            <el-radio value="full">全平台同步</el-radio>
            <el-radio value="incremental">单平台增量</el-radio>
          </el-radio-group>
        </div>
        <div class="form-row">
          <el-date-picker
            v-model="syncDate"
            type="date"
            placeholder="选择同步日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 150px"
          />
          <el-select
            v-if="syncMode === 'incremental'"
            v-model="selectedPlatforms"
            multiple
            placeholder="请选择平台"
            :loading="platformLoading"
            style="width: 200px"
            collapse-tags
            collapse-tags-tooltip
            clearable
          >
            <template #header>
              <el-checkbox :model-value="isAllSelected" @change="toggleAllSelection">
                全选
              </el-checkbox>
            </template>
            <el-option
              v-for="platform in platformOptions"
              :key="platform.value"
              :label="platform.label"
              :value="platform.value"
            />
          </el-select>
          <el-input v-model="apiKey" placeholder="请输入 API Key" style="width: 200px" clearable />
          <el-button type="primary" :loading="syncLoading" @click="handleSync">执行同步</el-button>
        </div>
      </div>
    </div>

    <!-- 同步日志模块 -->
    <div class="section">
      <div class="section-title">同步日志</div>
      <div class="form-row" style="margin-bottom: 16px">
        <el-select
          v-model="logQuery.status"
          placeholder="状态过滤"
          clearable
          style="width: 200px"
          @change="handleLogSearch"
        >
          <el-option label="全部" value="" />
          <el-option label="成功 (SUCCESS)" value="SUCCESS" />
          <el-option label="失败 (FAILED)" value="FAILED" />
          <el-option label="进行中 (RUNNING)" value="RUNNING" />
        </el-select>
        <el-button type="primary" :icon="Search" @click="handleLogSearch">查询</el-button>
        <el-button :icon="Refresh" @click="resetLogSearch">重置</el-button>
      </div>

      <el-table v-loading="logLoading" :data="logData" border stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="task_name" label="任务名称" min-width="150" />
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="日志信息" min-width="200" show-overflow-tooltip />
        <el-table-column prop="start_time" label="开始时间" width="180" align="center" />
        <el-table-column prop="end_time" label="结束时间" width="180" align="center" />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="logQuery.page"
          v-model:page-size="logQuery.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="logTotal"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleLogSearch"
          @current-change="getLogs"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import { Search, Refresh } from "@element-plus/icons-vue";
import { DebugAPI } from "@/api/debug/getdata";
import AnalysisAPI from "@/api/analysis";

// --- 测试连接 & 执行同步数据 ---
const testDate = ref(null);
const testPlatform = ref(null); // 测试用的单个平台
const syncDate = ref(null);
const syncMode = ref("full");
const testLoading = ref(false);
const syncLoading = ref(false);

const platformOptions = ref([]);
const platformLoading = ref(false);
const selectedPlatforms = ref([]);
const apiKey = ref("");

const isAllSelected = computed(() => {
  if (platformOptions.value.length === 0) return false;
  return selectedPlatforms.value.length === platformOptions.value.length;
});

const toggleAllSelection = (val) => {
  if (val) {
    selectedPlatforms.value = platformOptions.value.map((p) => p.value);
  } else {
    selectedPlatforms.value = [];
  }
};

// --- 日志查询数据 ---
const logLoading = ref(false);
const logData = ref([]);
const logTotal = ref(0);
const logQuery = reactive({
  page: 1,
  size: 20,
  status: "",
});

// 允许测试的平台列表（从 API 模块导入，这里也可以直接使用）

// 设置默认日期 (确保日期选择器有初始值并格式化)
const initDates = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;

  testDate.value = formattedDate;
  syncDate.value = formattedDate;
};

// 获取平台列表（用于同步多选）
const loadPlatformOptions = async () => {
  platformLoading.value = true;
  try {
    const response = await AnalysisAPI.getPlatformOptions();

    const processResponse = (data) => {
      const names = data.map((p) => p.name);
      const processed = processPlatforms(names);
      return processed.map((name) => ({ value: name, label: name }));
    };

    if (response && Array.isArray(response)) {
      platformOptions.value = processResponse(response);
    } else if (response?.data) {
      platformOptions.value = processResponse(response.data);
    } else {
      platformOptions.value = [];
    }
  } catch (error) {
    console.error("获取平台列表失败:", error);
    platformOptions.value = [];
  } finally {
    platformLoading.value = false;
  }
};

// 测试连接
const handleTest = async () => {
  if (!testPlatform.value) {
    ElMessage.warning("请选择测试平台");
    return;
  }
  if (!testDate.value) {
    ElMessage.warning("请选择测试日期");
    return;
  }

  testLoading.value = true;
  try {
    const response = await DebugAPI.testConnection(testPlatform.value, testDate.value);

    ElNotification({
      title: `${response.platform} - ${response.status === "success" ? "成功" : "失败"}`,
      message: `目标日期: ${response.target_date}\n总记录数: ${response.total_records}\n${response.message || ""}`,
      type: response.status === "success" ? "success" : "error",
      duration: 3000,
    });
  } catch (error) {
    console.error("测试连接失败:", error);
    ElMessage.error("测试失败，请检查网络");
  } finally {
    testLoading.value = false;
  }
};

// 处理平台名称：提取下划线前的部分 + 去重
const processPlatforms = (platformList) => {
  const processed = platformList.map((v) => {
    const parts = v.split("_");
    return parts.length > 1 ? parts[0] : v;
  });
  return [...new Set(processed)];
};

// 执行同步（触发全量同步任务）
const handleSync = async () => {
  if (!syncDate.value) {
    ElMessage.warning("请选择同步日期");
    return;
  }
  if (syncMode.value === "incremental" && selectedPlatforms.value.length === 0) {
    ElMessage.warning("请至少选择一个平台");
    return;
  }

  let platforms;
  if (syncMode.value === "full") {
    platforms = [];
  } else if (selectedPlatforms.value.length === platformOptions.value.length) {
    platforms = [];
  } else {
    platforms = selectedPlatforms.value;
  }

  syncLoading.value = true;
  try {
    console.log("=== 执行同步调试信息 ===");
    console.log("syncMode:", syncMode.value);
    console.log("selectedPlatforms:", selectedPlatforms.value);
    console.log(
      "platformOptions:",
      platformOptions.value.map((p) => p.value)
    );
    console.log("即将发送的请求体:", {
      business_type: "ALL",
      platforms: platforms,
      target_date: syncDate.value,
    });
    console.log("========================");

    const response = await DebugAPI.runFullSync(
      {
        business_type: "ALL",
        platforms: platforms,
        target_date: syncDate.value,
      },
      apiKey.value
    );

    // 显示总体成功消息
    ElMessage.success(response.message || "同步任务已触发");

    // 自动刷新日志列表
    await getLogs();
  } catch (error) {
    console.error("执行同步失败:", error);
    ElMessage.error(error.message || "同步失败，请检查网络或稍后重试");
  } finally {
    syncLoading.value = false;
  }
};

// --- 日志相关方法 ---
const getLogs = async () => {
  logLoading.value = true;
  try {
    const params = {
      page: logQuery.page,
      size: logQuery.size,
    };
    if (logQuery.status) {
      params.status = logQuery.status;
    }

    const response = await DebugAPI.getSyncLogs(params);
    logData.value = response.items || [];
    logTotal.value = response.total || 0;
  } catch (error) {
    console.error("获取日志失败:", error);
    ElMessage.error("获取日志失败");
  } finally {
    logLoading.value = false;
  }
};

const handleLogSearch = () => {
  logQuery.page = 1;
  getLogs();
};

const resetLogSearch = () => {
  logQuery.status = "";
  handleLogSearch();
};

const getStatusType = (status) => {
  if (!status) return "info";
  const upperStatus = status.toUpperCase();
  if (upperStatus.includes("SUCCESS")) return "success";
  if (upperStatus.includes("FAIL")) return "danger";
  if (upperStatus.includes("RUNNING")) return "primary";
  return "info";
};

// 页面加载时初始化
onMounted(() => {
  initDates();
  loadPlatformOptions();
  getLogs();
});
</script>

<style scoped lang="scss">
.data-sync-container {
  min-height: 100vh;
  padding: 24px;

  .page-header {
    margin-bottom: 24px;
    font-size: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary, #303133);
  }

  .top-row {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;

    .section-test {
      flex: 3;
    }

    .section-sync {
      flex: 7;
    }
  }

  .section {
    padding: 24px;
    margin-bottom: 24px;
    background: var(--el-bg-color-overlay, #ffffff);
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    .section-title {
      padding-bottom: 12px;
      margin-bottom: 20px;
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary, #303133);
      border-bottom: 1px solid var(--el-border-color-light, #ebeef5);
    }

    .form-row {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }

    .section-inline .form-row {
      justify-content: center;
    }
  }

  // 同步结果
  .sync-result {
    margin-top: 16px;

    .sync-platforms {
      padding: 12px;
      margin-top: 12px;
      font-size: 14px;
      color: var(--el-color-primary, #409eff);
      background: var(--el-color-primary-light-9, #ecf5ff);
      border-radius: 4px;
    }
  }

  // 分页栏
  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>
