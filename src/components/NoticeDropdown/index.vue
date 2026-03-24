<template>
  <el-dropdown class="notice__dropdown" trigger="click">
    <div class="notice__trigger">
      <el-badge v-if="unreadTotal > 0" :value="unreadTotal" :max="99">
        <div class="i-svg:bell" />
      </el-badge>

      <div v-else class="i-svg:bell" />
    </div>

    <template #dropdown>
      <div class="notice-dropdown">
        <!-- 滚动列表区域 -->
        <div class="notice-list">
          <template v-if="list.length > 0">
            <div v-for="item in list" :key="item.id" class="notice-item" @click="read(item.id)">
              <div class="notice-item__header">
                <el-tag :type="getNoticeTypeTagType(item.type)" size="small">
                  {{ getNoticeTypeLabel(item.type) }}
                </el-tag>
                <span class="notice-item__time">
                  {{ item.publishTime }}
                </span>
              </div>
              <div class="notice-item__title">
                {{ item.title }}
              </div>
            </div>
          </template>
          <template v-else>
            <div class="notice-empty">
              <el-empty :image-size="50" description="暂无消息" />
            </div>
          </template>
        </div>

        <!-- 固定底部操作栏 -->
        <div class="notice-footer">
          <el-link type="primary" :underline="false" @click="handleViewMore">
            <el-icon><View /></el-icon>
            查看更多
          </el-link>
          <el-link v-if="list.length > 0" type="primary" :underline="false" @click="readAll">
            <el-icon><Check /></el-icon>
            全部已读
          </el-link>
        </div>
      </div>
    </template>
  </el-dropdown>

  <el-dialog
    v-model="dialogVisible"
    :title="detail?.title ?? '通知详情'"
    width="800px"
    custom-class="notification-detail"
  >
    <div v-if="detail" class="p-x-20px">
      <div class="flex-y-center mb-16px text-13px text-color-secondary">
        <span class="flex-y-center">
          <el-icon><User /></el-icon>
          {{ detail.publisherName }}
        </span>
        <span class="ml-2 flex-y-center">
          <el-icon><Timer /></el-icon>
          {{ detail.publishTime }}
        </span>
      </div>

      <div class="max-h-60vh pt-16px mb-24px overflow-y-auto border-t border-solid border-color">
        <div v-html="detail.content"></div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { View, Check } from "@element-plus/icons-vue";
import { useNotice } from "./useNotice";

const { list, unreadTotal, detail, dialogVisible, read, readAll, handleViewMore } = useNotice();

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
</script>

<style lang="scss" scoped>
// 下拉容器
.notice-dropdown {
  display: flex;
  flex-direction: column;
  width: 330px;
}

// 滚动列表区域
.notice-list {
  max-height: 350px;
  overflow-y: auto;

  // 美化滚动条
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
}

// 通知项
.notice-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--el-fill-color-light);
  }

  &:last-child {
    border-bottom: none;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  &__time {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__title {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    color: var(--el-text-color-primary);
    white-space: nowrap;
  }
}

// 空状态
.notice-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

// 底部操作栏
.notice-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: var(--el-fill-color-lighter);
  border-top: 1px solid var(--el-border-color-lighter);

  .el-link {
    font-size: 13px;
  }
}

// 原有样式保持兼容
.notice {
  &__dropdown {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  &__trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
}
</style>
