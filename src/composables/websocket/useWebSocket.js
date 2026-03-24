/**
 * 原生 WebSocket 连接管理组合式函数
 * 适用于后端使用标准 WebSocket（无子协议）的情况
 */
import { ref, onBeforeUnmount } from "vue";
import { AuthStorage } from "@/utils/auth";

// 心跳间隔（毫秒）
const HEARTBEAT_INTERVAL = 30000; // 30秒

// 重连延迟（毫秒）
const RECONNECT_DELAY = 5000; // 5秒

export function useWebSocket() {
  const isConnected = ref(false);
  let ws = null;
  let messageHandler = null;
  let reconnectTimer = null;
  let manualDisconnect = false;
  let pingInterval = null;
  let currentUrl = null;

  /**
   * 启动心跳
   */
  function startHeartbeat() {
    if (pingInterval) {
      clearInterval(pingInterval);
    }

    pingInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send("ping");
        console.log("📤 发送心跳: ping");
      }
    }, HEARTBEAT_INTERVAL);
  }

  /**
   * 停止心跳
   */
  function stopHeartbeat() {
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
  }

  /**
   * 连接 WebSocket
   * @param {string} brokerURL - WebSocket 端点 URL
   */
  function connect(brokerURL) {
    if (ws) {
      console.warn("[useWebSocket] WebSocket 已连接，跳过");
      return;
    }

    manualDisconnect = false;
    currentUrl = brokerURL;

    const token = AuthStorage.getAccessToken();
    if (!token) {
      console.warn("[useWebSocket] token 为空，跳过初始化");
      return;
    }

    let wsUrl = brokerURL;
    if (wsUrl.includes("<jwt_access_token>")) {
      wsUrl = wsUrl.replace("<jwt_access_token>", token);
      console.log("✅ WebSocket URL 中的 token 占位符已替换");
      console.log("🔌 正在连接 WebSocket:", wsUrl.split("?")[0]);
    }

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        isConnected.value = true;
        console.log("✅ WebSocket 已连接");
        startHeartbeat();
      };

      ws.onmessage = (event) => {
        console.log("📩 收到 WebSocket 消息:", event.data);

        // 处理心跳响应
        if (event.data === "pong") {
          console.log("💓 收到心跳响应: pong");
          return;
        }

        // 处理 JSON 消息
        try {
          const data = JSON.parse(event.data);
          if (messageHandler) {
            messageHandler(data);
          }
        } catch (e) {
          console.error("❌ 解析 WebSocket 消息失败:", e);
        }
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket 错误:", error);
      };

      ws.onclose = () => {
        isConnected.value = false;
        stopHeartbeat();
        console.log("🔌 WebSocket 已关闭");

        // 静默自动重连（如果不是手动断开）
        if (!manualDisconnect && currentUrl) {
          console.log(`🔄 ${RECONNECT_DELAY / 1000}秒后准备重连 WebSocket...`);
          reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            console.log("🔄 正在重连 WebSocket...");
            connect(currentUrl);
          }, RECONNECT_DELAY);
        }
      };
    } catch (e) {
      console.error("❌ 创建 WebSocket 失败:", e);
      isConnected.value = false;
    }
  }

  /**
   * 断开 WebSocket 连接
   */
  function disconnect() {
    manualDisconnect = true;
    stopHeartbeat();

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    if (ws) {
      ws.close();
      ws = null;
    }

    isConnected.value = false;
    console.log("🔌 WebSocket 连接已断开");
  }

  /**
   * 发送消息
   * @param {string|Object} data - 消息内容
   */
  function send(data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = typeof data === "object" ? JSON.stringify(data) : data;
      ws.send(message);
      console.log("📤 发送 WebSocket 消息:", message);
    } else {
      console.warn("⚠️ WebSocket 未连接，无法发送消息");
    }
  }

  /**
   * 订阅消息
   * @param {Function} handler - 消息处理函数
   */
  function subscribe(handler) {
    messageHandler = handler;
  }

  /**
   * 取消订阅
   */
  function unsubscribe() {
    messageHandler = null;
  }

  // 组件卸载时自动断开连接
  onBeforeUnmount(() => {
    disconnect();
  });

  return {
    isConnected,
    connect,
    disconnect,
    send,
    subscribe,
    unsubscribe,
  };
}
