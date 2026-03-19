import request from "@/utils/request";

const DEBUG_BASE_URL = "/api";

// 允许测试的平台列表
export const ALLOWED_PLATFORMS = ["MTG", "BIGO", "OPPO", "MI", "VIVO", "TOPON"];

export const DebugAPI = {
  /**
   * 测试单个平台连接
   * @param {string} platform - 平台名称（MTG, BIGO, OPPO, MI, VIVO, TOPON）
   * @param {string} target_date - 测试日期，格式 YYYY-MM-DD
   * @returns {Promise} 测试结果
   */
  testConnection(platform, target_date) {
    return request({
      url: `${DEBUG_BASE_URL}/debug/test/${platform}`,
      method: "post",
      data: { target_date },
      customHandleResponse: true,
    });
  },

  /**
   * 执行全量同步
   * @param {Object} payload - 同步参数
   * @param {string} payload.business_type - 业务类型，如 "ALL"
   * @param {Array<string>} payload.platforms - 平台列表
   * @param {string} payload.target_date - 目标日期，格式 YYYY-MM-DD
   * @returns {Promise} 同步结果
   */
  runFullSync(payload) {
    return request({
      url: `${DEBUG_BASE_URL}/system/tasks/run`,
      method: "post",
      data: payload,
      headers: {
        "x-api-key": "sdaef465ger2h53g54rf22hgf",
      },
      customHandleResponse: true,
    });
  },

  /**
   * 查询同步日志
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.size - 每页大小
   * @param {string} [params.status] - 状态过滤
   * @returns {Promise} 日志列表
   */
  getSyncLogs(params) {
    return request({
      url: `${DEBUG_BASE_URL}/system/sync-logs`,
      method: "get",
      params,
      customHandleResponse: true,
    });
  },
};

export default DebugAPI;
