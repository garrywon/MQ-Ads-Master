<template>
  <el-drawer
    :model-value="visible"
    @update:model-value="(val) => emit('update:visible', val)"
    title="添加广告计划"
    direction="rtl"
    size="600px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" style="padding: 20px">
      <el-form-item label="账户" prop="accountId">
        <el-select v-model="form.accountId" placeholder="请选择账户" filterable style="width: 100%" disabled>
          <el-option
            v-for="account in accountOptions"
            :key="account.value"
            :label="account.label"
            :value="account.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="计划名称" prop="campaignName">
        <el-input v-model="form.campaignName" placeholder="请输入计划名称" clearable />
      </el-form-item>

      <el-form-item label="营销方式" prop="campaignType">
        <el-select v-model="form.campaignType" placeholder="请选择营销方式" style="width: 100%">
          <el-option label="应用下载" :value="1" />
          <el-option label="H5" :value="2" />
          <el-option label="再营销" :value="3" />
        </el-select>
      </el-form-item>

      <el-form-item label="日预算(美元)">
        <div style="display: flex; align-items: center; gap: 8px">
          <el-select v-model="form.dayBudgetType" style="width: 100px">
            <el-option label="限定" value="limited" />
            <el-option label="不限" value="unlimited" />
          </el-select>
          <el-input-number
            v-if="form.dayBudgetType === 'limited'"
            v-model="form.dayBudget"
            :min="50"
            :precision="2"
            :step="10"
            style="width: 200px"
            placeholder="请输入日预算（≥50）"
          />
          <span v-else style="color: var(--el-text-color-secondary)">不限</span>
        </div>
      </el-form-item>

      <el-form-item label="总预算(美元)">
        <div style="display: flex; align-items: center; gap: 8px">
          <el-select v-model="form.totalBudgetType" style="width: 100px">
            <el-option label="限定" value="limited" />
            <el-option label="不限" value="unlimited" />
          </el-select>
          <el-input-number
            v-if="form.totalBudgetType === 'limited'"
            v-model="form.totalBudget"
            :min="50"
            :precision="2"
            :step="10"
            style="width: 200px"
            placeholder="请输入总预算（≥50）"
          />
          <span v-else style="color: var(--el-text-color-secondary)">不限</span>
        </div>
      </el-form-item>
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
import { ref, reactive, watch } from "vue";
import { ElMessage } from "element-plus";
import MiAdsAPI from "@/api/miads";

const props = defineProps({
  visible: Boolean,
  accountOptions: {
    type: Array,
    default: () => [],
  },
  defaultAccountId: [Number, String],
});

const emit = defineEmits(["update:visible", "submit-success"]);

const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  accountId: null,
  campaignName: "",
  campaignType: 1,
  dayBudget: 0,
  dayBudgetType: "unlimited",
  totalBudget: 0,
  totalBudgetType: "unlimited",
  timeRange: null,
});

const rules = {
  accountId: [{ required: true, message: "请选择账户", trigger: "change" }],
  campaignName: [
    { required: true, message: "请输入计划名称", trigger: "blur" },
    { min: 1, max: 100, message: "计划名称长度在1-100个字符", trigger: "blur" },
  ],
  campaignType: [{ required: true, message: "请选择营销方式", trigger: "change" }],
};

// 监听 visible 显示时初始化
watch(
  () => props.visible,
  (val) => {
    if (val) {
      // 设置默认账户
      if (props.defaultAccountId) {
        form.accountId = String(props.defaultAccountId);
      } else if (props.accountOptions.length > 0) {
        form.accountId = props.accountOptions[0].value;
      }

      // 重置表单
      form.campaignName = "";
      form.campaignType = 1;
      form.dayBudget = 0;
      form.dayBudgetType = "unlimited";
      form.totalBudget = 0;
      form.totalBudgetType = "unlimited";
      form.timeRange = null;
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

    // 计算预算值
    const dayBudgetValue =
      form.dayBudgetType === "unlimited" ? 0 : Math.round(form.dayBudget * 100000);
    const totalBudgetValue =
      form.totalBudgetType === "unlimited" ? 0 : Math.round(form.totalBudget * 100000);

    // 构建提交数据
    const submitData = {
      account_id: Number(form.accountId),
      campaign_name: form.campaignName,
      campaign_type: form.campaignType,
      day_budget: dayBudgetValue,
      total_budget: totalBudgetValue
    };

    await MiAdsAPI.createCampaign(submitData);

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
/* 可以添加自定义样式 */
</style>
