<template>
  <div class="data-sync-container">
    <!-- 页面标题 -->
    <div class="page-header">数据同步管理</div>

    <!-- 测试连接模块 -->
    <div class="section">
      <div class="section-title">1. 测试连接</div>
      <div class="form-row">
        <el-select
          v-model="testPlatform"
          placeholder="选择平台"
          :loading="platformLoading"
          style="min-width: 200px"
        >
          <el-option
            v-for="platform in allowedPlatforms"
            :key="platform"
            :label="platform"
            :value="platform"
          />
        </el-select>
        <el-date-picker
          v-model="testDate"
          type="date"
          placeholder="选择测试日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
        <el-button type="primary" :loading="testLoading" @click="handleTest">测试连接</el-button>
      </div>

      <!-- 测试结果卡片 -->
      <div
        v-if="testResult"
        class="test-result-card"
        :class="{
          success: testResult.status === 'success',
          failure: testResult.status !== 'success',
        }"
      >
        <div class="card-header">
          <span class="platform-name">{{ testResult.platform }}</span>
          <el-tag :type="testResult.status === 'success' ? 'success' : 'danger'" size="small">
            {{ testResult.status === "success" ? "成功" : "失败" }}
          </el-tag>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="label">目标日期:</span>
            <span class="value">{{ testResult.target_date }}</span>
          </div>
          <div class="info-row">
            <span class="label">总记录数:</span>
            <span class="value">{{ testResult.total_records }}</span>
          </div>
          <div class="message">{{ testResult.message }}</div>
        </div>
      </div>
    </div>

    <!-- 执行同步模块 -->
    <div class="section">
      <div class="section-title">2. 执行同步</div>
      <div class="form-row">
        <el-date-picker
          v-model="syncDate"
          type="date"
          placeholder="选择同步日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
        <el-select
          v-model="selectedPlatforms"
          multiple
          placeholder="请选择平台"
          :loading="platformLoading"
          style="min-width: 300px"
          collapse-tags
          collapse-tags-tooltip
          clearable
        >
          <el-option
            v-for="platform in platformOptions"
            :key="platform.value"
            :label="platform.label"
            :value="platform.value"
          />
        </el-select>
        <el-button type="primary" :loading="syncLoading" @click="handleSync">测试同步</el-button>
      </div>
    </div>

    <!-- 同步日志模块 -->
    <div class="section">
      <div class="section-title">3. 同步日志</div>
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
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Search, Refresh } from "@element-plus/icons-vue";
import { DebugAPI, ALLOWED_PLATFORMS } from "@/api/debug/getdata";
import AnalysisAPI from "@/api/analysis";

// --- 测试连接 & 执行同步数据 ---
const testDate = ref(null);
const testPlatform = ref(null); // 测试用的单个平台
const syncDate = ref(null);
const testLoading = ref(false);
const syncLoading = ref(false);
const testResult = ref(null); // 单个平台测试结果（对象）

const platformOptions = ref([]);
const platformLoading = ref(false);
const selectedPlatforms = ref([]);

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
const allowedPlatforms = ALLOWED_PLATFORMS;

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
    const response = await AnalysisAPI.getPlatformOptions("UA");

    // 安全的平台映射，确保 value 是唯一的字符串
    const mapPlatform = (p, idx) => {
      let value;
      let label;

      if (typeof p === "string") {
        value = `${p}_${idx}`;
        label = p;
      } else if (p && typeof p === "object") {
        // 使用 name 字段作为平台代码（value基础）
        const platformCode = p.name != null ? String(p.name) : String(p.id);
        value = `${platformCode}_${idx}`;
        // label 显示平台名称
        label = p.name || p.code || String(p.id);
      } else {
        const str = String(p);
        value = `${str}_${idx}`;
        label = str;
      }

      return { value, label };
    };

    if (response && Array.isArray(response)) {
      platformOptions.value = response.map((p, idx) => mapPlatform(p, idx));
    } else if (response?.data) {
      platformOptions.value = response.data.map((p, idx) => mapPlatform(p, idx));
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
  testResult.value = null;
  try {
    const response = await DebugAPI.testConnection(testPlatform.value, testDate.value);
    testResult.value = response;
    ElMessage.success("测试完成");
  } catch (error) {
    console.error("测试连接失败:", error);
    ElMessage.error("测试失败，请检查网络");
  } finally {
    testLoading.value = false;
  }
};

// 执行同步（触发全量同步任务）
const handleSync = async () => {
  if (!syncDate.value) {
    ElMessage.warning("请选择同步日期");
    return;
  }
  if (selectedPlatforms.value.length === 0) {
    ElMessage.warning("请至少选择一个平台");
    return;
  }

  syncLoading.value = true;
  try {
    // 提取原始平台代码（去除 _idx 后缀）
    const rawPlatforms = selectedPlatforms.value.map((v) => {
      // 如果有下划线，取下划线前的部分作为原始代码
      const parts = v.split("_");
      return parts.length > 1 ? parts[0] : v;
    });

    // 调试日志
    console.log("=== 执行同步调试信息 ===");
    console.log("selectedPlatforms (带后缀):", selectedPlatforms.value);
    console.log("提取后的 rawPlatforms:", rawPlatforms);
    console.log("即将发送的请求体:", {
      business_type: "ALL",
      platforms: rawPlatforms,
      target_date: syncDate.value,
    });
    console.log("========================");

    // 调用全量同步接口
    const response = await DebugAPI.runFullSync({
      business_type: "ALL",
      platforms: rawPlatforms,
      target_date: syncDate.value,
    });

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
      margin-bottom: 20px;
    }
  }

  // 测试连接单卡片
  .test-result-card {
    padding: 16px;
    margin-top: 20px;
    border: 1px solid var(--el-border-color-light, #ebeef5);
    border-radius: 8px;
    transition: all 0.3s;

    &.success {
      background: var(--el-color-success-light-9, #f0f9eb);
      border-left: 4px solid var(--el-color-success, #67c23a);
    }

    &.failure {
      background: var(--el-color-danger-light-9, #fef0f0);
      border-left: 4px solid var(--el-color-danger, #f56c6c);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;

      .platform-name {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary, #303133);
      }
    }

    .card-body {
      .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;

        .label {
          color: var(--el-text-color-regular, #606266);
        }

        .value {
          font-weight: 500;
          color: var(--el-text-color-primary, #303133);
        }
      }

      .message {
        padding: 10px;
        margin-top: 12px;
        font-size: 13px;
        line-height: 1.5;
        color: var(--el-text-color-regular, #606266);
        word-break: break-all;
        background: rgba(255, 255, 255, 0.7);
        border-radius: 4px;
      }
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
