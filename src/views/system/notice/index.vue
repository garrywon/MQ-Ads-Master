<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-section">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-suffix=":">
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="queryParams.title"
            placeholder="标题"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>
        <el-form-item label="发布状态" prop="publishStatus">
          <el-select
            v-model="queryParams.publishStatus"
            clearable
            placeholder="全部"
            style="width: 100px"
          >
            <el-option :value="0" label="未发布" />
            <el-option :value="1" label="已发布" />
            <el-option :value="-1" label="已撤回" />
          </el-select>
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery()">搜索</el-button>
          <el-button icon="refresh" @click="handleResetQuery()">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="table-section">
      <div class="table-section__toolbar">
        <div class="table-section__toolbar--actions">
          <el-button
            v-hasPerm="['sys:notice:create']"
            type="success"
            icon="plus"
            @click="handleOpenDialog()"
          >
            新增通知
          </el-button>
          <el-button
            v-hasPerm="['sys:notice:delete']"
            type="danger"
            :disabled="selectIds.length === 0"
            icon="delete"
            @click="handleDelete()"
          >
            删除
          </el-button>
        </div>
      </div>

      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        class="table-section__content"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column label="通知标题" prop="title" min-width="200" />
        <el-table-column align="center" label="通知类型" width="150">
          <template #default="scope">
            <el-tag :type="getNoticeTypeTagType(scope.row.type)">
              {{ getNoticeTypeLabel(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="发布人" prop="publisherName" width="150" />
        <el-table-column align="center" label="通知等级" width="100">
          <template #default="scope">
            <el-tag :type="getNoticeLevelTagType(scope.row.level)">
              {{ getNoticeLevelLabel(scope.row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="通告目标类型" prop="targetType" min-width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.targetType == 1" type="warning">全体</el-tag>
            <el-tag v-if="scope.row.targetType == 2" type="success">指定</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="发布状态" min-width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.publishStatus == 0" type="info">未发布</el-tag>
            <el-tag v-if="scope.row.publishStatus == 1" type="success">已发布</el-tag>
            <el-tag v-if="scope.row.publishStatus == -1" type="warning">已撤回</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作时间" width="250">
          <template #default="scope">
            <div class="flex-x-start">
              <span>创建时间：</span>
              <span>{{ scope.row.createTime || "-" }}</span>
            </div>

            <div v-if="scope.row.publishStatus === 1" class="flex-x-start">
              <span>发布时间：</span>
              <span>{{ scope.row.publishTime || "-" }}</span>
            </div>
            <div v-else-if="scope.row.publishStatus === -1" class="flex-x-start">
              <span>撤回时间：</span>
              <span>{{ scope.row.revokeTime || "-" }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" label="操作" width="150">
          <template #default="scope">
            <el-button type="primary" size="small" link @click="openDetailDialog(scope.row.id)">
              查看
            </el-button>
            <el-button
              v-if="scope.row.publishStatus != 1"
              v-hasPerm="['sys:notice:publish']"
              type="primary"
              size="small"
              link
              @click="handlePublish(scope.row.id)"
            >
              发布
            </el-button>
            <el-button
              v-if="scope.row.publishStatus == 1"
              v-hasPerm="['sys:notice:revoke']"
              type="primary"
              size="small"
              link
              @click="handleRevoke(scope.row.id)"
            >
              撤回
            </el-button>
            <el-button
              v-if="scope.row.publishStatus != 1"
              v-hasPerm="['sys:notice:update']"
              type="primary"
              size="small"
              link
              @click="handleOpenDialog(scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-if="scope.row.publishStatus != 1"
              v-hasPerm="['sys:notice:delete']"
              type="danger"
              size="small"
              link
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="fetchData()"
      />
    </el-card>

    <!-- 通知公告表单弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :show-close="false"
      :fullscreen="dialog.fullscreen"
      top="6vh"
      width="70%"
      custom-class="notice-dialog"
      @close="handleCloseDialog"
    >
      <template #header>
        <div class="flex-x-between">
          <span>{{ dialog.title }}</span>
          <div class="dialog-toolbar">
            <el-button circle @click="toggleDialogFullscreen">
              <template #icon>
                <FullScreen v-if="!dialog.fullscreen" />
                <CopyDocument v-else />
              </template>
            </el-button>
            <el-button circle @click="handleCloseDialog">
              <template #icon>
                <Close />
              </template>
            </el-button>
          </div>
        </div>
      </template>
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="通知标题" prop="title">
          <el-input v-model="formData.title" placeholder="通知标题" clearable />
        </el-form-item>

        <el-form-item label="通知类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择通知类型">
            <el-option label="版本更新" :value="1" />
            <el-option label="系统维护" :value="2" />
            <el-option label="安全提醒" :value="3" />
            <el-option label="放假通知" :value="4" />
            <el-option label="活动通知" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="通知等级" prop="level">
          <el-radio-group v-model="formData.level">
            <el-radio value="L">低优先级</el-radio>
            <el-radio value="M">中优先级</el-radio>
            <el-radio value="H">高优先级</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="目标类型" prop="targetType">
          <el-radio-group v-model="formData.targetType">
            <el-radio :value="1">全体</el-radio>
            <el-radio :value="2">指定</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="formData.targetType == 2" label="指定用户" prop="targetUsers">
          <el-select v-model="formData.targetUsers" multiple search placeholder="请选择指定用户">
            <el-option
              v-for="item in userOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="通知内容" prop="content">
          <WangEditor v-model="formData.content" height="350px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit()">确定</el-button>
          <el-button @click="handleCloseDialog()">取消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 通知公告详情 -->
    <el-dialog
      v-model="detailDialog.visible"
      :show-close="false"
      width="50%"
      append-to-body
      @close="closeDetailDialog"
    >
      <template #header>
        <div class="flex-x-between">
          <span>通知公告详情</span>
          <div class="dialog-toolbar">
            <el-button circle @click="closeDetailDialog">
              <template #icon>
                <Close />
              </template>
            </el-button>
          </div>
        </div>
      </template>
      <el-descriptions :column="1">
        <el-descriptions-item label="标题：">
          {{ currentNotice.title }}
        </el-descriptions-item>
        <el-descriptions-item label="发布状态：">
          <el-tag v-if="currentNotice.publishStatus == 0" type="info">未发布</el-tag>
          <el-tag v-else-if="currentNotice.publishStatus == 1" type="success">已发布</el-tag>
          <el-tag v-else-if="currentNotice.publishStatus == -1" type="warning">已撤回</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发布人：">
          {{ currentNotice.publisherName }}
        </el-descriptions-item>
        <el-descriptions-item label="发布时间：">
          {{ currentNotice.publishTime }}
        </el-descriptions-item>
        <el-descriptions-item label="公告内容：">
          <div class="notice-content" v-html="currentNotice.content" />
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
defineOptions({
  name: "Notice",
  inheritAttrs: false,
});

import NoticeAPI from "@/api/system/notice";
import UserAPI from "@/api/system/user";
import { FullScreen, CopyDocument, Close } from "@element-plus/icons-vue";

const queryFormRef = ref();
const dataFormRef = ref();

const loading = ref(false);
const selectIds = ref([]);
const total = ref(0);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
});

const userOptions = ref([]);
// 通知公告表格数据
const pageData = ref([]);

// 弹窗
const dialog = reactive({
  title: "",
  visible: false,
  fullscreen: false,
});

// 通知公告表单数据
const formData = reactive({
  level: "L", // 默认优先级为低
  targetType: 1, // 默认目标类型为全体
});

// 通知公告表单校验规则
const rules = reactive({
  title: [{ required: true, message: "请输入通知标题", trigger: "blur" }],
  type: [{ required: true, message: "请选择通知类型", trigger: "change" }],
  targetType: [{ required: true, message: "请选择目标类型", trigger: "change" }],
  content: [
    {
      required: true,
      message: "请输入通知内容",
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (!value.replace(/<[^>]+>/g, "").trim()) {
          callback(new Error("请输入通知内容"));
        } else {
          callback();
        }
      },
    },
  ],
  targetUsers: [
    {
      validator: (rule, value, callback) => {
        if (formData.targetType === 2 && (!value || value.length === 0)) {
          callback(new Error("请选择指定用户"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
});

const detailDialog = reactive({
  visible: false,
});
const currentNotice = ref({});

// 查询通知公告
function handleQuery() {
  queryParams.pageNum = 1;
  fetchData();
}

//发送请求接口
function fetchData() {
  loading.value = true;
  NoticeAPI.getPage(queryParams)
    .then((response) => {
      // request.js 响应拦截器已经提取了 data 字段
      // 所以 response 就是后端返回的 data 内容

      // 详细调试日志
      console.log("🔍 响应数据类型:", typeof response, Array.isArray(response) ? "数组" : "对象");
      console.log("🔍 响应内容:", JSON.stringify(response, null, 2));
      if (response && typeof response === "object") {
        console.log("🔍 响应字段:", Object.keys(response));
      }

      // 防御性检查：确保response存在
      if (!response) {
        console.warn("⚠️ API响应为空");
        pageData.value = [];
        total.value = 0;
        return;
      }

      let list = [];

      // 兼容多种响应结构
      // request 拦截器已经提取了 data，所以 response 是 data 内容
      if (Array.isArray(response)) {
        // 情况1: response 是数组 [...] - 正常使用
        list = response;
        console.log("✅ 响应是数组，包含", list.length, "条数据");
      } else if (response && typeof response === "object") {
        if (response.id) {
          // 情况2: response 是单个对象 { id, title, ... } - 包装成数组
          list = [response];
          console.log("✅ 响应是单个对象，包装成数组");
        } else if (Array.isArray(response.list)) {
          // 情况3: response 是 { list: [...] } - 提取 list
          list = response.list;
          console.log("✅ 响应包含 list 字段");
        } else {
          console.warn("⚠️ 响应是未知对象结构:", Object.keys(response));
          list = [];
        }
      }

      // 尝试从响应中获取分页信息
      let totalCount = 0;
      if (response && typeof response === "object") {
        totalCount = response.total ?? response.page?.total ?? list.length;
      }

      console.log("📊 共", list.length, "条数据, 总数:", totalCount);

      // 确保list是数组再调用map
      pageData.value = Array.isArray(list) ? list.map(transformNoticeItem) : [];
      total.value = totalCount;
    })
    .catch((error) => {
      console.error("❌ 获取通知列表失败:", error);
      ElMessage.error("获取数据失败");
      pageData.value = [];
      total.value = 0;
    })
    .finally(() => {
      loading.value = false;
    });
}

// 重置查询
function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

// 行复选框选中项变化
function handleSelectionChange(selection) {
  selectIds.value = selection.map((item) => item.id);
}

/**
 * 打开通知公告弹窗
 */
function handleOpenDialog(id) {
  dialog.fullscreen = false;
  UserAPI.getOptions().then((data) => {
    userOptions.value = data;
  });

  dialog.visible = true;
  if (id) {
    dialog.title = "修改公告";
    NoticeAPI.getFormData(id).then((data) => {
      const transformed = transformNoticeItem(data);
      Object.assign(formData, {
        ...transformed,
        targetUsers: normalizeTargetUsers(transformed.targetUserIds),
        id: transformed.id,
      });
    });
  } else {
    Object.assign(formData, { level: "L", targetType: 1, targetUsers: [] });
    dialog.title = "新增公告";
  }
}

// 打开通知详情弹窗
function openDetailDialog(id) {
  NoticeAPI.getDetail(id).then((data) => {
    currentNotice.value = transformNoticeItem(data);
    detailDialog.visible = true;
  });
}

// 关闭通知详情弹窗
function closeDetailDialog() {
  detailDialog.visible = false;
}

// 发布通知公告
function handlePublish(id) {
  NoticeAPI.publish(id).then(() => {
    ElMessage.success("发布成功");
    handleQuery();
  });
}

// 撤回通知公告
function handleRevoke(id) {
  NoticeAPI.revoke(id).then(() => {
    ElMessage.success("撤回成功");
    handleQuery();
  });
}

// 通知公告表单提交
function handleSubmit() {
  dataFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true;
      // 转换字段名为 snake_case 以符合后端接口规范
      const payload = {
        title: formData.title,
        type: Number(formData.type), // 转为整数
        level: formData.level,
        target_type: formData.targetType,
        target_user_ids: formData.targetType === 2 ? (formData.targetUsers ?? []) : [],
        content: formData.content,
      };
      const id = formData.id;
      if (id) {
        NoticeAPI.update(id, payload)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        NoticeAPI.create(payload)
          .then(() => {
            ElMessage.success("新增成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

// 重置表单
function resetForm() {
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
  formData.id = undefined;
  formData.targetType = 1;
  formData.targetUsers = [];
}

function normalizeTargetUsers(value) {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : value.split(",").filter(Boolean);
    } catch {
      return value.split(",").filter(Boolean);
    }
  }
  return [];
}

// 转换通知字段（snake_case -> camelCase）
function transformNoticeItem(item) {
  if (!item) return {};
  return {
    id: item.id,
    title: item.title,
    type: item.type,
    level: item.level,
    levelLabel: item.level_label,
    targetType: item.target_type,
    targetUserIds: item.target_user_ids,
    content: item.content,
    publishStatus: item.publish_status,
    publisherName: item.publisher_name,
    publisherId: item.publisher_id,
    publishTime: item.publish_time,
    createTime: item.create_time,
    revokeTime: item.revoke_time,
    isRead: item.is_read,
  };
}

// 获取通知类型标签
function getNoticeTypeLabel(type) {
  const labels = {
    1: "版本更新",
    2: "系统维护",
    3: "安全提醒",
    4: "放假通知",
    5: "活动通知",
  };
  return labels[type] || String(type);
}

// 获取通知类型的标签样式
function getNoticeTypeTagType(type) {
  const types = {
    1: "",
    2: "warning",
    3: "danger",
    4: "success",
    5: "info",
  };
  return types[type] || "";
}

// 获取通知等级标签
function getNoticeLevelLabel(level) {
  const labels = {
    L: "低优先级",
    M: "中优先级",
    H: "高优先级",
  };
  return labels[level] || level;
}

// 获取通知等级的标签样式
function getNoticeLevelTagType(level) {
  const types = {
    L: "",
    M: "warning",
    H: "danger",
  };
  return types[level] || "";
}

// 关闭通知公告弹窗
function handleCloseDialog() {
  dialog.visible = false;
  dialog.fullscreen = false;
  resetForm();
}

// 弹窗全屏切换
function toggleDialogFullscreen() {
  dialog.fullscreen = !dialog.fullscreen;
}

// 删除通知公告
function handleDelete(id) {
  const deleteIds = [id || selectIds.value].join(",");
  if (!deleteIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      NoticeAPI.deleteByIds(deleteIds)
        .then(() => {
          ElMessage.success("删除成功");
          handleResetQuery();
        })
        .finally(() => (loading.value = false));
    },
    () => {
      ElMessage.info("已取消删除");
    }
  );
}

onMounted(() => {
  handleQuery();
});
</script>
