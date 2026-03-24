/**
 * 通知中心逻辑
 */
import { ref, onMounted, onBeforeUnmount } from "vue";
import { ElMessage, ElNotification } from "element-plus";
import NoticeAPI from "@/api/system/notice";
import { useWebSocket } from "@/composables/websocket/useWebSocket";
import router from "@/router";

const PAGE_SIZE = 100; // 获取最多100条未读通知

export function useNotice() {
  const { isConnected, connect, disconnect, subscribe } = useWebSocket();

  // 状态
  const list = ref([]);
  const unreadTotal = ref(0);
  const detail = ref(null);
  const dialogVisible = ref(false);

  let subscribed = false;

  // ============================================
  // 字段转换函数（snake_case -> camelCase）
  // ============================================

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

  // ============================================
  // 数据获取
  // ============================================

  async function fetchList(params = {}) {
    const query = {
      pageNum: 1,
      pageSize: PAGE_SIZE,
      ...params,
    };

    try {
      const response = await NoticeAPI.getMyNoticePage(query);

      // request 拦截器已经提取了 data，所以 response 是 data 内容
      let listData = response;
      if (!Array.isArray(listData)) {
        listData = listData && listData.id ? [listData] : listData?.list || [];
      }

      // 前端过滤：只保留未读消息 (is_read === 0)
      const transformedList = listData.map(transformNoticeItem);
      const unreadList = transformedList.filter((item) => item.isRead === 0);

      list.value = unreadList;
      unreadTotal.value = unreadList.length;
    } catch (error) {
      console.error("获取通知列表失败:", error);
      list.value = [];
      unreadTotal.value = 0;
    }
  }

  async function read(id) {
    try {
      const data = await NoticeAPI.getDetail(id);
      detail.value = transformNoticeItem(data);
      dialogVisible.value = true;

      // 前端乐观更新：从列表移除已读通知（后端没有单独标记已读接口）
      const idx = list.value.findIndex((item) => item.id === id);
      if (idx >= 0) {
        list.value.splice(idx, 1);
        unreadTotal.value = Math.max(0, unreadTotal.value - 1);
      }
    } catch (error) {
      console.error("获取通知详情失败:", error);
      ElMessage.error("获取通知详情失败");
    }
  }

  async function readAll() {
    try {
      await NoticeAPI.readAll();
      list.value = [];
      unreadTotal.value = 0;
      ElMessage.success("已全部标记为已读");
    } catch (error) {
      console.error("标记全部已读失败:", error);
      ElMessage.error("操作失败");
    }
  }

  function goMore() {
    router.push({ name: "MyNotice" });
  }

  function handleViewMore() {
    // 跳转到"我的通知"完整列表页
    router.push({ name: "MyNotice" });
  }

  // ============================================
  // WebSocket 连接
  // ============================================

  function setupWebSocket() {
    // 获取 WebSocket 端点配置
    const wsEndpoint = import.meta.env.VITE_APP_WS_ENDPOINT;

    if (!wsEndpoint) {
      console.warn("[useNotice] 未配置 WebSocket 端点");
      return;
    }

    // 连接 WebSocket
    connect(wsEndpoint);

    // 订阅消息
    subscribe((messageData) => {
      console.log("📩 收到 WebSocket 消息:", messageData);

      // 检查消息类型
      const messageType = messageData.type;

      if (messageType === "connected") {
        // 连接成功消息
        console.log("✅ WebSocket 连接成功:", messageData.data);
        return;
      }

      if (messageType === "new_notice") {
        // 新通知推送
        const data = messageData.data;
        console.log("📢 收到新通知:", data);

        if (!data.id) {
          console.warn("⚠️ 消息中没有 id 字段");
          return;
        }

        // 避免重复
        if (list.value.some((item) => item.id === data.id)) {
          console.log("⚠️ 通知已存在，忽略重复:", data.id);
          return;
        }

        unreadTotal.value += 1;

        list.value.unshift({
          id: data.id,
          title: data.title,
          type: data.type,
          level: data.level,
          publishTime: data.publish_time || data.publishTime,
        });

        console.log("✅ 通知已添加到列表，当前未读数:", unreadTotal.value);

        ElNotification({
          title: "您收到一条新的通知消息！",
          message: data.title,
          type: "success",
          position: "bottom-right",
        });
      }
    });

    subscribed = true;
    console.log("✅ WebSocket 订阅已注册");
  }

  // ============================================
  // 生命周期
  // ============================================

  onMounted(() => {
    fetchList();
    setupWebSocket();
  });

  onBeforeUnmount(() => {
    disconnect();
    subscribed = false;
  });

  return {
    list,
    unreadTotal,
    detail,
    dialogVisible,
    fetchList,
    read,
    readAll,
    goMore,
    handleViewMore,
  };
}
