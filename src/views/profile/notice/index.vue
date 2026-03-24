<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-section">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="通知标题" prop="title">
          <el-input
            v-model="queryParams.title"
            placeholder="关键字"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" @click="handleQuery">
            <template #icon>
              <Search />
            </template>
            搜索
          </el-button>
          <el-button @click="handleResetQuery">
            <template #icon>
              <Refresh />
            </template>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="table-section">
      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="pageData"
        class="table-section__content"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column label="通知标题" prop="title" min-width="200" />
        <el-table-column align="center" label="通知类型" width="150">
          <template #default="scope">
            <el-tag :type="getNoticeTypeTagType(scope.row.type)">
              {{ getNoticeTypeLabel(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="通知等级" width="120">
          <template #default="scope">
            <el-tag :type="getNoticeLevelTagType(scope.row.level)">
              {{ getNoticeLevelLabel(scope.row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          key="releaseTime"
          align="center"
          label="发布时间"
          prop="publishTime"
          width="150"
        />
        <el-table-column align="center" label="发布人" prop="publisherName" width="150" />
        <el-table-column align="center" label="状态" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.isRead == 1" type="success">已读</el-tag>
            <el-tag v-else type="info">未读</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" label="操作" width="80">
          <template #default="scope">
            <el-button type="primary" size="small" link @click="handleReadNotice(scope.row.id)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery"
      />
    </el-card>

    <el-dialog
      v-model="noticeDialogVisible"
      :title="noticeDetail?.title ?? '通知详情'"
      width="800px"
      custom-class="notice-detail"
    >
      <div v-if="noticeDetail" class="notice-detail__wrapper">
        <div class="notice-detail__meta">
          <span>
            <el-icon><User /></el-icon>
            {{ noticeDetail.publisherName }}
          </span>
          <span class="ml-2">
            <el-icon><Timer /></el-icon>
            {{ noticeDetail.publishTime }}
          </span>
        </div>

        <div class="notice-detail__content">
          <div v-html="noticeDetail.content"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
defineOptions({
  name: "MyNotice",
  inheritAttrs: false,
});

import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import NoticeAPI from "@/api/system/notice";

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

function getNoticeLevelLabel(level) {
  const labels = {
    L: "低优先级",
    M: "中优先级",
    H: "高优先级",
  };
  return labels[level] || level;
}

function getNoticeLevelTagType(level) {
  const types = {
    L: "",
    M: "warning",
    H: "danger",
  };
  return types[level] || "";
}

const queryFormRef = ref();
const pageData = ref([]);
const loading = ref(false);
const total = ref(0);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
});

const noticeDialogVisible = ref(false);
const noticeDetail = ref(null);

function transformNoticeItem(item) {
  if (!item) return {};
  return {
    id: item.id,
    title: item.title,
    type: item.type,
    level: item.level,
    levelLabel: item.level_label,
    content: item.content,
    publishStatus: item.publish_status,
    publisherName: item.publisher_name,
    publisherId: item.publisher_id,
    publishTime: item.publish_time,
    isRead: item.is_read,
  };
}

async function handleQuery() {
  loading.value = true;
  try {
    const data = await NoticeAPI.getMyNoticePage(queryParams);
    let listData = data;
    if (!Array.isArray(data)) {
      listData = data?.list || [];
    }
    pageData.value = listData.map(transformNoticeItem);
    total.value = data?.total ?? 0;
  } catch (error) {
    console.error("获取通知失败:", error);
    ElMessage.error("获取通知列表失败");
    pageData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function handleResetQuery() {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

async function handleReadNotice(id) {
  try {
    const data = await NoticeAPI.getDetail(id);
    noticeDetail.value = transformNoticeItem(data);
    noticeDialogVisible.value = true;
  } catch (error) {
    ElMessage.error("获取通知详情失败");
    console.error("获取通知详情失败", error);
  }
}

onMounted(() => {
  handleQuery();
});
</script>

<style lang="scss" scoped>
:deep(.el-table__row) {
  position: relative;
  z-index: 1;
  transition: all 0.2s linear;

  &:hover {
    z-index: 10;
    cursor: pointer;
    background-color: var(--el-color-primary-light-9);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: scale(1.01);
    transform-origin: top center;
  }
}

:deep(.el-dialog__header) {
  text-align: center;
}

.notice-detail {
  &__wrapper {
    padding: 0 20px;
  }

  &__meta {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__publisher {
    margin-right: 24px;

    i {
      margin-right: 4px;
    }
  }

  &__content {
    max-height: 60vh;
    padding-top: 16px;
    margin-bottom: 24px;
    overflow-y: auto;
    border-top: 1px solid var(--el-border-color);

    &::-webkit-scrollbar {
      width: 6px;
    }
  }
}
</style>
