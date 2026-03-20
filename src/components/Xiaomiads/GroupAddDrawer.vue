<template>
  <el-drawer
    :model-value="visible"
    @update:model-value="(val) => emit('update:visible', val)"
    title="添加广告组"
    direction="rtl"
    size="800px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" style="padding: 20px">
      <div class="input-container">
        <el-form-item label="账户" prop="accountId">
          <el-select
            v-model="form.accountId"
            placeholder="请选择账户"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="account in accountOptions"
              :key="account.value"
              :label="account.label"
              :value="account.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="广告计划" prop="campaignId">
          <el-select
            v-model="form.campaignId"
            placeholder="请选择计划"
            filterable
            style="width: 100%"
            @change="handleCampaignChange"
          >
            <el-option
              v-for="campaign in campaignOptions"
              :key="campaign.value"
              :label="campaign.label"
              :value="campaign.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="广告组名称" prop="groupName">
          <el-input v-model="form.groupName" placeholder="请输入广告组名称" clearable />
        </el-form-item>
      </div>

      <div class="input-container mbt-10">
        <el-form-item label="推广产品" prop="productType">
          <el-select v-model="form.productType" placeholder="请选择推广产品" style="width: 100%">
            <el-option label="GA" :value="1" />
            <el-option label="GP" :value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="包名" prop="packageName">
          <el-input v-model="form.packageName" placeholder="请输入包名" clearable />
        </el-form-item>
      </div>

      <div class="input-container mbt-10">
        <el-form-item label="日预算(美元)">
          <div style="display: flex; gap: 8px; align-items: center">
            <el-select v-model="form.dayBudgetType" style="width: 100px">
              <el-option label="限定" value="limited" />
              <el-option label="不限" value="unlimited" />
            </el-select>
            <el-input-number
              v-if="form.dayBudgetType === 'limited'"
              v-model="form.dayBudget"
              :min="50"
              :precision="2"
              :step="100"
              style="width: 200px"
              placeholder="请输入日预算（≥50）"
            />
            <span v-else style="color: var(--el-text-color-secondary)">不限</span>
          </div>
        </el-form-item>

        <el-form-item label="总预算(美元)">
          <div style="display: flex; gap: 8px; align-items: center">
            <el-select v-model="form.totalBudgetType" style="width: 100px">
              <el-option label="限定" value="limited" />
              <el-option label="不限" value="unlimited" />
            </el-select>
            <el-input-number
              v-if="form.totalBudgetType === 'limited'"
              v-model="form.totalBudget"
              :min="50"
              :precision="2"
              :step="100"
              style="width: 200px"
              placeholder="请输入总预算（≥50）"
            />
            <span v-else style="color: var(--el-text-color-secondary)">不限</span>
          </div>
        </el-form-item>
      </div>

      <div class="input-container mbt-10">
        <el-form-item label="投放时间">
          <el-date-picker
            v-model="form.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 100%"
            value-format="x"
          />
        </el-form-item>

        <el-form-item label="投放国家" prop="regions">
          <el-select
            v-model="form.regions"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择投放国家"
            style="width: 100%"
          >
            <el-option
              v-for="region in regionsOptions"
              :key="region.id"
              :label="region.name"
              :value="region.id"
            />
          </el-select>

          <!-- 已选国家展示 -->
          <div
            v-if="selectedRegions.length > 0"
            style="width: 100%; max-height: 150px; margin-top: 12px; overflow-y: auto"
          >
            <div style="margin-bottom: 8px; font-size: 12px; color: var(--el-text-color-secondary)">
              已选择 {{ selectedRegions.length }} 个国家/地区
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px">
              <el-tag
                v-for="region in selectedRegions"
                :key="region.id"
                closable
                @close="removeRegion(region.id)"
                size="small"
              >
                {{ region.name }}
              </el-tag>
            </div>
          </div>

          <!-- 全选/清空操作 -->
          <div
            v-if="regionsOptions.length > 0"
            style="display: flex; gap: 12px; align-items: center; width: 100%; margin-top: 12px"
          >
            <el-checkbox
              :model-value="
                form.regions.length === regionsOptions.length && regionsOptions.length > 0
              "
              @change="toggleSelectAllRegions"
            >
              全选
            </el-checkbox>
            <el-button
              v-if="form.regions.length > 0"
              type="danger"
              size="small"
              @click="clearAllRegions"
            >
              <el-icon><Delete /></el-icon>
              <span>清空</span>
            </el-button>
          </div>
        </el-form-item>
      </div>

      <div class="input-container mbt-10">
        <el-form-item label="版位选择" prop="placementType">
          <el-select v-model="form.placementType" placeholder="请选择版位" style="width: 100%">
            <el-option label="通投智选" :value="1" />
            <el-option label="自选版位" :value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="细分版位" prop="displayType" v-if="form.placementType === 2">
          <el-select v-model="form.displayType" placeholder="请选择细分版位" style="width: 100%">
            <el-option
              v-for="dt in filteredDisplayTypeOptions"
              :key="dt.value"
              :label="dt.label"
              :value="dt.value"
            />
          </el-select>
        </el-form-item>
      </div>

      <div class="input-container mbt-10">
        <el-form-item label="优化目标" prop="optimizeGoal">
          <el-select v-model="form.optimizeGoal" placeholder="请选择优化目标" style="width: 100%">
            <el-option label="激活" :value="1" />
            <el-option label="点击" :value="2" />
            <el-option label="转化价值" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="优化事件" prop="optimizeEvent" v-if="form.optimizeGoal === 4">
          <el-select v-model="form.optimizeEvent" placeholder="请选择优化事件" style="width: 100%">
            <el-option label="广告收入价值" :value="1" />
          </el-select>
        </el-form-item>

        <el-form-item label="出价类型" prop="billingType">
          <el-select v-model="form.billingType" placeholder="请选择出价类型" style="width: 100%">
            <el-option label="CPC" :value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="目标成本" prop="targetCost" v-if="form.optimizeGoal === 1">
          <div style="display: flex; gap: 8px; align-items: center">
            <el-input-number
              v-model="form.targetCost"
              :min="0"
              :precision="4"
              :step="1"
              :controls="false"
              style="flex: 1"
            />
            <span style="color: var(--el-text-color-secondary); white-space: nowrap">USD/激活</span>
          </div>
        </el-form-item>

        <el-form-item label="目标成本" prop="targetCost" v-if="form.optimizeGoal === 2">
          <div style="display: flex; gap: 8px; align-items: center">
            <el-input-number
              v-model="form.targetCost"
              :min="0"
              :precision="4"
              :step="1"
              :controls="false"
              style="flex: 1"
            />
            <span style="color: var(--el-text-color-secondary); white-space: nowrap">USD/点击</span>
          </div>
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <div style="text-align: right">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, reactive, watch, computed } from "vue";
import { ElMessage } from "element-plus";
import { Delete } from "@element-plus/icons-vue";
import MiAdsAPI from "@/api/miads";

const props = defineProps({
  visible: Boolean,
  accountOptions: {
    type: Array,
    default: () => [],
  },
  campaignOptions: {
    type: Array,
    default: () => [],
  },
  defaultAccountId: [Number, String],
});

const emit = defineEmits(["update:visible", "submit-success"]);

const formRef = ref(null);
const loading = ref(false);

// 投放国家选项
const regionsOptions = ref([]);

// display_type 选项
const displayTypeOptions = [
  { label: "信息流", value: 1 },
  { label: "图标", value: 2 },
  { label: "系统默认开屏", value: 3 },
  { label: "banner", value: 6 },
  { label: "插屏", value: 7 },
  { label: "激励视频", value: 8 },
  { label: "PUSH", value: 9 },
  { label: "锁屏画报", value: 12 },
  { label: "通投智选", value: 13 },
];

// 根据版位选择动态过滤细分版位选项
const filteredDisplayTypeOptions = computed(() => {
  if (form.placementType === 2) {
    // 自选版位：排除通投智选（value=13）
    return displayTypeOptions.filter((dt) => dt.value !== 13);
  }
  // 其他情况返回空数组（不显示字段）
  return [];
});

const form = reactive({
  accountId: null,
  campaignId: null,
  groupName: "",
  dayBudget: 0,
  dayBudgetType: "unlimited",
  totalBudget: 0,
  totalBudgetType: "unlimited",
  timeRange: null,
  beginTime: null,
  endTime: null,
  targetCost: 0,
  regions: [],
  billingType: 2,
  optimizeEvent: 1,
  optimizeGoal: 2,
  packageName: "",
  placementType: 1,
  displayType: 13,
  productType: 1,
});

const rules = {
  accountId: [{ required: true, message: "请选择账户", trigger: "change" }],
  campaignId: [{ required: true, message: "请选择计划", trigger: "change" }],
  groupName: [
    { required: true, message: "请输入广告组名称", trigger: "blur" },
    { min: 1, max: 100, message: "广告组名称长度在1-100个字符", trigger: "blur" },
  ],
  billingType: [{ required: true, message: "请选择出价类型", trigger: "change" }],
  optimizeGoal: [{ required: true, message: "请选择优化目标", trigger: "change" }],
  productType: [{ required: true, message: "请选择推广产品", trigger: "change" }],
};

// 已选国家信息
const selectedRegions = computed(() => {
  return form.regions.map((id) => regionsOptions.value.find((r) => r.id === id)).filter(Boolean);
});

// 移除已选国家
const removeRegion = (regionId) => {
  form.regions = form.regions.filter((id) => id !== regionId);
};

// 全选/取消全选
const toggleSelectAllRegions = () => {
  if (form.regions.length === regionsOptions.value.length && regionsOptions.value.length > 0) {
    form.regions = [];
  } else {
    form.regions = regionsOptions.value.map((r) => r.id);
  }
};

// 清空选择
const clearAllRegions = () => {
  form.regions = [];
};

// 加载国家列表
const loadRegions = async () => {
  try {
    const res = await MiAdsAPI.getCreateRegionsList();
    console.log("国家列表:", res);
    // 兼容处理：支持直接数组返回或嵌套返回
    let regions = [];
    if (Array.isArray(res)) {
      regions = res;
    } else if (res && Array.isArray(res.data)) {
      regions = res.data;
    } else if (res && res.data && Array.isArray(res.data.data)) {
      regions = res.data.data;
    }
    regionsOptions.value = regions;
  } catch (error) {
    console.error("加载国家列表失败:", error);
  }
};

// 计划选择变化时
const handleCampaignChange = () => {
  // 空函数，保留结构
};

// 根据版位选择自动设置细分版位
watch(
  () => form.placementType,
  (newVal) => {
    if (newVal === 1) {
      // 通投智选：默认设置 displayType = 13
      form.displayType = 13;
    } else if (newVal === 2) {
      // 自选版位：清除 displayType 或设置默认值（如需）
      form.displayType = null;
    }
  },
  { immediate: true }
);
watch(
  () => props.visible,
  async (val) => {
    if (val) {
      // 每次打开都重新加载国家列表
      await loadRegions();

      // 设置默认账户
      if (props.defaultAccountId) {
        form.accountId = String(props.defaultAccountId);
      } else if (props.accountOptions.length > 0) {
        form.accountId = props.accountOptions[0].value;
      }

      // 重置表单
      form.campaignId = null;
      form.groupName = "";
      form.dayBudget = 0;
      form.dayBudgetType = "unlimited";
      form.totalBudget = 0;
      form.totalBudgetType = "unlimited";
      form.timeRange = null;
      form.beginTime = null;
      form.endTime = null;
      form.targetCost = 0;
      form.regions = [];
      form.billingType = 2;
      // form.mediaList = [];  // 删除
      form.optimizeEvent = 1;
      form.optimizeGoal = 2;
      form.packageName = "";
      form.placementType = 1;
      form.displayType = 13;
      form.productType = 1;
      // mediaOptions.value = [];  // 删除
      // mediaCheckAll.value = false;  // 删除
      // mediaIndeterminate.value = false;  // 删除
    }
  }
);

const handleClose = () => {
  emit("update:visible", false);
  formRef.value?.clearValidate();
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    loading.value = true;

    // 处理时间范围
    if (form.timeRange && form.timeRange.length === 2) {
      form.beginTime = form.timeRange[0];
      form.endTime = form.timeRange[1];
    }

    // 计算预算值
    const dayBudgetValue =
      form.dayBudgetType === "unlimited" ? 0 : Math.round(form.dayBudget * 100000);
    const totalBudgetValue =
      form.totalBudgetType === "unlimited" ? 0 : Math.round(form.totalBudget * 100000);

    // 构建提交数据
    const submitData = {
      account_id: Number(form.accountId),
      campaign_id: Number(form.campaignId),
      group_name: form.groupName,
      day_budget: dayBudgetValue,
      total_budget: totalBudgetValue,
      begin_time: form.beginTime,
      end_time: form.endTime,
      target_cost: form.targetCost > 0 ? Math.round(form.targetCost * 100000) : 0,
      regions: form.regions,
      billing_type: form.billingType,
      optimize_event: form.optimizeEvent,
      optimize_goal: form.optimizeGoal,
      package_name: form.packageName,
      placement_type: form.placementType,
      display_type: form.displayType,
      product_type: form.productType,
    };

    await MiAdsAPI.createGroup(submitData);

    ElMessage.success("创建成功");
    emit("submit-success");
    handleClose();
  } catch (error) {
    console.error("创建失败:", error);
    ElMessage.error(error?.message || "创建失败，请检查参数");
  } finally {
    loading.value = false;
  }
};
</script>
<style lang="scss" scoped>
.first-container {
  margin: 0;
}
.mbt-10 {
  margin: 30px 0 0 0;
}
.input-container {
  padding: 10px 20px;
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  :deep(.el-form-item) {
    margin: 16px;
  }
  :deep(.el-form-item__label) {
    justify-content: center;
    text-align: center;
  }

  &:hover {
    border-color: var(--el-color-primary-light-3);
    box-shadow: 0 8px 25px rgba(64, 128, 255, 0.15);
  }
}
</style>
